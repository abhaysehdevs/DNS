
export interface Review {
    id: string;
    userName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    verifiedPurchase: boolean;
    helpfulCount: number;
}

export interface ProductMedia {
    id: string;
    type: 'image' | 'video';
    url: string;
    altText?: string;
    thumbnailUrl?: string; // For videos
}

export interface Product {
    id: string;
    name: string;
    description: string;
    retailPrice: number;
    wholesalePrice?: number;
    wholesaleMOQ: number;

    // Media
    primaryImage: string;
    image?: string;
    videoUrl?: string; // New: Direct video field
    gallery: ProductMedia[];

    category: string;
    inStock: boolean;
    quantity?: number;
    reviews: Review[];

    // NEW: Amazon-style Detailed Fields
    brand?: string;
    modelNumber?: string;
    sku?: string;
    weight?: string;
    dimensions?: { length: string; width: string; height: string; };
    warrantyInfo?: string;
    features?: string[];
    specifications?: Record<string, string>;

    // NEW: Grouped Product System (Variants as separate products)
    groupId?: string; 
    variantAttributes?: Record<string, string>; 

    // Legacy / Alternative
    variants?: any[];
    variantType?: string;
}

// Helper to generate gallery
const createGallery = (baseName: string, count: number, hasVideo: boolean = false): ProductMedia[] => {
    const gallery: ProductMedia[] = [];
    // Primary image (no suffix)
    gallery.push({ id: '1', type: 'image', url: `/images/products/${baseName}.png` });

    // Additional images (starting from 2)
    for (let i = 2; i <= count; i++) {
        gallery.push({ id: `${i}`, type: 'image', url: `/images/products/${baseName}-${i}.png` });
    }

    if (hasVideo) {
        gallery.push({ id: 'vid', type: 'video', url: `/images/products/burner-video.mp4`, thumbnailUrl: `/images/products/${baseName}.png` });
    }

    return gallery;
};

export const products: Product[] = [
    // --- TOOLS ---
    {
        id: 't-15f-tweezers',
        name: "15F Precision Tweezers",
        description: "High-quality 15F stainless steel tweezers for precision work.",
        category: 'Tools',
        retailPrice: 350,
        wholesaleMOQ: 12,
        inStock: true,
        primaryImage: '/images/products/15f-tweezers.png',
        gallery: createGallery('15f-tweezers', 3),
        reviews: []
    },
    {
        id: 't-aa-tweezers',
        name: "Dinanath's AA Tweezers",
        description: "Standard AA tweezers for general jewelry handling.",
        category: 'Tools',
        retailPrice: 250,
        wholesaleMOQ: 12,
        inStock: true,
        primaryImage: "/images/products/dinanath's-aa-tweezers.png",
        gallery: createGallery("dinanath's-aa-tweezers", 3),
        reviews: []
    },
    {
        id: 't-red-tweezers',
        name: "Red Coated Grip Tweezers",
        description: "Comfort grip tweezers with red coating.",
        category: 'Tools',
        retailPrice: 280,
        wholesaleMOQ: 12,
        inStock: true,
        primaryImage: '/images/products/red-tweezers.png',
        gallery: createGallery('red-tweezers', 4),
        reviews: []
    },
    {
        id: 't-ss-10k',
        name: "SS 10K Tweezers",
        description: "Stainless Steel 10K series tweezers.",
        category: 'Tools',
        retailPrice: 400,
        wholesaleMOQ: 10,
        inStock: true,
        primaryImage: '/images/products/tweezer-ss-10k.png',
        gallery: [{ id: '1', type: 'image', url: '/images/products/tweezer-ss-10k.png' }],
        reviews: []
    },
    {
        id: 't-steel-nose-plier',
        name: "Steel Nose Round Plier",
        description: "Durable round nose plier for wire looping.",
        category: 'Tools',
        retailPrice: 450,
        wholesaleMOQ: 6,
        inStock: true,
        primaryImage: "/images/products/dinanath's-steel-nose-round-plier.png",
        gallery: createGallery("dinanath's-steel-nose-round-plier", 3),
        reviews: []
    },
    {
        id: 't-nipper-cutter',
        name: "Nipper Cutter",
        description: "Sharp nipper cutter for wire cutting.",
        category: 'Tools',
        retailPrice: 350,
        wholesaleMOQ: 6,
        inStock: true,
        primaryImage: '/images/products/nipper-cutter.png',
        gallery: createGallery('nipper-cutter', 2),
        reviews: []
    },
    {
        id: 't-red-plier',
        name: "Red Handle Plier",
        description: "Ergonomic red handle pliers.",
        category: 'Tools',
        retailPrice: 380,
        wholesaleMOQ: 6,
        inStock: true,
        primaryImage: '/images/products/red-plier.png',
        gallery: createGallery('red-plier', 3),
        reviews: []
    },
    {
        id: 't-ss-plier',
        name: "Stainless Steel Plier",
        description: "Full stainless steel plier for heavy duty use.",
        category: 'Tools',
        retailPrice: 500,
        wholesaleMOQ: 6,
        inStock: true,
        primaryImage: '/images/products/ss-plier.png',
        gallery: createGallery('ss-plier', 3),
        reviews: []
    },
    {
        id: 't-katiya',
        name: "Katiya Shears",
        description: "Traditional metal cutting shears (Katiya).",
        category: 'Tools',
        retailPrice: 600,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/katiya.png',
        gallery: createGallery('katiya', 2),
        reviews: []
    },
    {
        id: 't-sandasi',
        name: "Sandasi Holder",
        description: "Heat resistant holding tool (Sandasi).",
        category: 'Tools',
        retailPrice: 300,
        wholesaleMOQ: 10,
        inStock: true,
        primaryImage: '/images/products/sandasi.png',
        gallery: createGallery('sandasi', 3),
        reviews: []
    },
    {
        id: 't-file-set',
        name: "Needle File Set",
        description: "Set of precision files for jewelry detailing.",
        category: 'Tools',
        retailPrice: 850,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/file-set.png',
        gallery: createGallery('file-set', 4),
        reviews: []
    },
    {
        id: 't-saw-blade',
        name: "Clarion Saw Blades",
        description: "Premium quality saw blades for metal cutting.",
        category: 'Tools',
        retailPrice: 200,
        wholesaleMOQ: 24, // Packs
        inStock: true,
        primaryImage: '/images/products/clarion-saw-blade.png',
        gallery: createGallery('clarion-saw-blade', 2),
        reviews: []
    },
    {
        id: 't-saw-handle',
        name: "Adjustable Saw Frame",
        description: "Ergonomic saw frame handle.",
        category: 'Tools',
        retailPrice: 450,
        wholesaleMOQ: 6,
        inStock: true,
        primaryImage: '/images/products/saw-handle.png',
        gallery: [{ id: '1', type: 'image', url: '/images/products/saw-handle.png' }],
        reviews: []
    },
    {
        id: 't-ring-stick',
        name: "Ring Sizing Stick",
        description: "Standard aluminum ring mandrel.",
        category: 'Tools',
        retailPrice: 550,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/ring-stick.png',
        gallery: createGallery('ring-stick', 3),
        reviews: []
    },
    {
        id: 't-ring-extender',
        name: "Ring Extender Tool",
        description: "Tool for stretching rings to increase size.",
        category: 'Tools',
        retailPrice: 2500,
        wholesaleMOQ: 2,
        inStock: true,
        primaryImage: '/images/products/ring-extender.png',
        gallery: createGallery('ring-extender', 2),
        reviews: []
    },
    {
        id: 't-ring-extender-heavy',
        name: "Heavy Duty Ring Extender",
        description: "Heavy duty ring stretcher reducing machine.",
        category: 'Tools',
        retailPrice: 8500,
        wholesaleMOQ: 1,
        inStock: true,
        primaryImage: '/images/products/heavy-duty-ring-extender.png',
        gallery: createGallery('heavy-duty-ring-extender', 2),
        reviews: []
    },
    {
        id: 't-sharping-stone',
        name: "Sharpening Stone",
        description: "Oil stone for sharpening gravers and tools.",
        category: 'Tools',
        retailPrice: 350,
        wholesaleMOQ: 10,
        inStock: true,
        primaryImage: '/images/products/sharping-stone.png',
        gallery: createGallery('sharping-stone', 3),
        reviews: []
    },
    {
        id: 't-gas-torch-auto',
        name: "Auto Ignition Gas Torch",
        description: "Handheld gas torch with auto ignition.",
        category: 'Tools',
        retailPrice: 1200,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/gas-torch-auto.png',
        gallery: createGallery('gas-torch-auto', 4),
        reviews: []
    },
    {
        id: 't-gas-torch-manual',
        name: "Manual Gas Torch Head",
        description: "Professional gas torch head for soldering.",
        category: 'Tools',
        retailPrice: 600,
        wholesaleMOQ: 10,
        inStock: true,
        primaryImage: '/images/products/gas-torch-manual.png',
        gallery: createGallery('gas-torch-manual', 3),
        reviews: []
    },
    {
        id: 't-gas-burner',
        name: "Industrial Gas Burner",
        description: "Heavy duty gas burner for melting furnaces.",
        category: 'Tools',
        retailPrice: 2800,
        wholesaleMOQ: 2,
        inStock: true,
        primaryImage: '/images/products/gas-burner.png',
        gallery: createGallery('gas-burner', 4, true), // Includes video
        reviews: []
    },

    // --- CONSUMABLES / CHEMICALS ---
    {
        id: 'c-suhaga-liquid',
        name: "Liquid Suhaga Flux",
        description: "Borax liquid flux for soldering gold and silver.",
        category: 'Chemicals',
        retailPrice: 150,
        wholesaleMOQ: 20,
        inStock: true,
        primaryImage: '/images/products/suhaga-goti.png', // Fallback/Representative
        gallery: createGallery('suhaga-goti', 4),
        reviews: []
    },
    {
        id: 'c-suhaga-solid',
        name: "Suhaga Goti (Solid Borax)",
        description: "Solid borax pieces for flux preparation.",
        category: 'Chemicals',
        retailPrice: 120,
        wholesaleMOQ: 25,
        inStock: true,
        primaryImage: '/images/products/suhaga-big.png',
        gallery: createGallery('suhaga-big', 2),
        reviews: []
    },
    {
        id: 'c-silver-cleaner',
        name: "Instant Silver Cleaner",
        description: "Dip and clean solution for silver jewelry.",
        category: 'Chemicals',
        retailPrice: 350,
        wholesaleMOQ: 12,
        inStock: true,
        primaryImage: '/images/products/silver-cleaner.png',
        gallery: createGallery('silver-cleaner', 4),
        reviews: []
    },
    {
        id: 'c-tiktak-cleaner',
        name: "Tik Tak Silver Polish",
        description: "Premium silver polishing liquid.",
        category: 'Chemicals',
        retailPrice: 450,
        wholesaleMOQ: 12,
        inStock: true,
        primaryImage: '/images/products/tik-tak-silver-cleaner.png',
        gallery: createGallery('tik-tak-silver-cleaner', 3),
        reviews: []
    },
    {
        id: 'c-gas-refill',
        name: "Butane Gas Refill",
        description: "Refill canister for gas torches.",
        category: 'Consumables',
        retailPrice: 150,
        wholesaleMOQ: 24,
        inStock: true,
        primaryImage: '/images/products/gas-refill.png',
        gallery: createGallery('gas-refill', 2),
        reviews: []
    },
    {
        id: 'c-joint-paper',
        name: "Joint Paper / Soldering Sheet",
        description: "Thin soldering alloy sheet.",
        category: 'Consumables',
        retailPrice: 850,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/joint-paper.png',
        gallery: createGallery('joint-paper', 3),
        reviews: []
    },
    {
        id: 'c-copper-alloy',
        name: "Copper Alloy Balls",
        description: "Pure copper alloy for alloying gold.",
        category: 'Consumables',
        retailPrice: 600,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/copper-ball-alloy.png',
        gallery: createGallery('copper-ball-alloy', 2),
        reviews: []
    },
    {
        id: 'c-cloth-buff',
        name: "Polishing Cloth Buff",
        description: "Soft cloth wheel for jewelry polishing.",
        category: 'Consumables',
        retailPrice: 80,
        wholesaleMOQ: 50,
        inStock: true,
        primaryImage: '/images/products/cloth-buff.png',
        gallery: createGallery('cloth-buff', 3), // mapped cloth-buff2/3 manual if helper fails? Helper does -2, -3. Files are cloth-buff2.png.
        reviews: []
    },

    // --- MACHINERY ---
    {
        id: 'm-dust-collector',
        name: "Sand Blast Dust Collector",
        description: "Heavy duty dust collector machine for sandblasting units.",
        category: 'Machinery',
        retailPrice: 15500,
        wholesaleMOQ: 1,
        inStock: true,
        primaryImage: '/images/products/sand-blasting-dust-collector-machine.png',
        gallery: createGallery('sand-blasting-dust-collector-machine', 2),
        reviews: []
    },

    // --- PACKAGING ---
    {
        id: 'p-coin-card',
        name: "Silver Coin Card Pack",
        description: "Premium packaging card for silver coins.",
        category: 'Packaging',
        retailPrice: 25,
        wholesaleMOQ: 100,
        inStock: true,
        primaryImage: '/images/packaging/silver-coins-5gms.png', // Kept from previous request
        gallery: [
            { id: '1', type: 'image', url: '/images/packaging/silver-coins-5gms.png' },
            { id: '2', type: 'image', url: '/images/packaging/silver-coins-5gms-2.png' }
        ],
        reviews: []
    },
    {
        id: 'p-tags',
        name: "Jewellery Price Tags",
        description: "Durable tags for jewelry pricing and labeling.",
        category: 'Packaging',
        retailPrice: 150,
        wholesaleMOQ: 10, // Packets
        inStock: true,
        primaryImage: '/images/products/jewellery-tags.png',
        gallery: createGallery('jewellery-tags', 4),
        reviews: []
    },
    {
        id: 'p-pasa',
        name: "Pasa / Die Plate",
        description: "Precision die plate.",
        category: 'Tools', // Re-categorized
        retailPrice: 1200,
        wholesaleMOQ: 2,
        inStock: true,
        primaryImage: '/images/products/pasa.png',
        gallery: createGallery('pasa', 4),
        reviews: []
    },

    // --- BULLION (New) ---
    {
        id: 'b-gold-bar-1g',
        name: "Gold Bar (1g)",
        description: "24K Gold Bar - 1 Gram.",
        category: 'Bullion',
        retailPrice: 7500,
        wholesaleMOQ: 1,
        inStock: true,
        primaryImage: '/images/products/gold-bar-1gms.png',
        gallery: [{ id: '1', type: 'image', url: '/images/products/gold-bar-1gms.png' }],
        reviews: []
    },
    {
        id: 'b-gold-bar-5g',
        name: "Gold Bar (5g)",
        description: "24K Gold Bar - 5 Grams.",
        category: 'Bullion',
        retailPrice: 37500,
        wholesaleMOQ: 1,
        inStock: true,
        primaryImage: '/images/products/gold-bar-5gms.png',
        gallery: [{ id: '1', type: 'image', url: '/images/products/gold-bar-5gms.png' }],
        reviews: []
    },
    {
        id: 'b-silver-coin-20g',
        name: "Silver Coin (20g)",
        description: "999 Pure Silver Coin - 20 Grams.",
        category: 'Bullion',
        retailPrice: 2000,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/silver-coin-20g.png',
        gallery: [{ id: '1', type: 'image', url: '/images/products/silver-coin-20g.png' }],
        reviews: []
    }
];

export const getProductGallery = (product: any): ProductMedia[] => {
    if (product.gallery && product.gallery.length > 0) return product.gallery;
    return [{ id: 'default', type: 'image', url: product.image || product.primaryImage || '/placeholder.jpg' }];
};
