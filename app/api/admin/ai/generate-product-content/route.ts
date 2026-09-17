import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-ai/ai-tools';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name,
            category = 'General',
            brand = '',
            model_number = '',
            retail_price = 0,
            image = '',
            gallery = [],
            specifications = {},
            mode = 'all' // 'description' | 'seo' | 'all'
        } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
        }

        // Check for Gemini API key in settings or env
        let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            try {
                const supabase = getAdminSupabase();
                const { data } = await supabase.from('site_settings').select('settings').eq('key', 'global').single();
                if (data?.settings?.geminiApiKey) {
                    apiKey = data.settings.geminiApiKey;
                }
            } catch (e) {}
        }

        // Strict Jewellery Manufacturing & Metallurgy System Prompt
        const promptText = `
You are a senior metallurgy specialist and expert e-commerce catalog copywriter for "Dinanath & Sons" (DNS), located in Chandni Chowk, Delhi, India. 
We are a wholesale manufacturer and supplier specializing in jewellery making tools, goldsmith workshop equipment, lost-wax casting supplies, precision hand tools, polishing machinery, assay instruments, and metallurgy equipment.

CRITICAL NEGATIVE CONSTRAINTS:
- DO NOT use any terminology related to electrical wiring, copper cables, conduit, household switches, MCBs, circuit breakers, domestic LED lighting, building electricals, or generic automotive hardware.
- DO NOT hallucinate incorrect material categories (e.g. NEVER label a graphite crucible, ceramic dish, or silicon rubber mold as "alloy steel" or "electrical hardware").
- Ground all facts strictly in jewellery crafting, goldsmithing, silversmithing, lost-wax casting, stone-setting, polishing, or metallurgy.

PRODUCT DATA:
- Product Title: "${name}"
- Category: "${category}"
- Brand: "${brand || 'Dinanath & Sons Certified'}"
- Model Number: "${model_number || 'N/A'}"
- Wholesale/Retail Price: ₹${retail_price}
- Primary Image URL: "${image || (gallery[0]?.url || 'N/A')}"
- Existing Specifications: ${JSON.stringify(specifications)}

OUTPUT REQUIREMENTS:
You MUST respond with a strictly valid, structured JSON object with the following isolated keys:
{
  "marketingDescription": "A professional 3-to-4 paragraph wholesale product description. Paragraph 1: Metallurgy overview, craftsmanship grade, and primary jewellery workshop function. Paragraph 2: Material composition, heat/wear resistance, precision tolerances, and operational durability. Paragraph 3: Workshop use cases (e.g. lost-wax casting, hand-forging, ring resizing, stone setting, high-lustre finishing). Include 4-5 bulleted highlights.",
  "metaTitle": "High-intent search title under 60 characters (e.g., 'Buy ${name} | Dinanath & Sons Delhi').",
  "metaDescription": "Search snippet between 140-160 characters describing tool durability, gold/silver workshop suitability, and pan-India wholesale dispatch.",
  "keywords": "8-12 comma-separated keywords covering jewellery making tools, goldsmith supplies, Delhi wholesale, and specific product synonyms.",
  "technicalSpecs": {
    "Material": "Accurate material (e.g. High-Density Isostatically Pressed Graphite, High-Carbon Tool Steel, Quartz Ceramic, etc.)",
    "Application": "Jewellery manufacturing, casting, or goldsmithing use-case",
    "Grade / Finish": "Precision workshop grade or surface treatment",
    "Compatibility": "Gold, Silver, Brass, Platinum, or workshop machinery compatibility"
  }
}

STRICT RULE FOR technicalSpecs:
- Do NOT include any SEO fields (such as 'slug', 'metaTitle', 'keywords', or 'metaDescription') inside the technicalSpecs object. Only include physical, operational, and material attributes.

Return ONLY the raw JSON object. Do not wrap in markdown backticks or commentary.
`;

        let generatedData: any = null;

        if (apiKey) {
            try {
                const parts: any[] = [{ text: promptText }];

                // Multimodal image inspection: examine image URL or base64 data
                const primaryImg = image || (gallery && gallery[0]?.url);
                if (primaryImg && typeof primaryImg === 'string') {
                    if (primaryImg.startsWith('data:image/')) {
                        const matches = primaryImg.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
                        if (matches) {
                            parts.push({
                                inlineData: {
                                    mimeType: matches[1],
                                    data: matches[2]
                                }
                            });
                        }
                    } else if (primaryImg.startsWith('http')) {
                        try {
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 4000);
                            const imgRes = await fetch(primaryImg, { signal: controller.signal });
                            clearTimeout(timeoutId);
                            if (imgRes.ok) {
                                const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
                                const buffer = await imgRes.arrayBuffer();
                                const base64Data = Buffer.from(buffer).toString('base64');
                                parts.push({
                                    inlineData: {
                                        mimeType: contentType,
                                        data: base64Data
                                    }
                                });
                            }
                        } catch (e) {
                            // Proceed if image download fails
                        }
                    }
                }

                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts }],
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 1500,
                            responseMimeType: 'application/json'
                        }
                    })
                });

                if (response.ok) {
                    const resJson = await response.json();
                    const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        try {
                            generatedData = JSON.parse(text);
                        } catch (e) {
                            const match = text.match(/\{[\s\S]*\}/);
                            if (match) generatedData = JSON.parse(match[0]);
                        }
                    }
                }
            } catch (err) {
                console.warn('Gemini description generation error:', err);
            }
        }

        // Domain-Accurate Jewellery Manufacturing Fallback Generator
        if (!generatedData) {
            const cleanName = name.trim();
            const brandName = brand || 'Dinanath & Sons Certified';
            const catName = category || 'Jewellery Tools';

            const isCrucible = /crucible|melting|dish|ingot|graphite|clay/i.test(cleanName);
            const isRollingMill = /rolling|mill|roller|wire.*draw|drawplate/i.test(cleanName);
            const isPolisher = /polish|tumbler|magnetic|rotary|ultrasonic|dialux|buff/i.test(cleanName);
            const isHandTool = /plier|tweezer|saw|blade|hammer|mandrel|dapping|punch/i.test(cleanName);
            const isCasting = /casting|flask|vacuum|vulcaniz|wax|injector|invest/i.test(cleanName);
            const isTester = /tester|karat|touchstone|caliper|gauge|microscope|loupe/i.test(cleanName);

            let material = 'High-Grade Jewellery Workshop Tooling Material';
            let specificDetails = '';
            let specsDict: Record<string, string> = {};

            if (isCrucible) {
                material = 'High-Purity Thermal Shock Resistant Fine-Grain Graphite';
                specificDetails = `Engineered for high-temperature metallurgical melting of precious metals including 24K/22K gold, fine silver, copper alloys, and brass. Manufactured from premium isostatically pressed high-density graphite with superior oxidation resistance and ultra-low porosity, preventing molten metal absorption and slag adhesion. Designed for continuous duty in induction, gas, or electric resistance furnaces up to 1800°C.`;
                specsDict = {
                    'Material': 'High-Density Fine-Grain Isostatic Graphite',
                    'Maximum Temperature': '1800°C (3272°F)',
                    'Precious Metal Compatibility': 'Gold, Fine Silver, Copper, Brass Alloys',
                    'Thermal Resistance': 'Rapid Thermal Shock Proof',
                    'Country of Origin': 'India (Dinanath & Sons Certified)'
                };
            } else if (isRollingMill) {
                material = 'Induction-Hardened High-Carbon Alloy Tool Steel (HRC 60-62)';
                specificDetails = `Heavy-duty reduction rolling mill precision engineered for sheet, wire, and pattern embossing in professional goldsmithing workshops. Features precision-ground, mirror-polished reduction rollers with high torque helical gear drive, delivering uniform metal thickness reduction without surface micro-cracking or grain distortion.`;
                specsDict = {
                    'Roller Material': 'High-Carbon Tool Steel (Induction Hardened)',
                    'Roller Hardness': '60-62 HRC',
                    'Gear Ratio': '4:1 High-Torque Mechanical Reduction',
                    'Application': 'Gold, Silver & Copper Sheet & Wire Ingot Reduction',
                    'Finish': 'Precision Mirror Ground Rolls'
                };
            } else if (isPolisher) {
                material = 'Industrial Grade Mechanical Finishing Chassis with Neodymium Magnetic Array';
                specificDetails = `High-efficiency jewellery polishing and surface deburring system designed for rapid cleaning of intricate filigree, kundan mounts, and cast jewellery. Utilizes high-energy vortex agitation to drive microscopic stainless steel pins into the finest recesses without rounding sharp stone seats or damaging prongs.`;
                specsDict = {
                    'Finishing Medium': 'Stainless Steel Micro-Pins & Finishing Compound',
                    'Application': 'Cast Jewellery Finishing, Kundan mounts, Filigree Deburring',
                    'Motor Type': 'Heavy-Duty Continuous Induction Motor',
                    'Safety Standard': 'Overload Thermal Cut-Off Protected'
                };
            } else if (isHandTool) {
                material = 'Drop-Forged Surgical-Grade Stainless Steel';
                specificDetails = `Ergonomically designed goldsmith hand tool with precision box-joint alignment and induction-hardened working jaws. Ensures zero play, non-marring contact on precious metal surfaces, and maximum tactile control during delicate stone setting, wire looping, and metal forming operations.`;
                specsDict = {
                    'Material': 'Drop-Forged Stainless Steel',
                    'Joint Construction': 'Precision Box-Joint with Dual Leaf Springs',
                    'Jaw Finish': 'Anti-Glare Satin Finish (Non-Marring)',
                    'Application': 'Stone Setting, Prong Bending & Bench Work'
                };
            } else if (isCasting) {
                material = 'Heat-Resistant Cast Metallurgy Alloy & Heavy-Duty Silicone';
                specificDetails = `Professional-grade lost-wax casting apparatus engineered for porosity-free jewellery production. Provides uniform thermal heat distribution and consistent pressure transfer, guaranteeing defect-free reproduction of micro-details in gold and silver castings.`;
                specsDict = {
                    'Application': 'Lost-Wax Investment Casting & Mold Making',
                    'Thermal Stability': 'High Thermal Cycling Resilience',
                    'Compatibility': 'Universal Investment Powder & Flask Sizes'
                };
            } else if (isTester) {
                material = 'Micro-Calibrated Metallurgical Analytical Grade Components';
                specificDetails = `High-precision metallurgical assay testing instrument designed for instant non-destructive verification of precious metal purity (karat verification) and physical gemstone dimensions. Ensures absolute commercial security for jewellery retailers, bullion traders, and pawnshops.`;
                specsDict = {
                    'Measurement Type': 'Precision Karat Assay / Dimensional Verification',
                    'Accuracy': 'High Precision Analytical Grade',
                    'Application': 'Hallmarking, Bullion Verification & Goldsmith QA'
                };
            } else {
                material = 'Precision Bench-Grade Jewellery Manufacturing Metallurgy Grade';
                specificDetails = `Manufactured to stringent Indian goldsmithing standards for demanding continuous workshop duty. Tested for dimensional fidelity, chemical resistance against pickling solutions and workshop fluxes, and long service life.`;
                specsDict = {
                    'Material': material,
                    'Application': 'Professional Goldsmith & Jewellery Workshop Bench Use',
                    'Durability': 'Heavy-Duty Commercial Workshop Grade'
                };
            }

            const fallbackDescription = `${cleanName} by ${brandName} is a professional-grade ${catName.toLowerCase()} engineered specifically for master goldsmiths, jewellery manufacturers, and metallurgical workshops.\n\n${specificDetails}\n\n• Engineered with premium ${material.toLowerCase()} for maximum longevity.\n• Rigorously calibrated for Indian hallmarking standards and fine jewellery production.\n• Designed for smooth, effortless operation at the goldsmith workbench.\n• Supported by Dinanath & Sons direct B2B wholesale warranty and express pan-India dispatch from Chandni Chowk, Delhi.`;

            const fallbackSeoTitle = `${cleanName} | Jewellery Making Tools | Dinanath & Sons`.slice(0, 60);
            const fallbackSeoDesc = `Buy authentic ${cleanName} by ${brandName} online at wholesale prices. Professional ${catName.toLowerCase()} for goldsmiths with fast pan-India delivery.`.slice(0, 160);
            const fallbackKeywords = `${cleanName.toLowerCase()}, jewellery making tools, goldsmith equipment delhi, dinanath and sons, wholesale jewellery tools chandni chowk, casting tools, ${catName.toLowerCase()}`;

            generatedData = {
                marketingDescription: fallbackDescription,
                metaTitle: fallbackSeoTitle,
                metaDescription: fallbackSeoDesc,
                keywords: fallbackKeywords,
                technicalSpecs: specsDict
            };
        }

        // Normalize response object to support both strict structured keys and legacy aliases
        const normalizedResponse = {
            marketingDescription: generatedData.marketingDescription || generatedData.description || '',
            metaTitle: generatedData.metaTitle || generatedData.seo_title || '',
            metaDescription: generatedData.metaDescription || generatedData.seo_description || '',
            keywords: generatedData.keywords || generatedData.seo_keywords || '',
            technicalSpecs: generatedData.technicalSpecs || generatedData.specifications || {},
            // Backward compatibility aliases
            description: generatedData.marketingDescription || generatedData.description || '',
            seo_title: generatedData.metaTitle || generatedData.seo_title || '',
            seo_description: generatedData.metaDescription || generatedData.seo_description || '',
            seo_keywords: generatedData.keywords || generatedData.seo_keywords || '',
            specifications: generatedData.technicalSpecs || generatedData.specifications || {}
        };

        return NextResponse.json({
            success: true,
            data: normalizedResponse
        });
    } catch (err: any) {
        console.error('Error generating product content:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
