interface MathAuditResult {
  overallScore: number;
  peakSalesConsistency: number;
  cagrCalculation: number;
  revenueProjections: number;
  patientCalculations: number;
  pricingConsistency: number;
  marketShareLogic: number;
  issues: string[];
  corrections: string[];
  confidence: number;
}

interface MathValidationRule {
  name: string;
  description: string;
  validate: (data: any) => { isValid: boolean; score: number; issues: string[]; corrections: string[] };
}

export class EnhancedMathAuditor {
  private validationRules: MathValidationRule[];

  constructor() {
    this.validationRules = [
      {
        name: 'Peak Sales Consistency',
        description: 'Verify peak sales values are consistent across fields',
        validate: this.validatePeakSalesConsistency.bind(this)
      },
      {
        name: 'CAGR Calculation',
        description: 'Verify CAGR calculation using standard formula',
        validate: this.validateCAGRCalculation.bind(this)
      },
      {
        name: 'Revenue Projections',
        description: 'Check 10-year revenue projections for logical consistency',
        validate: this.validateRevenueProjections.bind(this)
      },
      {
        name: 'Patient Calculations',
        description: 'Verify patient population calculations',
        validate: this.validatePatientCalculations.bind(this)
      },
      {
        name: 'Pricing Consistency',
        description: 'Check pricing scenarios for logical consistency',
        validate: this.validatePricingConsistency.bind(this)
      },
      {
        name: 'Market Share Logic',
        description: 'Verify market share calculations and competitive positioning',
        validate: this.validateMarketShareLogic.bind(this)
      }
    ];
  }

  async auditMath(output: any): Promise<MathAuditResult> {
    console.log('🧮 Starting Enhanced Math Audit');
    
    const results = {
      overallScore: 0,
      peakSalesConsistency: 0,
      cagrCalculation: 0,
      revenueProjections: 0,
      patientCalculations: 0,
      pricingConsistency: 0,
      marketShareLogic: 0,
      issues: [] as string[],
      corrections: [] as string[],
      confidence: 0
    };

    let totalScore = 0;
    let validRules = 0;

    // Run each validation rule
    for (const rule of this.validationRules) {
      try {
        console.log(`  🔍 Validating: ${rule.name}`);
        const validation = rule.validate(output);
        
        if (validation.isValid) {
          validRules++;
          totalScore += validation.score;
          
          // Store individual scores
          switch (rule.name) {
            case 'Peak Sales Consistency':
              results.peakSalesConsistency = validation.score;
              break;
            case 'CAGR Calculation':
              results.cagrCalculation = validation.score;
              break;
            case 'Revenue Projections':
              results.revenueProjections = validation.score;
              break;
            case 'Patient Calculations':
              results.patientCalculations = validation.score;
              break;
            case 'Pricing Consistency':
              results.pricingConsistency = validation.score;
              break;
            case 'Market Share Logic':
              results.marketShareLogic = validation.score;
              break;
          }
        }
        
        // Collect issues and corrections
        results.issues.push(...validation.issues);
        results.corrections.push(...validation.corrections);
        
      } catch (error) {
        console.error(`  ❌ Error in ${rule.name}:`, error);
        results.issues.push(`Validation error in ${rule.name}: ${error}`);
      }
    }

    // Calculate overall score
    results.overallScore = validRules > 0 ? totalScore / validRules : 0;
    
    // Calculate confidence based on number of successful validations
    results.confidence = validRules / this.validationRules.length;

    console.log(`  📊 Math Audit Complete - Overall Score: ${results.overallScore.toFixed(3)}`);
    console.log(`  🎯 Confidence: ${(results.confidence * 100).toFixed(1)}%`);
    console.log(`  ⚠️  Issues Found: ${results.issues.length}`);
    console.log(`  🔧 Corrections Needed: ${results.corrections.length}`);

    return results;
  }

  private validatePeakSalesConsistency(data: any): { isValid: boolean; score: number; issues: string[]; corrections: string[] } {
    const issues: string[] = [];
    const corrections: string[] = [];
    
    const peakRevenue = this.extractNumericValue(data.peakRevenue2030);
    const marketSize = this.extractNumericValue(data.marketSize);
    const peakMarketShare = this.extractNumericValue(data.peakMarketShare2030);
    
    if (!peakRevenue || !marketSize || !peakMarketShare) {
      issues.push('Missing required values for peak sales consistency check');
      return { isValid: false, score: 0, issues, corrections };
    }

    // Check if peak revenue aligns with market size and market share
    const expectedPeakRevenue = marketSize * (peakMarketShare / 100);
    const revenueDifference = Math.abs(peakRevenue - expectedPeakRevenue);
    const revenueTolerance = expectedPeakRevenue * 0.1; // 10% tolerance
    
    let score = 1.0;
    
    if (revenueDifference > revenueTolerance) {
      const percentageDiff = (revenueDifference / expectedPeakRevenue) * 100;
      issues.push(`Peak revenue (${peakRevenue}B) differs significantly from expected value (${expectedPeakRevenue.toFixed(2)}B) based on market size and share`);
      corrections.push(`Adjust peak revenue to ${expectedPeakRevenue.toFixed(2)}B or revise market share to ${((peakRevenue / marketSize) * 100).toFixed(1)}%`);
      score = Math.max(0.3, 1.0 - (percentageDiff / 100));
    }

    return { isValid: true, score, issues, corrections };
  }

  private validateCAGRCalculation(data: any): { isValid: boolean; score: number; issues: string[]; corrections: string[] } {
    const issues: string[] = [];
    const corrections: string[] = [];
    
    const cagr = this.extractNumericValue(data.cagr);
    const peakRevenue = this.extractNumericValue(data.peakRevenue2030);
    const marketSize = this.extractNumericValue(data.marketSize);
    
    if (!cagr || !peakRevenue || !marketSize) {
      issues.push('Missing required values for CAGR calculation validation');
      return { isValid: false, score: 0, issues, corrections };
    }

    // Calculate expected CAGR using standard formula: CAGR = (Peak Revenue / Current Market Size)^(1/years) - 1
    const currentYear = new Date().getFullYear();
    const yearsToPeak = 2030 - currentYear;
    
    if (yearsToPeak <= 0) {
      issues.push('Invalid years to peak calculation');
      return { isValid: false, score: 0, issues, corrections };
    }

    const expectedCAGR = Math.pow(peakRevenue / marketSize, 1 / yearsToPeak) - 1;
    const cagrDifference = Math.abs(cagr - expectedCAGR);
    const cagrTolerance = expectedCAGR * 0.15; // 15% tolerance
    
    let score = 1.0;
    
    if (cagrDifference > cagrTolerance) {
      const percentageDiff = (cagrDifference / expectedCAGR) * 100;
      issues.push(`CAGR (${(cagr * 100).toFixed(1)}%) differs significantly from calculated value (${(expectedCAGR * 100).toFixed(1)}%)`);
      corrections.push(`Adjust CAGR to ${(expectedCAGR * 100).toFixed(1)}% or verify peak revenue and market size values`);
      score = Math.max(0.3, 1.0 - (percentageDiff / 100));
    }

    return { isValid: true, score, issues, corrections };
  }

  private validateRevenueProjections(data: any): { isValid: boolean; score: number; issues: string[]; corrections: string[] } {
    const issues: string[] = [];
    const corrections: string[] = [];
    
    const total10YearRevenue = this.extractNumericValue(data.total10YearRevenue);
    const peakRevenue = this.extractNumericValue(data.peakRevenue2030);
    
    if (!total10YearRevenue || !peakRevenue) {
      issues.push('Missing required values for revenue projection validation');
      return { isValid: false, score: 0, issues, corrections };
    }

    // Check if total 10-year revenue is reasonable relative to peak revenue
    // Industry standard: total 10-year revenue should be 5-8x peak revenue
    const revenueRatio = total10YearRevenue / peakRevenue;
    
    let score = 1.0;
    
    if (revenueRatio < 4) {
      issues.push(`Total 10-year revenue (${total10YearRevenue}B) is too low relative to peak revenue (${peakRevenue}B)`);
      corrections.push(`Increase total 10-year revenue to at least ${(peakRevenue * 5).toFixed(1)}B`);
      score = 0.4;
    } else if (revenueRatio > 10) {
      issues.push(`Total 10-year revenue (${total10YearRevenue}B) is unrealistically high relative to peak revenue (${peakRevenue}B)`);
      corrections.push(`Reduce total 10-year revenue to maximum ${(peakRevenue * 8).toFixed(1)}B`);
      score = 0.6;
    } else if (revenueRatio >= 5 && revenueRatio <= 8) {
      score = 1.0; // Optimal range
    } else {
      score = 0.8; // Acceptable but not optimal
    }

    return { isValid: true, score, issues, corrections };
  }

  private validatePatientCalculations(data: any): { isValid: boolean; score: number; issues: string[]; corrections: string[] } {
    const issues: string[] = [];
    const corrections: string[] = [];
    
    const peakPatients = this.extractNumericValue(data.peakPatients2030);
    const peakRevenue = this.extractNumericValue(data.peakRevenue2030);
    const avgSellingPrice = this.extractNumericValue(data.avgSellingPrice);
    const persistenceRate = this.extractNumericValue(data.persistenceRate);
    
    if (!peakPatients || !peakRevenue || !avgSellingPrice || !persistenceRate) {
      issues.push('Missing required values for patient calculation validation');
      return { isValid: false, score: 0, issues, corrections };
    }

    // Convert persistence rate from percentage to decimal
    const persistenceDecimal = persistenceRate / 100;
    
    // Calculate expected patients: (Peak Revenue / Avg Selling Price) / Persistence Rate
    const expectedPatients = (peakRevenue * 1000000000) / (avgSellingPrice * persistenceDecimal);
    const patientDifference = Math.abs(peakPatients - expectedPatients);
    const patientTolerance = expectedPatients * 0.2; // 20% tolerance
    
    let score = 1.0;
    
    if (patientDifference > patientTolerance) {
      const percentageDiff = (patientDifference / expectedPatients) * 100;
      issues.push(`Peak patients (${peakPatients.toLocaleString()}) differs significantly from calculated value (${expectedPatients.toLocaleString()})`);
      corrections.push(`Adjust peak patients to ${expectedPatients.toLocaleString()} or verify revenue, pricing, and persistence rate values`);
      score = Math.max(0.3, 1.0 - (percentageDiff / 100));
    }

    return { isValid: true, score, issues, corrections };
  }

  private validatePricingConsistency(data: any): { isValid: boolean; score: number; issues: string[]; corrections: string[] } {
    const issues: string[] = [];
    const corrections: string[] = [];
    
    const pricingScenarios = data.pricingScenarios;
    const competitorPricing = data.competitorPricing;
    
    if (!pricingScenarios || !Array.isArray(pricingScenarios)) {
      issues.push('Missing or invalid pricing scenarios');
      return { isValid: false, score: 0, issues, corrections };
    }

    let score = 1.0;
    
    // Check if pricing scenarios are logically ordered
    const baseCase = pricingScenarios.find(s => s.scenarioName === 'Base Case');
    const conservative = pricingScenarios.find(s => s.scenarioName === 'Conservative');
    const optimistic = pricingScenarios.find(s => s.scenarioName === 'Optimistic');
    
    if (baseCase && conservative && optimistic) {
      const basePrice = this.extractNumericValue(baseCase.usPrice);
      const conservativePrice = this.extractNumericValue(conservative.usPrice);
      const optimisticPrice = this.extractNumericValue(optimistic.usPrice);
      
      if (basePrice && conservativePrice && conservativePrice > basePrice) {
        issues.push('Conservative price is higher than base case price');
        corrections.push('Ensure conservative price is lower than base case price');
        score *= 0.7;
      }
      
      if (basePrice && optimisticPrice && optimisticPrice < basePrice) {
        issues.push('Optimistic price is lower than base case price');
        corrections.push('Ensure optimistic price is higher than base case price');
        score *= 0.7;
      }
    }

    // Check competitor pricing consistency
    if (competitorPricing && Array.isArray(competitorPricing)) {
      const competitorPrices = competitorPricing
        .map(c => this.extractNumericValue(c.annualPrice))
        .filter((p): p is number => p !== null && p > 0);
      
      if (competitorPrices.length > 0) {
        const avgCompetitorPrice = competitorPrices.reduce((sum, p) => sum + p, 0) / competitorPrices.length;
        
        if (baseCase) {
          const basePrice = this.extractNumericValue(baseCase.usPrice);
          if (basePrice && avgCompetitorPrice) {
            const priceDifference = Math.abs(basePrice - avgCompetitorPrice) / avgCompetitorPrice;
            
            if (priceDifference > 0.5) { // 50% difference threshold
              issues.push(`Base case price differs significantly from average competitor price`);
              corrections.push(`Review pricing strategy relative to competitor pricing`);
              score *= 0.8;
            }
          }
        }
      }
    }

    return { isValid: true, score, issues, corrections };
  }

  private validateMarketShareLogic(data: any): { isValid: boolean; score: number; issues: string[]; corrections: string[] } {
    const issues: string[] = [];
    const corrections: string[] = [];
    
    const peakMarketShare = this.extractNumericValue(data.peakMarketShare2030);
    const directCompetitors = data.directCompetitors;
    
    if (!peakMarketShare) {
      issues.push('Missing peak market share value');
      return { isValid: false, score: 0, issues, corrections };
    }

    let score = 1.0;
    
    // Check if market share is reasonable given number of competitors
    if (directCompetitors && Array.isArray(directCompetitors)) {
      const competitorCount = directCompetitors.length;
      
      // Rough heuristic: market share should be inversely proportional to competitor count
      const expectedMaxShare = Math.min(50, 100 / (competitorCount + 1));
      
      if (peakMarketShare > expectedMaxShare) {
        issues.push(`Peak market share (${peakMarketShare}%) seems high for ${competitorCount} competitors`);
        corrections.push(`Consider reducing peak market share to maximum ${expectedMaxShare.toFixed(1)}%`);
        score *= 0.7;
      }
    }
    
    // Check if market share exceeds 100%
    if (peakMarketShare > 100) {
      issues.push('Peak market share exceeds 100%');
      corrections.push('Reduce peak market share to maximum 100%');
      score *= 0.5;
    }

    return { isValid: true, score, issues, corrections };
  }

  private extractNumericValue(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Extract numeric value from strings like "1.2B", "15%", "$50K", etc.
      const numericMatch = value.match(/[\d,]+\.?\d*/);
      if (numericMatch) {
        let num = parseFloat(numericMatch[0].replace(/,/g, ''));
        
        // Handle multipliers
        if (value.includes('B') || value.includes('billion')) num *= 1000000000;
        else if (value.includes('M') || value.includes('million')) num *= 1000000;
        else if (value.includes('K') || value.includes('thousand')) num *= 1000;
        
        // Handle percentages
        if (value.includes('%')) num = num / 100;
        
        return num;
      }
    }
    return null;
  }

  getValidationRules(): MathValidationRule[] {
    return [...this.validationRules];
  }

  addValidationRule(rule: MathValidationRule): void {
    this.validationRules.push(rule);
  }
} 