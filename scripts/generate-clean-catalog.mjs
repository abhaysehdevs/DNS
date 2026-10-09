import fs from 'fs';

const db = JSON.parse(fs.readFileSync('./supabase_products.json', 'utf8'));

// Known brand detection patterns
function detectRealBrandAndMpn(name, existingBrand, sku) {
    const cleanName = (name || '').trim();
    const lower = cleanName.toLowerCase();

    // 1. Marathon
    if (lower.includes('marathon m3')) return { brand: 'Marathon', mpn: 'M3-SET', identifierExists: true };
    if (lower.includes('marathon m4')) return { brand: 'Marathon', mpn: 'M4-LAB', identifierExists: true };
    if (lower.includes('marathon')) return { brand: 'Marathon', mpn: 'MARATHON-MICROMOTOR', identifierExists: true };

    // 2. Saeshin
    if (lower.includes('saeshin') || lower.includes('strong 204')) return { brand: 'Saeshin', mpn: 'STRONG-204', identifierExists: true };

    // 3. Foredom
    if (lower.includes('foredom')) return { brand: 'Foredom', mpn: 'SR-HANG-UP', identifierExists: true };

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
    if (lower.includes('minicraft')) return { brand: 'MiniCraft', mpn: 'MC-ENGRAVER-01', identifierExists: true };

    // 7. HandWise
    if (lower.includes('handwise')) return { brand: 'HandWise', mpn: 'HW-STAND-01', identifierExists: true };

    // 8. P.N. Budh
    if (lower.includes('p.n. budh') || lower.includes('pn budh') || lower.includes('budh')) return { brand: 'P.N. Budh', mpn: 'PNB-RING-STICK', identifierExists: true };

    // 9. Kwality
    if (lower.includes('kwality 77') || lower.includes('kwality')) return { brand: 'Kwality', mpn: 'KW-77', identifierExists: true };

    // 10. Default Own-Label: Dinanath & Sons
    return {
        brand: 'Dinanath & Sons',
        identifierExists: false
    };
}

function getSanitizedProductTitle(name) {
    let clean = (name || '').trim();
    if (clean.endsWith('Variable Speed Contro')) {
        clean = clean.replace(/Variable Speed Contro$/, 'Variable Speed Control');
    }
    if (clean.includes('Foredom Machine Hang Up Flexible Shaft Machine')) {
        return 'Foredom SR Hang Up Flexible Shaft Machine with Foot Pedal';
    }
    if (clean.includes('Clarion Imported Sand Frosting Media designed for gold and platinum')) {
        return 'Clarion Imported Sand Frosting Media for Jewelry Finishing';
    }
    if (clean.includes('Digital auto clamp vacuum wax injector used for jewelry making')) {
        return 'Digital Auto Clamp Vacuum Wax Injector for Lost-Wax Casting';
    }
    if (clean.includes('Set of steel dapping and doming punches used for shaping metal into domes for jewelry making')) {
        return 'Steel Dapping and Doming Punch Set for Jewelry Making';
    }
    if (clean.includes("Jeweler's saw frame, designed for making intricate cuts in metal")) {
        return "Adjustable Jeweler's Saw Frame with Hardwood Handle";
    }
    if (clean.includes("DinaNath's branded invisible ring size adjuster kit designed to tighten loose rings")) {
        return 'Invisible Ring Size Adjuster Kit for Loose Rings';
    }
    if (clean.includes('3" Rolling Mill Machine/Tar Patti Machine for Gold & Silver Jewellery – Wire & Sheet Metal Forming Tool – Durable Heavy Duty (Multicolour)')) {
        return '3" Manual Combination Rolling Mill Machine for Gold & Silver';
    }
    return clean;
}

function getNormalizedCategory(product) {
    const name = (product.name || '').toLowerCase();
    const currentCat = (product.category || 'Tools').trim();

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

    if (
        name.includes('crucible') ||
        name.includes('ingot mould') ||
        name.includes('casting machine') ||
        name.includes('wax injector') ||
        name.includes('furnace')
    ) {
        return 'Casting & Metallurgy';
    }

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

    return currentCat === 'Bullion' ? 'Bullion' : 'Tools';
}

const CURATED_DESCRIPTIONS = {
    'DNS-891405': 'High-density graphite crucible designed for melting gold, silver, copper, and precious metals in jewelry casting furnaces. Features excellent thermal conductivity and resistance to thermal shock for clean metal pours.',
    'DNS-274905': 'Digital auto clamp vacuum wax injector for lost-wax casting mold preparation. Provides precise temperature and air-pressure regulation for defect-free, bubble-free wax patterns with fine detail reproduction.',
    'DNS-802939': 'Heavy-duty 2-in-1 manual casting machine for centrifugal and vacuum casting of gold and silver jewelry. Built with balanced steel arm and robust pivot bearings for commercial workshop casting.',
    'DNS-130837': 'Auto clamp wax injector equipped with integrated vacuum pump for high-precision jewelry wax replication. Eliminates trapped air bubbles in rubber molds.',
    'DNS-481355': 'Electric melting furnace for melting precious metals including gold, silver, and copper. Reaches working temperatures rapidly with digital PID temperature controller.',
    'DNS-553321': 'Cast iron 1 kg reversible ingot mould for pouring gold and silver bars, rods, and wires. Durable two-part clamped design for workshop casting.',
    'DNS-455984': 'Soft protective pink jewelry wrapping paper designed for wrapping, interleaving, and preserving finished gold, silver, and gemstone ornaments against scratches and dust.',
    'DNS-291091': 'P.N. Budh standard graduated ring sizing stick / mandrel for precise measurement of ring sizes across Indian and international size scales. Made from durable polished metal.',
    'DNS-026355': 'Solid steel bangle sizing gauge set for measuring standard Indian bangle sizes from small to extra large.',
    'DNS-021894': 'Lightweight plastic bangle sizer rings for fast counter sizing of traditional and modern bangles.',
    'DNS-034189': 'Self-adhesive durable jewelry price tags suitable for barcode printing, retail counter tagging, and inventory pricing.',
    'DNS-919742': 'Tamper-evident gold coin packing cards with clear protective blister pouch for 1g, 2g, 5g, and 10g minted gold coins.',
    'DNS-866482': 'Heavy-duty security blister assay card packaging designed for gold minted bars and gifting bullion packaging.',
    'DNS-869989': 'Assay certification coin packing cards for 10g, 20g, and 50g pure silver coins with scratch-resistant blister cover.',
    'DNS-029137': 'Traditional Kundan set jewelry presentation box with velvet interior, designed for bridal sets, necklaces, and matching earrings.',
    'DNS-059022': 'Marathon M3 high-precision micromotor complete set including control unit, high-torque 35,000 RPM handpiece, foot pedal, and handpiece cradle. Ideal for stone setting, drilling, carving, and micro-polishing.',
    'DNS-055146': 'Marathon M4 heavy-duty dental and jewelry workshop micromotor with variable speed control and high torque for continuous grinding and polishing operations.',
    'DNS-450644': 'Saeshin Strong 204 commercial bench micromotor (35,000 RPM) with smooth rotation and forward/reverse selector. Built for jewelry manufacturing and bench grinding.',
    'DNS-445584': 'Foredom hanging flexible shaft machine (SR Series) complete with variable speed foot pedal and handpiece. Multipurpose rotary power tool for jewelry cutting, grinding, carving, and polishing.',
    'DNS-MINI01': 'MiniCraft electric hand engraver for precision marking, numbering, and delicate decorative detailing on metal, glass, and wood.',
    'DNS-875501': 'Industrial sandblast media dust collector cabinet with sealed viewing window, internal lighting, and high-efficiency filtration for workshop matte finishing.',
    'DNS-068560': '3-inch manual combination rolling mill for gold and silver sheet and wire reduction. Features hardened steel rollers and reduction gearing for smooth sheet rolling.',
    'DNS-510743': 'Magnetic polishing machine for automated burnishing and cleaning of gold and silver jewelry without metal loss. Uses micro stainless steel pins.',
    'DNS-970645': 'High-pressure water jet cleaning cabinet with 1.5 HP motor and full stainless steel tank for blasting investment plaster away from freshly cast trees.',
    'DNS-910863': 'Heavy-duty commercial ring enlarger and reducing machine with 8-spline mandrel and reversible reduction die plate for sizing wedding bands.',
    'DNS-854608': 'Fine-stitched cotton muslin polishing buff wheel for mirror-finish buffing on gold, silver, and brass jewelry.',
    'DNS-578306': 'Clarion imported fine aluminum oxide sand frosting media for creating uniform matte and frosted satin textures on precious metal surfaces.',
    'DNS-818036': 'Clarion imported sand frosting media for workshop sandblasting cabinets, delivering consistent satin texture on gold and platinum jewelry.',
    'DNS-939711': 'Natural lakh sealing wax stick (lakh batti) for temporary adhesive fixture of delicate jewelry components during stone setting and engraving.',
    'DNS-823331': 'Traditional natural lacquer bangle base (lakh bangle choodi) used in Indian handcrafted Kundan and Meenakari jewelry making.',
    'DNS-851061': 'High-purity copper alloy balls for alloying fine 24K gold down to 22K, 18K, and 14K karats with consistent color and metallurgical workability.',
    'DNS-916255': 'High-temperature soldering jointing sheet for thermal insulation and bench protection during flame brazing and torch welding.',
    'DNS-858225': 'Tik-Tak instant silver cleaning dip for removing oxidation, dark tarnish, and sulfide residue from silver ornaments and silverware in seconds.',
    'DNS-936508': 'Liquid suhaga (borax) soldering flux for jewelry brazing. Promotes smooth solder flow and prevents firescale oxidation at high soldering temperatures.',
    'DNS-127767': 'Natural solid borax crystal (Suhaga Goti / Khaar Goti) for preparing fresh flux paste on ceramic dishes for bench soldering.',
    'DNS-900594': 'Dinanath silver cleaning solution for fast dip cleaning and brightening of tarnished silver jewelry.',
    'DNS-878740': 'Tik-Tak laboratory grade citric acid powder for non-toxic pickle baths, safely stripping heat oxidation and flux residue from gold and silver.',
    'DNS-883651': 'Tik-Tak technical grade boric acid powder used for barrier coatings to prevent firescale during gold annealing and soldering.',
    'DNS-832022': 'Clarion Swiss-style premium jeweler saw blades crafted from hardened high-carbon steel for clean, snag-free cutting in gold, silver, and brass.',
    'DNS-551127': 'Adjustable jeweler saw frame with contoured wooden handle and sturdy steel bow for holding fine piercing blades at tension.',
    'DNS-928614': 'Dinanath 15F stainless steel precision tweezers (box of 12 units) with 45-degree curved tips for micro-soldering, stone setting, and filigree assembly.',
    'DNS-846474': 'Dinanath AA classic straight tweezers made from non-magnetic stainless steel for everyday jewelry bench handling and findings placement.',
    'DNS-074743': 'Dinanath 10K stainless steel tweezer with durable powder-coated red grip for non-slip tactile control during bench assembly.',
    'DNS-922856': 'Dinanath 10K stainless steel tweezer with powder-coated matte black grip for glare-free handling under magnifying loupes.',
    'DNS-947171': 'Stainless steel mini diagonal nipper cutter with sharp induction-hardened cutting jaws for flush trimming of soft gold, silver, and copper wires.',
    'DNS-960638': 'Traditional forged steel kadi cutting shears (katiya) for snipping solder paillons, jump rings, and wire ends at the goldsmith bench.',
    'DNS-973588': 'Dinanath forged iron crucibles holder and flask tongs (sandasi) for safe handling of hot crucibles and casting flasks during metal melting.',
    'DNS-827521': 'Natural fine-grit sharpening touchstone for honing engravers, scrapers, drill bits, and burnishers.',
    'DNS-588148': 'Natural Black Kasauti gold testing touchstone (small size) for acid testing and karat verification of precious metals.',
    'DNS-593076': 'Natural Black Kasauti gold testing touchstone (medium size) with dense matte surface for clear acid streak testing.',
    'DNS-596675': 'Natural Black Kasauti gold testing touchstone (large bench size) for testing multiple gold samples in assay workshops.',
    'DNS-573541': 'Dinanath 10x 18mm jeweler eye loupe with satin chrome finish and distortion-free optical glass doublet lens for gemstone and hallmark inspection.',
    'DNS-558688': 'Dinanath 10x 18mm folding pocket loupe with polished chrome casing for gemstone grading and diamond inspection.',
    'DNS-564950': 'Dinanath 10x 21mm large-aperture triplet eye loupe for wide field-of-view inspection of jewelry hallmarks and micro-settings.',
    'DNS-618426': 'Dinanath 10x magnifying tripod loupe with threaded focus ring for hands-free stable inspection of flat jewelry pieces and coins.',
    'DNS-888371': 'Automatic push-button piezoelectric gas torch gun for melting, soldering, and annealing with adjustable flame control.',
    'DNS-896559': 'Manual ignition portable gas torch gun head with precision brass nozzle for focused micro-flame jewelry soldering.',
    'DNS-891974': 'LPG industrial jeweler heating torch burner set with interchangeable brass tips for melting, casting, and heavy soldering.',
    'DNS-931950': 'Hardened solid steel dapping block cube (pasa) with 18 polished hemispherical depressions for doming and shaping metal discs.',
    'DNS-613745': 'Machined steel dapping punch set with graduated spherical tips for doming discs and forming bead caps in jewelry fabrication.',
    'DNS-964734': 'Set of 6 assorted precision needle files with hardened cut teeth for fine filing, shaping, and detailing in jewelry making.',
    'DNS-547411': 'Dinanath 5.5-inch half-round stainless steel plier with polished jaws for bending smooth wire loops without marring delicate metal.',
    'DNS-601345': 'Dinanath 4-inch mini black half-round plier with ergonomic handles for intricate wirework and jump ring opening.',
    'DNS-811960': 'Dinanath 4.5-inch half-round nose plier with box-joint construction for consistent alignment during wire bending.',
    'DNS-944112': 'Dinanath 6.5-inch steel nose half-round plier with extra lever arm for forming thicker sheet and heavy wire.',
};

function getSanitizedDescription(product) {
    const sku = (product.sku || '').trim();
    const name = (product.name || '').trim();
    const cat = (product.category || 'Jewellery Tools').trim();
    const rawDesc = (product.description || '').trim();

    if (sku && CURATED_DESCRIPTIONS[sku]) {
        return CURATED_DESCRIPTIONS[sku];
    }

    const banned = [
        'ideal for electricians',
        'residential architects',
        'industrial contractors',
        'calibrated for indian hallmarking',
        'tested for chemical resistance',
        'precision bench-grade jewellery manufacturing metallurgy grade'
    ];
    const isContaminated = banned.some(b => rawDesc.toLowerCase().includes(b));

    if (rawDesc && !isContaminated && rawDesc.length >= 40) {
        return rawDesc;
    }

    const { brand } = detectRealBrandAndMpn(name);
    return `Professional ${name} by ${brand}. Engineered for goldsmiths, jewelers, and manufacturing workshops. High-precision ${cat.toLowerCase()} built for reliability and daily workshop performance. Pan-India dispatch from Chandni Chowk, Delhi.`;
}

const cleanProducts = db.map(p => {
    const id = p.id;
    const name = getSanitizedProductTitle(p.name);
    let sku = p.sku;
    if (!sku || sku === 'null' || sku.length > 20) {
        sku = p.name.includes('MiniCraft') ? 'DNS-MINI01' : ('DNS-' + id.replace(/[^0-9]/g, '').slice(-6));
    }
    const category = getNormalizedCategory({ name: p.name, category: p.category, sku });
    const brandInfo = detectRealBrandAndMpn(p.name, p.brand, sku);
    const retailPrice = Number(p.retail_price || 0);
    const wholesalePrice = p.wholesale_price ? Number(p.wholesale_price) : undefined;
    const inStock = Boolean(p.in_stock && retailPrice > 0);
    const slug = p.specifications?.slug || p.slug || '';
    const description = getSanitizedDescription({ sku, id, name, category, description: p.description });
    const image = p.image || '/placeholder.jpg';
    const gallery = (p.gallery && p.gallery.length > 0)
        ? p.gallery.filter(g => !g.url.includes('jfif'))
        : [{ id: '1', type: 'image', url: image }];

    return {
        id,
        sku,
        name,
        slug,
        description,
        retailPrice,
        wholesalePrice,
        wholesaleMOQ: p.wholesale_moq || 1,
        primaryImage: image,
        image,
        gallery,
        category,
        inStock,
        quantity: p.quantity !== undefined && p.quantity !== null ? p.quantity : 15,
        reviews: [],
        brand: brandInfo.brand,
        modelNumber: brandInfo.mpn || p.model_number || undefined,
        features: p.features || [],
        specifications: {
            Brand: brandInfo.brand,
            Category: category,
            ...(brandInfo.mpn ? { Model: brandInfo.mpn } : {}),
            ...(p.weight ? { Weight: p.weight } : {}),
            ...(p.warranty_info ? { Warranty: p.warranty_info } : {}),
            "Dispatch Time": "24-48 Hours",
            "Country of Origin": "India"
        }
    };
});

fs.writeFileSync('./clean_products.json', JSON.stringify(cleanProducts, null, 2));
console.log('Successfully wrote', cleanProducts.length, 'clean products to clean_products.json');
