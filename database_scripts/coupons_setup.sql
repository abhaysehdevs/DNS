
-- Create Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL,
    min_order_amount NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC,
    expiry_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add discount fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- RLS Policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow public read access for validation
CREATE POLICY "Allow public read access for coupons" ON coupons
    FOR SELECT USING (active = true AND (expiry_date IS NULL OR expiry_date > NOW()));

-- Admin full access
CREATE POLICY "Allow admin full access for coupons" ON coupons
    FOR ALL USING (auth.role() = 'service_role');

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE coupons 
    SET usage_count = usage_count + 1 
    WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
