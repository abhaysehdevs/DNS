
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure these variables are set
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Data structure
// Table: products
// Columns:
// - id (uuid, primary key)
// - name (text)
// - description (text)
// - retail_price (numeric)
// - wholesale_price (numeric)
// - wholesale_moq (integer)
// - image_url (text)
// - category (text)
// - in_stock (boolean)
// - reviews (jsonb)
