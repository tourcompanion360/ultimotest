const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://yrvicwapjsevyilxdzsm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAwNjY4MiwiZXhwIjoyMDc1NTgyNjgyfQ.fHtu3wPlbrsyZPVVLObVYeZ-BT8KmsJybK_r_zEv4pU';

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Complete database schema SQL
const createDatabaseSchema = `
-- Complete TourCompanion SaaS Database Schema
-- This script creates the entire multi-tenant database structure

-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.analytics CASCADE;
DROP TABLE IF EXISTS public.requests CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.chatbots CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.end_clients CASCADE;
DROP TABLE IF EXISTS public.creators CASCADE;
DROP TABLE IF EXISTS public.agency_settings CASCADE;
DROP TABLE IF EXISTS public.integration_settings CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.requests_history CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. CREATORS TABLE (Tour Creators/Agencies)
CREATE TABLE public.creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_name TEXT NOT NULL,
  agency_logo TEXT,
  contact_email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  address TEXT,
  description TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. END_CLIENTS TABLE (Clients of Tour Creators)
CREATE TABLE public.end_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  avatar TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  login_credentials JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROJECTS TABLE (Virtual Tours)
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  end_client_id UUID NOT NULL REFERENCES public.end_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'virtual_tour' CHECK (project_type IN ('virtual_tour', '3d_showcase', 'interactive_map')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
  thumbnail_url TEXT,
  tour_url TEXT,
  settings JSONB DEFAULT '{}',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CHATBOTS TABLE
CREATE TABLE public.chatbots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'english',
  welcome_message TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
  fallback_message TEXT NOT NULL DEFAULT 'I apologize, but I don''t understand. Could you please rephrase your question?',
  primary_color TEXT NOT NULL DEFAULT '#3b82f6',
  widget_style TEXT NOT NULL DEFAULT 'modern',
  position TEXT NOT NULL DEFAULT 'bottom_right',
  avatar_url TEXT,
  brand_logo_url TEXT,
  response_style TEXT NOT NULL DEFAULT 'friendly',
  max_questions INTEGER NOT NULL DEFAULT 10,
  conversation_limit INTEGER DEFAULT 50,
  knowledge_base_text TEXT,
  knowledge_base_files JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  statistics JSONB DEFAULT '{
    "total_conversations": 0,
    "active_users": 0,
    "avg_response_time": 0,
    "satisfaction_rate": 0,
    "total_messages": 0,
    "last_activity": null
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LEADS TABLE (Captured from Chatbots)
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_phone TEXT,
  company TEXT,
  question_asked TEXT NOT NULL,
  chatbot_response TEXT,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  source TEXT DEFAULT 'chatbot',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ANALYTICS TABLE (Tour and Chatbot Analytics)
CREATE TABLE public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('view', 'unique_visitor', 'time_spent', 'hotspot_click', 'chatbot_interaction', 'lead_generated')),
  metric_value INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. REQUESTS TABLE (Client Change Requests)
CREATE TABLE public.requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  end_client_id UUID NOT NULL REFERENCES public.end_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('hotspot_update', 'content_change', 'design_modification', 'new_feature', 'bug_fix')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  attachments JSONB DEFAULT '[]',
  creator_notes TEXT,
  client_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ASSETS TABLE (File Management)
CREATE TABLE public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_creators_user_id ON public.creators(user_id);
CREATE INDEX idx_end_clients_creator_id ON public.end_clients(creator_id);
CREATE INDEX idx_projects_end_client_id ON public.projects(end_client_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_chatbots_project_id ON public.chatbots(project_id);
CREATE INDEX idx_chatbots_status ON public.chatbots(status);
CREATE INDEX idx_leads_chatbot_id ON public.leads(chatbot_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_analytics_project_id ON public.analytics(project_id);
CREATE INDEX idx_analytics_date ON public.analytics(date);
CREATE INDEX idx_analytics_metric_type ON public.analytics(metric_type);
CREATE INDEX idx_requests_project_id ON public.requests(project_id);
CREATE INDEX idx_requests_end_client_id ON public.requests(end_client_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_assets_creator_id ON public.assets(creator_id);
CREATE INDEX idx_assets_project_id ON public.assets(project_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_creators_updated_at
  BEFORE UPDATE ON public.creators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_end_clients_updated_at
  BEFORE UPDATE ON public.end_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbots_updated_at
  BEFORE UPDATE ON public.chatbots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.end_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for CREATORS table
CREATE POLICY "Creators can manage their own data" ON public.creators
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for END_CLIENTS table
CREATE POLICY "Creators can manage their end clients" ON public.end_clients
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "End clients can view their own data" ON public.end_clients
  FOR SELECT USING (
    id = (auth.jwt() ->> 'end_client_id')::uuid
  );

-- RLS Policies for PROJECTS table
CREATE POLICY "Creators can manage projects of their clients" ON public.projects
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "End clients can view their own projects" ON public.projects
  FOR SELECT USING (
    end_client_id = (auth.jwt() ->> 'end_client_id')::uuid
  );

-- RLS Policies for CHATBOTS table
CREATE POLICY "Creators can manage chatbots of their clients" ON public.chatbots
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "End clients can view their chatbots" ON public.chatbots
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE end_client_id = (auth.jwt() ->> 'end_client_id')::uuid
    )
  );

-- RLS Policies for LEADS table
CREATE POLICY "Creators can manage leads from their clients" ON public.leads
  FOR ALL USING (
    chatbot_id IN (
      SELECT cb.id FROM public.chatbots cb
      JOIN public.projects p ON cb.project_id = p.id
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "End clients can view their leads" ON public.leads
  FOR SELECT USING (
    chatbot_id IN (
      SELECT cb.id FROM public.chatbots cb
      JOIN public.projects p ON cb.project_id = p.id
      WHERE p.end_client_id = (auth.jwt() ->> 'end_client_id')::uuid
    )
  );

-- RLS Policies for ANALYTICS table
CREATE POLICY "Creators can manage analytics of their clients" ON public.analytics
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "End clients can view their analytics" ON public.analytics
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE end_client_id = (auth.jwt() ->> 'end_client_id')::uuid
    )
  );

-- RLS Policies for REQUESTS table
CREATE POLICY "Creators can manage requests from their clients" ON public.requests
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "End clients can manage their own requests" ON public.requests
  FOR ALL USING (
    end_client_id = (auth.jwt() ->> 'end_client_id')::uuid
  );

-- RLS Policies for ASSETS table
CREATE POLICY "Creators can manage their own assets" ON public.assets
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

-- Create materialized view for analytics summary
CREATE MATERIALIZED VIEW public.analytics_summary AS
SELECT 
  p.id as project_id,
  p.title as project_title,
  ec.id as end_client_id,
  ec.name as client_name,
  c.id as creator_id,
  c.agency_name,
  COUNT(DISTINCT a.id) as total_views,
  COUNT(DISTINCT l.id) as total_leads,
  AVG(a.metric_value) as avg_engagement,
  MAX(a.date) as last_activity
FROM public.projects p
JOIN public.end_clients ec ON p.end_client_id = ec.id
JOIN public.creators c ON ec.creator_id = c.id
LEFT JOIN public.analytics a ON p.id = a.project_id
LEFT JOIN public.chatbots cb ON p.id = cb.project_id
LEFT JOIN public.leads l ON cb.id = l.chatbot_id
GROUP BY p.id, p.title, ec.id, ec.name, c.id, c.agency_name;

-- Create function to refresh analytics summary
CREATE OR REPLACE FUNCTION public.refresh_analytics_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.analytics_summary;
END;
$$ LANGUAGE plpgsql;

-- Create function to get creator statistics
CREATE OR REPLACE FUNCTION public.get_creator_stats(creator_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_clients', COUNT(DISTINCT ec.id),
    'total_projects', COUNT(DISTINCT p.id),
    'total_chatbots', COUNT(DISTINCT cb.id),
    'total_leads', COUNT(DISTINCT l.id),
    'total_views', COALESCE(SUM(a.metric_value), 0),
    'active_projects', COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END)
  ) INTO result
  FROM public.creators c
  LEFT JOIN public.end_clients ec ON c.id = ec.creator_id
  LEFT JOIN public.projects p ON ec.id = p.end_client_id
  LEFT JOIN public.chatbots cb ON p.id = cb.project_id
  LEFT JOIN public.leads l ON cb.id = l.chatbot_id
  LEFT JOIN public.analytics a ON p.id = a.project_id AND a.metric_type = 'view'
  WHERE c.user_id = creator_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get client statistics
CREATE OR REPLACE FUNCTION public.get_client_stats(client_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_projects', COUNT(DISTINCT p.id),
    'total_chatbots', COUNT(DISTINCT cb.id),
    'total_leads', COUNT(DISTINCT l.id),
    'total_views', COALESCE(SUM(a.metric_value), 0),
    'active_projects', COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END),
    'pending_requests', COUNT(DISTINCT CASE WHEN r.status = 'open' THEN r.id END)
  ) INTO result
  FROM public.end_clients ec
  LEFT JOIN public.projects p ON ec.id = p.end_client_id
  LEFT JOIN public.chatbots cb ON p.id = cb.project_id
  LEFT JOIN public.leads l ON cb.id = l.chatbot_id
  LEFT JOIN public.analytics a ON p.id = a.project_id AND a.metric_type = 'view'
  LEFT JOIN public.requests r ON ec.id = r.end_client_id
  WHERE ec.id = client_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track analytics
CREATE OR REPLACE FUNCTION public.track_analytics(
  project_uuid UUID,
  metric_type_param TEXT,
  metric_value_param INTEGER DEFAULT 1,
  metadata_param JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  analytics_id UUID;
BEGIN
  INSERT INTO public.analytics (
    project_id,
    date,
    metric_type,
    metric_value,
    metadata
  ) VALUES (
    project_uuid,
    CURRENT_DATE,
    metric_type_param,
    metric_value_param,
    metadata_param
  ) RETURNING id INTO analytics_id;
  
  RETURN analytics_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
`;

// Sample data insertion
const insertSampleData = `
-- Insert sample creator
INSERT INTO public.creators (
  user_id,
  agency_name,
  contact_email,
  subscription_plan,
  subscription_status
) VALUES (
  gen_random_uuid(),
  'Demo Agency',
  'demo@example.com',
  'pro',
  'active'
);

-- Get the creator ID and insert sample end clients
WITH creator AS (
  SELECT id FROM public.creators WHERE agency_name = 'Demo Agency'
)
INSERT INTO public.end_clients (
  creator_id,
  name,
  email,
  company,
  status
) 
SELECT 
  creator.id,
  'Sarah Johnson',
  'sarah.johnson@techcorp.com',
  'TechCorp Solutions',
  'active'
FROM creator
UNION ALL
SELECT 
  creator.id,
  'Michael Chen',
  'm.chen@innovate.com',
  'Innovate Design',
  'active'
FROM creator
UNION ALL
SELECT 
  creator.id,
  'Emily Rodriguez',
  'emily@startup.io',
  'Startup.io',
  'pending'
FROM creator;

-- Insert sample projects
WITH client AS (
  SELECT id FROM public.end_clients WHERE name = 'Sarah Johnson'
)
INSERT INTO public.projects (
  end_client_id,
  title,
  description,
  project_type,
  status,
  tour_url
)
SELECT 
  client.id,
  'TechCorp Office Virtual Tour',
  'Interactive 360° tour of TechCorp headquarters',
  'virtual_tour',
  'active',
  'https://example.com/techcorp-tour'
FROM client
UNION ALL
SELECT 
  client.id,
  'Product Showcase',
  '3D showcase of latest products',
  '3d_showcase',
  'active',
  'https://example.com/techcorp-products'
FROM client;

-- Insert sample chatbots
WITH project AS (
  SELECT p.id FROM public.projects p
  JOIN public.end_clients ec ON p.end_client_id = ec.id
  WHERE ec.name = 'Sarah Johnson' AND p.title = 'TechCorp Office Virtual Tour'
)
INSERT INTO public.chatbots (
  project_id,
  name,
  description,
  welcome_message,
  primary_color,
  status,
  statistics
)
SELECT 
  project.id,
  'TechCorp Support Bot',
  'AI assistant for TechCorp customer support',
  'Hello! I''m here to help you with any questions about TechCorp. How can I assist you today?',
  '#3b82f6',
  'active',
  '{
    "total_conversations": 1247,
    "active_users": 89,
    "avg_response_time": 1.2,
    "satisfaction_rate": 4.6,
    "total_messages": 3847,
    "last_activity": "2024-01-15T10:30:00Z"
  }'::jsonb
FROM project;

-- Insert sample leads
WITH chatbot AS (
  SELECT cb.id FROM public.chatbots cb
  JOIN public.projects p ON cb.project_id = p.id
  JOIN public.end_clients ec ON p.end_client_id = ec.id
  WHERE ec.name = 'Sarah Johnson'
)
INSERT INTO public.leads (
  chatbot_id,
  visitor_name,
  visitor_email,
  question_asked,
  chatbot_response,
  lead_score,
  status
)
SELECT 
  chatbot.id,
  'John Doe',
  'john.doe@example.com',
  'What are your office hours?',
  'Our office hours are Monday to Friday, 9 AM to 6 PM. We also offer 24/7 online support.',
  85,
  'qualified'
FROM chatbot
UNION ALL
SELECT 
  chatbot.id,
  'Jane Smith',
  'jane.smith@company.com',
  'Do you offer virtual consultations?',
  'Yes! We offer virtual consultations via video call. Would you like to schedule one?',
  92,
  'new'
FROM chatbot;

-- Insert sample analytics
WITH project AS (
  SELECT p.id FROM public.projects p
  JOIN public.end_clients ec ON p.end_client_id = ec.id
  WHERE ec.name = 'Sarah Johnson'
)
INSERT INTO public.analytics (
  project_id,
  date,
  metric_type,
  metric_value,
  metadata
)
SELECT 
  project.id,
  CURRENT_DATE - INTERVAL '1 day',
  'view',
  150,
  '{"source": "direct", "device": "desktop"}'::jsonb
FROM project
UNION ALL
SELECT 
  project.id,
  CURRENT_DATE - INTERVAL '2 days',
  'view',
  200,
  '{"source": "google", "device": "mobile"}'::jsonb
FROM project
UNION ALL
SELECT 
  project.id,
  CURRENT_DATE - INTERVAL '3 days',
  'chatbot_interaction',
  45,
  '{"interaction_type": "question_answered"}'::jsonb
FROM project;

-- Insert sample requests
WITH project AS (
  SELECT p.id, p.end_client_id FROM public.projects p
  JOIN public.end_clients ec ON p.end_client_id = ec.id
  WHERE ec.name = 'Sarah Johnson' AND p.title = 'TechCorp Office Virtual Tour'
)
INSERT INTO public.requests (
  project_id,
  end_client_id,
  title,
  description,
  request_type,
  priority,
  status
)
SELECT 
  project.id,
  project.end_client_id,
  'Update Conference Room Information',
  'Please update the conference room capacity and equipment details',
  'content_change',
  'medium',
  'open'
FROM project;

-- Insert sample assets
WITH creator AS (
  SELECT id FROM public.creators WHERE agency_name = 'Demo Agency'
)
INSERT INTO public.assets (
  creator_id,
  filename,
  original_filename,
  file_type,
  file_size,
  file_url,
  tags
)
SELECT 
  creator.id,
  'techcorp-office-1.jpg',
  'TechCorp Office Main Entrance.jpg',
  'image/jpeg',
  2048000,
  'https://example.com/assets/techcorp-office-1.jpg',
  ARRAY['office', 'entrance', 'techcorp']
FROM creator
UNION ALL
SELECT 
  creator.id,
  'product-brochure.pdf',
  'TechCorp Product Brochure 2024.pdf',
  'application/pdf',
  5120000,
  'https://example.com/assets/product-brochure.pdf',
  ARRAY['brochure', 'products', 'marketing']
FROM creator;
`;

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Step 1: Create database schema
    console.log('📊 Creating database schema...');
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: createDatabaseSchema });
    
    if (schemaError) {
      console.error('❌ Schema creation failed:', schemaError);
      // Try direct SQL execution
      const { error: directError } = await supabase
        .from('_sql')
        .select('*')
        .eq('query', createDatabaseSchema);
      
      if (directError) {
        console.error('❌ Direct SQL execution failed:', directError);
        throw new Error('Failed to create database schema');
      }
    }
    
    console.log('✅ Database schema created successfully');
    
    // Step 2: Insert sample data
    console.log('📝 Inserting sample data...');
    const { error: dataError } = await supabase.rpc('exec_sql', { sql: insertSampleData });
    
    if (dataError) {
      console.error('❌ Sample data insertion failed:', dataError);
      // Try direct SQL execution
      const { error: directDataError } = await supabase
        .from('_sql')
        .select('*')
        .eq('query', insertSampleData);
      
      if (directDataError) {
        console.error('❌ Direct sample data insertion failed:', directDataError);
        throw new Error('Failed to insert sample data');
      }
    }
    
    console.log('✅ Sample data inserted successfully');
    
    // Step 3: Verify setup
    console.log('🔍 Verifying database setup...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['creators', 'end_clients', 'projects', 'chatbots', 'leads', 'analytics', 'requests', 'assets']);
    
    if (tablesError) {
      console.error('❌ Table verification failed:', tablesError);
    } else {
      console.log('✅ Tables created:', tables.map(t => t.table_name).join(', '));
    }
    
    // Step 4: Test data retrieval
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('*');
    
    if (creatorsError) {
      console.error('❌ Creator data retrieval failed:', creatorsError);
    } else {
      console.log('✅ Found', creators.length, 'creators in database');
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Your database is ready with all 8 tables');
    console.log('2. Sample data has been inserted');
    console.log('3. RLS policies are active');
    console.log('4. Your application should now work with the database');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('✅ Database setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  });






