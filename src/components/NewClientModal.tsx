import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  sanitizeEmail, 
  sanitizeCompanyName, 
  sanitizePersonName,
  sanitizeTextInput 
} from '@/utils/inputValidation';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Globe,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client: any) => void;
}

const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onClientCreated }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    clientWebsite: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    let sanitizedValue = value;
    
    switch (field) {
      case 'clientName':
        sanitizedValue = sanitizePersonName(value);
        break;
      case 'clientEmail':
        sanitizedValue = sanitizeEmail(value);
        break;
      case 'clientCompany':
        sanitizedValue = sanitizeCompanyName(value);
        break;
      case 'clientPhone':
      case 'clientWebsite':
      case 'notes':
        sanitizedValue = sanitizeTextInput(value);
        break;
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const validateForm = () => {
    if (!formData.clientName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Client name is required',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.clientEmail.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Client email is required',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.clientCompany.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Company name is required',
        variant: 'destructive'
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.clientEmail)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a client',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get creator ID from user
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (creatorError || !creator) {
        console.error('Error finding creator:', creatorError);
        toast({
          title: 'Error',
          description: 'Creator profile not found. Please contact support.',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      // Create the client
      const { data: newClient, error: clientError } = await supabase
        .from('end_clients')
        .insert({
          creator_id: creator.id,
          name: formData.clientName.trim(),
          email: formData.clientEmail.trim().toLowerCase(),
          phone: formData.clientPhone.trim() || null,
          company: formData.clientCompany.trim(),
          website: formData.clientWebsite.trim() || null,
          status: 'active',
          login_credentials: {
            notes: formData.notes.trim() || null
          }
        })
        .select()
        .single();

      if (clientError) {
        console.error('Error creating client:', clientError);
        throw clientError;
      }

      toast({
        title: 'Success!',
        description: `Client "${formData.clientName}" has been created successfully.`,
      });

      // Call the callback with the new client
      onClientCreated(newClient);

      // Reset form and close
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientCompany: '',
        clientWebsite: '',
        notes: ''
      });
      onClose();

    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create client. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientCompany: '',
        clientWebsite: '',
        notes: ''
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            Add New Client
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
              <CardDescription>
                Enter the client's contact and company details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client Name *
                  </Label>
                  <Input
                    id="clientName"
                    placeholder="John Doe"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientCompany" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company Name *
                  </Label>
                  <Input
                    id="clientCompany"
                    placeholder="Acme Corporation"
                    value={formData.clientCompany}
                    onChange={(e) => handleInputChange('clientCompany', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientPhone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="clientPhone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="clientWebsite" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="clientWebsite"
                    placeholder="https://www.company.com"
                    value={formData.clientWebsite}
                    onChange={(e) => handleInputChange('clientWebsite', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this client..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Client...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Client
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewClientModal;
