export type TrackingStatus = 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

export interface ShiprocketOrder {
    shiprocket_order_id: string;
    awb_code: string;
    courier_name: string;
    status: TrackingStatus;
    estimated_delivery: string;
    bulk_freight_info?: string;
}

export function generateShiprocketDetails(pincode: string, isBulk: boolean): ShiprocketOrder {
    const today = new Date();
    let deliveryDays = isBulk ? 7 : 3;
    
    // Simulate some logic based on pincode
    if (pincode.startsWith('11')) {
        deliveryDays = isBulk ? 3 : 1; // Delhi/NCR is faster
    } else if (pincode.startsWith('40') || pincode.startsWith('56')) {
        deliveryDays = isBulk ? 5 : 2; // Metro cities
    }

    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + deliveryDays);

    return {
        shiprocket_order_id: 'SR' + Math.floor(Math.random() * 1000000000),
        awb_code: 'AWB' + Math.floor(Math.random() * 1000000000),
        courier_name: isBulk ? 'Delhivery Freight (B2B)' : 'BlueDart Express',
        status: 'PLACED',
        estimated_delivery: deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        bulk_freight_info: isBulk ? 'Heavy payload transport via ground freight. Palletized delivery.' : undefined
    };
}
