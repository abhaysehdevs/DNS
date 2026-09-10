import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin',
                    '/admin/*',
                    '/api',
                    '/api/*',
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
                    '/seed',
                    '/auth',
                    '/auth/*',
                ],
            }
        ],
        sitemap: 'https://dinanathandsons.com/sitemap.xml',
        host: 'https://dinanathandsons.com',
    }
}
