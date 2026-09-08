import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/account/',
                    '/cart/',
                    '/checkout/',
                    '/login/',
                    '/signup/',
                    '/forgot-password/',
                    '/order-confirmation/',
                    '/wishlist/',
                    '/seed/',
                    '/auth/',
                ],
            }
        ],
        sitemap: 'https://dinanathandsons.com/sitemap.xml',
    }
}

