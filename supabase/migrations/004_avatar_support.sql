-- Add avatar_url to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to avatars
CREATE POLICY "Public avatar read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
