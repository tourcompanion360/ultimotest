# 🔔 Real-Time Notification System

## Overview

The notification system provides real-time alerts for tour creators when clients make requests, submit chatbot requests, or generate leads. The system is built with Supabase real-time subscriptions and provides both in-app notifications and browser notifications.

## Features

### ✅ Real-Time Notifications
- **Client Requests**: Instant notifications when clients submit change requests
- **Chatbot Requests**: Alerts for new chatbot creation requests
- **New Leads**: Notifications when visitors become leads through chatbots
- **System Updates**: General system notifications

### ✅ Notification Types
- **Request**: Client change requests (hotspot updates, content changes, etc.)
- **Chatbot Request**: Requests for new chatbot creation
- **Lead**: New leads generated from chatbot interactions
- **System**: System updates and announcements

### ✅ Priority Levels
- **Urgent**: Critical requests requiring immediate attention
- **High**: Important requests that should be addressed soon
- **Medium**: Standard priority requests
- **Low**: Low priority notifications

### ✅ User Interface
- **Notification Bell**: Shows unread count with visual indicator
- **Dropdown Menu**: Quick access to recent notifications
- **Full Panel**: Comprehensive notification management
- **Mobile Support**: Responsive design for all devices

## Components

### 1. NotificationContext (`src/contexts/NotificationContext.tsx`)
- Manages notification state and real-time subscriptions
- Handles notification persistence in localStorage
- Provides notification management functions

### 2. NotificationBell (`src/components/NotificationBell.tsx`)
- Bell icon with unread count badge
- Dropdown menu with recent notifications
- Quick actions (mark as read, clear)

### 3. NotificationPanel (`src/components/NotificationPanel.tsx`)
- Full-screen notification management
- Search and filter functionality
- Bulk actions (mark all read, clear all)

### 4. Real-Time Subscriptions
- Automatic notification generation from database events
- No manual testing components needed

## Real-Time Subscriptions

The system uses Supabase real-time subscriptions to listen for:

### Client Requests
```sql
-- Listens for new inserts in the requests table
-- Filters by creator's user_id through project relationships
```

### Chatbot Requests
```sql
-- Listens for new inserts in the chatbot_requests table
-- Filters by creator's user_id through project relationships
```

### New Leads
```sql
-- Listens for new inserts in the leads table
-- Filters by creator's user_id through chatbot and project relationships
```

## Database Triggers

The system automatically creates notifications when:

1. **New Request Created**: Client submits a change request
2. **New Chatbot Request**: Client requests a new chatbot
3. **New Lead Generated**: Visitor provides contact information through chatbot

## Browser Notifications

The system requests browser notification permission and shows native notifications when:
- User grants permission
- New notifications are received
- User is not actively viewing the dashboard

## Usage

### For Tour Creators
1. **View Notifications**: Click the bell icon in the header
2. **Manage Notifications**: Use the full panel for advanced management
3. **Mark as Read**: Click individual notifications or use bulk actions
4. **Filter Notifications**: Use search and filter options

### For Developers
1. **Add New Types**: Extend the notification context
2. **Customize UI**: Modify notification components
3. **Monitor Events**: Check Supabase logs for real-time events

## Configuration

### Environment Variables
- No additional configuration required
- Uses existing Supabase connection

### Permissions
- Requires authenticated user
- Uses Row Level Security (RLS) for data filtering

## Performance

### Optimizations
- **Debounced Updates**: Prevents excessive re-renders
- **Local Storage**: Persists notifications across sessions
- **Efficient Queries**: Optimized database queries with proper joins
- **Lazy Loading**: Components load only when needed

### Scalability
- **Real-time Subscriptions**: Efficient WebSocket connections
- **Database Indexing**: Proper indexes on filtered columns
- **Pagination**: Limits notification display for performance

## Security

### Data Protection
- **RLS Policies**: Ensures users only see their own notifications
- **Input Validation**: Sanitizes notification data
- **Secure Storage**: Uses localStorage for client-side persistence

### Access Control
- **Authentication Required**: Only authenticated users can receive notifications
- **User Isolation**: Each user only sees their own notifications
- **Permission Checks**: Validates user permissions for all operations

## Troubleshooting

### Common Issues

1. **Notifications Not Appearing**
   - Check browser notification permissions
   - Verify Supabase connection
   - Check console for subscription errors

2. **Real-time Not Working**
   - Ensure Supabase real-time is enabled
   - Check network connectivity
   - Verify RLS policies

3. **Performance Issues**
   - Check notification count (consider pagination)
   - Monitor database query performance
   - Review subscription efficiency

### Debug Mode
- Use browser developer tools to monitor subscriptions
- Check Supabase logs for real-time events
- Monitor database inserts to verify notification flow

## Future Enhancements

### Planned Features
- **Email Notifications**: Send email alerts for urgent requests
- **Push Notifications**: Mobile app notifications
- **Notification Preferences**: User-configurable notification settings
- **Advanced Filtering**: More sophisticated filter options
- **Notification History**: Extended notification retention
- **Analytics**: Notification engagement metrics

### Integration Opportunities
- **Slack Integration**: Send notifications to Slack channels
- **Webhook Support**: Custom webhook notifications
- **SMS Alerts**: Critical notification via SMS
- **Calendar Integration**: Schedule-based notifications

## API Reference

### NotificationContext Methods

```typescript
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
}
```

### Notification Interface

```typescript
interface Notification {
  id: string;
  type: 'request' | 'chatbot_request' | 'lead' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}
```

## Support

For issues or questions about the notification system:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify Supabase configuration
4. Contact development team for assistance
