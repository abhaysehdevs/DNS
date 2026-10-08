import { supabase } from '@/lib/supabase';
import { getCanonicalProductSlug, normalizeProduct } from '@/lib/slug';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function escapeHtml(str: string | undefined | null): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getGoogleCategory(cat: string): string {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('machin')) return 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Workshop Machinery';
    if (lower.includes('chemical') || lower.includes('flux')) return 'Business & Industrial > Science & Laboratory > Laboratory Chemicals';
    if (lower.includes('consumable') || lower.includes('polish') || lower.includes('buff')) return 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Polishing & Finishing';
    if (lower.includes('packaging') || lower.includes('card') || lower.includes('tag')) return 'Business & Industrial > Retail > Jewelry Packaging & Display';
    if (lower.includes('bullion') || lower.includes('gold') || lower.includes('silver')) return 'Apparel & Accessories > Jewelry > Bullion & Coins';
    if (lower.includes('cast') || lower.includes('crucible')) return 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Metal Casting Supplies';
    return 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Jewelry Making Tools';
}

export async function GET() {
    const baseUrl = 'https://dinanathandsons.com';
    const now = new Date();

    let products: any[] = [];
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
            products = data.map((p: any) => normalizeProduct(p));
        } else {
            const { products: localProducts } = await import('@/lib/data');
            products = localProducts.map((p: any) => normalizeProduct(p));
        }
    } catch (e) {
        console.error('Error querying products for Google Merchant Center feed:', e);
        const { products: localProducts } = await import('@/lib/data');
        products = localProducts.map((p: any) => normalizeProduct(p));
    }

    const inStockCount = products.filter(p => p.inStock && p.retailPrice > 0).length;

    // Build Schema.org JSON-LD graph array
    const jsonLdGraph = products.map((product) => {
        const slug = getCanonicalProductSlug(product);
        const prodUrl = `${baseUrl}/shop/${slug}`;
        const rawImg = product.image || product.primaryImage || '/placeholder.jpg';
        const imgUrl = rawImg.startsWith('http') ? rawImg : `${baseUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
        const price = Number(product.retailPrice || 0);
        const inStock = Boolean(product.inStock && price > 0);
        const sku = product.sku || product.id;

        return {
            '@type': 'Product',
            '@id': `${prodUrl}#product`,
            'name': product.name,
            'description': product.description || `Buy ${product.name} at Dinanath & Sons. Professional goldsmith tools and machinery.`,
            'url': prodUrl,
            'image': imgUrl,
            'sku': sku,
            'mpn': product.modelNumber || sku,
            'brand': {
                '@type': 'Brand',
                'name': product.brand || 'Dinanath & Sons'
            },
            'category': product.category || 'Jewellery Tools',
            'offers': {
                '@type': 'Offer',
                'url': prodUrl,
                'price': price,
                'priceCurrency': 'INR',
                'availability': inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                'itemCondition': 'https://schema.org/NewCondition',
                'priceValidUntil': '2028-12-31',
                'seller': {
                    '@type': 'Organization',
                    'name': 'Dinanath & Sons',
                    'url': baseUrl
                }
            }
        };
    });

    // Build HTML rows with microdata & standard GMC table columns
    const tableRows = products.map((product, idx) => {
        const slug = getCanonicalProductSlug(product);
        const prodUrl = `${baseUrl}/shop/${slug}`;
        const rawImg = product.image || product.primaryImage || '/placeholder.jpg';
        const imgUrl = rawImg.startsWith('http') ? rawImg : `${baseUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
        const price = Number(product.retailPrice || 0);
        const inStock = Boolean(product.inStock && price > 0);
        const availability = inStock ? 'in_stock' : 'out_of_stock';
        const availabilitySchema = inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
        const sku = product.sku || product.id;
        const brand = product.brand || 'Dinanath & Sons';
        const category = product.category || 'Jewellery Tools';
        const googleCat = getGoogleCategory(category);
        const desc = product.description || `Professional ${product.name} for jewelry manufacturing and goldsmith workshops.`;

        // Additional gallery images
        const additionalImages = (product.gallery || [])
            .filter((g: any) => g.url && g.url !== rawImg && g.type === 'image')
            .map((g: any) => g.url.startsWith('http') ? g.url : `${baseUrl}${g.url.startsWith('/') ? '' : '/'}${g.url}`)
            .slice(0, 5)
            .join(',');

        return `
        <tr itemscope itemtype="https://schema.org/Product" id="product-${escapeHtml(sku)}" class="${idx % 2 === 0 ? 'even' : 'odd'}">
            <td class="col-id" itemprop="sku">${escapeHtml(sku)}</td>
            <td class="col-title" itemprop="name">
                <a itemprop="url" href="${prodUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(product.name)}</a>
            </td>
            <td class="col-desc" itemprop="description">${escapeHtml(desc)}</td>
            <td class="col-link">
                <a href="${prodUrl}" target="_blank" rel="noopener noreferrer">${prodUrl}</a>
            </td>
            <td class="col-image">
                <link itemprop="image" href="${imgUrl}" />
                <a href="${imgUrl}" target="_blank" rel="noopener noreferrer" class="img-preview-link">
                    <img src="${imgUrl}" alt="${escapeHtml(product.name)}" width="48" height="48" loading="lazy" />
                    <span>${escapeHtml(imgUrl)}</span>
                </a>
            </td>
            <td class="col-additional-image">${escapeHtml(additionalImages)}</td>
            <td class="col-availability">
                <span class="badge ${availability}">${escapeHtml(availability)}</span>
            </td>
            <td class="col-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                <meta itemprop="price" content="${price}" />
                <meta itemprop="priceCurrency" content="INR" />
                <link itemprop="availability" href="${availabilitySchema}" />
                <link itemprop="itemCondition" href="https://schema.org/NewCondition" />
                <link itemprop="url" href="${prodUrl}" />
                <span class="price-val">${price.toLocaleString('en-IN')} INR</span>
            </td>
            <td class="col-brand" itemprop="brand" itemscope itemtype="https://schema.org/Brand">
                <span itemprop="name">${escapeHtml(brand)}</span>
            </td>
            <td class="col-condition">new</td>
            <td class="col-google-category">${escapeHtml(googleCat)}</td>
            <td class="col-product-type">${escapeHtml(category)}</td>
            <td class="col-mpn" itemprop="mpn">${escapeHtml(product.modelNumber || sku)}</td>
        </tr>`;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Merchant Center Product Feed | Dinanath & Sons</title>
    <meta name="description" content="Dynamic Google Merchant Center Product Data Feed for Dinanath & Sons. Real-time product feed supporting HTML microdata, schema.org Product, and structured tables.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${baseUrl}/google-merchant-feed.html">
    <link rel="icon" href="/icon.png" type="image/png">
    
    <!-- Schema.org JSON-LD Product Graph for Google Merchant Center crawler -->
    <script type="application/ld+json">
    ${JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': jsonLdGraph
    })}
    </script>

    <style>
        :root {
            --primary: #966E2E;
            --primary-hover: #7D5A25;
            --bg-body: #FAF9F5;
            --bg-card: #FFFFFF;
            --border: #E8E2D5;
            --text-main: #18181B;
            --text-muted: #71717A;
            --badge-in-stock: #059669;
            --badge-out-stock: #DC2626;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            padding: 24px;
            line-height: 1.5;
        }

        .header-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 24px 32px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .header-title-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 16px;
        }

        .store-brand {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--primary);
        }

        h1 {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: var(--text-main);
            margin-top: 4px;
        }

        .actions {
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--primary);
            color: #fff;
            padding: 10px 18px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: background 0.2s;
        }

        .btn:hover {
            background: var(--primary-hover);
        }

        .btn-secondary {
            background: #fff;
            color: var(--text-main);
            border: 1px solid var(--border);
        }

        .btn-secondary:hover {
            background: #F4F4F5;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
        }

        .stat-item {
            display: flex;
            flex-direction: column;
        }

        .stat-label {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .stat-value {
            font-size: 20px;
            font-weight: 800;
            color: var(--text-main);
            margin-top: 4px;
        }

        .search-bar-row {
            margin-bottom: 16px;
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .search-input {
            flex: 1;
            max-width: 450px;
            padding: 10px 16px;
            font-size: 13px;
            border: 1px solid var(--border);
            border-radius: 10px;
            background: #fff;
            outline: none;
        }

        .search-input:focus {
            border-color: var(--primary);
        }

        .table-container {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            max-width: 100%;
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            text-align: left;
        }

        thead th {
            background: #F4EFE6;
            color: #4A3B22;
            padding: 12px 14px;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 10.5px;
            letter-spacing: 0.05em;
            border-bottom: 2px solid var(--border);
            white-space: nowrap;
        }

        tbody tr {
            border-bottom: 1px solid var(--border);
            transition: background 0.15s;
        }

        tbody tr:hover {
            background: #FDFCF7;
        }

        tbody td {
            padding: 10px 14px;
            vertical-align: middle;
        }

        .col-id {
            font-family: monospace;
            font-weight: 700;
            color: var(--text-muted);
            white-space: nowrap;
        }

        .col-title {
            font-weight: 700;
            min-width: 220px;
        }

        .col-title a {
            color: var(--text-main);
            text-decoration: none;
        }

        .col-title a:hover {
            color: var(--primary);
            text-decoration: underline;
        }

        .col-desc {
            max-width: 280px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: var(--text-muted);
        }

        .col-link a {
            color: var(--primary);
            text-decoration: none;
            max-width: 180px;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .col-image img {
            border-radius: 6px;
            border: 1px solid var(--border);
            background: #fff;
            object-fit: contain;
        }

        .img-preview-link {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-muted);
            text-decoration: none;
        }

        .img-preview-link span {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 10px;
        }

        .col-additional-image {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 10px;
            color: var(--text-muted);
        }

        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            white-space: nowrap;
        }

        .badge.in_stock {
            background: #D1FAE5;
            color: var(--badge-in-stock);
        }

        .badge.out_of_stock {
            background: #FEE2E2;
            color: var(--badge-out-stock);
        }

        .price-val {
            font-weight: 800;
            color: var(--primary);
            white-space: nowrap;
        }

        .col-brand {
            font-weight: 600;
            white-space: nowrap;
        }

        .col-condition {
            text-transform: uppercase;
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted);
        }

        .col-google-category, .col-product-type {
            font-size: 11px;
            color: var(--text-muted);
            white-space: nowrap;
        }

        .col-mpn {
            font-family: monospace;
            font-size: 11px;
        }

        .instructions-card {
            margin-top: 24px;
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 24px 32px;
            font-size: 13px;
        }

        .instructions-card h2 {
            font-size: 16px;
            font-weight: 800;
            margin-bottom: 12px;
            color: var(--text-main);
        }

        .instructions-card ol {
            padding-left: 20px;
            color: #3F3F46;
        }

        .instructions-card li {
            margin-bottom: 8px;
        }

        .code-box {
            background: #F4F4F5;
            padding: 8px 12px;
            border-radius: 8px;
            font-family: monospace;
            display: inline-block;
            margin-top: 4px;
            font-size: 12px;
            user-select: all;
        }
    </style>
</head>
<body>

    <header class="header-card">
        <div class="header-title-row">
            <div>
                <span class="store-brand">Dinanath & Sons • Official Merchant Data Feed</span>
                <h1>Google Merchant Center Product Feed</h1>
            </div>
            <div class="actions">
                <button class="btn" onclick="navigator.clipboard.writeText('${baseUrl}/google-merchant-feed.html').then(() => alert('Feed URL copied to clipboard!'))">
                    📋 Copy Feed URL
                </button>
                <a class="btn btn-secondary" href="/shop" target="_blank">
                    🏪 Visit Store Catalog
                </a>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-label">Total Listed Items</span>
                <span class="stat-value">${products.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">In-Stock Products</span>
                <span class="stat-value" style="color: var(--badge-in-stock);">${inStockCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Feed Standard</span>
                <span class="stat-value" style="font-size: 15px; font-weight: 700;">HTML / Microdata / JSON-LD</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Dynamic Status</span>
                <span class="stat-value" style="font-size: 14px; color: var(--primary);">⚡ Live DB Connected</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Last Generated</span>
                <span class="stat-value" style="font-size: 13px; font-family: monospace;">${now.toISOString().split('T')[0]}</span>
            </div>
        </div>
    </header>

    <div class="search-bar-row">
        <input type="text" id="filterInput" class="search-input" placeholder="🔍 Filter products by name, SKU, or category..." onkeyup="filterProducts()" />
        <span id="matchCount" style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Showing all ${products.length} items</span>
    </div>

    <!-- Official Google Merchant Center Product Feed Table -->
    <main class="table-container">
        <table id="productsTable">
            <thead>
                <tr>
                    <th>id</th>
                    <th>title</th>
                    <th>description</th>
                    <th>link</th>
                    <th>image_link</th>
                    <th>additional_image_link</th>
                    <th>availability</th>
                    <th>price</th>
                    <th>brand</th>
                    <th>condition</th>
                    <th>google_product_category</th>
                    <th>product_type</th>
                    <th>mpn</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    </main>

    <footer class="instructions-card">
        <h2>How to add this feed to Google Merchant Center:</h2>
        <ol>
            <li>Log into your <strong>Google Merchant Center</strong> account (<a href="https://merchants.google.com" target="_blank" rel="noopener">merchants.google.com</a>).</li>
            <li>Navigate to <strong>Products</strong> &rarr; <strong>Feeds</strong> (or <strong>Data sources</strong>).</li>
            <li>Click <strong>Add products</strong> / <strong>Add data source</strong> and select <strong>Website Crawl</strong>, <strong>Scheduled Fetch</strong>, or <strong>File upload</strong>.</li>
            <li>Provide your feed link:<br />
                <span class="code-box">${baseUrl}/google-merchant-feed.html</span>
            </li>
            <li>Select <strong>Scheduled Fetch</strong> (Frequency: Daily) so Google automatically pulls new products, price changes, and stock updates directly from this dynamic page!</li>
        </ol>
    </footer>

    <script>
        function filterProducts() {
            var input = document.getElementById("filterInput");
            var filter = input.value.toLowerCase();
            var table = document.getElementById("productsTable");
            var trs = table.getElementsByTagName("tr");
            var visibleCount = 0;

            for (var i = 1; i < trs.length; i++) {
                var rowText = trs[i].textContent || trs[i].innerText;
                if (rowText.toLowerCase().indexOf(filter) > -1) {
                    trs[i].style.display = "";
                    visibleCount++;
                } else {
                    trs[i].style.display = "none";
                }
            }
            document.getElementById("matchCount").innerText = "Showing " + visibleCount + " of " + (trs.length - 1) + " items";
        }
    </script>
</body>
</html>`;

    return new Response(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
    });
}
