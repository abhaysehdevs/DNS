import { supabase } from './supabase';
import { BLOG_POSTS, BlogPost } from './blog-data';

export type { BlogPost };

export function toBlogSlug(text: string): string {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * Fetch all published blog posts. Queries Supabase `blog_posts` table first,
 * falling back to initial `BLOG_POSTS` if the table does not exist or has no rows.
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
            const dbPosts: BlogPost[] = data
                .filter((p: any) => p.is_published !== false)
                .map((p: any) => ({
                    id: p.slug || p.id,
                    title: p.title,
                    excerpt: p.excerpt || '',
                    content: p.content || '',
                    date: p.created_at
                        ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Recent',
                    category: p.category || 'Guides',
                    author: p.author || 'Dinanath Technical Editorial',
                    authorRole: p.author_role || 'Technical Editorial',
                    readTime: p.read_time || '5 min read',
                    image: p.image || '/blog-1.jpg',
                    tags: Array.isArray(p.tags)
                        ? p.tags
                        : (typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : ['Jewellery', 'Tools']),
                    isPublished: p.is_published !== false
                }));

            if (dbPosts.length > 0) {
                return dbPosts;
            }
        }
    } catch (err) {
        console.warn('Could not load blog posts from Supabase, using local catalog:', err);
    }

    return BLOG_POSTS;
}

/**
 * Fetch a single blog post by its ID or slug.
 */
export async function getBlogPostByIdOrSlug(idOrSlug: string): Promise<BlogPost | null> {
    if (!idOrSlug) return null;

    try {
        // 1. Check by slug
        const { data: bySlug, error: slugErr } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', idOrSlug)
            .maybeSingle();

        if (!slugErr && bySlug) {
            return {
                id: bySlug.slug || bySlug.id,
                title: bySlug.title,
                excerpt: bySlug.excerpt || '',
                content: bySlug.content || '',
                date: bySlug.created_at
                    ? new Date(bySlug.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recent',
                category: bySlug.category || 'Guides',
                author: bySlug.author || 'Dinanath Technical Editorial',
                authorRole: bySlug.author_role || 'Technical Editorial',
                readTime: bySlug.read_time || '5 min read',
                image: bySlug.image || '/blog-1.jpg',
                tags: Array.isArray(bySlug.tags)
                    ? bySlug.tags
                    : (typeof bySlug.tags === 'string' ? bySlug.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : ['Jewellery', 'Tools']),
                isPublished: bySlug.is_published !== false
            };
        }

        // 2. Check by ID
        const { data: byId, error: idErr } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', idOrSlug)
            .maybeSingle();

        if (!idErr && byId) {
            return {
                id: byId.slug || byId.id,
                title: byId.title,
                excerpt: byId.excerpt || '',
                content: byId.content || '',
                date: byId.created_at
                    ? new Date(byId.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recent',
                category: byId.category || 'Guides',
                author: byId.author || 'Dinanath Technical Editorial',
                authorRole: byId.author_role || 'Technical Editorial',
                readTime: byId.read_time || '5 min read',
                image: byId.image || '/blog-1.jpg',
                tags: Array.isArray(byId.tags)
                    ? byId.tags
                    : (typeof byId.tags === 'string' ? byId.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : ['Jewellery', 'Tools']),
                isPublished: byId.is_published !== false
            };
        }
    } catch (err) {
        console.warn('Error querying blog post by ID or slug:', err);
    }

    // 3. Fallback to local catalog
    const local = BLOG_POSTS.find(p => p.id === idOrSlug || toBlogSlug(p.title) === idOrSlug);
    return local || null;
}
