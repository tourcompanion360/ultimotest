import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, ExternalLink, Mail, Share2, Eye, CheckCircle } from 'lucide-react';

interface ShareClientPortalProps {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  projectCount?: number;
}

const ShareClientPortal: React.FC<ShareClientPortalProps> = ({
  clientId,
  clientName,
  clientEmail,
  clientCompany,
  projectCount = 0
}) => {
  const { toast } = useToast();
  const [portalUrl, setPortalUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Generate the unified client portal URL (not project-specific)
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/client/${clientId}`;
    setPortalUrl(url);
  }, [clientId]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setIsCopied(true);
      toast({
        title: "URL Copied!",
        description: "Client portal URL has been copied to clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy URL. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const openPortal = () => {
    window.open(portalUrl, '_blank');
  };

  const sendEmail = () => {
    const projectText = projectCount === 1 ? 'project' : 'projects';
    const subject = `Your Client Portal - ${clientCompany || clientName}`;
    const body = `Hi ${clientName},

Your unified client portal is ready! Click the link below to access all your ${projectCount} ${projectText}:

${portalUrl}

In your portal, you can:
• View all your projects in one place
• Access project details and analytics
• Download shared media files
• Submit requests for changes
• Chat with your AI assistants

If you have any questions, please don't hesitate to contact us.

Best regards,
Your Tour Creator Team`;

    const mailtoUrl = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-foreground">Share Client Portal</h2>
        <p className="text-sm text-muted-foreground">
          Share the unified portal with {clientName} to access all {projectCount} {projectCount === 1 ? 'project' : 'projects'} in one place.
        </p>
      </div>

      {/* Portal URL Section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Client Portal URL</Label>
        <div className="flex items-center gap-2">
          <Input
            value={portalUrl}
            readOnly
            className="flex-1 bg-muted/30 border-border font-mono text-sm"
          />
          <Button
            onClick={copyToClipboard}
            className="shrink-0 min-w-[120px]"
          >
            {isCopied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Share this URL with your client. They can access their portal directly.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={openPortal}
          className="flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Eye className="h-4 w-4" />
          Preview Portal
        </Button>
        
        <Button
          onClick={sendEmail}
          className="flex items-center justify-center gap-2 h-11 rounded-lg bg-indigo-500 text-white shadow-sm transition-colors hover:bg-indigo-500/90"
        >
          <Mail className="h-4 w-4" />
          Send Email
        </Button>
      </div>

      {/* How to Share Section */}
      <div className="space-y-3 pt-1">
        <h3 className="text-base font-semibold text-foreground">How to Share</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">1</span>
            <span className="pt-0.5">Copy the URL above or scan the QR code.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">2</span>
            <span className="pt-0.5">Send it to your client via email, WhatsApp, or any messaging app.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">3</span>
            <span className="pt-0.5">Your client clicks the link to access their portal.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">4</span>
            <span className="pt-0.5">They can view all their projects, analytics, and submit requests.</span>
          </li>
        </ol>
      </div>

      {/* What Client Sees Section */}
      <div className="space-y-3 pt-1">
        <h3 className="text-base font-semibold text-foreground">What Your Client Will See</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="pt-0.5">All their projects in one unified dashboard.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="pt-0.5">Project details, analytics, and performance metrics.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="pt-0.5">Media library to download shared files.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="pt-0.5">Request form to ask for changes across all projects.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ShareClientPortal;
