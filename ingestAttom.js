require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const ATTOM_API_KEY = process.env.ATTOM_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ... rest of your code


async function ingestProperty(address) {
  try {
    const { data } = await axios.get('https://api.gateway.attomdata.com/property/v4/detail', {
      headers: { apikey: ATTOM_API_KEY },
      params: { address }
    });

    const p = data.property?.[0]; // ATTOM returns an array of properties

    const parsed = {
      address: p?.address?.line1,
      city: p?.address?.locality,
      state: p?.address?.region,
      zip: p?.address?.postalCode,
      bedrooms: p?.building?.rooms?.bedrooms,
      bathrooms: p?.building?.rooms?.bathrooms,
      square_feet: p?.building?.size?.grossSize,
      year_built: p?.building?.summary?.yearBuilt,
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
    console.error('API error:', err.message);
  }
}

ingestProperty('201 River Ridge Pkwy, Jeffersonville, IN');


