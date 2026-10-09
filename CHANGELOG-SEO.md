# CHANGELOG-SEO.md — Dinanath & Sons SEO & Google Merchant Center Compliance

This document records all changes, refactors, files touched, and verification procedures implemented to make `dinanathandsons.com` 100% crawlable, indexable, and compliant with Google Merchant Center requirements as of 9 October 2026.

---

## 1. Workstream A — Canonical Host, Redirects, HTTPS & DNS
- **Decision & Default**: Selected canonical apex domain `https://dinanathandsons.com` (consistent with canonical tags, sitemap, robots, and Google Merchant Center feeds).
- **Changes Implemented**:
  - Configured 301 permanent redirect from `www.dinanathandsons.com` to `dinanathandsons.com` via `next.config.ts`.
  - Added HTTP Strict Transport Security (HSTS) header: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.
  - Enforced `trailingSlash: false` with single-hop canonicalization.
  - Implemented 301 redirect away from `/seed` to `/shop`.
  - Updated all PDP WhatsApp inquiry links to resolve via canonical slug URL rather than internal database UUIDs.
- **Files Touched**:
  - `next.config.ts`
  - `lib/site-config.ts`
  - `app/(store)/shop/[id]/product-client.tsx`
  - `lib/slug.ts`
- **Verification Method**:
  - Verified redirect rules in `next.config.ts`.
  - Executed link validator ensuring zero UUID-based inquiry links.

---

## 2. Workstream B — Server-Side Crawlability & Initial HTML Rendering
- **Audit Problem Addressed**: Listing pages (`/shop`, `/offers`, `/new-arrivals`) emitted empty placeholders ("Accessing catalog database", "Loading Special Offers") with client-side loading spinners.
- **Changes Implemented**:
  - Converted `/shop`, `/offers`, `/new-arrivals`, and `/shop/category/[slug]` to Server Components with server-side prefetching.
  - Rendered full initial HTML containing product names, prices, stock availability, images with alt text, and `<a href="/shop/[slug]">` links.
  - Removed "Loading..." skeletons and spinners from initial server-rendered HTML.
  - Updated `robots.txt` (`app/robots.ts`):
    - Removed unsupported `Host:` directive.
    - Removed `/seed` public advertising route.
    - Added crawl-budget disallow rules for parameter URLs (`/*?sort=`, `/*?q=`, `/*?cat=`).
    - Explicitly allowed `/api/public/` for essential rendering endpoints.
- **Files Touched**:
  - `app/(store)/shop/page.tsx`
  - `app/(store)/shop/shop-client.tsx`
  - `app/(store)/offers/page.tsx`
  - `app/(store)/new-arrivals/page.tsx`
  - `app/(store)/shop/category/[slug]/page.tsx`
  - `app/robots.ts`
- **Verification Method**:
  - Next.js production build (`npm run build`) statically generated all routes with full HTML markup.
  - Executed `scripts/check-links.mjs` confirming all links resolve without dead ends or broken placeholders.

---

## 3. Workstream C — Sitemaps & Indexation Architecture
- **Audit Problem Addressed**: Single sitemap listed `/google-merchant-feed.xml`, used artificial build-time timestamps, and omitted older blog guides.
- **Changes Implemented**:
  - Removed `/google-merchant-feed.xml` from `app/sitemap.ts`.
  - Removed ignored `changefreq` and `priority` attributes.
  - Implemented real `updated_at` lastmod timestamps preserved from the catalog.
  - Added all 5 blog guides (`essential-jewellery-making-tools-equipment-guide`, `magnetic-polishing-machine-jewellery-buyer-guide`, `jewellery-packaging-materials-wholesale-guide`, etc.).
  - Added image sitemap tags (`images: [imgUrl]`) using crawlable HTTPS URLs.
- **Files Touched**:
  - `app/sitemap.ts`
  - `lib/blog-data.ts`
- **Verification Method**:
  - Inspected sitemap route generation during `next build`, confirming clean XML output and zero utility endpoints listed.

---

## 4. Workstream D — Metadata Templates & Character Truncation Fixes
- **Audit Problem Addressed**: Truncated title bug (`…jewelry maki`), repetitive brand titles, trailing ellipses in descriptions, boilerplate "Buy" prefixes on out-of-stock items, and sitewide `meta keywords`.
- **Changes Implemented**:
  - Implemented single metadata helper in `lib/site-config.ts` and `app/(store)/shop/[id]/page.tsx`.
  - Formatted titles to `{Product Name} | Dinanath & Sons` (<= 65 chars, brand once at the end, trimmed strictly at word boundaries without cutting words in half).
  - Sanitized meta descriptions to 120–155 characters; removed "Buy" on out-of-stock items.
  - Removed `meta keywords` sitewide across layout and pages.
  - Configured OpenGraph `og:type=product` for PDPs, `og:type=article` for blog posts, and `og:type=website` elsewhere.
  - Set `<html lang="en-IN">` and Open Graph `locale: 'en_IN'`.
- **Files Touched**:
  - `app/layout.tsx`
  - `app/(store)/shop/[id]/page.tsx`
  - `lib/site-config.ts`
  - `lib/product-copy.ts`
- **Verification Method**:
  - Created and ran `scripts/audit-metadata.mjs`: verified 135 pages with 0 errors and 0 warnings.

---

## 5. Workstream E — Schema.org Structured Data (JSON-LD)
- **Audit Problem Addressed**: Missing or unverified JSON-LD, fake review ratings ("5.0 Verified Quality Rating" with 0 reviews).
- **Changes Implemented**:
  - Implemented sitewide `@graph` structured data in `app/layout.tsx` containing:
    - `Organization`: name, canonical URL, logo, NAP address, contactPoint, foundingDate (1960), sameAs profiles.
    - `Store` / `LocalBusiness`: Maliwara Chandni Chowk shop with geo coordinates and operating hours (Mon-Sat 11:00-20:00).
    - `WebSite`: canonical search and identification.
  - Added Server-Rendered `Product` + `Offer` schema on every PDP (`app/(store)/shop/[id]/page.tsx`):
    - Real brand, MPN (when real), itemCondition `NewCondition`.
    - Real price > 0 in INR; availability (`InStock` / `OutOfStock`).
    - Embedded `MerchantReturnPolicy` (7-day defect replacement guarantee).
    - Embedded `OfferShippingDetails` (free shipping > ₹1,999, pan-India coverage).
  - Replaced breadcrumb "Inventory" with "Shop" across visible UI and `BreadcrumbList` schema.
  - Stripped fake 5.0 rating and 5 filled stars when customer review array is empty (`components/reviews.tsx`).
- **Files Touched**:
  - `app/layout.tsx`
  - `app/(store)/shop/[id]/page.tsx`
  - `components/reviews.tsx`
  - `components/shop/breadcrumbs.tsx`
  - `app/(store)/faq/page.tsx`
- **Verification Method**:
  - Validated schema structures against Schema.org and Google Search Central requirements.

---

## 6. Workstream F — Content Quality, NAP Consistency & Trust Fixes
- **Audit Problem Addressed**: Conflicting founding dates (1960 vs 1980), exaggerated unverified claims (4500+ clients, 42 export nodes, AI-driven precision testing), fabricated copywriting ("ideal for electricians").
- **Changes Implemented**:
  - Reconciled founding year to `1960` across homepage, About page, footer, metadata, and JSON-LD.
  - Cleaned About page (`app/(store)/about/page.tsx`): removed unverified claims (4,500+ clients, 42 export nodes, aerospace alloys, AI testing); presented authentic heritage workshop facts.
  - Standardized NAP address string across all surfaces: `1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi - 110006, India`.
  - Replaced hard-coded stats on homepage ("500+ tools", "120+ hand tools") with true database-driven numbers ("110+ Precision Tools", Hand Tools 63, Machines 16, Consumables 14, Chemicals 8, Packaging 12).
  - Converted `/faq/page.tsx` to Server Component with server-rendered `<details>`/`<summary>` elements.
  - Added GST transparency note ("Inclusive of GST") on all PDPs and checkout.
- **Files Touched**:
  - `app/(store)/about/page.tsx`
  - `app/(store)/home-client.tsx`
  - `components/hero.tsx`
  - `components/footer.tsx`
  - `app/(store)/faq/page.tsx`
  - `app/(store)/shop/[id]/product-client.tsx`
- **Verification Method**:
  - Full static build test; link checker; grep checks across all files for banned marketing phrases.

---

## 7. Workstream G — Google Merchant Center Feed Optimization
- **Audit Problem Addressed**: Out-of-stock items exported with price 0.00 INR (P0-1); gold/silver bullion present in feed (P0-2); blanket 0.00 INR shipping on heavy machinery (P0-4); third-party items labeled with "Dinanath & Sons" brand (P0-8); fake MPNs (P0-9); asbestos and hazardous gas listings.
- **Changes Implemented**:
  - Refactored `app/google-merchant-feed.xml/route.ts`:
    - Strict price > 0 filter (filters out all 31 items with price 0).
    - Excluded raw gold and silver bullion (retains only decorative coin packaging cards).
    - Excluded regulated asbestos sheets and pressurized butane canisters.
    - Detected and assigned real manufacturer brands (`Marathon`, `Saeshin`, `Foredom`, `Clarion`, `Tik-Tak`, `HandWise`, `MiniCraft`, `P.N. Budh`, `Kwality`).
    - Handcrafted own-label items emit `identifier_exists=no` and omit MPN tag.
    - Assigned official Google Product Category (GPC) nodes.
    - Replaced blanket 0.00 INR shipping with categorized `shipping_label` (`parcel` vs `heavy_freight`) and `shipping_weight`.
    - Excluded `.jfif` image extensions.
    - Stripped zero-width whitespace and special characters from XML strings.
- **Files Touched**:
  - `app/google-merchant-feed.xml/route.ts`
  - `lib/taxonomy.ts`
  - `lib/product-copy.ts`
  - `clean_products.json`
- **Verification Method**:
  - Automated feed validator `scripts/validate-feed.mjs`: tested 78 feed items with 0 errors and 0 warnings.

---

## 8. Automated Audit & Validation Suite Created
- `scripts/validate-feed.mjs`: Validates price > 0, currency format, URL canonicalization, brand validity, GPC validity, and hazard exclusions.
- `scripts/check-links.mjs`: Verifies 13 static pages, 7 category pages, 111 product slugs, 99 legacy redirect mappings, 5 blog posts, and checks for dead links (`href="#"`).
- `scripts/audit-metadata.mjs`: Audits title lengths, description lengths, absence of unescaped HTML entities, trailing ellipses, and meta keywords across 135 pages.

---

## 9. Google Search Console Live Audit Remediation (9 October 2026)
- **Search Console Audit Addressed**:
  - **76 Alternate page with proper canonical tag**: Diagnosed live server host redirect (Vercel edge redirecting apex -> www with 307 while canonical tags pointed to apex). Implemented edge host canonicalization in `middleware.ts` and document dashboard instructions for Vercel.
  - **10 Redirect errors**: Root category shortcuts (`/chemicals`, `/packaging`, `/polishing`, `/hand-tools`, etc.) added to `next.config.ts` redirects.
  - **29 Page with redirect**: Added 99 verified single-hop 301 redirects in `next.config.ts` and `lib/slug.ts` for all legacy short slugs, Foredom slug, and UUID URLs.
  - **1 Soft 404**: `/shop?cat=Consumables` now 301 redirects to `/shop/category/consumables`, returning 404 on invalid category parameters.
  - **9 Crawled – currently not indexed**: Merged evergreen guides in `lib/blog.ts` (`essential-tools-2026`, `gold-casting-techniques`) so all 9 blog posts are statically rendered with internal links and author attribution. Enriched `lakh-bangle-choodi-9080` with comprehensive workshop specifications.
  - **9 Not found (404)**: Mapped old crucible and polishing machine slugs to live products. Mapped deleted demo UUIDs to clean 404 responses.
  - **Product snippets / Merchant listings (missing fields)**: Added `offers.validFrom` and `offers.shippingDetails.deliveryTime` (`handlingTime` and `transitTime`) to Product JSON-LD in `app/(store)/shop/[id]/page.tsx`.
- **Files Touched**:
  - `middleware.ts`
  - `next.config.ts`
  - `app/(store)/shop/page.tsx`
  - `app/(store)/shop/[id]/page.tsx`
  - `lib/blog.ts`
  - `lib/blog-data.ts`
  - `lib/slug.ts`
  - `clean_products.json`
  - `docs/seo-verification/redirect-audit.md`
  - `docs/seo-verification/priority-urls.txt`
- **Verification Method**:
  - Next.js 16 production build succeeded with exit code 0 across all 177 static routes.
  - `scripts/check-links.mjs`: 99/99 redirects verified, 0 errors.
  - `scripts/audit-metadata.mjs`: 135 pages audited, 0 errors.
  - `scripts/validate-feed.mjs`: 78 products verified, 0 errors.
