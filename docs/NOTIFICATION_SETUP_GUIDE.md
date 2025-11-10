# Notification System Setup Guide

## Quick Start

Follow these steps to set up the complete notification system:

### Step 1: Run the Database Migration

The notification system requires a database migration to create the necessary tables, triggers, and functions.

**Option A: Using Supabase CLI (Recommended)**
```bash
# Navigate to project directory
cd "c:/Users/samir/Desktop/TOURCOMPANION ENTIRE/stages/copia numero 2"

# Run the migration
supabase db push

# Or if you want to run a specific migration
supabase migration up --file 20251109000000_create_notifications_system.sql
```

**Option B: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20251109000000_create_notifications_system.sql`
4. Paste and execute the SQL

**Option C: Manual SQL Execution**
1. Open the migration file: `supabase/migrations/20251109000000_create_notifications_system.sql`
2. Connect to your database using your preferred SQL client
3. Execute the entire SQL script

### Step 2: Verify Migration

Check that the migration was successful:

```sql
-- Check if notifications table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'notifications';

-- Check if triggers are created
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name LIKE '%notify%';

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%notification%';
```

Expected results:
- ✅ `notifications` table exists
- ✅ 4 triggers: `trigger_notify_media_upload`, `trigger_notify_request_created`, `trigger_notify_request_updated`, `trigger_notify_project_updated`
- ✅ 5 functions: `create_notification`, `mark_notification_read`, `get_creator_from_project`, `get_client_from_project`, `cleanup_old_notifications`

### Step 3: Enable Realtime (If Not Already Enabled)

1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for the `notifications` table
3. Click "Save"

Or via SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### Step 4: Test the System

#### Test 1: Create a Test Notification
```sql
-- Replace 'your-user-id' with an actual user UUID from auth.users
SELECT public.create_notification(
  p_user_id := 'your-user-id',
  p_type := 'system',
  p_title := 'Test Notification',
  p_message := 'This is a test notification to verify the system is working',
  p_data := '{"test": true}'::jsonb,
  p_priority := 'medium'
);
```

#### Test 2: Verify Notification Appears
```sql
-- Check if notification was created
SELECT * FROM notifications 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC 
LIMIT 1;
```

#### Test 3: Test Real-time Updates
1. Log in to your application
2. Open browser console
3. Look for: `[NotificationProvider] Setting up real-time subscriptions`
4. Create a test notification (using SQL above)
5. You should see: `[NotificationProvider] New notification received`
6. A toast notification should appear

### Step 5: Test Automatic Triggers

#### Test Media Upload Trigger
1. Log in as a tour creator
2. Upload a new media file to a project
3. Log in as the end client for that project
4. Check if notification appears

#### Test Request Creation Trigger
1. Log in as an end client
2. Create a new request
3. Log in as the tour creator
4. Check if notification appears

#### Test Request Update Trigger
1. Log in as a tour creator
2. Change a request status to "completed"
3. Log in as the end client
4. Check if notification appears

## Troubleshooting

### Issue: TypeScript Errors in NotificationContext

**Symptom**: TypeScript errors about `notifications` table not found in types

**Solution**: The errors are expected until you regenerate Supabase types. Run:
```bash
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

Or if using remote database:
```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

### Issue: Notifications Not Appearing

**Check 1: Verify Migration**
```sql
SELECT COUNT(*) FROM notifications;
```
If error: "relation notifications does not exist" → Migration not run

**Check 2: Verify RLS Policies**
```sql
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```
Should show 4 policies

**Check 3: Verify User Authentication**
- Check browser console for authentication errors
- Verify user is logged in
- Check `user?.id` is not null

**Check 4: Verify Realtime**
- Check Supabase Dashboard → Database → Replication
- Ensure `notifications` table is enabled
- Check browser console for WebSocket errors

### Issue: Triggers Not Firing

**Check 1: Verify Triggers Exist**
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%notify%';
```

**Check 2: Test Trigger Manually**
```sql
-- Test media upload trigger
INSERT INTO assets (project_id, title, type, url, creator_id)
VALUES ('project-uuid', 'Test Media', 'image', 'https://example.com/test.jpg', 'creator-uuid');

-- Check if notification was created
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
```

**Check 3: Check Logs**
```sql
-- Enable logging
SET client_min_messages TO DEBUG;

-- Then try the operation again
```

### Issue: Performance Problems

**Check 1: Verify Indexes**
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'notifications';
```
Should show 6 indexes

**Check 2: Check Query Performance**
```sql
EXPLAIN ANALYZE
SELECT * FROM notifications 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC 
LIMIT 50;
```

**Check 3: Clean Up Old Notifications**
```sql
SELECT public.cleanup_old_notifications();
```

## Configuration

### Adjust Notification Retention

Edit the cleanup function to change retention period:
```sql
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications
    WHERE read = TRUE 
    AND read_at < NOW() - INTERVAL '60 days'; -- Changed from 30 to 60 days
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$;
```

### Add Custom Notification Types

1. Update the CHECK constraint:
```sql
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('media_upload', 'media_shared', 'request_created', 'request_updated', 
                'request_completed', 'project_update', 'system', 'message', 'your_new_type'));
```

2. Update TypeScript interface in `NotificationContext.tsx`:
```typescript
type: 'media_upload' | 'media_shared' | 'request_created' | 'request_updated' | 
      'request_completed' | 'project_update' | 'system' | 'message' | 'your_new_type';
```

### Schedule Automatic Cleanup

**Option A: Using pg_cron (if available)**
```sql
SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 
  'SELECT public.cleanup_old_notifications()');
```

**Option B: Using Supabase Edge Functions**
Create a scheduled edge function that calls the cleanup function daily.

**Option C: Manual Cleanup**
Run periodically via your application or a cron job:
```typescript
// In your admin dashboard or scheduled task
await supabase.rpc('cleanup_old_notifications');
```

## Monitoring

### Check Notification Statistics

```sql
-- Total notifications by type
SELECT type, COUNT(*) as count
FROM notifications
GROUP BY type
ORDER BY count DESC;

-- Unread notifications by user
SELECT user_id, COUNT(*) as unread_count
FROM notifications
WHERE read = FALSE
GROUP BY user_id
ORDER BY unread_count DESC;

-- Notifications created today
SELECT COUNT(*) as today_count
FROM notifications
WHERE created_at >= CURRENT_DATE;

-- Average notifications per user
SELECT AVG(notification_count) as avg_per_user
FROM (
  SELECT user_id, COUNT(*) as notification_count
  FROM notifications
  GROUP BY user_id
) subquery;
```

### Monitor Performance

```sql
-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('notifications')) as table_size;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE tablename = 'notifications'
ORDER BY idx_scan DESC;

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%notifications%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Next Steps

1. ✅ Run migration
2. ✅ Enable realtime
3. ✅ Test notifications
4. ✅ Verify triggers work
5. ✅ Regenerate TypeScript types
6. ✅ Test in both dashboards
7. ✅ Set up monitoring
8. ✅ Schedule cleanup job
9. ✅ Configure notification preferences (future)
10. ✅ Add email notifications (future)

## Support

If you encounter issues:
1. Check this guide
2. Review `docs/NOTIFICATION_SYSTEM.md`
3. Check browser console for errors
4. Check Supabase logs
5. Verify database connection
6. Test with SQL directly

## Rollback

If you need to rollback the notification system:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trigger_notify_media_upload ON assets;
DROP TRIGGER IF EXISTS trigger_notify_request_created ON requests;
DROP TRIGGER IF EXISTS trigger_notify_request_updated ON requests;
DROP TRIGGER IF EXISTS trigger_notify_project_updated ON projects;

-- Drop functions
DROP FUNCTION IF EXISTS notify_media_upload();
DROP FUNCTION IF EXISTS notify_request_created();
DROP FUNCTION IF EXISTS notify_request_updated();
DROP FUNCTION IF EXISTS notify_project_updated();
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS mark_notification_read(UUID);
DROP FUNCTION IF EXISTS get_creator_from_project(UUID);
DROP FUNCTION IF EXISTS get_client_from_project(UUID);
DROP FUNCTION IF EXISTS cleanup_old_notifications();

-- Drop table
DROP TABLE IF EXISTS notifications;
```

**Warning**: This will permanently delete all notifications!
