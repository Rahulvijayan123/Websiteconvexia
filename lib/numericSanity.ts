/**
 * Numeric sanity checks to validate model outputs
 * Blocks extreme or nonsensical values before they reach downstream components
 */

export function sanityCheck(raw: any): string[] {
  const errs: string[] = [];

  // Check percentage fields are in valid range
  const pctFields = ['pipelineDensity'];
  pctFields.forEach(f => {
    const v = raw[f as keyof typeof raw] as number;
    if (typeof v === 'number' && (v < 0 || v > 100)) {
      errs.push(`${f} out of 0–100 range: ${v}`);
    }
  });

  // Check revenue magnitude differences
  if (raw.peakRevenue2030 && raw.currentMarket) {
    const revenueDiff = Math.abs(Math.log10(raw.peakRevenue2030) - Math.log10(raw.currentMarket));
    if (revenueDiff > 2) {
      errs.push(`Peak revenue differs by >2 orders of magnitude from current market: ${raw.peakRevenue2030} vs ${raw.currentMarket}`);
    }
  }

  // Check for negative values where they shouldn't exist
  const positiveFields = ['currentMarket', 'peakRevenue2030', 'avgPrice', 'totalAssets'];
  positiveFields.forEach(f => {
    const v = raw[f as keyof typeof raw] as number;
    if (typeof v === 'number' && v < 0) {
      errs.push(`${f} cannot be negative: ${v}`);
    }
  });

  // Check for zero values where they shouldn't exist
  const nonZeroFields = ['currentMarket', 'avgPrice', 'totalAssets'];
  nonZeroFields.forEach(f => {
    const v = raw[f as keyof typeof raw] as number;
    if (typeof v === 'number' && v === 0) {
      errs.push(`${f} cannot be zero: ${v}`);
    }
  });

  // Check persistence rate is valid
  if (raw.persistenceRate !== undefined) {
    if (raw.persistenceRate < 0 || raw.persistenceRate > 1) {
      errs.push(`Persistence rate must be between 0 and 1: ${raw.persistenceRate}`);
    }
  }

  // Check years to peak is reasonable
  if (raw.yearsToPeak !== undefined) {
    if (raw.yearsToPeak <= 0 || raw.yearsToPeak > 20) {
      errs.push(`Years to peak must be between 0 and 20: ${raw.yearsToPeak}`);
    }
  }

  // Check vector lengths match
  if (raw.vectorA && raw.vectorB) {
    if (raw.vectorA.length !== raw.vectorB.length) {
      errs.push(`Vector lengths must match: ${raw.vectorA.length} vs ${raw.vectorB.length}`);
    }
    if (raw.vectorA.length === 0) {
      errs.push('Vectors cannot be empty');
    }
  }

  return errs;
} 