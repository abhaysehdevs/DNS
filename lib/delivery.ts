
const DELHI_PINCODES = [110006, 110001, 110002, 110003, 110004, 110005, 110007, 110008, 110009, 110010];
// In a real app, this would be a comprehensive list or an API call.

export function getDeliveryOptions(pincode: string) {
    const code = parseInt(pincode);

    // Basic validation
    if (isNaN(code) || pincode.length !== 6) {
        return { type: 'invalid', message: 'Invalid Pincode' };
    }

    // Check if it's a Delhi pincode (Mock logic: just checking against the list or range for demo)
    // Expanding the range for demo purposes (110000 - 110099)
    const isDelhi = (code >= 110001 && code <= 110099) || DELHI_PINCODES.includes(code);

    if (isDelhi) {
        return {
            type: 'instant',
            label: 'Instant Delivery',
            provider: 'Blinkit-style',
            estimatedTime: '30-60 mins',
        };
    }

    return {
        type: 'standard',
        label: 'Standard Shipping',
        provider: 'Courier',
        estimatedTime: '3-5 Days',
    };
}
