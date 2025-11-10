# Notification System Documentation

## Overview
This document describes the comprehensive multi-tenant notification system implemented for TourCompanion360. The system provides real-time notifications between tour creators and their end clients.

## Architecture

### Database Layer
- **Table**: `notifications`
- **Location**: `supabase/migrations/20251109000000_create_notifications_system.sql`
- **Features**:
  - Multi-tenant support with Row Level Security (RLS)
  - Real-time subscriptions via Supabase Realtime
  - Automatic triggers for common events
  - Soft delete and archiving support

### Notification Types
1. **media_upload** - When creator uploads new media for a project
2. **media_shared** - When media is explicitly shared with client
3. **request_created** - When client creates a new request
4. **request_updated** - When request status changes
5. **request_completed** - When request is marked as completed
6. **project_update** - When project details are modified
7. **system** - System-generated notifications
8. **message** - Direct messages between parties

### Priority Levels
- **urgent** - Red badge, immediate attention required
- **high** - Orange badge, important but not critical
- **medium** - Blue badge, standard priority (default)
- **low** - Gray badge, informational

## Components

### 1. NotificationContext (`src/contexts/NotificationContext.tsx`)
Main context provider that manages notification state and real-time subscriptions.

**Key Functions**:
- `loadNotifications()` - Loads notifications from database
- `markAsRead(id)` - Marks a notification as read
- `markAllAsRead()` - Marks all notifications as read
- `clearNotification(id)` - Deletes a notification
- `clearAllNotifications()` - Deletes all notifications
- `addNotification(notification)` - Adds a new notification (local only)

**Real-time Features**:
- Subscribes to `notifications` table changes
- Shows browser notifications when permitted
- Displays toast notifications for new items
- Auto-updates unread count

### 2. NotificationBell (`src/components/NotificationBell.tsx`)
Dropdown component showing recent notifications.

**Features**:
- Shows unread count badge
- Displays last 5 notifications
- Quick mark as read/delete actions
- Animated bell icon when unread
- Responsive design

### 3. NotificationPanel (`src/components/NotificationPanel.tsx`)
Full-screen notification center with advanced features.

**Features**:
- Search notifications
- Filter by type and priority
- Bulk actions (mark all read, clear all)
- Pagination support
- Detailed notification view

## Database Triggers

### 1. Media Upload Trigger
**Trigger**: `trigger_notify_media_upload`
**Event**: After INSERT on `assets` table
**Notifies**: End client
**Message**: "New Media Added - [Creator] added new [type] to [Project]"

### 2. Request Created Trigger
**Trigger**: `trigger_notify_request_created`
**Event**: After INSERT on `requests` table
**Notifies**: Tour creator
**Message**: "New Request from [Client] - [Title]"

### 3. Request Updated Trigger
**Trigger**: `trigger_notify_request_updated`
**Event**: After UPDATE on `requests` table (status changes only)
**Notifies**: End client
**Message**: "Request Status Updated - Your request has been [status]"

### 4. Project Updated Trigger
**Trigger**: `trigger_notify_project_updated`
**Event**: After UPDATE on `projects` table
**Notifies**: End client
**Message**: "Project Updated: [Title] - [Creator] updated your project"

## Usage

### Setup
1. Run the migration:
   ```bash
   supabase migration up
   ```

2. Wrap your app with NotificationProvider:
   ```tsx
   import { NotificationProvider } from '@/contexts/NotificationContext';
   
   <NotificationProvider>
     <App />
   </NotificationProvider>
   ```

3. Add NotificationBell to your navigation:
   ```tsx
   import NotificationBell from '@/components/NotificationBell';
   
   <NotificationBell />
   ```

### Creating Manual Notifications
Use the `create_notification` database function:

```sql
SELECT public.create_notification(
  p_user_id := 'user-uuid-here',
  p_type := 'system',
  p_title := 'Welcome!',
  p_message := 'Welcome to TourCompanion360',
  p_data := '{"action": "welcome"}'::jsonb,
  p_priority := 'medium',
  p_related_entity_type := NULL,
  p_related_entity_id := NULL,
  p_sender_id := NULL
);
```

### Using in Components
```tsx
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.title}
        </div>
      ))}
    </div>
  );
}
```

## Security

### Row Level Security (RLS)
- Users can only view their own notifications
- Users can only update/delete their own notifications
- System can insert notifications for any user (via triggers)

### Data Validation
- Minimum title length: 3 characters
- Minimum message length: 10 characters
- Type must be one of predefined values
- Priority must be one of predefined values

## Performance Optimization

### Indexes
- `idx_notifications_user_id` - Fast user lookups
- `idx_notifications_read` - Filter unread notifications
- `idx_notifications_created_at` - Sort by date
- `idx_notifications_type` - Filter by type
- `idx_notifications_related_entity` - Related entity lookups
- `idx_notifications_sender` - Sender lookups

### Cleanup
Old read notifications can be cleaned up periodically:
```sql
SELECT public.cleanup_old_notifications();
```
This removes notifications that have been read for more than 30 days.

## Notification Flow Examples

### Example 1: Creator Uploads Media
1. Creator uploads image to project
2. INSERT trigger on `assets` table fires
3. `notify_media_upload()` function executes
4. Gets client user_id from project relationships
5. Creates notification for client
6. Client's browser receives real-time update
7. Toast notification appears
8. Bell icon shows unread count

### Example 2: Client Creates Request
1. Client submits new request form
2. INSERT trigger on `requests` table fires
3. `notify_request_created()` function executes
4. Gets creator user_id from project relationships
5. Creates notification for creator
6. Creator's browser receives real-time update
7. Browser notification appears (if permitted)
8. Notification appears in dropdown

### Example 3: Creator Updates Request Status
1. Creator changes request status to "completed"
2. UPDATE trigger on `requests` table fires
3. `notify_request_updated()` function checks if status changed
4. Creates notification for client
5. Client receives real-time notification
6. Client sees "Request Completed" message

## Troubleshooting

### Notifications Not Appearing
1. Check if migration has been run
2. Verify RLS policies are enabled
3. Check browser console for errors
4. Verify user is authenticated
5. Check Supabase Realtime is enabled

### Real-time Not Working
1. Verify Supabase project has Realtime enabled
2. Check browser console for subscription errors
3. Verify network connection
4. Check if channel is properly subscribed

### Performance Issues
1. Run cleanup function to remove old notifications
2. Check database indexes are created
3. Verify query performance with EXPLAIN
4. Consider implementing pagination for large datasets

## Future Enhancements

### Planned Features
- [ ] Email notifications for urgent items
- [ ] SMS notifications (optional)
- [ ] Notification preferences per user
- [ ] Notification grouping/threading
- [ ] Rich media in notifications
- [ ] Action buttons in notifications
- [ ] Notification scheduling
- [ ] Read receipts
- [ ] Notification analytics

### Configuration Options
Consider adding user preferences table:
- Email notification frequency
- Browser notification settings
- Notification sound preferences
- Do Not Disturb hours
- Notification categories to mute

## API Reference

### Context Methods

#### `loadNotifications()`
Loads notifications from database for current user.

#### `markAsRead(notificationId: string)`
Marks a specific notification as read.
- **Parameters**: `notificationId` - UUID of notification
- **Returns**: Promise<void>

#### `markAllAsRead()`
Marks all unread notifications as read for current user.
- **Returns**: Promise<void>

#### `clearNotification(notificationId: string)`
Deletes a specific notification.
- **Parameters**: `notificationId` - UUID of notification
- **Returns**: Promise<void>

#### `clearAllNotifications()`
Deletes all notifications for current user.
- **Returns**: Promise<void>

### Database Functions

#### `create_notification()`
Creates a new notification.
- **Parameters**:
  - `p_user_id` (UUID) - Recipient user ID
  - `p_type` (TEXT) - Notification type
  - `p_title` (TEXT) - Notification title
  - `p_message` (TEXT) - Notification message
  - `p_data` (JSONB) - Additional data
  - `p_priority` (TEXT) - Priority level
  - `p_related_entity_type` (TEXT) - Entity type
  - `p_related_entity_id` (UUID) - Entity ID
  - `p_sender_id` (UUID) - Sender user ID
- **Returns**: UUID of created notification

#### `mark_notification_read()`
Marks notification as read.
- **Parameters**: `p_notification_id` (UUID)
- **Returns**: VOID

#### `cleanup_old_notifications()`
Removes old read notifications.
- **Returns**: INTEGER (count of deleted notifications)

## Support

For issues or questions about the notification system:
1. Check this documentation
2. Review database logs
3. Check browser console
4. Verify Supabase dashboard
5. Contact development team

## Version History

- **v1.0.0** (2024-11-09) - Initial implementation
  - Basic notification system
  - Real-time subscriptions
  - Database triggers
  - UI components
