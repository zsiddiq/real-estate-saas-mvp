import { createClient } from '@supabase/supabase-js';

// Load credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Confirm environment variables are loaded
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials are missing. Check your .env file.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Optional: expose auth helpers for reuse
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
};



