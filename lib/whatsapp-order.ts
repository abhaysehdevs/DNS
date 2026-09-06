import { getProductUrl } from './slug';

export const WHATSAPP_PHONE = '919953435647';
export const WHATSAPP_DISPLAY_PHONE = '+91 9953435647';

export interface WhatsAppOrderItem {
    productId: string;
    productName: string;
    variantName?: string;
    quantity: number;
    price: number;
    productSlug?: string;
    image?: string;
}

export interface WhatsAppOrderData {
    orderId: string;
    date?: string;
    mode: 'retail' | 'wholesale';
    customer: {
        name: string;
        phone: string;
        email: string;
        address: string;
        pincode: string;
        notes?: string;
    };
    items: WhatsAppOrderItem[];
    subtotal: number;
    shippingCost: number;
    discountAmount: number;
    couponCode?: string;
    totalAmount: number;
}

export const SITE_URL = 'https://dinanathandsons.com';

export function generateWhatsAppOrderMessage(order: WhatsAppOrderData): string {
    const orderDate = order.date || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const isRetail = order.mode === 'retail';

    let msg = `🛍️ *NEW ORDER - DINANATH & SONS*\n`;
    msg += `═════════════════════════════\n`;
    msg += `📋 *Order ID:* ${order.orderId}\n`;
    msg += `📅 *Date:* ${orderDate}\n`;
    msg += `🏷️ *Order Type:* ${isRetail ? 'Retail Order' : 'B2B Wholesale Inquiry'}\n\n`;

    msg += `👤 *CUSTOMER DETAILS:*\n`;
    msg += `• *Name:* ${order.customer.name}\n`;
    msg += `• *Phone:* ${order.customer.phone}\n`;
    if (order.customer.email) {
        msg += `• *Email:* ${order.customer.email}\n`;
    }
    msg += `• *Address:* ${order.customer.address}\n`;
    msg += `• *PIN Code:* ${order.customer.pincode}\n`;
    if (order.customer.notes) {
        msg += `• *Note:* ${order.customer.notes}\n`;
    }

    msg += `\n📦 *ORDERED ITEMS (${order.items.length}):*\n`;
    msg += `─────────────────────────────\n`;

    order.items.forEach((item, index) => {
        const itemNumber = index + 1;
        const itemTotal = item.price * item.quantity;
        const productUrl = `${SITE_URL}${getProductUrl({ id: item.productId, name: item.productName, slug: item.productSlug })}`;

        msg += `${itemNumber}. *${item.productName}*\n`;
        if (item.variantName) {
            msg += `   • *Variant:* ${item.variantName}\n`;
        }
        msg += `   • *Quantity:* ${item.quantity} Units\n`;
        if (isRetail && item.price > 0) {
            msg += `   • *Rate:* ₹${item.price.toLocaleString('en-IN')} (Total: ₹${itemTotal.toLocaleString('en-IN')})\n`;
        } else {
            msg += `   • *Rate:* Wholesale Pricing Requested\n`;
        }
        msg += `   • *Product Link:* ${productUrl}\n\n`;
    });

    msg += `═════════════════════════════\n`;
    msg += `💰 *ORDER FINANCIAL SUMMARY:*\n`;
    if (isRetail) {
        msg += `• *Subtotal:* ₹${order.subtotal.toLocaleString('en-IN')}\n`;
        if (order.shippingCost > 0) {
            msg += `• *Estimated Delivery:* ₹${order.shippingCost.toLocaleString('en-IN')}\n`;
        } else {
            msg += `• *Delivery:* Included / Free Shipping\n`;
        }
        if (order.discountAmount > 0) {
            msg += `• *Discount Applied (${order.couponCode || 'Coupon'}):* -₹${order.discountAmount.toLocaleString('en-IN')}\n`;
        }
        msg += `• *TOTAL AMOUNT PAYABLE:* ₹${order.totalAmount.toLocaleString('en-IN')}\n`;
    } else {
        msg += `• *Status:* Wholesale Quantity Pricing & Transport Quote Requested\n`;
    }
    msg += `═════════════════════════════\n\n`;
    msg += `💬 _Please confirm my order availability, dispatch timeline, and invoice details._`;

    return msg;
}

export function getWhatsAppOrderUrl(order: WhatsAppOrderData): string {
    const message = generateWhatsAppOrderMessage(order);
    return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}
