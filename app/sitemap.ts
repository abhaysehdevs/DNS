import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://dinanathandsons.com'

    // Static routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ]

    // Dynamic product routes
    try {
        const { data: products } = await supabase
            .from('products')
            .select('id, created_at')
            .eq('in_stock', true)

        if (products) {
            const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
                url: `${baseUrl}/shop/${product.id}`,
                lastModified: new Date(product.created_at || new Date()),
                changeFrequency: 'monthly',
                priority: 0.7,
            }))
            
            return [...routes, ...productRoutes]
        }
    } catch (error) {
        console.error('Error generating dynamic sitemap:', error)
    }

    return routes
}
