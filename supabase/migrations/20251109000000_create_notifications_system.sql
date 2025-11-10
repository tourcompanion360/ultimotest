-- Create notifications table for multi-tenant notification system
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('media_upload', 'media_shared', 'request_created', 'request_updated', 'request_completed', 'project_update', 'system', 'message')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    related_entity_type TEXT CHECK (related_entity_type IN ('project', 'request', 'asset', 'client', 'media')),
    related_entity_id UUID,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    CONSTRAINT valid_notification CHECK (char_length(title) >= 3 AND char_length(message) >= 10)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_entity ON public.notifications(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender ON public.notifications(sender_id);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
    ON public.notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- System can insert notifications for any user (for triggers)
CREATE POLICY "System can insert notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (true);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}'::jsonb,
    p_priority TEXT DEFAULT 'medium',
    p_related_entity_type TEXT DEFAULT NULL,
    p_related_entity_id UUID DEFAULT NULL,
    p_sender_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data,
        priority,
        related_entity_type,
        related_entity_id,
        sender_id
    )
    VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_data,
        p_priority,
        p_related_entity_type,
        p_related_entity_id,
        p_sender_id
    )
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET read = TRUE, read_at = NOW()
    WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- Function to get creator user_id from project
CREATE OR REPLACE FUNCTION public.get_creator_from_project(p_project_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_creator_user_id UUID;
BEGIN
    SELECT c.user_id INTO v_creator_user_id
    FROM public.projects p
    INNER JOIN public.end_clients ec ON p.end_client_id = ec.id
    INNER JOIN public.creators c ON ec.creator_id = c.id
    WHERE p.id = p_project_id;
    
    RETURN v_creator_user_id;
END;
$$;

-- Function to get client user_id from project
CREATE OR REPLACE FUNCTION public.get_client_from_project(p_project_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_user_id UUID;
BEGIN
    SELECT ec.user_id INTO v_client_user_id
    FROM public.projects p
    INNER JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE p.id = p_project_id;
    
    RETURN v_client_user_id;
END;
$$;

-- Trigger function for new media uploads (notify client)
CREATE OR REPLACE FUNCTION public.notify_media_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_user_id UUID;
    v_project_title TEXT;
    v_creator_name TEXT;
BEGIN
    -- Get client user_id and project details
    SELECT 
        ec.user_id,
        p.title,
        cr.agency_name
    INTO 
        v_client_user_id,
        v_project_title,
        v_creator_name
    FROM public.assets a
    INNER JOIN public.projects p ON a.project_id = p.id
    INNER JOIN public.end_clients ec ON p.end_client_id = ec.id
    INNER JOIN public.creators cr ON ec.creator_id = cr.id
    WHERE a.id = NEW.id;
    
    -- Only notify if client has a user account
    IF v_client_user_id IS NOT NULL THEN
        PERFORM public.create_notification(
            v_client_user_id,
            'media_upload',
            'New Media Added',
            v_creator_name || ' added new ' || NEW.type || ' to ' || v_project_title,
            jsonb_build_object(
                'asset_id', NEW.id,
                'asset_title', NEW.title,
                'asset_type', NEW.type,
                'project_id', NEW.project_id,
                'project_title', v_project_title
            ),
            'medium',
            'media',
            NEW.id,
            NULL
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for media uploads
DROP TRIGGER IF EXISTS trigger_notify_media_upload ON public.assets;
CREATE TRIGGER trigger_notify_media_upload
    AFTER INSERT ON public.assets
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_media_upload();

-- Trigger function for new requests (notify creator)
CREATE OR REPLACE FUNCTION public.notify_request_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_creator_user_id UUID;
    v_project_title TEXT;
    v_client_name TEXT;
BEGIN
    -- Get creator user_id and project details
    SELECT 
        c.user_id,
        p.title,
        ec.name
    INTO 
        v_creator_user_id,
        v_project_title,
        v_client_name
    FROM public.requests r
    INNER JOIN public.projects p ON r.project_id = p.id
    INNER JOIN public.end_clients ec ON p.end_client_id = ec.id
    INNER JOIN public.creators c ON ec.creator_id = c.id
    WHERE r.id = NEW.id;
    
    -- Notify creator
    IF v_creator_user_id IS NOT NULL THEN
        PERFORM public.create_notification(
            v_creator_user_id,
            'request_created',
            'New Request from ' || v_client_name,
            NEW.title || ' - ' || SUBSTRING(NEW.description, 1, 100),
            jsonb_build_object(
                'request_id', NEW.id,
                'request_title', NEW.title,
                'request_type', NEW.request_type,
                'project_id', NEW.project_id,
                'project_title', v_project_title,
                'client_name', v_client_name
            ),
            NEW.priority,
            'request',
            NEW.id,
            NULL
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for new requests
DROP TRIGGER IF EXISTS trigger_notify_request_created ON public.requests;
CREATE TRIGGER trigger_notify_request_created
    AFTER INSERT ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_request_created();

-- Trigger function for request status updates (notify client)
CREATE OR REPLACE FUNCTION public.notify_request_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_user_id UUID;
    v_project_title TEXT;
    v_status_message TEXT;
BEGIN
    -- Only notify on status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Get client user_id and project details
        SELECT 
            ec.user_id,
            p.title
        INTO 
            v_client_user_id,
            v_project_title
        FROM public.requests r
        INNER JOIN public.projects p ON r.project_id = p.id
        INNER JOIN public.end_clients ec ON p.end_client_id = ec.id
        WHERE r.id = NEW.id;
        
        -- Create status message
        v_status_message := CASE NEW.status
            WHEN 'completed' THEN 'Your request has been completed'
            WHEN 'in_progress' THEN 'Your request is now in progress'
            WHEN 'pending' THEN 'Your request is pending review'
            ELSE 'Your request status has been updated to ' || NEW.status
        END;
        
        -- Notify client
        IF v_client_user_id IS NOT NULL THEN
            PERFORM public.create_notification(
                v_client_user_id,
                CASE WHEN NEW.status = 'completed' THEN 'request_completed' ELSE 'request_updated' END,
                'Request Status Updated',
                v_status_message || ': ' || NEW.title,
                jsonb_build_object(
                    'request_id', NEW.id,
                    'request_title', NEW.title,
                    'old_status', OLD.status,
                    'new_status', NEW.status,
                    'project_id', NEW.project_id,
                    'project_title', v_project_title
                ),
                CASE WHEN NEW.status = 'completed' THEN 'high' ELSE 'medium' END,
                'request',
                NEW.id,
                NULL
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for request updates
DROP TRIGGER IF EXISTS trigger_notify_request_updated ON public.requests;
CREATE TRIGGER trigger_notify_request_updated
    AFTER UPDATE ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_request_updated();

-- Trigger function for project updates (notify client)
CREATE OR REPLACE FUNCTION public.notify_project_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_user_id UUID;
    v_creator_name TEXT;
BEGIN
    -- Only notify on significant changes
    IF OLD.status IS DISTINCT FROM NEW.status OR 
       OLD.title IS DISTINCT FROM NEW.title OR
       OLD.description IS DISTINCT FROM NEW.description THEN
        
        -- Get client user_id
        SELECT 
            ec.user_id,
            cr.agency_name
        INTO 
            v_client_user_id,
            v_creator_name
        FROM public.projects p
        INNER JOIN public.end_clients ec ON p.end_client_id = ec.id
        INNER JOIN public.creators cr ON ec.creator_id = cr.id
        WHERE p.id = NEW.id;
        
        -- Notify client
        IF v_client_user_id IS NOT NULL THEN
            PERFORM public.create_notification(
                v_client_user_id,
                'project_update',
                'Project Updated: ' || NEW.title,
                v_creator_name || ' updated your project',
                jsonb_build_object(
                    'project_id', NEW.id,
                    'project_title', NEW.title,
                    'old_status', OLD.status,
                    'new_status', NEW.status
                ),
                'medium',
                'project',
                NEW.id,
                NULL
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for project updates
DROP TRIGGER IF EXISTS trigger_notify_project_updated ON public.projects;
CREATE TRIGGER trigger_notify_project_updated
    AFTER UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_project_updated();

-- Function to clean up old read notifications (optional, can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications
    WHERE read = TRUE 
    AND read_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_creator_from_project TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_from_project TO authenticated;
