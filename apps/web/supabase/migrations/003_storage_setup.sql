-- Create storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for the storage bucket
CREATE POLICY "Public can view vehicle images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vehicle-images');

CREATE POLICY "Authenticated users can upload vehicle images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vehicle-images');

CREATE POLICY "Authenticated users can update their own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'vehicle-images' AND auth.uid()::text = owner)
WITH CHECK (bucket_id = 'vehicle-images');

CREATE POLICY "Authenticated users can delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vehicle-images' AND auth.uid()::text = owner);

-- Add metadata column to knowledge_base table if not exists
ALTER TABLE knowledge_base 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create index on metadata for faster queries
CREATE INDEX IF NOT EXISTS idx_knowledge_base_metadata 
ON knowledge_base USING gin(metadata);

-- Create index for image-specific queries
CREATE INDEX IF NOT EXISTS idx_knowledge_base_source_category 
ON knowledge_base(source, category) 
WHERE source = 'image_upload';