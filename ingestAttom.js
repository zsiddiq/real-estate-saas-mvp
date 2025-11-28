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
      console.error('❌ No property data returned from ATTOM for this address.');
      return;
    }
    
    // ⭐ CHANGE 1: Extract the unique property identifier (APN)
    const uniqueApn = p.identifier?.apn;
    if (!uniqueApn) {
        console.error(`❌ ATTOM response is missing a unique APN for address: ${address}. Skipping.`);
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
      distanceToAnchor: 0.8, // 🔧 Placeholder
      inModernizationCorridor: true, // 🔧 Placeholder
      rentGrowth: 6, // 🔧 Placeholder
      vacancyRate: 8, // 🔧 Placeholder
    };

    const score = scoreParcel(parcel, { view: 'investor' });
    
    // Safety check
    if (!score || typeof score.totalScore !== 'number') {
        console.error('❌ Scoring failed or returned invalid result object. Skipping database update.');
        return;
    }
    
    console.log(`📊 Scored ${p.address?.line1}, ${p.address?.locality}: ${score.totalScore}`);

    // ⭐ Align fields to the lean 'properties' table schema
    const parsed = {
        apn: uniqueApn, // Primary Key for upsert/freshness
        address_full: p.address?.line1,
        city: p.address?.locality,
        state: p.address?.region,
        zip_code: p.address?.postalCode, // Changed to match schema: zip_code
        bed_count: p.building?.rooms?.bedrooms, // Changed to match schema: bed_count
        bath_count: p.building?.rooms?.bathrooms, // Changed to match schema: bath_count
        square_footage: p.building?.size?.grossSize, // Changed to match schema: square_footage
        year_built: p.building?.summary?.yearBuilt,
        zoning_code: p.zoning?.zoning, // Added from 'parcel' logic to schema
        
        // ✅ Re-enable score mapping
        freshness_score: score.freshnessScore, 
        confidence_score: score.confidenceScore,
        
        source: 'ATTOM', // Fix from previous step
        ingested_at: new Date().toISOString(),
        raw_json: data
    };

    // ⭐ Use upsert for Freshness Tracking
    const { error } = await supabase.from('properties').upsert([parsed], { onConflict: 'apn' });
    if (error) {
      console.error('Insert/Update error:', error.message);
    } else {
      console.log(`✅ Property ${uniqueApn} inserted/updated successfully`);
    }
  } catch (err) {
    console.error('API error:', err.response?.data || err.message);
  }
}

// ✅ Run with a real address
ingestProperty('100 Universal City Plaza, Universal City, CA 91608');