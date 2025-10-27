// scoring.js
function scoreCorridor(corridorId, densityFactor) {
  // Placeholder logic: score = density * weight
  const weight = 10;
  const score = densityFactor * weight;
  return {
    corridorId,
    densityFactor,
    score
  };
}

// Example run
console.log(scoreCorridor('I-215', 7.5));
console.log(scoreCorridor('SR-74', 4.2));

module.exports = { scoreCorridor };
