// scoring.js

export function scoreProperty(property, rules) {
  let score = 0;
  let reasons = [];

  for (const rule of rules) {
    switch (rule.factor) {
      case 'recency':
        if (property.lastUpdatedDays < 7) {
          score += rule.points;
          reasons.push(`${rule.points > 0 ? '+' : ''}${rule.points} for ${rule.notes}`);
        }
        break;

      case 'source':
        if (property.source === rule.condition) {
          score += rule.points;
          reasons.push(`${rule.points > 0 ? '+' : ''}${rule.points} for ${rule.notes}`);
        }
        break;

      case 'completeness':
        if (rule.condition === 'missing_sqft' && !property.squareFootage) {
          score += rule.points;
          reasons.push(`${rule.points > 0 ? '+' : ''}${rule.points} for ${rule.notes}`);
        }
        break;

      case 'zoning':
        if (rule.condition === 'includes_ADU' && property.zoning?.includes('ADU')) {
          score += rule.points;
          reasons.push(`${rule.points > 0 ? '+' : ''}${rule.points} for ${rule.notes}`);
        }
        break;

      default:
        break;
    }
  }

  return {
    score: Math.max(0, Math.min(score, 100)),
    reasons
  };
}

// Optional: keep your corridor scoring function too
export function scoreCorridor(corridorId, densityFactor) {
  const weight = 10;
  const score = densityFactor * weight;
  return {
    corridorId,
    densityFactor,
    score
  };
}
