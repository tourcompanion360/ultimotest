import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClientProjectCard from './ClientProjectCard';
import { EmptyStateCard } from './EmptyStateCard';
import NewProjectModal from '@/components/NewProjectModal';
import ChatbotRequestForm from '@/components/ChatbotRequestForm';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboardRobust';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EditClientModal from './EditClientModal';
import { 
  Plus, 
  Search, 
  BarChart3, 
  Users, 
  TrendingUp,
  Activity,
  Bot,
  Eye,
  MessageSquare,
  Calendar,
  Settings,
  Loader2,
  Rocket
} from 'lucide-react';
import { OptimizedLoading } from '@/components/LoadingStates';
import { TEXT } from '@/constants/text';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TourVirtualiProps {
  onPageChange?: (page: string) => void;
  onCreateRequest?: (requestData: any) => void;
  onClientClick?: (client: any) => void;
}

const TourVirtuali = ({
  onPageChange,
  onCreateRequest,
  onClientClick
}: TourVirtualiProps) => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<any>(null);
  
  // Use authentication and data fetching hooks
  const { user } = useAuth();
  const { clients, projects, chatbots, analytics, isLoading, error, refreshData } = useCreatorDashboard(user?.id || '');
  
  // Real-time subscription setup
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Transform database data to match the expected format
  const [clientProjects, setClientProjects] = useState<any[]>([]);

  // Production ready - No demo data
  // Users start with a clean slate


  // Transform database data to match the expected format
  useEffect(() => {
    try {
      console.log('[TourVirtuali] Data transformation - isLoading:', isLoading, 'projects:', projects?.length, 'clients:', clients?.length);
      if (!isLoading) {
        if (projects && projects.length > 0) {
          // Use real database data
          const transformedProjects = projects.map(project => {
            const client = clients?.find(c => c.id === project.end_client_id);
            const projectChatbots = chatbots?.filter(cb => cb.project_id === project.id) || [];
            const projectAnalytics = analytics?.filter(a => a.project_id === project.id) || [];
            
            // Skip projects without valid client data
            if (!client || !client.id) {
              console.warn('Project has no valid client:', project.id, client);
              return null;
            }
            
            // Calculate analytics totals with safety checks
            const totalViews = projectAnalytics
              .filter(a => a.metric_type === 'view')
              .reduce((sum, a) => sum + (a.metric_value || 0), 0);
            
            const uniqueVisitors = projectAnalytics
              .filter(a => a.metric_type === 'unique_visitor')
              .reduce((sum, a) => sum + (a.metric_value || 0), 0);
            
            const sessionDurationRecords = projectAnalytics.filter(a => a.metric_type === 'session_duration');
            const avgSessionDuration = sessionDurationRecords.length > 0 
              ? sessionDurationRecords.reduce((sum, a) => sum + (a.metric_value || 0), 0) / sessionDurationRecords.length
              : 0;
            
            const conversionRecords = projectAnalytics.filter(a => a.metric_type === 'conversion');
            const conversionRate = totalViews > 0 && conversionRecords.length > 0
              ? (conversionRecords.reduce((sum, a) => sum + (a.metric_value || 0), 0) / totalViews) * 100
              : 0;
            
            // Get the primary chatbot for this project
            const primaryChatbot = projectChatbots[0];
            
            return {
              id: project.id,
              client: {
                id: client?.id || '',
                name: client?.name || 'Unknown Client',
                email: client?.email || '',
                company: client?.company || 'Unknown Company',
                avatar: '',
                phone: client?.phone || '',
                website: client?.website || ''
              },
              project: {
                title: project.title || 'Untitled Project',
                description: project.description || `A ${project.project_type || 'virtual_tour'} project`,
                type: project.project_type || 'virtual_tour',
                category: project.category || 'other',
                status: project.status || 'setup',
                thumbnail_url: project.thumbnail_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
                created_at: project.created_at || new Date().toISOString(),
                updated_at: project.updated_at || new Date().toISOString()
              },
              chatbot: primaryChatbot ? {
                name: primaryChatbot.name || 'Assistant',
                isActive: primaryChatbot.is_active || false,
                conversations: primaryChatbot.total_conversations || 0,
                satisfaction: primaryChatbot.satisfaction_score || 0,
                language: primaryChatbot.language || 'en',
                welcomeMessage: primaryChatbot.welcome_message || 'Hello! How can I help you today?',
                fallbackMessage: primaryChatbot.fallback_message || 'I apologize, but I need more information to help you.'
              } : null,
              analytics: {
                totalViews: totalViews || 0,
                uniqueVisitors: uniqueVisitors || 0,
                avgSessionDuration: isNaN(avgSessionDuration) ? '0m 0s' : `${Math.floor(avgSessionDuration / 60)}m ${Math.floor(avgSessionDuration % 60)}s`,
                conversionRate: isNaN(conversionRate) ? 0 : Math.round(conversionRate * 100) / 100,
                lastActivity: project.updated_at || new Date().toISOString(),
                pageViews: totalViews * 1.8, // Estimate
                bounceRate: 0, // Production ready - no random data
                avgPagesPerSession: 0 // Production ready - no random data
              },
              createdAt: project.created_at || new Date().toISOString(),
              lastActivity: project.updated_at || new Date().toISOString()
            };
          }).filter(project => project !== null); // Remove null projects
          
          setClientProjects(transformedProjects);
        } else {
          // Show empty state for new users - production ready
          setClientProjects([]);
        }
      }
    } catch (error) {
      console.error('Error transforming project data:', error);
      // Show empty state on error - production ready
      setClientProjects([]);
    }
  }, [isLoading, clients, projects, chatbots, analytics]);

  // Set up real-time subscriptions for projects
  useEffect(() => {
    if (!user?.id) return;

    console.log('[TourVirtuali] Setting up real-time subscriptions');

    const channel = supabase
      .channel(`tour-virtuali-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('[TourVirtuali] Project change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'end_clients',
        },
        (payload) => {
          console.log('[TourVirtuali] Client change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatbots',
        },
        (payload) => {
          console.log('[TourVirtuali] Chatbot change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
        },
        (payload) => {
          console.log('[TourVirtuali] Analytics change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[TourVirtuali] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[TourVirtuali] Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [user?.id]);

  const debouncedRefresh = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('[TourVirtuali] Triggering debounced refresh');
      refreshData();
    }, 1000);
  };

  const handleCreateRequest = (project: any) => {
    if (onCreateRequest) {
      onCreateRequest({
        title: `Request for ${project.title}`,
        description: `I would like to request modifications for the project: ${project.title}`,
        type: 'MODIFY',
        priority: 'normal',
        clientName: project.client_name,
        hotspotData: {
          name: project.title,
          position: 'Main area',
          type: 'Information'
        }
      });
    }
  };

  const handleNewProjectCreated = async (newProject: any) => {
    console.log('[TourVirtuali] New project created:', newProject);
    // Refresh data from database to get the latest projects
    console.log('[TourVirtuali] Calling refreshData...');
    await refreshData();
    console.log('[TourVirtuali] Refresh completed');
    // Close modal
    setIsNewProjectModalOpen(false);
  };


  const handleViewDetails = (project: any) => {
    // Navigate to client dashboard
    onClientClick?.(project.client);
  };

  const handleManageProject = (project: any) => {
    // Navigate to project management
    console.log('Manage project:', project);
  };

  const handleEditProject = (project: any) => {
    // Open edit client modal
    console.log('Edit client for project:', project);
    console.log('Project client data:', project.client);
    console.log('Client ID:', project.client?.id);
    console.log('Client name:', project.client?.name);
    
    if (!project.client || !project.client.id) {
      console.error('Invalid client data:', project.client);
      toast({
        title: 'Error',
        description: 'Invalid client data. Cannot edit.',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedClientForEdit(project.client);
    setIsEditClientModalOpen(true);
  };

  const handleCloseEditClientModal = () => {
    setIsEditClientModalOpen(false);
    setSelectedClientForEdit(null);
  };

  const handleClientUpdated = async () => {
    // Refresh data to reflect changes
    await refreshData();
  };


  const { toast } = useToast();

  const handleDeleteProject = (project: any) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setDeletingProjectId(projectToDelete.id);
      setIsDeleteDialogOpen(false);

      // Delete project (cascading deletes will handle related data via database constraints)
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete.id);

      if (error) throw error;

      toast({
        title: 'Project Deleted',
        description: `Project "${projectToDelete.project?.title}" and all related data have been permanently deleted.`,
      });

      await refreshData();
    } catch (err: any) {
      console.error('Error deleting project:', err);
      toast({
        title: 'Delete Failed',
        description: err.message || 'Could not delete the project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingProjectId(null);
      setProjectToDelete(null);
    }
  };

  const handleStatusChange = (projectId: string, newStatus: string) => {
    setClientProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, project: { ...p.project, status: newStatus } }
        : p
    ));
    console.log(`Status changed to ${newStatus} for project ${projectId}`);
  };

  const filteredProjects = clientProjects.filter(project => {
    const matchesSearch = (project.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.client?.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.project?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.project?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalViews = clientProjects.reduce((sum, project) => sum + (project.analytics?.totalViews || 0), 0);
  const totalVisitors = clientProjects.reduce((sum, project) => sum + (project.analytics?.uniqueVisitors || 0), 0);
  const activeProjects = clientProjects.filter(project => project.project?.status === 'active').length;
  const totalChatbots = clientProjects.filter(project => project.chatbot?.isActive).length;

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ Error loading data</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Client Projects Hub</h1>
          <p className="text-foreground-secondary text-sm sm:text-base">
            Manage all your client projects and track their performance
          </p>
        </div>
          
          <Button 
          className="bg-primary hover:bg-primary-hover"
          onClick={() => setIsNewProjectModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
                </Button>
                            </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalVisitors.toLocaleString()} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chatbots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{totalChatbots}</div>
            <p className="text-xs text-muted-foreground">
              {clientProjects.length - totalChatbots} pending setup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.0/5</div>
            <p className="text-xs text-muted-foreground">
              Based on chatbot interactions
            </p>
        </CardContent>
      </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, clients, or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="setup">Setup</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client Projects Grid */}
      {isLoading ? (
        <OptimizedLoading type="dashboard" message="Loading your projects and clients..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ClientProjectCard
              key={project.id}
              project={project}
              onViewDetails={handleViewDetails}
              onManageProject={handleManageProject}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredProjects.length === 0 && (
        searchTerm || statusFilter !== 'all' ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find projects
                </p>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyStateCard
            icon={Rocket}
            title="Ready to Launch Your First Project?"
            description="Create a client project in seconds. You can add a new client or use an existing one, then set up your virtual tour project with all the details."
            primaryAction={{
              label: "Create First Project",
              onClick: () => setIsNewProjectModalOpen(true),
              icon: Plus
            }}
            tips={[
              "You can create a client and project together in one flow",
              "Projects can be virtual tours, 3D showcases, or interactive maps",
              "Add chatbots later from the Chatbots section",
              "Share media and track analytics once your project is live"
            ]}
          />
        )
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectCreated={handleNewProjectCreated}
      />

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={isEditClientModalOpen}
        onClose={handleCloseEditClientModal}
        client={selectedClientForEdit}
        onClientUpdated={handleClientUpdated}
      />

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to delete <strong>"{projectToDelete?.project?.title}"</strong> for{' '}
                <strong>{projectToDelete?.client?.name}</strong>?
              </p>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-destructive">This action cannot be undone. The following will be permanently deleted:</p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Project data and settings</li>
                  <li>Associated chatbots and configurations</li>
                  <li>Analytics and performance data</li>
                  <li>Client requests and feedback</li>
                  <li>Uploaded media and assets</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingProjectId === projectToDelete?.id ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default TourVirtuali;
