import 'dotenv/config';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const ATTOM_API_KEY = process.env.ATTOM_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function ingestProperty(address) {
  try {
    const { data } = await axios.get(
      'https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail',
      {
        headers: { apikey: ATTOM_API_KEY },
        params: { address }
      }
    );

    const p = data.property?.[0];
    if (!p) {
      console.error('❌ No property data returned from ATTOM');
      return;
    }

    const parsed = {
      address: p.address?.line1,
      city: p.address?.locality,
      state: p.address?.region,
      zip: p.address?.postalCode,
      bedrooms: p.building?.rooms?.bedrooms,
      bathrooms: p.building?.rooms?.bathrooms,
      square_feet: p.building?.size?.grossSize,
      year_built: p.building?.summary?.yearBuilt,
      last_updated: new Date().toISOString(),
      source: 'ATTOM',
      raw_json: data
    };

    const { error } = await supabase.from('properties').insert([parsed]);
    if (error) {
      console.error('Insert error:', error.message);
    } else {
      console.log('✅ Property inserted successfully');
    }
  } catch (err) {
    console.error('API error:', err.response?.data || err.message);
  }
}

// ✅ Correct usage: full address string
ingestProperty('100 Universal City Plaza, Universal City, CA 91608');


