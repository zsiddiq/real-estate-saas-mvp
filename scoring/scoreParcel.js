// scoring/scoreParcel.js - FINAL CORRECTED VERSION

export function scoreParcel(parcel, options = { view: 'investor' }) {
    // 🛑 ULTIMATE FIX: Create a guaranteed-safe object from the input.
    // If 'parcel' is undefined/null, the default will be an empty object, preventing the crash.
    const safeParcel = parcel || {};
    
    // 1. DEFINE WEIGHTS AND BUCKETS
    const weights = {
      // Base confidence score (based on data reliability/completeness)
      confidenceBase: 50, 
      // Weights for the 'Investment Suitability' Score
      suitability: {
        distress: { foreclosure: 20, equityGap: 15 },
        infrastructure: { pavedRoad: 15, citySewage: 10, municipalWater: 10 },
        features: { flatSlope: 10, steepSlope: -10, goodAccess: 10 },
        market: { rentGrowth: 10, highVacancy: -10 },
      },
      // Weights for Corridor/Niche Overlay Score (High Value, Low Data Completeness)
      overlay: {
        nearAnchor: 10,
        inCorridor: 5,
        targetZoning: 10,
        misalignedZoning: -10,
      }
    };

    let investmentScore = 0; 
    let confidenceDelta = 0;  

    // 2. CALCULATE INVESTMENT SUITABILITY SCORE
    // All subsequent uses of 'parcel' must now be 'safeParcel'
    if (safeParcel.foreclosureStatus === 'active') investmentScore += weights.suitability.distress.foreclosure;
    if (safeParcel.equityPercent < 20) investmentScore += weights.suitability.distress.equityGap;

    if (safeParcel.pavedRoad) investmentScore += weights.suitability.infrastructure.pavedRoad;
    if (safeParcel.citySewage) investmentScore += weights.suitability.infrastructure.citySewage;
    if (safeParcel.municipalWater) investmentScore += weights.suitability.infrastructure.municipalWater;

    if (safeParcel.slope === 'flat') investmentScore += weights.suitability.features.flatSlope;
    if (safeParcel.slope === 'steep') investmentScore += weights.suitability.features.steepSlope;
    if (safeParcel.access === 'good') investmentScore += weights.suitability.features.goodAccess;

    if (safeParcel.distanceToAnchor < 1) investmentScore += weights.overlay.nearAnchor;
    if (safeParcel.inModernizationCorridor) investmentScore += weights.overlay.inCorridor;

    // These lines were the crash point: now safely accessing properties on 'safeParcel'
    if ((safeParcel.rentGrowth ?? 0) > 5) investmentScore += weights.suitability.market.rentGrowth;
    if ((safeParcel.vacancyRate ?? 0) > 10) investmentScore += weights.suitability.market.highVacancy;
   
    if (safeParcel.zoning === 'target') investmentScore += weights.overlay.targetZoning;
    else investmentScore += weights.overlay.misalignedZoning;
   
    // 3. CALCULATE CONFIDENCE SCORE
    if (safeParcel.zoning && safeParcel.zoning !== 'unknown') {
        confidenceDelta += 20;
    } else {
        confidenceDelta -= 10;
    }
    
    let finalConfidenceScore = Math.max(0, Math.min(weights.confidenceBase + confidenceDelta, 100));


    // 4. RETURN THE REQUIRED OBJECT STRUCTURE
    return {
      totalScore: Math.max(0, Math.min(investmentScore, 100)),
      confidenceScore: finalConfidenceScore, 
      freshnessScore: 90, 
    };
}