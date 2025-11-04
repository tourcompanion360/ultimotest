
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageCircle, Clock, CheckCircle2, PlayCircle, FileText, Download, Star, BookOpen, Video, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TEXT } from '@/constants/text';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
}

const Support = () => {
  const { toast } = useToast();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Academy data
  const videoTutorials = [
    {
      id: 1,
      title: TEXT.ACADEMY.TUTORIALS.PLATFORM_OVERVIEW,
      duration: "12 min",
      level: TEXT.ACADEMY.LEVELS.BEGINNER,
      thumbnail: "/api/placeholder/300/180",
      youtubeId: "dQw4w9WgXcQ",
      description: "Get started with the platform and understand the main features"
    },
    {
      id: 2,
      title: TEXT.ACADEMY.TUTORIALS.PROJECT_MANAGEMENT,
      duration: "18 min",
      level: TEXT.ACADEMY.LEVELS.INTERMEDIATE,
      thumbnail: "/api/placeholder/300/180",
      youtubeId: "dQw4w9WgXcQ",
      description: "Learn best practices for managing multiple client projects"
    },
    {
      id: 3,
      title: TEXT.ACADEMY.TUTORIALS.CLIENT_PORTAL_SETUP,
      duration: "15 min",
      level: TEXT.ACADEMY.LEVELS.INTERMEDIATE,
      thumbnail: "/api/placeholder/300/180",
      youtubeId: "dQw4w9WgXcQ",
      description: "Set up and customize client portals for seamless communication"
    },
    {
      id: 4,
      title: TEXT.ACADEMY.TUTORIALS.CHATBOT_CONFIGURATION,
      duration: "20 min",
      level: TEXT.ACADEMY.LEVELS.ADVANCED,
      thumbnail: "/api/placeholder/300/180",
      youtubeId: "dQw4w9WgXcQ",
      description: "Configure and customize AI chatbots for your clients"
    },
    {
      id: 5,
      title: TEXT.ACADEMY.TUTORIALS.ANALYTICS_INSIGHTS,
      duration: "14 min",
      level: TEXT.ACADEMY.LEVELS.INTERMEDIATE,
      thumbnail: "/api/placeholder/300/180",
      youtubeId: "dQw4w9WgXcQ",
      description: "Understand analytics data and track project performance"
    },
    {
      id: 6,
      title: TEXT.ACADEMY.TUTORIALS.NOTIFICATION_SYSTEM,
      duration: "10 min",
      level: TEXT.ACADEMY.LEVELS.BEGINNER,
      thumbnail: "/api/placeholder/300/180",
      youtubeId: "dQw4w9WgXcQ",
      description: "Manage notifications and stay on top of client requests"
    }
  ];

  const pdfGuides = [
    {
      id: 1,
      title: TEXT.ACADEMY.GUIDES.QUICK_START_GUIDE,
      pages: 25,
      size: "1.8 MB",
      description: "Complete quick start guide for new tour creators"
    },
    {
      id: 2,
      title: TEXT.ACADEMY.GUIDES.CLIENT_MANAGEMENT,
      pages: 32,
      size: "2.1 MB",
      description: "Best practices for client communication and management"
    },
    {
      id: 3,
      title: TEXT.ACADEMY.GUIDES.CHATBOT_BEST_PRACTICES,
      pages: 28,
      size: "1.9 MB",
      description: "Optimize your chatbots for better client engagement"
    },
    {
      id: 4,
      title: TEXT.ACADEMY.GUIDES.ANALYTICS_GUIDE,
      pages: 22,
      size: "1.6 MB",
      description: "Understanding and using analytics to grow your business"
    },
    {
      id: 5,
      title: TEXT.ACADEMY.GUIDES.PLATFORM_FEATURES,
      pages: 35,
      size: "2.4 MB",
      description: "Complete overview of all platform features and capabilities"
    }
  ];

  const openYouTubeVideo = (youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
  };

  const downloadGuide = (guideId: number) => {
    // In a real app, this would trigger a download
    toast({
      title: "Download Started",
      description: "Your guide download has started.",
    });
  };

  const faqItems = [
    {
      question: TEXT.FAQ.CREATE_FIRST_PROJECT_QUESTION,
      answer: TEXT.FAQ.CREATE_FIRST_PROJECT_ANSWER
    },
    {
      question: TEXT.FAQ.CLIENT_PORTAL_ACCESS_QUESTION,
      answer: TEXT.FAQ.CLIENT_PORTAL_ACCESS_ANSWER
    },
    {
      question: TEXT.FAQ.CHATBOT_SETUP_QUESTION,
      answer: TEXT.FAQ.CHATBOT_SETUP_ANSWER
    },
    {
      question: TEXT.FAQ.REQUEST_TYPES_QUESTION,
      answer: TEXT.FAQ.REQUEST_TYPES_ANSWER
    },
    {
      question: TEXT.FAQ.NOTIFICATIONS_QUESTION,
      answer: TEXT.FAQ.NOTIFICATIONS_ANSWER
    },
    {
      question: TEXT.FAQ.PROJECT_SHARING_QUESTION,
      answer: TEXT.FAQ.PROJECT_SHARING_ANSWER
    }
  ];

  useEffect(() => {
    loadSupportTickets();
  }, []);

  const loadSupportTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupportTickets(data || []);
    } catch (error) {
      console.error('Error loading support tickets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: 'anonymous', // Since we removed auth, use a placeholder
          subject,
          message,
          status: 'open',
          priority: 'normal'
        });

      if (error) throw error;

      toast({
        title: TEXT.TOAST.REQUEST_SENT,
        description: TEXT.TOAST.REQUEST_SENT_DESCRIPTION
      });

      setSubject('');
      setMessage('');
      loadSupportTickets();
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.TOAST.ERROR_OCCURRED,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'aperto':
        return 'default';
      case 'in_corso':
        return 'secondary';
      case 'risolto':
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

      <Tabs defaultValue="support" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="support">Support & Help</TabsTrigger>
          <TabsTrigger value="academy">{TEXT.ACADEMY.TRAINING_ACADEMY}</TabsTrigger>
        </TabsList>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Us Directly */}
        <Card className="p-6 bg-background-secondary border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">{TEXT.HEADERS.CONTACT_US_DIRECTLY}</h2>
          <p className="text-foreground-secondary mb-6">
            {TEXT.DESCRIPTIONS.CONTACT_DESCRIPTION}
          </p>

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
              <label className="block text-foreground font-medium mb-2">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your request here..."
                className="bg-input border-border min-h-[120px] resize-none"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover"
              disabled={isSubmitting || !subject || !message}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </Card>

        {/* FAQ */}
        <Card className="p-6 bg-background-secondary border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Answers (FAQ)</h2>
          
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index} className="faq-item">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-background-tertiary transition-colors"
                >
                  <span className="font-medium text-foreground">{item.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="text-foreground-secondary" size={20} />
                  ) : (
                    <ChevronDown className="text-foreground-secondary" size={20} />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-foreground-secondary animate-slide-up">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Your Support Requests */}
      {supportTickets.length > 0 && (
        <Card className="p-6 bg-background-secondary border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Support Requests</h2>
          
          <div className="space-y-4">
            {supportTickets.map((ticket) => (
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
                    <Badge variant={getStatusBadgeVariant(ticket.status)}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-foreground-secondary text-sm">
                    <Clock size={14} />
                    {new Date(ticket.created_at).toLocaleDateString('it-IT')}
                  </div>
                </div>
                
                <p className="text-foreground-secondary text-sm line-clamp-2 mb-3">
                  {ticket.message}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <span>Priority: {ticket.priority}</span>
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
      )}

      {/* Guides and Alternative Contacts */}
      <Card className="p-6 bg-background-secondary border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Guides and Alternative Contacts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-12 bg-background-tertiary border-border hover:bg-accent"
            onClick={() => window.open('mailto:prismatica360@gmail.com', '_blank')}
          >
            <Mail size={20} />
            Direct Email
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-12 bg-background-tertiary border-border hover:bg-accent"
            onClick={() => {
              const phoneNumber = '393293763839'; // +39 329 376 3839
              const whatsappUrl = `https://wa.me/${phoneNumber}`;
              window.open(whatsappUrl, '_blank');
            }}
          >
            <MessageCircle size={20} />
            WhatsApp Chat
          </Button>
        </div>
      </Card>
        </TabsContent>

        {/* Academy Tab */}
        <TabsContent value="academy" className="space-y-8">
          {/* Academy Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{TEXT.ACADEMY.TRAINING_ACADEMY}</h2>
              <p className="text-foreground-secondary">{TEXT.ACADEMY.IMPROVE_SKILLS}</p>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Video className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{videoTutorials.length}</p>
                    <p className="text-sm text-muted-foreground">{TEXT.ACADEMY.VIDEO_TUTORIALS}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{pdfGuides.length}</p>
                    <p className="text-sm text-muted-foreground">{TEXT.ACADEMY.PDF_GUIDES}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Clock className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{videoTutorials.length + pdfGuides.length}</p>
                    <p className="text-sm text-muted-foreground">{TEXT.ACADEMY.TOTAL_CONTENT}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Tutorials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                {TEXT.ACADEMY.VIDEO_TUTORIALS_SECTION}
              </CardTitle>
              <CardDescription>
                {TEXT.ACADEMY.VIDEO_TUTORIALS_DESCRIPTION}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videoTutorials.map((tutorial) => (
                  <div key={tutorial.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{tutorial.level}</Badge>
                        <span className="text-sm text-muted-foreground">{tutorial.duration}</span>
                      </div>
                      <h3 className="font-semibold text-foreground">{tutorial.title}</h3>
                      <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => openYouTubeVideo(tutorial.youtubeId)}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        {TEXT.ACADEMY.WATCH_VIDEO}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PDF Guides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {TEXT.ACADEMY.PDF_GUIDES_SECTION}
              </CardTitle>
              <CardDescription>
                {TEXT.ACADEMY.PDF_GUIDES_DESCRIPTION}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pdfGuides.map((guide) => (
                  <div key={guide.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold text-foreground">{guide.title}</h3>
                          <p className="text-sm text-muted-foreground">{guide.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {guide.pages} pages • {guide.size}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadGuide(guide.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {TEXT.ACADEMY.DOWNLOAD_GUIDE}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">{TEXT.ACADEMY.NEED_PERSONALIZED_SUPPORT}</h2>
              <p className="text-muted-foreground mb-6">
                {TEXT.ACADEMY.CONTACT_FOR_TRAINING}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  {TEXT.ACADEMY.REQUEST_CONSULTATION}
                </Button>
                <Button variant="outline" size="lg">
                  {TEXT.ACADEMY.CONTACT_SUPPORT}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
