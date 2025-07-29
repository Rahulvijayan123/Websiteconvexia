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
    const prompt = `Validate mathematical consistency in this pharmaceutical data:

DATA: ${JSON.stringify(data, null, 2)}

CRITICAL MATH CHECKS:

1. **Peak Revenue Calculation**:
   - Peak Revenue = (peakPatients2030 × avgSellingPrice × peakMarketShare2030) / 1,000,000,000
   - Verify this calculation is mathematically correct

2. **CAGR Calculation**:
   - CAGR = ((Peak Revenue / Current Market Size)^(1/6) - 1) × 100
   - Verify this calculation is mathematically correct

3. **Total Revenue Logic**:
   - Total 10-Year Revenue should be 5-8× Peak Revenue
   - Verify this relationship holds

4. **Geographic Split**:
   - US + ex-US percentages must equal 100%
   - Verify no mathematical errors

5. **Patient Count Logic**:
   - Peak Patients must align with revenue and pricing
   - Verify: Peak Patients = (Peak Revenue × 1,000,000,000) / (avgSellingPrice × peakMarketShare2030)

Return JSON with:
- isValid: boolean
- score: number (0-1)
- issues: array of specific math problems found
- corrections: array of specific corrections needed
- formulas: array of formulas used in validation`;

    try {
      const response = await fetchGPT4o({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a mathematical validation expert. Be extremely thorough and precise.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.1
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Math validation failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Math validation failed'],
        corrections: [],
        formulas: []
      };
    }
  }

  private async validateBusinessLogic(data: any, inputs: any): Promise<MathConsistencyCheck> {
    const prompt = `Validate business logic consistency in this pharmaceutical data:

INPUTS: ${JSON.stringify(inputs, null, 2)}
DATA: ${JSON.stringify(data, null, 2)}

BUSINESS LOGIC CHECKS:

1. **Rare Disease Eligibility**:
   - If peakPatients2030 > 200,000: PRV must be "Not eligible" AND rareDiseaseEligibility must be false
   - If peakPatients2030 < 200,000: PRV must be "Eligible" AND rareDiseaseEligibility must be true
   - This is a binary FDA regulation

2. **Pricing Logic**:
   - Oncology: $50,000 - $500,000 per year
   - Rare diseases: $100,000 - $2,000,000 per year
   - Common diseases: $1,000 - $50,000 per year
   - Pricing must align with patient population size

3. **Market Share Logic**:
   - peakMarketShare2030 must be realistic (typically 5-30% for new drugs)
   - Higher market share = lower patient population (inverse relationship)
   - Market share + competitor market shares should not exceed 100%

4. **Patient Count Logic**:
   - Patient count must align with disease epidemiology
   - For common diseases: typically 10,000 - 500,000 patients
   - For rare diseases: typically 1,000 - 200,000 patients
   - For ultra-rare diseases: typically < 1,000 patients

Return JSON with validation results.`;

    try {
      const response = await fetchGPT4o({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a pharmaceutical business logic expert. Validate all business rules.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.1
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Business logic validation failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Business logic validation failed'],
        corrections: [],
        formulas: []
      };
    }
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