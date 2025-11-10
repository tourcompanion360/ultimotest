import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Upload,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RequestsViewProps {
  projectId: string;
  projectTitle: string;
  clientId: string;
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

const RequestsView: React.FC<RequestsViewProps> = ({ projectId, projectTitle, clientId }) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Real-time subscription refs
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRequests();
  }, [projectId]);

  // Set up real-time subscriptions for requests
  useEffect(() => {
    if (!projectId) return;

    console.log('[RequestsView] Setting up real-time subscriptions');

    const channel = supabase
      .channel(`requests-view-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('[RequestsView] Request change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[RequestsView] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[RequestsView] Cleaning up real-time subscriptions');
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
      console.log('[RequestsView] Triggering debounced refresh');
      loadRequests();
    }, 1000);
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading requests:', error);
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleSubmitRequest = async () => {
    if (!requestTitle.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a request title',
        variant: 'destructive'
      });
      return;
    }

    if (!requestDetails.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide request details',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create request
      const { data: newRequest, error } = await supabase
        .from('requests')
        .insert({
          project_id: projectId,
          end_client_id: clientId,
          title: requestTitle.trim(),
          description: requestDetails.trim(),
          request_type: 'content_change',
          priority: 'medium',
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      // Upload files if any
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          const fileName = `${newRequest.id}/${Date.now()}_${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('request-attachments')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
          }
        }
      }

      toast({
        title: 'Request Submitted!',
        description: 'Your request has been submitted successfully.',
      });

      // Reset form
      setRequestTitle('');
      setRequestDetails('');
      setAttachedFiles([]);

      // Reload requests
      loadRequests();

    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'in progress':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'in_progress' || statusLower === 'in progress') {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
    }
    if (statusLower === 'pending') {
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Pending</Badge>;
    }
    if (statusLower === 'completed') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
    }
    if (statusLower === 'rejected') {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
    }
    
    return <Badge variant="secondary">{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredRequests = requests.filter(req =>
    req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ongoingRequests = filteredRequests.filter(r => 
    r.status.toLowerCase() !== 'completed' && r.status.toLowerCase() !== 'rejected'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Project Change Requests</h1>
        <p className="text-gray-600 mt-1">
          Submit new requests and track the status of all your changes.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Submit Form (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submit New Request Card */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Submit a New Request</h2>
              <p className="text-sm text-gray-600 mb-6">
                Clearly describe the change you need. Attach files if necessary.
              </p>

              <div className="space-y-4">
                {/* Request Title */}
                <div>
                  <Label htmlFor="request-title" className="text-sm font-medium text-gray-700">
                    Request Title
                  </Label>
                  <Input
                    id="request-title"
                    placeholder="e.g., 'Update lobby hotspot information'"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Details */}
                <div>
                  <Label htmlFor="request-details" className="text-sm font-medium text-gray-700">
                    Details
                  </Label>
                  <Textarea
                    id="request-details"
                    placeholder="Please provide a detailed description of the change, including specific locations in the tour, text to update, etc."
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      Drag & drop files or{' '}
                      <span className="text-blue-600 font-medium hover:underline">
                        browse your computer
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Maximum file size: 25MB</p>
                  </label>
                  
                  {attachedFiles.length > 0 && (
                    <div className="mt-4 text-left">
                      <p className="text-sm font-medium text-gray-700 mb-2">Attached Files:</p>
                      <ul className="space-y-1">
                        {attachedFiles.map((file, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSubmitRequest}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ongoing Requests */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ongoing Requests</h2>
            <div className="space-y-3">
              {ongoingRequests.length === 0 ? (
                <Card className="bg-white">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No ongoing requests</p>
                  </CardContent>
                </Card>
              ) : (
                ongoingRequests.map((request) => (
                  <Card key={request.id} className="bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(request.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Request #{request.id.slice(0, 8)}: {request.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-600">Status: {getStatusBadge(request.status)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">Submitted: {formatDate(request.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Request History (1/3) */}
        <div>
          <Card className="bg-white">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Request History</h2>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by ID or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Request List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredRequests.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No requests found</p>
                ) : (
                  filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <h4 className="font-medium text-sm text-gray-900 mb-1">
                        Request #{request.id.slice(0, 8)}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        "{request.title}"
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequestsView;
