-- 1. Create the newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/anon) to insert their email for subscription
CREATE POLICY "Allow anonymous subscription"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users (admins) to select/read subscriptions
CREATE POLICY "Allow authenticated read subscriptions"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to delete subscriptions if needed
CREATE POLICY "Allow authenticated delete subscriptions"
  ON public.newsletter_subscribers FOR DELETE
  TO authenticated
  USING (true);

-- 2. Create the categories storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS policies for categories storage bucket
-- Enable object access policies
CREATE POLICY "Public Read Access on Categories"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'categories' );

CREATE POLICY "Authenticated Upload on Categories"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'categories' );

CREATE POLICY "Authenticated Update on Categories"
  ON storage.objects FOR UPDATE
  TO authenticated
  WITH CHECK ( bucket_id = 'categories' );

CREATE POLICY "Authenticated Delete on Categories"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ( bucket_id = 'categories' );

-- 4. Create the navigation_pages table
CREATE TABLE IF NOT EXISTS public.navigation_pages (
  page_key text PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  banner_image_url text,
  product_ids uuid[] DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.navigation_pages ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public select navigation_pages"
  ON public.navigation_pages FOR SELECT
  USING (true);

-- Allow authenticated users (admins) full access
CREATE POLICY "Allow authenticated full navigation_pages"
  ON public.navigation_pages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Populate default values
INSERT INTO public.navigation_pages (page_key, title, subtitle)
VALUES 
  ('new-arrivals', 'New Arrivals', 'Explore our latest collection of premium jewelry machinery and tools.'),
  ('offers', 'Special Offers', 'Get exclusive wholesale and retail deals on high-quality tools.')
ON CONFLICT (page_key) DO NOTHING;
