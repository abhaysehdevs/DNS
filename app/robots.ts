import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/api/public/'],
                disallow: [
                    '/admin',
                    '/admin/*',
                    '/account',
                    '/account/*',
                    '/cart',
                    '/cart/*',
                    '/checkout',
                    '/checkout/*',
                    '/login',
                    '/signup',
                    '/forgot-password',
                    '/order-confirmation',
                    '/order-confirmation/*',
                    '/wishlist',
                    '/auth',
                    '/auth/*',
                    '/*?sort=',
                    '/*&sort=',
                    '/*?q=',
                    '/*?search=',
                    '/*?filter',
                    '/*?cat=',
                ],
            }
        ],
        sitemap: `${SITE_CONFIG.baseUrl}/sitemap.xml`,
    }
}
