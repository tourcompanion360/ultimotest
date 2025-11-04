-- Fix RLS Policies for End-Client Authentication
-- Update all end-client RLS policies to use end_client_users table instead of JWT claims

-- end_clients table:
DROP POLICY IF EXISTS "End clients can view their own data" ON public.end_clients;

CREATE POLICY "End clients can view their own data" ON public.end_clients
  FOR SELECT USING (
    id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- projects table:
DROP POLICY IF EXISTS "End clients can view their own projects" ON public.projects;

CREATE POLICY "End clients can view their own projects" ON public.projects
  FOR SELECT USING (
    end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- chatbots table:
DROP POLICY IF EXISTS "End clients can view their chatbots" ON public.chatbots;

CREATE POLICY "End clients can view their chatbots" ON public.chatbots
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.end_client_id IN (
        SELECT end_client_id FROM public.end_client_users 
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- leads table:
DROP POLICY IF EXISTS "End clients can view their leads" ON public.leads;

CREATE POLICY "End clients can view their leads" ON public.leads
  FOR SELECT USING (
    chatbot_id IN (
      SELECT cb.id FROM public.chatbots cb
      JOIN public.projects p ON cb.project_id = p.id
      WHERE p.end_client_id IN (
        SELECT end_client_id FROM public.end_client_users 
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- analytics table:
DROP POLICY IF EXISTS "End clients can view their analytics" ON public.analytics;

CREATE POLICY "End clients can view their analytics" ON public.analytics
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.end_client_id IN (
        SELECT end_client_id FROM public.end_client_users 
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- requests table:
DROP POLICY IF EXISTS "End clients can manage their own requests" ON public.requests;

CREATE POLICY "End clients can manage their own requests" ON public.requests
  FOR ALL USING (
    end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- assets table:
CREATE POLICY "End clients can view assets for their projects" ON public.assets
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.end_client_id IN (
        SELECT end_client_id FROM public.end_client_users 
        WHERE auth_user_id = auth.uid()
      )
    )
  );



