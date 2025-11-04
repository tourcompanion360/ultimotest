# Troubleshooting Guide

## 🚨 Common Issues and Solutions

This guide covers the most common issues encountered when developing, deploying, or using the TourCompanion platform.

## 🔧 Development Issues

### Build Failures

#### Error: "Cannot resolve module"
**Symptoms:**
- Build fails with module resolution errors
- Import statements not working
- TypeScript compilation errors

**Solutions:**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check import paths
# Ensure imports use correct relative paths or alias paths
import { Component } from '@/components/Component'; // ✅ Correct
import { Component } from './Component'; // ✅ Correct
import { Component } from 'Component'; // ❌ Incorrect
```

#### Error: "Unterminated regular expression"
**Symptoms:**
- Build fails with regex syntax errors
- JavaScript parsing errors
- Component compilation issues

**Solutions:**
```bash
# Check for syntax errors in components
# Look for unclosed regex patterns
# Verify JSX syntax is correct
# Check for missing closing tags

# Example of common syntax errors:
const pattern = /[a-z/; // ❌ Missing closing bracket
const pattern = /[a-z]/; // ✅ Correct
```

#### Error: "Expected '}' but found ';'"
**Symptoms:**
- Build fails with syntax errors
- Missing closing braces
- Incorrect JSX structure

**Solutions:**
```bash
# Check component structure
# Verify all braces are properly closed
# Check JSX syntax
# Look for missing return statements

# Example of common issues:
const Component = () => {
  return (
    <div>
      <p>Content</p>
    </div>; // ❌ Extra semicolon
  );
};

const Component = () => {
  return (
    <div>
      <p>Content</p>
    </div> // ✅ Correct
  );
};
```

### Database Connection Issues

#### Error: "Failed to fetch"
**Symptoms:**
- Database queries fail
- Authentication errors
- Network connection issues

**Solutions:**
```typescript
// Check Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verify environment variables are set
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey);

// Check network connectivity
fetch(supabaseUrl)
  .then(response => console.log('Connection OK:', response.status))
  .catch(error => console.error('Connection Failed:', error));
```

#### Error: "Row Level Security policy violation"
**Symptoms:**
- Database queries return empty results
- Access denied errors
- RLS policy violations

**Solutions:**
```sql
-- Check RLS policies are enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verify user authentication
SELECT auth.uid();

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Authentication Issues

#### Error: "User not authenticated"
**Symptoms:**
- Login fails
- User session not found
- Authentication state issues

**Solutions:**
```typescript
// Check authentication state
const { data: { user }, error } = await supabase.auth.getUser();

if (error) {
  console.error('Auth error:', error);
  // Handle authentication error
}

if (!user) {
  console.log('No user logged in');
  // Redirect to login
}

// Check user session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

#### Error: "Invalid JWT token"
**Symptoms:**
- Token validation fails
- Session expired
- Authentication errors

**Solutions:**
```typescript
// Refresh session
const { data, error } = await supabase.auth.refreshSession();

if (error) {
  console.error('Session refresh failed:', error);
  // Redirect to login
}

// Check token expiration
const token = session?.access_token;
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiration = new Date(payload.exp * 1000);
  console.log('Token expires:', expiration);
}
```

## 🚀 Deployment Issues

### Netlify Deployment Failures

#### Error: "Build failed"
**Symptoms:**
- Netlify build fails
- Deployment errors
- Build timeout

**Solutions:**
```bash
# Check build locally
npm run build

# Verify build output
ls -la dist/

# Check for build errors
npm run build 2>&1 | tee build.log

# Common fixes:
# 1. Update Node.js version in netlify.toml
# 2. Clear build cache in Netlify dashboard
# 3. Check environment variables
# 4. Verify package.json scripts
```

#### Error: "Environment variables not found"
**Symptoms:**
- Build fails with missing env vars
- Runtime errors for missing config
- Supabase connection issues

**Solutions:**
```bash
# Check environment variables in Netlify
# Go to Site settings → Environment variables
# Ensure these are set:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY

# Verify in build logs
echo "Supabase URL: $VITE_SUPABASE_URL"
echo "Supabase Key: $VITE_SUPABASE_ANON_KEY"
```

### Database Migration Issues

#### Error: "Migration failed"
**Symptoms:**
- Database schema not updated
- Migration errors
- RLS policy issues

**Solutions:**
```bash
# Check migration status
supabase migration list

# Apply migrations manually
supabase db push

# Check database connection
supabase db ping

# Verify RLS policies
supabase db diff
```

## 🔄 Real-time Issues

### Real-time Subscriptions Not Working

#### Error: "Channel subscription failed"
**Symptoms:**
- Real-time updates not received
- Subscription errors
- Connection issues

**Solutions:**
```typescript
// Check subscription setup
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_name'
    }, (payload) => {
      console.log('Change received:', payload);
    })
    .subscribe();

  // Verify subscription status
  console.log('Channel status:', channel.state);

  return () => supabase.removeChannel(channel);
}, []);

// Check real-time is enabled in Supabase
// Go to Database → Replication → Enable real-time
```

#### Error: "Real-time connection lost"
**Symptoms:**
- Intermittent connection issues
- Updates stop working
- Network connectivity problems

**Solutions:**
```typescript
// Implement reconnection logic
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_name'
    }, (payload) => {
      console.log('Change received:', payload);
    })
    .subscribe((status) => {
      console.log('Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Subscription error');
        // Implement retry logic
      }
    });

  return () => supabase.removeChannel(channel);
}, []);
```

## 📊 Data Issues

### Client Data Not Showing

#### Error: "No clients found"
**Symptoms:**
- Client list is empty
- Client data not loading
- RLS policy issues

**Solutions:**
```typescript
// Check client data fetching
const { data: clients, error } = await supabase
  .from('end_clients')
  .select('*')
  .eq('creator_id', creatorId);

if (error) {
  console.error('Client fetch error:', error);
}

// Verify creator ID
const { data: creator } = await supabase
  .from('creators')
  .select('id')
  .eq('user_id', userId)
  .single();

console.log('Creator ID:', creator?.id);
```

#### Error: "Projects not loading"
**Symptoms:**
- Project list is empty
- Project data not found
- Foreign key issues

**Solutions:**
```typescript
// Check project data fetching
const { data: projects, error } = await supabase
  .from('projects')
  .select(`
    *,
    end_clients!inner(
      id,
      name,
      creator_id
    )
  `)
  .eq('end_clients.creator_id', creatorId);

if (error) {
  console.error('Project fetch error:', error);
}

// Verify project relationships
console.log('Projects:', projects);
```

### Analytics Data Issues

#### Error: "Analytics not updating"
**Symptoms:**
- Analytics data not refreshing
- Metrics not calculating
- Real-time updates not working

**Solutions:**
```typescript
// Check analytics data fetching
const { data: analytics, error } = await supabase
  .from('analytics')
  .select('*')
  .eq('project_id', projectId);

if (error) {
  console.error('Analytics fetch error:', error);
}

// Verify analytics tracking
const trackAnalytics = async (projectId: string, metricType: string) => {
  const { error } = await supabase
    .from('analytics')
    .insert({
      project_id: projectId,
      date: new Date().toISOString().split('T')[0],
      metric_type: metricType,
      metric_value: 1
    });

  if (error) {
    console.error('Analytics tracking error:', error);
  }
};
```

## 🎨 UI Issues

### Component Rendering Issues

#### Error: "Component not rendering"
**Symptoms:**
- Components not displaying
- Blank screens
- Rendering errors

**Solutions:**
```typescript
// Check component structure
const MyComponent = () => {
  // Verify component logic
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check data fetching
    fetchData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Check conditional rendering
  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

#### Error: "Styling not applied"
**Symptoms:**
- CSS not loading
- Styling not applied
- Tailwind classes not working

**Solutions:**
```bash
# Check Tailwind configuration
# Verify tailwind.config.ts is correct
# Check CSS imports in main.tsx

# Common fixes:
# 1. Restart development server
# 2. Clear browser cache
# 3. Check Tailwind classes are correct
# 4. Verify CSS build process
```

### Mobile Responsiveness Issues

#### Error: "Mobile layout broken"
**Symptoms:**
- Layout issues on mobile
- Components not responsive
- Touch interactions not working

**Solutions:**
```typescript
// Check responsive classes
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2">
    {/* Content */}
  </div>
</div>

// Verify mobile-first approach
// Use Tailwind responsive prefixes:
// sm: (640px+)
// md: (768px+)
// lg: (1024px+)
// xl: (1280px+)
```

## 🔍 Debugging Tools

### Browser DevTools
```typescript
// Console logging
console.log('Debug info:', data);
console.error('Error:', error);
console.warn('Warning:', warning);

// Performance monitoring
const startTime = performance.now();
// ... operation
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime} milliseconds`);

// Network monitoring
// Check Network tab for failed requests
// Verify API responses
// Check for CORS issues
```

### Supabase Dashboard
```sql
-- Check database status
SELECT * FROM pg_stat_activity;

-- Verify RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check table data
SELECT COUNT(*) FROM public.creators;
SELECT COUNT(*) FROM public.end_clients;
SELECT COUNT(*) FROM public.projects;

-- Monitor real-time
-- Go to Database → Replication
-- Check real-time status
-- Monitor subscription activity
```

### React DevTools
```typescript
// Component debugging
// Use React DevTools browser extension
// Check component props and state
// Monitor re-renders
// Debug component hierarchy

// State debugging
const [state, setState] = useState(initialState);
console.log('Current state:', state);

// Effect debugging
useEffect(() => {
  console.log('Effect running:', dependency);
  // Effect logic
}, [dependency]);
```

## 🚨 Emergency Procedures

### Application Completely Down
1. **Check Netlify Status**
   - Go to [Netlify Status Page](https://www.netlifystatus.com/)
   - Verify service availability

2. **Check Environment Variables**
   - Verify Supabase URL and API key
   - Check for typos or missing variables

3. **Rollback Deployment**
   - Go to Netlify dashboard
   - Use deploy history to rollback
   - Verify previous version works

4. **Check Database**
   - Verify Supabase service status
   - Check database connectivity
   - Verify RLS policies

### Database Issues
1. **Check Supabase Status**
   - Go to [Supabase Status Page](https://status.supabase.com/)
   - Verify service availability

2. **Verify Database Connection**
   ```bash
   supabase db ping
   ```

3. **Check Migration Status**
   ```bash
   supabase migration list
   supabase db diff
   ```

4. **Contact Support**
   - Supabase support for database issues
   - Check community forums
   - Review documentation

### Security Issues
1. **Rotate API Keys**
   - Generate new Supabase API keys
   - Update environment variables
   - Redeploy application

2. **Check Access Logs**
   - Review Supabase access logs
   - Check for suspicious activity
   - Monitor authentication attempts

3. **Review RLS Policies**
   - Verify RLS is enabled
   - Check policy correctness
   - Test data access

## 📞 Getting Help

### Documentation Resources
- [TourCompanion Documentation](../README.md)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community Support
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [React Community](https://react.dev/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

### Professional Support
- [Supabase Support](https://supabase.com/support)
- [Netlify Support](https://www.netlify.com/support/)
- Development team contact

---

**Last Updated:** January 11, 2025  
**Maintainer:** Development Team  
**Next Review:** January 18, 2025



