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

        // AI Prompt for detailed description & SEO
        const promptText = `
You are an expert electrical engineer and senior e-commerce catalog copywriter for "Dinanath & Sons" (DNS), a premier Indian electrical, cable, and industrial hardware supplier.

TASK:
Inspect the product title and details provided below to generate a detailed, highly specific, technical, and accurate product description and SEO metadata.

PRODUCT DATA:
- Product Title: "${name}"
- Category: "${category}"
- Brand: "${brand || 'Dinanath & Sons Certified'}"
- Model Number: "${model_number || 'N/A'}"
- Retail Price: ₹${retail_price}
- Primary Image URL: "${image || (gallery[0]?.url || 'N/A')}"
- Existing Specifications: ${JSON.stringify(specifications)}

REQUIREMENTS:
1. DESCRIPTION:
   Write a comprehensive, professional, 3-to-4 paragraph product narrative.
   - Paragraph 1: Overview, engineering grade, core function, and manufacturing standards (e.g. 100% Electrolytic Copper, Flame Retardant FR-LSH, ISI certified, high conductivity, thermal resilience).
   - Paragraph 2: Technical specifications, voltage grade (e.g. 1100V), insulation, load compatibility, and efficiency.
   - Paragraph 3: Practical installation use-cases (e.g. domestic appliances like 1.5 Ton AC/geyser, commercial panel wiring, industrial motor feeds) and safety tips.
   - Add bulleted key features and highlights.
2. SEO METADATA:
   - "seo_title": Under 60 characters, high-intent title with main keywords and brand (e.g. "${name} | Dinanath & Sons").
   - "seo_description": 140-160 characters search preview snippet detailing specs, durability, and pan-India shipping notice.
   - "seo_keywords": 8-12 comma-separated keywords including product name, variations, category, and Delhi wholesale search terms.

OUTPUT FORMAT:
Return strictly valid JSON only (no markdown code blocks, no backticks):
{
  "description": "...",
  "seo_title": "...",
  "seo_description": "...",
  "seo_keywords": "..."
}
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
                            temperature: 0.3,
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

        // Highly specific intelligent fallback generator if API key is not set or request failed
        if (!generatedData) {
            const cleanName = name.trim();
            const brandName = brand || 'Dinanath & Sons Certified';
            const catName = category || 'Electrical & Hardware';

            // Technical details deduction from product name
            const isCable = /wire|cable|cord|lead/i.test(cleanName);
            const isSwitch = /switch|socket|plug|regulator/i.test(cleanName);
            const isMcb = /mcb|mccb|breaker|fuse|distribution/i.test(cleanName);
            const isLight = /light|led|panel|bulb|flood|tube/i.test(cleanName);

            let specificDetails = '';
            if (isCable) {
                specificDetails = `Engineered with 99.97% pure electrolytic grade multi-strand copper conductor conforming to IS 694 standards. Features premium Flame Retardant Lead-Free (FR-LF) PVC insulation offering extraordinary thermal stability up to 70°C and superior dielectric strength against high voltage surges. Highly flexible and designed for concealed conduit wiring in residential, commercial, and industrial installations.`;
            } else if (isSwitch) {
                specificDetails = `Manufactured from virgin flame-retardant polycarbonate with silver-cadmium contacts for zero sparking and ultra-smooth tactile operation. Tested for over 100,000 continuous switching cycles with captive silver-inlay screw terminals providing effortless cable termination.`;
            } else if (isMcb) {
                specificDetails = `High breaking capacity circuit breaker engineered with bi-metallic overload protection and magnetic short-circuit trip mechanism. Conforms to IEC 60898-1 standards with arc chute quenching chambers for instant fault clearance.`;
            } else if (isLight) {
                specificDetails = `Equipped with high-lumen SMD LED chips (100+ Lumens/Watt) integrated into a heavy-gauge die-cast aluminum heat sink. Features high power factor (>0.95) isolated surge-protected driver delivering flicker-free, energy-efficient illumination with a rated lifespan exceeding 30,000 burn hours.`;
            } else {
                specificDetails = `Precision-engineered hardware tool crafted from industrial-grade alloy steel with anti-corrosive protective coating. Designed for demanding continuous workshop duty and compliant with rigorous quality control benchmarks.`;
            }

            const fallbackDescription = `${cleanName} by ${brandName} is a professional-grade ${catName.toLowerCase()} solution built for superior durability, safety, and operational efficiency.\n\n${specificDetails}\n\nIdeal for electricians, residential architects, and industrial contractors requiring uncompromising reliability. Packaged with full quality inspection assurance and supported by Dinanath & Sons pan-India logistics and direct B2B warranty support.`;

            const fallbackSeoTitle = `${cleanName} | Buy Online at Dinanath & Sons`.slice(0, 60);
            const fallbackSeoDesc = `Buy authentic ${cleanName} by ${brandName} online at best prices. High-durability ${catName.toLowerCase()} with fast pan-India shipping from Dinanath & Sons.`.slice(0, 160);
            const fallbackKeywords = `${cleanName.toLowerCase()}, buy ${cleanName.toLowerCase()}, ${catName.toLowerCase()}, ${brandName.toLowerCase()}, electrical supplies delhi, dinanath and sons, wholesale prices, buy electrical hardware`;

            generatedData = {
                description: fallbackDescription,
                seo_title: fallbackSeoTitle,
                seo_description: fallbackSeoDesc,
                seo_keywords: fallbackKeywords
            };
        }

        return NextResponse.json({
            success: true,
            data: generatedData
        });
    } catch (err: any) {
        console.error('Error generating product content:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
