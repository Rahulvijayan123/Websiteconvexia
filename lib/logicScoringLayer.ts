import { fetchGPT4o } from './gpt4oClient';

export interface LogicValidationResult {
  overallLogicScore: number;
  criticalFailures: string[];
  logicIssues: string[];
  logicCorrections: string[];
  validatedFields: string[];
  confidenceLevel: number;
  requiresRegeneration: boolean;
  regenerationFields: string[];
  regenerationInstructions: string;
}

export interface MathConsistencyCheck {
  isValid: boolean;
  score: number;
  issues: string[];
  corrections: string[];
  formulas: string[];
}

export class LogicScoringLayer {
  private readonly criticalThreshold = 0.7;
  private readonly regenerationThreshold = 0.5;

  // Helper methods for extracting numeric values
  private extractNumericValue(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols, commas, and extract number
      const cleaned = value.replace(/[$,B]/g, '').trim();
      const match = cleaned.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : null;
    }
    return null;
  }

  private extractPercentageValue(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove % symbol and extract number
      const cleaned = value.replace(/%/g, '').trim();
      const match = cleaned.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : null;
    }
    return null;
  }

  async validateLogic(data: any, inputs: any): Promise<LogicValidationResult> {
    console.log('🧠 Starting Logic Scoring Layer Validation');
    
    const validationPromises = [
      this.validateMathematicalConsistency(data),
      this.validateBusinessLogic(data, inputs),
      this.validateCrossFieldConsistency(data),
      this.validatePRVEligibility(data),
      this.validateRevenueProjections(data),
      this.validatePatientCalculations(data)
    ];

    const results = await Promise.all(validationPromises);
    
    // Combine all validation results
    const combinedResult = this.combineValidationResults(results);
    
    // Determine if regeneration is needed
    const regenerationDecision = this.determineRegenerationNeeds(combinedResult, data);
    
    return {
      overallLogicScore: combinedResult.overallLogicScore || 0,
      criticalFailures: combinedResult.criticalFailures || [],
      logicIssues: combinedResult.logicIssues || [],
      logicCorrections: combinedResult.logicCorrections || [],
      validatedFields: combinedResult.validatedFields || [],
      confidenceLevel: combinedResult.confidenceLevel || 0,
      requiresRegeneration: regenerationDecision.requiresRegeneration,
      regenerationFields: regenerationDecision.regenerationFields,
      regenerationInstructions: regenerationDecision.regenerationInstructions
    };
  }

  private async validateMathematicalConsistency(data: any): Promise<MathConsistencyCheck> {
    const issues: string[] = [];
    const corrections: string[] = [];
    const formulas: string[] = [];
    let score = 1.0;

    try {
      // Extract numeric values with enhanced parsing
      const marketSize = this.extractNumericValue(data.marketSize);
      const cagr = this.extractPercentageValue(data.cagr);
      const peakRevenue = this.extractNumericValue(data.peakRevenue2030);
      const peakMarketShare = this.extractPercentageValue(data.peakMarketShare2030);
      const totalRevenue = this.extractNumericValue(data.total10YearRevenue);
      const avgSellingPrice = this.extractNumericValue(data.avgSellingPrice);
      const peakPatients = this.extractNumericValue(data.peakPatients2030);

      // AIRTIGHT VALIDATION 1: CAGR Calculation with Multiple Cross-Checks
      if (marketSize && cagr && peakRevenue) {
        const yearsToPeak = 6; // 2024 to 2030
        const expectedPeakRevenue = marketSize * Math.pow(1 + cagr / 100, yearsToPeak);
        const tolerance = 0.05; // 5% tolerance (tighter)

        if (Math.abs(peakRevenue - expectedPeakRevenue) > expectedPeakRevenue * tolerance) {
          issues.push(`CRITICAL: CAGR calculation error. With ${cagr}% CAGR from $${marketSize}B, expected peak revenue ~$${expectedPeakRevenue.toFixed(1)}B, but got $${peakRevenue}B`);
          corrections.push(`Peak revenue should be ~$${expectedPeakRevenue.toFixed(1)}B based on CAGR calculation`);
          score -= 0.4; // Higher penalty
        }

        // Additional CAGR validation: Check if CAGR is reasonable for the industry
        if (cagr < 5 || cagr > 25) {
          issues.push(`CRITICAL: Unrealistic CAGR of ${cagr}%. Typical oncology CAGR range: 5-25%`);
          corrections.push(`CAGR should be between 5-25% for oncology markets`);
          score -= 0.3;
        }
      }

      // AIRTIGHT VALIDATION 2: Market Share Consistency with Revenue Cross-Validation
      if (marketSize && peakRevenue && peakMarketShare) {
        const expectedPeakRevenue = marketSize * (peakMarketShare / 100);
        const tolerance = 0.03; // 3% tolerance (very tight)

        if (Math.abs(peakRevenue - expectedPeakRevenue) > expectedPeakRevenue * tolerance) {
          issues.push(`CRITICAL: Market share inconsistency. With ${peakMarketShare}% market share of $${marketSize}B market, expected peak revenue ~$${expectedPeakRevenue.toFixed(1)}B, but got $${peakRevenue}B`);
          corrections.push(`Peak revenue should be ~$${expectedPeakRevenue.toFixed(1)}B based on market share`);
          score -= 0.4;
        }

        // Additional market share validation: Check if market share is realistic
        if (peakMarketShare > 50) {
          issues.push(`CRITICAL: Unrealistic market share of ${peakMarketShare}%. Maximum realistic share: 50%`);
          corrections.push(`Market share should be ≤50% for competitive markets`);
          score -= 0.3;
        }
      }

      // AIRTIGHT VALIDATION 3: Total Revenue vs Peak Revenue with Industry Standards
      if (totalRevenue && peakRevenue) {
        const ratio = totalRevenue / peakRevenue;
        if (ratio < 5 || ratio > 8) {
          issues.push(`CRITICAL: Total revenue should be 5-8x peak revenue. Current ratio: ${ratio.toFixed(1)}x`);
          corrections.push(`Total revenue should be ~$${(peakRevenue * 6.5).toFixed(1)}B (6.5x peak revenue)`);
          score -= 0.3;
        }

        // Additional validation: Check if total revenue makes sense relative to market size
        if (marketSize && totalRevenue > marketSize * 10) {
          issues.push(`CRITICAL: Total revenue $${totalRevenue}B exceeds market size $${marketSize}B by >10x`);
          corrections.push(`Total revenue should be reasonable relative to market size`);
          score -= 0.3;
        }
      }

      // AIRTIGHT VALIDATION 4: Patient Calculations with Multiple Validation Layers
      if (peakRevenue && avgSellingPrice && peakPatients) {
        const expectedPatients = (peakRevenue * 1000000000) / avgSellingPrice;
        const tolerance = 0.05; // 5% tolerance (tighter)

        if (Math.abs(peakPatients - expectedPatients) > expectedPatients * tolerance) {
          issues.push(`CRITICAL: Patient calculation error. With $${peakRevenue}B revenue and $${avgSellingPrice} ASP, expected ~${expectedPatients.toLocaleString()} patients, but got ${peakPatients.toLocaleString()}`);
          corrections.push(`Peak patients should be ~${expectedPatients.toLocaleString()} based on revenue and ASP`);
          score -= 0.3;
        }

        // Additional patient validation: Check if ASP is realistic
        if (avgSellingPrice < 10000 || avgSellingPrice > 500000) {
          issues.push(`CRITICAL: Unrealistic ASP of $${avgSellingPrice.toLocaleString()}. Typical oncology ASP range: $10K-$500K`);
          corrections.push(`ASP should be between $10K-$500K for oncology drugs`);
          score -= 0.2;
        }
      }

      // AIRTIGHT VALIDATION 5: Cross-Field Mathematical Consistency
      if (marketSize && peakRevenue && totalRevenue && peakPatients && avgSellingPrice) {
        // Validate that all calculations are internally consistent
        const revenueFromPatients = (peakPatients * avgSellingPrice) / 1000000000;
        const tolerance = 0.1; // 10% tolerance for cross-field validation

        if (Math.abs(peakRevenue - revenueFromPatients) > peakRevenue * tolerance) {
          issues.push(`CRITICAL: Cross-field inconsistency. Revenue from patients (${revenueFromPatients.toFixed(1)}B) doesn't match peak revenue (${peakRevenue}B)`);
          corrections.push(`All calculations must be internally consistent`);
          score -= 0.4;
        }
      }

      // AIRTIGHT VALIDATION 6: Geographic Split Validation
      if (data.geographicSplit) {
        const usSplit = data.geographicSplit.US || 0;
        const exUsSplit = data.geographicSplit.exUS || 0;
        const total = usSplit + exUsSplit;

        if (Math.abs(total - 100) > 1) {
          issues.push(`CRITICAL: Geographic split doesn't equal 100%. US: ${usSplit}%, exUS: ${exUsSplit}%, Total: ${total}%`);
          corrections.push(`Geographic split must equal 100%`);
          score -= 0.2;
        }
      }

    } catch (error) {
      issues.push(`Error in mathematical validation: ${error}`);
      score = 0;
    }

    return {
      isValid: score > 0.8, // Higher threshold
      score: Math.max(0, score),
      issues,
      corrections,
      formulas: [
        'Peak Revenue = Market Size × (1 + CAGR)^years',
        'Peak Revenue = Market Size × Market Share %',
        'Total Revenue = 5-8 × Peak Revenue',
        'Peak Patients = Peak Revenue / Average Selling Price',
        'Revenue from Patients = Peak Patients × ASP / 1B',
        'Geographic Split = US% + exUS% = 100%'
      ]
    };
  }

  private async validateBusinessLogic(data: any, inputs: any): Promise<MathConsistencyCheck> {
    const issues: string[] = [];
    const corrections: string[] = [];
    const formulas: string[] = [];
    let score = 1.0;

    try {
      // Extract values for business logic validation
      const peakPatients = this.extractNumericValue(data.peakPatients2030);
      const prvEligibility = data.prvEligibility || '';
      const rareDiseaseEligibility = data.rareDiseaseEligibility;
      const avgSellingPrice = this.extractNumericValue(data.avgSellingPrice);
      const peakMarketShare = this.extractPercentageValue(data.peakMarketShare2030);
      const indication = inputs.indication || '';

      // AIRTIGHT BUSINESS LOGIC 1: PRV Eligibility Validation
      if (peakPatients !== null) {
        const isRareDisease = peakPatients < 200000;
        const shouldBeEligible = isRareDisease;
        const isCurrentlyEligible = prvEligibility.toLowerCase().includes('eligible') && !prvEligibility.toLowerCase().includes('not eligible');

        if (shouldBeEligible !== isCurrentlyEligible) {
          issues.push(`CRITICAL: PRV eligibility mismatch. With ${peakPatients.toLocaleString()} patients, PRV should be ${shouldBeEligible ? 'eligible' : 'not eligible'}, but got: ${prvEligibility}`);
          corrections.push(`PRV eligibility should be ${shouldBeEligible ? 'eligible' : 'not eligible'} for ${peakPatients.toLocaleString()} patients`);
          score -= 0.4;
        }

        // Validate rareDiseaseEligibility boolean
        if (typeof rareDiseaseEligibility === 'boolean' && rareDiseaseEligibility !== shouldBeEligible) {
          issues.push(`CRITICAL: Rare disease eligibility boolean mismatch. Should be ${shouldBeEligible} for ${peakPatients.toLocaleString()} patients`);
          corrections.push(`rareDiseaseEligibility should be ${shouldBeEligible}`);
          score -= 0.3;
        }
      }

      // AIRTIGHT BUSINESS LOGIC 2: Pricing Validation by Indication Type
      if (avgSellingPrice !== null) {
        const isOncology = indication.toLowerCase().includes('cancer') || indication.toLowerCase().includes('oncology') || indication.toLowerCase().includes('tumor');
        const isRareDisease = peakPatients !== null && peakPatients < 200000;

        if (isOncology && (avgSellingPrice < 50000 || avgSellingPrice > 500000)) {
          issues.push(`CRITICAL: Oncology pricing outside range. ASP $${avgSellingPrice.toLocaleString()} should be $50K-$500K for oncology`);
          corrections.push(`ASP should be between $50K-$500K for oncology indications`);
          score -= 0.3;
        }

        if (isRareDisease && (avgSellingPrice < 100000 || avgSellingPrice > 2000000)) {
          issues.push(`CRITICAL: Rare disease pricing outside range. ASP $${avgSellingPrice.toLocaleString()} should be $100K-$2M for rare diseases`);
          corrections.push(`ASP should be between $100K-$2M for rare diseases`);
          score -= 0.3;
        }

        if (!isOncology && !isRareDisease && (avgSellingPrice < 1000 || avgSellingPrice > 50000)) {
          issues.push(`CRITICAL: Common disease pricing outside range. ASP $${avgSellingPrice.toLocaleString()} should be $1K-$50K for common diseases`);
          corrections.push(`ASP should be between $1K-$50K for common diseases`);
          score -= 0.3;
        }
      }

      // AIRTIGHT BUSINESS LOGIC 3: Market Share Realism
      if (peakMarketShare !== null) {
        if (peakMarketShare < 5 || peakMarketShare > 30) {
          issues.push(`CRITICAL: Unrealistic market share ${peakMarketShare}%. Should be 5-30% for new drugs`);
          corrections.push(`Market share should be between 5-30% for new drugs`);
          score -= 0.3;
        }

        if (peakMarketShare > 50) {
          issues.push(`CRITICAL: Excessive market share ${peakMarketShare}%. Maximum realistic: 50%`);
          corrections.push(`Market share should not exceed 50%`);
          score -= 0.4;
        }
      }

      // AIRTIGHT BUSINESS LOGIC 4: Patient Count Validation by Disease Type
      if (peakPatients !== null) {
        const isOncology = indication.toLowerCase().includes('cancer') || indication.toLowerCase().includes('oncology');
        const isRareDisease = peakPatients < 200000;

        if (isOncology && (peakPatients < 10000 || peakPatients > 500000)) {
          issues.push(`CRITICAL: Oncology patient count outside range. ${peakPatients.toLocaleString()} patients should be 10K-500K for oncology`);
          corrections.push(`Patient count should be 10K-500K for oncology indications`);
          score -= 0.3;
        }

        if (isRareDisease && (peakPatients < 1000 || peakPatients > 200000)) {
          issues.push(`CRITICAL: Rare disease patient count outside range. ${peakPatients.toLocaleString()} patients should be 1K-200K for rare diseases`);
          corrections.push(`Patient count should be 1K-200K for rare diseases`);
          score -= 0.3;
        }

        if (!isOncology && !isRareDisease && peakPatients > 500000) {
          issues.push(`CRITICAL: Common disease patient count too high. ${peakPatients.toLocaleString()} patients exceeds 500K limit for common diseases`);
          corrections.push(`Patient count should not exceed 500K for common diseases`);
          score -= 0.3;
        }
      }

      // AIRTIGHT BUSINESS LOGIC 5: Cross-Validation of Patient Count vs Market Share
      if (peakPatients !== null && peakMarketShare !== null) {
        // Higher market share should generally correlate with lower patient population (inverse relationship)
        const expectedMarketShare = Math.max(5, Math.min(30, 1000000 / peakPatients * 10)); // Rough inverse relationship
        const tolerance = 15; // 15% tolerance

        if (Math.abs(peakMarketShare - expectedMarketShare) > tolerance) {
          issues.push(`CRITICAL: Market share ${peakMarketShare}% doesn't align with patient count ${peakPatients.toLocaleString()}. Expected ~${expectedMarketShare.toFixed(1)}%`);
          corrections.push(`Market share should be ~${expectedMarketShare.toFixed(1)}% for ${peakPatients.toLocaleString()} patients`);
          score -= 0.2;
        }
      }

    } catch (error) {
      issues.push(`Error in business logic validation: ${error}`);
      score = 0;
    }

    return {
      isValid: score > 0.8, // Higher threshold
      score: Math.max(0, score),
      issues,
      corrections,
      formulas: [
        'PRV Eligibility: <200K patients = eligible, ≥200K patients = not eligible',
        'Oncology Pricing: $50K-$500K per year',
        'Rare Disease Pricing: $100K-$2M per year',
        'Market Share: 5-30% for new drugs',
        'Patient Count vs Market Share: Inverse relationship'
      ]
    };
  }

  private async validateCrossFieldConsistency(data: any): Promise<MathConsistencyCheck> {
    const prompt = `Validate cross-field consistency in this pharmaceutical data:

DATA: ${JSON.stringify(data, null, 2)}

CROSS-FIELD CHECKS:

1. **Revenue Consistency**:
   - Peak Revenue must be consistent across all sections
   - Total Revenue must be 5-8× Peak Revenue
   - CAGR must align with revenue projections

2. **Patient Count Consistency**:
   - Peak Patients must be consistent with disease type
   - Patient count must align with market size and pricing
   - No conflicting patient numbers across sections

3. **Market Share Consistency**:
   - Market share must be realistic for the indication
   - Must align with competitive landscape
   - Cannot exceed 100% when combined with competitors

4. **Geographic Consistency**:
   - Geographic split must sum to 100%
   - Must be consistent across all sections
   - Format must be consistent (object vs string)

Return JSON with validation results.`;

    try {
      const response = await fetchGPT4o({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a cross-field consistency expert. Check for internal contradictions.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.1
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Cross-field validation failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Cross-field validation failed'],
        corrections: [],
        formulas: []
      };
    }
  }

  private async validatePRVEligibility(data: any): Promise<MathConsistencyCheck> {
    const prompt = `Validate PRV eligibility logic in this pharmaceutical data:

DATA: ${JSON.stringify(data, null, 2)}

PRV ELIGIBILITY CHECKS:

1. **Patient Count Rule**:
   - If peakPatients2030 > 200,000: PRV = "Not eligible" (NOT "Valid. Not eligible")
   - If peakPatients2030 < 200,000: PRV = "Eligible for rare disease PRV"
   - rareDiseaseEligibility: true ONLY if patient population < 200,000

2. **Consistency Check**:
   - prvEligibility and rareDiseaseEligibility must be consistent
   - Cannot have "Valid. Not eligible" - this is contradictory
   - Must be binary: either eligible or not eligible

3. **FDA Regulation Compliance**:
   - PRV applies to rare pediatric diseases (<200,000 patients in US)
   - Tropical disease PRVs have different criteria but still require <200K US patients
   - This is a strict FDA regulation with no ambiguity

Return JSON with validation results.`;

    try {
      const response = await fetchGPT4o({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a PRV eligibility expert. Enforce strict FDA regulations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.1
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('PRV validation failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['PRV validation failed'],
        corrections: [],
        formulas: []
      };
    }
  }

  private async validateRevenueProjections(data: any): Promise<MathConsistencyCheck> {
    const prompt = `Validate revenue projection logic in this pharmaceutical data:

DATA: ${JSON.stringify(data, null, 2)}

REVENUE PROJECTION CHECKS:

1. **Peak Revenue Calculation**:
   - Peak Revenue = (peakPatients2030 × avgSellingPrice × peakMarketShare2030) / 1,000,000,000
   - Verify this calculation is mathematically correct

2. **Total Revenue Logic**:
   - Total 10-Year Revenue should be 5-8× Peak Revenue
   - This is industry standard for pharmaceutical valuations
   - Verify this relationship holds

3. **CAGR Calculation**:
   - CAGR = ((Peak Revenue / Current Market Size)^(1/6) - 1) × 100
   - Verify this calculation is mathematically correct
   - CAGR should be realistic (typically 5-25% for pharmaceuticals)

4. **Market Size Consistency**:
   - Market size should align with patient count × price
   - Growth projections must be realistic
   - No conflicting market size numbers

Return JSON with validation results.`;

    try {
      const response = await fetchGPT4o({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a revenue projection expert. Validate all financial calculations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.1
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Revenue validation failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Revenue validation failed'],
        corrections: [],
        formulas: []
      };
    }
  }

  private async validatePatientCalculations(data: any): Promise<MathConsistencyCheck> {
    const prompt = `Validate patient calculation logic in this pharmaceutical data:

DATA: ${JSON.stringify(data, null, 2)}

PATIENT CALCULATION CHECKS:

1. **Patient Count Logic**:
   - Peak Patients = (Peak Revenue × 1,000,000,000) / (avgSellingPrice × peakMarketShare2030)
   - Verify this calculation is mathematically correct

2. **Disease Epidemiology**:
   - Patient count must align with disease prevalence
   - For common diseases (cancer, diabetes): typically 10,000 - 500,000 patients
   - For rare diseases: typically 1,000 - 200,000 patients
   - For ultra-rare diseases: typically < 1,000 patients

3. **Treatment Duration Impact**:
   - Longer duration = fewer new patients needed for same revenue
   - Must account for persistence rates
   - Should align with patient count calculations

4. **Market Share Relationship**:
   - Higher market share = lower patient population (inverse relationship)
   - Patient count must be realistic for the market share
   - Cannot have impossible patient counts

Return JSON with validation results.`;

    try {
      const response = await fetchGPT4o({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a patient calculation expert. Validate all patient-related logic.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.1
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Patient validation failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Patient validation failed'],
        corrections: [],
        formulas: []
      };
    }
  }

  private combineValidationResults(results: MathConsistencyCheck[]): Partial<LogicValidationResult> {
    const allIssues: string[] = [];
    const allCorrections: string[] = [];
    const allFormulas: string[] = [];
    let totalScore = 0;
    let validChecks = 0;

    results.forEach((result, index) => {
      if (result.isValid) {
        validChecks++;
        totalScore += result.score;
      }
      allIssues.push(...result.issues);
      allCorrections.push(...result.corrections);
      allFormulas.push(...result.formulas);
    });

    const overallScore = validChecks > 0 ? totalScore / validChecks : 0;
    const criticalFailures = allIssues.filter(issue => 
      issue.toLowerCase().includes('critical') || 
      issue.toLowerCase().includes('fail') ||
      issue.toLowerCase().includes('invalid')
    );

    return {
      overallLogicScore: overallScore,
      criticalFailures,
      logicIssues: allIssues,
      logicCorrections: allCorrections,
      validatedFields: results.map((_, index) => `check_${index}`).filter((_, index) => results[index].isValid),
      confidenceLevel: overallScore > 0.8 ? 0.9 : overallScore > 0.6 ? 0.7 : 0.5
    };
  }

  private determineRegenerationNeeds(validationResult: Partial<LogicValidationResult>, data: any): {
    requiresRegeneration: boolean;
    regenerationFields: string[];
    regenerationInstructions: string;
  } {
    const { overallLogicScore = 0, criticalFailures = [], logicIssues = [] } = validationResult;
    
    // Determine if regeneration is needed
    const hasCriticalFailures = criticalFailures.length > 0;
    const scoreTooLow = overallLogicScore < this.regenerationThreshold;
    const hasMajorIssues = logicIssues.length > 5;
    
    const requiresRegeneration = hasCriticalFailures || scoreTooLow || hasMajorIssues;
    
    // Identify fields that need regeneration
    const regenerationFields = this.identifyFieldsForRegeneration(data, logicIssues);
    
    // Generate regeneration instructions
    const regenerationInstructions = this.generateRegenerationInstructions(criticalFailures, logicIssues);
    
    return {
      requiresRegeneration,
      regenerationFields,
      regenerationInstructions
    };
  }

  private identifyFieldsForRegeneration(data: any, issues: string[]): string[] {
    const fieldMappings: { [key: string]: string[] } = {
      'peakRevenue2030': ['peakRevenue2030', 'total10YearRevenue', 'cagr'],
      'peakPatients2030': ['peakPatients2030', 'prvEligibility', 'rareDiseaseEligibility'],
      'avgSellingPrice': ['avgSellingPrice', 'peakRevenue2030', 'total10YearRevenue'],
      'peakMarketShare2030': ['peakMarketShare2030', 'peakRevenue2030', 'peakPatients2030'],
      'cagr': ['cagr', 'peakRevenue2030', 'marketSize'],
      'marketSize': ['marketSize', 'cagr', 'peakRevenue2030'],
      'geographicSplit': ['geographicSplit'],
      'prvEligibility': ['prvEligibility', 'rareDiseaseEligibility', 'peakPatients2030'],
      'rareDiseaseEligibility': ['rareDiseaseEligibility', 'prvEligibility', 'peakPatients2030']
    };

    const fieldsToRegenerate = new Set<string>();
    
    issues.forEach(issue => {
      Object.entries(fieldMappings).forEach(([field, relatedFields]) => {
        if (issue.toLowerCase().includes(field.toLowerCase()) || 
            issue.toLowerCase().includes(field.replace(/([A-Z])/g, ' $1').toLowerCase())) {
          relatedFields.forEach(f => fieldsToRegenerate.add(f));
        }
      });
    });

    return Array.from(fieldsToRegenerate);
  }

  private generateRegenerationInstructions(criticalFailures: string[], issues: string[]): string {
    const instructions: string[] = [];
    
    if (criticalFailures.length > 0) {
      instructions.push('CRITICAL FAILURES DETECTED:');
      criticalFailures.forEach(failure => {
        instructions.push(`- ${failure}`);
      });
      instructions.push('');
    }
    
    if (issues.length > 0) {
      instructions.push('LOGIC ISSUES TO FIX:');
      issues.slice(0, 10).forEach(issue => { // Limit to first 10 issues
        instructions.push(`- ${issue}`);
      });
      instructions.push('');
    }
    
    instructions.push('REGENERATION REQUIREMENTS:');
    instructions.push('- Fix all mathematical inconsistencies');
    instructions.push('- Ensure PRV eligibility logic is correct');
    instructions.push('- Validate revenue projections are mathematically sound');
    instructions.push('- Check patient count aligns with disease epidemiology');
    instructions.push('- Verify geographic split sums to 100%');
    instructions.push('- Ensure all percentages are between 0-100%');
    
    return instructions.join('\n');
  }

  async attemptLogicFix(data: any, issues: string[]): Promise<any> {
    console.log('🔧 Attempting Logic Fix');
    
    const prompt = `Fix the logical inconsistencies in this pharmaceutical data:

ORIGINAL DATA: ${JSON.stringify(data, null, 2)}
ISSUES TO FIX: ${JSON.stringify(issues, null, 2)}

FIXING REQUIREMENTS:
1. Fix all mathematical inconsistencies
2. Ensure PRV eligibility logic is correct
3. Validate revenue projections are mathematically sound
4. Check patient count aligns with disease epidemiology
5. Verify geographic split sums to 100%
6. Ensure all percentages are between 0-100%

IMPORTANT: Only fix the data using the context provided. Do not invent new data.
If insufficient data exists to fix an issue, mark it as "INSUFFICIENT_DATA".

Return the corrected data as valid JSON.`;

    try {
      const response = await fetchGPT4o({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a logic correction expert. Fix inconsistencies using only provided context.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.1
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Logic fix failed:', error);
      return data; // Return original data if fix fails
    }
  }
} 