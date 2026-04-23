-- 1. Create a bucket for Category Images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up Access Policies for the 'categories' bucket
-- Allow public access to read files
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'categories' );

-- Allow authenticated users (Admins) to upload files
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'categories' );

-- Allow authenticated users (Admins) to update/delete files
CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'categories' );

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'categories' );
