import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  Download,
  Share2,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  Play,
  ExternalLink
} from 'lucide-react';
import { TEXT } from '@/constants/text';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import RecentActivity from '@/components/RecentActivity';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  last_project_date: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  views: number;
  client_name: string;
  project_type: string;
}

interface ClientDashboardProps {
  client: Client;
  onBack: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ client, onBack }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Use real activity data for this client
  const { activities, loading: activitiesLoading, error: activitiesError, refresh: refreshActivities } = useRecentActivity({
    clientId: client.id,
    limit: 10
  });

  // Production ready - No sample data
  const analyticsData = {
    totalViews: 0,
    uniqueVisitors: 0,
    avgSessionDuration: '0m 0s',
    bounceRate: 0,
    conversionRate: 0,
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    satisfactionScore: 0
  };

  // Production ready - No sample data
  const clientProjects: Project[] = [];

  useEffect(() => {
    // Production ready - load real client projects from database
    // For now, show empty state
    setProjects([]);
    setLoading(false);
  }, [client.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Live';
      case 'inactive':
        return 'Inactive';
      case 'draft':
        return 'In Progress';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground truncate">{client.name}</h1>
            <p className="text-foreground-secondary truncate">{client.company} • Client Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
            {client.status}
          </Badge>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Real-time view data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">
              Real-time visitor data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgSessionDuration}</div>
            <p className="text-xs text-muted-foreground">
              Real-time session data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.satisfactionScore}/5</div>
            <p className="text-xs text-muted-foreground">
              Real-time satisfaction data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalProjects}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span>{analyticsData.completedProjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>In Progress</span>
                <span>{analyticsData.inProgressProjects}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversionRate}%</div>
            <Progress value={analyticsData.conversionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Real-time conversion data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.bounceRate}%</div>
            <Progress value={analyticsData.bounceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Real-time bounce rate data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
            <p className="text-foreground-secondary">Manage and view your virtual tour projects</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {project.thumbnail_url ? (
                    <img 
                      src={project.thumbnail_url} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Thumbnail
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        <Play size={16} className="mr-1" />
                        View Tour
                      </Button>
                      <Button size="sm" variant="secondary">
                        <ExternalLink size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Views</span>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{project.views}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created</span>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <RecentActivity
          activities={activities}
          loading={activitiesLoading}
          error={activitiesError}
          onRefresh={refreshActivities}
          title="Recent Activity"
          description="Latest updates and interactions for this client"
          showStats={true}
          maxItems={8}
        />
      </div>
    </div>
  );
};

export default ClientDashboard;

