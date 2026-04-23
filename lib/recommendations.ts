
import { Product } from './data';
import { supabase } from './supabase';

// Helper to calculate similarity score (0 to 1)
function calculateSimilarity(p1: Product, p2: Product): number {
    let score = 0;

    // 1. Category Match (High weight)
    if (p1.category === p2.category) score += 0.5;

    // 2. Name Word Match (Medium weight)
    const words1 = p1.name.toLowerCase().split(' ');
    const words2 = p2.name.toLowerCase().split(' ');
    const commonWords = words1.filter(w => words2.includes(w) && w.length > 3); // Ignore short words
    score += (commonWords.length * 0.1);

    // 3. Price Range Match (Low weight) - people buy in similar budget
    const priceDiffRatio = Math.abs(p1.retailPrice - p2.retailPrice) / p1.retailPrice;
    if (priceDiffRatio < 0.3) score += 0.1;

    return Math.min(score, 1);
}

// 1. Smart Related Products (Context-Aware)
export async function getSmartRelatedProducts(currentProduct: Product, limit: number = 4): Promise<Product[]> {
    // Fetch a pool of potential candidates (e.g., same category + some others)
    const { data: candidates } = await supabase
        .from('products')
        .select('*')
        .neq('id', currentProduct.id); // Exclude current

    if (!candidates) return [];

    const mappedCandidates: Product[] = candidates.map((p: any) => {
        const primaryImage = p.image || p.image_url || '/placeholder.jpg';
        return {
            id: p.id,
            name: p.name,
            description: p.description,
            retailPrice: p.retail_price,
            wholesalePrice: p.wholesale_price,
            wholesaleMOQ: p.wholesale_moq,
            primaryImage: primaryImage,
            image: primaryImage,
            gallery: (p.gallery && p.gallery.length > 0) ? p.gallery : [{ id: '1', type: 'image', url: primaryImage }],
            category: p.category,
            inStock: p.in_stock,
            reviews: p.reviews || []
        };
    });

    // Cross-Selling Logic Rules
    // If Machine -> Recommend Consumables/Tools
    // If Consumable -> Recommend Tools
    const crossSellMap: Record<string, string[]> = {
        'Machinery': ['Consumables', 'Tools'], // Buy machine -> buy consumables for it
        'Tools': ['Consumables', 'Machinery'], // Buy tool -> buy consumables
        'Consumables': ['Tools'],             // Buy consumable -> buy tool to use it
        'Packaging': ['Packaging'],           // Packaging usually goes with packaging
        'Chemicals': ['Tools', 'Consumables']
    };

    const preferredCategories = crossSellMap[currentProduct.category] || [currentProduct.category];

    // Score and Sort
    const scoredProducts = mappedCandidates.map(p => {
        let score = calculateSimilarity(currentProduct, p);

        // Boost Cross-Sell Categories
        if (preferredCategories.includes(p.category)) {
            score += 0.3; // Boost score
        }

        // Boost "Frequently Bought Together" (Simulated hardcoded pairs for demo)
        // e.g. Ring Enlarger + Hammer
        if (currentProduct.name.includes('Enlarger') && p.name.includes('Hammer')) score += 2.0;
        if (currentProduct.name.includes('Suhaga') && p.name.includes('Torch')) score += 2.0;

        return { product: p, score };
    });

    return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.product);
}

// 2. Personalized Recommendations (User History Based)
export async function getPersonalizedRecommendations(viewedProductIds: string[], limit: number = 4): Promise<Product[]> {
    if (viewedProductIds.length === 0) return [];

    // Fetch details of viewed products to understand user preference
    const { data: viewedProducts } = await supabase
        .from('products')
        .select('category, retail_price')
        .in('id', viewedProductIds);

    if (!viewedProducts || viewedProducts.length === 0) {
        // Fallback: Trending / Best Sellers
        return getTrendingProducts(limit);
    }

    // Analyze Preference
    const categoryCounts: Record<string, number> = {};
    let totalPrice = 0;
    viewedProducts.forEach((p: any) => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
        totalPrice += p.retail_price;
    });

    const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b);
    const avgBudget = totalPrice / viewedProducts.length;

    // Fetch Recommendations matching preference
    const { data: recommendations } = await supabase
        .from('products')
        .select('*')
        .eq('category', topCategory) // Match favorite category
        .gte('retail_price', avgBudget * 0.5) // Within budget range
        .lte('retail_price', avgBudget * 2.5)
        .limit(limit * 2); // Fetch more to filter

    if (!recommendations) return getTrendingProducts(limit);

    // Filter out already viewed
    const filtered = recommendations.filter((p: any) => !viewedProductIds.includes(p.id));

    // Map and return
    return filtered.slice(0, limit).map((p: any) => {
        const primaryImage = p.image || p.image_url || '/placeholder.jpg';
        return {
            id: p.id,
            name: p.name,
            description: p.description,
            retailPrice: p.retail_price,
            wholesalePrice: p.wholesale_price,
            wholesaleMOQ: p.wholesale_moq,
            primaryImage: primaryImage,
            image: primaryImage,
            gallery: (p.gallery && p.gallery.length > 0) ? p.gallery : [{ id: '1', type: 'image', url: primaryImage }],
            category: p.category,
            inStock: p.in_stock,
            reviews: p.reviews || []
        };
    });
}

// 3. Trending / Best Sellers (Simple Fallback)
export async function getTrendingProducts(limit: number = 4): Promise<Product[]> {
    const { data } = await supabase
        .from('products')
        .select('*')
        .limit(limit); // For now just grab top products. In real app, order by sales_count.

    if (!data) return [];

    return data.map((p: any) => {
        const primaryImage = p.image || p.image_url || '/placeholder.jpg';
        return {
            id: p.id,
            name: p.name,
            description: p.description,
            retailPrice: p.retail_price,
            wholesalePrice: p.wholesale_price,
            wholesaleMOQ: p.wholesale_moq,
            primaryImage: primaryImage,
            image: primaryImage,
            gallery: (p.gallery && p.gallery.length > 0) ? p.gallery : [{ id: '1', type: 'image', url: primaryImage }],
            category: p.category,
            inStock: p.in_stock,
            reviews: p.reviews || []
        };
    });
}
