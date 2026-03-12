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
    return {
        title: `${post.title} | Dinanath & Sons Blog`,
        description: post.excerpt,
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BlogPostClient id={id} />;
}
