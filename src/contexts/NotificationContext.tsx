import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

export interface Notification {
  id: string;
  type: 'media_upload' | 'media_shared' | 'request_created' | 'request_updated' | 'request_completed' | 'project_update' | 'system' | 'message';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  read_at?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  related_entity_type?: 'project' | 'request' | 'asset' | 'client' | 'media';
  related_entity_id?: string;
  sender_id?: string;
  user_id: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load notifications from database on mount
  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('[NotificationContext] Loading notifications for user:', user.id);
      
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Check if error is due to table not existing (migration not run yet)
        if (error.message?.includes('relation "notifications" does not exist') || 
            error.code === '42P01') {
          console.warn('[NotificationContext] Notifications table does not exist yet. Please run the migration.');
          setNotifications([]);
          setLoading(false);
          return;
        }
        console.error('[NotificationContext] Error loading notifications:', error);
        throw error;
      }

      console.log('[NotificationContext] Loaded notifications:', data?.length || 0);
      setNotifications(data || []);
    } catch (error: any) {
      console.error('[NotificationContext] Failed to load notifications:', error);
      // Only show error toast if it's not a "table doesn't exist" error
      if (!error.message?.includes('relation "notifications" does not exist')) {
        toast({
          title: 'Error loading notifications',
          description: 'Failed to load notifications. Please refresh the page.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      created_at: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    toast({
      title: newNotification.title,
      description: newNotification.message,
      variant: newNotification.priority === 'urgent' ? 'destructive' : 'default',
    });

    // Play notification sound (if supported)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
      });
    }
  }, [toast]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        // Silently fail if table doesn't exist
        if (error.code === '42P01') return;
        throw error;
      }

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('[NotificationContext] Error marking notification as read:', error);
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) {
        if (error.code === '42P01') return;
        throw error;
      }

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('[NotificationContext] Error marking all notifications as read:', error);
    }
  }, [user?.id]);

  const clearNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        if (error.code === '42P01') return;
        throw error;
      }

      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    } catch (error) {
      console.error('[NotificationContext] Error clearing notification:', error);
    }
  }, [user?.id]);

  const clearAllNotifications = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .delete()
        .eq('user_id', user?.id);

      if (error) {
        if (error.code === '42P01') return;
        throw error;
      }

      setNotifications([]);
    } catch (error) {
      console.error('[NotificationContext] Error clearing all notifications:', error);
    }
  }, [user?.id]);

  // Set up real-time subscriptions for notifications
  useEffect(() => {
    if (!user?.id) return;

    console.log('[NotificationProvider] Setting up real-time subscriptions for user:', user.id);

    // Subscribe to new notifications for this user
    const notificationsChannel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[NotificationProvider] 🔔 New notification received:', payload);
          
          const newNotification = payload.new as Notification;
          
          // Add to state
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.priority === 'urgent' ? 'destructive' : 'default',
          });
          
          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[NotificationProvider] ✅ Successfully subscribed to real-time notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[NotificationProvider] ❌ Channel error:', err);
        } else if (status === 'TIMED_OUT') {
          console.error('[NotificationProvider] ⏱️ Subscription timed out');
        } else {
          console.log('[NotificationProvider] Subscription status:', status);
        }
      });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('[NotificationProvider] Browser notification permission:', permission);
      });
    }

    return () => {
      console.log('[NotificationProvider] Cleaning up real-time subscriptions');
      supabase.removeChannel(notificationsChannel);
    };
  }, [user?.id, toast]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
