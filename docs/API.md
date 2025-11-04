# API Documentation

## 🚀 Supabase Edge Functions

TourCompanion uses Supabase Edge Functions for server-side logic and API endpoints.

### Function Structure
All Edge Functions are located in `supabase/functions/` directory and follow this structure:

```
supabase/functions/
├── function-name/
│   ├── index.ts          # Main function code
│   └── import_map.json   # Deno import map (optional)
```

## 📡 Available Edge Functions

### 1. provision_project
**Location:** `supabase/functions/provision_project/index.ts`

Creates a new project with client, project, and chatbot in a single atomic operation.

**Purpose:**
- Atomic project creation
- End client invitation
- Basic chatbot setup
- Database consistency

**Request Body:**
```typescript
interface ProvisionProjectRequest {
  client: {
    name: string;
    email: string;
    company: string;
    website?: string;
    phone?: string;
  };
  project: {
    title: string;
    description?: string;
    project_type: 'virtual_tour' | '3d_showcase' | 'interactive_map';
    tour_url?: string;
  };
  chatbot: {
    name: string;
    language: string;
    welcome_message?: string;
    fallback_message?: string;
  };
}
```

**Response:**
```typescript
interface ProvisionProjectResponse {
  success: boolean;
  data?: {
    client: EndClient;
    project: Project;
    chatbot: Chatbot;
    invitation: {
      portal_url: string;
      access_token: string;
    };
  };
  error?: string;
}
```

**Usage:**
```typescript
const response = await supabase.functions.invoke('provision_project', {
  body: {
    client: {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Example Corp'
    },
    project: {
      title: 'Virtual Office Tour',
      description: 'Interactive office showcase',
      project_type: 'virtual_tour'
    },
    chatbot: {
      name: 'Office Assistant',
      language: 'en'
    }
  }
});
```

### 2. chat_answer
**Location:** `supabase/functions/chat_answer/index.ts`

Handles chatbot interactions and responses.

**Purpose:**
- Process user questions
- Generate appropriate responses
- Store conversation history
- Capture lead information

**Request Body:**
```typescript
interface ChatAnswerRequest {
  chatbot_id: string;
  question: string;
  visitor_info?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  session_id?: string;
}
```

**Response:**
```typescript
interface ChatAnswerResponse {
  success: boolean;
  data?: {
    response: string;
    lead_captured: boolean;
    lead_id?: string;
    session_id: string;
  };
  error?: string;
}
```

**Usage:**
```typescript
const response = await supabase.functions.invoke('chat_answer', {
  body: {
    chatbot_id: 'uuid-here',
    question: 'What are your office hours?',
    visitor_info: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
});
```

### 3. kb_ingest
**Location:** `supabase/functions/kb_ingest/index.ts`

Processes and ingests knowledge base files for chatbots.

**Purpose:**
- File processing and parsing
- Text extraction
- Knowledge base storage
- Search optimization

**Request Body:**
```typescript
interface KBIngestRequest {
  chatbot_id: string;
  files: {
    filename: string;
    content: string;
    file_type: string;
  }[];
}
```

**Response:**
```typescript
interface KBIngestResponse {
  success: boolean;
  data?: {
    processed_files: number;
    chunks_created: number;
    chatbot_id: string;
  };
  error?: string;
}
```

**Usage:**
```typescript
const response = await supabase.functions.invoke('kb_ingest', {
  body: {
    chatbot_id: 'uuid-here',
    files: [
      {
        filename: 'faq.pdf',
        content: 'base64-encoded-content',
        file_type: 'application/pdf'
      }
    ]
  }
});
```

### 4. analytics_ingest
**Location:** `supabase/functions/analytics_ingest/index.ts`

Receives and processes analytics data from external sources.

**Purpose:**
- Analytics data ingestion
- Data validation and processing
- Real-time analytics updates
- Performance tracking

**Request Body:**
```typescript
interface AnalyticsIngestRequest {
  project_id: string;
  metrics: {
    metric_type: 'view' | 'unique_visitor' | 'time_spent' | 'hotspot_click' | 'chatbot_interaction';
    metric_value: number;
    metadata?: Record<string, any>;
  }[];
  timestamp?: string;
}
```

**Response:**
```typescript
interface AnalyticsIngestResponse {
  success: boolean;
  data?: {
    processed_metrics: number;
    project_id: string;
  };
  error?: string;
}
```

**Usage:**
```typescript
const response = await supabase.functions.invoke('analytics_ingest', {
  body: {
    project_id: 'uuid-here',
    metrics: [
      {
        metric_type: 'view',
        metric_value: 1,
        metadata: {
          page: '/tour',
          duration: 120
        }
      }
    ]
  }
});
```

## 🔌 Database API

### Direct Database Access
TourCompanion uses Supabase's auto-generated REST API for direct database access.

**Base URL:** `https://your-project.supabase.co/rest/v1/`

**Authentication:**
```typescript
// Set authorization header
const headers = {
  'Authorization': `Bearer ${supabaseKey}`,
  'apikey': supabaseKey,
  'Content-Type': 'application/json'
};
```

### Common Database Operations

#### Fetch Creator Data
```typescript
// Get creator profile
const { data: creator } = await supabase
  .from('creators')
  .select('*')
  .eq('user_id', userId)
  .single();

// Get creator's clients
const { data: clients } = await supabase
  .from('end_clients')
  .select('*')
  .eq('creator_id', creator.id);
```

#### Fetch Project Data
```typescript
// Get projects with related data
const { data: projects } = await supabase
  .from('projects')
  .select(`
    *,
    end_clients!inner(
      id,
      name,
      company,
      creator_id
    ),
    chatbots(*),
    analytics(*)
  `)
  .eq('end_clients.creator_id', creatorId);
```

#### Create New Project
```typescript
// Create project
const { data: project, error } = await supabase
  .from('projects')
  .insert({
    end_client_id: clientId,
    title: 'New Project',
    description: 'Project description',
    project_type: 'virtual_tour',
    status: 'active'
  })
  .select()
  .single();
```

#### Update Analytics
```typescript
// Track analytics
const { error } = await supabase
  .from('analytics')
  .insert({
    project_id: projectId,
    date: new Date().toISOString().split('T')[0],
    metric_type: 'view',
    metric_value: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    }
  });
```

## 🔄 Real-time Subscriptions

### Supabase Realtime
TourCompanion uses Supabase Realtime for live data updates.

**Setup:**
```typescript
import { supabase } from '@/integrations/supabase/client';

// Subscribe to table changes
const channel = supabase
  .channel('table-changes')
  .on('postgres_changes', {
    event: '*', // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'table_name'
  }, (payload) => {
    console.log('Change received:', payload);
  })
  .subscribe();
```

### Common Subscriptions

#### Lead Notifications
```typescript
// Subscribe to new leads
useEffect(() => {
  const channel = supabase
    .channel('leads')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'leads'
    }, (payload) => {
      setLeads(prev => [payload.new, ...prev]);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

#### Analytics Updates
```typescript
// Subscribe to analytics updates
useEffect(() => {
  const channel = supabase
    .channel('analytics')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'analytics'
    }, (payload) => {
      updateAnalytics(payload.new);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

#### Request Updates
```typescript
// Subscribe to request updates
useEffect(() => {
  const channel = supabase
    .channel('requests')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'requests'
    }, (payload) => {
      updateRequestStatus(payload.new);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

## 🔐 Authentication API

### Supabase Auth
TourCompanion uses Supabase Auth for user authentication.

**Sign Up:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

**Sign In:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

**Sign Out:**
```typescript
const { error } = await supabase.auth.signOut();
```

**Get Current User:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### End Client Authentication
End clients use a mapping table for authentication.

**Create End Client User:**
```typescript
const { data, error } = await supabase
  .from('end_client_users')
  .insert({
    user_id: authUser.id,
    end_client_id: clientId,
    email: clientEmail
  });
```

**Get End Client from User:**
```typescript
const { data: endClientUser } = await supabase
  .from('end_client_users')
  .select(`
    *,
    end_clients(*)
  `)
  .eq('user_id', userId)
  .single();
```

## 📊 Analytics API

### Track User Interactions
```typescript
// Track page view
const trackPageView = async (projectId: string, page: string) => {
  await supabase
    .from('analytics')
    .insert({
      project_id: projectId,
      date: new Date().toISOString().split('T')[0],
      metric_type: 'view',
      metric_value: 1,
      metadata: {
        page,
        timestamp: new Date().toISOString()
      }
    });
};

// Track chatbot interaction
const trackChatbotInteraction = async (projectId: string, interactionType: string) => {
  await supabase
    .from('analytics')
    .insert({
      project_id: projectId,
      date: new Date().toISOString().split('T')[0],
      metric_type: 'chatbot_interaction',
      metric_value: 1,
      metadata: {
        interaction_type: interactionType,
        timestamp: new Date().toISOString()
      }
    });
};
```

### Get Analytics Data
```typescript
// Get project analytics
const getProjectAnalytics = async (projectId: string, dateRange?: { start: string; end: string }) => {
  let query = supabase
    .from('analytics')
    .select('*')
    .eq('project_id', projectId);

  if (dateRange) {
    query = query
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);
  }

  const { data, error } = await query;
  return data;
};
```

## 🗂️ File Storage API

### Supabase Storage
TourCompanion uses Supabase Storage for file management.

**Upload File:**
```typescript
const uploadFile = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('assets')
    .upload(path, file);

  if (error) throw error;
  return data;
};
```

**Get File URL:**
```typescript
const getFileUrl = (path: string) => {
  const { data } = supabase.storage
    .from('assets')
    .getPublicUrl(path);

  return data.publicUrl;
};
```

**Delete File:**
```typescript
const deleteFile = async (path: string) => {
  const { error } = await supabase.storage
    .from('assets')
    .remove([path]);

  if (error) throw error;
};
```

## 🔧 Error Handling

### API Error Response Format
```typescript
interface APIError {
  message: string;
  code?: string;
  details?: any;
  hint?: string;
}
```

### Error Handling Pattern
```typescript
const handleAPICall = async () => {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }
};
```

## 📝 API Best Practices

### Request Optimization
- Use select() to limit returned fields
- Implement pagination for large datasets
- Use filters to reduce data transfer
- Cache frequently accessed data

### Error Handling
- Always check for errors in responses
- Provide user-friendly error messages
- Log errors for debugging
- Implement retry logic for transient failures

### Security
- Use RLS policies for data access control
- Validate input data
- Sanitize user inputs
- Use HTTPS for all API calls

### Performance
- Use database indexes for queries
- Implement connection pooling
- Monitor API response times
- Use real-time subscriptions efficiently

## 💻 Frontend API Usage Examples

### Authentication Endpoints

#### User Registration
```javascript
// Register a new tour creator
const { data, error } = await supabase.auth.signUp({
  email: 'creator@example.com',
  password: 'securepassword123',
  options: {
    data: {
      agency_name: 'My Tour Agency',
      subscription_plan: 'basic'
    }
  }
});
```

#### User Login
```javascript
// Login existing user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'creator@example.com',
  password: 'securepassword123'
});
```

### Project Management Endpoints

#### Create New Project
```javascript
// Create a new project for a client
const { data, error } = await supabase
  .from('projects')
  .insert({
    end_client_id: 'client-uuid',
    title: 'Virtual Tour Project',
    description: 'Complete virtual tour for client',
    project_type: 'virtual_tour',
    status: 'active'
  })
  .select();
```

#### Get Projects for Creator
```javascript
// Get all projects for a creator
const { data, error } = await supabase
  .from('projects')
  .select(`
    *,
    end_clients (
      id,
      name,
      email,
      company
    )
  `)
  .eq('end_clients.creator_id', creatorId);
```

### Analytics Endpoints

#### Record Analytics Event
```javascript
// Record a new analytics event
const { data, error } = await supabase
  .from('analytics')
  .insert({
    project_id: 'project-uuid',
    metric_type: 'view',
    metric_value: 1,
    date: new Date().toISOString().split('T')[0]
  });
```

#### Get Project Analytics
```javascript
// Get analytics for a specific project
const { data, error } = await supabase
  .from('analytics')
  .select('*')
  .eq('project_id', projectId)
  .order('created_at', { ascending: false });
```

### Chatbot Endpoints

#### Create Chatbot
```javascript
// Create a new chatbot for a project
const { data, error } = await supabase
  .from('chatbots')
  .insert({
    project_id: 'project-uuid',
    name: 'Customer Support Bot',
    status: 'active',
    welcome_message: 'Hello! How can I help you?',
    fallback_message: 'I need more information to help you.',
    language: 'en'
  });
```

#### Chat with Bot
```javascript
// Send message to chatbot
const { data, error } = await supabase.functions.invoke('chat_answer', {
  body: {
    message: 'What are your room rates?',
    chatbot_id: 'chatbot-uuid',
    session_id: 'session-uuid'
  }
});
```

### Lead Management Endpoints

#### Capture Lead
```javascript
// Capture a new lead from chatbot interaction
const { data, error } = await supabase
  .from('leads')
  .insert({
    chatbot_id: 'chatbot-uuid',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0123',
    company: 'ABC Corp',
    message: 'Interested in your services',
    status: 'new'
  });
```

#### Get Leads for Project
```javascript
// Get all leads for a project
const { data, error } = await supabase
  .from('leads')
  .select(`
    *,
    chatbots!inner (
      project_id
    )
  `)
  .eq('chatbots.project_id', projectId)
  .order('created_at', { ascending: false });
```

### Asset Management Endpoints

#### Upload Asset
```javascript
// Upload a new asset
const { data, error } = await supabase
  .from('assets')
  .insert({
    project_id: 'project-uuid',
    creator_id: 'creator-uuid',
    filename: 'image-001.jpg',
    original_filename: 'hotel-lobby.jpg',
    file_type: 'image/jpeg',
    file_size: 2048576,
    file_url: 'https://storage.example.com/image-001.jpg',
    thumbnail_url: 'https://storage.example.com/thumbs/image-001.jpg'
  });
```

#### Get Assets for Project
```javascript
// Get all assets for a project
const { data, error } = await supabase
  .from('assets')
  .select('*')
  .eq('project_id', projectId)
  .order('created_at', { ascending: false });
```

### Request Management Endpoints

#### Submit Request
```javascript
// Submit a new request
const { data, error } = await supabase
  .from('requests')
  .insert({
    project_id: 'project-uuid',
    end_client_id: 'client-uuid',
    title: 'Update Room Photos',
    description: 'Need to update photos for renovated rooms',
    request_type: 'content_change',
    priority: 'high',
    status: 'pending'
  });
```

#### Get Requests for Project
```javascript
// Get all requests for a project
const { data, error } = await supabase
  .from('requests')
  .select('*')
  .eq('project_id', projectId)
  .order('created_at', { ascending: false });
```

## 🔄 Real-time Subscriptions

### Project Updates
```javascript
// Subscribe to project changes
const subscription = supabase
  .channel('project-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'projects',
    filter: `end_client_id=eq.${clientId}`
  }, (payload) => {
    console.log('Project updated:', payload);
  })
  .subscribe();
```

### Analytics Updates
```javascript
// Subscribe to analytics changes
const subscription = supabase
  .channel('analytics-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'analytics',
    filter: `project_id=eq.${projectId}`
  }, (payload) => {
    console.log('New analytics data:', payload);
  })
  .subscribe();
```

### Lead Updates
```javascript
// Subscribe to new leads
const subscription = supabase
  .channel('lead-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'leads',
    filter: `chatbot_id=eq.${chatbotId}`
  }, (payload) => {
    console.log('New lead captured:', payload);
  })
  .subscribe();
```

## 🛡️ Row-Level Security (RLS) Examples

### Creator Access Pattern
```javascript
// Creators can only access their own data
const { data, error } = await supabase
  .from('projects')
  .select(`
    *,
    end_clients!inner (
      creator_id
    )
  `)
  .eq('end_clients.creator_id', currentUser.creator_id);
```

### End Client Access Pattern
```javascript
// End clients can only access their own project data
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('end_client_id', currentUser.end_client_id);
```

## 🔧 Error Handling Examples

### Standard Error Handling
```javascript
const handleApiCall = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*');
    
    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    // Handle error appropriately
    throw error;
  }
};
```

### Authentication Error Handling
```javascript
const handleAuthError = (error) => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Please check your email and password.';
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link.';
    case 'Too many requests':
      return 'Too many login attempts. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
```

## 📊 Data Transformation Examples

### Transform Analytics Data
```javascript
const transformAnalytics = (rawData) => {
  return rawData.reduce((acc, item) => {
    if (!acc[item.metric_type]) {
      acc[item.metric_type] = 0;
    }
    acc[item.metric_type] += item.metric_value;
    return acc;
  }, {});
};
```

### Transform Project Data
```javascript
const transformProjectData = (projects) => {
  return projects.map(project => ({
    id: project.id,
    title: project.title,
    status: project.status,
    clientName: project.end_clients?.name || 'Unknown',
    clientEmail: project.end_clients?.email || '',
    createdAt: new Date(project.created_at).toLocaleDateString(),
    updatedAt: new Date(project.updated_at).toLocaleDateString()
  }));
};
```

This API documentation provides comprehensive coverage of all available endpoints and integration patterns for the TourCompanion platform.
