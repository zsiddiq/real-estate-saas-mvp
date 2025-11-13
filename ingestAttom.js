import 'dotenv/config';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { scoreParcel } from './scoring/scoreParcel.js'; // ✅ Import scoring logic

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

    // 🧠 Map ATTOM payload to scoring schema
    const parcel = {
      foreclosureStatus: p.foreclosure?.status,
      equityPercent: p.mortgage?.equityPercent || 100,
      pavedRoad: p.site?.pavedRoad === 'Yes',
      citySewage: p.site?.sewerType === 'Municipal',
      municipalWater: p.site?.waterSource === 'Municipal',
      zoning: p.zoning?.zoning || 'unknown',
      slope: p.site?.topography === 'Level' ? 'flat' : 'steep',
      access: p.site?.accessType === 'Public Road' ? 'good' : 'poor',
      distanceToAnchor: 0.8, // 🔧 Placeholder — replace with real proximity logic
      inModernizationCorridor: true, // 🔧 Placeholder — replace with corridor overlay logic
      rentGrowth: 6, // 🔧 Placeholder — replace with market data
      vacancyRate: 8, // 🔧 Placeholder — replace with market data
    };

    const score = scoreParcel(parcel, { view: 'investor' });
    console.log(`📊 Scored ${address}: ${score}`);

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
      score,
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

// ✅ Run with a real address
ingestProperty('100 Universal City Plaza, Universal City, CA 91608');

