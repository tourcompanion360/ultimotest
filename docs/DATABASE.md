# Database Documentation

## 📊 Complete Database Schema

TourCompanion uses a PostgreSQL database hosted on Supabase with Row-Level Security (RLS) for multi-tenant data isolation.

## 🏗️ Table Structure

### 1. CREATORS Table
Tour creators/agencies who pay for the service.

```sql
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
```

**Key Fields:**
- `user_id`: Links to Supabase Auth user
- `subscription_plan`: 'basic' or 'pro' with different limits
- `stripe_customer_id`: For payment processing

### 2. END_CLIENTS Table
Clients of tour creators who receive branded portals.

```sql
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
  login_credentials JSONB DEFAULT '{}', -- Store client portal login info
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Fields:**
- `creator_id`: Foreign key to creators table
- `status`: Client status for filtering
- `login_credentials`: JSONB for flexible auth data

### 3. PROJECTS Table
Virtual tours and 3D showcases for end clients.

```sql
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  end_client_id UUID NOT NULL REFERENCES public.end_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'virtual_tour' CHECK (project_type IN ('virtual_tour', '3d_showcase', 'interactive_map')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
  thumbnail_url TEXT,
  tour_url TEXT, -- Link to the actual virtual tour
  settings JSONB DEFAULT '{}', -- Tour configuration, hotspots, etc.
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Fields:**
- `end_client_id`: Foreign key to end_clients table
- `project_type`: Type of project (virtual_tour, 3d_showcase, interactive_map)
- `tour_url`: External link to the actual tour
- `settings`: JSONB for flexible tour configuration

### 4. CHATBOTS Table
AI chatbots for each project to capture leads.

```sql
CREATE TABLE public.chatbots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'english',
  welcome_message TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
  fallback_message TEXT NOT NULL DEFAULT 'I apologize, but I don\'t understand. Could you please rephrase your question?',
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
```

**Key Fields:**
- `project_id`: Foreign key to projects table
- `knowledge_base_files`: JSONB array of uploaded files
- `statistics`: JSONB for chatbot performance metrics

### 5. LEADS Table
Captured leads from chatbot interactions.

```sql
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
```

**Key Fields:**
- `chatbot_id`: Foreign key to chatbots table
- `lead_score`: 0-100 score for lead quality
- `metadata`: JSONB for additional visitor data

### 6. ANALYTICS Table
Tour and chatbot analytics data.

```sql
CREATE TABLE public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('view', 'unique_visitor', 'time_spent', 'hotspot_click', 'chatbot_interaction', 'lead_generated')),
  metric_value INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Fields:**
- `project_id`: Foreign key to projects table
- `metric_type`: Type of analytics metric
- `metadata`: JSONB for additional metric data

### 7. REQUESTS Table
Client change requests and feedback.

```sql
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
```

**Key Fields:**
- `project_id`: Foreign key to projects table
- `end_client_id`: Foreign key to end_clients table
- `attachments`: JSONB array of attached files

### 8. ASSETS Table
File management for creators and projects.

```sql
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
```

**Key Fields:**
- `creator_id`: Foreign key to creators table
- `project_id`: Optional foreign key to projects table (NULL for general assets)
- `tags`: Array of tags for organization

## 🔗 Foreign Key Relationships

```
creators (1) ──→ (many) end_clients
end_clients (1) ──→ (many) projects
projects (1) ──→ (many) chatbots
chatbots (1) ──→ (many) leads
projects (1) ──→ (many) analytics
projects (1) ──→ (many) requests
end_clients (1) ──→ (many) requests
creators (1) ──→ (many) assets
projects (0..1) ──→ (many) assets
```

## 🔐 Row-Level Security (RLS) Policies

### Creators Table
```sql
-- Creators can only access their own data
CREATE POLICY "Creators can manage their own data" ON public.creators
  FOR ALL USING (auth.uid() = user_id);
```

### End Clients Table
```sql
-- Creators can manage their end clients
CREATE POLICY "Creators can manage their end clients" ON public.end_clients
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

-- End clients can view their own data (for client portal)
CREATE POLICY "End clients can view their own data" ON public.end_clients
  FOR SELECT USING (
    id IN (
      SELECT ec.id FROM public.end_clients ec
      JOIN public.end_client_users ecu ON ec.id = ecu.end_client_id
      WHERE ecu.user_id = auth.uid()
    )
  );
```

### Projects Table
```sql
-- Creators can manage projects of their clients
CREATE POLICY "Creators can manage projects of their clients" ON public.projects
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

-- End clients can view their own projects
CREATE POLICY "End clients can view their own projects" ON public.projects
  FOR SELECT USING (
    end_client_id IN (
      SELECT ec.id FROM public.end_clients ec
      JOIN public.end_client_users ecu ON ec.id = ecu.end_client_id
      WHERE ecu.user_id = auth.uid()
    )
  );

-- Public read access for client portals (no auth required)
CREATE POLICY "Public can view projects for client portals" ON public.projects
  FOR SELECT USING (true);
```

### Chatbots Table
```sql
-- Creators can manage chatbots of their clients
CREATE POLICY "Creators can manage chatbots of their clients" ON public.chatbots
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- End clients can view their chatbots
CREATE POLICY "End clients can view their chatbots" ON public.chatbots
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.end_client_users ecu ON ec.id = ecu.end_client_id
      WHERE ecu.user_id = auth.uid()
    )
  );

-- Public read access for client portals
CREATE POLICY "Public can view chatbots for client portals" ON public.chatbots
  FOR SELECT USING (true);
```

### Leads Table
```sql
-- Creators can manage leads from their clients
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

-- End clients can view their leads
CREATE POLICY "End clients can view their leads" ON public.leads
  FOR SELECT USING (
    chatbot_id IN (
      SELECT cb.id FROM public.chatbots cb
      JOIN public.projects p ON cb.project_id = p.id
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.end_client_users ecu ON ec.id = ecu.end_client_id
      WHERE ecu.user_id = auth.uid()
    )
  );
```

### Analytics Table
```sql
-- Creators can manage analytics of their clients
CREATE POLICY "Creators can manage analytics of their clients" ON public.analytics
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- End clients can view their analytics
CREATE POLICY "End clients can view their analytics" ON public.analytics
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.end_client_users ecu ON ec.id = ecu.end_client_id
      WHERE ecu.user_id = auth.uid()
    )
  );

-- Public read access for client portals
CREATE POLICY "Public can view analytics for client portals" ON public.analytics
  FOR SELECT USING (true);
```

### Requests Table
```sql
-- Creators can manage requests from their clients
CREATE POLICY "Creators can manage requests from their clients" ON public.requests
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

-- End clients can manage their own requests
CREATE POLICY "End clients can manage their own requests" ON public.requests
  FOR ALL USING (
    end_client_id IN (
      SELECT ec.id FROM public.end_clients ec
      JOIN public.end_client_users ecu ON ec.id = ecu.end_client_id
      WHERE ecu.user_id = auth.uid()
    )
  );
```

### Assets Table
```sql
-- Creators can manage their own assets
CREATE POLICY "Creators can manage their own assets" ON public.assets
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );
```

## 📈 Indexes and Performance

### Primary Indexes
```sql
-- Performance indexes
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
```

### Composite Indexes
```sql
-- Composite indexes for common queries
CREATE INDEX idx_analytics_project_date ON public.analytics(project_id, date);
CREATE INDEX idx_leads_chatbot_status ON public.leads(chatbot_id, status);
CREATE INDEX idx_requests_client_status ON public.requests(end_client_id, status);
```

## 🔧 Database Functions

### Analytics Functions
```sql
-- Get creator statistics
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

-- Track analytics
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
```

### Triggers
```sql
-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
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
```

## 📁 Migration Files

The database schema is managed through Supabase migrations in the `supabase/migrations/` directory:

1. `20250110000000_complete_saas_schema.sql` - Complete schema creation
2. `20250111000000_create_end_client_users.sql` - End client authentication mapping
3. `20250111000001_fix_end_client_rls_policies.sql` - RLS policy updates
4. Additional migrations for specific features and fixes

## 🔍 Sample Queries

### Get Creator Dashboard Data
```sql
-- Get all data for a creator's dashboard
SELECT 
  c.agency_name,
  COUNT(DISTINCT ec.id) as total_clients,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT cb.id) as total_chatbots,
  COUNT(DISTINCT l.id) as total_leads,
  COALESCE(SUM(a.metric_value), 0) as total_views
FROM public.creators c
LEFT JOIN public.end_clients ec ON c.id = ec.creator_id
LEFT JOIN public.projects p ON ec.id = p.end_client_id
LEFT JOIN public.chatbots cb ON p.id = cb.project_id
LEFT JOIN public.leads l ON cb.id = l.chatbot_id
LEFT JOIN public.analytics a ON p.id = a.project_id AND a.metric_type = 'view'
WHERE c.user_id = $1
GROUP BY c.id, c.agency_name;
```

### Get Client Portal Data
```sql
-- Get all data for a specific end client
SELECT 
  ec.name as client_name,
  ec.company,
  p.title as project_title,
  p.tour_url,
  cb.name as chatbot_name,
  cb.status as chatbot_status,
  COUNT(DISTINCT l.id) as total_leads,
  COALESCE(SUM(a.metric_value), 0) as total_views
FROM public.end_clients ec
LEFT JOIN public.projects p ON ec.id = p.end_client_id
LEFT JOIN public.chatbots cb ON p.id = cb.project_id
LEFT JOIN public.leads l ON cb.id = l.chatbot_id
LEFT JOIN public.analytics a ON p.id = a.project_id AND a.metric_type = 'view'
WHERE ec.id = $1
GROUP BY ec.id, ec.name, ec.company, p.id, p.title, p.tour_url, cb.id, cb.name, cb.status;
```

### Get Recent Leads
```sql
-- Get recent leads for a creator
SELECT 
  l.visitor_name,
  l.visitor_email,
  l.question_asked,
  l.created_at,
  ec.name as client_name,
  p.title as project_title
FROM public.leads l
JOIN public.chatbots cb ON l.chatbot_id = cb.id
JOIN public.projects p ON cb.project_id = p.id
JOIN public.end_clients ec ON p.end_client_id = ec.id
JOIN public.creators c ON ec.creator_id = c.id
WHERE c.user_id = $1
ORDER BY l.created_at DESC
LIMIT 50;
```

## 🚨 Important Notes

1. **Cascading Deletes**: When a creator is deleted, all their clients, projects, and related data are automatically deleted
2. **RLS Enforcement**: All queries must respect RLS policies - no data leakage between creators
3. **JSONB Fields**: Use JSONB for flexible data storage (settings, metadata, statistics)
4. **UUID Primary Keys**: All tables use UUID primary keys for better security and distribution
5. **Timestamps**: All tables have created_at, most have updated_at with automatic triggers
6. **Status Fields**: Use consistent status enums across tables for filtering and UI display

This database schema supports the multi-tenant architecture while maintaining data isolation and performance through proper indexing and RLS policies.



