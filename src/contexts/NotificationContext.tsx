import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { isValidRequest, isValidChatbotRequest, isValidLead } from '../utils/notificationUtils';

export interface Notification {
  id: string;
  type: 'request' | 'chatbot_request' | 'lead' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
  const { user } = useAuth();
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      // One-time cleanup: Clear all notification data to remove fake notifications
      const cleanupKey = `notifications_cleanup_done_${user.id}`;
      if (!localStorage.getItem(cleanupKey)) {
        console.log('🧹 Performing one-time notification cleanup...');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('notifications_')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem(cleanupKey, 'true');
        console.log('✅ Notification cleanup completed');
        return; // Don't load any notifications on first run after cleanup
      }

      const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          // Filter out any fake/test notifications with aggressive filtering
          const realNotifications = parsed.filter((notification: Notification) => {
            // Only keep notifications that have valid data and aren't test data
            if (!notification.data || !notification.data.requestId) {
              return false;
            }
            
            const title = notification.title?.toLowerCase() || '';
            const message = notification.message?.toLowerCase() || '';
            
            // Check for test/fake keywords
            const testKeywords = ['test', 'fake', 'sample', 'dummy', 'sarah johnson', 'conference room'];
            for (const keyword of testKeywords) {
              if (title.includes(keyword) || message.includes(keyword)) {
                return false;
              }
            }
            
            // Check for repeated character patterns
            const repeatedCharPattern = /^([a-z])\1{2,}$/i;
            if (repeatedCharPattern.test(title) || repeatedCharPattern.test(message)) {
              return false;
            }
            
            // Check minimum length
            if (title.length < 3 || message.length < 10) {
              return false;
            }
            
            return true;
          });
          setNotifications(realNotifications);
        } catch (error) {
          console.error('Error parsing saved notifications:', error);
          // Clear corrupted localStorage data
          localStorage.removeItem(`notifications_${user.id}`);
        }
      }
    }
  }, [user?.id]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user?.id && notifications.length > 0) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user?.id]);

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

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    // Also clear from localStorage
    if (user?.id) {
      localStorage.removeItem(`notifications_${user.id}`);
    }
    // Clear ALL notification data from localStorage (for all users)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('notifications_')) {
        localStorage.removeItem(key);
      }
    });
  }, [user?.id]);

  // Set up real-time subscriptions for client requests
  useEffect(() => {
    if (!user?.id) return;

    console.log('[NotificationProvider] Setting up real-time subscriptions for user:', user.id);

    // Subscribe to new requests
    const requestsChannel = supabase
      .channel(`creator-requests-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'requests',
        },
        async (payload) => {
          console.log('[NotificationProvider] New request detected:', payload);
          
          // Get the request details with client and project info
          const { data: requestData, error } = await supabase
            .from('requests')
            .select(`
              *,
              projects!inner(
                id,
                title,
                end_clients!inner(
                  id,
                  name,
                  email,
                  company,
                  creators!inner(
                    id,
                    user_id
                  )
                )
              )
            `)
            .eq('id', payload.new.id)
            .eq('projects.end_clients.creators.user_id', user.id)
            .single();

          if (error || !requestData) {
            console.error('Error fetching request details:', error);
            return;
          }

          const client = requestData.projects?.end_clients;
          const project = requestData.projects;

          // Validate that this is a real, meaningful request
          if (!client?.name || !project?.title || !isValidRequest(requestData)) {
            console.log('Skipping notification for invalid/test request:', requestData.title);
            return;
          }

          addNotification({
            type: 'request',
            title: `New Request from ${client.name}`,
            message: `${requestData.title} - ${requestData.description.substring(0, 100)}${requestData.description.length > 100 ? '...' : ''}`,
            data: {
              requestId: requestData.id,
              projectId: project.id,
              clientId: client.id,
              priority: requestData.priority,
              requestType: requestData.request_type,
            },
            priority: requestData.priority as 'low' | 'medium' | 'high' | 'urgent',
          });
        }
      )
      .subscribe();

    // Subscribe to new chatbot requests
    const chatbotRequestsChannel = supabase
      .channel(`creator-chatbot-requests-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatbot_requests',
        },
        async (payload) => {
          console.log('[NotificationProvider] New chatbot request detected:', payload);
          
          // Get the chatbot request details with project info
          const { data: requestData, error } = await supabase
            .from('chatbot_requests')
            .select(`
              *,
              projects!inner(
                id,
                title,
                end_clients!inner(
                  id,
                  name,
                  email,
                  company,
                  creators!inner(
                    id,
                    user_id
                  )
                )
              )
            `)
            .eq('id', payload.new.id)
            .eq('projects.end_clients.creators.user_id', user.id)
            .single();

          if (error || !requestData) {
            console.error('Error fetching chatbot request details:', error);
            return;
          }

          const client = requestData.projects?.end_clients;
          const project = requestData.projects;

          // Validate that this is a real, meaningful chatbot request
          if (!client?.name || !project?.title || !isValidChatbotRequest(requestData)) {
            console.log('Skipping notification for invalid/test chatbot request:', requestData.chatbot_name);
            return;
          }

          addNotification({
            type: 'chatbot_request',
            title: `New Chatbot Request from ${client.name}`,
            message: `${requestData.chatbot_name} - ${requestData.chatbot_purpose.substring(0, 100)}${requestData.chatbot_purpose.length > 100 ? '...' : ''}`,
            data: {
              requestId: requestData.id,
              projectId: project.id,
              clientId: client.id,
              priority: requestData.priority,
            },
            priority: requestData.priority as 'low' | 'medium' | 'high' | 'urgent',
          });
        }
      )
      .subscribe();

    // Subscribe to new leads
    const leadsChannel = supabase
      .channel(`creator-leads-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
        },
        async (payload) => {
          console.log('[NotificationProvider] New lead detected:', payload);
          
          // Get the lead details with chatbot and project info
          const { data: leadData, error } = await supabase
            .from('leads')
            .select(`
              *,
              chatbots!inner(
                id,
                name,
                projects!inner(
                  id,
                  title,
                  end_clients!inner(
                    id,
                    name,
                    email,
                    company,
                    creators!inner(
                      id,
                      user_id
                    )
                  )
                )
              )
            `)
            .eq('id', payload.new.id)
            .eq('chatbots.projects.end_clients.creators.user_id', user.id)
            .single();

          if (error || !leadData) {
            console.error('Error fetching lead details:', error);
            return;
          }

          const client = leadData.chatbots?.projects?.end_clients;
          const project = leadData.chatbots?.projects;

          // Validate that this is a real, meaningful lead
          if (!client?.name || !project?.title || !isValidLead(leadData)) {
            console.log('Skipping notification for invalid/test lead:', leadData.question_asked);
            return;
          }

          addNotification({
            type: 'lead',
            title: `New Lead from ${client.name}`,
            message: `${leadData.visitor_name || 'Anonymous'} asked: ${leadData.question_asked.substring(0, 100)}${leadData.question_asked.length > 100 ? '...' : ''}`,
            data: {
              leadId: leadData.id,
              projectId: project.id,
              clientId: client.id,
              chatbotId: leadData.chatbot_id,
              leadScore: leadData.lead_score,
            },
            priority: leadData.lead_score >= 80 ? 'high' : leadData.lead_score >= 60 ? 'medium' : 'low',
          });
        }
      )
      .subscribe();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      console.log('[NotificationProvider] Cleaning up real-time subscriptions');
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(chatbotRequestsChannel);
      supabase.removeChannel(leadsChannel);
    };
  }, [user?.id, addNotification]);

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
