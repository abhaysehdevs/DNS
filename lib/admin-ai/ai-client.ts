import {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getOrdersSummary,
    getOrders,
    updateOrderStatus,
    createCoupon,
    listCoupons,
    toggleCoupon,
    createCategory,
    listCategories,
    getCustomersSummary,
    getSubscribers,
    getSiteSettings,
    updateSiteSettings,
    bulkUpdateProducts,
    bulkUpdateOrders,
    executeAdminAction,
    generateProductDescriptionAndSeo,
    ToolExecutionResult
} from './ai-tools';

export const GEMINI_TOOL_DECLARATIONS = [
    {
        name: 'create_product',
        description: 'Add a new product or item to the store catalog. Category, price, and name are key.',
        parameters: {
            type: 'OBJECT',
            properties: {
                name: { type: 'STRING', description: 'Product title or name (e.g. Havells 2.5mm Copper Cable)' },
                category: { type: 'STRING', description: 'Category name (e.g. Cables & Wires, Lighting, Switchgear)' },
                retail_price: { type: 'NUMBER', description: 'Retail price in Indian Rupees (INR)' },
                wholesale_price: { type: 'NUMBER', description: 'Optional wholesale price in INR (defaults to 15% discount)' },
                wholesale_moq: { type: 'INTEGER', description: 'Minimum order quantity for wholesale (default 1)' },
                description: { type: 'STRING', description: 'Detailed product description' },
                quantity: { type: 'INTEGER', description: 'Initial stock inventory quantity' },
                brand: { type: 'STRING', description: 'Brand name' }
            },
            required: ['name', 'retail_price', 'category']
        }
    },
    {
        name: 'update_product',
        description: 'Update an existing product by name or ID. Modify price, stock status, description, or category.',
        parameters: {
            type: 'OBJECT',
            properties: {
                id: { type: 'STRING', description: 'Product ID (optional if product name is provided)' },
                name: { type: 'STRING', description: 'Product name or query to identify which product to update' },
                updates: {
                    type: 'OBJECT',
                    properties: {
                        retail_price: { type: 'NUMBER', description: 'New retail price in INR' },
                        wholesale_price: { type: 'NUMBER', description: 'New wholesale price in INR' },
                        in_stock: { type: 'BOOLEAN', description: 'Whether product is currently in stock' },
                        quantity: { type: 'INTEGER', description: 'New stock quantity' },
                        description: { type: 'STRING', description: 'New description' },
                        category: { type: 'STRING', description: 'New category' }
                    }
                }
            },
            required: ['updates']
        }
    },
    {
        name: 'bulk_update_products',
        description: 'Update stock quantity, in_stock status, price, or category for ALL products in the catalog or matching a filter. Use this whenever the user says "make all products stock 72", "set all products quantity to X", or modifies multiple items at once.',
        parameters: {
            type: 'OBJECT',
            properties: {
                filter: {
                    type: 'OBJECT',
                    properties: {
                        category: { type: 'STRING', description: 'Optional category name filter (or "all")' },
                        inStock: { type: 'BOOLEAN', description: 'Optional stock status filter' },
                        query: { type: 'STRING', description: 'Optional title search filter' }
                    }
                },
                updates: {
                    type: 'OBJECT',
                    properties: {
                        quantity: { type: 'INTEGER', description: 'New stock quantity to apply to all target products (e.g. 72)' },
                        in_stock: { type: 'BOOLEAN', description: 'Whether products should be marked in stock' },
                        retail_price: { type: 'NUMBER', description: 'New retail price' },
                        wholesale_price: { type: 'NUMBER', description: 'New wholesale price' },
                        category: { type: 'STRING', description: 'New category' }
                    },
                    required: []
                }
            },
            required: ['updates']
        }
    },
    {
        name: 'bulk_update_orders',
        description: 'Update the fulfillment status of multiple orders at once (e.g. all pending orders to processing).',
        parameters: {
            type: 'OBJECT',
            properties: {
                fromStatus: { type: 'STRING', description: 'Current status to match (e.g. pending, or all)' },
                newStatus: { type: 'STRING', description: 'Target new status (pending, processing, shipped, delivered, cancelled)' }
            },
            required: ['newStatus']
        }
    },
    {
        name: 'execute_admin_action',
        description: 'Execute arbitrary database operations (select, insert, update, delete) on any admin table (products, orders, categories, coupons, site_settings, newsletter_subscribers, blog_posts). Full administrative power.',
        parameters: {
            type: 'OBJECT',
            properties: {
                table: { type: 'STRING', description: 'Target database table' },
                operation: { type: 'STRING', description: 'select, insert, update, or delete' },
                filter: { type: 'OBJECT', description: 'Key-value filter criteria' },
                data: { type: 'OBJECT', description: 'Payload data for update or insert' }
            },
            required: ['table', 'operation']
        }
    },
    {
        name: 'generate_product_description_and_seo',
        description: 'Inspect the product title, brand, and specs to write a detailed, highly specific, technical product description and SEO metadata (meta title, meta description, keywords).',
        parameters: {
            type: 'OBJECT',
            properties: {
                id: { type: 'STRING', description: 'Product ID' },
                name: { type: 'STRING', description: 'Product name or title' }
            }
        }
    },
    {
        name: 'delete_product',
        description: 'Remove or delete a product from the catalog by ID or name.',
        parameters: {
            type: 'OBJECT',
            properties: {
                id: { type: 'STRING', description: 'Product ID' },
                name: { type: 'STRING', description: 'Product name to find and delete' }
            }
        }
    },
    {
        name: 'get_products',
        description: 'Search, query, or filter products in the catalog.',
        parameters: {
            type: 'OBJECT',
            properties: {
                query: { type: 'STRING', description: 'Search term for product name or model' },
                category: { type: 'STRING', description: 'Filter by category name' },
                lowStockOnly: { type: 'BOOLEAN', description: 'If true, only returns products with less than 5 units left' },
                inStockOnly: { type: 'BOOLEAN', description: 'If true, only returns products marked in stock' }
            }
        }
    },
    {
        name: 'get_orders_summary',
        description: 'Retrieve high-level overview and metrics for all orders (total revenue, breakdown by pending/processing/delivered/cancelled, today orders).',
        parameters: {
            type: 'OBJECT',
            properties: {}
        }
    },
    {
        name: 'get_orders',
        description: 'Search and inspect orders with optional filtering by status, customer name, phone, or order ID.',
        parameters: {
            type: 'OBJECT',
            properties: {
                status: { type: 'STRING', description: 'Filter by status: pending, processing, shipped, delivered, cancelled, or all' },
                customerQuery: { type: 'STRING', description: 'Search by customer name, phone number, or email' },
                orderId: { type: 'STRING', description: 'Search by full or partial order ID' }
            }
        }
    },
    {
        name: 'update_order_status',
        description: 'Update the fulfillment status of an order.',
        parameters: {
            type: 'OBJECT',
            properties: {
                orderId: { type: 'STRING', description: 'Order ID or partial ID' },
                newStatus: { type: 'STRING', description: 'Status to set: pending, processing, shipped, delivered, or cancelled' }
            },
            required: ['orderId', 'newStatus']
        }
    },
    {
        name: 'create_coupon',
        description: 'Create a new promotional discount coupon code for customers.',
        parameters: {
            type: 'OBJECT',
            properties: {
                code: { type: 'STRING', description: 'Coupon code (e.g. SUMMER10, WELCOME500)' },
                discount_type: { type: 'STRING', description: '"percentage" or "fixed"' },
                discount_value: { type: 'NUMBER', description: 'Discount percentage (e.g. 15 for 15%) or fixed amount in INR' },
                min_order_amount: { type: 'NUMBER', description: 'Minimum order amount required to use coupon' },
                max_discount_amount: { type: 'NUMBER', description: 'Maximum cap on discount in INR (optional)' }
            },
            required: ['code', 'discount_type', 'discount_value']
        }
    },
    {
        name: 'list_coupons',
        description: 'Retrieve all existing coupons and discount codes.',
        parameters: {
            type: 'OBJECT',
            properties: {}
        }
    },
    {
        name: 'toggle_coupon',
        description: 'Activate or deactivate a coupon code.',
        parameters: {
            type: 'OBJECT',
            properties: {
                code: { type: 'STRING', description: 'Coupon code' },
                active: { type: 'BOOLEAN', description: 'true to activate, false to deactivate' }
            },
            required: ['code', 'active']
        }
    },
    {
        name: 'list_categories',
        description: 'List all store categories with display order and settings.',
        parameters: {
            type: 'OBJECT',
            properties: {}
        }
    },
    {
        name: 'create_category',
        description: 'Create a new category in the store.',
        parameters: {
            type: 'OBJECT',
            properties: {
                name: { type: 'STRING', description: 'Category name' },
                description: { type: 'STRING', description: 'Category description' }
            },
            required: ['name']
        }
    },
    {
        name: 'get_customers_summary',
        description: 'Get customer analytics, top spending clients, and repeat order statistics.',
        parameters: {
            type: 'OBJECT',
            properties: {}
        }
    },
    {
        name: 'get_subscribers',
        description: 'List email newsletter subscribers.',
        parameters: {
            type: 'OBJECT',
            properties: {}
        }
    },
    {
        name: 'navigate_to',
        description: 'Navigate the admin user to a specific admin screen.',
        parameters: {
            type: 'OBJECT',
            properties: {
                path: { type: 'STRING', description: 'Relative path e.g. /admin/products, /admin/orders, /admin/coupons, /admin/categories, /admin/settings' },
                reason: { type: 'STRING', description: 'Brief explanation why navigating' }
            },
            required: ['path']
        }
    }
];

export const SYSTEM_PROMPT = `
You are DNS Admin AI, an elite executive personal AI assistant designed exclusively for the admin and owner of "Dinanath & Sons" (DNS) B2B & Retail E-Commerce.

CRITICAL OPERATIONAL RULES:
1. You operate STRICTLY within the DNS Admin Panel. You have complete authority to inspect, create, update, and manage products, orders, coupons, categories, and settings upon command.
2. Whenever the user commands an action (e.g. "Add product...", "Update price of X to ₹...", "Show summary of orders", "Mark order #... as delivered", "Create coupon..."), ALWAYS select and call the appropriate tool.
3. Be direct, authoritative, efficient, and crystal clear. When providing summaries or data, format them cleanly using Markdown tables, bullet points, and Indian Rupee (₹) amounts with standard comma formatting.
4. After executing an action, provide a polite confirmation stating what changed, along with any key parameters.
5. If the user asks something conversational or requests advice on pricing, stock levels, or customer promotions, answer helpfully using your knowledge of DNS.
`;

export async function executeAdminTool(name: string, args: any): Promise<ToolExecutionResult> {
    switch (name) {
        case 'create_product':
            return await createProduct(args);
        case 'update_product':
            return await updateProduct(args);
        case 'bulk_update_products':
            return await bulkUpdateProducts(args);
        case 'bulk_update_orders':
            return await bulkUpdateOrders(args);
        case 'execute_admin_action':
            return await executeAdminAction(args);
        case 'generate_product_description_and_seo':
            return await generateProductDescriptionAndSeo(args);
        case 'delete_product':
            return await deleteProduct(args);
        case 'get_products':
            return await getProducts(args);
        case 'get_orders_summary':
            return await getOrdersSummary();
        case 'get_orders':
            return await getOrders(args);
        case 'update_order_status':
            return await updateOrderStatus(args);
        case 'create_coupon':
            return await createCoupon(args);
        case 'list_coupons':
            return await listCoupons();
        case 'toggle_coupon':
            return await toggleCoupon(args);
        case 'create_category':
            return await createCategory(args);
        case 'list_categories':
            return await listCategories();
        case 'get_customers_summary':
            return await getCustomersSummary();
        case 'get_subscribers':
            return await getSubscribers();
        case 'get_site_settings':
            return await getSiteSettings();
        case 'update_site_settings':
            return await updateSiteSettings(args);
        case 'navigate_to':
            return {
                success: true,
                action: 'navigate_to',
                message: `Navigating to ${args.path}. ${args.reason || ''}`,
                navigationUrl: args.path
            };
        default:
            return {
                success: false,
                action: name,
                message: `Unknown tool "${name}".`
            };
    }
}

// Intelligent Natural Language Fallback Parser
export async function parseAndExecuteFallback(userText: string): Promise<{
    reply: string;
    actionResult?: ToolExecutionResult;
}> {
    const text = userText.trim().toLowerCase();

    // 0. Catalog-Wide Bulk Product Quantity / Stock Updates
    // e.g. "make all the products' stock quantity 72", "set all products quantity to 72"
    const isBulkAllProducts = (text.includes('all') || text.includes('every')) && (text.includes('product') || text.includes('item'));

    if (isBulkAllProducts && (text.includes('stock') || text.includes('quantit') || text.includes('inventory'))) {
        const numMatch = text.match(/\b(\d+)\b/);
        if (numMatch) {
            const qty = parseInt(numMatch[1], 10);
            const res = await bulkUpdateProducts({
                updates: {
                    quantity: qty,
                    in_stock: qty > 0
                }
            });
            return {
                reply: `Command executed: All products have been updated to stock quantity **${qty}** (${qty > 0 ? 'In Stock' : 'Out of Stock'}).`,
                actionResult: res
            };
        }

        if (text.includes('in stock') || text.includes('available')) {
            const res = await bulkUpdateProducts({ updates: { in_stock: true } });
            return { reply: 'Command executed: Marked all products as In Stock.', actionResult: res };
        }
        if (text.includes('out of stock') || text.includes('unavailable')) {
            const res = await bulkUpdateProducts({ updates: { in_stock: false, quantity: 0 } });
            return { reply: 'Command executed: Marked all products as Out of Stock.', actionResult: res };
        }
    }

    // 0.1 Bulk Price Updates (e.g. "set all products price to 450")
    if (isBulkAllProducts && (text.includes('price') || text.includes('rate'))) {
        const numMatch = text.match(/(?:to|of|price)\s*₹?\s*(\d+(?:\.\d+)?)/i) || text.match(/(\d+(?:\.\d+)?)\s*(?:rs|rupees|inr)/i);
        if (numMatch) {
            const price = parseFloat(numMatch[1]);
            const res = await bulkUpdateProducts({ updates: { retail_price: price } });
            return {
                reply: `Command executed: Updated retail price of all products to ₹${price}.`,
                actionResult: res
            };
        }
    }

    // 0.2 Bulk Order Status Updates (e.g. "mark all orders as processing", "mark all pending orders as processing")
    if ((text.includes('all') || text.includes('every')) && (text.includes('order') || text.includes('orders'))) {
        const statusMatch = text.match(/(?:to|as)\s+(pending|processing|shipped|delivered|cancelled)/i);
        if (statusMatch) {
            const newStatus = statusMatch[1].toLowerCase();
            const fromStatus = text.includes('pending') ? 'pending' : (text.includes('processing') ? 'processing' : undefined);
            const res = await bulkUpdateOrders({ fromStatus, newStatus });
            return {
                reply: `Command executed: Updated ${res.data?.count || 0} order(s) to "${newStatus.toUpperCase()}".`,
                actionResult: res
            };
        }
    }

    // 0.3 AI Product Description & SEO Generation
    // e.g. "write description for Havells wire", "generate seo for copper cable"
    if (text.includes('description') || text.includes('seo') || text.includes('meta title') || text.includes('keyword')) {
        if (text.includes('write') || text.includes('generate') || text.includes('create') || text.includes('make') || text.includes('auto')) {
            const prodNameMatch = userText.match(/(?:for|of|product)\s+["']?([^"',]+?)["']?(?:\s+using|\s+with|$|\.)/i);
            const targetName = prodNameMatch ? prodNameMatch[1].trim() : userText.replace(/write|generate|create|make|auto|description|and|seo|metadata|for|product/gi, '').trim();
            if (targetName) {
                const res = await generateProductDescriptionAndSeo({ name: targetName });
                return {
                    reply: res.message,
                    actionResult: res
                };
            }
        }
    }

    // 1. Orders Summary
    if (
        (text.includes('order') || text.includes('orders')) &&
        (text.includes('summary') || text.includes('summarize') || text.includes('overview') || text.includes('report') || text.includes('how many') || text.includes('status of all'))
    ) {
        const res = await getOrdersSummary();
        return {
            reply: res.message,
            actionResult: res
        };
    }

    // 2. Pending / Recent Orders
    if (text.includes('pending order') || text.includes('orders pending') || text.includes('show orders') || text.includes('list orders') || text.includes('recent orders')) {
        const status = text.includes('pending') ? 'pending' : (text.includes('shipped') ? 'shipped' : (text.includes('delivered') ? 'delivered' : undefined));
        const res = await getOrders({ status });
        const ordersList = res.data || [];
        const formatted = ordersList.map((o: any) => `• **#${o.id.slice(0, 8)}**: ${o.customer_name || 'Customer'} - ₹${Number(o.total_amount).toLocaleString('en-IN')} (${o.status.toUpperCase()})`).join('\n');
        return {
            reply: ordersList.length > 0
                ? `Here are your ${status ? status : 'recent'} orders:\n\n${formatted}\n\n[Open Orders Page](/admin/orders)`
                : 'No matching orders found.',
            actionResult: res
        };
    }

    // 3. Update Order Status
    const updateOrderMatch = text.match(/(?:mark|update|set)\s+(?:order\s+)?#?([a-zA-Z0-9_-]+)\s+(?:as|to)\s+(pending|processing|shipped|delivered|cancelled)/i);
    if (updateOrderMatch) {
        const orderId = updateOrderMatch[1];
        const newStatus = updateOrderMatch[2].toLowerCase() as any;
        const res = await updateOrderStatus({ orderId, newStatus });
        return {
            reply: res.message,
            actionResult: res
        };
    }

    // 4. Add Product
    if (text.startsWith('add product') || text.startsWith('add a product') || text.startsWith('add new product') || text.startsWith('create product') || text.startsWith('add item') || text.startsWith('add a new item')) {
        // Parse name, price, category
        let name = 'New Product';
        let price = 500;
        let category = 'General';

        // Extract price: ₹350 or 350 rs or price 350
        const priceMatch = userText.match(/(?:price|₹|rs\.?|inr)\s*[:=]?\s*(\d+(?:\.\d+)?)/i) || userText.match(/(\d+)\s*(?:rs|rupees|inr)/i);
        if (priceMatch) {
            price = parseFloat(priceMatch[1]);
        }

        // Extract category: in category X or category: X
        const catMatch = userText.match(/(?:in\s+category|category\s*[:=]?)\s*["']?([a-zA-Z0-9\s&]+?)["']?(?:,|\.|$|\s+with|\s+at)/i);
        if (catMatch) {
            category = catMatch[1].trim();
        }

        // Extract name: named "X" or product named X or add product X
        const nameMatch = userText.match(/(?:named|called|title)\s*["']?([^"',]+?)["']?(?:\s+with|\s+in\s+category|\s+at\s+price|\s+price|$|\.)/i)
            || userText.match(/(?:add\s+(?:a\s+)?(?:new\s+)?(?:product|item)\s+)(.+?)(?:\s+with|\s+in\s+category|\s+at\s+₹|\s+price|\s+for\s+₹|$|\.)/i);
        if (nameMatch) {
            name = nameMatch[1].trim().replace(/^["']|["']$/g, '');
        }

        const res = await createProduct({
            name,
            retail_price: price,
            category,
            in_stock: true,
            quantity: 20
        });

        return {
            reply: res.message,
            actionResult: res
        };
    }

    // 5. Update Product Price / Stock
    if (text.includes('update product') || text.includes('change price') || text.includes('set price') || text.includes('update price')) {
        const priceMatch = userText.match(/(?:to|of|price)\s*₹?\s*(\d+(?:\.\d+)?)/i);
        const nameMatch = userText.match(/(?:product|for|item|of)\s+["']?([^"',]+?)["']?(?:\s+to|\s+price|$)/i);

        if (nameMatch && priceMatch) {
            const prodName = nameMatch[1].trim();
            const newPrice = parseFloat(priceMatch[1]);
            const res = await updateProduct({
                name: prodName,
                updates: { retail_price: newPrice }
            });
            return {
                reply: res.message,
                actionResult: res
            };
        }
    }

    // 6. Delete Product
    if (text.startsWith('delete product') || text.startsWith('remove product')) {
        const name = userText.replace(/delete product|remove product/i, '').trim().replace(/^["']|["']$/g, '');
        if (name) {
            const res = await deleteProduct({ name });
            return {
                reply: res.message,
                actionResult: res
            };
        }
    }

    // 7. Low stock / Find products
    if (text.includes('low stock') || text.includes('out of stock') || text.includes('check inventory')) {
        const res = await getProducts({ lowStockOnly: true });
        const items = res.data || [];
        return {
            reply: items.length > 0
                ? `⚠️ **Low Stock Alert**: ${items.length} items have less than 5 units in stock:\n\n` +
                  items.map((p: any) => `• **${p.name}**: ${p.quantity ?? 0} units left (₹${p.retail_price})`).join('\n')
                : '✅ All products currently have healthy stock levels (5+ units).',
            actionResult: res
        };
    }

    // 8. Create Coupon
    if (text.includes('create coupon') || text.includes('add coupon') || text.includes('new coupon')) {
        const codeMatch = userText.match(/(?:code\s+)?([A-Z0-9]{3,15})/i);
        const discMatch = userText.match(/(\d+)\s*%/i) || userText.match(/(\d+)\s*(?:rs|rupees|off)/i);
        const code = codeMatch ? codeMatch[1].toUpperCase() : `DNS${Math.floor(100 + Math.random() * 900)}`;
        const isPercent = text.includes('%');
        const discValue = discMatch ? parseFloat(discMatch[1]) : 10;

        const res = await createCoupon({
            code,
            discount_type: isPercent ? 'percentage' : 'fixed',
            discount_value: discValue,
            min_order_amount: 500
        });

        return {
            reply: res.message,
            actionResult: res
        };
    }

    // 9. List Coupons
    if (text.includes('coupon') && (text.includes('list') || text.includes('show') || text.includes('all'))) {
        const res = await listCoupons();
        const coupons = res.data || [];
        return {
            reply: coupons.length > 0
                ? `**Active Store Coupons**:\n\n` +
                  coupons.map((c: any) => `• **${c.code}**: ${c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`} (Min order: ₹${c.min_order_amount || 0}) - [${c.active ? 'ACTIVE' : 'INACTIVE'}]`).join('\n')
                : 'No coupons found. You can command me to create one (e.g. "Create coupon SAVE10 for 10% off").',
            actionResult: res
        };
    }

    // 10. Customers Overview
    if (text.includes('customer') || text.includes('clients') || text.includes('buyer')) {
        const res = await getCustomersSummary();
        return {
            reply: res.message,
            actionResult: res
        };
    }

    // 11. Navigation Command
    if (text.startsWith('go to') || text.startsWith('open') || text.startsWith('take me to')) {
        let target = '/admin';
        if (text.includes('product')) target = '/admin/products';
        else if (text.includes('order')) target = '/admin/orders';
        else if (text.includes('coupon')) target = '/admin/coupons';
        else if (text.includes('category') || text.includes('categories')) target = '/admin/categories';
        else if (text.includes('setting')) target = '/admin/settings';
        else if (text.includes('customer')) target = '/admin/customers';
        else if (text.includes('subscriber')) target = '/admin/subscribers';
        else if (text.includes('blog')) target = '/admin/blog';
        else if (text.includes('cms')) target = '/admin/cms';

        return {
            reply: `Taking you to ${target.replace('/admin/', '').toUpperCase() || 'Dashboard'}.`,
            actionResult: {
                success: true,
                action: 'navigate_to',
                message: `Navigating to ${target}`,
                navigationUrl: target
            }
        };
    }

    // General helpful assistant response
    return {
        reply: `I am your DNS Admin Assistant. You can command me to:
• **Products**: *"Add product Havells 2.5mm Wire with price 450 in Cables"*, *"Change price of Havells Wire to 480"*, *"Check low stock items"*
• **Orders**: *"Give me a summary of all orders"*, *"Show pending orders"*, *"Mark order #... as delivered"*
• **Coupons**: *"Create coupon FESTIVE15 for 15% off"*, *"Show all coupons"*
• **Navigation**: *"Take me to orders"*, *"Open categories"*
• **Customers**: *"Show customer overview"*

How can I assist your store operations right now?`
    };
}

export async function askGemini(
    messages: { role: 'user' | 'assistant' | 'model'; content: string }[],
    apiKey?: string
): Promise<{
    reply: string;
    actionResult?: ToolExecutionResult;
}> {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!key) {
        // If no Gemini API key, use the intelligent natural language fallback parser
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
        return await parseAndExecuteFallback(lastUserMessage);
    }

    try {
        // Format history for Gemini API
        const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        // Try gemini-2.5-flash first, then fallback to gemini-1.5-flash
        const modelNames = ['gemini-2.5-flash', 'gemini-1.5-flash'];
        let lastError: any = null;

        for (const model of modelNames) {
            try {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        systemInstruction: {
                            parts: [{ text: SYSTEM_PROMPT }]
                        },
                        tools: [{
                            functionDeclarations: GEMINI_TOOL_DECLARATIONS
                        }],
                        toolConfig: {
                            functionCallingConfig: {
                                mode: 'AUTO'
                            }
                        },
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 1024
                        }
                    })
                });

                if (!response.ok) {
                    const errBody = await response.text();
                    throw new Error(`Gemini API HTTP ${response.status}: ${errBody}`);
                }

                const data = await response.json();
                const candidate = data.candidates?.[0];
                const parts = candidate?.content?.parts || [];

                let replyText = '';
                let executedResult: ToolExecutionResult | undefined = undefined;

                for (const part of parts) {
                    if (part.text) {
                        replyText += part.text;
                    }
                    if (part.functionCall) {
                        const callName = part.functionCall.name;
                        const callArgs = part.functionCall.args || {};
                        executedResult = await executeAdminTool(callName, callArgs);

                        // If tool executed and reply is empty, synthesize response
                        if (!replyText) {
                            replyText = executedResult.message;
                        } else {
                            replyText += `\n\n${executedResult.message}`;
                        }
                    }
                }

                if (replyText || executedResult) {
                    return {
                        reply: replyText || 'Command executed successfully.',
                        actionResult: executedResult
                    };
                }
            } catch (err: any) {
                lastError = err;
                console.warn(`Gemini model ${model} failed, trying next fallback:`, err.message);
            }
        }

        throw lastError || new Error('Gemini API call returned no candidates');
    } catch (err: any) {
        console.error('Gemini error, using fallback parser:', err);
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
        return await parseAndExecuteFallback(lastUserMessage);
    }
}
