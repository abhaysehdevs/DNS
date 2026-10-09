import { SITE_CONFIG } from './site-config';

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
        seoTitle: 'Goldsmith Hand Tools, Pliers & Bench Instruments',
        seoDescription: 'Professional goldsmith tweezers, pliers, saw frames, piercing blades, and ring mandrels in Maliwara, Chandni Chowk, Delhi.',
        h1: 'Goldsmith Hand Tools & Precision Bench Instruments',
        subtitle: 'Crafted for master goldsmiths, stone setters, and jewelry manufacturing workshops',
        description: 'Equip your jewellery bench with precision hand tools designed for goldsmithing, stone setting, wire forming, and bench assembly. From non-magnetic stainless steel tweezers to forged steel shears (katiya), ring mandrels, saw frames, and needle files, our tools support workshops across India.',
        wholesaleNote: 'Available for artisans and wholesale workshop bulk orders with MOQ pricing and pan-India logistics.',
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
        seoTitle: 'Jewellery Workshop Machinery & Motor Equipment',
        seoDescription: 'High-torque micromotors, combination rolling mills, sandblast dust collectors, water jets, and magnetic polishers with pan-India delivery.',
        h1: 'Jewellery Manufacturing Machinery & Workshop Equipment',
        subtitle: 'Durable rotary motors, rolling mills, and surface finishing machinery',
        description: 'Industrial machinery engineered for modern jewelry manufacturing, melting, casting, and finishing operations. Dinanath & Sons supplies high-torque micromotors (Marathon, Saeshin), combination rolling mills, sandblast dust collectors, magnetic polishers, and flexible shaft systems with spare parts and technical advice.',
        wholesaleNote: 'B2B wholesale pricing available with surface freight transport across India.',
        keywords: [
            'jewellery making machinery',
            'jewelry machinery Delhi',
            'marathon micromotor India',
            'saeshin micromotor',
            'sand blasting dust collector',
            'rolling mill machine Delhi',
            'jewellery workshop machinery supplier'
        ]
    },
    {
        slug: 'polishing',
        aliases: ['consumables', 'polishing', 'buffs'],
        name: 'Polishing & Consumables',
        categoryKey: 'Consumables',
        seoTitle: 'Jewellery Polishing Buffs, Sand Frosting & Consumables',
        seoDescription: 'Cotton muslin polishing buff wheels, Clarion sand frosting media, copper alloying balls, lakh batti, and high-temp heat sheets.',
        h1: 'Jewellery Polishing Buffs & Finishing Consumables',
        subtitle: 'Lustre buffing wheels, abrasive frosting media, and bench consumables',
        description: 'Essential polishing wheels, abrasive media, and bench consumables for jewelry manufacturing and finishing. Catalog includes multi-layer stitched cotton muslin buffs, imported Clarion sand frosting media, pure copper alloying balls for gold, natural lakh sealing wax, and high-temp jointing sheets.',
        wholesaleNote: 'Bulk packs available in cartons for manufacturing units and polishing factories.',
        keywords: [
            'jewellery polishing buffs',
            'cloth buff for jewelry',
            'sand frosting media',
            'copper alloy balls for gold',
            'lakh batti for stone setting',
            'polishing consumables wholesale'
        ]
    },
    {
        slug: 'packaging',
        aliases: ['packaging', 'display', 'packaging-display'],
        name: 'Packaging & Display',
        categoryKey: 'Packaging',
        seoTitle: 'Jewellery Packaging, Coin Cards & Price Tags',
        seoDescription: 'Tamper-evident gold and silver coin packing cards, luxury Kundan set presentation boxes, jewelry hallmark price tags, and wrapping paper.',
        h1: 'Jewellery Packaging, Coin Packing Cards & Display',
        subtitle: 'Security coin blister cards, velvet presentation boxes, and retail packaging',
        description: 'Elevate your jewellery presentation with certified coin packing cards for silver and gold coins, tamper-evident blister packaging, luxury velvet Kundan set boxes, and durable jewellery price tags for retail branding.',
        wholesaleNote: 'Wholesale quantities starting from bundle packs with pan-India dispatch.',
        keywords: [
            'coin packing card',
            'silver coin packing card',
            'gold coin packaging card',
            'kundan set box wholesale',
            'jewellery price tags',
            'jewellery packaging Chandni Chowk'
        ]
    },
    {
        slug: 'chemicals',
        aliases: ['chemicals', 'cleaning', 'flux'],
        name: 'Cleaning & Flux Solutions',
        categoryKey: 'Chemicals',
        seoTitle: 'Jewellery Soldering Flux, Suhaga Borax & Silver Cleaners',
        seoDescription: 'Liquid suhaga flux, natural solid borax goti, Tik-Tak instant silver cleaning dip, citric acid, and boric acid for jewelry workshops.',
        h1: 'Suhaga Borax Soldering Flux & Silver Cleaners',
        subtitle: 'High-purity metallurgical fluxes and instant chemical cleaning solutions',
        description: 'Essential metallurgical fluxes and cleaning solutions for gold soldering, melting, and silver tarnish removal. Featuring pure natural Suhaga Goti (solid borax), concentrated liquid flux, Tik-Tak silver cleaner dip, laboratory-grade citric acid, and boric acid.',
        wholesaleNote: 'Available in retail bottles and workshop packs with pan-India surface delivery.',
        keywords: [
            'suhaga borax flux',
            'suhaga goti',
            'liquid suhaga for jewelry',
            'tik tak silver cleaner',
            'citric acid pickle bath',
            'jewellery flux supplier Delhi'
        ]
    },
    {
        slug: 'casting-metallurgy',
        aliases: ['casting', 'metallurgy', 'casting & metallurgy', 'welding'],
        name: 'Casting & Metallurgy',
        categoryKey: 'Casting & Metallurgy',
        seoTitle: 'Jewellery Casting Machines, Crucibles & Ingot Moulds',
        seoDescription: 'High-density graphite crucibles, 2-in-1 manual casting machines, digital wax injectors, electric furnaces, and reversible ingot moulds.',
        h1: 'Jewellery Casting Equipment & Metallurgy Supplies',
        subtitle: 'Graphite melting crucibles, casting apparatus, and ingot moulds',
        description: 'Professional metallurgy and lost-wax casting supplies engineered for goldsmiths and silver casting units. Featuring high-density graphite crucibles, digital vacuum wax injectors, 2-in-1 manual casting machines, electric melting furnaces, and heavy-duty ingot moulds.',
        wholesaleNote: 'Available for jewellery manufacturers with pan-India delivery and direct workshop pricing.',
        keywords: [
            'jewellery casting machine',
            'graphite crucible for gold',
            'ingot mould gold silver',
            'vacuum wax injector jewelry',
            'jewellery melting furnace'
        ]
    },
    {
        slug: 'bullion',
        aliases: ['bullion'],
        name: 'Certified Bullion Packaging',
        categoryKey: 'Bullion',
        seoTitle: 'Certified Coin Packaging & Bullion Cards',
        seoDescription: 'Assay certified tamper-evident coin packing cards and blister cases for 24K gold bars and 999 fine silver coins.',
        h1: 'Certified Bullion Packaging & Coin Cards',
        subtitle: 'Tamper-evident assay blister cards for gold bars and fine silver coins',
        description: 'Protective security blister assay cards and packaging designed for pure gold minted bars and fine silver coins. Preserves assay certification and protects mint finish for retail counters and gifting.',
        wholesaleNote: 'Wholesale packs available for bullion dealers and retail jewelers.',
        keywords: [
            'gold bar packing card',
            'silver coin blister pack',
            'bullion packaging Chandni Chowk'
        ]
    }
];

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
    if (!slug) return undefined;
    const clean = slug.toLowerCase().trim();
    return CATEGORIES.find(c => c.slug === clean || c.aliases.includes(clean) || c.categoryKey.toLowerCase() === clean);
}
