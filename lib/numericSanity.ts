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
    const tolerance = parseInt(process.env.REVENUE_DIFF_TOLERANCE || '2');
    if (revenueDiff > tolerance) {
      console.warn(`Revenue magnitude difference exceeds tolerance: ${revenueDiff} > ${tolerance}`, {
        peakRevenue: raw.peakRevenue2030,
        currentMarket: raw.currentMarket
      });
      // Log warning instead of blocking by default
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

  // Enhanced validation for new nested fields
  if (raw.financialForecast?.totalTenYearRevenueUSD?.value && raw.peakRevenue2030) {
    if (raw.financialForecast.totalTenYearRevenueUSD.value < raw.peakRevenue2030) {
      errs.push('10-year revenue is lower than peak revenue');
    }
  }

  if (raw.dealActivity && Array.isArray(raw.dealActivity)) {
    const lowPriceDeals = raw.dealActivity.filter((d: any) => d.priceUSD < 1_000_000);
    if (lowPriceDeals.length > 0) {
      errs.push(`Deal price below realistic threshold (< $1M): ${lowPriceDeals.map((d: any) => d.asset).join(', ')}`);
    }
  }

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