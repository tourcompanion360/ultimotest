# TourCompanion SaaS Architecture Documentation

## 🎯 **Application Overview**

TourCompanion is a multi-tenant SaaS platform that serves two distinct user types:
- **Tour Creators/Agencies** (Paying customers with subscription plans)
- **End Clients** (Clients of the tour creators who receive branded portals)

## 🏗️ **Core Architecture Principles**

### **Single Database, Multiple Views**
- One centralized Supabase database serves both user types
- Different views and permissions based on user role
- Row-Level Security (RLS) ensures data isolation
- No separate applications - just different UI views of the same data

### **User Journey Flow**
1. **Alex (Tour Creator)** logs into "Creator's Command Center"
2. **Manages multiple client projects** (hotels, real estate, museums)
3. **Creates chatbots** for each project to capture leads
4. **End clients** access their branded portal to view analytics and leads
5. **Real-time data flow** between creator dashboard and client portals

## 📊 **Database Schema**

### **Core Tables Structure**

```sql
-- 1. CREATORS (Tour Creators/Agencies)
CREATE TABLE public.creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  agency_name TEXT NOT NULL,
  agency_logo TEXT,
  contact_email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  address TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. END_CLIENTS (Clients of Tour Creators)
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
  login_credentials JSONB, -- Store client portal login info
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROJECTS (Virtual Tours)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CHATBOTS
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
  knowledge_base_text TEXT,
  knowledge_base_files JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LEADS (Captured from Chatbots)
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
  metadata JSONB DEFAULT '{}', -- Additional visitor data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ANALYTICS (Tour and Chatbot Analytics)
CREATE TABLE public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('view', 'unique_visitor', 'time_spent', 'hotspot_click', 'chatbot_interaction')),
  metric_value INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Additional metric data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. REQUESTS (Client Change Requests)
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

-- 8. ASSETS (File Management)
CREATE TABLE public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL, -- NULL for general assets
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

## 🔐 **Row-Level Security (RLS) Policies**

```sql
-- Enable RLS on all tables
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.end_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Creators can only access their own data
CREATE POLICY "Creators can manage their own data" ON public.creators
  FOR ALL USING (auth.uid() = user_id);

-- End clients can only access their own data
CREATE POLICY "End clients can view their own data" ON public.end_clients
  FOR SELECT USING (
    id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

-- Projects: Creators can manage, end clients can view
CREATE POLICY "Creators can manage projects" ON public.projects
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "End clients can view their projects" ON public.projects
  FOR SELECT USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE id = auth.jwt() ->> 'end_client_id' -- From JWT token
    )
  );

-- Similar patterns for other tables...
```

## 📊 **Data Flow Architecture**

### **1. Creator's Command Center Data Flow**

```typescript
// Creator Dashboard Data Fetching
const useCreatorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  
  useEffect(() => {
    const fetchCreatorData = async () => {
      // Get creator's ID from auth
      const { data: creator } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Fetch all related data
      const [clients, projects, leads, requests, analytics] = await Promise.all([
        // End clients
        supabase
          .from('end_clients')
          .select('*')
          .eq('creator_id', creator.id),
        
        // Projects
        supabase
          .from('projects')
          .select(`
            *,
            end_clients!inner(creator_id)
          `)
          .eq('end_clients.creator_id', creator.id),
        
        // Leads from all chatbots
        supabase
          .from('leads')
          .select(`
            *,
            chatbots!inner(
              projects!inner(
                end_clients!inner(creator_id)
              )
            )
          `)
          .eq('chatbots.projects.end_clients.creator_id', creator.id),
        
        // Requests
        supabase
          .from('requests')
          .select(`
            *,
            projects!inner(
              end_clients!inner(creator_id)
            )
          `)
          .eq('projects.end_clients.creator_id', creator.id),
        
        // Analytics
        supabase
          .from('analytics')
          .select(`
            *,
            projects!inner(
              end_clients!inner(creator_id)
            )
          `)
          .eq('projects.end_clients.creator_id', creator.id)
      ]);

      setDashboardData({
        clients: clients.data,
        projects: projects.data,
        leads: leads.data,
        requests: requests.data,
        analytics: analytics.data
      });
    };

    fetchCreatorData();
  }, [user]);

  return dashboardData;
};
```

### **2. End Client Portal Data Flow**

```typescript
// End Client Portal Data Fetching
const useClientPortal = (endClientId: string) => {
  const [portalData, setPortalData] = useState(null);
  
  useEffect(() => {
    const fetchClientData = async () => {
      // Fetch client's data only
      const [projects, leads, analytics, requests] = await Promise.all([
        // Client's projects only
        supabase
          .from('projects')
          .select(`
            *,
            chatbots(*)
          `)
          .eq('end_client_id', endClientId),
        
        // Leads from client's chatbots
        supabase
          .from('leads')
          .select(`
            *,
            chatbots!inner(
              projects!inner(end_client_id)
            )
          `)
          .eq('chatbots.projects.end_client_id', endClientId),
        
        // Client's analytics
        supabase
          .from('analytics')
          .select(`
            *,
            projects!inner(end_client_id)
          `)
          .eq('projects.end_client_id', endClientId),
        
        // Client's requests
        supabase
          .from('requests')
          .select('*')
          .eq('end_client_id', endClientId)
      ]);

      setPortalData({
        projects: projects.data,
        leads: leads.data,
        analytics: analytics.data,
        requests: requests.data
      });
    };

    fetchClientData();
  }, [endClientId]);

  return portalData;
};
```

## 🎯 **Key Features & User Stories**

### **Creator's Command Center Features:**
1. **Project Hub**: Overview of all client projects with virtual tours and chatbots
2. **Asset Library**: Organized file management for all projects
3. **Client Requests**: Centralized client feedback and change requests
4. **Lead Management**: View all leads generated across all projects
5. **Analytics Dashboard**: Comprehensive analytics for all clients
6. **Chatbot Management**: Create and configure chatbots for each project

### **End Client Portal Features:**
1. **Real-Time Lead List**: All captured leads with contact details
2. **Analytics Dashboard**: Key metrics and insights
3. **Top Questions Analysis**: Most asked questions from chatbot
4. **Project Status**: View their virtual tours and chatbots
5. **Request System**: Submit change requests to creator

### **Chatbot Lead Generation Flow:**
1. **Visitor explores virtual tour**
2. **Asks chatbot question** (e.g., "Is this suite available for July?")
3. **Chatbot provides instant answer** with pricing and availability
4. **Chatbot captures lead information** if visitor provides details
5. **Lead appears in both Creator dashboard and Client portal**
6. **Real-time notifications** for new leads

## 🔄 **Real-time Data Flow**

### **Lead Capture Process:**
```typescript
// Real-time lead notifications
useEffect(() => {
  const channel = supabase
    .channel('leads')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'leads'
    }, (payload) => {
      // Update leads in real-time
      setLeads(prev => [payload.new, ...prev]);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

### **Analytics Tracking:**
```typescript
// Track tour interactions
const trackTourInteraction = async (projectId: string, interactionType: string) => {
  await supabase
    .from('analytics')
    .insert({
      project_id: projectId,
      date: new Date().toISOString().split('T')[0],
      metric_type: interactionType,
      metric_value: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      }
    });
};
```

## 📈 **Analytics & Performance**

### **Analytics Aggregation:**
```sql
-- Create materialized view for performance
CREATE MATERIALIZED VIEW public.analytics_summary AS
SELECT 
  p.id as project_id,
  p.title as project_title,
  ec.name as client_name,
  c.agency_name,
  COUNT(DISTINCT a.id) as total_views,
  COUNT(DISTINCT l.id) as total_leads,
  AVG(a.metric_value) as avg_engagement
FROM projects p
JOIN end_clients ec ON p.end_client_id = ec.id
JOIN creators c ON ec.creator_id = c.id
LEFT JOIN analytics a ON p.id = a.project_id
LEFT JOIN chatbots cb ON p.id = cb.project_id
LEFT JOIN leads l ON cb.id = l.chatbot_id
GROUP BY p.id, p.title, ec.name, c.agency_name;

-- Refresh periodically
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.analytics_summary;
END;
$$ LANGUAGE plpgsql;
```

## 🔐 **Authentication Strategy**

### **User Types & Access:**
- **Creators**: Supabase Auth with email/password
- **End Clients**: JWT tokens with `end_client_id` in payload
- **Separate login flows** for each user type
- **Role-based permissions** enforced at database level

### **Security Measures:**
- **Row-Level Security (RLS)** on all sensitive tables
- **JWT token validation** for end client access
- **API rate limiting** based on subscription plan
- **Data encryption** for sensitive information

## 💾 **File Storage Strategy**

### **Supabase Storage Organization:**
- `creator-assets/{creator_id}/` - General creator assets
- `project-assets/{project_id}/` - Project-specific assets
- `client-uploads/{end_client_id}/` - Client uploaded files
- `chatbot-knowledge/{chatbot_id}/` - Chatbot knowledge base files

## 📊 **Subscription Plans**

### **Plan Features:**
```typescript
const PLAN_FEATURES = {
  basic: {
    maxChatbots: 2,
    maxProjects: 5,
    maxClients: 10,
    analyticsAccess: false,
    customBranding: false,
    apiAccess: false,
    storage: 1, // GB
    apiCalls: 1000
  },
  pro: {
    maxChatbots: 5,
    maxProjects: 50,
    maxClients: 100,
    analyticsAccess: true,
    customBranding: true,
    apiAccess: true,
    storage: 10, // GB
    apiCalls: 10000
  }
};
```

## 🚀 **Implementation Priorities**

### **Phase 1: Core Infrastructure**
1. Database schema implementation
2. RLS policies setup
3. Basic authentication flows
4. Creator dashboard foundation

### **Phase 2: Client Portal**
1. End client authentication
2. Client portal UI
3. Data filtering and permissions
4. Real-time updates

### **Phase 3: Advanced Features**
1. Chatbot integration
2. Lead capture system
3. Analytics dashboard
4. File management system

### **Phase 4: Optimization**
1. Performance optimization
2. Advanced analytics
3. API rate limiting
4. Subscription management

## 📝 **Key Technical Decisions**

1. **Single Database Approach**: Easier maintenance, better data consistency
2. **RLS for Security**: Database-level security, not just application-level
3. **Real-time Updates**: Supabase real-time subscriptions for live data
4. **Materialized Views**: Performance optimization for analytics
5. **JWT for End Clients**: Lightweight authentication for client portals
6. **JSONB for Flexibility**: Store dynamic data like settings and metadata

## 🔧 **Development Guidelines**

### **Code Organization:**
- Separate hooks for Creator and Client data fetching
- Shared components with role-based rendering
- Centralized constants for plan features and limits
- Type-safe interfaces for all data structures

### **Testing Strategy:**
- Unit tests for data fetching hooks
- Integration tests for RLS policies
- E2E tests for user flows
- Performance tests for analytics queries

This documentation serves as the single source of truth for the TourCompanion SaaS architecture and should be referenced for all development decisions and implementations.



