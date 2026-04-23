
import { createClient } from '@/utils/supabase/client';

export const supabase = createClient();

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
