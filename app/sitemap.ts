import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { toSlug } from '@/lib/slug'
import { initialBlogPosts } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://dinanathandsons.com'
    const now = new Date()

    // Core Static Pages
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
            changeFrequency: 'weekly',
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

    // Category Routes
    const categoryRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/shop/category/hand-tools`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/shop/category/machines`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/shop/category/polishing`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/shop/category/packaging`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/shop/category/chemicals`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/shop/category/bullion`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.85,
        },
    ]

    // Dynamic Product Routes
    let productRoutes: MetadataRoute.Sitemap = []
    try {
        const { data: products } = await supabase
            .from('products')
            .select('id, name, slug, created_at, updated_at')
            .eq('in_stock', true)

        if (products && products.length > 0) {
            productRoutes = products.map((product) => {
                const slug = product.slug || toSlug(product.name) || product.id
                return {
                    url: `${baseUrl}/shop/${slug}`,
                    lastModified: new Date(product.updated_at || product.created_at || now),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                }
            })
        } else {
            const { products: localProducts } = await import('@/lib/data')
            productRoutes = localProducts.map((product) => ({
                url: `${baseUrl}/shop/${toSlug(product.name) || product.id}`,
                lastModified: now,
                changeFrequency: 'weekly',
                priority: 0.8,
            }))
        }
    } catch (error) {
        console.error('Error generating product routes for sitemap:', error)
    }

    // Dynamic Blog Routes
    let blogRoutes: MetadataRoute.Sitemap = []
    try {
        const { data: dbPosts } = await supabase
            .from('blog_posts')
            .select('id, created_at, updated_at')

        const posts = dbPosts && dbPosts.length > 0 ? dbPosts : initialBlogPosts
        blogRoutes = posts.map((post: any) => ({
            url: `${baseUrl}/blog/${post.id}`,
            lastModified: new Date(post.updated_at || post.created_at || now),
            changeFrequency: 'monthly',
            priority: 0.7,
        }))
    } catch (error) {
        blogRoutes = initialBlogPosts.map((post) => ({
            url: `${baseUrl}/blog/${post.id}`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        }))
    }

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes]
}

