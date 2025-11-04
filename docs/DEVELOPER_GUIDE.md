# Developer Guide

## 🚀 Prerequisites & Setup

### Required Software
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase CLI** (optional, for local development)

### Environment Variables
Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For local development
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Getting Supabase Credentials
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon public key

## 🏃‍♂️ Running Locally

### 1. Clone and Install
```bash
git clone <repository-url>
cd dashboard
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Shadcn/UI components
│   ├── dashboard/       # Dashboard-specific components
│   └── client-portal/   # Client portal components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
├── lib/                 # Utility functions
├── pages/               # Page components
├── services/            # API services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── validators/          # Form validation schemas
```

## 🔧 Key Hooks & Utilities

### useCreatorDashboard
Main hook for fetching creator dashboard data.

```typescript
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';

const MyComponent = () => {
  const { 
    creator, 
    clients, 
    projects, 
    chatbots, 
    leads, 
    analytics, 
    requests, 
    assets,
    isLoading, 
    error, 
    refreshData 
  } = useCreatorDashboard(user?.id || '');

  // Use the data...
};
```

**Returns:**
- `creator`: Creator profile data
- `clients`: Array of end clients
- `projects`: Array of projects
- `chatbots`: Array of chatbots
- `leads`: Array of captured leads
- `analytics`: Array of analytics data
- `requests`: Array of client requests
- `assets`: Array of media assets
- `isLoading`: Loading state
- `error`: Error message if any
- `refreshData`: Function to refresh all data

### useAuth
Authentication hook for user management.

```typescript
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, signIn, signOut, signUp } = useAuth();

  // Use authentication...
};
```

### useToast
Toast notification hook.

```typescript
import { useToast } from '@/hooks/use-toast';

const MyComponent = () => {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Operation completed successfully",
    });
  };
};
```

## 🎨 Component Development

### Component Structure
Follow this structure for new components:

```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      // Perform action
      await performAction();
      toast({ title: "Success", description: "Action completed" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Action failed", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAction} disabled={loading}>
          {loading ? "Loading..." : "Action"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MyComponent;
```

### Props Interface Guidelines
- Always define TypeScript interfaces for props
- Use optional props with `?` when appropriate
- Include JSDoc comments for complex props
- Use descriptive prop names

### State Management
- Use `useState` for local component state
- Use `useEffect` for side effects
- Use custom hooks for shared logic
- Avoid prop drilling - use context when needed

## 🗄️ Database Integration

### Supabase Client
The Supabase client is configured in `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Database Queries
Use the Supabase client for database operations:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Fetch data
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'active');

// Insert data
const { data, error } = await supabase
  .from('projects')
  .insert({
    title: 'New Project',
    description: 'Project description',
    end_client_id: clientId
  });

// Update data
const { data, error } = await supabase
  .from('projects')
  .update({ status: 'inactive' })
  .eq('id', projectId);

// Delete data
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);
```

### Real-time Subscriptions
Set up real-time subscriptions for live updates:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('projects')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'projects'
    }, (payload) => {
      // Handle real-time updates
      console.log('Project updated:', payload);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

## 🎯 Key Components

### ClientManagement
Manages end clients for tour creators.

**Location:** `src/components/ClientManagement.tsx`

**Key Features:**
- Lists all clients with active projects
- Filters clients by status and subscription
- Shows client analytics and project counts
- Handles client selection and details

**Props:**
```typescript
interface ClientManagementProps {
  onClientSelect?: (client: Client) => void;
}
```

### TourVirtuali
Main projects management component.

**Location:** `src/components/TourVirtuali.tsx`

**Key Features:**
- Displays all client projects
- Project creation and management
- Analytics and chatbot integration
- Project sharing and portal access

### MediaLibrary
File management for creators.

**Location:** `src/components/MediaLibrary.tsx`

**Key Features:**
- Upload and organize media files
- Share media with specific clients
- File type detection and previews
- Asset metadata management

### ChatbotRequests
Chatbot request management system.

**Location:** `src/components/ChatbotRequests.tsx`

**Key Features:**
- Submit chatbot customization requests
- Track request status
- File uploads for chatbot training
- Integration with admin dashboard

## 🧪 Testing Strategy

### Unit Tests
Test individual components and hooks:

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders component with title', () => {
  render(<MyComponent title="Test Title" />);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
});
```

### Integration Tests
Test component interactions and data flow:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('handles button click', async () => {
  const mockAction = jest.fn();
  render(<MyComponent onAction={mockAction} />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(mockAction).toHaveBeenCalled();
});
```

### E2E Tests
Test complete user workflows:

```typescript
import { test, expect } from '@playwright/test';

test('creator can create new project', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="create-project"]');
  await page.fill('[data-testid="project-title"]', 'Test Project');
  await page.click('[data-testid="submit"]');
  
  await expect(page.locator('text=Test Project')).toBeVisible();
});
```

## 📝 Code Style Guidelines

### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all props and data structures
- Use type assertions sparingly
- Prefer `interface` over `type` for object shapes

### React
- Use functional components with hooks
- Use `React.FC` type for component definitions
- Destructure props in function parameters
- Use meaningful variable and function names

### CSS/Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use CSS variables for consistent theming
- Avoid inline styles unless necessary

### File Naming
- Use PascalCase for component files: `MyComponent.tsx`
- Use camelCase for utility files: `myUtility.ts`
- Use kebab-case for page files: `my-page.tsx`

## 🚀 Deployment

### Build Process
```bash
npm run build
```

This creates a `dist/` directory with optimized production files.

### Netlify Deployment
The project is configured for Netlify deployment:

1. **Build Command:** `npm run build`
2. **Publish Directory:** `dist`
3. **Environment Variables:** Set in Netlify dashboard

### Environment Setup
Set these environment variables in production:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🐛 Debugging

### Common Issues

#### Database Connection Issues
- Check Supabase URL and API key
- Verify RLS policies are correctly configured
- Check browser console for CORS errors

#### Build Failures
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`
- Verify all imports are correct

#### Real-time Issues
- Check Supabase real-time is enabled
- Verify channel subscriptions are properly cleaned up
- Check for memory leaks in useEffect hooks

### Debug Tools
- **React Developer Tools** for component debugging
- **Supabase Dashboard** for database inspection
- **Browser DevTools** for network and console debugging
- **TypeScript Language Server** for type checking

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn/UI Components](https://ui.shadcn.com/)

## 🤝 Contributing

### Development Workflow
1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test thoroughly
3. Update documentation if needed
4. Create a pull request with clear description
5. Address review feedback
6. Merge after approval

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] TypeScript types are properly defined
- [ ] Components are properly tested
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Accessibility considerations are met

This guide should help you get started with development on the TourCompanion platform. For specific questions, refer to the component documentation or create an issue in the repository.



