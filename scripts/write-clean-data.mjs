import fs from 'fs';

const clean = fs.readFileSync('./clean_products.json', 'utf8');

const content = `export interface Review {
    id: string;
    userName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    verifiedPurchase: boolean;
    helpfulCount: number;
}

export interface ProductMedia {
    id: string;
    type: 'image' | 'video';
    url: string;
    altText?: string;
    thumbnailUrl?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    retailPrice: number;
    wholesalePrice?: number;
    wholesaleMOQ: number;

    primaryImage: string;
    image?: string;
    videoUrl?: string;
    gallery: ProductMedia[];

    category: string;
    inStock: boolean;
    quantity?: number;
    reviews: Review[];

    brand?: string;
    modelNumber?: string;
    sku?: string;
    weight?: string;
    dimensions?: { length: string; width: string; height: string; };
    warrantyInfo?: string;
    features?: string[];
    specifications?: Record<string, string>;

    groupId?: string; 
    variantAttributes?: Record<string, string>; 
    variants?: any[];
    variantType?: string;
    slug?: string;
}

export const products: Product[] = ${clean};

export const getProductGallery = (product: any): ProductMedia[] => {
    if (product.gallery && product.gallery.length > 0) return product.gallery;
    return [{ id: 'default', type: 'image', url: product.image || product.primaryImage || '/placeholder.jpg' }];
};

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content?: string;
    date: string;
    category: string;
    author: string;
    readTime: string;
    image: string;
}

export const initialBlogPosts: BlogPost[] = [
    {
        id: 'essential-tools-2026',
        title: 'Top 10 Essential Jewellery Workshop Tools in 2026',
        excerpt: 'Discover the precision machinery, ultrasonic cleaners, and rolling mills every modern workshop needs.',
        content: 'Building a modern jewellery manufacturing workshop requires reliable, precision-engineered equipment. From micro-welding torches to digital rolling mills, having the right tools ensures consistent quality and higher output.',
        date: 'Aug 5, 2026',
        category: 'Guides & Engineering',
        author: 'Dinanath Editorial Team',
        readTime: '5 min read',
        image: '/blog-1.jpg'
    },
    {
        id: 'gold-casting-techniques',
        title: 'Mastering Gold & Silver Investment Casting',
        excerpt: 'A comprehensive guide to temperature control, vacuum burnout cycles, and defect-free casting.',
        content: 'Investment casting is both an art and an exact science. Achieving zero-porosity gold and silver castings requires strict monitoring of flask temperatures, burnout ramp rates, and vacuum pressure.',
        date: 'Jul 28, 2026',
        category: 'Casting & Metallurgy',
        author: 'Technical Metallurgy Dept',
        readTime: '7 min read',
        image: '/blog-2.jpg'
    },
    {
        id: 'maintenance-rolling-mills',
        title: 'Rolling Mill Maintenance & Calibration Guide',
        excerpt: 'How to lubricate gear trains, protect roller surfaces from pitting, and calibrate parallel gaps.',
        content: 'Proper maintenance doubles the operational lifespan of heavy-duty rolling mills. Regular gear greasing and post-work rust prevention oiling are mandatory for smooth operations.',
        date: 'Jul 15, 2026',
        category: 'Maintenance',
        author: 'Engineering Ops',
        readTime: '4 min read',
        image: '/blog-3.jpg'
    }
];
`;

fs.writeFileSync('./lib/data.ts', content, 'utf8');
console.log('Successfully wrote updated lib/data.ts with all 111 clean products');
