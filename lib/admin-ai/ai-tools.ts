import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export function getAdminSupabase() {
    return createClient(supabaseUrl, supabaseKey);
}

export interface ToolExecutionResult {
    success: boolean;
    action: string;
    message: string;
    data?: any;
    navigationUrl?: string;
}

// ---------------- PRODUCTS ----------------

export async function createProduct(args: {
    name: string;
    category: string;
    retail_price: number;
    wholesale_price?: number;
    wholesale_moq?: number;
    description?: string;
    in_stock?: boolean;
    quantity?: number;
    sku?: string;
    brand?: string;
    features?: string[];
    image?: string;
}): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        const baseSlug = (args.name || 'product')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        const generatedSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        const generatedSku = args.sku?.trim() || `DNS-${Date.now().toString().slice(-6)}`;

        const payload: any = {
            name: args.name,
            category: args.category || 'General',
            retail_price: Number(args.retail_price) || 0,
            wholesale_price: Number(args.wholesale_price ?? args.retail_price * 0.85) || 0,
            wholesale_moq: Number(args.wholesale_moq) || 1,
            description: args.description || '',
            in_stock: args.in_stock !== false,
            quantity: Number(args.quantity) || 10,
            sku: generatedSku,
            slug: generatedSlug,
            brand: args.brand || 'Dinanath & Sons',
            features: args.features || [],
            image: args.image || '',
            specifications: { slug: generatedSlug },
            variants: [],
            gallery: args.image ? [{ id: '1', type: 'image', url: args.image }] : []
        };

        const { data, error } = await supabase.from('products').insert([payload]).select().single();

        if (error) {
            // Retry with reduced schema if optional columns missing
            const cleanPayload = {
                name: payload.name,
                category: payload.category,
                retail_price: payload.retail_price,
                wholesale_price: payload.wholesale_price,
                wholesale_moq: payload.wholesale_moq,
                description: payload.description,
                in_stock: payload.in_stock,
                image: payload.image
            };
            const { data: retryData, error: retryError } = await supabase.from('products').insert([cleanPayload]).select().single();
            if (retryError) throw retryError;
            return {
                success: true,
                action: 'create_product',
                message: `Successfully created product "${args.name}" at ₹${args.retail_price} in category "${args.category}".`,
                data: retryData,
                navigationUrl: '/admin/products'
            };
        }

        return {
            success: true,
            action: 'create_product',
            message: `Successfully added product "${args.name}" at ₹${args.retail_price} (Wholesale: ₹${payload.wholesale_price}) in "${payload.category}".`,
            data,
            navigationUrl: '/admin/products'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'create_product',
            message: `Failed to create product: ${err.message}`
        };
    }
}

export async function updateProduct(args: {
    id?: string;
    name?: string;
    updates: {
        retail_price?: number;
        wholesale_price?: number;
        in_stock?: boolean;
        quantity?: number;
        description?: string;
        category?: string;
        name?: string;
    };
}): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        let productId = args.id;

        // If no ID is provided, try searching by name
        if (!productId && args.name) {
            const { data: matched } = await supabase
                .from('products')
                .select('id, name')
                .ilike('name', `%${args.name}%`)
                .limit(1);

            if (matched && matched.length > 0) {
                productId = matched[0].id;
            } else {
                return {
                    success: false,
                    action: 'update_product',
                    message: `Could not find any product matching "${args.name}".`
                };
            }
        }

        if (!productId) {
            return {
                success: false,
                action: 'update_product',
                message: 'Please specify the product ID or exact product name to update.'
            };
        }

        const cleanUpdates: any = {};
        if (args.updates.retail_price !== undefined) cleanUpdates.retail_price = Number(args.updates.retail_price);
        if (args.updates.wholesale_price !== undefined) cleanUpdates.wholesale_price = Number(args.updates.wholesale_price);
        if (args.updates.in_stock !== undefined) cleanUpdates.in_stock = Boolean(args.updates.in_stock);
        if (args.updates.quantity !== undefined) cleanUpdates.quantity = Number(args.updates.quantity);
        if (args.updates.description !== undefined) cleanUpdates.description = args.updates.description;
        if (args.updates.category !== undefined) cleanUpdates.category = args.updates.category;
        if (args.updates.name !== undefined) cleanUpdates.name = args.updates.name;

        const { data, error } = await supabase
            .from('products')
            .update(cleanUpdates)
            .eq('id', productId)
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            action: 'update_product',
            message: `Updated product "${data?.name || productId}" successfully with new values: ${JSON.stringify(cleanUpdates)}.`,
            data,
            navigationUrl: '/admin/products'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'update_product',
            message: `Failed to update product: ${err.message}`
        };
    }
}

export async function deleteProduct(args: { id?: string; name?: string }): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        let productId = args.id;
        let productName = args.name || '';

        if (!productId && args.name) {
            const { data } = await supabase
                .from('products')
                .select('id, name')
                .ilike('name', `%${args.name}%`)
                .limit(1);

            if (data && data.length > 0) {
                productId = data[0].id;
                productName = data[0].name;
            } else {
                return {
                    success: false,
                    action: 'delete_product',
                    message: `Could not find product matching "${args.name}".`
                };
            }
        }

        if (!productId) {
            return {
                success: false,
                action: 'delete_product',
                message: 'Please provide either the product ID or name.'
            };
        }

        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) throw error;

        return {
            success: true,
            action: 'delete_product',
            message: `Deleted product "${productName || productId}" from catalog.`,
            navigationUrl: '/admin/products'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'delete_product',
            message: `Failed to delete product: ${err.message}`
        };
    }
}

export async function getProducts(args?: {
    query?: string;
    category?: string;
    inStockOnly?: boolean;
    lowStockOnly?: boolean;
    limit?: number;
}): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        let query = supabase.from('products').select('*');

        if (args?.category && args.category !== 'All') {
            query = query.eq('category', args.category);
        }
        if (args?.inStockOnly) {
            query = query.eq('in_stock', true);
        }
        if (args?.lowStockOnly) {
            query = query.lt('quantity', 5);
        }
        if (args?.query) {
            query = query.ilike('name', `%${args.query}%`);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(args?.limit || 20);

        if (error) throw error;

        return {
            success: true,
            action: 'get_products',
            message: `Found ${data?.length || 0} products matching your criteria.`,
            data: data || [],
            navigationUrl: '/admin/products'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'get_products',
            message: `Error querying products: ${err.message}`
        };
    }
}

// ---------------- ORDERS ----------------

export async function getOrdersSummary(): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, total_amount, status, created_at, customer_name, payment_method');

        if (error) throw error;

        const totalOrders = orders?.length || 0;
        let totalRevenue = 0;
        const statusCounts: Record<string, number> = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        const todayStr = new Date().toISOString().slice(0, 10);
        let todayOrdersCount = 0;
        let todayRevenue = 0;

        orders?.forEach(o => {
            const amt = Number(o.total_amount) || 0;
            if (o.status !== 'cancelled') {
                totalRevenue += amt;
            }
            const st = (o.status || 'pending').toLowerCase();
            statusCounts[st] = (statusCounts[st] || 0) + 1;

            if (o.created_at && o.created_at.startsWith(todayStr)) {
                todayOrdersCount++;
                if (o.status !== 'cancelled') todayRevenue += amt;
            }
        });

        const summary = {
            totalOrders,
            totalRevenue,
            statusCounts,
            todayOrdersCount,
            todayRevenue,
            averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / Math.max(1, totalOrders - (statusCounts.cancelled || 0))) : 0,
            recentPending: orders?.filter(o => o.status === 'pending').slice(0, 5)
        };

        return {
            success: true,
            action: 'get_orders_summary',
            message: `Orders Overview: Total ${totalOrders} orders, Revenue: ₹${totalRevenue.toLocaleString('en-IN')}. Pending: ${statusCounts.pending}, Processing: ${statusCounts.processing}, Shipped: ${statusCounts.shipped}, Delivered: ${statusCounts.delivered}. Today's Orders: ${todayOrdersCount} (₹${todayRevenue.toLocaleString('en-IN')}).`,
            data: summary,
            navigationUrl: '/admin/orders'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'get_orders_summary',
            message: `Failed to fetch orders summary: ${err.message}`
        };
    }
}

export async function getOrders(args?: {
    status?: string;
    customerQuery?: string;
    orderId?: string;
    limit?: number;
}): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        let query = supabase.from('orders').select('*');

        if (args?.orderId) {
            query = query.ilike('id', `%${args.orderId}%`);
        }
        if (args?.status && args.status !== 'all') {
            query = query.eq('status', args.status.toLowerCase());
        }
        if (args?.customerQuery) {
            query = query.or(`customer_name.ilike.%${args.customerQuery}%,customer_phone.ilike.%${args.customerQuery}%,customer_email.ilike.%${args.customerQuery}%`);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(args?.limit || 15);

        if (error) throw error;

        return {
            success: true,
            action: 'get_orders',
            message: `Retrieved ${data?.length || 0} order(s).`,
            data: data || [],
            navigationUrl: '/admin/orders'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'get_orders',
            message: `Error fetching orders: ${err.message}`
        };
    }
}

export async function updateOrderStatus(args: {
    orderId: string;
    newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        // Find exact or partial order ID match
        let targetId = args.orderId;
        const { data: matched } = await supabase
            .from('orders')
            .select('id, customer_name, status')
            .ilike('id', `%${args.orderId}%`)
            .limit(1);

        if (matched && matched.length > 0) {
            targetId = matched[0].id;
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status: args.newStatus })
            .eq('id', targetId)
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            action: 'update_order_status',
            message: `Updated order #${targetId} (${data?.customer_name || 'Customer'}) status to "${args.newStatus}".`,
            data,
            navigationUrl: '/admin/orders'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'update_order_status',
            message: `Failed to update order status: ${err.message}`
        };
    }
}

// ---------------- COUPONS ----------------

export async function createCoupon(args: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_amount?: number;
    max_discount_amount?: number;
    expiry_date?: string;
    usage_limit?: number;
}): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        const payload = {
            code: args.code.toUpperCase().replace(/\s/g, ''),
            discount_type: args.discount_type || 'percentage',
            discount_value: Number(args.discount_value),
            min_order_amount: Number(args.min_order_amount || 0),
            max_discount_amount: args.max_discount_amount ? Number(args.max_discount_amount) : null,
            expiry_date: args.expiry_date || null,
            usage_limit: args.usage_limit ? Number(args.usage_limit) : null,
            active: true
        };

        const { data, error } = await supabase.from('coupons').insert([payload]).select().single();
        if (error) throw error;

        return {
            success: true,
            action: 'create_coupon',
            message: `Created coupon code "${payload.code}" giving ${payload.discount_type === 'percentage' ? `${payload.discount_value}% OFF` : `₹${payload.discount_value} OFF`} on minimum order ₹${payload.min_order_amount}.`,
            data,
            navigationUrl: '/admin/coupons'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'create_coupon',
            message: `Failed to create coupon: ${err.message}`
        };
    }
}

export async function listCoupons(): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        return {
            success: true,
            action: 'list_coupons',
            message: `Found ${data?.length || 0} coupons.`,
            data: data || [],
            navigationUrl: '/admin/coupons'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'list_coupons',
            message: `Failed to retrieve coupons: ${err.message}`
        };
    }
}

export async function toggleCoupon(args: { code: string; active: boolean }): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        const { data, error } = await supabase
            .from('coupons')
            .update({ active: args.active })
            .ilike('code', args.code)
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            action: 'toggle_coupon',
            message: `Coupon "${args.code}" is now ${args.active ? 'ACTIVE' : 'DEACTIVATED'}.`,
            data,
            navigationUrl: '/admin/coupons'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'toggle_coupon',
            message: `Failed to toggle coupon: ${err.message}`
        };
    }
}

// ---------------- CATEGORIES ----------------

export async function listCategories(): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
        if (error) throw error;

        return {
            success: true,
            action: 'list_categories',
            message: `Retrieved ${data?.length || 0} categories.`,
            data: data || [],
            navigationUrl: '/admin/categories'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'list_categories',
            message: `Failed to list categories: ${err.message}`
        };
    }
}

export async function createCategory(args: {
    name: string;
    description?: string;
    image_url?: string;
    is_featured?: boolean;
}): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        const slug = args.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const payload = {
            name: args.name,
            slug,
            description: args.description || '',
            image_url: args.image_url || '',
            is_featured: Boolean(args.is_featured),
            display_order: 10
        };

        const { data, error } = await supabase.from('categories').insert([payload]).select().single();
        if (error) throw error;

        return {
            success: true,
            action: 'create_category',
            message: `Successfully created category "${args.name}".`,
            data,
            navigationUrl: '/admin/categories'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'create_category',
            message: `Failed to create category: ${err.message}`
        };
    }
}

// ---------------- CUSTOMERS & SUBSCRIBERS ----------------

export async function getCustomersSummary(): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        // Collect customer details from orders
        const { data: orders, error } = await supabase
            .from('orders')
            .select('customer_name, customer_email, customer_phone, total_amount, status, created_at');

        if (error) throw error;

        const customerMap = new Map<string, {
            name: string;
            email: string;
            phone: string;
            orderCount: number;
            totalSpend: number;
            lastOrderDate: string;
        }>();

        orders?.forEach(o => {
            const key = o.customer_email || o.customer_phone || o.customer_name || 'Anonymous';
            const existing = customerMap.get(key) || {
                name: o.customer_name || 'Customer',
                email: o.customer_email || '',
                phone: o.customer_phone || '',
                orderCount: 0,
                totalSpend: 0,
                lastOrderDate: o.created_at
            };
            existing.orderCount++;
            if (o.status !== 'cancelled') {
                existing.totalSpend += Number(o.total_amount) || 0;
            }
            if (new Date(o.created_at) > new Date(existing.lastOrderDate)) {
                existing.lastOrderDate = o.created_at;
            }
            customerMap.set(key, existing);
        });

        const customersList = Array.from(customerMap.values())
            .sort((a, b) => b.totalSpend - a.totalSpend);

        return {
            success: true,
            action: 'get_customers_summary',
            message: `Found ${customersList.length} unique customers. Top customers by spend: ${customersList.slice(0, 3).map(c => `${c.name} (₹${c.totalSpend.toLocaleString('en-IN')})`).join(', ')}.`,
            data: {
                totalCustomers: customersList.length,
                topCustomers: customersList.slice(0, 10),
            },
            navigationUrl: '/admin/customers'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'get_customers_summary',
            message: `Failed to fetch customer insights: ${err.message}`
        };
    }
}

export async function getSubscribers(): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        return {
            success: true,
            action: 'get_subscribers',
            message: `Total ${data?.length || 0} newsletter subscribers.`,
            data: data || [],
            navigationUrl: '/admin/subscribers'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'get_subscribers',
            message: `Could not retrieve subscribers: ${err.message}`
        };
    }
}

// ---------------- SITE SETTINGS ----------------

export async function getSiteSettings(): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        const { data, error } = await supabase.from('site_settings').select('settings').eq('key', 'global').single();
        if (error) throw error;

        return {
            success: true,
            action: 'get_site_settings',
            message: 'Retrieved site settings.',
            data: data?.settings || {},
            navigationUrl: '/admin/settings'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'get_site_settings',
            message: `Failed to fetch settings: ${err.message}`
        };
    }
}

export async function updateSiteSettings(args: { updates: Record<string, any> }): Promise<ToolExecutionResult> {
    const supabase = getAdminSupabase();
    try {
        const { data: existing } = await supabase.from('site_settings').select('settings').eq('key', 'global').single();
        const mergedSettings = { ...(existing?.settings || {}), ...args.updates };

        const { data, error } = await supabase
            .from('site_settings')
            .upsert({
                key: 'global',
                settings: mergedSettings,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            action: 'update_site_settings',
            message: `Updated site settings: ${Object.keys(args.updates).join(', ')}.`,
            data: mergedSettings,
            navigationUrl: '/admin/settings'
        };
    } catch (err: any) {
        return {
            success: false,
            action: 'update_site_settings',
            message: `Failed to update site settings: ${err.message}`
        };
    }
}
