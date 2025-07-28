import { fetchPplx } from './pplxClient';
import { EnhancedMathAuditor } from './enhancedMathAuditor';

interface ThreeLayerConfig {
  maxValidationCycles: number;
  qualityThreshold: number;
  enableFieldLevelValidation: boolean;
  enableGPTLogicVerification: boolean;
  enableCaching: boolean;
  timeoutMs: number;
  validationStrictness: 'ultra' | 'high' | 'standard';
  maxFieldRetries: number;
}

interface FieldValidationResult {
  fieldName: string;
  isValid: boolean;
  score: number;
  issues: string[];
  corrections: string[];
  sourcesValidated: string[];
  confidence: number;
  requiresRegeneration: boolean;
}

interface ValidationCycle {
  cycle: number;
  fieldValidations: FieldValidationResult[];
  overallScore: number;
  fieldsRequiringRegeneration: string[];
  totalFields: number;
  validatedFields: number;
}

interface ThreeLayerResult {
  finalOutput: any;
  validationCycles: ValidationCycle[];
  totalCycles: number;
  finalQualityScore: number;
  gptLogicVerification: any;
  mathAuditResults: any;
  fieldValidationSummary: any;
  metadata: {
    totalTimeMs: number;
    sourcesUsed: number;
    searchQueries: number;
    validationAttempts: number;
    fieldRegenerations: number;
  };
}

export class ThreeLayerPerplexityOrchestrator {
  private config: ThreeLayerConfig;
  private mathAuditor: EnhancedMathAuditor;
  private fieldCache: Map<string, any> = new Map();

  constructor(config: Partial<ThreeLayerConfig> = {}) {
    this.config = {
      maxValidationCycles: 5,
      qualityThreshold: 0.90,
      enableFieldLevelValidation: true,
      enableGPTLogicVerification: true,
      enableCaching: true,
      timeoutMs: 300000, // 5 minutes
      validationStrictness: 'ultra',
      maxFieldRetries: 3,
      ...config
    };

    this.mathAuditor = new EnhancedMathAuditor();
  }

  async orchestrate(inputs: any): Promise<ThreeLayerResult> {
    const startTime = Date.now();
    console.log('🚀 Starting Three-Layer Perplexity Orchestration');
    
    const validationCycles: ValidationCycle[] = [];
    let currentOutput: any = null;
    let cycleCount = 0;
    let finalQualityScore = 0;
    let totalFieldRegenerations = 0;

    // Layer 1: Initial Research Agent
    console.log('📚 Layer 1: Initial Research Agent');
    currentOutput = await this.executeLayer1Research(inputs);
    
    // Validation and Refinement Loop
    while (cycleCount < this.config.maxValidationCycles) {
      cycleCount++;
      console.log(`\n🔄 Validation Cycle ${cycleCount}/${this.config.maxValidationCycles}`);
      
      // Layer 2: Field-Level Validation Agent
      const fieldValidations = await this.executeLayer2FieldValidation(inputs, currentOutput, cycleCount);
      
      const fieldsRequiringRegeneration = fieldValidations
        .filter(fv => fv.requiresRegeneration)
        .map(fv => fv.fieldName);
      
      const validatedFields = fieldValidations.filter(fv => fv.isValid).length;
      const overallScore = fieldValidations.reduce((sum, fv) => sum + fv.score, 0) / fieldValidations.length;
      
      const cycle: ValidationCycle = {
        cycle: cycleCount,
        fieldValidations,
        overallScore,
        fieldsRequiringRegeneration,
        totalFields: fieldValidations.length,
        validatedFields
      };

      validationCycles.push(cycle);
      totalFieldRegenerations += fieldsRequiringRegeneration.length;

      // Check if quality threshold is met
      if (overallScore >= this.config.qualityThreshold && fieldsRequiringRegeneration.length === 0) {
        console.log(`✅ Quality threshold met: ${overallScore.toFixed(2)} >= ${this.config.qualityThreshold}`);
        finalQualityScore = overallScore;
        break;
      }

      // Regenerate failed fields
      if (fieldsRequiringRegeneration.length > 0) {
        console.log(`🔄 Regenerating ${fieldsRequiringRegeneration.length} failed fields`);
        currentOutput = await this.regenerateFailedFields(inputs, currentOutput, fieldValidations);
      }
    }

    // Layer 3: GPT Logic Verification
    let gptLogicVerification = null;
    if (this.config.enableGPTLogicVerification) {
      console.log('\n🧠 Layer 3: GPT Logic Verification');
      gptLogicVerification = await this.executeLayer3GPTVerification(currentOutput);
      currentOutput = gptLogicVerification.finalOutput;
    }

    // Math Audit
    let mathAuditResults = null;
    if (this.config.enableGPTLogicVerification) {
      console.log('\n🧮 Math Audit');
      mathAuditResults = await this.mathAuditor.auditMath(currentOutput);
    }

    const totalTimeMs = Date.now() - startTime;

    return {
      finalOutput: currentOutput,
      validationCycles,
      totalCycles: cycleCount,
      finalQualityScore,
      gptLogicVerification,
      mathAuditResults,
      fieldValidationSummary: this.generateFieldValidationSummary(validationCycles),
      metadata: {
        totalTimeMs,
        sourcesUsed: this.calculateTotalSources(validationCycles),
        searchQueries: this.calculateTotalSearchQueries(validationCycles),
        validationAttempts: cycleCount,
        fieldRegenerations: totalFieldRegenerations
      }
    };
  }

  private async executeLayer1Research(inputs: any): Promise<any> {
    const prompt = this.generateLayer1Prompt(inputs);
    
    const payload = {
      model: 'sonar-deep-research',
      messages: [
        { role: 'system', content: 'You are a biotech commercial intelligence research agent. Conduct thorough, accurate research and return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 8000,
      temperature: 0.1,
      reasoning_effort: 'high',
      web_search_options: {
        search_context_size: 'high',
        search_depth: 'deep'
      },
      search_queries_per_search: 15,
      response_format: {
        type: 'json_schema' as const,
        json_schema: { schema: this.getCommercialSchema() }
      }
    };

    const response = await fetchPplx(payload);
    return this.parsePerplexityResponse(response.choices[0].message.content);
  }

  private async executeLayer2FieldValidation(inputs: any, currentOutput: any, cycle: number): Promise<FieldValidationResult[]> {
    const fieldValidations: FieldValidationResult[] = [];
    
    // Define fields to validate
    const fieldsToValidate = [
      'cagr', 'marketSize', 'directCompetitors', 'peakRevenue2030', 'total10YearRevenue',
      'peakMarketShare2030', 'peakPatients2030', 'avgSellingPrice', 'persistenceRate',
      'treatmentDuration', 'geographicSplit', 'competitorPricing', 'pricingScenarios',
      'strategicTailwindData', 'dealActivity', 'pipelineAnalysis'
    ];

    console.log(`  🔍 Validating ${fieldsToValidate.length} fields in batches`);

    // Validate fields in batches of 4 to reduce API calls
    const batchSize = 4;
    for (let i = 0; i < fieldsToValidate.length; i += batchSize) {
      const batch = fieldsToValidate.slice(i, i + batchSize);
      const batchValidations = await this.validateFieldBatch(inputs, currentOutput, batch, cycle);
      fieldValidations.push(...batchValidations);
    }

    return fieldValidations;
  }

  private async validateFieldBatch(inputs: any, currentOutput: any, fieldNames: string[], cycle: number): Promise<FieldValidationResult[]> {
    const fieldData = fieldNames.map(fieldName => ({
      name: fieldName,
      value: this.getNestedValue(currentOutput, fieldName)
    }));

    const prompt = this.generateBatchFieldValidationPrompt(inputs, fieldData, cycle);
    
    const payload = {
      model: 'sonar-deep-research',
      messages: [
        { role: 'system', content: 'You are a biotech commercial intelligence field validation agent. Validate multiple fields for quality and factual accuracy.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 6000,
      temperature: 0.1,
      reasoning_effort: 'high',
      web_search_options: {
        search_context_size: 'high',
        search_depth: 'deep'
      },
      search_queries_per_search: 15,
      response_format: {
        type: 'json_schema' as const,
        json_schema: { schema: this.getBatchFieldValidationSchema() }
      }
    };

    try {
      const response = await fetchPplx(payload);
      const validationResults = this.parsePerplexityResponse(response.choices[0].message.content);
      
      return fieldNames.map((fieldName, index) => {
        const result = validationResults.validations[index] || {};
        return {
          fieldName,
          isValid: result.isValid || false,
          score: result.score || 0,
          issues: result.issues || [],
          corrections: result.corrections || [],
          sourcesValidated: result.sourcesValidated || [],
          confidence: result.confidence || 0,
          requiresRegeneration: !result.isValid || (result.score || 0) < 0.7
        };
      });
    } catch (error) {
      console.error(`  ❌ Batch field validation failed:`, error);
      return fieldNames.map(fieldName => ({
        fieldName,
        isValid: false,
        score: 0,
        issues: [`Validation error: ${error}`],
        corrections: [`Retry validation for ${fieldName}`],
        sourcesValidated: [],
        confidence: 0,
        requiresRegeneration: true
      }));
    }
  }



  private async regenerateFailedFields(inputs: any, currentOutput: any, fieldValidations: FieldValidationResult[]): Promise<any> {
    const failedFields = fieldValidations.filter(fv => fv.requiresRegeneration);
    
    if (failedFields.length === 0) {
      return currentOutput;
    }

    const prompt = this.generateFieldRegenerationPrompt(inputs, currentOutput, failedFields);
    
    const payload = {
      model: 'sonar-deep-research',
      messages: [
        { role: 'system', content: 'You are a biotech commercial intelligence field regeneration agent. Regenerate only the specified failed fields with improved quality.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 8000,
      temperature: 0.1,
      reasoning_effort: 'high',
      web_search_options: {
        search_context_size: 'high',
        search_depth: 'deep'
      },
      search_queries_per_search: 15,
      response_format: {
        type: 'json_schema' as const,
        json_schema: { schema: this.getCommercialSchema() }
      }
    };

    const response = await fetchPplx(payload);
    const regeneratedOutput = this.parsePerplexityResponse(response.choices[0].message.content);
    
    // Merge regenerated fields with existing output
    const mergedOutput = { ...currentOutput };
    for (const field of failedFields) {
      const regeneratedValue = this.getNestedValue(regeneratedOutput, field.fieldName);
      if (regeneratedValue !== undefined) {
        this.setNestedValue(mergedOutput, field.fieldName, regeneratedValue);
      }
    }
    
    return mergedOutput;
  }

  private async executeLayer3GPTVerification(output: any): Promise<any> {
    // This would integrate with OpenAI API for logic verification
    // For now, we'll simulate the GPT verification logic
    
    const logicVerification = {
      mathConsistency: this.verifyMathConsistency(output),
      crossFieldConsistency: this.verifyCrossFieldConsistency(output),
      logicAnnotations: this.addLogicAnnotations(output),
      finalOutput: this.formatFinalOutput(output)
    };

    return {
      logicVerification,
      finalOutput: logicVerification.finalOutput,
      mathConsistency: logicVerification.mathConsistency,
      crossFieldConsistency: logicVerification.crossFieldConsistency,
      logicAnnotations: logicVerification.logicAnnotations
    };
  }

  private verifyMathConsistency(output: any): any {
    // Verify mathematical relationships between fields
    const issues: string[] = [];
    const corrections: string[] = [];
    
    // Example: Verify peak revenue vs market size relationship
    const peakRevenue = this.extractNumericValue(output.peakRevenue2030);
    const marketSize = this.extractNumericValue(output.marketSize);
    const peakMarketShare = this.extractNumericValue(output.peakMarketShare2030);
    
    if (peakRevenue && marketSize && peakMarketShare) {
      const expectedPeakRevenue = marketSize * (peakMarketShare / 100);
      const difference = Math.abs(peakRevenue - expectedPeakRevenue) / expectedPeakRevenue;
      
      if (difference > 0.1) {
        issues.push(`Peak revenue (${peakRevenue}B) differs significantly from expected value (${expectedPeakRevenue.toFixed(2)}B) based on market size and share`);
        corrections.push(`Adjust peak revenue to ${expectedPeakRevenue.toFixed(2)}B or revise market share to ${((peakRevenue / marketSize) * 100).toFixed(1)}%`);
      }
    }
    
    return { issues, corrections, isValid: issues.length === 0 };
  }

  private verifyCrossFieldConsistency(output: any): any {
    // Verify consistency across different sections
    const issues: string[] = [];
    const corrections: string[] = [];
    
    // Example: Verify competitor pricing matches direct competitors
    const directCompetitors = output.directCompetitors;
    const competitorPricing = output.competitorPricing;
    
    if (Array.isArray(directCompetitors) && Array.isArray(competitorPricing)) {
      const competitorNames = directCompetitors.map(c => c.toLowerCase());
      const pricingNames = competitorPricing.map(c => c.drugName?.toLowerCase());
      
      const missingPricing = competitorNames.filter(name => 
        !pricingNames.some(pricingName => pricingName?.includes(name))
      );
      
      if (missingPricing.length > 0) {
        issues.push(`Missing pricing data for competitors: ${missingPricing.join(', ')}`);
        corrections.push(`Add pricing data for missing competitors or remove from direct competitors list`);
      }
    }
    
    return { issues, corrections, isValid: issues.length === 0 };
  }

  private addLogicAnnotations(output: any): any {
    // Add logic annotations to each field
    const annotations: any = {};
    
    if (output.peakRevenue2030) {
      annotations.peakRevenue2030 = 'Calculated from market size analysis and competitive positioning';
    }
    
    if (output.cagr) {
      annotations.cagr = 'Derived from peak revenue and current market size using CAGR formula';
    }
    
    if (output.total10YearRevenue) {
      annotations.total10YearRevenue = 'Sum of 10-year revenue projections with realistic ramp-up and decline curves';
    }
    
    if (output.peakPatients2030) {
      annotations.peakPatients2030 = 'Calculated from peak revenue, average selling price, and persistence rate';
    }
    
    return annotations;
  }

  private formatFinalOutput(output: any): any {
    // Format the final output with annotations and metadata
    return {
      ...output,
      _metadata: {
        generatedAt: new Date().toISOString(),
        validationCycles: this.config.maxValidationCycles,
        qualityThreshold: this.config.qualityThreshold,
        sourceTraceability: true
      },
      _annotations: this.addLogicAnnotations(output)
    };
  }

  private generateLayer1Prompt(inputs: any): string {
    return `You are a biotech commercial intelligence research agent.

Target: ${inputs.target}
Indication: ${inputs.indication}
Therapeutic Area: ${inputs.therapeuticArea}
Geography: ${inputs.geography}
Development Phase: ${inputs.developmentPhase}

Conduct comprehensive research using high-quality sources. Focus on:
1. Direct competitors and deal activity
2. Market size and growth projections
3. Regulatory landscape and incentives
4. Financial projections and valuation
5. Patent and IP analysis
6. Clinical and scientific evidence

Return only valid JSON matching the commercial schema. Use live web search and cite sources.`;
  }

  private generateFieldValidationPrompt(inputs: any, fieldName: string, fieldValue: any, cycle: number): string {
    return `You are a biotech commercial intelligence field validation agent.

TARGET: ${inputs.target}
INDICATION: ${inputs.indication}
FIELD: ${fieldName}
CURRENT VALUE: ${JSON.stringify(fieldValue)}

INDEPENDENTLY validate this field by:
1. Cross-checking factual claims with independent sources
2. Verifying source credibility and recency
3. Checking for logical consistency
4. Assessing completeness and accuracy

Search for contradictory evidence and identify any:
- Weak or outdated sources
- Inconsistent data
- Missing justification
- Factual errors
- Logical inconsistencies

Return validation results with score (0-1), specific issues, and corrections needed.`;
  }

  private generateBatchFieldValidationPrompt(inputs: any, fieldData: { name: string; value: any }[], cycle: number): string {
    const prompt = `You are a biotech commercial intelligence field validation agent.

TARGET: ${inputs.target}
INDICATION: ${inputs.indication}

FIELD DATA:
${fieldData.map(f => `- ${f.name}: ${JSON.stringify(f.value)}`).join('\n')}

INDEPENDENTLY validate these fields by:
1. Cross-checking factual claims with independent sources
2. Verifying source credibility and recency
3. Checking for logical consistency
4. Assessing completeness and accuracy

Search for contradictory evidence and identify any:
- Weak or outdated sources
- Inconsistent data
- Missing justification
- Factual errors
- Logical inconsistencies

Return validation results for each field with score (0-1), specific issues, and corrections needed.`;
    return prompt;
  }

  private generateFieldRegenerationPrompt(inputs: any, currentOutput: any, failedFields: FieldValidationResult[]): string {
    const failedFieldNames = failedFields.map(f => f.fieldName).join(', ');
    const corrections = failedFields.map(f => `${f.fieldName}: ${f.corrections.join('; ')}`).join('\n');
    
    return `You are a biotech commercial intelligence field regeneration agent.

TARGET: ${inputs.target}
INDICATION: ${inputs.indication}

CURRENT OUTPUT:
${JSON.stringify(currentOutput, null, 2)}

FAILED FIELDS TO REGENERATE: ${failedFieldNames}

CORRECTIONS NEEDED:
${corrections}

Regenerate ONLY the failed fields with improved quality. Address each correction specifically.
Return the complete JSON object with regenerated fields.`;
  }

  private getCommercialSchema(): any {
    const commercialSchema = require('@/schemas/commercialOutputSchema.json');
    return commercialSchema;
  }

  private getFieldValidationSchema(): any {
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "isValid": { 
          "type": "boolean",
          "description": "Whether the field passes validation"
        },
        "score": { 
          "type": "number", 
          "minimum": 0, 
          "maximum": 1,
          "description": "Quality score from 0 to 1"
        },
        "issues": { 
          "type": "array", 
          "items": { "type": "string" },
          "description": "List of validation issues found"
        },
        "corrections": { 
          "type": "array", 
          "items": { "type": "string" },
          "description": "List of suggested corrections"
        },
        "sourcesValidated": { 
          "type": "array", 
          "items": { "type": "string" },
          "description": "List of sources that were validated"
        },
        "confidence": { 
          "type": "number", 
          "minimum": 0, 
          "maximum": 1,
          "description": "Confidence level in validation results"
        }
      },
      "required": ["isValid", "score", "issues", "corrections", "sourcesValidated", "confidence"]
    };
  }

  private getBatchFieldValidationSchema(): any {
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "validations": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "isValid": {
                "type": "boolean",
                "description": "Whether the field passes validation"
              },
              "score": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "description": "Quality score from 0 to 1"
              },
              "issues": {
                "type": "array",
                "items": { "type": "string" },
                "description": "List of validation issues found"
              },
              "corrections": {
                "type": "array",
                "items": { "type": "string" },
                "description": "List of suggested corrections"
              },
              "sourcesValidated": {
                "type": "array",
                "items": { "type": "string" },
                "description": "List of sources that were validated"
              },
              "confidence": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "description": "Confidence level in validation results"
              }
            },
            "required": ["isValid", "score", "issues", "corrections", "sourcesValidated", "confidence"]
          }
        }
      },
      "required": ["validations"]
    };
  }

  private parsePerplexityResponse(content: string): any {
    // Handle thinking responses and extract JSON
    if (content.includes('<think>')) {
      const thinkMatch = content.match(/<think>[\s\S]*?<\/think>/);
      if (thinkMatch) {
        content = content.replace(thinkMatch[0], '').trim();
      }
    }
    
    // Try to extract JSON from the response
    try {
      return JSON.parse(content);
    } catch (e) {
      // Fallback: try to extract JSON from code block
      const codeBlockMatch = content.match(/^```(?:json)?\n([\s\S]*?)\n```$/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1]);
      }
      throw new Error(`Failed to parse JSON response: ${e}`);
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private extractNumericValue(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
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

  private generateFieldValidationSummary(validationCycles: ValidationCycle[]): any {
    const totalFields = validationCycles[0]?.totalFields || 0;
    const totalValidations = validationCycles.reduce((sum, cycle) => sum + cycle.fieldValidations.length, 0);
    const successfulValidations = validationCycles.reduce((sum, cycle) => 
      sum + cycle.fieldValidations.filter(fv => fv.isValid).length, 0
    );
    
    return {
      totalFields,
      totalValidations,
      successfulValidations,
      successRate: totalValidations > 0 ? successfulValidations / totalValidations : 0,
      averageScore: validationCycles.reduce((sum, cycle) => sum + cycle.overallScore, 0) / validationCycles.length,
      totalRegenerations: validationCycles.reduce((sum, cycle) => sum + cycle.fieldsRequiringRegeneration.length, 0)
    };
  }

  private calculateTotalSources(cycles: ValidationCycle[]): number {
    return cycles.reduce((total, cycle) => 
      total + cycle.fieldValidations.reduce((sum, fv) => sum + fv.sourcesValidated.length, 0), 0
    );
  }

  private calculateTotalSearchQueries(cycles: ValidationCycle[]): number {
    return cycles.length * 50; // Estimate based on typical query count
  }

  getConfiguration(): ThreeLayerConfig {
    return { ...this.config };
  }
} 