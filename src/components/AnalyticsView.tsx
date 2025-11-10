import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsViewProps {
  projectId: string;
  projectTitle: string;
}

interface AnalyticsMetrics {
  totalViews: number;
  viewsChange: number;
  uniqueVisitors: number;
  visitorsChange: number;
  avgEngagement: string;
  engagementChange: number;
  leadsGenerated: number;
  leadsChange: number;
}

interface TrafficSource {
  name: string;
  percentage: number;
  color: string;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ projectId, projectTitle }) => {
  const [timeRange, setTimeRange] = useState('30');
  const [sectionFilter, setSectionFilter] = useState('all');
  
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalViews: 0,
    viewsChange: 0,
    uniqueVisitors: 0,
    visitorsChange: 0,
    avgEngagement: '0m 00s',
    engagementChange: 0,
    leadsGenerated: 0,
    leadsChange: 0
  });
  const [hasAnalyticsData, setHasAnalyticsData] = useState(false);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);

  // Real-time subscription refs
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [projectId, timeRange]);

  // Set up real-time subscriptions for analytics
  useEffect(() => {
    if (!projectId) return;

    console.log('[AnalyticsView] Setting up real-time subscriptions');

    const channel = supabase
      .channel(`analytics-view-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('[AnalyticsView] Analytics change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[AnalyticsView] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[AnalyticsView] Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [projectId]);

  const debouncedRefresh = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('[AnalyticsView] Triggering debounced refresh');
      loadAnalytics();
    }, 1000);
  };

  const loadAnalytics = async () => {
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Fetch analytics data
      const { data: analyticsData, error } = await (supabase as any)
        .from('analytics')
        .select('metric_type, metric_value, date')
        .eq('project_id', projectId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

      if (error) {
        console.error('Analytics error:', error);
        return;
      }

      const hasData = (analyticsData?.length || 0) > 0;
      setHasAnalyticsData(hasData);

      let totalViews = 0;
      let uniqueVisitors = 0;
      let engagementTotal = 0;
      let engagementCount = 0;

      analyticsData?.forEach((entry: any) => {
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
        }
      });

      // Fetch leads
      const { count: leadsCount } = await (supabase as any)
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const avgEngagementSeconds = engagementCount > 0 ? Math.round(engagementTotal / engagementCount) : 0;
      const mins = Math.floor(avgEngagementSeconds / 60);
      const secs = avgEngagementSeconds % 60;

      setMetrics({
        totalViews,
        viewsChange: 0,
        uniqueVisitors,
        visitorsChange: 0,
        avgEngagement: `${mins}m ${secs.toString().padStart(2, '0')}s`,
        engagementChange: 0,
        leadsGenerated: leadsCount || 0,
        leadsChange: 0
      });

      // Placeholder for future traffic source analytics - show empty when no real data
      if (hasData) {
        setTrafficSources([]);
      } else {
        setTrafficSources([]);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tour Analytics</h1>
          <p className="text-gray-600 mt-1">
            Detailed statistics for <span className="font-semibold">{projectTitle}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>

          {/* Section Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2">
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="details">Details</SelectItem>
              </SelectContent>
            </Select>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 mb-1">Total Views</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatNumber(metrics.totalViews)}
            </div>
            <p className="text-xs text-gray-500">Change vs previous period: 0%</p>
          </CardContent>
        </Card>

        {/* Unique Visitors */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 mb-1">Unique Visitors</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatNumber(metrics.uniqueVisitors)}
            </div>
            <p className="text-xs text-gray-500">Change vs previous period: 0%</p>
          </CardContent>
        </Card>

        {/* Avg. Engagement */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 mb-1">Avg. Engagement</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.avgEngagement}
            </div>
            <p className="text-xs text-gray-500">Change vs previous period: 0%</p>
          </CardContent>
        </Card>

        {/* Leads Generated */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 mb-1">Leads Generated</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatNumber(metrics.leadsGenerated)}
            </div>
            <p className="text-xs text-gray-500">Change vs previous period: 0%</p>
          </CardContent>
        </Card>
      </div>

      {/* Views Over Time Chart */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Views Over Time</h3>
            <p className="text-sm text-gray-600">Daily views for the selected period.</p>
          </div>
          {hasAnalyticsData ? (
            <div className="h-80 flex items-end justify-between">
              {/* Enhanced SVG Chart */}
              <svg className="w-full h-full" viewBox="0 0 900 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {/* Smooth curve path */}
                <path
                  d="M 0,180 Q 50,140 100,160 T 200,120 Q 250,100 300,140 T 400,100 Q 450,80 500,60 T 600,90 Q 650,110 700,140 T 800,180 Q 850,200 900,220"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Area fill */}
                <path
                  d="M 0,180 Q 50,140 100,160 T 200,120 Q 250,100 300,140 T 400,100 Q 450,80 500,60 T 600,90 Q 650,110 700,140 T 800,180 Q 850,200 900,220 L 900,300 L 0,300 Z"
                  fill="url(#areaGradient)"
                />
              </svg>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500">
              No analytics data yet. Your agency will share stats once visitors interact with this tour.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Traffic Sources - Donut Chart */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h3>
          {trafficSources.length > 0 ? (
            <>
              <div className="flex items-center justify-center mb-6">
                {/* SVG Donut Chart */}
                <svg width="240" height="240" viewBox="0 0 240 240">
                  {trafficSources.map((source, index) => {
                    const totalCircumference = 2 * Math.PI * 80;
                    const offset = trafficSources
                      .slice(0, index)
                      .reduce((acc, current) => acc + (current.percentage / 100) * totalCircumference, 0);

                    return (
                      <circle
                        key={source.name}
                        cx="120"
                        cy="120"
                        r="80"
                        fill="none"
                        stroke={source.color}
                        strokeWidth="40"
                        strokeDasharray={`${(source.percentage / 100) * totalCircumference} ${totalCircumference}`}
                        strokeDashoffset={`-${offset}`}
                        transform="rotate(-90 120 120)"
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="space-y-3">
                {trafficSources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{source.name} ({source.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-gray-500">
              Traffic source breakdown will appear once real visitor data is collected.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsView;
