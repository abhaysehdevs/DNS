export interface DeliveryOption {
    type: 'instant' | 'standard' | 'invalid';
    label: string;
    provider: string;
    estimatedTime: string;
    shippingCost: number;
    message?: string;
}

export function getDeliveryOptions(pincode: string): DeliveryOption {
    const code = parseInt(pincode);

    // Basic Indian pincode validation
    if (isNaN(code) || pincode.length !== 6 || code < 110000 || code > 999999) {
        return { type: 'invalid', label: 'Invalid Pincode', provider: '', estimatedTime: '', shippingCost: 0, message: 'Invalid Pincode' };
    }

    const firstDigit = pincode.charAt(0);
    const firstTwo = pincode.substring(0, 2);

    // 1. Delhi NCR (Starts with 110)
    if (firstTwo === '11') {
        return {
            type: 'instant',
            label: 'Delhi NCR Express',
            provider: 'Blinkit-style Local Express',
            estimatedTime: '2-4 Hours',
            shippingCost: 99
        };
    }

    // 2. Northern Region (Starts with 1 or 2 - Haryana, Punjab, UP, etc.)
    if (firstDigit === '1' || firstDigit === '2') {
        return {
            type: 'standard',
            label: 'North India Shipping',
            provider: 'BlueDart Express',
            estimatedTime: '1-2 Days',
            shippingCost: 50
        };
    }

    // 3. Western Region (Starts with 3 or 4 - Gujarat, Maharashtra, Rajasthan, MP)
    if (firstDigit === '3' || firstDigit === '4') {
        return {
            type: 'standard',
            label: 'West India Shipping',
            provider: 'Delhivery B2B/B2C',
            estimatedTime: '2-3 Days',
            shippingCost: 80
        };
    }

    // 4. Southern & Eastern Region (Starts with 5, 6, 8 - Karnataka, TN, AP, Bihar, etc.)
    if (firstDigit === '5' || firstDigit === '6' || firstDigit === '8') {
        return {
            type: 'standard',
            label: 'South & East India Shipping',
            provider: 'Xpressbees Courier',
            estimatedTime: '3-4 Days',
            shippingCost: 110
        };
    }

    // 5. Remote / North Eastern Region (Starts with 7)
    if (firstDigit === '7') {
        return {
            type: 'standard',
            label: 'East & NE India Shipping',
            provider: 'DTDC Courier',
            estimatedTime: '4-6 Days',
            shippingCost: 150
        };
    }

    // Default Fallback
    return {
        type: 'standard',
        label: 'Standard National Shipping',
        provider: 'Speed Post Courier',
        estimatedTime: '3-5 Days',
        shippingCost: 75
    };
}
