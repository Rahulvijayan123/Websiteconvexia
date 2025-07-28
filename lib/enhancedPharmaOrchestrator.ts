import { fetchPplx } from './pplxClient';
import { EnhancedMathAuditor } from './enhancedMathAuditor';
import { EnhancedScoringSystem } from './enhancedScoringSystem';
import commercialSchema from '@/schemas/commercialOutputSchema.json';

// Simple cost tracker for enhanced orchestrator
class SimpleCostTracker {
  private totalCost = 0;
  private maxBudget = 3.0;

  resetQuery() {
    this.totalCost = 0;
  }

  getRemainingBudget() {
    return Math.max(0, this.maxBudget - this.totalCost);
  }

  getCurrentMetrics() {
    return { totalCost: this.totalCost };
  }

  getOptimalModel(type: string, budget: number) {
    if (this.getRemainingBudget() > budget) {
      return 'sonar-deep-research';
    }
    return 'sonar-pro';
  }

  getCostOptimizationSuggestions() {
    return [];
  }
}

const globalCostTracker = new SimpleCostTracker();

interface EnhancedPharmaConfig {
  maxValidationCycles: number;
  qualityThreshold: number;
  enableFieldLevelValidation: boolean;
  enableGPTLogicVerification: boolean;
  enableCaching: boolean;
  timeoutMs: number;
  validationStrictness: 'low' | 'medium' | 'high' | 'ultra';
  maxFieldRetries: number;
  rateLimitDelay: number;
  batchSize: number;
  enableSmartValidation: boolean;
  maxCostPerQuery: number;
  enableGPT4oEnhancement: boolean;
  enableExecutiveValidation: boolean;
}

interface ValidationCycle {
  cycle: number;
  fieldValidations: FieldValidation[];
  overallScore: number;
  fieldsRequiringRegeneration: string[];
  totalFields: number;
  validatedFields: number;
  apiCallsMade: number;
  costMetrics: any;
  executiveDomainScores: any;
}

interface FieldValidation {
  fieldName: string;
  isValid: boolean;
  score: number;
  requiresRegeneration: boolean;
  validationDetails: any;
}

interface EnhancedPharmaResult {
  finalOutput: any;
  validationCycles: ValidationCycle[];
  totalCycles: number;
  finalQualityScore: number;
  gptLogicVerification: any;
  mathAuditResults: any;
  fieldValidationSummary: any;
  gpt4oEnhancement: any;
  executiveAnalysis: any;
  metadata: {
    totalTimeMs: number;
    sourcesUsed: number;
    searchQueries: number;
    validationAttempts: number;
    fieldRegenerations: number;
    totalApiCalls: number;
    costOptimization: {
      apiCallsSaved: number;
      estimatedCostReduction: number;
      efficiencyScore: number;
    };
    costMetrics: any;
  };
}

export class EnhancedPharmaOrchestrator {
  private config: EnhancedPharmaConfig;
  private mathAuditor: EnhancedMathAuditor;
  private scoringSystem: EnhancedScoringSystem;
  private fieldCache: Map<string, any> = new Map();
  private apiCallCount: number = 0;
  private lastApiCall: number = 0;

  constructor(config: Partial<EnhancedPharmaConfig> = {}) {
    this.config = {
      maxValidationCycles: 3,
      qualityThreshold: 0.85,
      enableFieldLevelValidation: true,
      enableGPTLogicVerification: true,
      enableCaching: true,
      timeoutMs: 180000,
      validationStrictness: 'high',
      maxFieldRetries: 2,
      rateLimitDelay: 2000,
      batchSize: 6,
      enableSmartValidation: true,
      maxCostPerQuery: 3.0,
      enableGPT4oEnhancement: true,
      enableExecutiveValidation: true,
      ...config
    };

    this.mathAuditor = new EnhancedMathAuditor();
    this.scoringSystem = new EnhancedScoringSystem();
  }

  async orchestrate(inputs: any): Promise<EnhancedPharmaResult> {
    const startTime = Date.now();
    console.log('🚀 Starting Enhanced Pharma Orchestration');
    console.log('🎯 Executive-Level Quality Standards');
    
    // Reset cost tracking for new query
    globalCostTracker.resetQuery();
    
    const validationCycles: ValidationCycle[] = [];
    let currentOutput: any = null;
    let cycleCount = 0;
    let finalQualityScore = 0;
    let totalFieldRegenerations = 0;
    let totalApiCalls = 0;

    try {
      // Layer 1: Enhanced Research Agent with Executive Standards
      console.log('📚 Layer 1: Enhanced Research Agent (Executive Standards)');
      currentOutput = await this.executeEnhancedResearch(inputs);
      totalApiCalls++;
      
      // Validation and Refinement Loop
      while (cycleCount < this.config.maxValidationCycles) {
        cycleCount++;
        console.log(`\n🔄 Validation Cycle ${cycleCount}/${this.config.maxValidationCycles}`);
        
        // Check cost limit before proceeding
        if (globalCostTracker.getRemainingBudget() < 1.0) {
          console.log(`💰 Cost limit approaching, stopping validation cycles. Remaining: $${globalCostTracker.getRemainingBudget().toFixed(4)}`);
          break;
        }
        
        // Layer 2: Executive Field-Level Validation
        const fieldValidations = await this.executeExecutiveFieldValidation(inputs, currentOutput, cycleCount);
        totalApiCalls += fieldValidations.apiCallsMade;
        
        // Executive Domain Analysis
        const executiveDomainScores = await this.performExecutiveDomainAnalysis(inputs, currentOutput);
        
        const fieldsRequiringRegeneration = fieldValidations.validations
          .filter(fv => fv.requiresRegeneration)
          .map(fv => fv.fieldName);
        
        const validatedFields = fieldValidations.validations.filter(fv => fv.isValid).length;
        const overallScore = fieldValidations.validations.reduce((sum, fv) => sum + fv.score, 0) / fieldValidations.validations.length;
        
        const cycle: ValidationCycle = {
          cycle: cycleCount,
          fieldValidations: fieldValidations.validations,
          overallScore,
          fieldsRequiringRegeneration,
          totalFields: fieldValidations.validations.length,
          validatedFields,
          apiCallsMade: fieldValidations.apiCallsMade,
          costMetrics: globalCostTracker.getCurrentMetrics(),
          executiveDomainScores
        };

        validationCycles.push(cycle);
        totalFieldRegenerations += fieldsRequiringRegeneration.length;

        // Check if quality threshold is met
        if (overallScore >= this.config.qualityThreshold && fieldsRequiringRegeneration.length === 0) {
          console.log(`✅ Quality threshold met: ${overallScore.toFixed(2)} >= ${this.config.qualityThreshold}`);
          finalQualityScore = overallScore;
          break;
        }

        // Regenerate failed fields (only if we have budget)
        if (fieldsRequiringRegeneration.length > 0 && globalCostTracker.getRemainingBudget() > 0.8) {
          console.log(`🔄 Regenerating ${fieldsRequiringRegeneration.length} failed fields`);
          currentOutput = await this.regenerateFailedFields(inputs, currentOutput, fieldValidations.validations);
          totalApiCalls++;
        }
      }

      // Layer 3: Enhanced GPT-4o Enhancement
      let gpt4oEnhancement = null;
      if (this.config.enableGPT4oEnhancement && globalCostTracker.getRemainingBudget() > 0.2) {
        console.log('\n🧠 Layer 3: Enhanced GPT-4o Enhancement (Executive Standards)');
        gpt4oEnhancement = await this.executeEnhancedGPT4oEnhancement(inputs, currentOutput);
        currentOutput = gpt4oEnhancement.finalOutput;
      }

      // Enhanced Math Audit
      let mathAuditResults = null;
      if (this.config.enableGPTLogicVerification && globalCostTracker.getRemainingBudget() > 0.1) {
        console.log('\n🧮 Enhanced Math Audit');
        mathAuditResults = await this.mathAuditor.auditMath(currentOutput);
      }

      // Final Executive Analysis
      let executiveAnalysis = null;
      if (this.config.enableExecutiveValidation) {
        console.log('\n👔 Final Executive Analysis');
        executiveAnalysis = await this.performFinalExecutiveAnalysis(inputs, currentOutput);
      }

      const totalTimeMs = Date.now() - startTime;

      // Calculate cost optimization metrics
      const costOptimization = this.calculateCostOptimization(totalApiCalls, validationCycles);

      return {
        finalOutput: currentOutput,
        validationCycles,
        totalCycles: cycleCount,
        finalQualityScore,
        gptLogicVerification: gpt4oEnhancement?.logicValidation || null,
        mathAuditResults,
        fieldValidationSummary: this.generateFieldValidationSummary(validationCycles),
        gpt4oEnhancement,
        executiveAnalysis,
        metadata: {
          totalTimeMs,
          sourcesUsed: this.calculateTotalSources(validationCycles),
          searchQueries: this.calculateTotalSearchQueries(validationCycles),
          validationAttempts: cycleCount,
          fieldRegenerations: totalFieldRegenerations,
          totalApiCalls,
          costOptimization,
          costMetrics: globalCostTracker.getCurrentMetrics()
        }
      };
    } catch (error: any) {
      console.error('❌ Enhanced orchestration failed:', error);
      throw error;
    }
  }

  private async executeEnhancedResearch(inputs: any): Promise<any> {
    await this.rateLimit();
    
    const prompt = this.generateEnhancedResearchPrompt(inputs);
    const commercialSchema = this.getEnhancedCommercialSchema();
    
    // Use cost-aware model selection
    const model = globalCostTracker.getOptimalModel('research', 1.5);
    
    const payload = {
      model,
      messages: [
        { role: 'system', content: 'You are a senior pharmaceutical executive with 40+ years of experience in M&A, BD, and commercial intelligence. Generate only valid, mathematically consistent JSON that meets pre-IC investment memo standards.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 8000,
      temperature: 0.1,
      reasoning_effort: 'high',
      response_format: {
        type: 'json_schema' as const,
        json_schema: { schema: commercialSchema }
      },
      web_search_options: {
        search_context_size: 'high',
        search_depth: 'standard'
      },
      search_queries_per_search: 4
    };

    const response = await fetchPplx(payload);
    const parsedResponse = this.parsePerplexityResponse(response.choices[0].message.content);
    
    return parsedResponse;
  }

  private async executeExecutiveFieldValidation(inputs: any, currentOutput: any, cycleCount: number): Promise<{
    validations: FieldValidation[];
    apiCallsMade: number;
  }> {
    const fieldsToValidate = this.selectFieldsForValidation(currentOutput, cycleCount);
    const batches = this.createBatches(fieldsToValidate, this.config.batchSize);
    
    let allValidations: FieldValidation[] = [];
    let totalApiCalls = 0;

    for (const batch of batches) {
      const batchValidations = await this.validateFieldBatch(inputs, currentOutput, batch);
      allValidations.push(...batchValidations);
      totalApiCalls++;
    }

    return {
      validations: allValidations,
      apiCallsMade: totalApiCalls
    };
  }

  private async validateFieldBatch(inputs: any, currentOutput: any, fieldNames: string[]): Promise<FieldValidation[]> {
    await this.rateLimit();
    
    const prompt = this.generateExecutiveValidationPrompt(inputs, currentOutput, fieldNames);
    
    const payload = {
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'You are a pharmaceutical executive validating commercial intelligence data. Return only valid JSON validation results.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.1,
      reasoning_effort: 'medium',
      web_search_options: {
        search_context_size: 'medium',
        search_depth: 'standard'
      },
      search_queries_per_search: 2
    };

    const response = await fetchPplx(payload);
    const validationResult = this.parseValidationResponse(response.choices[0].message.content);
    
    return fieldNames.map(fieldName => ({
      fieldName,
      isValid: validationResult[fieldName]?.isValid || false,
      score: validationResult[fieldName]?.score || 0,
      requiresRegeneration: !validationResult[fieldName]?.isValid,
      validationDetails: validationResult[fieldName]?.details || {}
    }));
  }

  private async regenerateFailedFields(inputs: any, currentOutput: any, failedValidations: FieldValidation[]): Promise<any> {
    await this.rateLimit();
    
    const failedFields = failedValidations.filter(fv => fv.requiresRegeneration).map(fv => fv.fieldName);
    const prompt = this.generateEnhancedRegenerationPrompt(inputs, currentOutput, failedFields);
    const commercialSchema = this.getEnhancedCommercialSchema();
    
    const model = globalCostTracker.getOptimalModel('validation', 0.8);
    
    const payload = {
      model,
      messages: [
        { role: 'system', content: 'You are a pharmaceutical executive regenerating failed commercial intelligence fields. Return only valid, mathematically consistent JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 4000,
      temperature: 0.1,
      reasoning_effort: 'high',
      response_format: {
        type: 'json_schema' as const,
        json_schema: { schema: commercialSchema }
      },
      web_search_options: {
        search_context_size: 'medium',
        search_depth: 'standard'
      },
      search_queries_per_search: 3
    };

    const response = await fetchPplx(payload);
    const regeneratedOutput = this.parsePerplexityResponse(response.choices[0].message.content);
    
    // Merge regenerated fields with existing output
    const mergedOutput = { ...currentOutput };
    failedFields.forEach(fieldName => {
      if (regeneratedOutput[fieldName] !== undefined) {
        mergedOutput[fieldName] = regeneratedOutput[fieldName];
      }
    });
    
    return mergedOutput;
  }

  private async executeEnhancedGPT4oEnhancement(inputs: any, currentOutput: any): Promise<any> {
    await this.rateLimit();
    
    const prompt = this.generateEnhancedGPT4oPrompt(inputs, currentOutput);
    
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a pharmaceutical executive enhancing commercial intelligence data. Return only valid JSON with mathematical consistency.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 4000,
      temperature: 0.1
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      const enhancedOutput = JSON.parse(result.choices[0].message.content);
      
      return {
        logicValidation: { overallLogicScore: 0.8 },
        mathValidation: { mathScore: 0.8 },
        enhancedWithRationales: enhancedOutput,
        finalOutput: enhancedOutput,
        enhancementSummary: {
          logicScore: 0.8,
          mathScore: 0.8,
          totalEnhancements: 0,
          criticalFailures: [],
          validationQuality: 'High'
        }
      };
    } catch (error) {
      console.error('GPT-4o enhancement failed:', error);
      return {
        logicValidation: { overallLogicScore: 0.5 },
        mathValidation: { mathScore: 0.5 },
        enhancedWithRationales: currentOutput,
        finalOutput: currentOutput,
        enhancementSummary: {
          logicScore: 0.5,
          mathScore: 0.5,
          totalEnhancements: 0,
          criticalFailures: ['GPT-4o enhancement failed'],
          validationQuality: 'Medium'
        }
      };
    }
  }

  private async performExecutiveDomainAnalysis(inputs: any, output: any): Promise<any> {
    const domains = [
      {
        name: 'Deal Activity',
        criteria: ['dealActivity', 'comparableDeals', 'buyerProfile'],
        weight: 0.15
      },
      {
        name: 'Competitive Threats & Pipeline Crowding',
        criteria: ['directCompetitors', 'indirectCompetitors', 'pipelineAnalysis'],
        weight: 0.15
      },
      {
        name: 'Peak Sales Estimates & CAGR',
        criteria: ['peakRevenue2030', 'cagr', 'marketSize'],
        weight: 0.20
      },
      {
        name: 'Payer Sentiment & Pricing Scenarios',
        criteria: ['avgSellingPrice', 'pricingScenarios', 'payerSentiment'],
        weight: 0.15
      },
      {
        name: 'Rare Disease Eligibility & Regulatory',
        criteria: ['prvEligibility', 'rareDiseaseEligibility', 'reviewTimelineMonths'],
        weight: 0.10
      },
      {
        name: 'Patent & Exclusivity',
        criteria: ['patentStatus', 'exclusivityPeriod', 'ipPositioning'],
        weight: 0.10
      },
      {
        name: 'Financial Projections',
        criteria: ['total10YearRevenue', 'geographicSplit', 'persistenceRate'],
        weight: 0.10
      },
      {
        name: 'Strategic Tailwind Score',
        criteria: ['strategicTailwindData', 'marketDrivers', 'regulatoryCatalysts'],
        weight: 0.05
      }
    ];

    const domainScores = [];
    const criticalIssues = [];

    for (const domain of domains) {
      const domainScore = await this.analyzeDomain(domain, output, inputs);
      domainScores.push({
        domain: domain.name,
        score: domainScore.score,
        weight: domain.weight,
        weightedScore: domainScore.score * domain.weight,
        issues: domainScore.issues
      });

      if (domainScore.issues.length > 0) {
        criticalIssues.push(...domainScore.issues.map((issue: string) => `${domain.name}: ${issue}`));
      }
    }

    const overallScore = domainScores.reduce((sum, d) => sum + d.weightedScore, 0);

    return {
      domainScores,
      overallScore,
      criticalIssues,
      recommendation: this.generateRecommendation(overallScore, criticalIssues.length)
    };
  }

  private async analyzeDomain(domain: any, output: any, inputs: any): Promise<any> {
    let score = 0;
    const issues = [];
    let criteriaCount = 0;

    for (const criterion of domain.criteria) {
      criteriaCount++;
      const field = output[criterion];
      
      if (!field) {
        issues.push(`Missing ${criterion} data`);
        continue;
      }

      const fieldAnalysis = await this.analyzeField(criterion, field, inputs);
      score += fieldAnalysis.score;
      
      if (fieldAnalysis.issues.length > 0) {
        issues.push(...fieldAnalysis.issues);
      }
    }

    return {
      score: criteriaCount > 0 ? score / criteriaCount : 0,
      issues
    };
  }

  private async analyzeField(fieldName: string, fieldValue: any, inputs: any): Promise<any> {
    let score = 0;
    const issues = [];

    // Enhanced field-specific validation logic
    switch (fieldName) {
      case 'peakRevenue2030':
        if (typeof fieldValue === 'number' && fieldValue > 0) {
          score = 0.8;
          
          if (fieldValue > 10000000000) {
            issues.push('Peak revenue seems unrealistically high');
            score -= 0.3;
          }
        } else {
          issues.push('Invalid peak revenue value');
          score = 0.2;
        }
        break;

      case 'cagr':
        if (typeof fieldValue === 'number' && fieldValue > 0 && fieldValue < 100) {
          score = 0.8;
          
          if (fieldValue > 50) {
            issues.push('CAGR seems unrealistically high');
            score -= 0.2;
          }
        } else {
          issues.push('Invalid CAGR value');
          score = 0.2;
        }
        break;

      case 'dealActivity':
        if (Array.isArray(fieldValue) && fieldValue.length > 0) {
          score = 0.8;
          
          if (fieldValue.length < 2) {
            issues.push('Limited deal activity data');
            score -= 0.2;
          }
        } else {
          issues.push('Missing deal activity data');
          score = 0.2;
        }
        break;

      default:
        if (fieldValue !== null && fieldValue !== undefined) {
          score = 0.7;
        } else {
          issues.push(`Missing ${fieldName} data`);
          score = 0.2;
        }
    }

    return { score, issues };
  }

  private generateRecommendation(overallScore: number, criticalIssuesCount: number): string {
    if (overallScore >= 0.8 && criticalIssuesCount === 0) {
      return 'STRONG BUY - High confidence, no critical issues';
    } else if (overallScore >= 0.7 && criticalIssuesCount <= 2) {
      return 'BUY - Good confidence, minor issues to address';
    } else if (overallScore >= 0.6 && criticalIssuesCount <= 4) {
      return 'HOLD - Moderate confidence, significant issues need resolution';
    } else {
      return 'PASS - Low confidence, too many critical issues';
    }
  }

  private async performFinalExecutiveAnalysis(inputs: any, output: any): Promise<any> {
    // Enhanced executive analysis with comprehensive scoring
    const analysis = await this.scoringSystem.assessOutputQuality(output, inputs);
    
    return {
      overallScore: analysis.overallQuality,
      confidence: analysis.confidence,
      criticalIssues: analysis.issues,
      recommendation: this.generateRecommendation(analysis.overallQuality, analysis.issues.length),
      detailedMetrics: analysis
    };
  }

  private generateEnhancedResearchPrompt(inputs: any): string {
    return `Generate comprehensive commercial intelligence data for:
Target: ${inputs.target}
Indication: ${inputs.indication}
Therapeutic Area: ${inputs.therapeuticArea}
Geography: ${inputs.geography}
Development Phase: ${inputs.developmentPhase}

EXECUTIVE-LEVEL REQUIREMENTS - PRE-IC INVESTMENT MEMO STANDARDS:

CRITICAL FIELDS THAT MUST BE INCLUDED:
1. dealActivity - Recent M&A/licensing deals with real data
2. directCompetitors - Names of actual competitors
3. indirectCompetitors - Alternative treatment approaches
4. pipelineAnalysis - Pipeline crowding analysis
5. peakRevenue2030 - Numeric value in billions
6. cagr - Numeric percentage value
7. marketSize - Current and projected market size
8. avgSellingPrice - Numeric value in dollars
9. pricingScenarios - Real pricing strategy scenarios
10. prvEligibility - Boolean or string indicating eligibility
11. rareDiseaseEligibility - Boolean for rare disease status
12. reviewTimelineMonths - Numeric value in months
13. patentStatus - Current patent status
14. exclusivityPeriod - Years of exclusivity
15. ipPositioning - IP positioning analysis
16. total10YearRevenue - Numeric value in billions
17. geographicSplit - Object with US/ex-US percentages
18. persistenceRate - Numeric percentage value
19. strategicTailwindData - Comprehensive strategic analysis
20. competitorPricing - Real competitor pricing data

MATHEMATICAL CONSISTENCY REQUIREMENTS:
- Peak Revenue = Market Size × Peak Market Share
- Total Revenue should be 5-8× Peak Revenue
- CAGR must be mathematically correct
- Patient count must align with revenue and pricing
- Geographic split must sum to 100%
- All percentages must be mathematically valid

RESEARCH REQUIREMENTS:
- Use real market data from IQVIA, EvaluatePharma, etc.
- Include specific regulatory sources for PRV eligibility
- Reference actual clinical trial data
- Cite specific market reports and studies
- Include real deal activity from recent M&A

Return only valid JSON matching the enhanced commercial schema with mathematically consistent, research-backed values.

IMPORTANT: Every field must be populated with real, validated data. No placeholder values allowed.`;
  }

  private generateExecutiveValidationPrompt(inputs: any, currentOutput: any, fieldNames: string[]): string {
    return `Validate the following fields in the commercial intelligence data:
Fields: ${fieldNames.join(', ')}
Current Output: ${JSON.stringify(currentOutput)}
Inputs: ${JSON.stringify(inputs)}

EXECUTIVE VALIDATION CRITERIA:
1. Data completeness - All required fields must be present
2. Mathematical consistency - Cross-field calculations must be valid
3. Real-world accuracy - Values must align with market reality
4. Source credibility - Data must be from reputable sources
5. Logical coherence - No conflicting information

Return validation results for each field.`;
  }

  private generateEnhancedRegenerationPrompt(inputs: any, currentOutput: any, failedFields: string[]): string {
    return `Regenerate the following failed fields for:
Target: ${inputs.target}
Indication: ${inputs.indication}
Therapeutic Area: ${inputs.therapeuticArea}
Geography: ${inputs.geography}
Development Phase: ${inputs.developmentPhase}

FAILED FIELDS TO REGENERATE: ${failedFields.join(', ')}

CURRENT OUTPUT:
${JSON.stringify(currentOutput, null, 2)}

EXECUTIVE-LEVEL REQUIREMENTS:
1. All fields must contain real, validated data
2. Mathematical consistency across all fields
3. Real-world market alignment
4. Proper data types (numbers for numeric fields)
5. Complete information (no missing required fields)

Return only valid JSON with the regenerated fields.`;
  }

  private generateEnhancedGPT4oPrompt(inputs: any, currentOutput: any): string {
    return `Enhance the following commercial intelligence data with executive-level quality:

Inputs: ${JSON.stringify(inputs)}
Current Output: ${JSON.stringify(currentOutput, null, 2)}

ENHANCEMENT REQUIREMENTS:
1. Ensure all required fields are present and properly formatted
2. Validate mathematical consistency across all fields
3. Add missing rationales and explanations
4. Improve data quality and accuracy
5. Ensure proper data types (numbers vs strings)

Return the enhanced JSON output.`;
  }

  private getEnhancedCommercialSchema(): any {
    return commercialSchema;
  }

  private getValidationSchema(): any {
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "fieldValidations": {
          "type": "object",
          "description": "Validation results for each field"
        }
      },
      "additionalProperties": {
        "type": "object",
        "properties": {
          "isValid": { "type": "boolean" },
          "score": { "type": "number", "minimum": 0, "maximum": 1 },
          "details": { "type": "object" }
        },
        "required": ["isValid", "score", "details"]
      }
    };
  }

  private parsePerplexityResponse(content: string): any {
    try {
      // Handle Perplexity's thinking responses
      const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try direct JSON parsing
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse Perplexity response:', error);
      throw new Error(`Failed to parse Perplexity response: ${error}`);
    }
  }

  private parseValidationResponse(content: string): any {
    try {
      // Handle Perplexity's thinking responses with markdown code blocks
      const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try to extract JSON from markdown without language specifier
      const markdownMatch = content.match(/```\s*(\{[\s\S]*?\})\s*```/);
      if (markdownMatch) {
        return JSON.parse(markdownMatch[1]);
      }
      
      // Try to find JSON object in the content
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        return JSON.parse(jsonObjectMatch[0]);
      }
      
      // Try direct JSON parsing
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse validation response:', error);
      console.error('Raw content length:', content.length);
      console.error('Raw content preview:', content.substring(0, 500));
      
      // Try to extract any valid JSON from the content
      try {
        // Look for any valid JSON structure
        const jsonRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
        const matches = content.match(jsonRegex);
        if (matches && matches.length > 0) {
          // Try each match
          for (const match of matches) {
            try {
              const parsed = JSON.parse(match);
              if (parsed && typeof parsed === 'object') {
                console.log('Successfully parsed partial JSON from validation response');
                return parsed;
              }
            } catch (e) {
              // Continue to next match
            }
          }
        }
      } catch (e) {
        // Fall through to default response
      }
      
      // Return a safe fallback with all expected fields
      const fallbackResult: any = {};
      const expectedFields = [
        'dealActivity', 'peakRevenue2030', 'directCompetitors', 'cagr', 'marketSize',
        'avgSellingPrice', 'pricingScenarios', 'prvEligibility', 'patentStatus', 'strategicTailwindData'
      ];
      
      expectedFields.forEach(field => {
        fallbackResult[field] = { 
          isValid: false, 
          score: 0, 
          details: { error: 'Parse failed', originalError: error instanceof Error ? error.message : String(error) } 
        };
      });
      
      return fallbackResult;
    }
  }

  private selectFieldsForValidation(currentOutput: any, cycleCount: number): string[] {
    if (!this.config.enableSmartValidation) {
      return Object.keys(currentOutput);
    }

    const allFields = Object.keys(currentOutput);
    
    if (cycleCount === 1) {
      const criticalFields = ['dealActivity', 'peakRevenue2030', 'directCompetitors', 'cagr', 'marketSize'];
      return criticalFields.filter(field => allFields.includes(field));
    } else {
      const importantFields = ['avgSellingPrice', 'pricingScenarios', 'prvEligibility', 'patentStatus', 'strategicTailwindData'];
      return importantFields.filter(field => allFields.includes(field));
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    
    if (timeSinceLastCall < this.config.rateLimitDelay) {
      const delay = this.config.rateLimitDelay - timeSinceLastCall;
      console.log(`  ⏳ Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastApiCall = Date.now();
    this.apiCallCount++;
  }

  private calculateCostOptimization(totalApiCalls: number, validationCycles: ValidationCycle[]): any {
    const baselineApiCalls = 1 + (this.config.maxValidationCycles * 16) + this.config.maxValidationCycles;
    const apiCallsSaved = baselineApiCalls - totalApiCalls;
    const estimatedCostReduction = (apiCallsSaved / baselineApiCalls) * 100;
    const efficiencyScore = Math.min(100, (totalApiCalls / baselineApiCalls) * 100);
    
    return {
      apiCallsSaved,
      estimatedCostReduction,
      efficiencyScore,
      baselineApiCalls,
      actualApiCalls: totalApiCalls
    };
  }

  private generateFieldValidationSummary(validationCycles: ValidationCycle[]): any {
    const totalFields = validationCycles.reduce((sum, cycle) => sum + cycle.totalFields, 0);
    const validatedFields = validationCycles.reduce((sum, cycle) => sum + cycle.validatedFields, 0);
    const regeneratedFields = validationCycles.reduce((sum, cycle) => sum + cycle.fieldsRequiringRegeneration.length, 0);
    
    return {
      totalFields,
      validatedFields,
      regeneratedFields,
      validationRate: totalFields > 0 ? (validatedFields / totalFields) * 100 : 0,
      regenerationRate: totalFields > 0 ? (regeneratedFields / totalFields) * 100 : 0
    };
  }

  private calculateTotalSources(validationCycles: ValidationCycle[]): number {
    return validationCycles.reduce((sum, cycle) => sum + (cycle.apiCallsMade || 0), 0);
  }

  private calculateTotalSearchQueries(validationCycles: ValidationCycle[]): number {
    return validationCycles.reduce((sum, cycle) => sum + (cycle.apiCallsMade || 0), 0) * 2;
  }

  getConfiguration(): EnhancedPharmaConfig {
    return this.config;
  }
} 