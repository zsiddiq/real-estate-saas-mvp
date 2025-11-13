// scoring/scoreParcel.js

export function scoreParcel(parcel, options = { view: 'investor' }) {
  const weights = {
    distress: {
      foreclosure: 20,
      equityGap: 15,
    },
    infrastructure: {
      pavedRoad: 15,
      citySewage: 10,
      municipalWater: 10,
    },
    zoning: {
      targetZoning: 10,
      misalignedZoning: -10,
    },
    features: {
      flatSlope: 10,
      steepSlope: -10,
      goodAccess: 10,
    },
    proximity: {
      nearAnchor: 10,
      inCorridor: 5,
    },
    market: {
      rentGrowth: 10,
      highVacancy: -10,
    },
  };

  let score = 0;

  if (parcel.foreclosureStatus === 'active') score += weights.distress.foreclosure;
  if (parcel.equityPercent < 20) score += weights.distress.equityGap;

  if (parcel.pavedRoad) score += weights.infrastructure.pavedRoad;
  if (parcel.citySewage) score += weights.infrastructure.citySewage;
  if (parcel.municipalWater) score += weights.infrastructure.municipalWater;

  if (parcel.zoning === 'target') score += weights.zoning.targetZoning;
  else score += weights.zoning.misalignedZoning;

  if (parcel.slope === 'flat') score += weights.features.flatSlope;
  if (parcel.slope === 'steep') score += weights.features.steepSlope;
  if (parcel.access === 'good') score += weights.features.goodAccess;

  if (parcel.distanceToAnchor < 1) score += weights.proximity.nearAnchor;
  if (parcel.inModernizationCorridor) score += weights.proximity.inCorridor;

  if (parcel.rentGrowth > 5) score += weights.market.rentGrowth;
  if (parcel.vacancyRate > 10) score += weights.market.highVacancy;

  if (options.view === 'city') {
    score += parcel.inModernizationCorridor ? 5 : 0;
    score -= parcel.misalignedZoning ? 5 : 0;
  }

  return Math.max(0, Math.min(score, 100));
}

