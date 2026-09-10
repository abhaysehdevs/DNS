-- ==============================================================================
-- SQL MIGRATION: BLOG POSTS TABLE SETUP & PERMISSIONS
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. Create the blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    excerpt TEXT,
    content TEXT,
    category TEXT DEFAULT 'Guides',
    author TEXT DEFAULT 'Dinanath Technical Editorial',
    author_role TEXT DEFAULT 'Technical Editorial',
    read_time TEXT DEFAULT '5 min read',
    image TEXT,
    tags TEXT[] DEFAULT ARRAY['Jewellery', 'Engineering']::TEXT[],
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts (is_published);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 4. Public can read all published posts
DROP POLICY IF EXISTS "Public Read Blog Posts" ON public.blog_posts;
CREATE POLICY "Public Read Blog Posts"
ON public.blog_posts FOR SELECT
USING (true);

-- 5. Allow inserts, updates, and deletes
DROP POLICY IF EXISTS "Admin CRUD Blog Posts" ON public.blog_posts;
CREATE POLICY "Admin CRUD Blog Posts"
ON public.blog_posts FOR ALL
USING (true)
WITH CHECK (true);

-- 6. Insert initial seed articles if table is empty
INSERT INTO public.blog_posts (id, title, slug, excerpt, content, category, author, author_role, read_time, image, tags, is_published, created_at)
VALUES 
(
    'essential-tools-2026',
    'Top 5 Tools Every Master Goldsmith Needs in 2026',
    'essential-tools-2026',
    'Discover the essential tools that can exponentially increase your productivity, precision, and profit margins in jewelry manufacturing.',
    '<p>The landscape of jewelry manufacturing is rapidly evolving. Gone are the days when traditional hand tools alone were enough to remain competitive. Today, integrating advanced, precision-engineered tools is paramount for any goldsmith looking to scale their operations or achieve unparalleled detail.</p><h3>1. Advanced Micro-Welding Systems</h3><p>Pulse arc welders like the Orion series have revolutionized how repairs and custom fabrications are handled. By allowing pinpoint heat application without damaging surrounding stones or heat-sensitive materials, jewelers can perform tasks that were previously deemed impossible.</p><h3>2. High-Torque Micromotors</h3><p>A reliable micromotor is the extension of a jeweler''s hand. Modern brushless micromotors offer consistent torque at low speeds, which is crucial for diamond setting and intricate texturing work. Look for models with ergonomic handpieces to reduce fatigue during extended sessions.</p><h3>3. Precision Rolling Mills</h3><p>Investing in a high-quality combination rolling mill ensures perfectly flat sheet metal and correctly shaped wire. The gear ratios on top-tier models reduce physical strain, while the hardened steel rollers guarantee a flawless, mirror-like finish on your stock.</p><h3>4. Digital Calipers alongside Traditional Gauges</h3><p>While the brass gauge is a staple, digital calipers provide the microscopic accuracy needed for CAD-designed parts and precise stone setting. The ability to switch instantly between millimeters and inches saves valuable mental bandwidth.</p><h3>5. Specialized Setting Burs</h3><p>Using the right bur for the specific mounting style dictates the longevity and security of the gemstone. Investing in a comprehensive set of high-speed steel or carbide setting burs ensures clean, precise seats for stones, significantly upgrading the final aesthetic of the piece.</p><blockquote>"The craftsman is only as good as his tools, but choosing the right tools is the mark of a master craftsman."</blockquote><p>Upgrading your bench with these five categories of tools will not only speed up your workflow but will inevitably reflect in the superior quality of your final products. At Dinanath & Sons, we pride ourselves on supplying these essential, industrial-grade tools to artisans worldwide.</p>',
    'Guides',
    'Abhay Soni',
    'Technical Director',
    '4 min read',
    'https://images.unsplash.com/photo-1599643478524-fb66f4538638?q=80&w=2000&auto=format&fit=crop',
    ARRAY['Tools', 'Equipment', 'Goldsmithing', 'Upgrades'],
    true,
    '2026-02-10T10:00:00Z'
),
(
    'gold-casting-techniques',
    'Understanding High-Yield Gold Casting Techniques',
    'gold-casting-techniques',
    'A deep dive into vacuum casting versus centrifugal casting. We explore which methodology guarantees the best yield for your specific workshop setup.',
    '<p>Casting is arguably the most critical and temperamental stage in jewelry manufacturing. A perfect wax model means nothing if the casting process fails. In this guide, we break down the two reigning titans of the workshop: Vacuum Casting and Centrifugal Casting.</p><h3>Vacuum Casting: The Precision Choice</h3><p>Vacuum assist casting relies on exactly what the name implies: a vacuum. By placing the perforated flask into a vacuum chamber, the system draws the molten metal down into the mold cavities.</p><p><strong>Pros:</strong> Excellent for extremely intricate, filigree designs. Highly consistent and generally safer as there are no rapidly spinning crucibles of molten metal.</p><p><strong>Cons:</strong> Slower cycle times and occasionally struggles with very dense, chunky pieces where absolute force is needed to fill the mold.</p><h3>Centrifugal Casting: The Forceful Standard</h3><p>Centrifugal casting uses the sheer force of a rapidly spinning arm to throw molten metal into the flask.</p><p><strong>Pros:</strong> Incredible mold-fill capabilities for heavy rings and thick items. Faster cycle times for bulk production.</p><p><strong>Cons:</strong> Requires careful balancing of the centrifuge arm. Higher risk due to the mechanical spinning action. Can sometimes ''wash out'' very fine details due to the aggressive force of the metal entry.</p><h3>Which Is Right For You?</h3><p>If your workshop focuses on bespoke, highly intricate, or delicate custom pieces, investing in a robust vacuum casting system is highly recommended. However, if your business model revolves around high-volume signet rings, heavy chains, or dense components, a reliable centrifugal machine will be your workhorse.</p>',
    'Technical',
    'Dinanath Team',
    'Casting Specialists',
    '6 min read',
    'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2000&auto=format&fit=crop',
    ARRAY['Casting', 'Vacuum', 'Centrifugal', 'Manufacturing'],
    true,
    '2026-01-25T10:00:00Z'
),
(
    'maintenance-rolling-mills',
    'Crucial Maintenance Routines for Rolling Mills',
    'maintenance-rolling-mills',
    'Extend the life of your expensive rolling machinery with these simple, non-negotiable maintenance routines implemented by top factories.',
    '<p>A rolling mill is often the most expensive piece of equipment on a jeweler''s bench. It is a workhorse that operates under immense pressure. Without proper care, the hardened steel rollers can become pitted, permanently transferring flaws to your sheet and wire.</p><h3>1. Daily Cleaning is Non-Negotiable</h3><p>Never leave your mill dirty at the end of the day. Metal dust, especially silver and copper, can oxidize and cause micro-pitting on the rollers. Wipe the rollers down daily with a clean, soft cloth.</p><h3>2. The Importance of Lubrication</h3><p>The gears of your rolling mill endure incredible torque. Once a week, apply a high-quality machine grease to the main drive gears. Do NOT get grease on the flat rolling surfaces, as this will transfer to your precious metals.</p><h3>3. Rust Prevention in Humid Climates</h3><p>If your workshop is in a humid environment, rust is your biggest enemy. Keep a light coating of 3-in-1 oil on the rollers when the mill is not in use overnight. Before rolling fresh metal, simply wipe the oil away with a dry cloth and a tiny bit of denatured alcohol.</p><h3>4. Avoid Over-Compression</h3><p>Never try to reduce the thickness of your metal by too much in a single pass. This stresses the gears and the frame of the mill. Always anneal your metal properly between passes to keep it soft and pliable. "Roll, anneal, repeat" is the golden rule.</p>',
    'Technical',
    'Ajay Soni',
    'Machinery Expert',
    '4 min read',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2000&auto=format&fit=crop',
    ARRAY['Maintenance', 'Rolling Mill', 'Machinery', 'Longevity'],
    true,
    '2026-01-12T10:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
