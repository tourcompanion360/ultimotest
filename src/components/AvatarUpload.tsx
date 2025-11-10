import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Loader2, User, X, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { optimizeLogo, formatFileSize, getCompressionRatio } from '@/utils/imageOptimizer';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdated: (newUrl: string) => void;
  variant?: 'card' | 'inline';
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentAvatarUrl, onAvatarUpdated, variant = 'card' }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file (PNG, JPG, etc.)',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 10MB for original)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 10MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      // Optimize image for web - reduces size dramatically while maintaining quality
      const optimized = await optimizeLogo(file);
      
      // Show compression stats
      const compressionRatio = getCompressionRatio(optimized.originalSize, optimized.optimizedSize);
      console.log(`Image optimized: ${formatFileSize(optimized.originalSize)} → ${formatFileSize(optimized.optimizedSize)} (${compressionRatio}% smaller)`);

      // Create a unique filename with .webp extension
      const fileName = `${user.id}-${Date.now()}.webp`;
      const filePath = `avatars/${fileName}`;

      // Upload optimized image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-assets')
        .upload(filePath, optimized.blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-assets')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      onAvatarUpdated(publicUrl);

      toast({
        title: 'Success!',
        description: `Avatar uploaded! Optimized from ${formatFileSize(optimized.originalSize)} to ${formatFileSize(optimized.optimizedSize)} (${compressionRatio}% smaller)`,
      });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload avatar. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setUploading(true);

    try {
      // Update profile to remove avatar
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreviewUrl(null);
      onAvatarUpdated('');

      toast({
        title: 'Avatar Removed',
        description: 'Your avatar has been removed successfully.',
      });

    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove avatar. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  // Inline variant: minimal UI for embedding inside forms/cards
  if (variant === 'inline') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-6">
          <div className="relative">
            {previewUrl ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border">
                <img
                  src={previewUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
                {!uploading && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {previewUrl ? 'Change image' : 'Upload image'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Avatar / Logo
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardTitle>
        <CardDescription>
          Upload your profile picture or company logo. Images are automatically optimized to 512x512px WebP format for perfect quality and minimal file size.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar Preview */}
        <div className="flex items-center gap-6">
          <div className="relative">
            {previewUrl ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-border">
                <img 
                  src={previewUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
                {!uploading && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    title="Remove avatar"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {previewUrl ? 'Change image' : 'Upload image'}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Recommended: Square image, at least 200x200px. Max 10MB. Auto-optimized to WebP.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarUpload;
