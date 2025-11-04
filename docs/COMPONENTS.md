# Components Documentation

## 🏗️ Component Hierarchy

```
App
├── Layout
│   ├── Navigation
│   └── Main Content
│       ├── Index (Creator Dashboard)
│       │   ├── TourVirtuali (Projects)
│       │   ├── ClientManagement
│       │   ├── MediaLibrary
│       │   ├── ChatbotRequests
│       │   └── AnalyticsKPI
│       ├── ClientPortal (End Client Dashboard)
│       │   ├── ClientPortalAnalytics
│       │   ├── ClientPortalMedia
│       │   └── ClientPortalRequests
│       └── AdminDashboard
└── Shared Components
    ├── NewProjectModal
    ├── ShareClientPortal
    └── UI Components (Shadcn/UI)
```

## 🎯 Key Components

### useCreatorDashboard Hook
**Location:** `src/hooks/useCreatorDashboard.ts`

Central hook for fetching all creator dashboard data.

```typescript
interface CreatorDashboardData {
  creator: Creator | null;
  clients: EndClient[];
  projects: Project[];
  chatbots: Chatbot[];
  leads: Lead[];
  analytics: Analytics[];
  requests: Request[];
  assets: Asset[];
  stats: {
    totalClients: number;
    totalProjects: number;
    totalChatbots: number;
    totalLeads: number;
    totalViews: number;
    activeProjects: number;
  };
  isLoading: boolean;
  error: string | null;
}

export const useCreatorDashboard = (userId: string | null) => {
  // Returns all creator dashboard data
};
```

**Key Features:**
- Fetches all related data in parallel
- Handles loading and error states
- Provides refresh functionality
- Filters data based on creator permissions

### ClientManagement Component
**Location:** `src/components/ClientManagement.tsx`

Manages end clients for tour creators.

```typescript
interface ClientManagementProps {
  onClientSelect?: (client: Client) => void;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  website?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  subscription: 'basic' | 'premium' | 'enterprise';
  created_at: string;
  last_activity: string;
  projects: number;
  analytics?: {
    totalViews: number;
    uniqueVisitors: number;
    avgEngagementTime: string;
    totalLeadsGenerated: number;
    conversionRate: number;
    avgSatisfaction: number;
  };
  recentActivity?: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}
```

**Key Features:**
- Lists clients with active projects only
- Search and filter functionality
- Client analytics display
- Status and subscription management
- Client selection and details view

**State Management:**
- Uses `useCreatorDashboard` for data
- Local state for search/filter terms
- Selected client state for details view

### TourVirtuali Component
**Location:** `src/components/TourVirtuali.tsx`

Main projects management component for creators.

```typescript
interface TourVirtualiProps {
  onPageChange?: (page: string) => void;
  onCreateRequest?: (requestData: any) => void;
  onClientClick?: (client: any) => void;
}
```

**Key Features:**
- Project creation and management
- Client project cards with analytics
- Project sharing and portal access
- Chatbot integration
- Project deletion with confirmation

**State Management:**
- Uses `useCreatorDashboard` for data
- Local state for modals and selections
- Project transformation for UI display

**Child Components:**
- `ClientProjectCard` - Individual project display
- `NewProjectModal` - Project creation form
- `ShareClientPortal` - Portal sharing interface

### MediaLibrary Component
**Location:** `src/components/MediaLibrary.tsx`

File management system for creators.

```typescript
interface MediaLibraryProps {
  // No specific props - uses global state
}
```

**Key Features:**
- Media upload and organization
- Client-specific media sharing
- File type detection and previews
- Asset metadata management
- Real-time media count updates

**State Management:**
- Uses `useCreatorDashboard` for assets data
- Local state for upload dialogs
- Client filtering for media sharing

**Key Functions:**
- `handleSendMedia()` - Sends media to selected clients
- `getAssetsForClient()` - Filters assets by client
- `getMediaCountForClient()` - Gets media count for client

### ChatbotRequests Component
**Location:** `src/components/ChatbotRequests.tsx`

Chatbot request management system.

```typescript
interface ChatbotRequestsProps {
  // No specific props - uses global state
}
```

**Key Features:**
- Submit chatbot customization requests
- Track request status and progress
- File uploads for chatbot training
- Integration with admin dashboard
- Request history and details

**State Management:**
- Uses `useCreatorDashboard` for projects data
- Local state for request forms and modals
- Request status tracking

**Child Components:**
- `ChatbotRequestForm` - Request submission form
- Project selector for new requests

### ClientPortal Component
**Location:** `src/pages/ClientPortal.tsx`

End client dashboard for viewing their data.

```typescript
interface ClientPortalProps {
  // No specific props - uses URL params
}
```

**Key Features:**
- Project overview and analytics
- Media library access
- Request submission system
- Chatbot interaction
- Real-time data updates

**State Management:**
- Uses `useClientPortalRealtime` for data
- Tab-based navigation
- Real-time subscription management

**Child Components:**
- `ClientPortalAnalytics` - Analytics display
- `ClientPortalMedia` - Media library
- `ClientPortalRequests` - Request system

### ClientPortalAnalytics Component
**Location:** `src/components/client-portal/ClientPortalAnalytics.tsx`

Analytics display for end clients.

```typescript
interface ClientPortalAnalyticsProps {
  projectId: string;
  analytics: Analytics[];
}
```

**Key Features:**
- KPI cards with key metrics
- Chart visualizations
- Time-based filtering
- Performance indicators

### ClientPortalMedia Component
**Location:** `src/components/client-portal/ClientPortalMedia.tsx`

Media library for end clients.

```typescript
interface ClientPortalMediaProps {
  projectId: string;
  assets: Asset[];
}
```

**Key Features:**
- Media file display and preview
- File type detection
- Download functionality
- Organized by categories

### ClientPortalRequests Component
**Location:** `src/components/client-portal/ClientPortalRequests.tsx`

Request system for end clients.

```typescript
interface ClientPortalRequestsProps {
  projectId: string;
  requests: Request[];
}
```

**Key Features:**
- Request submission form
- Request history and status
- File attachments
- Priority and type selection

## 🔧 Shared Components

### NewProjectModal Component
**Location:** `src/components/NewProjectModal.tsx`

Project creation modal for creators.

```typescript
interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}
```

**Key Features:**
- Multi-step project creation
- Client selection and creation
- Project configuration
- Chatbot setup guidance
- Form validation

**Steps:**
1. Client Information
2. Project Setup
3. Completion with guidance

### ShareClientPortal Component
**Location:** `src/components/ShareClientPortal.tsx`

Portal sharing interface for creators.

```typescript
interface ShareClientPortalProps {
  projectId: string;
  projectTitle: string;
  clientName: string;
  clientEmail: string;
}
```

**Key Features:**
- Portal URL generation
- Copy to clipboard functionality
- Email sharing option
- Client information display

### ClientProjectCard Component
**Location:** `src/components/ClientProjectCard.tsx`

Individual project card display.

```typescript
interface ClientProjectCardProps {
  project: any;
  onViewDetails?: (project: any) => void;
  onManageProject?: (project: any) => void;
  onEditProject?: (project: any) => void;
  onDeleteProject?: (project: any) => void;
  onSharePortal?: (project: any) => void;
}
```

**Key Features:**
- Project information display
- Analytics metrics
- Action buttons
- Status indicators
- Responsive design

## 🎨 UI Components (Shadcn/UI)

### Card Components
- `Card` - Base card container
- `CardHeader` - Card header section
- `CardTitle` - Card title
- `CardDescription` - Card description
- `CardContent` - Card content area

### Form Components
- `Button` - Action buttons with variants
- `Input` - Text input fields
- `Select` - Dropdown selections
- `Textarea` - Multi-line text input
- `Checkbox` - Checkbox inputs
- `RadioGroup` - Radio button groups

### Feedback Components
- `Badge` - Status and category badges
- `Alert` - Alert messages
- `Toast` - Notification toasts
- `Progress` - Progress indicators
- `Skeleton` - Loading placeholders

### Navigation Components
- `Tabs` - Tab navigation
- `TabsList` - Tab list container
- `TabsTrigger` - Individual tab triggers
- `TabsContent` - Tab content areas

### Layout Components
- `Dialog` - Modal dialogs
- `Sheet` - Slide-out panels
- `DropdownMenu` - Dropdown menus
- `Popover` - Popover content
- `Tooltip` - Hover tooltips

## 🔄 State Management Patterns

### Data Fetching Pattern
```typescript
const MyComponent = () => {
  const { data, isLoading, error, refreshData } = useCreatorDashboard(userId);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <DataDisplay data={data} onRefresh={refreshData} />;
};
```

### Form State Pattern
```typescript
const MyForm = () => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await submitData(formData);
      toast({ title: "Success", description: "Data saved" });
    } catch (error) {
      toast({ title: "Error", description: "Save failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Modal State Pattern
```typescript
const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const handleOpenModal = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };
  
  return (
    <>
      <Button onClick={() => handleOpenModal(item)}>Open</Button>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalContent item={selectedItem} />
      </Modal>
    </>
  );
};
```

## 🎯 Component Best Practices

### Props Interface
- Always define TypeScript interfaces
- Use optional props with `?` when appropriate
- Include JSDoc comments for complex props
- Use descriptive prop names

### Error Handling
- Implement loading states
- Handle error conditions gracefully
- Provide user-friendly error messages
- Use toast notifications for feedback

### Performance
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Avoid unnecessary re-renders
- Use lazy loading for large components

### Accessibility
- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation
- Provide alt text for images

### Responsive Design
- Use Tailwind responsive classes
- Test on multiple screen sizes
- Implement mobile-first design
- Use flexible layouts

## 🔧 Component Development Workflow

### 1. Planning
- Define component purpose and scope
- Identify required props and state
- Plan component structure and layout
- Consider accessibility requirements

### 2. Implementation
- Create TypeScript interface for props
- Implement component logic
- Add proper error handling
- Include loading states

### 3. Styling
- Use Tailwind CSS classes
- Ensure responsive design
- Follow design system guidelines
- Test on multiple devices

### 4. Testing
- Write unit tests for component logic
- Test user interactions
- Verify accessibility compliance
- Test error conditions

### 5. Documentation
- Add JSDoc comments
- Update component documentation
- Include usage examples
- Document prop interfaces

## 💻 Component Usage Examples

### Dashboard Components

#### AnalyticsKPI Component
```tsx
import { AnalyticsKPI } from '@/components/AnalyticsKPI';

// Basic usage
<AnalyticsKPI />

// The component automatically fetches data using useCreatorDashboard hook
// No props required - it's self-contained
```

#### ClientManagement Component
```tsx
import { ClientManagement } from '@/components/ClientManagement';

// Basic usage with callback
<ClientManagement onClientSelect={(client) => {
  console.log('Selected client:', client);
  // Handle client selection
}} />

// The component provides:
// - Client list with filtering
// - Client details view
// - Recent activity for selected client
// - Analytics overview
```

#### MediaLibrary Component
```tsx
import { MediaLibrary } from '@/components/MediaLibrary';

// Basic usage
<MediaLibrary />

// Features:
// - Asset upload and management
// - Client sharing functionality
// - File type filtering
// - Real-time updates
```

### Project Components

#### TourVirtuali Component
```tsx
import { TourVirtuali } from '@/components/TourVirtuali';

// Basic usage
<TourVirtuali />

// Features:
// - Project grid display
// - Project creation modal
// - Project sharing functionality
// - Real-time project updates
```

#### NewProjectModal Component
```tsx
import { NewProjectModal } from '@/components/NewProjectModal';
import { useState } from 'react';

function ProjectCreator() {
  const [isOpen, setIsOpen] = useState(false);

  const handleProjectCreated = (project) => {
    console.log('New project created:', project);
    setIsOpen(false);
    // Refresh project list or update state
  };

  return (
    <NewProjectModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onProjectCreated={handleProjectCreated}
    />
  );
}
```

### Client Portal Components

#### ClientDashboard Component
```tsx
import { ClientDashboard } from '@/pages/ClientDashboard';

// Usage in routing
<Route path="/client/:projectId" element={<ClientDashboard />} />

// Features:
// - Project overview
// - Analytics display
// - Media library
// - Request submission
// - Mobile-responsive design
```

#### ClientPortalAnalytics Component
```tsx
import { ClientPortalAnalytics } from '@/components/client-portal/ClientPortalAnalytics';

// Usage with project ID
<ClientPortalAnalytics projectId="project-uuid" />

// Features:
// - KPI cards display
// - Chart visualizations
// - Real-time data updates
// - Mobile-optimized layout
```

### Chatbot Components

#### ChatbotRequests Component
```tsx
import { ChatbotRequests } from '@/components/ChatbotRequests';

// Basic usage
<ChatbotRequests />

// Features:
// - Existing chatbots display
// - Chatbot request management
// - Tab-based interface
// - Real-time updates
```

#### ChatbotRequestForm Component
```tsx
import { ChatbotRequestForm } from '@/components/ChatbotRequestForm';
import { useState } from 'react';

function RequestCreator() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleSubmit = (requestData) => {
    console.log('Request submitted:', requestData);
    setIsOpen(false);
    // Handle request submission
  };

  return (
    <ChatbotRequestForm
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmit}
      selectedProject={selectedProject}
    />
  );
}
```

### Utility Components

#### RecentActivity Component
```tsx
import { RecentActivity } from '@/components/RecentActivity';
import { useRecentActivity } from '@/hooks/useRecentActivity';

function ActivityDisplay() {
  const { activities, loading, error, refresh } = useRecentActivity({
    clientId: 'client-uuid',
    limit: 10
  });

  return (
    <RecentActivity
      activities={activities}
      loading={loading}
      error={error}
      onRefresh={refresh}
      title="Recent Activity"
      description="Latest updates and interactions"
      showStats={true}
      maxItems={8}
    />
  );
}
```

#### MetricCard Component
```tsx
import { MetricCard } from '@/components/MetricCard';

// Basic usage
<MetricCard
  title="Total Views"
  value="1,234"
  change="+12%"
  changeType="positive"
  icon="Eye"
/>

// With loading state
<MetricCard
  title="Total Views"
  value={loading ? "..." : "1,234"}
  change="+12%"
  changeType="positive"
  icon="Eye"
  loading={loading}
/>
```

### Form Components

#### Project Creation Form
```tsx
import { NewProjectModal } from '@/components/NewProjectModal';

// Complete project creation flow
function ProjectCreation() {
  const [isOpen, setIsOpen] = useState(false);

  const handleProjectCreated = (project) => {
    // Project created successfully
    console.log('Project:', project);
    // Refresh data or update UI
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Create New Project
      </Button>
      
      <NewProjectModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
}
```

#### Request Submission Form
```tsx
import { ClientPortalRequests } from '@/components/client-portal/ClientPortalRequests';

// In client portal
<ClientPortalRequests projectId="project-uuid" />

// Features:
// - Request submission form
// - Request history display
// - File attachment support
// - Priority selection
```

### Layout Components

#### Layout Component
```tsx
import { Layout } from '@/components/Layout';

// Main application layout
function App() {
  return (
    <Layout>
      {/* Your page content */}
    </Layout>
  );
}

// Features:
// - Navigation sidebar
// - Mobile-responsive design
// - User authentication state
// - Active page highlighting
```

#### DashboardHeader Component
```tsx
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

// Usage in dashboard pages
<DashboardHeader
  title="Projects"
  description="Manage your virtual tour projects"
  action={
    <Button onClick={handleCreateProject}>
      Create Project
    </Button>
  }
/>
```

### Custom Hooks Usage

#### useCreatorDashboard Hook
```tsx
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';

function Dashboard() {
  const {
    projects,
    clients,
    chatbots,
    analytics,
    assets,
    requests,
    isLoading,
    error,
    refreshData
  } = useCreatorDashboard();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Projects: {projects.length}</p>
      <p>Clients: {clients.length}</p>
      <Button onClick={refreshData}>Refresh</Button>
    </div>
  );
}
```

#### useRecentActivity Hook
```tsx
import { useRecentActivity } from '@/hooks/useRecentActivity';

function ActivityFeed() {
  const { activities, loading, error, stats, refresh } = useRecentActivity({
    clientId: 'client-uuid',
    projectId: 'project-uuid',
    creatorId: 'creator-uuid',
    limit: 20,
    filters: {
      types: ['project_created', 'lead_captured'],
      priority: ['high', 'medium']
    }
  });

  return (
    <div>
      <h2>Activity Feed</h2>
      <p>Total: {stats.totalActivities}</p>
      <p>Last 24h: {stats.newActivitiesLast24h}</p>
      
      {activities.map(activity => (
        <div key={activity.id}>
          {activity.description}
        </div>
      ))}
    </div>
  );
}
```

### Error Handling Patterns

#### Component Error Boundaries
```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

#### API Error Handling
```tsx
import { toast } from '@/hooks/use-toast';

async function handleApiCall() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*');
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }
}
```

This component documentation provides a comprehensive overview of the TourCompanion platform's component architecture and development patterns.
