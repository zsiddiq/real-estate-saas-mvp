// supabase/functions/search-properties/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import 'https://deno.land/x/dotenv@v3.2.2/load.ts'

// The Service Role Key allows the function to bypass Row Level Security (RLS).
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')

// Initialize the Supabase client using the secure Service Role Key
const supabase = createClient(
  SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY ?? ''
)

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('q') || ''
    const minConfidence = parseInt(url.searchParams.get('minConfidence') || '0')

    // Start building the query against the 'properties' table
    let supabaseQuery = supabase
      .from('properties')
      .select('apn, address_full, city, state, zip_code, total_score, confidence_score, bed_count, bath_count, square_footage, year_built')
      .order('total_score', { ascending: false }) // Order by the highest score first
      .limit(50) 

    // 1. Apply Confidence Score Filter
    if (minConfidence > 0) {
      // Use gte (greater than or equal to)
      supabaseQuery = supabaseQuery.gte('confidence_score', minConfidence)
    }

    // 2. Apply Text Search Filter (on address_full)
    if (query) {
      // Use ILIKE for case-insensitive partial match
      supabaseQuery = supabaseQuery.ilike('address_full', `%${query}%`)
    }

    // Execute the final query
    const { data, error } = await supabaseQuery
    
    if (error) {
      console.error('Supabase Query Error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ data }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Allow CORS access from the frontend
      },
      status: 200,
    })

  } catch (error) {
    console.error('Function execution error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})