/**
 * Pure, deterministic functions for calculating derived metrics
 * These functions are safe to test in isolation and eliminate model hallucinations
 */

export function calcCAGR(
  peakRevenue2030: number,
  currentMarket: number,
  yearsToPeak: number
): number {
  if (currentMarket <= 0 || yearsToPeak <= 0) {
    throw new Error('Invalid inputs for CAGR calculation: currentMarket and yearsToPeak must be positive');
  }
  return Math.pow(peakRevenue2030 / currentMarket, 1 / yearsToPeak) - 1;
}

export function calcPeakPatients(
  peakRevenue2030: number,
  avgPrice: number,
  persistenceRate: number
): number {
  if (avgPrice <= 0) {
    throw new Error('Invalid input for peak patients calculation: avgPrice must be positive');
  }
  if (persistenceRate < 0 || persistenceRate > 1) {
    throw new Error('Invalid input for peak patients calculation: persistenceRate must be between 0 and 1');
  }
  return (peakRevenue2030 / avgPrice) * persistenceRate;
}

export function calcPipelineDensity(
  sameTargetAssets: number,
  totalAssets: number
): number {
  if (totalAssets <= 0) {
    throw new Error('Invalid input for pipeline density calculation: totalAssets must be positive');
  }
  if (sameTargetAssets < 0) {
    throw new Error('Invalid input for pipeline density calculation: sameTargetAssets cannot be negative');
  }
  return (sameTargetAssets / totalAssets) * 100;
}

export function calcStrategicFit(
  vectorA: number[],
  vectorB: number[]
): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length for similarity calculation');
  }
  if (vectorA.length === 0) {
    throw new Error('Vectors cannot be empty for similarity calculation');
  }

  // Calculate cosine similarity
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0; // Return 0 similarity for zero vectors
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0; // Zero-division guard
  }

  return dotProduct / denominator;
} 