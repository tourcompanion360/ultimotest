-- Optimize existing schema and fix issues

-- 1. Fix creators table RLS policy to allow INSERT operations
DROP POLICY IF EXISTS "Creators can manage their own data" ON public.creators;
CREATE POLICY "Creators can manage their own data" ON public.creators
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_creators_subscription_plan ON public.creators(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_creators_subscription_status ON public.creators(subscription_status);
CREATE INDEX IF NOT EXISTS idx_end_clients_status ON public.end_clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON public.projects(project_type);
CREATE INDEX IF NOT EXISTS idx_chatbots_language ON public.chatbots(language);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_type_date ON public.analytics(metric_type, date);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON public.requests(priority);
CREATE INDEX IF NOT EXISTS idx_assets_file_type ON public.assets(file_type);

-- 3. Add constraints to prevent data inconsistencies
ALTER TABLE public.leads 
ADD CONSTRAINT check_lead_score_range 
CHECK (lead_score >= 0 AND lead_score <= 100);

ALTER TABLE public.chatbots 
ADD CONSTRAINT check_max_questions_range 
CHECK (max_questions >= 1 AND max_questions <= 100);

ALTER TABLE public.chatbots 
ADD CONSTRAINT check_conversation_limit_range 
CHECK (conversation_limit >= 1 AND conversation_limit <= 1000);

-- 4. Add useful views for common queries
CREATE OR REPLACE VIEW public.creator_dashboard_stats AS
SELECT 
  c.id as creator_id,
  c.agency_name,
  COUNT(DISTINCT ec.id) as total_clients,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT cb.id) as total_chatbots,
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
  COALESCE(SUM(a.metric_value), 0) as total_views
FROM public.creators c
LEFT JOIN public.end_clients ec ON c.id = ec.creator_id
LEFT JOIN public.projects p ON ec.id = p.end_client_id
LEFT JOIN public.chatbots cb ON p.id = cb.project_id
LEFT JOIN public.leads l ON cb.id = l.chatbot_id
LEFT JOIN public.analytics a ON p.id = a.project_id AND a.metric_type = 'view'
GROUP BY c.id, c.agency_name;

-- 5. Create function to clean up old analytics data
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.analytics 
  WHERE date < CURRENT_DATE - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to get project analytics summary
CREATE OR REPLACE FUNCTION public.get_project_analytics_summary(project_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_views', COALESCE(SUM(CASE WHEN metric_type = 'view' THEN metric_value ELSE 0 END), 0),
    'unique_visitors', COALESCE(SUM(CASE WHEN metric_type = 'unique_visitor' THEN metric_value ELSE 0 END), 0),
    'total_interactions', COALESCE(SUM(CASE WHEN metric_type = 'hotspot_click' THEN metric_value ELSE 0 END), 0),
    'avg_time_spent', COALESCE(AVG(CASE WHEN metric_type = 'time_spent' THEN metric_value ELSE NULL END), 0),
    'total_leads', COALESCE(SUM(CASE WHEN metric_type = 'lead_generated' THEN metric_value ELSE 0 END), 0),
    'last_activity', MAX(date)
  ) INTO result
  FROM public.analytics
  WHERE project_id = project_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on new functions
GRANT EXECUTE ON FUNCTION public.cleanup_old_analytics(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_analytics_summary(UUID) TO anon, authenticated;
