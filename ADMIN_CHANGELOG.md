# Admin Panel Changelog (ADMIN_CHANGELOG.md)

All changes made to the Dinanath & Sons Admin Panel (`/admin/*`), database schemas, server actions, and security mechanisms are recorded here by phase.

---

## [Phase 1] - Confirmed Bugs & Foundations (Completed)

### 1.1 Database Schema Alignment & SEO Fixes
- **Root Cause**: Product edit saves triggered repeated `400` errors (`PGRST204: Could not find 'seo_description' column of 'products' in schema cache`) because PostgREST lacked canonical SEO columns (`meta_title`, `meta_description`, `meta_keywords`, `slug`). The frontend repeatedly stripped keys and retried in an 6-pass loop, losing keywords and preventing slug persistence.
- **Migration**: Added [`supabase/migrations/20261012_phase1_admin_fixes.sql`](file:///c:/Users/pc/Documents/GitHub/DNS/supabase/migrations/20261012_phase1_admin_fixes.sql) and [`database_scripts/phase1_admin_fixes.sql`](file:///c:/Users/pc/Documents/GitHub/DNS/database_scripts/phase1_admin_fixes.sql).
  - Added additive columns: `meta_title text`, `meta_description text`, `meta_keywords text`, `slug text`, `canonical_url text`, `og_image_url text`, `noindex boolean default false`, and `deleted_at timestamptz default null` across `products`, `categories`, and `blog_posts`.
  - Added partial unique index `idx_products_slug_unique` on `products (slug)` where `deleted_at IS NULL`.
  - Backfilled existing `slug`, `seo_title`, `seo_description`, and `seo_keywords` from `specifications` JSONB into first-class columns so zero data is lost.
  - Created `redirects` table (`source_path text unique`, `target_path text`, `status_code int default 301`) for automatic 301 slug redirect handling.
- **Single-Pass Save & Error Handling**: Completely removed the 6-iteration column stripping loop in [`app/admin/products/page.tsx`](file:///c:/Users/pc/Documents/GitHub/DNS/app/admin/products/page.tsx). Saves now execute in a single roundtrip. If rejected by Postgres, an error banner is shown with the exact message and the modal stays open.
- **SEO Studio UI**:
  - Live character count counters for Meta Title (target 50–60 characters) and Meta Description (target 140–160 characters).
  - Google SERP search result live preview box simulating desktop and mobile Google snippets.
  - Auto-generated slug generator with duplicate slug collision warnings.
  - Automatic 301 redirect creation prompt when changing an existing product's slug.
  - Connected "Generate SEO with AI" button to server AI route.
- **Storefront Metadata Support**: Updated [`app/(store)/shop/[id]/page.tsx`](file:///c:/Users/pc/Documents/GitHub/DNS/app/(store)/shop/[id]/page.tsx), [`app/(store)/product/[slug]/page.tsx`](file:///c:/Users/pc/Documents/GitHub/DNS/app/(store)/product/[slug]/page.tsx), [`app/(store)/blog/[id]/page.tsx`](file:///c:/Users/pc/Documents/GitHub/DNS/app/(store)/blog/[id]/page.tsx), and [`lib/slug.ts`](file:///c:/Users/pc/Documents/GitHub/DNS/lib/slug.ts) to read the new canonical SEO columns for page `<title>`, `<meta name="description">`, keywords, canonical URLs, Open Graph images, and Product JSON-LD structured data.

### 1.2 Modal Unmount & Ghost Overlay Fix
- **Root Cause**: Product edit modal was wrapped in Framer Motion `AnimatePresence` with an unmounting exit transition dependent on browser `requestAnimationFrame`. When tabs were backgrounded or unfocused, exit callbacks stalled, leaving invisible yet clickable backdrop DOM elements.
- **Resolution**: Replaced lagging exit animations in [`app/admin/products/page.tsx`](file:///c:/Users/pc/Documents/GitHub/DNS/app/admin/products/page.tsx) with direct conditional rendering, clean backdrop unmounting, and keyboard Esc escape handling. Save failures keep modal open with clear error toasts.

### 1.3 Unexplained Failed Save Request (HTTP 0)
- **Root Cause**: Hardcoded Google Analytics 4 tracking script in root layout fired tracking pings on every route and modal state change. In administrative sessions, browser privacy shields/adblockers blocked these requests, producing status `0` network failures.
- **Resolution**: Created [`components/google-analytics.tsx`](file:///c:/Users/pc/Documents/GitHub/DNS/components/google-analytics.tsx) which isolates GA4 exclusively to storefront routes, skipping `/admin/*` entirely.

### 1.4 Real Client IP & Session Diagnostics
- **Root Cause**: Dashboard "Active Operators" reported hardcoded `IP: 127.0.0.1`.
- **Resolution**:
  - Created [`app/api/admin/sessions/route.ts`](file:///c:/Users/pc/Documents/GitHub/DNS/app/api/admin/sessions/route.ts) which inspects proxy headers (`x-forwarded-for`, `x-real-ip`, `cf-connecting-ip`) to record real public IP addresses, user agent browser/OS, and geolocation.
  - Integrated session heartbeat in [`app/admin/layout.tsx`](file:///c:/Users/pc/Documents/GitHub/DNS/app/admin/layout.tsx) with automatic remote log-out detection if a session is revoked.
  - Active Operators widget in [`app/admin/page.tsx`](file:///c:/Users/pc/Documents/GitHub/DNS/app/admin/page.tsx) now displays real IP, detected browser/OS, and city.

### 1.5 Settings & Data Import Fixes
- **Active Sessions**: Replaced infinite "Loading active sessions..." spinner in [`app/admin/settings/page.tsx`](file:///c:/Users/pc/Documents/GitHub/DNS/app/admin/settings/page.tsx) with real session manager supporting individual session revocation and "Sign out all other devices".
- **Data Import**: Replaced "Coming Soon" with a functional JSON and CSV data import tool in [`app/admin/settings/page.tsx`](file:///c:/Users/pc/Documents/GitHub/DNS/app/admin/settings/page.tsx), featuring row counts, field validation, and typed confirmation before ingestion.
- **Form Validation & Saved Badges**: Added 15-character GSTIN regex validation (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`), 0–100% tax rate validation, URL scheme verification, and clear saved badges.

### 1.6 Dashboard Honesty & Telemetry
- Replaced decorative "Global storage engine / synced / global CDN active" banner with real-time database latency telemetry and Supabase storage connectivity checks.
- Harmonized "Low Stock Items" stat card and "Inventory Alerts" widget to evaluate the exact same criteria (`low_stock_threshold ?? 5`, excluding soft-deleted items).
- Fixed deep-links for Quick Actions:
  - Add Product: `/admin/products?action=new` (auto-opens modal on arrival)
  - Categories: `/admin/categories`
  - Ship Orders: `/admin/orders?status=processing` (auto-filters order list)
  - Marketing: `/admin/cms`

### 1.7 AI Assistant Safeguards & Security Hardening
- **Secret Isolation**: Completely removed Gemini API key input from client settings. AI endpoints in [`app/api/admin/ai/route.ts`](file:///c:/Users/pc/Documents/GitHub/DNS/app/api/admin/ai/route.ts) read strictly from server-side `process.env.GEMINI_API_KEY`. Added [`app/api/admin/ai/status/route.ts`](file:///c:/Users/pc/Documents/GitHub/DNS/app/api/admin/ai/status/route.ts) for safe status checks without exposing keys.
- **Human-in-the-Loop Confirmation**: Modified [`lib/admin-ai/ai-client.ts`](file:///c:/Users/pc/Documents/GitHub/DNS/lib/admin-ai/ai-client.ts) to classify all mutation tools (`add_new_product`, `update_product_price`, `delete_product`, `change_order_status`, `create_discount_coupon`) into `WRITE_TOOLS`. They now generate structured confirmation cards showing before/after diffs.
- **Typed Confirmation for Destructive Actions**: Deletions or bulk changes require typing `"CONFIRM"` before the server action executes via [`app/api/admin/ai/confirm/route.ts`](file:///c:/Users/pc/Documents/GitHub/DNS/app/api/admin/ai/confirm/route.ts).
- **Prompt Injection Defense**: System prompt in [`lib/admin-ai/ai-client.ts`](file:///c:/Users/pc/Documents/GitHub/DNS/lib/admin-ai/ai-client.ts) explicitly sandboxes user data (product copy, customer messages, drafts) as untrusted content, forbidding instructions within data strings.
- **Global Killswitch & Audit Logging**: Added "Disable AI write actions" toggle in Settings and writes all AI actions to [`app/api/admin/audit-logs/route.ts`](file:///c:/Users/pc/Documents/GitHub/DNS/app/api/admin/audit-logs/route.ts).

### 1.7b Soft Deletes & Recycle Bin
- Replaced hard `DELETE` queries with soft deletion (`deleted_at = now()`) in [`app/admin/products/page.tsx`](file:///c:/Users/pc/Documents/GitHub/DNS/app/admin/products/page.tsx).
- Added **Recycle Bin** tab to the product manager:
  - Shows soft-deleted items with a one-click **Restore** action.
  - Permanent delete requires typing the exact product title to prevent accidental loss.
- In Settings Danger Zone, factory reset requires typing `"CONFIRM RESET"` and writes to the audit log.
