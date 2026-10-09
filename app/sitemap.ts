import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getCanonicalProductSlug, normalizeProduct } from '@/lib/slug'
import { CATEGORIES } from '@/lib/categories'
import { BLOG_POSTS } from '@/lib/blog-data'
import { initialBlogPosts } from '@/lib/data'
import { SITE_CONFIG } from '@/lib/site-config'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_CONFIG.baseUrl

    // 1. Core High-Priority Static Pages (NO google-merchant-feed.xml, NO changefreq/priority)
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl },
        { url: `${baseUrl}/shop` },
        { url: `${baseUrl}/new-arrivals` },
        { url: `${baseUrl}/offers` },
        { url: `${baseUrl}/blog` },
        { url: `${baseUrl}/about` },
        { url: `${baseUrl}/contact` },
        { url: `${baseUrl}/faq` },
        { url: `${baseUrl}/shipping-policy` },
        { url: `${baseUrl}/return-policy` },
        { url: `${baseUrl}/terms` },
        { url: `${baseUrl}/privacy-policy` },
    ]

    // 2. Canonical Category Routes
    const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map(cat => ({
        url: `${baseUrl}/shop/category/${cat.slug}`,
    }))

    // 3. Dynamic Canonical Product Routes with Image Metadata & Real lastmod
    let productRoutes: MetadataRoute.Sitemap = []
    try {
        const { data: products } = await supabase
            .from('products')
            .select('*')

        const catalogProducts = (products && products.length > 0)
            ? products 
            : (await import('@/lib/data')).products

        const seenSlugs = new Set<string>()

        productRoutes = catalogProducts
            .map((product: any) => {
                const normalized = normalizeProduct(product)
                const slug = getCanonicalProductSlug(normalized)
                if (!slug || seenSlugs.has(slug)) return null
                seenSlugs.add(slug)

                const rawImg = normalized.image || normalized.primaryImage
                const imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${baseUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : undefined

                const entry: MetadataRoute.Sitemap[number] = {
                    url: `${baseUrl}/shop/${slug}`,
                    images: imgUrl ? [imgUrl] : undefined,
                }

                if (product.updated_at) {
                    entry.lastModified = new Date(product.updated_at)
                }

                return entry
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    } catch (error) {
        console.error('Error generating product routes for sitemap:', error)
    }

    // 4. Dynamic Blog Routes (Combining Supabase and local posts)
    let blogRoutes: MetadataRoute.Sitemap = []
    try {
        const seenBlog = new Set<string>()
        const combinedPosts: any[] = [...BLOG_POSTS]

        const { data: dbPosts } = await supabase
            .from('blog_posts')
            .select('*')

        if (dbPosts && dbPosts.length > 0) {
            combinedPosts.push(...dbPosts)
        } else {
            combinedPosts.push(...initialBlogPosts)
        }

        blogRoutes = combinedPosts
            .map((post: any) => {
                const slug = post.slug || post.id
                if (!slug || seenBlog.has(slug)) return null
                seenBlog.add(slug)

                const rawImg = post.cover_image || post.image
                const imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${baseUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : undefined

                const entry: MetadataRoute.Sitemap[number] = {
                    url: `${baseUrl}/blog/${slug}`,
                    images: imgUrl ? [imgUrl] : undefined,
                }

                if (post.updated_at) {
                    entry.lastModified = new Date(post.updated_at)
                }

                return entry
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    } catch (error) {
        blogRoutes = BLOG_POSTS.map(post => ({
            url: `${baseUrl}/blog/${post.id}`
        }))
    }

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes]
}
