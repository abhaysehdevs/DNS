import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type } = body;

        const resendApiKey = process.env.RESEND_API_KEY;
        const supportEmail = 'info@daridhinaathandsons.com';

        let subject = '';
        let htmlContent = '';

        if (type === 'order') {
            const { orderId, customerName, customerEmail, customerPhone, shippingAddress, totalAmount, items, paymentMethod } = body;
            
            // Check if a specific high-value machine is ordered (e.g., Rolling Mill)
            const hasSpecialItem = items?.some((item: any) => 
                /mill|machine|furnace|heavy|industrial/i.test(item.product_name)
            );

            subject = `${hasSpecialItem ? '⚠️ [SPECIAL MACHINE ORDERED] ' : ''}New Order #${orderId} - ₹${totalAmount?.toLocaleString('en-IN')}`;

            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <div style="background-color: #151515; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: #A67C35; margin: 0; font-size: 24px; letter-spacing: 2px;">DINANATH & SONS</h1>
                        <p style="color: #8E8E9A; margin: 5px 0 0 0; font-size: 10px; text-transform: uppercase;">Order Processing Protocol</p>
                    </div>
                    
                    <div style="padding: 20px;">
                        <h2 style="color: #111; margin-top: 0;">New Order Placed</h2>
                        <p style="color: #555; font-size: 14px; line-height: 1.6;">
                            An order has been placed on the storefront. Details are below:
                        </p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr style="background-color: #f9f9f9;">
                                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-size: 12px; width: 30%;">Order ID</td>
                                <td style="padding: 10px; border: 1px solid #ddd; font-size: 14px; font-family: monospace;">#${orderId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-size: 12px;">Customer</td>
                                <td style="padding: 10px; border: 1px solid #ddd; font-size: 14px;">${customerName}</td>
                            </tr>
                            <tr style="background-color: #f9f9f9;">
                                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-size: 12px;">Contact</td>
                                <td style="padding: 10px; border: 1px solid #ddd; font-size: 14px;">${customerEmail} | ${customerPhone || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-size: 12px;">Shipping Address</td>
                                <td style="padding: 10px; border: 1px solid #ddd; font-size: 13px;">${shippingAddress}</td>
                            </tr>
                            <tr style="background-color: #f9f9f9;">
                                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-size: 12px;">Payment Method</td>
                                <td style="padding: 10px; border: 1px solid #ddd; font-size: 14px; text-transform: uppercase;">${paymentMethod}</td>
                            </tr>
                        </table>

                        <h3 style="color: #111; border-bottom: 2px solid #151515; padding-bottom: 5px;">Itemized Manifest</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #151515; color: #fff;">
                                    <th style="padding: 10px; text-align: left; font-size: 12px;">Product</th>
                                    <th style="padding: 10px; text-align: center; font-size: 12px; width: 15%;">Qty</th>
                                    <th style="padding: 10px; text-align: right; font-size: 12px; width: 25%;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items?.map((item: any) => `
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;">
                                            <strong>${item.product_name}</strong>
                                            ${item.variant_name ? `<br/><span style="color:#888;font-size:10px;">${item.variant_name}</span>` : ''}
                                        </td>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-size: 13px;">x${item.quantity}</td>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 13px; font-family: monospace;">₹${(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                                <tr style="background-color: #f9f9f9; font-weight: bold;">
                                    <td colspan="2" style="padding: 10px; text-align: right; font-size: 14px;">Total</td>
                                    <td style="padding: 10px; text-align: right; font-size: 16px; color: #A67C35; font-family: monospace;">₹${totalAmount?.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="https://dinanathandsons.com/admin/orders" style="background-color: #A67C35; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                                Access Admin Panel
                            </a>
                        </div>
                    </div>
                </div>
            `;
        } else if (type === 'contact') {
            const { contactName, contactEmail, category, message } = body;

            subject = `✉️ New Support Query: ${category} - From ${contactName}`;

            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <div style="background-color: #151515; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: #A67C35; margin: 0; font-size: 24px; letter-spacing: 2px;">DINANATH & SONS</h1>
                        <p style="color: #8E8E9A; margin: 5px 0 0 0; font-size: 10px; text-transform: uppercase;">Customer Support System</p>
                    </div>
                    
                    <div style="padding: 20px;">
                        <h2 style="color: #111; margin-top: 0;">New Support Query</h2>
                        <p style="color: #555; font-size: 14px; line-height: 1.6;">
                            A user has submitted a query via the contact form:
                        </p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr style="background-color: #f9f9f9;">
                                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-size: 12px; width: 30%;">Name</td>
                                <td style="padding: 10px; border: 1px solid #ddd; font-size: 14px;">${contactName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-size: 12px;">Email</td>
                                <td style="padding: 10px; border: 1px solid #ddd; font-size: 14px; font-family: monospace;">${contactEmail}</td>
                            </tr>
                            <tr style="background-color: #f9f9f9;">
                                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-size: 12px;">Category</td>
                                <td style="padding: 10px; border: 1px solid #ddd; font-size: 14px; text-transform: uppercase;">${category}</td>
                            </tr>
                        </table>

                        <h3 style="color: #111; border-bottom: 2px solid #151515; padding-bottom: 5px;">Message Text</h3>
                        <div style="background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #333; font-style: italic;">
                            "${message}"
                        </div>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="mailto:${contactEmail}" style="background-color: #A67C35; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                                Direct Email Reply
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        if (resendApiKey) {
            // Trigger actual Resend API email transmission
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendApiKey}`
                },
                body: JSON.stringify({
                    from: 'Dinanath & Sons <onboarding@resend.dev>',
                    to: supportEmail,
                    subject: subject,
                    html: htmlContent
                })
            });

            const responseData = await response.json();
            if (!response.ok) {
                console.error('Resend API failed:', responseData);
                return NextResponse.json({ error: 'Resend API failed to transmit email' }, { status: response.status });
            }

            return NextResponse.json({ success: true, message: 'Email sent successfully via Resend', id: responseData.id });
        } else {
            // In Sandbox / Dev mode without keys, log transaction diagnostics to terminal
            console.log('\n==================================================');
            console.log('[MAILER SANDBOX SIMULATION]');
            console.log(`To: ${supportEmail}`);
            console.log(`Subject: ${subject}`);
            console.log('HTML Body Layout Generated Successfully:');
            console.log(htmlContent.trim().substring(0, 500) + '...\n[Body Truncated]');
            console.log('==================================================\n');

            return NextResponse.json({ 
                success: true, 
                simulated: true, 
                message: 'SMTP Resend key not configured. Mock diagnostics logged successfully to server terminal.' 
            });
        }

    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
