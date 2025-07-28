import { fetchPplx } from './pplxClient';
import { optimizedReviewPerplexityOutput } from './optimizedReviewClient';
import { generateEnhancedPrompt, generateEnhancedSystemPrompt, getEnhancedPromptConfig, getQualityStandard } from './enhancedPromptEngine';
import { ConsistencyAnalyzer } from './consistencyAnalyzer';
import { EnhancedResearchValidator } from './enhancedResearchValidator';

interface EnhancedOrchestratorConfig {
  maxRetries: number;
  qualityThreshold: number;
  enableReviewPipeline: boolean;
  enableMultiPassResearch: boolean;
  enableCaching: boolean;
  enableConsistencyAnalysis: boolean;
  timeoutMs: number;
  outputStrength: 'maximum' | 'high' | 'standard';
  consistencyLevel: 'strict' | 'balanced' | 'flexible';
}

interface EnhancedResearchPhase {
  phase: string;
  priority: number;
  sources: string[];
  description: string;
  requiredOutputs: string[];
}

interface EnhancedOrchestrationResult {
  output: any;
  qualityScore: number;
  retryCount: number;
  totalTimeMs: number;
  sourcesUsed: number;
  searchQueries: number;
  consistencyScore?: number;
  qualityAssessment: any;
  metadata: {
    promptConfig: any;
    qualityStandard: any;
    researchPhases: EnhancedResearchPhase[];
    performanceMetrics: any;
  };
}

// Enhanced research phases with specific requirements
const ENHANCED_RESEARCH_PHASES: EnhancedResearchPhase[] = [
  {
    phase: 'regulatory',
    priority: 1,
    sources: ['FDA.gov', 'EMA.europa.eu', 'ClinicalTrials.gov', 'PubMed'],
    description: 'Regulatory landscape analysis with FDA/EMA guidance and precedents',
    requiredOutputs: ['prvEligibility', 'nationalPriority', 'reviewTimelineMonths', 'strategicTailwindData.fdaDesignations']
  },
  {
    phase: 'clinical',
    priority: 2,
    sources: ['PubMed', 'ClinicalTrials.gov', 'NEJM', 'Lancet', 'Nature'],
    description: 'Clinical and scientific evidence with published trial data',
    requiredOutputs: ['persistenceRate', 'treatmentDuration', 'avgSellingPrice']
  },
  {
    phase: 'competitive',
    priority: 3,
    sources: ['EvaluatePharma', 'Citeline', 'Cortellis', 'Bloomberg', 'Reuters'],
    description: 'Competitive intelligence with direct competitors and pipeline analysis',
    requiredOutputs: ['directCompetitors', 'competitorPricing', 'pipelineAnalysis.crowdingPercent', 'pipelineAnalysis.competitiveThreats']
  },
  {
    phase: 'market',
    priority: 4,
    sources: ['IQVIA', 'GlobalData', 'Frost & Sullivan', 'SEC filings'],
    description: 'Market access and commercial strategy analysis',
    requiredOutputs: ['marketSize', 'peakRevenue2030', 'peakMarketShare2030', 'geographicSplit', 'pricingScenarios']
  },
  {
    phase: 'ip',
    priority: 5,
    sources: ['USPTO', 'WIPO', 'Espacenet', 'FDA Orange Book'],
    description: 'Intellectual property and exclusivity analysis',
    requiredOutputs: ['strategicTailwindData.guidanceDocuments', 'pipelineAnalysis.strategicFitRank']
  },
  {
    phase: 'financial',
    priority: 6,
    sources: ['EvaluatePharma', 'Bloomberg', 'Reuters', 'company investor relations'],
    description: 'Financial projections and valuation analysis',
    requiredOutputs: ['cagr', 'total10YearRevenue', 'peakPatients2030', 'dealActivity']
  }
];

export class EnhancedPharmaOrchestrator {
  private config: EnhancedOrchestratorConfig;
  private traceId: string;
  private consistencyAnalyzer: ConsistencyAnalyzer;
  private researchValidator: EnhancedResearchValidator;

  constructor(config: Partial<EnhancedOrchestratorConfig> = {}) {
    this.config = {
      maxRetries: 3,
      qualityThreshold: 0.85,
      enableReviewPipeline: true,
      enableMultiPassResearch: true,
      enableCaching: false, // Disabled for consistency analysis
      enableConsistencyAnalysis: true,
      timeoutMs: 300000,
      outputStrength: 'maximum',
      consistencyLevel: 'strict',
      ...config
    };
    
    this.traceId = `enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.consistencyAnalyzer = new ConsistencyAnalyzer();
    this.researchValidator = new EnhancedResearchValidator({
      enableRealTimeResearch: true,
      enableMultiLayerValidation: true,
      enableFactChecking: true,
      enablePatientPopulationValidation: true,
      validationThreshold: 0.85
    });
  }

  async orchestrate(inputs: any, model: string = 'sonar-deep-research'): Promise<EnhancedOrchestrationResult> {
    const startTime = Date.now();
    let retryCount = 0;
    let currentOutput: any = null;
    let qualityAssessment: any = null;
    let totalSourcesUsed = 0;
    let totalSearchQueries = 0;

    console.log('Starting enhanced pharma orchestration', {
      target: inputs.target,
      indication: inputs.indication,
      model,
      config: this.config,
      traceId: this.traceId
    });

    // Get enhanced prompt configuration
    const promptConfig = getEnhancedPromptConfig(inputs);
    const qualityStandard = getQualityStandard(promptConfig);

    console.log('Enhanced prompt configuration:', {
      promptConfig,
      qualityStandard,
      traceId: this.traceId
    });

    while (retryCount <= this.config.maxRetries) {
      try {
        console.log(`\n--- Orchestration Attempt ${retryCount + 1}/${this.config.maxRetries + 1} ---`);
        
        // Execute enhanced research phases
        const researchResult = await this.executeEnhancedResearch(inputs, model, retryCount, qualityAssessment);
        
        currentOutput = researchResult.output;
        totalSourcesUsed = researchResult.totalSources;
        totalSearchQueries = researchResult.totalSearchQueries;

        // Validate deal activity and patient populations with real research
        if (currentOutput.dealActivity && currentOutput.dealActivity.length > 0) {
          console.log('Validating deal activity with real research...');
          
          const validatedDeals = await this.researchValidator.validateDealActivity(
            inputs.target || 'EGFR',
            inputs.indication || 'NSCLC'
          );
          
          if (validatedDeals.length > 0) {
            currentOutput.dealActivity = validatedDeals;
            console.log(`Validated ${validatedDeals.length} deals with real research`);
          } else {
            console.log('No validated deals found, removing placeholder data');
            currentOutput.dealActivity = [];
          }
        }

        // Validate scoring model output
        if (currentOutput.strategicFitScore || currentOutput.overallScore) {
          console.log('Validating scoring model output...');
          
          const scoringValidation = await this.researchValidator.validateScoringModel(
            currentOutput.strategicFitScore || currentOutput.overallScore,
            currentOutput.strategicRationale || currentOutput.analysisRationale,
            currentOutput
          );
          
          if (!scoringValidation.isValid) {
            console.log('Scoring validation failed, adjusting scores');
            currentOutput.strategicFitScore = Math.min(currentOutput.strategicFitScore || 0, 75);
            currentOutput.overallScore = Math.min(currentOutput.overallScore || 0, 75);
          }
        }

        // Review output quality if enabled
        if (this.config.enableReviewPipeline) {
          console.log('Conducting quality review...');
          
          qualityAssessment = await optimizedReviewPerplexityOutput(
            currentOutput,
            retryCount,
            {
              temperature: 0.05,
              max_tokens: 4000,
              frequency_penalty: 0.2,
              presence_penalty: 0.2
            }
          );

          console.log('Quality assessment completed:', {
            overallScore: qualityAssessment.assessment.overallScore,
            confidenceLevel: qualityAssessment.assessment.confidenceLevel,
            criticalIssues: qualityAssessment.assessment.criticalIssues.length,
            traceId: this.traceId
          });

          // Check if quality meets threshold
          if (qualityAssessment.assessment.overallScore >= this.config.qualityThreshold) {
            console.log('Quality threshold met, proceeding with final analysis');
            break;
          } else {
            console.log('Quality threshold not met, preparing for retry');
            retryCount++;
            continue;
          }
        } else {
          // Skip review pipeline, proceed with current output
          break;
        }

      } catch (error) {
        console.error(`Orchestration attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount > this.config.maxRetries) {
          throw new Error(`Enhanced orchestration failed after ${this.config.maxRetries} attempts: ${error}`);
        }
      }
    }

    // Run consistency analysis if enabled
    let consistencyScore: number | undefined;
    if (this.config.enableConsistencyAnalysis && currentOutput) {
      console.log('Running consistency analysis...');
      
      try {
        const consistencyAnalysis = await this.consistencyAnalyzer.runConsistencyTest(
          inputs.target,
          inputs.indication,
          2 // Run 2 additional tests for consistency
        );
        
        consistencyScore = 100 - consistencyAnalysis.qualityScoreVariance / 10; // Convert variance to consistency score
        
        console.log('Consistency analysis completed:', {
          averageQualityScore: consistencyAnalysis.averageQualityScore,
          qualityScoreVariance: consistencyAnalysis.qualityScoreVariance,
          consistencyScore,
          traceId: this.traceId
        });
      } catch (error) {
        console.error('Consistency analysis failed:', error);
      }
    }

    const totalTimeMs = Date.now() - startTime;

    const result: EnhancedOrchestrationResult = {
      output: currentOutput,
      qualityScore: qualityAssessment?.assessment.overallScore || 0,
      retryCount,
      totalTimeMs,
      sourcesUsed: totalSourcesUsed,
      searchQueries: totalSearchQueries,
      consistencyScore,
      qualityAssessment,
      metadata: {
        promptConfig,
        qualityStandard,
        researchPhases: ENHANCED_RESEARCH_PHASES,
        performanceMetrics: {
          totalTimeMs,
          retryCount,
          sourcesUsed: totalSourcesUsed,
          searchQueries: totalSearchQueries,
          qualityScore: qualityAssessment?.assessment.overallScore || 0,
          consistencyScore
        }
      }
    };

    console.log('Enhanced orchestration completed:', {
      qualityScore: result.qualityScore,
      retryCount: result.retryCount,
      totalTimeMs: result.totalTimeMs,
      sourcesUsed: result.sourcesUsed,
      searchQueries: result.searchQueries,
      consistencyScore: result.consistencyScore,
      traceId: this.traceId
    });

    return result;
  }

  private async executeEnhancedResearch(
    inputs: any,
    model: string,
    retryCount: number,
    qualityAssessment?: any
  ): Promise<{
    output: any;
    totalSources: number;
    totalSearchQueries: number;
  }> {
    const systemPrompt = generateEnhancedSystemPrompt();
    const userPrompt = generateEnhancedPrompt(inputs, getEnhancedPromptConfig(inputs), retryCount > 0, qualityAssessment);
    
    console.log('Executing enhanced research with optimized parameters');

    // Enhanced payload with optimized parameters for strength and consistency
    const payload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 15000, // Increased for maximum strength
      temperature: 0.02, // Very low for consistency
      reasoning_effort: 'high',
      top_p: 0.85, // Slightly lower for consistency
      top_k: 40, // Reduced for consistency
      repetition_penalty: 1.15, // Increased to reduce redundancy
      web_search_options: {
        search_context_size: 'high',
        search_depth: 'deep',
        search_scope: 'comprehensive'
      },
      search_queries_per_search: 20, // Increased for comprehensive coverage
      search_recency_filter: 'month',
      search_mode: 'academic'
    };

    console.log('Enhanced research payload configured:', {
      model: payload.model,
      maxTokens: payload.max_tokens,
      temperature: payload.temperature,
      searchQueriesPerSearch: payload.search_queries_per_search,
      traceId: this.traceId
    });

    const response = await fetchPplx(payload);
    
    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Perplexity API');
    }

    let parsedOutput;
    try {
      const content = response.choices[0].message.content;
      parsedOutput = JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error}`);
    }

    return {
      output: parsedOutput,
      totalSources: response.usage?.num_search_queries || 0,
      totalSearchQueries: response.usage?.total_tokens || 0
    };
  }

  async runComprehensiveConsistencyAnalysis(): Promise<void> {
    console.log('Running comprehensive consistency analysis...');
    await this.consistencyAnalyzer.runComprehensiveAnalysis();
  }

  getConfiguration(): EnhancedOrchestratorConfig {
    return { ...this.config };
  }

  updateConfiguration(newConfig: Partial<EnhancedOrchestratorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Enhanced orchestrator configuration updated:', this.config);
  }
} 