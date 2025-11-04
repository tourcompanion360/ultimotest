# Deployment Documentation

## 🚀 Production Deployment

TourCompanion is deployed on Netlify with automatic builds from the main branch.

### Current Deployment
- **URL:** https://dashboardtourcreators.netlify.app
- **Platform:** Netlify
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** 18.x

## 🏗️ Build Process

### Local Build
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

### Build Output
The build process creates a `dist/` directory containing:
- Optimized JavaScript bundles
- Minified CSS files
- Static assets
- HTML files with proper asset references

## 🌍 Environment Configuration

### Required Environment Variables
Set these in your deployment platform:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For advanced features
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=TourCompanion
```

### Getting Supabase Credentials
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to Settings → API
4. Copy the Project URL and anon public key

## 📦 Netlify Configuration

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Build Settings
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** 18.x
- **Auto Deploy:** Enabled for main branch

## 🔧 Database Setup

### Supabase Project Setup
1. Create a new Supabase project
2. Run all migrations from `supabase/migrations/`
3. Enable Row-Level Security (RLS)
4. Configure authentication settings
5. Set up storage buckets

### Migration Deployment
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy migrations
supabase db push
```

### Required Migrations
1. `20250110000000_complete_saas_schema.sql` - Complete schema
2. `20250111000000_create_end_client_users.sql` - End client auth
3. `20250111000001_fix_end_client_rls_policies.sql` - RLS policies

## 🚀 Deployment Steps

### 1. Prepare Environment
```bash
# Set environment variables in Netlify dashboard
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Deploy Database
```bash
# Deploy all migrations
supabase db push

# Verify database setup
supabase db diff
```

### 3. Deploy Application
```bash
# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### 4. Verify Deployment
- Check application loads correctly
- Test authentication flows
- Verify database connections
- Test real-time functionality

## 🔍 Post-Deployment Checklist

### Application Verification
- [ ] Application loads without errors
- [ ] Authentication works correctly
- [ ] Database connections are established
- [ ] Real-time subscriptions function
- [ ] File uploads work properly
- [ ] Client portals are accessible

### Database Verification
- [ ] All tables are created
- [ ] RLS policies are active
- [ ] Indexes are created
- [ ] Functions are deployed
- [ ] Triggers are working

### Security Verification
- [ ] HTTPS is enabled
- [ ] CORS is configured correctly
- [ ] RLS policies are enforced
- [ ] Environment variables are secure
- [ ] No sensitive data in client code

### Performance Verification
- [ ] Page load times are acceptable
- [ ] Database queries are optimized
- [ ] Real-time updates are responsive
- [ ] File uploads are efficient
- [ ] Error handling is robust

## 🐛 Troubleshooting Deployment

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues
- Verify Supabase URL and API key
- Check RLS policies are correctly configured
- Ensure migrations are deployed
- Verify network connectivity

#### Real-time Issues
- Check Supabase real-time is enabled
- Verify channel subscriptions
- Check for CORS issues
- Monitor browser console for errors

#### Authentication Issues
- Verify Supabase Auth settings
- Check redirect URLs are configured
- Ensure JWT tokens are valid
- Verify user permissions

### Debug Commands
```bash
# Check build locally
npm run build
npm run preview

# Test database connection
supabase db ping

# Check migration status
supabase migration list

# View logs
netlify logs
```

## 📊 Monitoring and Analytics

### Application Monitoring
- **Netlify Analytics:** Built-in performance monitoring
- **Browser Console:** Client-side error tracking
- **Supabase Dashboard:** Database and API monitoring

### Key Metrics to Monitor
- Page load times
- Database query performance
- Real-time subscription health
- Authentication success rates
- Error rates and types

### Logging
```typescript
// Client-side logging
console.log('Application started');
console.error('Error occurred:', error);

// Supabase logging
const { data, error } = await supabase
  .from('table')
  .select('*');

if (error) {
  console.error('Database error:', error);
}
```

## 🔄 Continuous Deployment

### Automatic Deployments
- **Trigger:** Push to main branch
- **Platform:** Netlify
- **Build:** Automatic
- **Deploy:** Automatic

### Manual Deployments
```bash
# Deploy to production
netlify deploy --prod --dir=dist

# Deploy preview
netlify deploy --dir=dist
```

### Rollback Strategy
- **Netlify:** Use deploy history to rollback
- **Database:** Use migration rollbacks
- **Environment:** Revert environment variables

## 🔐 Security Considerations

### Environment Security
- Never commit environment variables
- Use secure variable storage
- Rotate keys regularly
- Monitor access logs

### Database Security
- Enable RLS on all tables
- Use least privilege access
- Monitor database logs
- Regular security audits

### Application Security
- Use HTTPS everywhere
- Implement proper CORS
- Sanitize user inputs
- Regular dependency updates

## 📈 Performance Optimization

### Build Optimization
- Code splitting for smaller bundles
- Tree shaking for unused code
- Image optimization
- CSS minification

### Runtime Optimization
- Lazy loading for components
- Efficient database queries
- Real-time subscription management
- Caching strategies

### Monitoring Performance
```typescript
// Performance monitoring
const startTime = performance.now();
// ... operation
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime} milliseconds`);
```

## 🚨 Emergency Procedures

### Application Down
1. Check Netlify status page
2. Verify environment variables
3. Check build logs
4. Rollback to previous deployment

### Database Issues
1. Check Supabase status
2. Verify database connections
3. Check migration status
4. Contact Supabase support

### Security Incident
1. Rotate all API keys
2. Check access logs
3. Review RLS policies
4. Update security measures

This deployment documentation ensures reliable and secure deployment of the TourCompanion platform.



