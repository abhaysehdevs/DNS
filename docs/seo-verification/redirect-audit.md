# Redirect & Canonical Host Audit Report

Date: 9 October 2026  
Domain: `dinanathandsons.com` / `www.dinanathandsons.com`

---

## 1. Live Diagnosis (Four Host Variants)

Live testing performed directly against the production edge servers:

```text
1. http://dinanathandsons.com
   -> HTTP/1.1 308 Permanent Redirect
   -> Location: https://dinanathandsons.com/

2. https://dinanathandsons.com
   -> HTTP/1.1 307 Temporary Redirect
   -> Location: https://www.dinanathandsons.com/

3. http://www.dinanathandsons.com
   -> HTTP/1.1 308 Permanent Redirect
   -> Location: https://www.dinanathandsons.com/

4. https://www.dinanathandsons.com
   -> HTTP/2 200 OK
   -> HTML Canonical: <link rel="canonical" href="https://dinanathandsons.com/">
```

### Root Cause Analysis of GSC Failures
- **The Core Conflict**: The hosting platform (Vercel edge rule) was configured to temporarily redirect `https://dinanathandsons.com` (apex) to `https://www.dinanathandsons.com/` (307). Meanwhile, all page code, sitemaps, JSON-LD, and HTML canonical tags were declaring the apex `https://dinanathandsons.com` as canonical!
- **Consequence in GSC**:
  - **76 "Alternate page with proper canonical tag"**: Google crawled `www`, read the canonical tag pointing to apex, requested apex, and received a 307 redirect sending it right back to `www`!
  - **10 "Redirect error"**: Category shortcuts (`/chemicals`, `/packaging`, `/hand-tools`) and `/shop?cat=Consumables` traversed multiple hops between www and apex, terminating in 404s or looping.
  - **97 "Discovered – currently not indexed"**: Apex URLs discovered via canonical tags were rejected from indexing because the host redirected them away.

---

## 2. Codebase Remediations Implemented

### A. Edge Host Canonicalization (`middleware.ts`)
Intercepts any incoming request on `www.dinanathandsons.com` and immediately issues a single-hop permanent 301 redirect to `https://dinanathandsons.com`:
```typescript
if (host.startsWith('www.dinanathandsons.com')) {
    const targetUrl = new URL(request.url);
    targetUrl.host = 'dinanathandsons.com';
    targetUrl.protocol = 'https:';
    return NextResponse.redirect(targetUrl.toString(), 301);
}
```

### B. Category Shortcut 301 Redirects (`next.config.ts`)
Prevents redirect loops on root category visits:
- `/chemicals` -> 301 to `/shop/category/chemicals`
- `/packaging` -> 301 to `/shop/category/packaging`
- `/polishing` -> 301 to `/shop/category/polishing`
- `/hand-tools` -> 301 to `/shop/category/hand-tools`
- `/machines` -> 301 to `/shop/category/machines`
- `/consumables` -> 301 to `/shop/category/consumables`
- `/bullion` -> 301 to `/shop/category/bullion`
- `/shop/category/tools` -> 301 to `/shop/category/hand-tools`

### C. GSC Reported 404 & Legacy Slug 301 Redirects (`next.config.ts` & `lib/slug.ts`)
- `/shop/graphite-crucible-70-70` -> 301 to `/shop/dinanaths-graphite-crucible-1405`
- `/shop/graphite-crucible-75-75` -> 301 to `/shop/dinanaths-graphite-crucible-1405`
- `/shop/dinanaths-graphite-crucible` -> 301 to `/shop/dinanaths-graphite-crucible-1405`
- `/shop/e020a21b-e90e-4330-b619-f7ce9664564e` -> 301 to `/shop/dinanaths-graphite-crucible-1405`
- `/shop/magnetic-polishing-machine-8-inch` -> 301 to `/shop/magnetic-polishing-machine-0743`
- `/shop/marathon-m4-lab-micromotor` -> 301 to `/shop/marathon-m4-lab-micromotor-4222`
- `/shop/tik-tak-silver-cleaner` -> 301 to `/shop/tik-tak-silver-cleaner-8225`
- `/shop/suhaga-goti-khaar-goti` -> 301 to `/shop/suhaga-goti-khaar-goti-7767`
- `/shop/nipper-cutter` -> 301 to `/shop/dinanath-s-stainless-steel-mini-diagonal-nipper-7171`
- `/shop/lakh-bangle-choodi` -> 301 to `/shop/lakh-bangle-choodi-9080`
- `/shop/metal-ear-piercing-gun-with-marking-pen-and-supporting-mirror` -> 301 to `/shop/metal-ear-piercing-gun-with-marking-pen-and-supporting-mirror-3344`
- `/shop/foredom-machine-hang-up-flexible-shaft-hanging-machine` -> 301 to `/shop/foredom-machine-hang-up-flexible-shaft-machine-0610`
- `/shop/1kg-gold-silver-ingot-mould` -> 301 to `/shop/1kg-gold-silver-ingot-mould-3321`
- `/shop/2-in-1-manual-casting-machine` -> 301 to `/shop/2-in-1-manual-casting-machine-2939`
- `/shop/auto-clamp-wax-injector-with-vaccum-pump` -> 301 to `/shop/auto-clamp-wax-injector-with-vaccum-pump-0837`
- `/shop/black-kasauti-gold-testing-stone-big-size` -> 301 to `/shop/black-kasauti-gold-testing-stone-big-size-9772`
- `/shop/black-kasauti-gold-testing-stone-medium-size` -> 301 to `/shop/black-kasauti-gold-testing-stone-medium-size-1414`
- `/shop/black-kasauti-gold-testing-stone-small-size` -> 301 to `/shop/black-kasauti-gold-testing-stone-small-size-3233`
- `/shop/silver-coin-card-pack` -> 301 to `/shop/silver-coin-card-pack-8046`

### D. Query Parameter Soft-404 Remediation (`app/(store)/shop/page.tsx`)
- Requests to `/shop?cat=Consumables` now 301 permanently redirect to `/shop/category/consumables`.
- Invalid or unknown category queries trigger `notFound()` (HTTP 404 with `noindex`), preventing soft-404s.

---

## 3. Mandatory Hosting Platform Configuration for Owner (Abhay)

In the Vercel (or hosting dashboard) settings:
1. Navigate to **Project Settings > Domains**.
2. Locate domain `dinanathandsons.com` (apex) and set it as **Primary Domain**.
3. For domain `www.dinanathandsons.com`, set redirect target to **`dinanathandsons.com` (Status: 301 Moved Permanently)**.
4. Deploy the latest build.

This eliminates the 307 temporary redirect at the edge and aligns Vercel's edge routing with Next.js canonical rules in a single hop.
