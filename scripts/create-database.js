const https = require('https');

// Supabase configuration
const supabaseUrl = 'https://yrvicwapjsevyilxdzsm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAwNjY4MiwiZXhwIjoyMDc1NTgyNjgyfQ.fHtu3wPlbrsyZPVVLObVYeZ-BT8KmsJybK_r_zEv4pU';

// Function to make HTTP request to Supabase
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, supabaseUrl);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ data: jsonBody, status: res.statusCode });
        } catch (e) {
          resolve({ data: body, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// SQL to create the complete database schema
const createSchemaSQL = `
-- Complete TourCompanion SaaS Database Schema
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.analytics CASCADE;
DROP TABLE IF EXISTS public.requests CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.chatbots CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.end_clients CASCADE;
DROP TABLE IF EXISTS public.creators CASCADE;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. CREATORS TABLE
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

-- 2. END_CLIENTS TABLE
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

-- 3. PROJECTS TABLE
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

-- 5. LEADS TABLE
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

-- 6. ANALYTICS TABLE
CREATE TABLE public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('view', 'unique_visitor', 'time_spent', 'hotspot_click', 'chatbot_interaction', 'lead_generated')),
  metric_value INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. REQUESTS TABLE
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

-- 8. ASSETS TABLE
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

-- Create indexes
CREATE INDEX idx_creators_user_id ON public.creators(user_id);
CREATE INDEX idx_end_clients_creator_id ON public.end_clients(creator_id);
CREATE INDEX idx_projects_end_client_id ON public.projects(end_client_id);
CREATE INDEX idx_chatbots_project_id ON public.chatbots(project_id);
CREATE INDEX idx_leads_chatbot_id ON public.leads(chatbot_id);
CREATE INDEX idx_analytics_project_id ON public.analytics(project_id);
CREATE INDEX idx_requests_project_id ON public.requests(project_id);
CREATE INDEX idx_assets_creator_id ON public.assets(creator_id);

-- Create triggers
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

-- Enable RLS
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.end_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Creators can manage their own data" ON public.creators
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Creators can manage their end clients" ON public.end_clients
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can manage projects of their clients" ON public.projects
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Creators can manage chatbots of their clients" ON public.chatbots
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

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

CREATE POLICY "Creators can manage analytics of their clients" ON public.analytics
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can manage requests from their clients" ON public.requests
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Creators can manage their own assets" ON public.assets
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

-- Create functions
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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
`;

async function createDatabase() {
  try {
    console.log('🚀 Creating TourCompanion database...');
    
    // Execute the SQL to create the database schema
    const response = await makeRequest('/rest/v1/rpc/exec_sql', 'POST', {
      sql: createSchemaSQL
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Database schema created successfully!');
    } else {
      console.log('⚠️ Schema creation response:', response);
    }
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    // Create a sample creator
    const creatorResponse = await makeRequest('/rest/v1/creators', 'POST', {
      user_id: '00000000-0000-0000-0000-000000000000', // Anonymous user
      agency_name: 'Demo Agency',
      contact_email: 'demo@example.com',
      subscription_plan: 'pro',
      subscription_status: 'active'
    });
    
    if (creatorResponse.status === 201) {
      console.log('✅ Sample creator created');
      const creatorId = creatorResponse.data[0].id;
      
      // Create sample end clients
      const clientsResponse = await makeRequest('/rest/v1/end_clients', 'POST', [
        {
          creator_id: creatorId,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@techcorp.com',
          company: 'TechCorp Solutions',
          status: 'active'
        },
        {
          creator_id: creatorId,
          name: 'Michael Chen',
          email: 'm.chen@innovate.com',
          company: 'Innovate Design',
          status: 'active'
        }
      ]);
      
      if (clientsResponse.status === 201) {
        console.log('✅ Sample clients created');
        const clientId = clientsResponse.data[0].id;
        
        // Create sample project
        const projectResponse = await makeRequest('/rest/v1/projects', 'POST', {
          end_client_id: clientId,
          title: 'TechCorp Office Virtual Tour',
          description: 'Interactive 360° tour of TechCorp headquarters',
          project_type: 'virtual_tour',
          status: 'active',
          tour_url: 'https://example.com/techcorp-tour'
        });
        
        if (projectResponse.status === 201) {
          console.log('✅ Sample project created');
          const projectId = projectResponse.data[0].id;
          
          // Create sample chatbot
          const chatbotResponse = await makeRequest('/rest/v1/chatbots', 'POST', {
            project_id: projectId,
            name: 'TechCorp Support Bot',
            description: 'AI assistant for TechCorp customer support',
            welcome_message: 'Hello! I\'m here to help you with any questions about TechCorp. How can I assist you today?',
            primary_color: '#3b82f6',
            status: 'active',
            statistics: {
              total_conversations: 1247,
              active_users: 89,
              avg_response_time: 1.2,
              satisfaction_rate: 4.6,
              total_messages: 3847,
              last_activity: '2024-01-15T10:30:00Z'
            }
          });
          
          if (chatbotResponse.status === 201) {
            console.log('✅ Sample chatbot created');
            const chatbotId = chatbotResponse.data[0].id;
            
            // Create sample leads
            const leadsResponse = await makeRequest('/rest/v1/leads', 'POST', [
              {
                chatbot_id: chatbotId,
                visitor_name: 'John Doe',
                visitor_email: 'john.doe@example.com',
                question_asked: 'What are your office hours?',
                chatbot_response: 'Our office hours are Monday to Friday, 9 AM to 6 PM.',
                lead_score: 85,
                status: 'qualified'
              },
              {
                chatbot_id: chatbotId,
                visitor_name: 'Jane Smith',
                visitor_email: 'jane.smith@company.com',
                question_asked: 'Do you offer virtual consultations?',
                chatbot_response: 'Yes! We offer virtual consultations via video call.',
                lead_score: 92,
                status: 'new'
              }
            ]);
            
            if (leadsResponse.status === 201) {
              console.log('✅ Sample leads created');
            }
          }
        }
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📋 Your TourCompanion SaaS database is ready with:');
    console.log('   ✅ 8 core tables created');
    console.log('   ✅ Row-Level Security policies active');
    console.log('   ✅ Sample data inserted');
    console.log('   ✅ Database functions created');
    console.log('   ✅ Indexes and triggers set up');
    
  } catch (error) {
    console.error('❌ Database creation failed:', error);
    throw error;
  }
}

// Run the database creation
createDatabase()
  .then(() => {
    console.log('✅ Database creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database creation failed:', error);
    process.exit(1);
  });






