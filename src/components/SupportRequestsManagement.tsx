import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

interface SupportRequest {
  id: string;
  user_id: string;
  creator_id?: string;
  subject: string;
  message: string;
  request_type: string;
  status: string;
  priority: string;
  admin_response?: string;
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  creator_name?: string;
}

const SupportRequestsManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [updating, setUpdating] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadRequests();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('support_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_requests'
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Get all support requests with creator info
      const { data, error } = await supabase
        .from('support_requests')
        .select(`
          *,
          creators (
            agency_name,
            contact_email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error loading requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (requestId: string, updates: Partial<SupportRequest>) => {
    try {
      setUpdating(true);
      
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // If status is being set to resolved, add resolved metadata
      if (updates.status === 'resolved') {
        const { data: { user } } = await supabase.auth.getUser();
        updateData.resolved_by = user?.id;
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request Updated',
        description: 'The support request has been updated successfully'
      });

      loadRequests();
      
      // Update selected request
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, ...updates });
      }
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      'technical_support': 'Technical Support',
      'project_creation': 'Project Creation',
      'client_portal': 'Client Portal',
      'chatbot_setup': 'Chatbot Setup',
      'payment_billing': 'Payment & Billing',
      'account_management': 'Account Management',
      'feature_request': 'Feature Request',
      'other': 'Other'
    };
    return labels[subject] || subject;
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Requests Management</h1>
        <p className="text-muted-foreground">
          Manage all support requests from users and creators
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Open</span>
            </div>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Resolved</span>
            </div>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Urgent</span>
            </div>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.priority === 'urgent').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Requests ({filteredRequests.length})</CardTitle>
                  <CardDescription>
                    Click on a request to view details and manage it
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredRequests.map((request) => (
                    <Card 
                      key={request.id} 
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedRequest(request);
                        setAdminResponse('');
                        setAdminNotes('');
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{getSubjectLabel(request.subject)}</h3>
                            <p className="text-sm text-muted-foreground">
                              {request.user_id}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {request.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Request Details */}
        <div>
          {selectedRequest ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Request Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Subject:</span>
                      <p>{getSubjectLabel(selectedRequest.subject)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <p className="capitalize">{selectedRequest.request_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="font-medium">User Email:</span>
                      <p>{selectedRequest.user_email}</p>
                    </div>
                    {selectedRequest.creator_name && (
                      <div>
                        <span className="font-medium">Creator:</span>
                        <p>{selectedRequest.creator_name}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Created:</span>
                      <p>{format(new Date(selectedRequest.created_at), 'PPpp')}</p>
                    </div>
                    {selectedRequest.resolved_at && (
                      <div>
                        <span className="font-medium">Resolved:</span>
                        <p>{format(new Date(selectedRequest.resolved_at), 'PPpp')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Message</h3>
                  <div className="text-sm bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
                    {selectedRequest.message}
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Admin Actions</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={selectedRequest.status}
                      onValueChange={(value) => updateRequest(selectedRequest.id, { status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={selectedRequest.priority}
                      onValueChange={(value) => updateRequest(selectedRequest.id, { priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminResponse">Response to User</Label>
                    <Textarea
                      id="adminResponse"
                      placeholder="Write a response that will be visible to the user..."
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      rows={4}
                    />
                    <Button
                      size="sm"
                      onClick={() => updateRequest(selectedRequest.id, { admin_response: adminResponse })}
                      disabled={updating}
                    >
                      {updating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                      Save Response
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminNotes">Internal Notes</Label>
                    <Textarea
                      id="adminNotes"
                      placeholder="Add internal notes (not visible to users)..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateRequest(selectedRequest.id, { admin_notes: adminNotes })}
                      disabled={updating}
                    >
                      {updating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                      Save Notes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a request to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportRequestsManagement;
