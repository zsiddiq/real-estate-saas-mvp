import { createClient } from '@supabase/supabase-js';
import { scoreProperty } from './scoring.js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function fetchPropertiesAndScore() {
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('*');

  if (propError) {
    console.error('❌ Error fetching properties:', propError);
    return;
  }

  const { data: rules, error: ruleError } = await supabase
    .from('scoring_rules')
    .select('*');

  if (ruleError) {
    console.error('❌ Error fetching scoring rules:', ruleError);
    return;
  }

  for (const property of properties) {
    const result = scoreProperty(property, rules);

    console.log(`🏠 Property ID ${property.id} → Score: ${result.score}`);
    console.log('Reasons:', result.reasons);

    const { error: updateError } = await supabase
      .from('properties')
      .update({
        confidence_score: result.score,
        score_reasons: result.reasons
      })
      .eq('id', property.id);

    if (updateError) {
      console.error(`❌ Failed to update property ${property.id}:`, updateError);
    } else {
      console.log(`✅ Updated property ${property.id} with score ${result.score}`);
    }
  }
}



fetchPropertiesAndScore();

