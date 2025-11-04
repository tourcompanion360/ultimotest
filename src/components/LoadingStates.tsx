import React from 'react';
import { Loader2, Database, Users, BarChart3, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
};

interface DashboardLoadingProps {
  message?: string;
}

export const DashboardLoading: React.FC<DashboardLoadingProps> = ({ 
  message = 'Loading dashboard data...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="flex items-center space-x-2">
        <Database className="h-8 w-8 animate-pulse text-primary" />
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">{message}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Fetching your data from the server...
        </p>
      </div>
    </div>
  );
};

interface SkeletonCardProps {
  title?: string;
  icon?: React.ReactNode;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  title = "Loading...", 
  icon 
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
          <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DashboardSkeletonProps {
  showStats?: boolean;
  showCharts?: boolean;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ 
  showStats = true, 
  showCharts = true 
}) => {
  return (
    <div className="space-y-6">
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard title="Total Clients" icon={<Users className="h-5 w-5" />} />
          <SkeletonCard title="Active Projects" icon={<Database className="h-5 w-5" />} />
          <SkeletonCard title="Total Views" icon={<BarChart3 className="h-5 w-5" />} />
          <SkeletonCard title="New Requests" icon={<MessageSquare className="h-5 w-5" />} />
        </div>
      )}
      
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard title="Analytics Chart" />
          <SkeletonCard title="Recent Activity" />
        </div>
      )}
      
      <div className="space-y-4">
        <SkeletonCard title="Recent Projects" />
        <SkeletonCard title="Recent Requests" />
      </div>
    </div>
  );
};

interface OptimizedLoadingProps {
  type: 'dashboard' | 'client' | 'admin';
  message?: string;
}

export const OptimizedLoading: React.FC<OptimizedLoadingProps> = ({ 
  type, 
  message 
}) => {
  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'dashboard':
        return 'Loading your dashboard...';
      case 'client':
        return 'Loading client portal...';
      case 'admin':
        return 'Loading admin panel...';
      default:
        return 'Loading...';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
      <div className="relative">
        <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Database className="h-6 w-6 text-primary animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">{getMessage()}</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          We're optimizing your data loading experience. This should only take a moment.
        </p>
      </div>
      
      <div className="flex space-x-1">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

