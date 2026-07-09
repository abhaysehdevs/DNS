import { BLOG_POSTS } from '@/lib/blog-data';
import BlogPostClient from './blog-post-client';
import { Metadata } from 'next';

export function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        id: post.id,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const post = BLOG_POSTS.find(p => p.id === id);
    if (!post) {
        return { title: 'Post Not Found | Dinanath & Sons' };
    }
    const title = `${post.title} | Dinanath & Sons Blog`;
    const description = post.excerpt;
    const canonicalUrl = `https://dinanathandsons.com/blog/${post.id}`;
    const image = post.image || 'https://dinanathandsons.com/placeholder.jpg';

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            type: 'article',
            url: canonicalUrl,
            images: [
                {
                    url: image,
                    alt: post.title,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        }
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = BLOG_POSTS.find(p => p.id === id);

    const articleSchema = post ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": [
            post.image || 'https://dinanathandsons.com/placeholder.jpg'
        ],
        "datePublished": post.date || "2026-06-25",
        "author": [{
            "@type": "Person",
            "name": post.author || "Dinanath & Sons",
            "url": "https://dinanathandsons.com/about"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Dinanath & Sons",
            "logo": {
                "@type": "ImageObject",
                "url": "https://dinanathandsons.com/icon.png"
            }
        },
        "description": post.excerpt
    } : null;

    const breadcrumbSchema = post ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://dinanathandsons.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://dinanathandsons.com/blog"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": `https://dinanathandsons.com/blog/${post.id}`
            }
        ]
    } : null;

    return (
        <>
            {articleSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
                />
            )}
            {breadcrumbSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            )}
            <BlogPostClient id={id} />
        </>
    );
}
