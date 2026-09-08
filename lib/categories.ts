export interface CategoryDefinition {
    slug: string;
    aliases: string[];
    name: string;
    categoryKey: string;
    seoTitle: string;
    seoDescription: string;
    h1: string;
    subtitle: string;
    description: string;
    wholesaleNote: string;
    keywords: string[];
}

export const CATEGORIES: CategoryDefinition[] = [
    {
        slug: 'hand-tools',
        aliases: ['tools', 'hand-tools', 'goldsmith-tools'],
        name: 'Hand Tools',
        categoryKey: 'Tools',
        seoTitle: 'Goldsmith Hand Tools & Precision Pliers | Wholesale & Retail | Dinanath & Sons',
        seoDescription: 'Explore professional goldsmith hand tools: precision tweezers, pliers, cutters, saw frames, and ring mandrels in Maliwara, Chandni Chowk. Pan-India dispatch.',
        h1: 'Goldsmith Hand Tools & Precision Bench Instruments',
        subtitle: 'Engineered for master goldsmiths, stone setters, and manufacturing workshops since 1960',
        description: 'Equip your jewellery bench with master-grade hand tools designed for precision goldsmithing, stone setting, wire bending, and delicate micro-soldering. From non-magnetic stainless steel tweezers to forged steel shears (katiya), ring mandrels, and needle files, our collection has served Indian craftsmen for over six decades.',
        wholesaleNote: 'Available for both individual artisans and B2B wholesale workshop bulk orders with MOQ pricing and pan-India logistics.',
        keywords: [
            'goldsmith tools',
            'jewellery tools Chandni Chowk',
            'precision tweezers for jewellers',
            'jewellery pliers',
            'ring mandrel stick',
            'jewellery shears katiya',
            'goldsmith hand tools wholesale Delhi'
        ]
    },
    {
        slug: 'machines',
        aliases: ['machinery', 'machines', 'equipment'],
        name: 'Machinery & Equipment',
        categoryKey: 'Machinery',
        seoTitle: 'Jewellery Making Machinery & Workshop Equipment | Dinanath & Sons',
        seoDescription: 'Heavy-duty jewellery machinery, dust collectors, ring stretchers, and casting equipment for manufacturing workshops. Direct factory wholesale from Delhi.',
        h1: 'Jewellery Manufacturing Machinery & Workshop Equipment',
        subtitle: 'Industrial power, precision calibration, and durable engineering for production workshops',
        description: 'Industrial-grade machinery engineered for modern jewellery manufacturing, melting, casting, and finishing operations. Dinanath & Sons supplies heavy-duty sandblast dust collectors, ring stretchers, rolling mill accessories, and melting equipment backed by technical advice and genuine spare parts.',
        wholesaleNote: 'B2B wholesale pricing available with pan-India transport and workshop calibration support.',
        keywords: [
            'jewellery making machinery',
            'jewelry machinery Delhi',
            'sand blasting dust collector',
            'ring stretcher reducing machine',
            'casting equipment India',
            'jewellery workshop machinery supplier'
        ]
    },
    {
        slug: 'polishing',
        aliases: ['consumables', 'polishing', 'buffs'],
        name: 'Polishing & Consumables',
        categoryKey: 'Consumables',
        seoTitle: 'Jewellery Polishing Buffs, Compounds & Consumables | Dinanath & Sons',
        seoDescription: 'High-lustre cloth buffs, polishing wheels, copper alloying metals, and soldering joint paper for gold & silver finishing workshops across India.',
        h1: 'Jewellery Polishing Buffs & Finishing Consumables',
        subtitle: 'High-lustre mirror finishing wheels and metallurgical soldering consumables',
        description: 'Achieve flawless mirror finishes on gold, platinum, and silver jewellery. Our polishing catalog includes multi-layer stitched cotton muslin buffs, premium compounds, soldering alloy joint sheets, butane refills, and pure copper alloying balls for jewellery casting workshops.',
        wholesaleNote: 'Bulk packs available in cartons of 50+ units for manufacturing units and polishing factories.',
        keywords: [
            'jewellery polishing buffs',
            'cloth buff for jewelry',
            'soldering joint paper',
            'copper alloy balls for gold',
            'polishing consumables wholesale',
            'jewellery finishing supplies Delhi'
        ]
    },
    {
        slug: 'packaging',
        aliases: ['packaging', 'display', 'packaging-display'],
        name: 'Packaging & Display',
        categoryKey: 'Packaging',
        seoTitle: 'Jewellery Packaging, Coin Packing Cards & Display | Dinanath & Sons',
        seoDescription: 'Premium coin packing cards, tamper-proof assay cards, price tags, and presentation boxes for jewellers. Retail and wholesale bulk supplies from Chandni Chowk.',
        h1: 'Jewellery Packaging, Coin Packing Cards & Display',
        subtitle: 'Tamper-evident coin cards, velvet displays, and high-definition retail packaging',
        description: 'Elevate your jewellery presentation with certified coin packing cards for silver and gold coins, tamper-evident security blister cards, and durable barcode-ready jewellery price tags. Trusted by Indian jewellers for retail counter branding and bullion gifting.',
        wholesaleNote: 'Wholesale quantities starting from 100-pack bundles with custom printing inquiries accepted.',
        keywords: [
            'coin packing card',
            'silver coin packing card',
            'gold coin packaging card',
            'jewellery price tags',
            'jewellery display trays',
            'jewellery packaging wholesale Chandni Chowk'
        ]
    },
    {
        slug: 'chemicals',
        aliases: ['chemicals', 'cleaning', 'flux'],
        name: 'Cleaning & Flux Solutions',
        categoryKey: 'Chemicals',
        seoTitle: 'Suhaga Borax Flux & Silver Cleaning Solutions | Dinanath & Sons',
        seoDescription: 'Pure suhaga goti (borax flux), liquid soldering flux, and instant dip silver cleaners for jewellery workshops. Wholesale bulk packs with pan-India courier.',
        h1: 'Suhaga Borax Soldering Flux & Silver Cleaners',
        subtitle: 'High-purity metallurgical fluxes and instant chemical cleaning solutions',
        description: 'Essential metallurgical fluxes and chemical cleaning solutions for gold melting, soldering, and silver tarnish removal. Featuring pure natural Suhaga Goti (solid borax), concentrated liquid flux, and instant dip silver cleaners for bench jewelers and polishing units.',
        wholesaleNote: 'Available in retail bottles and bulk workshop barrels with secure pan-India chemical courier.',
        keywords: [
            'suhaga borax flux',
            'suhaga goti',
            'liquid suhaga for jewelry',
            'silver cleaner dip',
            'tik tak silver polish',
            'jewellery flux supplier Delhi'
        ]
    },
    {
        slug: 'bullion',
        aliases: ['bullion'],
        name: 'Certified Bullion',
        categoryKey: 'Bullion',
        seoTitle: 'Certified 24K Gold Bars & 999 Silver Coins | Dinanath & Sons',
        seoDescription: 'Buy certified 24K gold bars and pure 999 silver coins with tamper-evident packaging. Ideal for investment, gifting, and jewellery casting.',
        h1: 'Certified Gold Bars & Pure Silver Bullion Coins',
        subtitle: 'Hallmarked 999 pure silver coins and 24K gold bars in tamper-proof assay cards',
        description: 'Hallmarked 24K gold bars and 999 fine silver coins sealed in tamper-proof security assay packaging. Ideal for retail investment, corporate gifting, and master alloy casting in jewellery workshops.',
        wholesaleNote: 'Direct live bullion rates with insured transit delivery across India.',
        keywords: [
            'silver coin 20g pure',
            '24k gold bar 1g',
            'gold bar 5g',
            'hallmarked bullion Chandni Chowk',
            'pure silver coins wholesale'
        ]
    }
];

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
    if (!slug) return undefined;
    const clean = slug.toLowerCase().trim();
    return CATEGORIES.find(c => c.slug === clean || c.aliases.includes(clean) || c.categoryKey.toLowerCase() === clean);
}
