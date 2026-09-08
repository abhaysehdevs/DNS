
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
    slug?: string;
}

// Helper to generate gallery with descriptive SEO alt text
const createGallery = (baseName: string, count: number, productName?: string, hasVideo: boolean = false): ProductMedia[] => {
    const gallery: ProductMedia[] = [];
    const label = productName || baseName.replace(/-/g, ' ');
    // Primary image (no suffix)
    gallery.push({
        id: '1',
        type: 'image',
        url: `/images/products/${baseName}.png`,
        altText: `${label} - Professional goldsmith tool from Dinanath & Sons Chandni Chowk`
    });

    // Additional images (starting from 2)
    for (let i = 2; i <= count; i++) {
        gallery.push({
            id: `${i}`,
            type: 'image',
            url: `/images/products/${baseName}-${i}.png`,
            altText: `${label} view ${i} - Precision jewellery manufacturing equipment`
        });
    }

    if (hasVideo) {
        gallery.push({
            id: 'vid',
            type: 'video',
            url: `/images/products/burner-video.mp4`,
            thumbnailUrl: `/images/products/${baseName}.png`,
            altText: `${label} operational demonstration video`
        });
    }

    return gallery;
};

export const products: Product[] = [
    // --- TOOLS (Goldsmith Hand Tools) ---
    {
        id: 't-15f-tweezers',
        name: "15F Precision Tweezers",
        description: "Engineered specifically for master goldsmiths and diamond setters, the 15F Precision Tweezers feature ultra-fine curved tips crafted from non-magnetic, anti-acid surgical grade stainless steel. These precision tweezers provide exceptional tactile control when handling microscopic gemstones, filigree gold wires, and delicate solder paillons under magnification. Essential for both independent bench jewellers in Chandni Chowk and high-volume jewellery manufacturing workshops across India. Available in retail packs and wholesale workshop cartons.",
        category: 'Tools',
        retailPrice: 350,
        wholesalePrice: 240,
        wholesaleMOQ: 12,
        inStock: true,
        primaryImage: '/images/products/15f-tweezers.png',
        gallery: createGallery('15f-tweezers', 3, '15F Precision Tweezers'),
        brand: "Dinanath & Sons",
        sku: "DNS-TW-15F",
        modelNumber: "15F-SUS316",
        features: [
            "Non-magnetic, anti-acid surgical grade stainless steel construction",
            "Ultra-fine 45-degree curved tips for high-magnification stone setting",
            "Ribbed anti-slip finger grips for fatigue-free benchwork",
            "Resistant to soldering fluxes, pickling acids, and ultrasonic cleaning"
        ],
        specifications: {
            "Material": "SUS316 Anti-Magnetic Stainless Steel",
            "Length": "120 mm",
            "Tip Type": "45° Curved Precision Point",
            "Application": "Stone Setting, Micro-Soldering, Filigree Work",
            "Wholesale Pack": "Box of 12 Units"
        },
        reviews: []
    },
    {
        id: 't-aa-tweezers',
        name: "Dinanath's AA Tweezers",
        description: "The gold standard of jewellery workshop tweezers, Dinanath's AA Precision Tweezers are built from heavy-duty tempered stainless steel for general bench handling, component assembly, and soldering prep. The straight, tapered, medium-fine tips offer superior gripping tension without bending or warping over years of daily bench use. A staple tool trusted by master goldsmiths in Maliwara, Chandni Chowk since 1960. Suitable for retail artisans and bulk wholesale workshop procurement.",
        category: 'Tools',
        retailPrice: 250,
        wholesalePrice: 170,
        wholesaleMOQ: 12,
        inStock: true,
        primaryImage: "/images/products/dinanath's-aa-tweezers.png",
        gallery: createGallery("dinanath's-aa-tweezers", 3, "Dinanath's AA Tweezers"),
        brand: "Dinanath & Sons",
        sku: "DNS-TW-AA",
        modelNumber: "AA-CLASSIC",
        features: [
            "Heavy-duty tempered stainless steel with balanced spring tension",
            "Tapered medium-fine tips for secure handling of findings and jump rings",
            "Serrated gripping surface on handle for positive bench grip",
            "Reliable everyday workhorse for casting and polishing assembly"
        ],
        specifications: {
            "Material": "Tempered Surgical Stainless Steel",
            "Length": "125 mm",
            "Tip Type": "Straight Tapered Point",
            "Application": "General Goldsmithing, Findings Assembly, Solder Placement",
            "Wholesale Pack": "Box of 12 Units"
        },
        reviews: []
    },
    {
        id: 't-red-tweezers',
        name: "Red Coated Grip Tweezers",
        description: "Designed for extended bench sessions, these Red Coated Grip Tweezers feature insulated PVC dipped handles that provide superior grip, thermal insulation, and reduced hand fatigue during soldering and pickling operations. The non-slip red coating prevents acid corrosion from sweaty hands and provides electrical insulation during electro-plating or rhodium bath dipping. Built for professional jewellery making workshops and goldsmith artisans seeking reliable grip.",
        category: 'Tools',
        retailPrice: 280,
        wholesalePrice: 195,
        wholesaleMOQ: 12,
        inStock: true,
        primaryImage: '/images/products/red-tweezers.png',
        gallery: createGallery('red-tweezers', 4, 'Red Coated Grip Tweezers'),
        brand: "Dinanath & Sons",
        sku: "DNS-TW-RC",
        features: [
            "Comfort-dip PVC red coated ergonomic handle",
            "Thermal insulation protecting fingers during hot component handling",
            "Precision serrated tip jaws for slip-free wire holding",
            "Corrosion resistant stainless steel body"
        ],
        specifications: {
            "Material": "Stainless Steel with PVC Coating",
            "Length": "130 mm",
            "Tip Type": "Serrated Straight Tip",
            "Application": "Soldering, Plating, Pickling, Gemstone Sorting",
            "Wholesale Pack": "Box of 12 Units"
        },
        reviews: []
    },
    {
        id: 't-ss-10k',
        name: "SS 10K Tweezers",
        description: "The SS 10K series represents industrial-grade stainless steel tweezers engineered for high-volume jewellery manufacturing facilities. With reinforced shanks and precision ground needle points, these tweezers offer maximum rigidity and zero tip deflection when manipulating heavy gauge gold wires or mounting casting sprues. Manufactured to strict metallurgical standards in Delhi, offering unbeatable longevity for industrial workshops.",
        category: 'Tools',
        retailPrice: 400,
        wholesalePrice: 285,
        wholesaleMOQ: 10,
        inStock: true,
        primaryImage: '/images/products/tweezer-ss-10k.png',
        gallery: [{ id: '1', type: 'image', url: '/images/products/tweezer-ss-10k.png', altText: "SS 10K Industrial Goldsmith Tweezers Dinanath & Sons" }],
        brand: "Dinanath & Sons",
        sku: "DNS-TW-10K",
        features: [
            "Reinforced thick-shank body prevents tip deflection",
            "High-tensile stainless steel alloy for heavy workshop usage",
            "Precision aligned needle tips for micro-assembly",
            "Non-magnetic properties for clean workbench handling"
        ],
        specifications: {
            "Material": "High-Grade Stainless Steel Alloy",
            "Length": "135 mm",
            "Tip Type": "Straight Needle Point",
            "Application": "Industrial Casting, Heavy Wire Holding, Sprue Assembly",
            "Wholesale Pack": "Box of 10 Units"
        },
        reviews: []
    },
    {
        id: 't-steel-nose-plier',
        name: "Steel Nose Round Plier",
        description: "A foundational goldsmith hand tool, the Steel Nose Round Plier features finely tapered round conical jaws designed for creating flawless wire loops, jump rings, filigree coils, and smooth bends in precious gold, silver, and copper wire. Drop-forged from induction-hardened high-carbon steel with precision-ground jaw surfaces that will not mar or scratch delicate precious metal finishes. Ideal for independent designers and wholesale jewellery manufacturing factories.",
        category: 'Tools',
        retailPrice: 450,
        wholesalePrice: 320,
        wholesaleMOQ: 6,
        inStock: true,
        primaryImage: "/images/products/dinanath's-steel-nose-round-plier.png",
        gallery: createGallery("dinanath's-steel-nose-round-plier", 3, "Steel Nose Round Plier"),
        brand: "Dinanath & Sons",
        sku: "DNS-PL-RN",
        features: [
            "Induction hardened high-carbon tool steel construction",
            "Smooth conical jaws prevent surface marking on gold and silver",
            "Box-joint construction for permanent jaw alignment",
            "Double-leaf spring mechanism for effortless repetitive action"
        ],
        specifications: {
            "Material": "Drop-Forged High Carbon Steel",
            "Jaw Shape": "Conical Round Nose (Smooth)",
            "Length": "130 mm (5.1 inches)",
            "Application": "Wire Looping, Jump Rings, Filigree Bending, Chain Making",
            "Wholesale Pack": "Carton of 6 Units"
        },
        reviews: []
    },
    {
        id: 't-nipper-cutter',
        name: "Precision Nipper Cutter",
        description: "Engineered for flush cuts on precious metal wires, headpins, and sprues, this Precision Nipper Cutter features razor-sharp induction-hardened diagonal cutting edges. The flush-cut geometry leaves minimal metal burr, drastically reducing filing and cleanup time on gold and silver jewellery pieces. Built with ergonomic handles and spring return for high-speed workshop wire cutting. Available with bulk wholesale pricing from Chandni Chowk.",
        category: 'Tools',
        retailPrice: 350,
        wholesalePrice: 245,
        wholesaleMOQ: 6,
        inStock: true,
        primaryImage: '/images/products/nipper-cutter.png',
        gallery: createGallery('nipper-cutter', 2, 'Precision Nipper Cutter'),
        brand: "Dinanath & Sons",
        sku: "DNS-CT-NP",
        features: [
            "Ultra-sharp flush cutting edges for minimal burr",
            "Hardened carbon tool steel cutting jaws for long edge retention",
            "Ergonomic non-slip grips with smooth return spring",
            "Cuts up to 14 AWG (1.6mm) copper, brass, gold, and sterling silver wire"
        ],
        specifications: {
            "Material": "Hardened Chrome Vanadium Steel",
            "Cutting Action": "Full Flush Diagonal Cut",
            "Length": "125 mm",
            "Application": "Precious Metal Wire Trimming, Sprue Cutting, Beading",
            "Wholesale Pack": "Carton of 6 Units"
        },
        reviews: []
    },
    {
        id: 't-red-plier',
        name: "Red Handle Chain Nose Plier",
        description: "Versatile chain nose goldsmith plier featuring ergonomic red vinyl handles for comfort and slip resistance. The semi-round exterior and flat interior jaw faces allow master goldsmiths to securely hold small findings, open and close jump rings, and straighten delicate settings without slippage. Built with a smooth box joint and internal return spring for maximum efficiency in daily jewellery assembly workshops.",
        category: 'Tools',
        retailPrice: 380,
        wholesalePrice: 260,
        wholesaleMOQ: 6,
        inStock: true,
        primaryImage: '/images/products/red-plier.png',
        gallery: createGallery('red-plier', 3, 'Red Handle Chain Nose Plier'),
        brand: "Dinanath & Sons",
        sku: "DNS-PL-RD",
        features: [
            "Smooth flat interior jaws prevent scratching precious metal",
            "Tapered chain nose profile for reaching narrow gemstone settings",
            "Cushioned red PVC dipped handles for all-day bench comfort",
            "Heavy-duty box joint construction"
        ],
        specifications: {
            "Material": "Drop-Forged High Carbon Steel",
            "Jaw Type": "Chain Nose (Flat Interior, Round Exterior)",
            "Length": "130 mm",
            "Application": "Jump Rings, Stone Setting, Gripping Findings, Wire Bending",
            "Wholesale Pack": "Carton of 6 Units"
        },
        reviews: []
    },
    {
        id: 't-ss-plier',
        name: "Heavy Duty Stainless Steel Plier",
        description: "Forged entirely from premium stainless steel, this heavy-duty plier is designed to withstand aggressive workshop environments, pickling acid fumes, and high-force sheet manipulation. The rust-proof body ensures long service life in casting and polishing shops without pitting or corrosion. Precision-machined flat jaws deliver massive gripping force for bending thick sheet stock and straightening heavy wire.",
        category: 'Tools',
        retailPrice: 500,
        wholesalePrice: 350,
        wholesaleMOQ: 6,
        inStock: true,
        primaryImage: '/images/products/ss-plier.png',
        gallery: createGallery('ss-plier', 3, 'Heavy Duty Stainless Steel Plier'),
        brand: "Dinanath & Sons",
        sku: "DNS-PL-SS",
        features: [
            "100% Solid Stainless Steel body — completely rust and acid resistant",
            "Precision ground flat jaws for maximum sheet metal holding power",
            "Serrated hand grip zone for positive traction",
            "Ideal for casting workshops and acidic pickling environments"
        ],
        specifications: {
            "Material": "Solid Surgical Grade Stainless Steel",
            "Jaw Type": "Heavy Duty Flat Nose",
            "Length": "145 mm",
            "Application": "Sheet Metal Bending, Heavy Wire Straightening, Acidic Wash",
            "Wholesale Pack": "Carton of 6 Units"
        },
        reviews: []
    },
    {
        id: 't-katiya',
        name: "Traditional Goldsmith Katiya Shears",
        description: "The Katiya is the quintessential traditional Indian goldsmithing shear, hand-forged from hardened spring steel for cutting sheet metal, wire, and solder strips. Its unique offset curved handles provide immense mechanical leverage, allowing clean, effortless cuts through thick gold, silver, and copper sheet without buckling the metal. A timeless tool used across generations of jewellers in Chandni Chowk and throughout India.",
        category: 'Tools',
        retailPrice: 600,
        wholesalePrice: 420,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/katiya.png',
        gallery: createGallery('katiya', 2, 'Traditional Goldsmith Katiya Shears'),
        brand: "Dinanath & Sons",
        sku: "DNS-SH-KT",
        features: [
            "Hand-forged high-carbon spring steel cutting blades",
            "Traditional Indian offset handle geometry for unmatched cutting torque",
            "Cuts through gold, silver, and brass sheet up to 1.5mm thickness",
            "Easily resharpened on bench oilstones for decades of use"
        ],
        specifications: {
            "Material": "Hand-Forged High Carbon Spring Steel",
            "Length": "180 mm - 200 mm",
            "Cutting Edge": "Straight Hand-Ground Bevel",
            "Application": "Sheet Metal Shearing, Solder Paillon Cutting, Ingot Trimming",
            "Wholesale Pack": "Bundle of 5 Units"
        },
        reviews: []
    },
    {
        id: 't-sandasi',
        name: "Crucible & Flask Sandasi Tongs",
        description: "Hand-forged heavy-duty furnace tongs (Sandasi) designed for safely grasping red-hot melting crucibles, casting flasks, and ingot molds during gold and silver melting operations. Built from thick wrought steel with ribbed curved gripping jaws that clamp securely around graphite and ceramic crucibles, preventing hazardous spills during the pour. A safety-critical tool for every melting furnace and casting workshop.",
        category: 'Tools',
        retailPrice: 300,
        wholesalePrice: 210,
        wholesaleMOQ: 10,
        inStock: true,
        primaryImage: '/images/products/sandasi.png',
        gallery: createGallery('sandasi', 3, 'Crucible Sandasi Tongs'),
        brand: "Dinanath & Sons",
        sku: "DNS-TG-SD",
        features: [
            "Heavy wrought iron construction withstands direct furnace flames",
            "Curved jaw geometry locks tightly around melting crucibles and flasks",
            "Long reach handles keep artisan hands safely away from radiant heat",
            "Essential for centrifugal casting, vacuum casting, and ingot pouring"
        ],
        specifications: {
            "Material": "Heavy-Duty Wrought Steel",
            "Length": "350 mm - 400 mm",
            "Grip Capacity": "Crucibles 50g to 1kg capacity",
            "Application": "Gold/Silver Melting, Crucible Pouring, Flask Handling",
            "Wholesale Pack": "Bundle of 10 Units"
        },
        reviews: []
    },
    {
        id: 't-file-set',
        name: "Swiss Pattern Needle File Set",
        description: "A precision 6-piece Swiss Pattern Needle File Set essential for detailed jewelry finishing, cleaning up casting sprues, smoothing prong tips, and shaping custom ring shanks. Includes flat, half-round, round, square, triangle, and warding file profiles cut with Cut-2 medium-fine teeth. Crafted from heat-treated high-carbon tool steel with precision knurled tangs for comfortable bench use with or without wooden handles.",
        category: 'Tools',
        retailPrice: 850,
        wholesalePrice: 590,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/file-set.png',
        gallery: createGallery('file-set', 4, 'Swiss Pattern Needle File Set'),
        brand: "Dinanath & Sons",
        sku: "DNS-FL-6SET",
        features: [
            "6 essential profile shapes: Flat, Half-Round, Round, Square, Triangle, Warding",
            "Cut-2 medium-fine Swiss pattern teeth for smooth metal removal",
            "Induction hardened to 64 HRC for extended sharpness on gold and platinum",
            "Knurled non-slip round tangs compatible with universal file handles"
        ],
        specifications: {
            "Material": "High-Carbon Tool Steel (64 HRC)",
            "Length": "140 mm (5.5 inches)",
            "Cut Grade": "Swiss Pattern Cut #2",
            "Application": "Prong Shaping, Sprue Cleanup, Filigree Detailing, Solder Trimming",
            "Wholesale Pack": "Box of 5 Sets"
        },
        reviews: []
    },
    {
        id: 't-saw-blade',
        name: "Clarion Swiss Saw Blades (Pack of 144)",
        description: "Professional Clarion brand jeweler's piercing saw blades, manufactured from heat-treated tungsten steel for precision cutting of gold, sterling silver, copper, brass, and platinum sheet. Featuring razor-sharp, uniformly set teeth that cut smoothly on the pull stroke without binding, chattering, or premature breakage. Available in a gross package (144 blades) across sizes #2/0, #3/0, and #4/0 for fine filigree and heavy sheet piercing.",
        category: 'Tools',
        retailPrice: 200,
        wholesalePrice: 140,
        wholesaleMOQ: 24,
        inStock: true,
        primaryImage: '/images/products/clarion-saw-blade.png',
        gallery: createGallery('clarion-saw-blade', 2, 'Clarion Swiss Saw Blades'),
        brand: "Dinanath & Sons",
        sku: "DNS-SB-CLR",
        features: [
            "High-tensile tungsten-alloy steel for maximum blade flexibility",
            "Uniform tooth pitch and kerf prevent binding in thick metal",
            "144 blades per gross pack for commercial production workshops",
            "Available in multiple gauge sizes for ultra-fine to heavy cutting"
        ],
        specifications: {
            "Material": "Tungsten Alloy Saw Steel",
            "Length": "130 mm Standard Jeweler Saw Length",
            "Quantity": "1 Gross (144 Saw Blades)",
            "Application": "Intricate Metal Piercing, Sheet Contouring, Solder Cutting",
            "Wholesale Pack": "Bundle of 24 Gross Packs"
        },
        reviews: []
    },
    {
        id: 't-saw-handle',
        name: "Adjustable Jeweler Saw Frame",
        description: "Heavy-duty adjustable jeweler's piercing saw frame built from nickel-plated spring steel with a contoured hardwood ergonomic handle. The knurled thumbscrews and hardened clamping plates securely lock standard 130mm piercing saw blades without slipping during aggressive cutting. Adjustable throat depth allows utilization of broken saw blade fragments, significantly reducing consumable overhead for high-volume workshops.",
        category: 'Tools',
        retailPrice: 450,
        wholesalePrice: 310,
        wholesaleMOQ: 6,
        inStock: true,
        primaryImage: '/images/products/saw-handle.png',
        gallery: [{ id: '1', type: 'image', url: '/images/products/saw-handle.png', altText: "Adjustable Jeweler Saw Frame Hardwood Handle Dinanath & Sons" }],
        brand: "Dinanath & Sons",
        sku: "DNS-SF-ADJ",
        features: [
            "Heavy nickel-plated steel frame maintains rigid blade tension",
            "Adjustable spine accommodates full-length and shortened blade remnants",
            "Precision thumbscrew clamps with hardened serrated clamping plates",
            "Ergonomic lacquered hardwood handle for comfortable bench control"
        ],
        specifications: {
            "Material": "Nickel-Plated Steel with Hardwood Handle",
            "Throat Depth": "75 mm (3 inches)",
            "Blade Compatibility": "Standard 130 mm Piercing Blades",
            "Application": "Metal Piercing, Scroll Cutting, Casting Sprue Removal",
            "Wholesale Pack": "Carton of 6 Units"
        },
        reviews: []
    },
    {
        id: 't-ring-stick',
        name: "Aluminum Ring Sizing Mandrel",
        description: "Precision-machined solid aluminum ring sizing mandrel stick engraved with standard Indian, US (1-15), UK (A-Z), and European ring size scales. Provides exact, calibrated ring measurements for retail jewelry showrooms and manufacturing goldsmith benches. The smooth aluminum surface will not scratch polished precious metal ring shanks, making it indispensable for sizing checks, custom order fittings, and bridal ring fabrication.",
        category: 'Tools',
        retailPrice: 550,
        wholesalePrice: 380,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/ring-stick.png',
        gallery: createGallery('ring-stick', 3, 'Aluminum Ring Sizing Mandrel'),
        brand: "Dinanath & Sons",
        sku: "DNS-MD-RS",
        features: [
            "Precision laser-etched multi-scale markings: Indian, US (1-15), UK (A-Z), Euro",
            "Lightweight, durable aircraft-grade solid aluminum construction",
            "Grooved back channel accommodates stone-set ring under-galleries",
            "Essential for retail showroom counters and workshop sizing calibration"
        ],
        specifications: {
            "Material": "Solid Anodized Aluminum",
            "Length": "250 mm",
            "Size Scale": "Indian (1-32), US (1-15), UK (A-Z), Euro (41-76)",
            "Application": "Ring Size Measurement, Quality Control, Retail Showrooms",
            "Wholesale Pack": "Box of 5 Units"
        },
        reviews: []
    },
    {
        id: 't-ring-extender',
        name: "Benchtop Ring Extender & Enlarger",
        description: "Compact benchtop ring enlarger and stretcher tool equipped with an 8-segment expanding collet mandrel. By depressing the mechanical lever, the collet expands uniformly, stretching gold, silver, and platinum plain bands up to 2 full ring sizes without marring the inside shank. Designed for retail jeweller service counters and workshop sizing adjustments where rapid ring enlargement is needed.",
        category: 'Tools',
        retailPrice: 2500,
        wholesalePrice: 1750,
        wholesaleMOQ: 2,
        inStock: true,
        primaryImage: '/images/products/ring-extender.png',
        gallery: createGallery('ring-extender', 2, 'Benchtop Ring Extender'),
        brand: "Dinanath & Sons",
        sku: "DNS-RE-BN",
        features: [
            "8-segment hardened tool steel expanding collet",
            "Smooth cam-action leverage mechanism requires minimal effort",
            "Enlarges plain wedding bands and solitaires up to 2 full sizes",
            "Bench-mountable base with pre-drilled bolt holes"
        ],
        specifications: {
            "Material": "Cast Iron Body with Hardened Steel Mandrel",
            "Capacity": "Plain Ring Bands Size 4 to 14",
            "Mounting": "Benchtop Bolt-On Base",
            "Application": "Rapid Plain Ring Band Sizing, Wedding Band Enlargement",
            "Wholesale Pack": "Carton of 2 Units"
        },
        reviews: []
    },
    {
        id: 't-ring-extender-heavy',
        name: "Heavy Duty Ring Stretcher & Reducer",
        description: "Industrial dual-action ring sizing machine featuring a stepped vertical expanding mandrel on top for ring stretching, and a 16-cavity reduction die plate at the base for ring compression. Allows master goldsmiths to both enlarge and reduce plain gold, silver, and platinum wedding bands with exact precision in seconds. Built from heavy cast steel with ground reduction dies for commercial jewellery manufacturing plants.",
        category: 'Tools',
        retailPrice: 8500,
        wholesalePrice: 6200,
        wholesaleMOQ: 1,
        inStock: true,
        primaryImage: '/images/products/heavy-duty-ring-extender.png',
        gallery: createGallery('heavy-duty-ring-extender', 2, 'Heavy Duty Ring Stretcher Reducer'),
        brand: "Dinanath & Sons",
        sku: "DNS-RE-HD",
        features: [
            "Dual-action machine: vertical 4-spline stretching mandrel + 16-cavity reduction die",
            "Reduces plain bands smoothly without distorting profile or wall thickness",
            "Heavy-duty cast steel frame handles heavy gents' gold and silver rings",
            "Reversible smooth reduction dies protect diamond-cut textures"
        ],
        specifications: {
            "Material": "Heavy Cast Steel & Hardened Tool Steel Dies",
            "Weight": "9.5 kg",
            "Reduction Dies": "16 Sizing Holes (Smooth Ground)",
            "Application": "Commercial Ring Sizing, Manufacturing Workshop Resizing",
            "Wholesale Pack": "Individual Wooden Crate"
        },
        reviews: []
    },
    {
        id: 't-sharping-stone',
        name: "Dual-Grit Bench Sharpening Stone",
        description: "Professional combination bench oilstone featuring coarse silicon carbide on one face for rapid bevel re-profiling, and ultra-fine aluminum oxide on the reverse for razor-edge honing. Indispensable for sharpening goldsmith gravers, scraper blades, chisels, drill bits, and shears. Pre-conditioned for use with honing oil or water, delivering crisp cutting edges that enhance engraving and metal carving precision.",
        category: 'Tools',
        retailPrice: 350,
        wholesalePrice: 230,
        wholesaleMOQ: 10,
        inStock: true,
        primaryImage: '/images/products/sharping-stone.png',
        gallery: createGallery('sharping-stone', 3, 'Dual-Grit Bench Sharpening Stone'),
        brand: "Dinanath & Sons",
        sku: "DNS-ST-SH",
        features: [
            "Dual-grit design: Coarse 120-grit for shaping + Fine 320-grit for honing",
            "Even grain wear for consistently flat sharpening surfaces",
            "Essential for maintenance of gravers, shears, chisels, and cutting tools",
            "Works with light mineral oil, honing fluid, or water"
        ],
        specifications: {
            "Material": "Silicon Carbide & Aluminum Oxide Abrasive",
            "Dimensions": "150 mm x 50 mm x 25 mm (6 x 2 x 1 inches)",
            "Grit": "120 Coarse / 320 Fine",
            "Application": "Graver Sharpening, Shears Edge Honing, Tool Maintenance",
            "Wholesale Pack": "Carton of 10 Units"
        },
        reviews: []
    },
    {
        id: 't-gas-torch-auto',
        name: "Auto Ignition Piezo Gas Torch",
        description: "High-temperature handheld butane blowtorch equipped with an instantaneous push-button piezo ignition system and continuous flame-lock switch. Delivers a focused pencil flame reaching up to 1,300°C (2,370°F), ideal for silver soldering, gold filigree assembly, prong retipping, and enamel firing. Featuring precision needle gas valve regulation and ergonomic grip for safe bench soldering.",
        category: 'Tools',
        retailPrice: 1200,
        wholesalePrice: 850,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/gas-torch-auto.png',
        gallery: createGallery('gas-torch-auto', 4, 'Auto Ignition Piezo Gas Torch'),
        brand: "Dinanath & Sons",
        sku: "DNS-GT-AUTO",
        features: [
            "Instant piezo push-button ignition — no flint striker required",
            "Adjustable needle valve produces micro-pencil flame up to 1,300°C",
            "Continuous flame lock switch for hands-free melting operations",
            "Refillable via standard butane fuel canisters"
        ],
        specifications: {
            "Max Temperature": "1,300°C (2,370°F)",
            "Fuel": "Refillable Butane Gas",
            "Ignition": "Piezo Electric Spark",
            "Application": "Micro-Soldering, Filigree Work, Gold/Silver Repairs, Enameling",
            "Wholesale Pack": "Box of 5 Units"
        },
        reviews: []
    },
    {
        id: 't-gas-torch-manual',
        name: "Brass Gas Torch Head",
        description: "Heavy-duty solid brass torch head engineered for commercial goldsmith workshops utilizing LPG or butane fuel cylinders. The precision brass venturi nozzle mixes air and gas efficiently to produce an intensely hot, oxidizing flame ideal for melting small gold buttons, heavy silver annealing, and brazing thick jewellery components. Built for rugged durability in busy Chandni Chowk workshops.",
        category: 'Tools',
        retailPrice: 600,
        wholesalePrice: 420,
        wholesaleMOQ: 10,
        inStock: true,
        primaryImage: '/images/products/gas-torch-manual.png',
        gallery: createGallery('gas-torch-manual', 3, 'Brass Gas Torch Head'),
        brand: "Dinanath & Sons",
        sku: "DNS-GT-MAN",
        features: [
            "100% Heavy Forged Solid Brass Body for extreme thermal resistance",
            "Precision needle valve for micro-control of gas flow rate",
            "Standard 8mm hose barb connection for LPG / butane gas tubing",
            "Built for continuous daily workshop annealing and melting"
        ],
        specifications: {
            "Material": "Solid Forged Brass",
            "Inlet": "8 mm Standard Gas Hose Barb",
            "Flame Type": "Broad Melting & Annealing Cone",
            "Application": "Gold/Silver Annealing, Ingot Melting, Heavy Soldering",
            "Wholesale Pack": "Carton of 10 Units"
        },
        reviews: []
    },
    {
        id: 't-gas-burner',
        name: "Industrial Jewellery Melting Gas Burner",
        description: "High-output industrial gas burner system designed for gold melting furnaces, casting crucibles, and high-capacity assay melting pots. Features a multi-port burner head that generates intense radiant heat distribution, reducing melting cycle times for 100g to 2kg batches of gold, silver, and brass alloys. Engineered with durable cast steel fittings and air damper control for optimal fuel efficiency.",
        category: 'Tools',
        retailPrice: 2800,
        wholesalePrice: 1950,
        wholesaleMOQ: 2,
        inStock: true,
        primaryImage: '/images/products/gas-burner.png',
        gallery: createGallery('gas-burner', 4, 'Industrial Jewellery Melting Gas Burner', true),
        brand: "Dinanath & Sons",
        sku: "DNS-GB-IND",
        features: [
            "Multi-jet burner nozzle delivers high-BTU radiant melting heat",
            "Adjustable air damper choke controls oxidation/reduction atmosphere",
            "Heavy-duty cast steel and brass construction withstands furnace heat",
            "Drastically reduces melting times for casting flasks and ingots"
        ],
        specifications: {
            "Material": "Cast Steel & Brass Alloy",
            "BTU Output": "High-Capacity Industrial Grade",
            "Compatibility": "LPG / Propane / Natural Gas",
            "Application": "Furnace Melting, Crucible Ingot Casting, Refining",
            "Wholesale Pack": "Carton of 2 Units"
        },
        reviews: []
    },

    // --- CHEMICALS & FLUXES ---
    {
        id: 'c-suhaga-liquid',
        name: "Liquid Suhaga Borax Soldering Flux",
        description: "Premixed liquid borax flux (Liquid Suhaga) specially formulated for gold and silver jewelry micro-soldering. When applied to solder joints, it forms a protective transparent glass layer that prevents oxidation of precious metals and facilitates rapid, smooth flow of solder paillons across delicate filigree wires and ring joints. Easy to apply with bench brush or syringe, washing off cleanly in hot water or warm pickle.",
        category: 'Chemicals',
        retailPrice: 150,
        wholesalePrice: 95,
        wholesaleMOQ: 20,
        inStock: true,
        primaryImage: '/images/products/suhaga-goti.png',
        gallery: createGallery('suhaga-goti', 4, 'Liquid Suhaga Soldering Flux'),
        brand: "Dinanath & Sons",
        sku: "DNS-CH-SUHL",
        features: [
            "Ready-to-use liquid borax formulation — no grinding required",
            "Prevents precious metal firescale and surface oxidation",
            "Promotes ultra-smooth capillary solder flow on fine filigree",
            "Dissolves rapidly in standard alum or sulfuric pickling solutions"
        ],
        specifications: {
            "Composition": "Refined Borax & Chemical Activating Agents",
            "Volume": "250 ml Bottle",
            "Application": "Gold, Silver, Platinum, Brass Soldering",
            "Clean-up": "Warm Water / Pickling Bath",
            "Wholesale Pack": "Case of 20 Bottles"
        },
        reviews: []
    },
    {
        id: 'c-suhaga-solid',
        name: "Pure Suhaga Goti (Solid Borax Mineral)",
        description: "Natural high-purity solid borax lumps (Suhaga Goti), the traditional foundation of Indian goldsmithing and metallurgy. Rubbed with water on an unglazed ceramic flux slate (Patthar) to generate freshly ground, paste flux for gold soldering, or crushed into melting crucibles to form a protective slag that captures impurities and dross during precious metal refining. Supplied direct from Chandni Chowk in 500g and bulk 10kg workshop bags.",
        category: 'Chemicals',
        retailPrice: 120,
        wholesalePrice: 75,
        wholesaleMOQ: 25,
        inStock: true,
        primaryImage: '/images/products/suhaga-big.png',
        gallery: createGallery('suhaga-big', 2, 'Pure Suhaga Goti Solid Borax'),
        brand: "Dinanath & Sons",
        sku: "DNS-CH-SUHG",
        features: [
            "100% Pure natural mined crystal borax lumps (Suhaga Goti)",
            "Generates superior non-oxidizing paste on ceramic grinding slates",
            "Essential crucible flux for gold refining, melting, and ingot casting",
            "Absorbs base metal oxides to produce mirror-clean gold buttons"
        ],
        specifications: {
            "Chemical Formula": "Na2B4O7·10H2O (Sodium Tetraborate Decahydrate)",
            "Form": "Solid Natural Translucent Crystals / Lumps",
            "Net Weight": "500 Grams Pack",
            "Application": "Crucible Melting Flux, Slate Paste Soldering Flux, Refining",
            "Wholesale Pack": "Carton of 25 Packs (12.5 kg)"
        },
        reviews: []
    },
    {
        id: 'c-silver-cleaner',
        name: "Instant Dip Silver Cleaner Solution",
        description: "Professional instant chemical dip cleaner formulated to dissolve black silver sulfide tarnish, oxidation, and grease from sterling silver jewelry, antique tableware, and filigree ornaments within seconds. Simply submerge tarnished items for 10-15 seconds, rinse thoroughly with clean water, and dry with a soft cloth for restored brilliant showroom lustre without removing underlying metal.",
        category: 'Chemicals',
        retailPrice: 350,
        wholesalePrice: 220,
        wholesaleMOQ: 12,
        inStock: true,
        primaryImage: '/images/products/silver-cleaner.png',
        gallery: createGallery('silver-cleaner', 4, 'Instant Dip Silver Cleaner'),
        brand: "Dinanath & Sons",
        sku: "DNS-CH-SILV",
        features: [
            "Instant 10-second chemical dip eliminates heavy black tarnish",
            "Deeply penetrates intricate filigree and chain links where cloths cannot reach",
            "Non-abrasive formula preserves fine decorative engravings and hallmarks",
            "Reusable solution suitable for retail showrooms and maintenance workshops"
        ],
        specifications: {
            "Formulation": "Acidic Thiourea Tarnish Dissolver",
            "Volume": "500 ml Bottle",
            "Action Time": "10 - 20 Seconds Immersion",
            "Application": "Silver Jewellery, Antique Silverware, Bullion Coins",
            "Wholesale Pack": "Case of 12 Bottles"
        },
        reviews: []
    },
    {
        id: 'c-tiktak-cleaner',
        name: "Tik Tak Silver Polish & Protector",
        description: "Tik Tak premium silver polishing emulsion cleans, polishes, and coats precious silver articles with a long-lasting anti-tarnish protective barrier. Formulated with ultra-fine cosmetic-grade polishing abrasives that buff away light scratches and oxidation, imparting a mirror-bright showroom shine while repelling moisture and atmospheric sulfur for months. Trusted by top retail jewelers across Delhi.",
        category: 'Chemicals',
        retailPrice: 450,
        wholesalePrice: 310,
        wholesaleMOQ: 12,
        inStock: true,
        primaryImage: '/images/products/tik-tak-silver-cleaner.png',
        gallery: createGallery('tik-tak-silver-cleaner', 3, 'Tik Tak Silver Polish'),
        brand: "Dinanath & Sons",
        sku: "DNS-CH-TTK",
        features: [
            "Cleans, shines, and leaves an invisible anti-tarnish protective coating",
            "Ultra-fine cosmetic polishing particles prevent hairline scratching",
            "Ideal for high-end showroom silver displays and temple jewellery",
            "Easy wipe-on, buff-off cream formula"
        ],
        specifications: {
            "Form": "Liquid Cream Emulsion",
            "Volume": "400 ml Bottle",
            "Application": "Fine Silver Jewellery, Display Ornaments, Religious Idols",
            "Wholesale Pack": "Case of 12 Units"
        },
        reviews: []
    },

    // --- CONSUMABLES & POLISHING ---
    {
        id: 'c-gas-refill',
        name: "High-Purity Butane Gas Canister",
        description: "Zero-impurity, high-pressure refined butane gas canister designed specifically for jeweler's precision soldering torches, micro-blowtorches, and dental torches. Quadruple-filtered gas ensures clean, odorless combustion without clogging delicate torch burner nozzles or sputtering during intricate soldering operations. Includes universal multi-adapter nozzle caps to fit all commercial refillable torches.",
        category: 'Consumables',
        retailPrice: 150,
        wholesalePrice: 95,
        wholesaleMOQ: 24,
        inStock: true,
        primaryImage: '/images/products/gas-refill.png',
        gallery: createGallery('gas-refill', 2, 'High Purity Butane Gas Canister'),
        brand: "Dinanath & Sons",
        sku: "DNS-CN-BUT",
        features: [
            "Quadruple-refined pure butane fuel prevents nozzle clogging",
            "Clean combustion produces maximum flame temperature up to 1,300°C",
            "Universal multi-tip adapter cap included in lid",
            "Leak-proof aerosol canister with safety release valve"
        ],
        specifications: {
            "Volume": "250 ml (140g) Canister",
            "Purity": "Near-Zero Impurity Refined Butane",
            "Compatibility": "Universal Handheld Torches & Soldering Irons",
            "Wholesale Pack": "Carton of 24 Canisters"
        },
        reviews: []
    },
    {
        id: 'c-joint-paper',
        name: "Soldering Joint Paper (Precious Metal Soldering Sheets)",
        description: "Ultra-thin precision soldering alloy sheet (Joint Paper) calibrated for seamless gold and silver joints. Rolled to microscopic gauge thickness, this solder sheet can be diced into micro-paillons with a cutter, providing exact solder volume for delicate filigree joints, chain links, and earring bezels without solder overflow or unsightly pooling. Melts and flows cleanly within tight metallurgical temperature ranges.",
        category: 'Consumables',
        retailPrice: 850,
        wholesalePrice: 620,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/joint-paper.png',
        gallery: createGallery('joint-paper', 3, 'Soldering Joint Paper Sheets'),
        brand: "Dinanath & Sons",
        sku: "DNS-CN-JP",
        features: [
            "Uniform rolled thickness for exact micro-paillon portioning",
            "Flows smoothly at calibrated goldsmith bench soldering temperatures",
            "Color-matched to high-karat gold and 925 sterling silver alloys",
            "Minimizes post-solder filing, acid cleanup, and metal waste"
        ],
        specifications: {
            "Gauge": "0.15 mm Ultra-Thin Sheet",
            "Dimensions": "50 mm x 100 mm Sheets",
            "Application": "Filigree Chains, Bezel Joints, Solder Paillons, Ring Sizing",
            "Wholesale Pack": "Pack of 5 Sheet Sets"
        },
        reviews: []
    },
    {
        id: 'c-copper-alloy',
        name: "Pure Copper Alloy Balls for Gold Karatage",
        description: "High-purity, oxygen-free electrolytic copper alloy shots/balls (99.99% Cu) formulated as the master alloying element for lowering 24K gold to 22K, 18K, or 14K jewelry standards. Uniform spherical ball geometry enables precise balance weighing down to the milligram, ensuring exact hallmarking assay compliance without porosity or brittle segregation. Certified oxygen-free for clean, smooth casting grain.",
        category: 'Consumables',
        retailPrice: 600,
        wholesalePrice: 420,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/copper-ball-alloy.png',
        gallery: createGallery('copper-ball-alloy', 2, 'Pure Copper Alloy Balls for Gold'),
        brand: "Dinanath & Sons",
        sku: "DNS-CN-CPBL",
        features: [
            "99.99% Pure electrolytic oxygen-free copper formulation",
            "Uniform spherical grain geometry for rapid, homogenous melting",
            "Prevents firecrack and metallurgical porosity in cast gold alloys",
            "Calibrated for hallmarking standards (916 22K, 750 18K, 585 14K)"
        ],
        specifications: {
            "Purity": "99.99% Electrolytic Copper (OFHC)",
            "Form": "Spherical Shots / Granules (2mm - 4mm)",
            "Net Weight": "500 Grams Pack",
            "Application": "Gold Karat Reduction, Master Alloy Formulation, Continuous Casting",
            "Wholesale Pack": "Carton of 5 Packs (2.5 kg)"
        },
        reviews: []
    },
    {
        id: 'c-cloth-buff',
        name: "Stitched Cotton Muslin Polishing Buff",
        description: "Multi-ply concentric stitched cotton muslin polishing wheel (Cloth Buff) designed for bench polishing motors and industrial lathe machines. Crafted from 100% premium unbleached cotton with tightly spiraled stitching that maintains firm wheel rigidity while holding rouge and polishing compounds evenly. Delivers exceptional high-mirror luster on gold, platinum, silver, and brass jewelry without burning the metal.",
        category: 'Consumables',
        retailPrice: 80,
        wholesalePrice: 45,
        wholesaleMOQ: 50,
        inStock: true,
        primaryImage: '/images/products/cloth-buff.png',
        gallery: createGallery('cloth-buff', 3, 'Stitched Cotton Muslin Polishing Buff'),
        brand: "Dinanath & Sons",
        sku: "DNS-CN-CB",
        features: [
            "100% Fine weave unbleached cotton muslin with spiral stitching",
            "Reinforced leather / fiber arbor center hole fits standard tapered spindles",
            "Even compound retention for high-efficiency mirror finishing",
            "Long working life with minimal edge fraying under high RPM"
        ],
        specifications: {
            "Material": "100% Unbleached Cotton Muslin (50 Ply)",
            "Diameter": "100 mm (4 inches) / 150 mm (6 inches)",
            "Center Hole": "Tapered Spindle Fit Leather Reinforced",
            "Application": "Final Mirror Polishing, Rouge Buffing, Luster Finishing",
            "Wholesale Pack": "Bundle of 50 Units"
        },
        reviews: []
    },

    // --- MACHINERY ---
    {
        id: 'm-dust-collector',
        name: "Sand Blast Dust Collector Machine",
        description: "Industrial heavy-duty dust collector and exhaust suction machine engineered for jewelry sandblasting cabinets, polishing hoods, and bench grinding stations. Powered by a high-torque continuous-duty induction motor and multi-stage filtration cartridge that captures 99.5% of precious metal grinding dust, investment powder, and abrasive sand. Prevents airborne respiratory hazards while recovering valuable gold and silver dust for refining.",
        category: 'Machinery',
        retailPrice: 15500,
        wholesalePrice: 12200,
        wholesaleMOQ: 1,
        inStock: true,
        primaryImage: '/images/products/sand-blasting-dust-collector-machine.png',
        gallery: createGallery('sand-blasting-dust-collector-machine', 2, 'Sand Blast Dust Collector Machine'),
        brand: "Dinanath & Sons",
        sku: "DNS-MC-DC",
        modelNumber: "SBD-750W",
        features: [
            "750W Heavy-duty industrial copper-wound suction motor",
            "Multi-stage high-efficiency particulate air filtration system",
            "Easy-access cleanout tray for 100% precious metal dust recovery",
            "Quiet low-vibration operation suitable for indoor jewelry workshops"
        ],
        specifications: {
            "Motor Power": "750W / 1.0 HP (220V Single Phase)",
            "Airflow Capacity": "650 CFM High Static Pressure Suction",
            "Dimensions": "450 mm x 380 mm x 580 mm",
            "Weight": "24 kg Solid Steel Housing",
            "Application": "Sandblast Suction, Polishing Dust Extraction, Gold Refining Recovery",
            "Warranty": "1 Year Comprehensive Workshop Warranty"
        },
        reviews: []
    },

    // --- PACKAGING & DISPLAY ---
    {
        id: 'p-coin-card',
        name: "Silver & Gold Coin Packing Card (Pack of 100)",
        description: "Premium tamper-evident coin packing cards designed for certifying and encapsulating 5g, 10g, 20g, and 50g gold and silver bullion coins. Features a crystal-clear rigid acrylic blister dome mounted on 450 GSM high-definition printed art board with security tamper-evident adhesive seals. Back panel includes designated fields for gross weight, fineness assay certification (999 Pure), and custom jeweler showroom branding. The premier coin packaging standard across Chandni Chowk and Pan-India retail jewelers.",
        category: 'Packaging',
        retailPrice: 25,
        wholesalePrice: 14,
        wholesaleMOQ: 100,
        inStock: true,
        primaryImage: '/images/packaging/silver-coins-5gms.png',
        gallery: [
            { id: '1', type: 'image', url: '/images/packaging/silver-coins-5gms.png', altText: "Silver Coin Packing Card 5g 10g Blister Assay Pack Dinanath & Sons" },
            { id: '2', type: 'image', url: '/images/packaging/silver-coins-5gms-2.png', altText: "Gold and Silver Coin Packaging Card Reverse Details Dinanath & Sons" }
        ],
        brand: "Dinanath & Sons",
        sku: "DNS-PK-CC",
        features: [
            "Tamper-evident security seal reveals attempted opening instantly",
            "Optical clarity acrylic blister protects coin proof surfaces from scratches",
            "450 GSM rigid art board with gold foil stamping accents",
            "Standard certification fields: Gross Weight, Purity (999/999.9), Lab Assay"
        ],
        specifications: {
            "Card Dimensions": "85 mm x 55 mm (Standard Credit Card Size)",
            "Blister Diameter": "Accommodates 25 mm - 38 mm Coin Sizes (5g - 50g)",
            "Board Material": "450 GSM Laminated Gold Foil Art Card",
            "Application": "Bullion Coin Packing, Corporate Gifting, Festive Gold Coins",
            "Wholesale Pack": "Bundle of 100 Cards (Bulk wholesale pricing for 1,000+)"
        },
        reviews: []
    },
    {
        id: 'p-tags',
        name: "Jewellery Price Tags (Pack of 1000)",
        description: "High-tensile dumb-bell jewelry price tags engineered from tear-proof synthetic polyester film for tagging rings, earrings, bangles, and necklaces. Features non-adhesive center bridges that wrap around delicate chains and ring shanks without leaving sticky adhesive residue. Compatible with thermal barcode printers, ballpoint pens, and fine indelible markers for showroom inventory management.",
        category: 'Packaging',
        retailPrice: 150,
        wholesalePrice: 90,
        wholesaleMOQ: 10,
        inStock: true,
        primaryImage: '/images/products/jewellery-tags.png',
        gallery: createGallery('jewellery-tags', 4, 'Jewellery Price Tags'),
        brand: "Dinanath & Sons",
        sku: "DNS-PK-TAG",
        features: [
            "Tear-proof synthetic polypropylene film will not stretch or rip",
            "Adhesive-free tail zone prevents glue transfer onto gold and diamonds",
            "Thermal transfer printable and compatible with jewelry barcode software",
            "Resistant to ultrasonic cleaning baths and steaming cycles"
        ],
        specifications: {
            "Material": "Tear-Resistant Synthetic Polypropylene",
            "Tag Size": "Standard Dumb-Bell Jewelry Format",
            "Quantity": "Roll / Pack of 1,000 Tags",
            "Application": "Showroom Inventory Barcodes, Price Display, Karat Tagging",
            "Wholesale Pack": "Bundle of 10 Packs (10,000 Tags)"
        },
        reviews: []
    },
    {
        id: 'p-pasa',
        name: "Hardened Steel Pasa Die Plate",
        description: "Precision-machined hardened steel Pasa (Drawplate / Die Plate) designed for uniform reduction, sizing, and shaping of gold and silver wire and tubing. Manufactured from high-chromium carbon die steel with diamond-polished conical holes that ensure mirror-smooth wire surface finish without galling or chatter marks. An indispensable classical goldsmith tool for hollow chain making, wire drawing, and casting calibration.",
        category: 'Tools',
        retailPrice: 1200,
        wholesalePrice: 850,
        wholesaleMOQ: 2,
        inStock: true,
        primaryImage: '/images/products/pasa.png',
        gallery: createGallery('pasa', 4, 'Hardened Steel Pasa Die Plate'),
        brand: "Dinanath & Sons",
        sku: "DNS-TL-PSA",
        features: [
            "High-carbon high-chromium tool steel hardened to 62 HRC",
            "Tungsten-carbide lined diamond-polished drawing holes",
            "Even step-down reductions prevent wire snapping during drawing",
            "Numbered holes for precise gauge tracking (0.5mm to 3.0mm)"
        ],
        specifications: {
            "Material": "Hardened Chrome Tool Steel (62 HRC)",
            "Hole Count": "31 Calibrated Progressive Wire Holes",
            "Dimensions": "200 mm x 45 mm x 6 mm",
            "Application": "Wire Drawing, Tube Sizing, Filigree Gauge Reduction",
            "Wholesale Pack": "Box of 2 Units"
        },
        reviews: []
    },

    // --- BULLION (Certified Precious Metals) ---
    {
        id: 'b-gold-bar-1g',
        name: "24K Gold Bar (1 Gram)",
        description: "Certified 999.9 pure 24 Karat gold bar weighing exactly 1 gram, hermetically sealed in a tamper-evident assay security blister card with unique serial number and refiner certificate. Sourced from NABL-accredited bullion refineries, making it ideal for systematic gold investment, wedding gifting, and delicate micro-alloy goldsmithing.",
        category: 'Bullion',
        retailPrice: 7500,
        wholesalePrice: 7350,
        wholesaleMOQ: 1,
        inStock: true,
        primaryImage: '/images/products/gold-bar-1gms.png',
        gallery: [{ id: '1', type: 'image', url: '/images/products/gold-bar-1gms.png', altText: "24K 999.9 Pure Gold Bar 1g Assay Packed Dinanath & Sons" }],
        brand: "Dinanath & Sons",
        sku: "DNS-BL-G1",
        features: [
            "999.9 Purity (24 Karat) certified bullion",
            "Hermetically sealed in tamper-proof assay blister card",
            "Laser engraved with individual serial number and purity mark",
            "Insured doorstep pan-India delivery"
        ],
        specifications: {
            "Metal": "24 Karat Pure Gold",
            "Purity": "999.9 Fineness",
            "Weight": "1.000 Gram",
            "Packaging": "Tamper-Evident Security Assay Card"
        },
        reviews: []
    },
    {
        id: 'b-gold-bar-5g',
        name: "24K Gold Bar (5 Grams)",
        description: "Certified 999.9 pure 24 Karat gold bar weighing exactly 5 grams, sealed in an assay card with verifiable hallmark certification. Engineered for serious bullion investors and commercial jewelry casting workshops requiring virgin gold stock for Karat batch formulations.",
        category: 'Bullion',
        retailPrice: 37500,
        wholesalePrice: 36800,
        wholesaleMOQ: 1,
        inStock: true,
        primaryImage: '/images/products/gold-bar-5gms.png',
        gallery: [{ id: '1', type: 'image', url: '/images/products/gold-bar-5gms.png', altText: "24K 999.9 Pure Gold Bar 5g Assay Certified Dinanath & Sons" }],
        brand: "Dinanath & Sons",
        sku: "DNS-BL-G5",
        features: [
            "999.9 Purity (24 Karat) certified gold bar",
            "Assay card with tamper-evident security seal",
            "Guaranteed weight and hallmark purity",
            "Ideal for workshop master alloy formulations"
        ],
        specifications: {
            "Metal": "24 Karat Pure Gold",
            "Purity": "999.9 Fineness",
            "Weight": "5.000 Grams",
            "Packaging": "Tamper-Evident Security Assay Card"
        },
        reviews: []
    },
    {
        id: 'b-silver-coin-20g',
        name: "999 Pure Silver Coin (20 Grams)",
        description: "Brilliant uncirculated 999 pure fine silver coin weighing 20 grams, sealed in an airtight protective acrylic capsule and assay presentation card. Features mirror-proof finishes with frosted embossed motifs. Popular for Diwali gifting, wedding shagun, corporate rewards, and silver jewelry alloying.",
        category: 'Bullion',
        retailPrice: 2000,
        wholesalePrice: 1850,
        wholesaleMOQ: 5,
        inStock: true,
        primaryImage: '/images/products/silver-coin-20g.png',
        gallery: [{ id: '1', type: 'image', url: '/images/products/silver-coin-20g.png', altText: "999 Pure Silver Coin 20g Dinanath & Sons Chandni Chowk" }],
        brand: "Dinanath & Sons",
        sku: "DNS-BL-S20",
        features: [
            "999 Fine Silver (99.9% Purity)",
            "Airtight acrylic capsule prevents environmental tarnishing",
            "Brilliant proof-like finish with frosted relief",
            "Available in bulk wholesale quantities for festive gifting"
        ],
        specifications: {
            "Metal": "Fine Silver",
            "Purity": "999.0 Fineness",
            "Weight": "20.000 Grams",
            "Diameter": "38 mm",
            "Packaging": "Acrylic Protective Capsule"
        },
        reviews: []
    }
];


export const getProductGallery = (product: any): ProductMedia[] => {
    if (product.gallery && product.gallery.length > 0) return product.gallery;
    return [{ id: 'default', type: 'image', url: product.image || product.primaryImage || '/placeholder.jpg' }];
};

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content?: string;
    date: string;
    category: string;
    author: string;
    readTime: string;
    image: string;
}

export const initialBlogPosts: BlogPost[] = [
    {
        id: 'essential-tools-2026',
        title: 'Top 10 Essential Jewellery Workshop Tools in 2026',
        excerpt: 'Discover the precision machinery, ultrasonic cleaners, and rolling mills every modern workshop needs.',
        content: `Building a modern jewellery manufacturing workshop requires reliable, precision-engineered equipment. From micro-welding torches to digital rolling mills, having the right tools ensures consistent quality and higher output.\n\n### 1. Rolling Mills for Precision Sheet & Wire\nRolling mills remain the core foundation of gold and silver sheet reduction. Precision hardened rollers maintain exact gauge tolerances.\n\n### 2. Automatic Gas Torches\nSafety and flame control are essential for soldering delicate filigree and heavy casting joints alike. Automatic piezo ignition torches streamline daily benchwork.\n\n### 3. High-Frequency Ultrasonic Cleaners\nRemoving polishing compound and oxidation requires powerful cavitation transducers operating at 40kHz.`,
        date: 'Aug 5, 2026',
        category: 'Guides & Engineering',
        author: 'Dinanath Editorial Team',
        readTime: '5 min read',
        image: '/blog-1.jpg'
    },
    {
        id: 'gold-casting-techniques',
        title: 'Mastering Gold & Silver Investment Casting',
        excerpt: 'A comprehensive guide to temperature control, vacuum burnout cycles, and defect-free casting.',
        content: `Investment casting is both an art and an exact science. Achieving zero-porosity gold and silver castings requires strict monitoring of flask temperatures, burnout ramp rates, and vacuum pressure.`,
        date: 'Jul 28, 2026',
        category: 'Casting & Metallurgy',
        author: 'Technical Metallurgy Dept',
        readTime: '7 min read',
        image: '/blog-2.jpg'
    },
    {
        id: 'maintenance-rolling-mills',
        title: 'Rolling Mill Maintenance & Calibration Guide',
        excerpt: 'How to lubricate gear trains, protect roller surfaces from pitting, and calibrate parallel gaps.',
        content: `Proper maintenance doubles the operational lifespan of heavy-duty rolling mills. Regular gear greasing and post-work rust prevention oiling are mandatory for smooth operations.`,
        date: 'Jul 15, 2026',
        category: 'Maintenance',
        author: 'Engineering Ops',
        readTime: '4 min read',
        image: '/blog-3.jpg'
    }
];
