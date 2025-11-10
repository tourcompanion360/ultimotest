import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AnalyticsView from '@/components/AnalyticsView';
import MediaView from '@/components/MediaView';
import RequestsView from '@/components/RequestsView';
import NotificationBell from '@/components/NotificationBell';
import {
  LayoutDashboard,
  BarChart3,
  Image as ImageIcon,
  FileText,
  Bell,
  ChevronDown,
  Monitor,
  Smartphone,
  Tablet,
  ThumbsUp,
  Download,
  CheckCircle,
  RefreshCw,
  Calendar,
  MessageCircle,
  Mail,
  Phone
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  project_type: string;
  created_at: string;
  updated_at: string;
  end_client_id: string;
  thumbnail_url?: string;
  views?: number;
}

interface CreatorProfile {
  avatar_url?: string;
  agency_name?: string;
  contact_email?: string;
  phone?: string;
}

interface ProjectMetrics {
  totalViews: number | null;
  uniqueVisitors: number | null;
  avgEngagementSeconds: number | null;
  newLeads: number | null;
}

const ClientDashboardNew: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [endClient, setEndClient] = useState<any>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics>({
    totalViews: null,
    uniqueVisitors: null,
    avgEngagementSeconds: null,
    newLeads: null
  });

  const [topProjects, setTopProjects] = useState<Array<{
    id: string;
    title: string;
    views: number;
    leads: number;
    thumbnail_url?: string;
  }>>([]);

  const [recentActivity] = useState<any[]>([]);

  // Real-time subscription refs
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
  }, [clientId]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectMetrics(selectedProject.id);
    } else {
      setProjectMetrics({
        totalViews: null,
        uniqueVisitors: null,
        avgEngagementSeconds: null,
        newLeads: null
      });
    }
  }, [selectedProject?.id]);

  // Close contact menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showContactMenu && !target.closest('.contact-menu-container')) {
        setShowContactMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showContactMenu]);

  // Set up real-time subscriptions for live updates
  useEffect(() => {
    if (!clientId) return;

    console.log('[ClientDashboard] Setting up real-time subscriptions for client:', clientId);

    const channel = supabase
      .channel(`client-dashboard-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `end_client_id=eq.${clientId}`,
        },
        (payload) => {
          console.log('[ClientDashboard] Project change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        (payload) => {
          console.log('[ClientDashboard] Request change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
        },
        (payload) => {
          console.log('[ClientDashboard] Asset change detected:', payload);
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
          console.log('[ClientDashboard] Analytics change detected:', payload);
          if (selectedProject) {
            loadProjectMetrics(selectedProject.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('[ClientDashboard] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[ClientDashboard] ✅ Successfully subscribed to real-time updates');
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('[ClientDashboard] Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [clientId, selectedProject?.id]);

  const debouncedRefresh = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('[ClientDashboard] Triggering debounced refresh');
      loadData();
    }, 1000);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      if (!clientId) {
        toast({
          title: 'Client not found',
          description: 'No client ID provided.',
          variant: 'destructive',
        });
        return;
      }

      // Get client data
      const { data: clientData, error: clientErr } = await supabase
        .from('end_clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientErr || !clientData) {
        console.error('Client error:', clientErr);
        toast({
          title: 'Access Denied',
          description: 'This client portal is not accessible.',
          variant: 'destructive',
        });
        return;
      }

      setEndClient(clientData);

      // Fetch all projects for this client
      const { data: projectsData, error: projectsErr } = await (supabase as any)
        .from('projects')
        .select('id,title,description,status,project_type,created_at,updated_at,end_client_id,thumbnail_url,views')
        .eq('end_client_id', clientId)
        .order('created_at', { ascending: false });

      if (projectsErr) {
        console.error('Projects error:', projectsErr);
      }

      console.log('[ClientDashboard] Projects query result:', { projectsData, projectsErr, clientId });

      // Set projects even if empty to avoid blocking
      setProjects(projectsData || []);

      // Fetch creator profile via end_client relationship
      // Relationship: projects -> end_clients -> creators
      if (clientData.creator_id) {
        console.log('[ClientDashboard] Creator ID from end_client:', clientData.creator_id);
        
        // Get creator details including contact info
        const { data: creatorData, error: creatorErr } = await supabase
          .from('creators')
          .select('agency_name, user_id, contact_email, phone')
          .eq('id', clientData.creator_id)
          .single();
        
        console.log('[ClientDashboard] Creator data:', { creatorData, creatorErr });
        
        if (creatorData?.user_id) {
          // Get profile/avatar for the creator's user
          const { data: profileData, error: profileErr } = await (supabase as any)
            .from('profiles')
            .select('avatar_url')
            .eq('user_id', creatorData.user_id)
            .single();
          
          console.log('[ClientDashboard] Profile data:', { profileData, profileErr });
          
          setCreatorProfile({
            avatar_url: profileData?.avatar_url,
            agency_name: creatorData?.agency_name,
            contact_email: creatorData?.contact_email,
            phone: creatorData?.phone
          });
        }
      }
      
      console.log(`[ClientDashboard] Loaded ${projectsData?.length || 0} projects for client ${clientId}:`, projectsData);
      
      // Set first project as selected by default
      if (projectsData && projectsData.length > 0) {
        setSelectedProject(projectsData[0]);
        console.log('[ClientDashboard] Selected first project:', projectsData[0].title);
        
        // Load top performing projects with metrics
        await loadTopProjects(projectsData);
      } else {
        console.warn('[ClientDashboard] No projects found for this client');
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectMetrics = async (projectId: string) => {
    try {
      let totalViews = 0;
      let uniqueVisitors = 0;
      let engagementTotal = 0;
      let engagementCount = 0;
      let newLeads: number | null = null;

      const { data: analyticsData, error: analyticsError } = await (supabase as any)
        .from('analytics')
        .select('metric_type, metric_value')
        .eq('project_id', projectId);

      if (analyticsError) {
        console.error('Analytics error:', analyticsError);
      } else if (analyticsData) {
        analyticsData.forEach((entry: any) => {
          switch (entry.metric_type) {
            case 'view':
              totalViews += Number(entry.metric_value) || 0;
              break;
            case 'unique_visitor':
              uniqueVisitors += Number(entry.metric_value) || 0;
              break;
            case 'time_spent':
              engagementTotal += Number(entry.metric_value) || 0;
              engagementCount += 1;
              break;
            default:
              break;
          }
        });
      }

      const { count: leadsCount, error: leadsError } = await (supabase as any)
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);

      if (leadsError) {
        console.error('Leads error:', leadsError);
      } else {
        newLeads = leadsCount ?? null;
      }

      setProjectMetrics({
        totalViews: totalViews || null,
        uniqueVisitors: uniqueVisitors || null,
        avgEngagementSeconds: engagementCount > 0 ? Math.round(engagementTotal / engagementCount) : null,
        newLeads: newLeads
      });
    } catch (error) {
      console.error('Error loading project metrics:', error);
      setProjectMetrics({
        totalViews: null,
        uniqueVisitors: null,
        avgEngagementSeconds: null,
        newLeads: null
      });
    }
  };

  const formatNumber = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return '0';
    return value.toLocaleString();
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null || Number.isNaN(seconds)) return '0m 00s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleContactWhatsApp = () => {
    if (creatorProfile?.phone) {
      // Remove non-numeric characters from phone
      const cleanPhone = creatorProfile.phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Hello ${creatorProfile.agency_name || 'Agency'}, I'm reaching out from the client portal.`);
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    } else {
      toast({
        title: 'Phone not available',
        description: 'The agency has not provided a phone number.',
        variant: 'destructive'
      });
    }
    setShowContactMenu(false);
  };

  const handleContactEmail = () => {
    if (creatorProfile?.contact_email) {
      const subject = encodeURIComponent('Contact from Client Portal');
      const body = encodeURIComponent(`Hello ${creatorProfile.agency_name || 'Agency'},\n\nI'm reaching out from the client portal.\n\nBest regards,\n${endClient?.name || 'Client'}`);
      window.location.href = `mailto:${creatorProfile.contact_email}?subject=${subject}&body=${body}`;
    } else {
      toast({
        title: 'Email not available',
        description: 'The agency has not provided an email address.',
        variant: 'destructive'
      });
    }
    setShowContactMenu(false);
  };

  const loadTopProjects = async (projectsData: Project[]) => {
    try {
      // Fetch analytics and leads for each project
      const projectsWithMetrics = await Promise.all(
        projectsData.map(async (project) => {
          // Get total views for this project
          const { data: analyticsData } = await (supabase as any)
            .from('analytics')
            .select('metric_value')
            .eq('project_id', project.id)
            .eq('metric_type', 'view');

          const totalViews = analyticsData?.reduce(
            (sum: number, entry: any) => sum + (Number(entry.metric_value) || 0),
            0
          ) || 0;

          // Get total leads for this project
          const { count: leadsCount } = await (supabase as any)
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', project.id);

          return {
            id: project.id,
            title: project.title,
            views: totalViews,
            leads: leadsCount || 0,
            thumbnail_url: project.thumbnail_url
          };
        })
      );

      // Sort by views (descending) and take top 5
      const sorted = projectsWithMetrics
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      setTopProjects(sorted);
      console.log('[ClientDashboard] Top projects loaded:', sorted);
    } catch (error) {
      console.error('Error loading top projects:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Allow dashboard to load even without projects - we show empty state inside
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'requests', label: 'Requests', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Top Navigation Bar - Mobile & Desktop */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile: Title Only */}
            <div className="flex items-center md:hidden flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {activeTab === 'dashboard' ? 'Dashboard' : 
                 activeTab === 'analytics' ? 'Analytics' :
                 activeTab === 'media' ? 'Media' :
                 'Requests'}
              </h1>
            </div>

            {/* Desktop: Logo and Nav */}
            <div className="hidden md:flex items-center gap-6">
              {/* Agency Logo */}
              <div className="flex items-center gap-2">
                {creatorProfile?.avatar_url ? (
                  <img 
                    src={creatorProfile.avatar_url} 
                    alt={creatorProfile.agency_name || 'Logo'} 
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {(creatorProfile?.agency_name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-base font-bold text-gray-900">
                  {creatorProfile?.agency_name || 'Agency'}
                </span>
              </div>

              {/* Navigation Tabs - Desktop Only */}
              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Right: Project Selector, Contact, Notifications, User */}
            <div className="hidden md:flex items-center gap-3">
              {/* Project Selector - Desktop Only */}
              {projects.length > 0 && selectedProject && (
                <Select
                  value={selectedProject?.id}
                  onValueChange={(value) => {
                    const project = projects.find(p => p.id === value);
                    if (project) {
                      setSelectedProject(project);
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Project:</span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {selectedProject.title}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Contact Agency Button */}
              <div className="relative contact-menu-container">
                <Button
                  onClick={() => setShowContactMenu(!showContactMenu)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  Contact
                </Button>
                
                {/* Contact Dropdown Menu */}
                {showContactMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={handleContactWhatsApp}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">WhatsApp</div>
                        <div className="text-xs text-gray-500">
                          {creatorProfile?.phone || 'Not available'}
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleContactEmail}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Email</div>
                        <div className="text-xs text-gray-500 truncate">
                          {creatorProfile?.contact_email || 'Not available'}
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* User Avatar */}
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-700">
                  {(endClient?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Mobile: Contact & Notifications */}
            <div className="md:hidden flex items-center gap-2">
              {/* Contact Button */}
              <button
                onClick={() => setShowContactMenu(!showContactMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <MessageCircle className="h-5 w-5 text-gray-600" />
              </button>
              
              {/* Notifications */}
              <NotificationBell />

              {/* User Avatar */}
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-700">
                  {(endClient?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Project Selector - Below header */}
          {projects.length > 0 && selectedProject && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2 px-1">Current Project</div>
              <Select
                value={selectedProject?.id}
                onValueChange={(value) => {
                  const project = projects.find(p => p.id === value);
                  if (project) {
                    setSelectedProject(project);
                  }
                }}
              >
                <SelectTrigger className="w-full h-auto py-3 px-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                  <div className="flex items-center gap-3 text-left w-full">
                    {selectedProject?.thumbnail_url ? (
                      <img
                        src={selectedProject.thumbnail_url}
                        alt={selectedProject.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <LayoutDashboard className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {selectedProject.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {selectedProject.project_type}
                      </div>
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        {project.thumbnail_url ? (
                          <img src={project.thumbnail_url} alt={project.title} className="w-6 h-6 rounded object-cover" />
                        ) : (
                          <LayoutDashboard className="h-4 w-4 text-blue-600" />
                        )}
                        <span>{project.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Mobile Contact Menu Dropdown */}
        {showContactMenu && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-lg z-40">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={handleContactWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-left bg-white border border-gray-200"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">WhatsApp</div>
                  <div className="text-xs text-gray-500">
                    {creatorProfile?.phone || 'Not available'}
                  </div>
                </div>
              </button>
              
              <button
                onClick={handleContactEmail}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-left bg-white border border-gray-200"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Email</div>
                  <div className="text-xs text-gray-500 truncate">
                    {creatorProfile?.contact_email || 'Not available'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-[1400px] mx-auto">
          {!selectedProject ? (
            /* No Projects Empty State */
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="max-w-md w-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutDashboard className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Projects Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Your agency hasn't created any projects for you yet. Once they create a project, it will appear here.
                  </p>
                  <Button
                    onClick={() => setShowContactMenu(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Agency
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : activeTab === 'analytics' ? (
            /* Analytics View - Full Width */
            <AnalyticsView 
              projectId={selectedProject.id} 
              projectTitle={selectedProject.title} 
            />
          ) : activeTab === 'media' ? (
            /* Media View - Full Width */
            <MediaView 
              projectId={selectedProject.id} 
              projectTitle={selectedProject.title} 
            />
          ) : activeTab === 'requests' ? (
            /* Requests View - Full Width */
            <RequestsView 
              projectId={selectedProject.id} 
              projectTitle={selectedProject.title}
              clientId={clientId || ''}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              {/* Left Column - Main Content (2/3) */}
              <div className="lg:col-span-8 space-y-4 md:space-y-6">
                {/* Dashboard Overview Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Projects Overview</h1>
                  <p className="text-sm md:text-base text-gray-600 mt-1">Track your project performance</p>
                </div>
                <div className="hidden md:flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Last 30 Days</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <Card className="bg-white">
                  <CardContent className="p-4 md:p-6">
                    <div className="text-xs md:text-sm text-gray-600 mb-1">Total Projects</div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                      {projects.length}
                    </div>
                    <p className="text-xs text-gray-500 hidden md:block">All your projects</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4 md:p-6">
                    <div className="text-xs md:text-sm text-gray-600 mb-1">Active Tours</div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                      {projects.filter(p => p.status === 'active').length}
                    </div>
                    <p className="text-xs text-gray-500 hidden md:block">Currently active</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4 md:p-6">
                    <div className="text-xs md:text-sm text-gray-600 mb-1">Total Views</div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                      {formatNumber(projectMetrics.totalViews)}
                    </div>
                    <p className="text-xs text-gray-500 hidden md:block">Project views</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4 md:p-6">
                    <div className="text-xs md:text-sm text-gray-600 mb-1">Avg. Time</div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                      {formatDuration(projectMetrics.avgEngagementSeconds)}
                    </div>
                    <p className="text-xs text-gray-500 hidden md:block">Engagement time</p>
                  </CardContent>
                </Card>
              </div>

              {/* Viewer Trends Placeholder */}
              <Card className="bg-white">
                <CardContent className="p-4 md:p-6">
                  <div className="mb-3 md:mb-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Viewer Trends</h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">Last 30 Days</p>
                  </div>
                  <div className="h-48 md:h-64 flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/60">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3 md:mb-4">
                      <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                    </div>
                    <p className="text-sm md:text-base font-medium text-gray-900 px-4">Viewer trends coming soon</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-xs px-4">
                      Analytics will appear once you have enough data
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Top-Performing Tours */}
              <Card className="bg-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top-Performing Tours</h3>
                  {topProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-xl py-8 bg-gray-50/60">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                        <BarChart3 className="h-5 w-5 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">No tour data yet</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">
                        Performance metrics will appear here once your tours start getting views.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topProjects.map((project, index) => (
                        <div
                          key={project.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => {
                            const fullProject = projects.find(p => p.id === project.id);
                            if (fullProject) {
                              setSelectedProject(fullProject);
                            }
                          }}
                        >
                          {/* Rank Badge */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            #{index + 1}
                          </div>

                          {/* Thumbnail */}
                          {project.thumbnail_url ? (
                            <img
                              src={project.thumbnail_url}
                              alt={project.title}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          )}

                          {/* Project Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {project.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                {project.views.toLocaleString()} views
                              </span>
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {project.leads} leads
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar (1/3) */}
            <div className="lg:col-span-4 space-y-4 md:space-y-6">
              {/* Quick Actions */}
              <Card className="bg-white">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Quick Actions</h3>
                  <div className="space-y-2 md:space-y-3">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base"
                      onClick={() => {
                        setActiveTab('requests');
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 50);
                      }}
                    >
                      New Request
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-sm md:text-base"
                      onClick={() => {
                        setActiveTab('media');
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 50);
                      }}
                    >
                      View Media
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Items */}
              <Card className="bg-white">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Pending Items</h3>
                  <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-xl py-6 md:py-8 bg-gray-50/60">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2 md:mb-3">
                      <ThumbsUp className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-900">All caught up!</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs px-4">
                      No pending items
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Recent Activity</h3>
                  {recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-xl py-8 bg-gray-50/60">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                        <RefreshCw className="h-5 w-5 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">No activity yet</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">
                        As soon as there are updates, media uploads, or completed requests, they will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'media' ? 'bg-purple-100' :
                            activity.type === 'status' ? 'bg-blue-100' :
                            'bg-green-100'
                          }`}>
                            {activity.type === 'media' && <Download className="h-4 w-4 text-purple-600" />}
                            {activity.type === 'status' && <RefreshCw className="h-4 w-4 text-blue-600" />}
                            {activity.type === 'complete' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-inset-bottom">
        <div className="grid grid-cols-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-3 transition-all ${
                activeTab === item.id
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              <item.icon className={`h-6 w-6 mb-1 transition-colors ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-medium ${activeTab === item.id ? 'text-blue-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardNew;
