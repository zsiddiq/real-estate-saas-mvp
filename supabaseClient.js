// supabaseClient.js (Updated to use ES Modules)

import dotenv from 'dotenv';
dotenv.config(); 
    
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be set in the .env file");
}

// Initialize the Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Export the client using the ES Module default export
export default supabase;