import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function fetchProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*');

  if (error) {
    console.error('Error fetching properties:', error);
  } else {
    console.log('Fetched properties:', data);
  }
}

fetchProperties();
