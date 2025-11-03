import { createClient } from '@supabase/supabase-js';

// Load credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Optional: log to confirm they're loading correctly
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey);

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);


