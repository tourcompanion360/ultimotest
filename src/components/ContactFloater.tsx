import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  X, 
  ChevronUp,
  Building2,
  User,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AgencyInfo {
  agency_name: string;
  contact_email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
}

interface ContactFloaterProps {
  projectId: string;
}

const ContactFloater: React.FC<ContactFloaterProps> = ({ projectId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAgencyInfo();
  }, [projectId]);

  const fetchAgencyInfo = async () => {
    try {
      // Get the creator info through the project relationship
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          end_clients!inner(
            creator_id,
            creators!inner(
              agency_name,
              contact_email,
              phone,
              website,
              address,
              description
            )
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error fetching agency info:', projectError);
        return;
      }

      if (projectData?.end_clients?.creators) {
        setAgencyInfo(projectData.end_clients.creators);
      }
    } catch (error) {
      console.error('Error fetching agency info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailClick = () => {
    if (agencyInfo?.contact_email) {
      window.open(`mailto:${agencyInfo.contact_email}?subject=Inquiry about Virtual Tour Project`, '_blank');
    }
  };

  const handlePhoneClick = () => {
    if (agencyInfo?.phone) {
      // Clean phone number for tel: link
      const cleanPhone = agencyInfo.phone.replace(/\D/g, '');
      window.open(`tel:${cleanPhone}`, '_blank');
    }
  };

  const handleWebsiteClick = () => {
    if (agencyInfo?.website) {
      const websiteUrl = agencyInfo.website.startsWith('http') 
        ? agencyInfo.website 
        : `https://${agencyInfo.website}`;
      window.open(websiteUrl, '_blank');
    }
  };

  const handleWhatsAppClick = () => {
    if (agencyInfo?.phone) {
      // Clean phone number for WhatsApp
      const cleanPhone = agencyInfo.phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hi! I have a question about my virtual tour project.`;
      window.open(whatsappUrl, '_blank');
    }
  };

  // Don't show if no agency info or still loading
  if (isLoading || !agencyInfo) {
    return null;
  }

  // Don't show if no contact information available
  if (!agencyInfo.contact_email && !agencyInfo.phone && !agencyInfo.website) {
    return null;
  }

  // Count available contact methods
  const contactMethods = [
    agencyInfo.contact_email && 'email',
    agencyInfo.phone && 'phone',
    agencyInfo.website && 'website'
  ].filter(Boolean).length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        <Card className="w-80 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Contact Agency</h3>
                <Badge variant="secondary" className="text-xs">
                  {contactMethods} method{contactMethods !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Agency Name */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {agencyInfo.agency_name || 'Agency'}
                </span>
              </div>

              {/* Contact Options */}
              <div className="space-y-2">
                {agencyInfo.contact_email && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEmailClick}
                    className="w-full justify-start gap-2 h-10"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email: {agencyInfo.contact_email}</span>
                  </Button>
                )}

                {agencyInfo.phone && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePhoneClick}
                      className="w-full justify-start gap-2 h-10"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">Call: {agencyInfo.phone}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleWhatsAppClick}
                      className="w-full justify-start gap-2 h-10 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">WhatsApp</span>
                    </Button>
                  </>
                )}

                {agencyInfo.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWebsiteClick}
                    className="w-full justify-start gap-2 h-10"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Visit Website</span>
                  </Button>
                )}
              </div>

              {/* Agency Description */}
              {agencyInfo.description && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {agencyInfo.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <Button
            onClick={() => setIsExpanded(true)}
            className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 border-2 border-primary/20"
            size="lg"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          {contactMethods > 1 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
            >
              {contactMethods}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactFloater;
