-- Supabase Storage Setup for Goal Proofs Gallery
-- Run this in Supabase SQL Editor

-- Create storage bucket for goal proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('goal-proofs', 'goal-proofs', true);

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload goal proofs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'goal-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own proof files
CREATE POLICY "Users can view goal proofs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'goal-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own proof files
CREATE POLICY "Users can update goal proofs" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'goal-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own proof files
CREATE POLICY "Users can delete goal proofs" ON storage.objects
FOR DELETE USING (
  bucket_id = 'goal-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: File paths will be like "proofs/user_id/filename.jpg"
-- This ensures users can only access their own proof files
