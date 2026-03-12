// Follow this setup guide to deploy this function to Supabase:
// https://supabase.com/docs/guides/functions/deploy

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

// Deno Environment Variables (Set these in Supabase Dashboard > Edge Functions > Secrets)
// SHIPROCKET_EMAIL
// SHIPROCKET_PASSWORD

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Authenticate Request
        const supabaseClient = createClient(
            // Supabase API URL - env var automatically available
            Deno.env.get('SUPABASE_URL') ?? '',
            // Supabase Anon Key - env var automatically available
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            // Create client with Auth context of the user that called the function
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Get the user from the token
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('Unauthorized')
        }

        // 2. Parse Request Body
        const { order_id } = await req.json()
        if (!order_id) throw new Error('Order ID is required')

        // 3. Login to Shiprocket to get Token (Ideally cache this token, but simplistic for now)
        const email = Deno.env.get('SHIPROCKET_EMAIL')
        const password = Deno.env.get('SHIPROCKET_PASSWORD')

        const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        const authData = await authRes.json()
        if (!authData.token) throw new Error('Shiprocket Auth Failed: ' + JSON.stringify(authData))
        const token = authData.token

        // 4. Fetch Order Details from Supabase
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .select(`*, order_items (*)`)
            .eq('id', order_id)
            .single()

        if (orderError || !order) throw new Error('Order not found')

        // 5. Prepare Payload for Shiprocket
        const payload = {
            order_id: order.id,
            order_date: new Date(order.created_at).toISOString().split('T')[0] + " 10:00", // Format: YYYY-MM-DD HH:MM
            pickup_location: "Primary", // You must add this pickup location in Shiprocket Dashboard first!
            billing_customer_name: order.customer_name,
            billing_last_name: "",
            billing_address: order.shipping_address,
            billing_city: "Mumbai", // This needs to be parsed from address or stored separately!
            billing_pincode: "400001", // Needs to be parsed!
            billing_state: "Maharashtra",
            billing_country: "India",
            billing_email: order.customer_email || "customer@example.com",
            billing_phone: order.customer_phone || "9999999999",
            shipping_is_billing: true,
            order_items: order.order_items.map((item: any) => ({
                name: item.product_name,
                sku: item.product_id,
                units: item.quantity,
                selling_price: item.price,
                discount: "",
                tax: "",
                hsn: ""
            })),
            payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: order.total_amount,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
        };

        // 6. Create Order in Shiprocket
        const createRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })

        const createData = await createRes.json()

        // 7. Update Supabase with Shiprocket Details
        if (createData.order_id) {
            await supabaseClient.from('orders').update({
                shiprocket_order_id: createData.order_id,
                shiprocket_shipment_id: createData.shipment_id,
                awb_code: createData.awb_code,
                status: 'processing' // Auto update status
            }).eq('id', order_id)

            return new Response(JSON.stringify({ success: true, daa: createData }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        } else {
            throw new Error('Shiprocket Error: ' + JSON.stringify(createData))
        }

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
