import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ContactFloater from '@/components/ContactFloater';
import {
  Eye,
  BarChart3,
  Image as ImageIcon,
  MessageSquare,
  Calendar,
  Clock,
  Users,
  Timer,
  TrendingUp,
  FileText,
  Video,
  File,
  Download,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  project_type: string;
  created_at: string;
  updated_at: string;
  end_clients: {
    id: string;
    name: string;
    email: string;
    company: string;
    phone?: string;
    website?: string;
  };
}

interface Chatbot {
  id: string;
  name: string;
  status: string;
  welcome_message: string;
  language: string;
}

interface Analytics {
  id: string;
  metric_type: string;
  metric_value: number;
  date: string;
  views?: number;
  unique_visitors?: number;
  avg_time_spent?: number;
  interactions?: number;
}

interface Asset {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  created_at: string;
}

interface Request {
  id: string;
  title: string;
  description: string;
  request_type: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ClientDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [endClient, setEndClient] = useState<any>(null);
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Request form state
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    type: 'content_change' as const,
    priority: 'medium' as const
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      if (!projectId) {
        toast({
          title: 'Project not found',
          description: 'No project ID provided.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Loading data for project:', projectId);

      // First validate the project exists and is active
      const { data: projectData, error: projectErr } = await supabase
        .from('projects')
        .select(`
          *,
          end_clients (
            id,
            name,
            email,
            company,
            phone,
            website
          )
        `)
        .eq('id', projectId)
        .eq('status', 'active')  // Only allow active projects
        .single();

      if (projectErr) {
        console.error('Project error:', projectErr);
        setAccessDenied(true);
        toast({
          title: 'Access Denied',
          description: 'This project is not accessible or has been deactivated.',
          variant: 'destructive',
        });
        return;
      }

      if (!projectData) {
        setAccessDenied(true);
        toast({
          title: 'Access Denied',
          description: 'This project is not accessible or has been deactivated.',
          variant: 'destructive',
        });
        return;
      }

      // Additional validation: Check if project has valid client data
      if (!projectData.end_clients) {
        setAccessDenied(true);
        toast({
          title: 'Access Denied',
          description: 'This project is not properly configured.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Project data loaded:', projectData);
      setProject(projectData);
      setEndClient(projectData.end_clients);

      // OPTIMIZED: Get all related data in parallel
      const [
        { data: chatbotData, error: chatbotErr },
        { data: analyticsData, error: analyticsErr },
        { data: assetsData, error: assetsErr },
        { data: requestsData, error: requestsErr }
      ] = await Promise.all([
        // Get chatbot
        supabase
          .from('chatbots')
          .select('*')
          .eq('project_id', projectId)
          .single(),
        
        // Get analytics
        supabase
          .from('analytics')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
        
        // Get assets
        supabase
          .from('assets')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
        
        // Get requests
        supabase
          .from('requests')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
      ]);

      // Set data (handle errors gracefully)
      if (chatbotErr) {
        console.log('No chatbot found:', chatbotErr.message);
      } else {
        setChatbot(chatbotData);
      }

      if (analyticsErr) {
        console.log('No analytics found:', analyticsErr.message);
        setAnalytics([]);
      } else {
        setAnalytics(analyticsData || []);
      }

      if (assetsErr) {
        console.log('No assets found:', assetsErr.message);
        setAssets([]);
      } else {
        setAssets(assetsData || []);
      }

      if (requestsErr) {
        console.log('No requests found:', requestsErr.message);
        setRequests([]);
      } else {
        setRequests(requestsData || []);
      }

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async () => {
    if (!newRequest.title || !newRequest.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!endClient) {
      toast({
        title: 'Error',
        description: 'Client information not found.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingRequest(true);

      console.log('Submitting request for project:', projectId, 'client:', endClient.id);

      const { error } = await supabase
        .from('requests')
        .insert({
          project_id: projectId,
          end_client_id: endClient.id,
          title: newRequest.title,
          description: newRequest.description,
          request_type: newRequest.type,
          priority: newRequest.priority,
          status: 'open'
        });

      if (error) {
        console.error('Request submission error:', error);
        throw error;
      }

      toast({
        title: 'Request submitted',
        description: 'Your request has been sent successfully.',
      });

      setNewRequest({
        title: '',
        description: '',
        type: 'content_change',
        priority: 'medium'
      });

      // Reload requests
      loadData();

    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Failed to submit',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (fileType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (fileType.startsWith('application/pdf')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  // Dynamic manifest and meta tag injection for PWA
  useEffect(() => {
    if (project && endClient && projectId) {
      // Update manifest link to use dynamic manifest
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (manifestLink) {
        manifestLink.href = `/api/manifest?projectId=${projectId}`;
      }
      
      // Update page title
      document.title = `${project.title} - ${endClient.company}`;
      
      // Update meta tags for better PWA experience
      const updateMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      // Update various meta tags
      updateMetaTag('description', `Dashboard for ${endClient.company} - ${project.title}`);
      updateMetaTag('apple-mobile-web-app-title', project.title);
      updateMetaTag('application-name', project.title);
      
      // Update Open Graph tags
      const updateOGTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      updateOGTag('og:title', `${project.title} - ${endClient.company}`);
      updateOGTag('og:description', `Dashboard for ${endClient.company} - ${project.title}`);
      updateOGTag('og:url', window.location.href);
      
      // Update Twitter meta tags
      const updateTwitterTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="twitter:${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = `twitter:${name}`;
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      updateTwitterTag('title', `${project.title} - ${endClient.company}`);
      updateTwitterTag('description', `Dashboard for ${endClient.company} - ${project.title}`);
      
      console.log('Dynamic manifest and meta tags updated for:', project.title);
    }
  }, [project, endClient, projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">This project is not accessible or has been deactivated. Please contact your project manager for assistance.</p>
          <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
            <Globe className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">This project does not exist or has been removed.</p>
          <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
            <Globe className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    );
  }

  // Calculate analytics summary
  const totalViews = analytics.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalVisitors = analytics.reduce((sum, item) => sum + (item.unique_visitors || 0), 0);
  const avgTimeSpent = analytics.length > 0 ? analytics.reduce((sum, item) => sum + (item.avg_time_spent || 0), 0) / analytics.length : 0;
  const totalInteractions = analytics.reduce((sum, item) => sum + (item.interactions || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Contact Floater */}
      <ContactFloater projectId={projectId} />
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {project.title}
                </h1>
                <p className="text-sm text-gray-600">Client Portal</p>
              </div>
            </div>
          </div>
          
          {/* Client Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {(endClient?.name || 'C').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{endClient?.name || 'Client'}</p>
                <p className="text-xs text-gray-600 truncate">{endClient?.email || 'client@example.com'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {[
                { id: 'overview', name: 'Overview', icon: Eye },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                { id: 'media', name: 'Media', icon: ImageIcon },
                { id: 'requests', name: 'Requests', icon: MessageSquare }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-lg font-bold text-gray-900 truncate">
                    {project.title}
                  </h1>
                  <p className="text-xs text-gray-600">Client Portal</p>
                </div>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {(endClient?.name || 'C').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="pb-20 pt-20">
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>

        {/* Mobile Bottom Navigation - Fixed */}
        <div className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50 shadow-lg">
          <div className="flex">
            {[
              { id: 'overview', name: 'Overview', icon: Eye },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 },
              { id: 'media', name: 'Media', icon: ImageIcon },
              { id: 'requests', name: 'Requests', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-gray-100'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function renderTabContent() {
    return (
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Welcome back, {endClient?.name}!</h2>
                    <p className="text-blue-100 mb-4">Here's your latest project overview and performance metrics.</p>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Created {new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                      <Eye className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-gray-300 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Views</p>
                      <p className="text-xl font-bold text-black">{totalViews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-300 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Visitors</p>
                      <p className="text-xl font-bold text-black">{totalVisitors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-300 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Timer className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg. Time</p>
                      <p className="text-xl font-bold text-black">{Math.round(avgTimeSpent)}s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-300 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Interactions</p>
                      <p className="text-xl font-bold text-black">{totalInteractions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Info and Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-300 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-black">Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                      <p className="text-black text-sm leading-relaxed break-words overflow-wrap-anywhere">
                        {project.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Type</p>
                    <Badge className="bg-blue-600 text-white border-0">
                      {project.project_type || 'virtual tour'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    <Badge 
                      className={`${
                        project.status === 'active' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 text-white'
                      } border-0`}
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-300 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-black">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab('requests')} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('media')} 
                    className="w-full bg-white text-black hover:bg-gray-100 border-0"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    View Media
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('analytics')} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Analytics Overview</CardTitle>
                <CardDescription className="text-gray-400">Performance metrics for your virtual tour</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No analytics data yet</h3>
                    <p className="text-gray-400">Analytics will appear here once your virtual tour starts receiving visitors.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-5 w-5 text-blue-400" />
                          <span className="text-sm font-medium text-white">Total Views</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">{totalViews}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-blue-400" />
                          <span className="text-sm font-medium text-white">Unique Visitors</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">{totalVisitors}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center space-x-2">
                          <Timer className="h-5 w-5 text-blue-400" />
                          <span className="text-sm font-medium text-white">Avg. Time Spent</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">{Math.round(avgTimeSpent)}s</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-blue-400" />
                          <span className="text-sm font-medium text-white">Interactions</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">{totalInteractions}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Media Library</CardTitle>
                <CardDescription className="text-gray-400">View and download media assets for your virtual tour</CardDescription>
              </CardHeader>
              <CardContent>
                {assets.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No media files yet</h3>
                    <p className="text-gray-400">Media assets for your virtual tour will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assets.map((asset) => (
                      <Card key={asset.id} className="overflow-hidden bg-gray-700 border-gray-600">
                        <div className="aspect-video bg-gray-600 flex items-center justify-center">
                          {asset.file_type.startsWith('image/') ? (
                            <img
                              src={asset.thumbnail_url || asset.file_url}
                              alt={asset.original_filename}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              {getFileIcon(asset.file_type)}
                              <p className="text-xs text-gray-300 mt-2">{asset.file_type.split('/')[1]}</p>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium text-white truncate">{asset.original_filename}</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(asset.created_at).toLocaleDateString()}
                          </p>
                          <Button size="sm" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white border-0">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Submit New Request */}
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Submit Request</CardTitle>
                <CardDescription className="text-gray-400">Request changes or ask questions about your virtual tour</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Title</label>
                  <Input
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    placeholder="Brief description of your request"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Description</label>
                  <Textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Detailed description of what you need"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Type</label>
                    <Select value={newRequest.type} onValueChange={(value: any) => setNewRequest({ ...newRequest, type: value })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="content_change" className="text-white hover:bg-gray-700">Content Change</SelectItem>
                        <SelectItem value="hotspot_update" className="text-white hover:bg-gray-700">Hotspot Update</SelectItem>
                        <SelectItem value="design_modification" className="text-white hover:bg-gray-700">Design Modification</SelectItem>
                        <SelectItem value="new_feature" className="text-white hover:bg-gray-700">New Feature</SelectItem>
                        <SelectItem value="bug_fix" className="text-white hover:bg-gray-700">Bug Fix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Priority</label>
                    <Select value={newRequest.priority} onValueChange={(value: any) => setNewRequest({ ...newRequest, priority: value })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="low" className="text-white hover:bg-gray-700">Low</SelectItem>
                        <SelectItem value="medium" className="text-white hover:bg-gray-700">Medium</SelectItem>
                        <SelectItem value="high" className="text-white hover:bg-gray-700">High</SelectItem>
                        <SelectItem value="urgent" className="text-white hover:bg-gray-700">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={submitRequest} 
                  disabled={submittingRequest}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  {submittingRequest ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </Button>
              </CardContent>
            </Card>

            {/* Existing Requests */}
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Your Requests</CardTitle>
                <CardDescription className="text-gray-400">Track the status of your submitted requests</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No requests yet</h3>
                    <p className="text-gray-400">Submit your first request using the form above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <Card key={request.id} className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-white">{request.title}</h4>
                                <Badge className={`${
                                  request.priority === 'urgent' ? 'bg-red-600 text-white' :
                                  request.priority === 'high' ? 'bg-orange-600 text-white' :
                                  request.priority === 'medium' ? 'bg-blue-600 text-white' :
                                  'bg-gray-600 text-white'
                                } border-0`}>
                                  {request.priority}
                                </Badge>
                              </div>
                              <p className="text-gray-300 text-sm mb-3 leading-relaxed">{request.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-400">
                                <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="capitalize">{request.request_type.replace('_', ' ')}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {getStatusIcon(request.status)}
                              <span className="text-sm font-medium text-white capitalize">
                                {request.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }
};

export default ClientDashboard;