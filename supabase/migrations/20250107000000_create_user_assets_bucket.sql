-- Create storage bucket for user avatars and assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-assets', 'user-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for user-assets bucket
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-assets' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-assets');

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-assets'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-assets'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[2]
);
