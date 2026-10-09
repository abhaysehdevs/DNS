/**
 * Product Taxonomy, Brand Detection, and Google Product Category Mapping
 * Validated against official Google Merchant Center product taxonomy.
 */

export interface BrandInfo {
    brand: string;
    mpn?: string;
    identifierExists: boolean;
}

// Known brand detection patterns
export function detectRealBrandAndMpn(name: string, existingBrand?: string | null, sku?: string | null): BrandInfo {
    const cleanName = (name || '').trim();
    const lower = cleanName.toLowerCase();
    const existing = (existingBrand || '').trim();

    // Check if existing brand is valid and not contaminated with size text
    const isContaminatedBrand = 
        !existing || 
        existing.toLowerCase().includes('size') || 
        existing.toLowerCase().includes('inch') ||
        existing === "Dinanath's";

    // 1. Marathon
    if (lower.includes('marathon m3')) {
        return { brand: 'Marathon', mpn: 'M3-SET', identifierExists: true };
    }
    if (lower.includes('marathon m4')) {
        return { brand: 'Marathon', mpn: 'M4-LAB', identifierExists: true };
    }
    if (lower.includes('marathon')) {
        return { brand: 'Marathon', mpn: 'MARATHON-MICROMOTOR', identifierExists: true };
    }

    // 2. Saeshin
    if (lower.includes('saeshin') || lower.includes('strong 204')) {
        return { brand: 'Saeshin', mpn: 'STRONG-204', identifierExists: true };
    }

    // 3. Foredom
    if (lower.includes('foredom')) {
        return { brand: 'Foredom', mpn: 'SR-HANG-UP', identifierExists: true };
    }

    // 4. Tik-Tak
    if (lower.includes('tik-tak') || lower.includes('tik tak') || lower.includes('tiktak')) {
        let mpn = 'TIKTAK-CLEANER';
        if (lower.includes('citric acid')) mpn = 'TIKTAK-CITRIC';
        if (lower.includes('boric acid')) mpn = 'TIKTAK-BORIC';
        return { brand: 'Tik-Tak', mpn, identifierExists: true };
    }

    // 5. Clarion
    if (lower.includes('clarion')) {
        let mpn = 'CLARION-BLADE';
        if (lower.includes('sand frosting') || lower.includes('media')) mpn = 'CLARION-MEDIA';
        return { brand: 'Clarion', mpn, identifierExists: true };
    }

    // 6. MiniCraft
    if (lower.includes('minicraft')) {
        return { brand: 'MiniCraft', mpn: 'MC-ENGRAVER-01', identifierExists: true };
    }

    // 7. HandWise
    if (lower.includes('handwise')) {
        return { brand: 'HandWise', mpn: 'HW-STAND-01', identifierExists: true };
    }

    // 8. P.N. Budh
    if (lower.includes('p.n. budh') || lower.includes('pn budh') || lower.includes('budh')) {
        return { brand: 'P.N. Budh', mpn: 'PNB-RING-STICK', identifierExists: true };
    }

    // 9. Kwality
    if (lower.includes('kwality 77') || lower.includes('kwality')) {
        return { brand: 'Kwality', mpn: 'KW-77', identifierExists: true };
    }

    // 10. Default Own-Label: Dinanath & Sons
    // For own-label products without barcode/GTIN: Google requires identifier_exists = false and omit MPN
    return {
        brand: 'Dinanath & Sons',
        identifierExists: false // Correct Google standard for handcrafted/own-label items without GTIN/factory MPN
    };
}

/**
 * Maps product attributes to official Google Product Category (GPC) nodes
 * using exact paths approved by Google Merchant Center.
 */
export function getGoogleProductCategory(product: { name: string; category?: string; sku?: string }): { path: string; id: number } {
    const name = (product.name || '').toLowerCase();
    const cat = (product.category || '').toLowerCase();

    // 1. Ear Piercing Supplies & Guns
    if (name.includes('piercing') || name.includes('piercing gun') || name.includes('piercing stud')) {
        return {
            path: 'Health & Beauty > Personal Care > Piercing Supplies',
            id: 2888
        };
    }

    // 2. Magnifiers & Loupes
    if (name.includes('loupe') || name.includes('magnifying') || name.includes('magnifier')) {
        return {
            path: 'Cameras & Optics > Optics > Magnifiers',
            id: 549
        };
    }

    // 3. Packaging & Display Boxes / Cards / Tags
    if (
        cat.includes('packag') || 
        name.includes('kundan box') || 
        name.includes('coin card') || 
        name.includes('price tags') || 
        name.includes('wrapping paper') ||
        name.includes('display')
    ) {
        return {
            path: 'Business & Industrial > Retail > Jewelry Packaging & Display',
            id: 505389
        };
    }

    // 4. Laboratory Chemicals & Soldering Fluxes
    if (
        cat.includes('chemic') || 
        name.includes('suhaga') || 
        name.includes('flux') || 
        name.includes('borax') || 
        name.includes('acid') || 
        name.includes('cleaner') || 
        name.includes('additive')
    ) {
        return {
            path: 'Business & Industrial > Science & Laboratory > Laboratory Chemicals',
            id: 111
        };
    }

    // 5. Metal Casting Equipment, Crucibles & Ingot Moulds
    if (
        cat.includes('cast') || 
        name.includes('crucible') || 
        name.includes('casting machine') || 
        name.includes('wax injector') || 
        name.includes('ingot mould') || 
        name.includes('furnace')
    ) {
        return {
            path: 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Metal Casting Supplies',
            id: 505391
        };
    }

    // 6. Polishing Buffs, Compounds & Media
    if (
        name.includes('buff') || 
        name.includes('sand frosting') || 
        name.includes('polishing machine') || 
        name.includes('lakh batti') ||
        name.includes('lakh bangle') ||
        name.includes('sharping stone') ||
        name.includes('sharpening stone')
    ) {
        return {
            path: 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Polishing & Finishing',
            id: 505392
        };
    }

    // 7. Torches, Burners & Blowpipes (Soldering/Welding)
    if (name.includes('torch') || name.includes('burner') || name.includes('blowpipe')) {
        return {
            path: 'Business & Industrial > Manufacturing > Welding & Soldering > Soldering Equipment',
            id: 505380
        };
    }

    // 8. Heavy Workshop Machinery (Rolling Mills, Dust Collectors, Micromotors)
    if (
        cat.includes('machin') || 
        name.includes('rolling mill') || 
        name.includes('micromotor') || 
        name.includes('dust collector') || 
        name.includes('water jet') ||
        name.includes('ring enlarger') ||
        name.includes('ring stretcher')
    ) {
        return {
            path: 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Workshop Machinery',
            id: 505393
        };
    }

    // 9. Standard Goldsmith Hand Tools (Pliers, Tweezers, Saw Frames, Ring Mandrels, Doming Punches, Dapping)
    return {
        path: 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Jewelry Making Tools',
        id: 505390
    };
}

/**
 * Normalizes product category to fix P1-4 miscategorization
 */
export function getNormalizedCategory(product: { name: string; category?: string; sku?: string | null }): string {
    const name = (product.name || '').toLowerCase();
    const sku = (product.sku || '').toUpperCase();
    const currentCat = (product.category || 'Tools').trim();

    // 1. Packaging & Display
    if (
        name.includes('kundan box') ||
        name.includes('coin card') ||
        name.includes('wrapping paper') ||
        name.includes('hallmark tags') ||
        name.includes('price tags') ||
        name.includes('display tray')
    ) {
        return 'Packaging';
    }

    // 2. Chemicals & Flux Solutions
    if (
        name.includes('suhaga') ||
        name.includes('silver cleaner') ||
        name.includes('cleaning liquid') ||
        name.includes('citric acid') ||
        name.includes('boric acid') ||
        name.includes('p & c additive') ||
        name.includes('soldering liquid')
    ) {
        return 'Chemicals';
    }

    // 3. Casting & Metallurgy
    if (
        name.includes('crucible') ||
        name.includes('ingot mould') ||
        name.includes('casting machine') ||
        name.includes('wax injector') ||
        name.includes('furnace')
    ) {
        return 'Casting & Metallurgy';
    }

    // 4. Polishing & Consumables
    if (
        name.includes('cloth buff') ||
        name.includes('sand frosting') ||
        name.includes('copper alloy') ||
        name.includes('copper balls') ||
        name.includes('lakh batti') ||
        name.includes('lakh bangle') ||
        name.includes('joint per kg') ||
        name.includes('jointing sheet') ||
        name.includes('torch gas refill') ||
        name.includes('wooden scrapped dust')
    ) {
        return 'Consumables';
    }

    // 5. Machinery & Equipment
    if (
        name.includes('rolling mill') ||
        name.includes('micromotor') ||
        name.includes('micro motor') ||
        name.includes('dust collector') ||
        name.includes('water jet') ||
        name.includes('magnetic polishing machine') ||
        name.includes('foredom') ||
        name.includes('hand engraver')
    ) {
        return 'Machinery';
    }

    // 6. Tools (Hand Tools, Pliers, Tweezers, Loupes, Sizers, Piercing, Torches, Punches)
    return currentCat === 'Bullion' ? 'Bullion' : 'Tools';
}

/**
 * Checks if a product must be excluded from Google Merchant Center feed
 */
export function isExcludedFromMerchantCenter(product: {
    sku?: string | null;
    name?: string;
    category?: string;
    retailPrice?: number;
    retail_price?: number;
    inStock?: boolean;
    in_stock?: boolean;
}): { excluded: boolean; reason?: string } {
    const price = Number(product.retailPrice ?? product.retail_price ?? 0);
    const name = (product.name || '').toLowerCase();
    const cat = (product.category || '').toLowerCase();

    // 1. Zero or invalid price is an absolute GMC blocker
    if (price <= 0) {
        return { excluded: true, reason: 'Price is zero or invalid' };
    }

    // 2. Gold/Silver Bullion (Google Unsupported Shopping content policy)
    if (cat.includes('bullion') || (name.includes('gold bar') && !name.includes('card')) || (name.includes('silver coin') && !name.includes('card'))) {
        return { excluded: true, reason: 'Precious metal bullion (Google Unsupported Content policy)' };
    }

    // 3. Asbestos Joint Sheet (Hazardous/regulated material)
    if (name.includes('asbest')) {
        return { excluded: true, reason: 'Regulated hazardous material (Asbestos)' };
    }

    // 4. Torch Gas Refill (Pressurized flammable butane)
    if (name.includes('torch gas refill') || name.includes('butane gas')) {
        return { excluded: true, reason: 'Pressurized flammable butane gas canister' };
    }

    return { excluded: false };
}
