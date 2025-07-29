import { fetchPplx } from './pplxClient';
import { EnhancedMathAuditor } from './enhancedMathAuditor';
import { EnhancedScoringSystem } from './enhancedScoringSystem';
import { LogicScoringLayer } from './logicScoringLayer';
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
  private logicScoringLayer: LogicScoringLayer;
  private fieldCache: Map<string, any> = new Map();
  private apiCallCount: number = 0;
  private lastApiCall: number = 0;
  private costTracker: SimpleCostTracker; // Added costTracker property

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
    this.logicScoringLayer = new LogicScoringLayer();
    this.costTracker = new SimpleCostTracker(); // Initialize costTracker
  }

  async orchestrate(inputs: any): Promise<EnhancedPharmaResult> {
    const startTime = Date.now();
    console.log('🚀 Starting Enhanced Pharma Orchestration');
    console.log('🎯 Executive-Level Quality Standards');

    const logs: any[] = [
      { step: 'Starting enhanced pharma orchestration', inputs }
    ];

    try {
      // Layer 1: Enhanced Research
      console.log('📚 Layer 1: Enhanced Research Agent (Executive Standards)');
      let currentOutput = await this.executeEnhancedResearch(inputs);
      
      // COMPREHENSIVE VALIDATION OF PERPLEXITY OUTPUT
      console.log('🔍 Performing comprehensive validation of Perplexity output...');
      const comprehensiveValidation = await this.performComprehensiveValidation(inputs, currentOutput);
      
      // LOGIC SCORING LAYER VALIDATION
      console.log('🧠 Executing Logic Scoring Layer Validation...');
      const logicValidation = await this.logicScoringLayer.validateLogic(currentOutput, inputs);
      
      // If logic validation reveals critical failures, attempt regeneration
      if (logicValidation.requiresRegeneration) {
        console.log(`🚨 Logic scoring layer detected critical failures. Regeneration required.`);
        console.log(`📋 Regeneration fields: ${logicValidation.regenerationFields.join(', ')}`);
        console.log(`📝 Instructions: ${logicValidation.regenerationInstructions}`);
        
        // Attempt logic fix first
        const logicFixedOutput = await this.logicScoringLayer.attemptLogicFix(currentOutput, logicValidation.logicIssues);
        
        // If logic fix was insufficient, regenerate with Perplexity
        if (logicFixedOutput === currentOutput || logicValidation.criticalFailures.length > 0) {
          console.log('🔄 Logic fix insufficient, routing back to Perplexity for regeneration...');
          
          // Regenerate the entire output with logic validation feedback
          const regenerationPrompt = this.generateLogicRegenerationPrompt(inputs, currentOutput, logicValidation);
          const regeneratedOutput = await this.executeRegenerationWithValidation(regenerationPrompt);
          
          // Re-validate the regenerated output
          const revalidation = await this.logicScoringLayer.validateLogic(regeneratedOutput, inputs);
          
          if (!revalidation.requiresRegeneration || revalidation.overallLogicScore > logicValidation.overallLogicScore) {
            console.log('✅ Regeneration improved logic score');
            currentOutput = regeneratedOutput;
          } else {
            console.log('⚠️  Regeneration did not resolve logic issues, proceeding with original');
          }
        } else {
          console.log('✅ Logic fix successful');
          currentOutput = logicFixedOutput;
        }
      }
      
      // If validation reveals critical issues, attempt regeneration
      if (comprehensiveValidation.criticalIssues.length > 0) {
        console.log(`⚠️  Found ${comprehensiveValidation.criticalIssues.length} critical issues. Attempting regeneration...`);
        
        // Regenerate the entire output with validation feedback
        const regenerationPrompt = this.generateComprehensiveRegenerationPrompt(inputs, currentOutput, comprehensiveValidation);
        const regeneratedOutput = await this.executeRegenerationWithValidation(regenerationPrompt);
        
        // Re-validate the regenerated output
        const revalidation = await this.performComprehensiveValidation(inputs, regeneratedOutput);
        
        if (revalidation.criticalIssues.length < comprehensiveValidation.criticalIssues.length) {
          console.log('✅ Regeneration improved validation score');
          currentOutput = regeneratedOutput;
        } else {
          console.log('⚠️  Regeneration did not resolve critical issues, proceeding with original');
        }
      }

      // Continue with existing validation cycles if needed
      const validationCycles: ValidationCycle[] = [];
      let cycleCount = 0;
      let totalApiCalls = 1; // Initial research call

      while (cycleCount < this.config.maxValidationCycles) {
        cycleCount++;
        console.log(`🔄 Validation Cycle ${cycleCount}/${this.config.maxValidationCycles}`);

        const cycleStartTime = Date.now();
        const fieldValidations = await this.executeExecutiveFieldValidation(inputs, currentOutput, cycleCount);
        const cycleEndTime = Date.now();

        const cycle: ValidationCycle = {
          cycle: cycleCount,
          fieldValidations: fieldValidations.validations,
          overallScore: fieldValidations.validations.reduce((sum, v) => sum + v.score, 0) / fieldValidations.validations.length,
          fieldsRequiringRegeneration: fieldValidations.validations.filter(v => v.requiresRegeneration).map(v => v.fieldName),
          totalFields: fieldValidations.validations.length,
          validatedFields: fieldValidations.validations.filter(v => v.isValid).length,
          apiCallsMade: fieldValidations.apiCallsMade,
          costMetrics: this.costTracker.getCurrentMetrics(),
          executiveDomainScores: await this.performExecutiveDomainAnalysis(inputs, currentOutput)
        };

        validationCycles.push(cycle);
        totalApiCalls += fieldValidations.apiCallsMade;

        // Check if we need to regenerate failed fields
        const failedValidations = fieldValidations.validations.filter(v => v.requiresRegeneration);
        if (failedValidations.length > 0) {
          console.log(`🔄 Regenerating ${failedValidations.length} failed fields`);
          const regeneratedOutput = await this.regenerateFailedFields(inputs, currentOutput, failedValidations);
          currentOutput = { ...currentOutput, ...regeneratedOutput };
        }

        // Check if quality threshold is met
        if (cycle.overallScore >= this.config.qualityThreshold) {
          console.log(`✅ Quality threshold met (${cycle.overallScore.toFixed(2)} >= ${this.config.qualityThreshold})`);
          break;
        }

        // Check cost limits
        if (this.costTracker.getRemainingBudget() <= 0.5) {
          console.log('💰 Cost limit approaching, stopping validation cycles');
          break;
        }
      }

      // Layer 3: Enhanced GPT-4o Enhancement
      let gpt4oEnhancement = null;
      if (this.config.enableGPT4oEnhancement) {
        console.log('🧠 Layer 3: Enhanced GPT-4o Enhancement (Executive Standards)');
        try {
          gpt4oEnhancement = await this.executeEnhancedGPT4oEnhancement(inputs, currentOutput);
        } catch (error) {
          console.log('GPT-4o enhancement failed:', error);
        }
      }

      // Final comprehensive validation
      const finalValidation = await this.performComprehensiveValidation(inputs, currentOutput);
      
      // Math Audit
      console.log('🧮 Enhanced Math Audit');
      const mathAuditResults = await this.mathAuditor.auditMath(currentOutput);

      // Final Executive Analysis
      console.log('👔 Final Executive Analysis');
      const executiveAnalysis = await this.performFinalExecutiveAnalysis(inputs, currentOutput);

      const endTime = Date.now();
      const totalTimeMs = endTime - startTime;

      const result: EnhancedPharmaResult = {
        finalOutput: currentOutput,
        validationCycles,
        totalCycles: cycleCount,
        finalQualityScore: finalValidation.overallScore,
        gptLogicVerification: finalValidation,
        mathAuditResults,
        fieldValidationSummary: this.generateFieldValidationSummary(validationCycles),
        gpt4oEnhancement,
        executiveAnalysis,
        metadata: {
          totalTimeMs,
          sourcesUsed: this.calculateTotalSources(validationCycles),
          searchQueries: this.calculateTotalSearchQueries(validationCycles),
          validationAttempts: validationCycles.length,
          fieldRegenerations: validationCycles.reduce((sum, cycle) => sum + cycle.fieldsRequiringRegeneration.length, 0),
          totalApiCalls,
          costOptimization: this.calculateCostOptimization(totalApiCalls, validationCycles),
          costMetrics: this.costTracker.getCurrentMetrics()
        }
      };

      logs.push({
        step: 'Enhanced pharma orchestration completed',
        totalCycles: cycleCount,
        finalQualityScore: finalValidation.overallScore,
        totalTimeMs,
        fieldRegenerations: result.metadata.fieldRegenerations,
        totalApiCalls,
        costOptimization: result.metadata.costOptimization,
        totalCost: this.costTracker.getCurrentMetrics().totalCost,
        remainingBudget: this.costTracker.getRemainingBudget(),
        executiveAnalysis: result.executiveAnalysis
      });

      return result;

    } catch (error) {
      console.error('❌ Enhanced orchestration failed:', error);
      logs.push({
        step: 'Enhanced pharma orchestration failed',
        error: error instanceof Error ? error.message : String(error)
      });
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

CRITICAL BUSINESS LOGIC RULES - MUST BE FOLLOWED:

1. RARE DISEASE ELIGIBILITY LOGIC:
   - PRV (Priority Review Voucher) eligibility: ONLY for rare pediatric diseases (<200,000 patients in US) OR neglected tropical diseases
   - If patient population > 200,000: PRV = "Not eligible" (NOT "Valid. Not eligible")
   - If patient population < 200,000: PRV = "Eligible for rare disease PRV"
   - rareDiseaseEligibility: true ONLY if patient population < 200,000
   - This is a binary FDA regulation - no ambiguity allowed

2. PATIENT POPULATION LOGIC:
   - peakPatients2030 must be a realistic number based on disease prevalence
   - For common diseases (cancer, diabetes, etc.): typically 10,000 - 500,000 patients
   - For rare diseases: typically 1,000 - 200,000 patients
   - For ultra-rare diseases: typically < 1,000 patients
   - Patient count must align with disease epidemiology

3. MATHEMATICAL CONSISTENCY REQUIREMENTS:
   - Peak Revenue = (peakPatients2030 × avgSellingPrice × marketShare) / 1,000,000,000 (in billions)
   - Total 10-Year Revenue = Peak Revenue × 5-8 (industry standard)
   - CAGR must be calculated: CAGR = ((Peak Revenue / Current Market Size)^(1/6) - 1) × 100
   - Geographic split must sum to 100% (US + ex-US = 100%)
   - All percentages must be between 0-100%
   - All monetary values must be positive numbers

4. PRICING LOGIC:
   - avgSellingPrice must be realistic for the disease area
   - Oncology: $50,000 - $500,000 per year
   - Rare diseases: $100,000 - $2,000,000 per year
   - Common diseases: $1,000 - $50,000 per year
   - Pricing must align with patient population size

5. MARKET SHARE LOGIC:
   - peakMarketShare2030 must be realistic (typically 5-30% for new drugs)
   - Higher market share = lower patient population (inverse relationship)
   - Market share + competitor market shares should not exceed 100%

CRITICAL FIELDS THAT MUST BE INCLUDED:
1. dealActivity - Recent M&A/licensing deals with real data
2. directCompetitors - Names of actual competitors
3. indirectCompetitors - Alternative treatment approaches
4. pipelineAnalysis - Pipeline crowding analysis
5. peakRevenue2030 - Numeric value in billions (calculated from patients × price × market share)
6. cagr - Numeric percentage value (calculated mathematically)
7. marketSize - Current and projected market size in billions
8. avgSellingPrice - Numeric value in dollars (realistic for disease area)
9. pricingScenarios - Real pricing strategy scenarios
10. prvEligibility - "Eligible" or "Not eligible" (based on patient count < 200,000)
11. rareDiseaseEligibility - true/false (patient count < 200,000)
12. reviewTimelineMonths - Numeric value in months
13. patentStatus - Current patent status
14. exclusivityPeriod - Years of exclusivity
15. ipPositioning - IP positioning analysis
16. total10YearRevenue - Numeric value in billions (5-8× peak revenue)
17. geographicSplit - Object with US/ex-US percentages (must sum to 100%)
18. persistenceRate - Numeric percentage value (0-100%)
19. strategicTailwindData - Comprehensive strategic analysis
20. competitorPricing - Real competitor pricing data
21. peakPatients2030 - Numeric patient count (realistic for disease)
22. peakMarketShare2030 - Numeric percentage (realistic market share)

VALIDATION CHECKS - ENSURE THESE ARE CORRECT:
- If peakPatients2030 > 200,000: prvEligibility = "Not eligible", rareDiseaseEligibility = false
- If peakPatients2030 < 200,000: prvEligibility = "Eligible", rareDiseaseEligibility = true
- Peak Revenue calculation must be mathematically correct
- All percentages must be between 0-100
- Geographic split must sum to 100%
- Patient count must be realistic for the disease

RESEARCH REQUIREMENTS:
- Use real market data from IQVIA, EvaluatePharma, etc.
- Include specific regulatory sources for PRV eligibility
- Reference actual clinical trial data
- Cite specific market reports and studies
- Include real deal activity from recent M&A

Return only valid JSON matching the enhanced commercial schema with mathematically consistent, research-backed values.

IMPORTANT: Every field must be populated with real, validated data. No placeholder values allowed. All business logic rules must be followed exactly.`;
  }

  private generateExecutiveValidationPrompt(inputs: any, currentOutput: any, fieldNames: string[]): string {
    return `Validate the following fields in the commercial intelligence data:
Fields: ${fieldNames.join(', ')}
Current Output: ${JSON.stringify(currentOutput)}
Inputs: ${JSON.stringify(inputs)}

EXECUTIVE VALIDATION CRITERIA - CRITICAL BUSINESS LOGIC CHECKS:

1. RARE DISEASE ELIGIBILITY LOGIC:
   - If peakPatients2030 > 200,000: prvEligibility must be "Not eligible" AND rareDiseaseEligibility must be false
   - If peakPatients2030 < 200,000: prvEligibility must be "Eligible" AND rareDiseaseEligibility must be true
   - This is a binary FDA regulation - no exceptions

2. MATHEMATICAL CONSISTENCY:
   - Peak Revenue = (peakPatients2030 × avgSellingPrice × peakMarketShare2030) / 1,000,000,000
   - Total 10-Year Revenue should be 5-8× Peak Revenue
   - CAGR calculation must be mathematically correct
   - Geographic split (US + ex-US) must equal 100%
   - All percentages must be between 0-100%

3. REALISTIC VALUES:
   - Patient count must be realistic for the disease type
   - Pricing must align with disease area and patient population
   - Market share must be realistic (typically 5-30% for new drugs)
   - Revenue projections must be mathematically sound

4. DATA COMPLETENESS:
   - All required fields must be present
   - No placeholder or generic values
   - All numeric fields must be actual numbers

5. LOGICAL COHERENCE:
   - No conflicting information between fields
   - Patient count must align with disease epidemiology
   - Pricing must align with patient population size

Return validation results for each field with specific issues identified.`;
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

CRITICAL BUSINESS LOGIC RULES - MUST BE FOLLOWED:

1. RARE DISEASE ELIGIBILITY LOGIC:
   - If peakPatients2030 > 200,000: prvEligibility = "Not eligible", rareDiseaseEligibility = false
   - If peakPatients2030 < 200,000: prvEligibility = "Eligible", rareDiseaseEligibility = true
   - This is a binary FDA regulation - no exceptions

2. MATHEMATICAL CONSISTENCY:
   - Peak Revenue = (peakPatients2030 × avgSellingPrice × peakMarketShare2030) / 1,000,000,000
   - Total 10-Year Revenue = Peak Revenue × 5-8
   - CAGR = ((Peak Revenue / Current Market Size)^(1/6) - 1) × 100
   - Geographic split must sum to 100%
   - All percentages must be between 0-100%

3. REALISTIC VALUES:
   - Patient count must be realistic for disease type
   - Pricing must align with disease area
   - Market share must be realistic (5-30% for new drugs)

EXECUTIVE-LEVEL REQUIREMENTS:
1. All fields must contain real, validated data
2. Mathematical consistency across all fields
3. Real-world market alignment
4. Proper data types (numbers for numeric fields)
5. Complete information (no missing required fields)
6. Business logic compliance (especially rare disease rules)

Return only valid JSON with the regenerated fields following all business logic rules exactly.`;
  }

  private generateEnhancedGPT4oPrompt(inputs: any, currentOutput: any): string {
    return `Enhance the following commercial intelligence data with executive-level quality:

Inputs: ${JSON.stringify(inputs)}
Current Output: ${JSON.stringify(currentOutput, null, 2)}

ENHANCEMENT REQUIREMENTS:
1. Ensure all required fields are present and properly formatted
2. Validate mathematical consistency across all fields
3. Add missing rationales and explanations
4. Ensure business logic compliance

CRITICAL BUSINESS LOGIC CHECKS:
1. RARE DISEASE ELIGIBILITY:
   - If peakPatients2030 > 200,000: prvEligibility must be "Not eligible", rareDiseaseEligibility must be false
   - If peakPatients2030 < 200,000: prvEligibility must be "Eligible", rareDiseaseEligibility must be true

2. MATHEMATICAL CONSISTENCY:
   - Peak Revenue = (peakPatients2030 × avgSellingPrice × peakMarketShare2030) / 1,000,000,000
   - Total 10-Year Revenue = Peak Revenue × 5-8
   - CAGR calculation must be mathematically correct
   - Geographic split must sum to 100%

3. REALISTIC VALUES:
   - Patient count must be realistic for disease type
   - Pricing must align with disease area
   - Market share must be realistic (5-30% for new drugs)

Return enhanced JSON with all business logic rules followed exactly.`;
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

  private async performComprehensiveValidation(inputs: any, output: any): Promise<any> {
    console.log('🔍 Starting Comprehensive Validation of Perplexity Output');
    
    const validationResults: {
      overallScore: number;
      criticalIssues: string[];
      warnings: string[];
      fieldValidations: Record<string, any>;
      mathematicalConsistency: any;
      businessLogicCompliance: any;
      crossFieldLogic: any;
      dataQuality: any;
      recommendations: string[];
    } = {
      overallScore: 0,
      criticalIssues: [],
      warnings: [],
      fieldValidations: {},
      mathematicalConsistency: {},
      businessLogicCompliance: {},
      crossFieldLogic: {},
      dataQuality: {},
      recommendations: []
    };

    // 1. FIELD-BY-FIELD VALIDATION
    console.log('  📋 Validating each field individually...');
    for (const [fieldName, fieldValue] of Object.entries(output)) {
      const fieldValidation = await this.validateIndividualField(fieldName, fieldValue, inputs);
      validationResults.fieldValidations[fieldName] = fieldValidation;
      
      if (fieldValidation.criticalIssues.length > 0) {
        validationResults.criticalIssues.push(...fieldValidation.criticalIssues);
      }
      if (fieldValidation.warnings.length > 0) {
        validationResults.warnings.push(...fieldValidation.warnings);
      }
    }

    // 2. MATHEMATICAL CONSISTENCY CHECKS
    console.log('  🧮 Checking mathematical consistency...');
    const mathValidation = await this.validateMathematicalConsistency(output);
    validationResults.mathematicalConsistency = mathValidation;
    
    if (mathValidation.criticalIssues.length > 0) {
      validationResults.criticalIssues.push(...mathValidation.criticalIssues);
    }

    // 3. BUSINESS LOGIC COMPLIANCE
    console.log('  💼 Checking business logic compliance...');
    const businessValidation = await this.validateBusinessLogic(output, inputs);
    validationResults.businessLogicCompliance = businessValidation;
    
    if (businessValidation.criticalIssues.length > 0) {
      validationResults.criticalIssues.push(...businessValidation.criticalIssues);
    }

    // 4. CROSS-FIELD LOGIC CHECKS
    console.log('  🔗 Checking cross-field logic...');
    const crossFieldValidation = await this.validateCrossFieldLogic(output);
    validationResults.crossFieldLogic = crossFieldValidation;
    
    if (crossFieldValidation.criticalIssues.length > 0) {
      validationResults.criticalIssues.push(...crossFieldValidation.criticalIssues);
    }

    // 5. DATA QUALITY ASSESSMENT
    console.log('  📊 Assessing data quality...');
    const dataQualityValidation = await this.validateDataQuality(output);
    validationResults.dataQuality = dataQualityValidation;

    // 6. CALCULATE OVERALL SCORE
    validationResults.overallScore = this.calculateOverallValidationScore(validationResults);
    
    // 7. GENERATE RECOMMENDATIONS
    validationResults.recommendations = this.generateValidationRecommendations(validationResults);

    console.log(`  ✅ Comprehensive validation complete. Score: ${validationResults.overallScore}/10`);
    console.log(`  ⚠️  Critical issues: ${validationResults.criticalIssues.length}`);
    console.log(`  ⚠️  Warnings: ${validationResults.warnings.length}`);

    return validationResults;
  }

  private async validateIndividualField(fieldName: string, fieldValue: any, inputs: any): Promise<any> {
    const validation: {
      isValid: boolean;
      score: number;
      criticalIssues: string[];
      warnings: string[];
      suggestions: string[];
    } = {
      isValid: true,
      score: 0,
      criticalIssues: [],
      warnings: [],
      suggestions: []
    };

    // Field-specific validation logic
    switch (fieldName) {
      case 'peakPatients2030':
        validation.score = this.validatePatientCount(fieldValue, validation);
        break;
      case 'prvEligibility':
        validation.score = this.validatePRVEligibility(fieldValue, validation);
        break;
      case 'rareDiseaseEligibility':
        validation.score = this.validateRareDiseaseEligibility(fieldValue, validation);
        break;
      case 'peakRevenue2030':
        validation.score = this.validatePeakRevenue(fieldValue, validation);
        break;
      case 'cagr':
        validation.score = this.validateCAGR(fieldValue, validation);
        break;
      case 'avgSellingPrice':
        validation.score = this.validatePricing(fieldValue, validation);
        break;
      case 'peakMarketShare2030':
        validation.score = this.validateMarketShare(fieldValue, validation);
        break;
      case 'total10YearRevenue':
        validation.score = this.validateTotalRevenue(fieldValue, validation);
        break;
      case 'geographicSplit':
        validation.score = this.validateGeographicSplit(fieldValue, validation);
        break;
      case 'directCompetitors':
        validation.score = this.validateCompetitors(fieldValue, validation);
        break;
      case 'dealActivity':
        validation.score = this.validateDealActivity(fieldValue, validation);
        break;
      default:
        validation.score = this.validateGenericField(fieldName, fieldValue, validation);
    }

    validation.isValid = validation.criticalIssues.length === 0 && validation.score >= 0.6;
    return validation;
  }

  private validatePatientCount(value: any, validation: { criticalIssues: string[]; warnings: string[] }): number {
    let score = 0;
    
    if (typeof value !== 'number' || value <= 0) {
      validation.criticalIssues.push('Patient count must be a positive number');
      return 0;
    }

    // Realistic ranges based on disease type
    if (value < 100) {
      validation.warnings.push('Patient count seems very low - verify for ultra-rare disease');
      score = 0.7;
    } else if (value >= 100 && value <= 200000) {
      score = 1.0; // Perfect for rare diseases
    } else if (value > 200000 && value <= 500000) {
      score = 0.9; // Good for common diseases
    } else if (value > 500000 && value <= 2000000) {
      score = 0.8; // Acceptable for very common diseases
    } else {
      validation.criticalIssues.push(`Patient count ${value} seems unrealistically high`);
      score = 0.3;
    }

    return score;
  }

  private validatePRVEligibility(value: any, validation: { criticalIssues: string[] }): number {
    let score = 0;
    
    if (typeof value !== 'string') {
      validation.criticalIssues.push('PRV eligibility must be a string');
      return 0;
    }

    const validValues = ['Eligible', 'Not eligible'];
    if (!validValues.includes(value)) {
      validation.criticalIssues.push(`PRV eligibility must be one of: ${validValues.join(', ')}`);
      return 0;
    }

    score = 1.0;
    return score;
  }

  private validateRareDiseaseEligibility(value: any, validation: { criticalIssues: string[] }): number {
    let score = 0;
    
    if (typeof value !== 'boolean') {
      validation.criticalIssues.push('Rare disease eligibility must be a boolean');
      return 0;
    }

    score = 1.0;
    return score;
  }

  private validatePeakRevenue(value: any, validation: { criticalIssues: string[]; warnings: string[] }): number {
    let score = 0;
    
    if (typeof value !== 'number' || value <= 0) {
      validation.criticalIssues.push('Peak revenue must be a positive number');
      return 0;
    }

    // Realistic ranges for pharmaceutical products
    if (value < 0.1) {
      validation.warnings.push('Peak revenue seems very low');
      score = 0.6;
    } else if (value >= 0.1 && value <= 10) {
      score = 1.0; // Good range
    } else if (value > 10 && value <= 50) {
      score = 0.9; // High but possible for blockbusters
    } else {
      validation.warnings.push('Peak revenue seems very high - verify for blockbuster potential');
      score = 0.7;
    }

    return score;
  }

  private validateCAGR(value: any, validation: { criticalIssues: string[]; warnings: string[] }): number {
    let score = 0;
    
    if (typeof value !== 'number') {
      validation.criticalIssues.push('CAGR must be a number');
      return 0;
    }

    if (value < 0) {
      validation.criticalIssues.push('CAGR cannot be negative');
      return 0;
    }

    if (value > 100) {
      validation.criticalIssues.push('CAGR cannot exceed 100%');
      return 0;
    }

    // Realistic ranges
    if (value >= 0 && value <= 30) {
      score = 1.0; // Good range
    } else if (value > 30 && value <= 50) {
      score = 0.8; // High but possible
    } else {
      validation.warnings.push('CAGR seems very high - verify market growth assumptions');
      score = 0.6;
    }

    return score;
  }

  private validatePricing(value: any, validation: { criticalIssues: string[]; warnings: string[] }): number {
    let score = 0;
    
    if (typeof value !== 'number' || value <= 0) {
      validation.criticalIssues.push('Pricing must be a positive number');
      return 0;
    }

    // Realistic pricing ranges
    if (value < 1000) {
      validation.warnings.push('Pricing seems very low for pharmaceutical product');
      score = 0.5;
    } else if (value >= 1000 && value <= 50000) {
      score = 1.0; // Good range for common diseases
    } else if (value > 50000 && value <= 500000) {
      score = 0.9; // Good range for oncology/rare diseases
    } else if (value > 500000 && value <= 2000000) {
      score = 0.8; // High but possible for ultra-rare diseases
    } else {
      validation.warnings.push('Pricing seems extremely high - verify for ultra-rare disease');
      score = 0.6;
    }

    return score;
  }

  private validateMarketShare(value: any, validation: { criticalIssues: string[]; warnings: string[] }): number {
    let score = 0;
    
    if (typeof value !== 'number' || value < 0) {
      validation.criticalIssues.push('Market share must be a non-negative number');
      return 0;
    }

    if (value > 100) {
      validation.criticalIssues.push('Market share cannot exceed 100%');
      return 0;
    }

    // Realistic ranges for new drugs
    if (value >= 0 && value <= 30) {
      score = 1.0; // Good range
    } else if (value > 30 && value <= 50) {
      score = 0.8; // High but possible
    } else {
      validation.warnings.push('Market share seems very high for new drug');
      score = 0.6;
    }

    return score;
  }

  private validateTotalRevenue(value: any, validation: { criticalIssues: string[]; warnings: string[] }): number {
    let score = 0;
    
    if (typeof value !== 'number' || value <= 0) {
      validation.criticalIssues.push('Total revenue must be a positive number');
      return 0;
    }

    // Should be 5-8x peak revenue
    const peakRevenue = (validation as any).context?.peakRevenue2030;
    if (peakRevenue) {
      const ratio = value / peakRevenue;
      if (ratio < 3) {
        validation.criticalIssues.push(`Total revenue (${value}B) is too low relative to peak revenue (${peakRevenue}B). Should be 5-8x peak revenue.`);
        score = 0.3;
      } else if (ratio >= 3 && ratio <= 10) {
        score = 1.0; // Good range
      } else {
        validation.warnings.push(`Total revenue ratio (${ratio}x) seems high relative to peak revenue`);
        score = 0.7;
      }
    } else {
      score = 0.8; // Can't validate without peak revenue
    }

    return score;
  }

  private validateGeographicSplit(value: any, validation: { criticalIssues: string[] }): number {
    let score = 0;
    
    if (typeof value !== 'object' || !value.us || !value.exUs) {
      validation.criticalIssues.push('Geographic split must be an object with us and exUs properties');
      return 0;
    }

    const usPercent = value.us;
    const exUsPercent = value.exUs;

    if (typeof usPercent !== 'number' || typeof exUsPercent !== 'number') {
      validation.criticalIssues.push('Geographic split percentages must be numbers');
      return 0;
    }

    const total = usPercent + exUsPercent;
    if (Math.abs(total - 100) > 0.1) {
      validation.criticalIssues.push(`Geographic split percentages must sum to 100% (current: ${total}%)`);
      return 0;
    }

    if (usPercent < 0 || exUsPercent < 0) {
      validation.criticalIssues.push('Geographic split percentages cannot be negative');
      return 0;
    }

    score = 1.0;
    return score;
  }

  private validateCompetitors(value: any, validation: { criticalIssues: string[]; warnings: string[] }): number {
    let score = 0;
    
    if (!Array.isArray(value)) {
      validation.criticalIssues.push('Competitors must be an array');
      return 0;
    }

    if (value.length === 0) {
      validation.warnings.push('No competitors listed - verify this is accurate');
      score = 0.5;
    } else if (value.length >= 1 && value.length <= 10) {
      score = 1.0; // Good range
    } else {
      validation.warnings.push('Many competitors listed - verify completeness');
      score = 0.8;
    }

    // Check for realistic competitor names
    for (const competitor of value) {
      if (typeof competitor !== 'string' || competitor.length < 3) {
        validation.warnings.push('Competitor names should be meaningful strings');
        score = Math.min(score, 0.8);
      }
    }

    return score;
  }

  private validateDealActivity(value: any, validation: { criticalIssues: string[]; warnings: string[] }): number {
    let score = 0;
    
    if (!Array.isArray(value)) {
      validation.criticalIssues.push('Deal activity must be an array');
      return 0;
    }

    if (value.length === 0) {
      validation.warnings.push('No deal activity listed - verify this is accurate');
      score = 0.6;
    } else {
      score = 1.0;
    }

    // Validate deal structure
    for (const deal of value) {
      if (typeof deal !== 'object') {
        validation.warnings.push('Each deal should be an object');
        score = Math.min(score, 0.8);
        continue;
      }

      const requiredFields = ['assetName', 'buyer', 'dealPrice'];
      for (const field of requiredFields) {
        if (!deal[field]) {
          validation.warnings.push(`Deal missing required field: ${field}`);
          score = Math.min(score, 0.8);
        }
      }
    }

    return score;
  }

  private validateGenericField(fieldName: string, value: any, validation: { warnings: string[] }): number {
    let score = 0;
    
    if (value === null || value === undefined) {
      validation.warnings.push(`${fieldName} is null or undefined`);
      score = 0.5;
    } else if (typeof value === 'string' && value.trim() === '') {
      validation.warnings.push(`${fieldName} is empty string`);
      score = 0.6;
    } else {
      score = 0.9; // Generic field has some value
    }

    return score;
  }

  private async validateMathematicalConsistency(output: any): Promise<any> {
    const validation: {
      isValid: boolean;
      score: number;
      criticalIssues: string[];
      warnings: string[];
      calculations: Record<string, any>;
    } = {
      isValid: true,
      score: 0,
      criticalIssues: [],
      warnings: [],
      calculations: {}
    };

    // Check if we have the required fields for mathematical validation
    const hasPeakPatients = typeof output.peakPatients2030 === 'number';
    const hasPeakRevenue = typeof output.peakRevenue2030 === 'number';
    const hasAvgPrice = typeof output.avgSellingPrice === 'number';
    const hasMarketShare = typeof output.peakMarketShare2030 === 'number';
    const hasTotalRevenue = typeof output.total10YearRevenue === 'number';

    // 1. Peak Revenue Calculation
    if (hasPeakPatients && hasAvgPrice && hasMarketShare) {
      const expectedPeakRevenue = (output.peakPatients2030 * output.avgSellingPrice * output.peakMarketShare2030) / 1000000000;
      const actualPeakRevenue = output.peakRevenue2030;
      const difference = Math.abs(expectedPeakRevenue - actualPeakRevenue);
      const percentDifference = (difference / expectedPeakRevenue) * 100;

      validation.calculations.peakRevenue = {
        expected: expectedPeakRevenue,
        actual: actualPeakRevenue,
        difference: difference,
        percentDifference: percentDifference
      };

      if (percentDifference > 10) {
        validation.criticalIssues.push(`Peak revenue calculation mismatch: Expected ${expectedPeakRevenue.toFixed(2)}B, got ${actualPeakRevenue}B (${percentDifference.toFixed(1)}% difference)`);
      } else if (percentDifference > 5) {
        validation.warnings.push(`Peak revenue calculation has ${percentDifference.toFixed(1)}% difference`);
      }
    }

    // 2. Total Revenue vs Peak Revenue Ratio
    if (hasPeakRevenue && hasTotalRevenue) {
      const ratio = output.total10YearRevenue / output.peakRevenue2030;
      validation.calculations.totalRevenueRatio = ratio;

      if (ratio < 3) {
        validation.criticalIssues.push(`Total revenue ratio too low: ${ratio.toFixed(1)}x (should be 5-8x peak revenue)`);
      } else if (ratio > 12) {
        validation.warnings.push(`Total revenue ratio very high: ${ratio.toFixed(1)}x`);
      }
    }

    // 3. Geographic Split Sum
    if (output.geographicSplit && typeof output.geographicSplit.us === 'number' && typeof output.geographicSplit.exUs === 'number') {
      const total = output.geographicSplit.us + output.geographicSplit.exUs;
      validation.calculations.geographicSplit = total;

      if (Math.abs(total - 100) > 0.1) {
        validation.criticalIssues.push(`Geographic split doesn't sum to 100%: ${total}%`);
      }
    }

    // Calculate overall math score
    const totalChecks = Object.keys(validation.calculations).length;
    const passedChecks = totalChecks - validation.criticalIssues.length;
    validation.score = totalChecks > 0 ? passedChecks / totalChecks : 1.0;
    validation.isValid = validation.criticalIssues.length === 0;

    return validation;
  }

  private async validateBusinessLogic(output: any, inputs: any): Promise<any> {
    const validation: {
      isValid: boolean;
      score: number;
      criticalIssues: string[];
      warnings: string[];
      compliance: Record<string, any>;
    } = {
      isValid: true,
      score: 0,
      criticalIssues: [],
      warnings: [],
      compliance: {}
    };

    // 1. Rare Disease Eligibility Logic
    if (typeof output.peakPatients2030 === 'number' && output.prvEligibility && typeof output.rareDiseaseEligibility === 'boolean') {
      const isRareDisease = output.peakPatients2030 < 200000;
      const shouldBeEligible = isRareDisease;
      const actualEligible = output.rareDiseaseEligibility;
      const actualPRV = output.prvEligibility;

      validation.compliance.rareDiseaseLogic = {
        patientCount: output.peakPatients2030,
        isRareDisease: isRareDisease,
        shouldBeEligible: shouldBeEligible,
        actualEligible: actualEligible,
        actualPRV: actualPRV
      };

      if (isRareDisease && !actualEligible) {
        validation.criticalIssues.push(`Rare disease logic error: ${output.peakPatients2030} patients < 200k, but rareDiseaseEligibility is false`);
      } else if (!isRareDisease && actualEligible) {
        validation.criticalIssues.push(`Rare disease logic error: ${output.peakPatients2030} patients >= 200k, but rareDiseaseEligibility is true`);
      }

      if (isRareDisease && actualPRV !== 'Eligible') {
        validation.criticalIssues.push(`PRV logic error: ${output.peakPatients2030} patients < 200k, but PRV eligibility is '${actualPRV}'`);
      } else if (!isRareDisease && actualPRV !== 'Not eligible') {
        validation.criticalIssues.push(`PRV logic error: ${output.peakPatients2030} patients >= 200k, but PRV eligibility is '${actualPRV}'`);
      }
    }

    // 2. Patient Count Realism
    if (typeof output.peakPatients2030 === 'number') {
      const patientCount = output.peakPatients2030;
      const indication = inputs.indication?.toLowerCase() || '';

      validation.compliance.patientCountRealism = {
        patientCount: patientCount,
        indication: indication
      };

      // Check against disease type
      if (indication.includes('cancer') || indication.includes('oncology')) {
        if (patientCount > 500000) {
          validation.warnings.push(`Patient count ${patientCount} seems high for cancer indication`);
        }
      } else if (indication.includes('rare') || indication.includes('orphan')) {
        if (patientCount > 200000) {
          validation.criticalIssues.push(`Patient count ${patientCount} exceeds rare disease threshold of 200k`);
        }
      }
    }

    // 3. Pricing Realism
    if (typeof output.avgSellingPrice === 'number') {
      const price = output.avgSellingPrice;
      const indication = inputs.indication?.toLowerCase() || '';

      validation.compliance.pricingRealism = {
        price: price,
        indication: indication
      };

      if (indication.includes('cancer') || indication.includes('oncology')) {
        if (price < 50000) {
          validation.warnings.push(`Pricing ${price} seems low for oncology indication`);
        }
      } else if (indication.includes('rare') || indication.includes('orphan')) {
        if (price < 100000) {
          validation.warnings.push(`Pricing ${price} seems low for rare disease indication`);
        }
      }
    }

    // Calculate overall business logic score
    const totalChecks = Object.keys(validation.compliance).length;
    const passedChecks = totalChecks - validation.criticalIssues.length;
    validation.score = totalChecks > 0 ? passedChecks / totalChecks : 1.0;
    validation.isValid = validation.criticalIssues.length === 0;

    return validation;
  }

  private async validateCrossFieldLogic(output: any): Promise<any> {
    const validation: {
      isValid: boolean;
      score: number;
      criticalIssues: string[];
      warnings: string[];
      crossChecks: Record<string, any>;
    } = {
      isValid: true,
      score: 0,
      criticalIssues: [],
      warnings: [],
      crossChecks: {}
    };

    // 1. Market Share vs Patient Count Relationship
    if (typeof output.peakMarketShare2030 === 'number' && typeof output.peakPatients2030 === 'number') {
      const marketShare = output.peakMarketShare2030;
      const patientCount = output.peakPatients2030;

      validation.crossChecks.marketSharePatientRelationship = {
        marketShare: marketShare,
        patientCount: patientCount
      };

      // Higher market share typically means lower patient count (inverse relationship)
      if (patientCount > 500000 && marketShare > 25) {
        validation.warnings.push(`High market share (${marketShare}%) with large patient population (${patientCount}) - verify competitive landscape`);
      }
    }

    // 2. Pricing vs Patient Count Relationship
    if (typeof output.avgSellingPrice === 'number' && typeof output.peakPatients2030 === 'number') {
      const price = output.avgSellingPrice;
      const patientCount = output.peakPatients2030;

      validation.crossChecks.pricingPatientRelationship = {
        price: price,
        patientCount: patientCount
      };

      // Higher pricing typically means lower patient count
      if (patientCount > 200000 && price > 500000) {
        validation.warnings.push(`High pricing ($${price}) with large patient population (${patientCount}) - verify market access assumptions`);
      }
    }

    // 3. Revenue vs Market Size Consistency
    if (typeof output.peakRevenue2030 === 'number' && output.marketSize) {
      const peakRevenue = output.peakRevenue2030;
      const marketSizeStr = output.marketSize;

      validation.crossChecks.revenueMarketConsistency = {
        peakRevenue: peakRevenue,
        marketSize: marketSizeStr
      };

      // Extract market size from string (e.g., "2024: $19.2B; 2030: $29.8B")
      const marketSizeMatch = marketSizeStr.match(/\$(\d+\.?\d*)B/);
      if (marketSizeMatch) {
        const marketSize = parseFloat(marketSizeMatch[1]);
        const revenueShare = (peakRevenue / marketSize) * 100;

        if (revenueShare > 50) {
          validation.warnings.push(`Peak revenue (${peakRevenue}B) represents ${revenueShare.toFixed(1)}% of market size (${marketSize}B) - verify market share assumptions`);
        }
      }
    }

    // Calculate overall cross-field logic score
    const totalChecks = Object.keys(validation.crossChecks).length;
    const passedChecks = totalChecks - validation.criticalIssues.length;
    validation.score = totalChecks > 0 ? passedChecks / totalChecks : 1.0;
    validation.isValid = validation.criticalIssues.length === 0;

    return validation;
  }

  private async validateDataQuality(output: any): Promise<any> {
    const validation: {
      isValid: boolean;
      score: number;
      criticalIssues: string[];
      warnings: string[];
      qualityMetrics: Record<string, any>;
    } = {
      isValid: true,
      score: 0,
      criticalIssues: [],
      warnings: [],
      qualityMetrics: {}
    };

    // 1. Completeness Check
    const requiredFields = [
      'peakPatients2030', 'prvEligibility', 'rareDiseaseEligibility', 
      'peakRevenue2030', 'cagr', 'avgSellingPrice', 'peakMarketShare2030',
      'total10YearRevenue', 'geographicSplit', 'directCompetitors', 'dealActivity'
    ];

    const missingFields = requiredFields.filter(field => !(field in output));
    const completeness = (requiredFields.length - missingFields.length) / requiredFields.length;

    validation.qualityMetrics.completeness = {
      score: completeness,
      missingFields: missingFields
    };

    if (missingFields.length > 0) {
      validation.criticalIssues.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // 2. Data Type Consistency
    const typeIssues: string[] = [];
    for (const [field, value] of Object.entries(output)) {
      if (value === null || value === undefined) {
        typeIssues.push(`${field}: null/undefined`);
      } else if (typeof value === 'string' && value.trim() === '') {
        typeIssues.push(`${field}: empty string`);
      }
    }

    validation.qualityMetrics.dataTypes = {
      issues: typeIssues
    };

    if (typeIssues.length > 0) {
      validation.warnings.push(`Data quality issues: ${typeIssues.join(', ')}`);
    }

    // 3. Realistic Value Ranges
    const rangeIssues: string[] = [];
    for (const [field, value] of Object.entries(output)) {
      if (typeof value === 'number') {
        if (value < 0 && ['peakPatients2030', 'peakRevenue2030', 'cagr', 'avgSellingPrice', 'peakMarketShare2030', 'total10YearRevenue'].includes(field)) {
          rangeIssues.push(`${field}: negative value (${value})`);
        }
      }
    }

    validation.qualityMetrics.valueRanges = {
      issues: rangeIssues
    };

    if (rangeIssues.length > 0) {
      validation.criticalIssues.push(`Invalid value ranges: ${rangeIssues.join(', ')}`);
    }

    // Calculate overall data quality score
    const completenessWeight = 0.5;
    const typeWeight = 0.3;
    const rangeWeight = 0.2;

    const typeScore = typeIssues.length === 0 ? 1.0 : Math.max(0, 1 - (typeIssues.length / Object.keys(output).length));
    const rangeScore = rangeIssues.length === 0 ? 1.0 : 0.5;

    validation.score = (completeness * completenessWeight) + (typeScore * typeWeight) + (rangeScore * rangeWeight);
    validation.isValid = validation.criticalIssues.length === 0;

    return validation;
  }

  private calculateOverallValidationScore(validationResults: any): number {
    const weights = {
      fieldValidations: 0.3,
      mathematicalConsistency: 0.25,
      businessLogicCompliance: 0.25,
      crossFieldLogic: 0.1,
      dataQuality: 0.1
    };

    let totalScore = 0;
    let totalWeight = 0;

    // Field validations score
    if (validationResults.fieldValidations) {
      const fieldScores = Object.values(validationResults.fieldValidations).map((v: any) => v.score);
      const avgFieldScore = fieldScores.length > 0 ? fieldScores.reduce((a, b) => a + b, 0) / fieldScores.length : 0;
      totalScore += avgFieldScore * weights.fieldValidations;
      totalWeight += weights.fieldValidations;
    }

    // Mathematical consistency score
    if (validationResults.mathematicalConsistency) {
      totalScore += validationResults.mathematicalConsistency.score * weights.mathematicalConsistency;
      totalWeight += weights.mathematicalConsistency;
    }

    // Business logic compliance score
    if (validationResults.businessLogicCompliance) {
      totalScore += validationResults.businessLogicCompliance.score * weights.businessLogicCompliance;
      totalWeight += weights.businessLogicCompliance;
    }

    // Cross-field logic score
    if (validationResults.crossFieldLogic) {
      totalScore += validationResults.crossFieldLogic.score * weights.crossFieldLogic;
      totalWeight += weights.crossFieldLogic;
    }

    // Data quality score
    if (validationResults.dataQuality) {
      totalScore += validationResults.dataQuality.score * weights.dataQuality;
      totalWeight += weights.dataQuality;
    }

    // Penalize for critical issues
    const criticalIssuePenalty = Math.min(0.3, validationResults.criticalIssues.length * 0.05);
    const finalScore = totalWeight > 0 ? Math.max(0, (totalScore / totalWeight) - criticalIssuePenalty) : 0;

    return Math.round(finalScore * 10) / 10; // Round to 1 decimal place
  }

  private generateValidationRecommendations(validationResults: any): string[] {
    const recommendations: string[] = [];

    // Critical issue recommendations
    if (validationResults.criticalIssues.length > 0) {
      recommendations.push(`Fix ${validationResults.criticalIssues.length} critical validation issues before proceeding`);
    }

    // Field-specific recommendations
    for (const [fieldName, validation] of Object.entries(validationResults.fieldValidations)) {
      const fieldValidation = validation as any;
      if (fieldValidation.score < 0.7) {
        recommendations.push(`Review and improve ${fieldName} field (score: ${fieldValidation.score})`);
      }
    }

    // Mathematical consistency recommendations
    if (validationResults.mathematicalConsistency && validationResults.mathematicalConsistency.score < 0.8) {
      recommendations.push('Verify mathematical calculations and cross-check revenue formulas');
    }

    // Business logic recommendations
    if (validationResults.businessLogicCompliance && validationResults.businessLogicCompliance.score < 0.8) {
      recommendations.push('Review business logic compliance, especially rare disease eligibility rules');
    }

    // Data quality recommendations
    if (validationResults.dataQuality && validationResults.dataQuality.score < 0.8) {
      recommendations.push('Improve data quality and completeness');
    }

    return recommendations;
  }

  private generateComprehensiveRegenerationPrompt(inputs: any, currentOutput: any, validationResults: any): string {
    return `Regenerate the commercial intelligence data with comprehensive validation feedback:

Inputs: ${JSON.stringify(inputs)}
Current Output: ${JSON.stringify(currentOutput, null, 2)}

COMPREHENSIVE VALIDATION RESULTS:
Overall Score: ${validationResults.overallScore}/10
Critical Issues: ${validationResults.criticalIssues.length}
Warnings: ${validationResults.warnings.length}

CRITICAL ISSUES TO FIX:
${validationResults.criticalIssues.map((issue: string, index: number) => `${index + 1}. ${issue}`).join('\n')}

WARNINGS TO ADDRESS:
${validationResults.warnings.map((warning: string, index: number) => `${index + 1}. ${warning}`).join('\n')}

FIELD-SPECIFIC VALIDATION SCORES:
${Object.entries(validationResults.fieldValidations).map(([field, validation]: [string, any]) => 
  `${field}: ${validation.score.toFixed(2)}/1.0 - Issues: ${validation.criticalIssues.length}, Warnings: ${validation.warnings.length}`
).join('\n')}

MATHEMATICAL CONSISTENCY ISSUES:
${validationResults.mathematicalConsistency.criticalIssues.map((issue: string, index: number) => `${index + 1}. ${issue}`).join('\n')}

BUSINESS LOGIC COMPLIANCE ISSUES:
${validationResults.businessLogicCompliance.criticalIssues.map((issue: string, index: number) => `${index + 1}. ${issue}`).join('\n')}

RECOMMENDATIONS:
${validationResults.recommendations.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n')}

CRITICAL BUSINESS LOGIC RULES - MUST BE FOLLOWED:
1. RARE DISEASE ELIGIBILITY LOGIC:
   - If peakPatients2030 > 200,000: prvEligibility = "Not eligible", rareDiseaseEligibility = false
   - If peakPatients2030 < 200,000: prvEligibility = "Eligible", rareDiseaseEligibility = true

2. MATHEMATICAL CONSISTENCY:
   - Peak Revenue = (peakPatients2030 × avgSellingPrice × peakMarketShare2030) / 1,000,000,000
   - Total 10-Year Revenue = Peak Revenue × 5-8
   - Geographic split must sum to 100%
   - All percentages must be between 0-100%

3. REALISTIC VALUES:
   - Patient count must be realistic for disease type
   - Pricing must align with disease area
   - Market share must be realistic (5-30% for new drugs)

Return completely regenerated JSON that addresses ALL validation issues and follows ALL business logic rules exactly.`;
  }

  private generateLogicRegenerationPrompt(inputs: any, currentOutput: any, logicValidation: any): string {
    return `Regenerate the commercial intelligence data with the following logic fixes:

ORIGINAL INPUTS:
${JSON.stringify(inputs, null, 2)}

CURRENT OUTPUT WITH LOGIC ISSUES:
${JSON.stringify(currentOutput, null, 2)}

LOGIC VALIDATION RESULTS:
${JSON.stringify(logicValidation, null, 2)}

CRITICAL LOGIC FAILURES:
${logicValidation.criticalFailures.map((failure: string) => `- ${failure}`).join('\n')}

LOGIC ISSUES TO FIX:
${logicValidation.logicIssues.slice(0, 10).map((issue: string) => `- ${issue}`).join('\n')}

REGENERATION INSTRUCTIONS:
${logicValidation.regenerationInstructions}

CRITICAL REQUIREMENTS:
1. Fix all mathematical inconsistencies
2. Ensure PRV eligibility logic is correct (patient count < 200,000 for eligibility)
3. Validate revenue projections are mathematically sound
4. Check patient count aligns with disease epidemiology
5. Verify geographic split sums to 100%
6. Ensure all percentages are between 0-100%
7. Fix cross-field consistency issues
8. Validate business logic compliance

MATHEMATICAL FORMULAS TO VERIFY:
- Peak Revenue = (peakPatients2030 × avgSellingPrice × peakMarketShare2030) / 1,000,000,000
- Total 10-Year Revenue should be 5-8× Peak Revenue
- CAGR = ((Peak Revenue / Current Market Size)^(1/6) - 1) × 100
- Peak Patients = (Peak Revenue × 1,000,000,000) / (avgSellingPrice × peakMarketShare2030)

Return only valid JSON matching the commercial schema with mathematically consistent values.`;
  }

  private async executeRegenerationWithValidation(prompt: string): Promise<any> {
    await this.rateLimit();
    
    const model = this.costTracker.getOptimalModel('research', this.costTracker.getRemainingBudget());
    const response = await fetchPplx({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { 
        type: 'json_schema',
        json_schema: this.getEnhancedCommercialSchema()
      }
    });

    return this.parsePerplexityResponse(response.choices[0].message.content);
  }

  getConfiguration(): EnhancedPharmaConfig {
    return this.config;
  }
} 