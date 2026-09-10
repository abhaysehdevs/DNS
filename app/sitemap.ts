import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getCanonicalProductSlug } from '@/lib/slug'
import { CATEGORIES } from '@/lib/categories'
import { initialBlogPosts } from '@/lib/data'

export const revalidate = 3600 // Cache and revalidate every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://dinanathandsons.com'
    const now = new Date()

    // 1. Core High-Priority Static Pages
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.95,
        },
        {
            url: `${baseUrl}/new-arrivals`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/offers`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.85,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.85,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.75,
        },
        {
            url: `${baseUrl}/track-order`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/shipping-policy`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/return-policy`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]

    // 2. Canonical Category Routes
    const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map(cat => ({
        url: `${baseUrl}/shop/category/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
    }))

    // 3. Dynamic Canonical Product Routes with Image Metadata
    let productRoutes: MetadataRoute.Sitemap = []
    try {
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('in_stock', true)

        const catalogProducts = (products && products.length > 0)
            ? products 
            : (await import('@/lib/data')).products

        const seenSlugs = new Set<string>()

        productRoutes = catalogProducts
            .map((product: any) => {
                const slug = getCanonicalProductSlug(product)
                if (!slug || seenSlugs.has(slug)) return null
                seenSlugs.add(slug)

                const rawImg = product.image || product.image_url || product.primaryImage
                const imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${baseUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : undefined

                return {
                    url: `${baseUrl}/shop/${slug}`,
                    lastModified: new Date(product.updated_at || product.created_at || now),
                    changeFrequency: 'weekly' as const,
                    priority: 0.8,
                    images: imgUrl ? [imgUrl] : undefined,
                }
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    } catch (error) {
        console.error('Error generating product routes for sitemap:', error)
    }

    // 4. Dynamic Blog Routes
    let blogRoutes: MetadataRoute.Sitemap = []
    try {
        const { data: dbPosts } = await supabase
            .from('blog_posts')
            .select('*')

        const posts = dbPosts && dbPosts.length > 0 ? dbPosts : initialBlogPosts
        const seenBlog = new Set<string>()

        blogRoutes = posts
            .map((post: any) => {
                const slug = post.slug || post.id
                if (!slug || seenBlog.has(slug)) return null
                seenBlog.add(slug)

                const rawImg = post.cover_image || post.image
                const imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${baseUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : undefined

                return {
                    url: `${baseUrl}/blog/${slug}`,
                    lastModified: new Date(post.updated_at || post.created_at || now),
                    changeFrequency: 'weekly' as const,
                    priority: 0.75,
                    images: imgUrl ? [imgUrl] : undefined,
                }
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    } catch (error) {
        blogRoutes = initialBlogPosts.map((post) => ({
            url: `${baseUrl}/blog/${post.id}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.75,
        }))
    }

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes]
}
