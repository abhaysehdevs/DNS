
import { createClient } from '@supabase/supabase-js';

<<<<<<< Updated upstream
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Avoid throwing error during build if variables are missing
if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('Supabase environment variables are missing. Some features may not work.');
    }
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');
=======
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure these variables are set
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
>>>>>>> Stashed changes

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
