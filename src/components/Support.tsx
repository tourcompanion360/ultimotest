
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { TEXT } from '@/constants/text';

interface SupportRequest {
  id: string;
  subject: string;
  message: string;
  request_type: string;
  status: string;
  priority: string;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

const Support = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define FAQ items (updated)
  const faqItems = [
    { question: TEXT.FAQ.CREATE_FIRST_PROJECT_QUESTION, answer: TEXT.FAQ.CREATE_FIRST_PROJECT_ANSWER },
    { question: TEXT.FAQ.CLIENT_PORTAL_ACCESS_QUESTION, answer: TEXT.FAQ.CLIENT_PORTAL_ACCESS_ANSWER },
    { question: TEXT.FAQ.CHATBOT_SETUP_QUESTION, answer: TEXT.FAQ.CHATBOT_SETUP_ANSWER },
    { question: TEXT.FAQ.REQUEST_TYPES_QUESTION, answer: TEXT.FAQ.REQUEST_TYPES_ANSWER },
    { question: TEXT.FAQ.NOTIFICATIONS_QUESTION, answer: TEXT.FAQ.NOTIFICATIONS_ANSWER },
    { question: TEXT.FAQ.PROJECT_SHARING_QUESTION, answer: TEXT.FAQ.PROJECT_SHARING_ANSWER },
    { question: TEXT.FAQ.MEDIA_TYPES_QUESTION, answer: TEXT.FAQ.MEDIA_TYPES_ANSWER },
    { question: TEXT.FAQ.DELETE_MEDIA_QUESTION, answer: TEXT.FAQ.DELETE_MEDIA_ANSWER },
    { question: TEXT.FAQ.PWA_ICON_QUESTION, answer: TEXT.FAQ.PWA_ICON_ANSWER },
    { question: TEXT.FAQ.EMAIL_TEMPLATES_QUESTION, answer: TEXT.FAQ.EMAIL_TEMPLATES_ANSWER },
  ];
  const tutorials = [
    { title: 'Create your first project', videoId: 'QZz0aYpZ0Y8' },
    { title: 'Share the client portal', videoId: '2Vv-BfVoq4g' },
    { title: 'Set up chatbots', videoId: 'lTRiuFIWV54' }
  ];
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadSupportRequests(user.id);
      } else {
        setSupportRequests([]);
      }
    }
  }, [authLoading, user]);

  const loadSupportRequests = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setSupportRequests(data || []);
    } catch (error: any) {
      console.error('Error loading support requests:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load support requests. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'You need to be signed in to submit a support request.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get creator_id if user is a creator
      const { data: creatorData } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('support_requests')
        .insert({
          user_id: user.id,
          creator_id: creatorData?.id || null,
          subject,
          message,
          request_type: subject,
          status: 'open',
          priority: priority,
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Request Sent',
        description: 'Your support request has been submitted successfully.',
      });

      setSubject('');
      setMessage('');
      setPriority('medium');
      loadSupportRequests(user.id);
    } catch (error: any) {
      console.error('Error submitting support ticket:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to submit your request. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{TEXT.HEADERS.SUPPORT_ASSISTANCE}</h1>
        <p className="text-foreground-secondary text-sm sm:text-base">{TEXT.DESCRIPTIONS.SUPPORT_SUBTITLE}</p>
      </div>

      <Tabs defaultValue="contact" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contact" className="text-xs sm:text-sm">Contact</TabsTrigger>
          <TabsTrigger value="faq" className="text-xs sm:text-sm">FAQ</TabsTrigger>
          <TabsTrigger value="requests" className="text-xs sm:text-sm">My Requests</TabsTrigger>
          <TabsTrigger value="tutorials" className="text-xs sm:text-sm">Tutorials</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 bg-background-secondary border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">{TEXT.HEADERS.CONTACT_US_DIRECTLY}</h2>
              <p className="text-foreground-secondary mb-6">{TEXT.DESCRIPTIONS.CONTACT_DESCRIPTION}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-foreground font-medium mb-2">{TEXT.FORMS.SUBJECT}</label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder={TEXT.FORMS.SELECT_REQUEST_TYPE} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical_support">{TEXT.SUPPORT_SUBJECTS.TECHNICAL_SUPPORT}</SelectItem>
                      <SelectItem value="project_creation">{TEXT.SUPPORT_SUBJECTS.PROJECT_CREATION}</SelectItem>
                      <SelectItem value="client_portal">{TEXT.SUPPORT_SUBJECTS.CLIENT_PORTAL}</SelectItem>
                      <SelectItem value="chatbot_setup">{TEXT.SUPPORT_SUBJECTS.CHATBOT_SETUP}</SelectItem>
                      <SelectItem value="payment_billing">{TEXT.SUPPORT_SUBJECTS.PAYMENT_BILLING}</SelectItem>
                      <SelectItem value="account_management">{TEXT.SUPPORT_SUBJECTS.ACCOUNT_MANAGEMENT}</SelectItem>
                      <SelectItem value="feature_request">{TEXT.SUPPORT_SUBJECTS.FEATURE_REQUEST}</SelectItem>
                      <SelectItem value="other">{TEXT.SUPPORT_SUBJECTS.OTHER}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-foreground font-medium mb-2">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-foreground font-medium mb-2">Message</label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your request here..." className="bg-input border-border min-h-[120px] resize-none" required />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary-hover" disabled={isSubmitting || !subject || !message}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>

            <Card className="p-6 bg-background-secondary border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Guides and Alternative Contacts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="flex items-center gap-2 h-12 bg-background-tertiary border-border hover:bg-accent" onClick={() => window.open('mailto:prismatica360@gmail.com', '_blank')}>
                  <Mail size={20} />
                  Direct Email
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-12 bg-[#25D366] border-[#1DA851] text-white hover:bg-[#1DA851] hover:text-white"
                  onClick={() => {
                    const phoneNumber = '393293763839';
                    const whatsappUrl = `https://wa.me/${phoneNumber}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <MessageCircle size={20} className="text-white" />
                  WhatsApp Chat
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <Card className="p-6 bg-background-secondary border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions (FAQ)</h2>
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div key={index} className="faq-item">
                  <button onClick={() => setExpandedFaq(expandedFaq === index ? null : index)} className="w-full p-4 text-left flex items-center justify-between hover:bg-background-tertiary transition-colors">
                    <span className="font-medium text-foreground">{item.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="text-foreground-secondary" size={20} />
                    ) : (
                      <ChevronDown className="text-foreground-secondary" size={20} />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4 text-foreground-secondary animate-slide-up">{item.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          {supportRequests.length > 0 ? (
            <Card className="p-6 bg-background-secondary border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Your Support Requests</h2>
              <div className="space-y-4">
                {supportRequests.map((ticket) => (
                  <div key={ticket.id} className="p-4 border border-border rounded-lg bg-background-tertiary">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-foreground">
                          {ticket.subject === 'technical_support' && 'Technical Support'}
                          {ticket.subject === 'project_creation' && 'Project Creation Help'}
                          {ticket.subject === 'client_portal' && 'Client Portal Issues'}
                          {ticket.subject === 'chatbot_setup' && 'Chatbot Setup & Configuration'}
                          {ticket.subject === 'payment_billing' && 'Payment & Billing'}
                          {ticket.subject === 'account_management' && 'Account Management'}
                          {ticket.subject === 'feature_request' && 'Feature Request'}
                          {ticket.subject === 'other' && 'Other'}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>{getStatusLabel(ticket.status)}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-foreground-secondary text-sm">
                        <Clock size={14} />
                        {new Date(ticket.created_at).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                    <p className="text-foreground-secondary text-sm line-clamp-2 mb-3">{ticket.message}</p>
                    {ticket.admin_response && (
                      <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
                        <p className="text-sm text-blue-800">{ticket.admin_response}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-foreground-secondary mt-3">
                      <span className="capitalize">Priority: {ticket.priority}</span>
                      {ticket.status === 'resolved' && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 size={12} />
                          Resolved
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-background-secondary border-border">
              <div className="text-center py-12">
                <MessageCircle size={48} className="mx-auto text-foreground-secondary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Support Requests Yet</h3>
                <p className="text-foreground-secondary mb-4">You haven't submitted any support requests.</p>
                <p className="text-sm text-foreground-secondary">Go to the Contact tab to submit your first request.</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tutorials">
          <Card className="p-6 bg-background-secondary border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Video Tutorials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tutorials.map((t) => (
                <div key={t.videoId} className="space-y-3">
                  <div className="w-full h-56 rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${t.videoId}`}
                      title={t.title}
                      width="100%"
                      height="100%"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{t.title}</span>
                    <Button variant="outline" size="sm" onClick={() => window.open(`https://youtu.be/${t.videoId}`, '_blank')}>Open</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
