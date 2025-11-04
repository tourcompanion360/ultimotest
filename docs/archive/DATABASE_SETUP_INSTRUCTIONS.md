# TourCompanion Database Setup Instructions

## 🎯 Overview

This guide will help you set up the complete TourCompanion SaaS database from scratch. The database includes 8 core tables with Row-Level Security (RLS) policies, functions, and materialized views.

## 📋 Prerequisites

- Access to your Supabase project dashboard
- Supabase project URL: `https://yrvicwapjsevyilxdzsm.supabase.co`
- Admin access to run SQL migrations

## 🚀 Step-by-Step Setup

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `yrvicwapjsevyilxdzsm`
3. Click on the **SQL Editor** tab in the left sidebar

### Step 2: Run the Master Migration

1. In the SQL Editor, click **"New Query"**
2. Copy the entire contents of `supabase/migrations/20250110000000_complete_saas_schema.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** to execute the migration

**⚠️ Important:** This migration will:
- Drop existing tables (if any) for a clean slate
- Create 8 new tables with proper relationships
- Set up Row-Level Security policies
- Create indexes for performance
- Add database functions and materialized views

### Step 3: Verify Database Setup

Run this verification query to ensure everything was created correctly:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'creators', 'end_clients', 'projects', 'chatbots', 
  'leads', 'analytics', 'requests', 'assets'
)
ORDER BY table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'get_creator_stats', 'get_client_stats', 
  'refresh_analytics_summary', 'track_analytics'
);
```

### Step 4: Test the Setup

Create a test creator account:

```sql
-- Insert a test creator (replace with your actual user_id from auth.users)
INSERT INTO public.creators (
  user_id,
  agency_name,
  contact_email,
  subscription_plan,
  subscription_status
) VALUES (
  'your-user-id-here', -- Replace with actual user ID
  'Test Agency',
  'test@example.com',
  'pro',
  'active'
);
```

## 📊 Database Schema Overview

### Core Tables

1. **`creators`** - Tour creator/agency accounts
2. **`end_clients`** - Clients of tour creators  
3. **`projects`** - Virtual tour projects
4. **`chatbots`** - AI chatbots for projects
5. **`leads`** - Captured leads from chatbots
6. **`analytics`** - Project analytics data
7. **`requests`** - Client change requests
8. **`assets`** - File management

### Key Features

- **Row-Level Security (RLS)** - Data isolation between creators and clients
- **Real-time subscriptions** - Live updates for leads, analytics, requests
- **Analytics functions** - Built-in statistics and reporting
- **Materialized views** - Performance-optimized analytics summary
- **Triggers** - Automatic timestamp updates

## 🔐 Security & Permissions

### RLS Policies

- **Creators** can manage all their own data and their clients' data
- **End Clients** can only view their own projects and data
- **Anonymous users** have no access (secure by default)

### User Types

1. **Creator Authentication**: Uses Supabase Auth with `user_id`
2. **End Client Authentication**: Uses JWT tokens with `end_client_id`

## 🧪 Sample Data (Optional)

To test the system with sample data, run this script:

```sql
-- Create sample creator
INSERT INTO public.creators (
  user_id,
  agency_name,
  contact_email,
  subscription_plan
) VALUES (
  gen_random_uuid(),
  'Demo Agency',
  'demo@example.com',
  'pro'
);

-- Get the creator ID
WITH creator AS (
  SELECT id FROM public.creators WHERE agency_name = 'Demo Agency'
)
-- Create sample end client
INSERT INTO public.end_clients (
  creator_id,
  name,
  email,
  company
) 
SELECT 
  creator.id,
  'John Smith',
  'john@hotel.com',
  'Grand Hotel'
FROM creator;

-- Create sample project
WITH client AS (
  SELECT id FROM public.end_clients WHERE name = 'John Smith'
)
INSERT INTO public.projects (
  end_client_id,
  title,
  description,
  project_type
)
SELECT 
  client.id,
  'Hotel Virtual Tour',
  'Interactive 360° tour of Grand Hotel',
  'virtual_tour'
FROM client;
```

## 🔧 Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Ensure you're running as a superuser or have proper permissions
   - Check that RLS policies are correctly configured

2. **"Table doesn't exist" errors**
   - Verify the migration ran successfully
   - Check the verification queries above

3. **"Function not found" errors**
   - Ensure all functions were created in the migration
   - Check function permissions

### Reset Database (If Needed)

If you need to start over:

```sql
-- Drop all tables (WARNING: This will delete all data!)
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.analytics CASCADE;
DROP TABLE IF EXISTS public.requests CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.chatbots CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.end_clients CASCADE;
DROP TABLE IF EXISTS public.creators CASCADE;

-- Then re-run the migration
```

## 📈 Performance Optimization

### Indexes Created

The migration automatically creates indexes on:
- Foreign key columns
- Status columns
- Date columns
- Frequently queried columns

### Materialized Views

- **`analytics_summary`** - Pre-computed analytics for better performance
- Refresh with: `SELECT refresh_analytics_summary();`

## 🔄 Next Steps

After successful database setup:

1. **Update your application** to use the new hooks:
   - `useCreatorDashboard()` - For creator dashboard
   - `useClientPortal()` - For client portals
   - `useRealtime()` - For real-time updates
   - `useSubscription()` - For plan management

2. **Test the application** with the new database structure

3. **Configure authentication** for both creator and client users

4. **Set up file storage** in Supabase Storage for assets

## 📞 Support

If you encounter any issues:

1. Check the Supabase logs in the dashboard
2. Verify all tables and policies were created correctly
3. Test with the sample data queries
4. Review the RLS policies for your specific use case

## 🎉 Success Criteria

Your database setup is successful when:

- ✅ All 8 tables exist and are accessible
- ✅ RLS policies are active and working
- ✅ Functions can be called successfully
- ✅ Sample data can be inserted and queried
- ✅ Application connects without errors
- ✅ Real-time subscriptions work properly

The TourCompanion SaaS database is now ready for production use! 🚀



