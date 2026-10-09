/**
 * Policies - Single Source of Truth
 * Consistently used across Return Policy page, Shipping Policy page,
 * Terms of Service, FAQ, PDP trust boxes, checkout disclosures,
 * JSON-LD MerchantReturnPolicy & OfferShippingDetails, and Google Merchant Center.
 */

import { SITE_CONFIG } from './site-config';

export const RETURN_POLICY = {
    title: 'Return & Replacement Policy — 7-Day Guarantee',
    shortNotice: '7-Day return or exchange guarantee for transit damage, manufacturing defects, or wrong items. Inspect with unboxing video.',
    windowDays: 7,
    inspectionWindowHours: 72,
    refundDays: '5–7 business days',
    
    // Summary bullets shown on PDP and checkout
    highlights: [
        '7-Day return/replacement window for transit damage, manufacturing defects, or wrong items',
        'Report defect/damage within 48–72 hours with unboxing video clip',
        'Return shipping for verified defects is arranged or reimbursed by Dinanath & Sons',
        'Refunds credited to original payment method (Razorpay/UPI/Card/Bank) within 5–7 working days',
        'Non-returnable: Opened chemicals/fluxes, custom engraved items, and bullion'
    ],
    
    // Categories excluded from returns
    nonReturnableCategories: ['Bullion', 'Chemicals'],
    nonReturnableKeywords: ['acid', 'flux', 'suhaga', 'silver cleaner', 'torch gas', 'asbestos', 'bullion', 'gold bar', 'silver coin'],
    
    // Who pays shipping for defect vs buyer-remorse
    shippingFeeCoverage: {
        itemDefect: 'Store covers return shipping (reverse pickup or courier reimbursement)',
        changeOfMind: 'Returns for change of mind are not accepted due to industrial calibration standards',
    },
    
    // Schema.org mapping
    schemaOrg: {
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn', // Free for defective/damaged items
        merchantReturnLink: `${SITE_CONFIG.baseUrl}/return-policy`,
    }
} as const;

export const SHIPPING_POLICY = {
    title: 'Shipping & Delivery Policy',
    freeShippingThreshold: SITE_CONFIG.shipping.freeShippingThreshold,
    freeShippingLabel: 'Free Shipping on orders above ₹1,999',
    standardShippingRate: SITE_CONFIG.shipping.standardShippingRate,
    standardShippingCharge: SITE_CONFIG.shipping.standardShippingRate,
    
    dispatchTime: {
        standard: '24–48 hours (Mon–Sat)',
        heavyMachinery: '3–5 business days (after bench inspection & calibration)',
    },
    
    transitEstimates: [
        { zone: 'Delhi NCR', duration: '1–2 business days' },
        { zone: 'Metro Cities (Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Ahmedabad)', duration: '2–4 business days' },
        { zone: 'Rest of India (Tier 2 & 3 Cities)', duration: '4–7 business days' },
        { zone: 'Special / Remote Territories', duration: '7–10 business days' }
    ],
    
    coverage: 'Pan-India Delivery across 19,000+ PIN codes. We currently do not offer international shipping.',
    
    heavyMachineryRule: 'Heavy equipment exceeding 20 kg is crated in reinforced protective packaging and dispatched via specialized surface freight carriers (V-Trans, TCI Freight, Safexpress).',
    
    // Schema.org mapping
    schemaOrg: {
        shippingRate: {
            currency: 'INR',
            value: 0, // Above ₹1,999 or configured in Merchant Center
        },
        shippingDestination: {
            addressCountry: 'IN'
        },
        deliveryTime: {
            handlingTime: {
                minValue: 1,
                maxValue: 2,
                unitCode: 'd'
            },
            transitTime: {
                minValue: 2,
                maxValue: 7,
                unitCode: 'd'
            }
        }
    }
} as const;

export function isProductReturnable(product: { category?: string; name?: string; sku?: string }): boolean {
    if (!product) return false;
    const cat = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    
    if (RETURN_POLICY.nonReturnableCategories.some(c => c.toLowerCase() === cat)) {
        return false;
    }
    
    if (RETURN_POLICY.nonReturnableKeywords.some(k => name.includes(k))) {
        return false;
    }
    
    return true;
}
