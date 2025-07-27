import { fetchPplx, getAllPharmaSources, getSourcesForPhase } from './pplxClient';
import { reviewPerplexityOutput, generateCorrectivePrompt, isQualityAcceptable } from './openaiReviewClient';
import { generatePharmaPrompt, generateSystemPrompt, getPromptConfig } from './pharmaPromptEngine';
import { sanityCheck } from './numericSanity';
import * as calc from './crossFieldCalculator';
import { redis } from './redisClient';
import { sb } from './supabaseClient';
import { createHash } from 'crypto';
import stableStringify from 'fast-json-stable-stringify';
import { pack, unpack } from 'msgpackr';

interface OrchestrationConfig {
  maxRetries: number;
  qualityThreshold: number;
  enableReviewPipeline: boolean;
  enableMultiPassResearch: boolean;
  enableCaching: boolean;
  timeoutMs: number;
}

interface OrchestrationResult {
  output: any;
  qualityScore: number;
  retryCount: number;
  totalTimeMs: number;
  sourcesUsed: number;
  reviewResults?: any[];
  cacheHit: boolean;
  traceId: string;
}

interface ResearchPhase {
  phase: string;
  sources: string[];
  priority: number;
  description: string;
}

// Multi-phase research strategy for comprehensive coverage
const RESEARCH_PHASES: ResearchPhase[] = [
  {
    phase: 'regulatory',
    sources: getSourcesForPhase('regulatory'),
    priority: 1,
    description: 'FDA/EMA guidance, clinical trial requirements, regulatory designations'
  },
  {
    phase: 'clinical',
    sources: getSourcesForPhase('academic'),
    priority: 2,
    description: 'Published clinical data, mechanism of action, safety/efficacy profiles'
  },
  {
    phase: 'competitive',
    sources: getSourcesForPhase('deals'),
    priority: 3,
    description: 'Direct competitors, pipeline analysis, M&A activity'
  },
  {
    phase: 'market',
    sources: getSourcesForPhase('market'),
    priority: 4,
    description: 'Market size, pricing strategies, access and reimbursement'
  },
  {
    phase: 'intellectual_property',
    sources: getSourcesForPhase('patent'),
    priority: 5,
    description: 'Patent landscape, exclusivity analysis, generic entry timing'
  },
  {
    phase: 'financial',
    sources: getSourcesForPhase('market'),
    priority: 6,
    description: 'Financial projections, valuation analysis, deal multiples'
  }
];

export class PharmaOrchestrator {
  private config: OrchestrationConfig;
  private traceId: string;

  constructor(config: Partial<OrchestrationConfig> = {}) {
    this.config = {
      maxRetries: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
      qualityThreshold: parseFloat(process.env.QUALITY_THRESHOLD_SCORE || '0.85'),
      enableReviewPipeline: true,
      enableMultiPassResearch: true,
      enableCaching: true,
      timeoutMs: parseInt(process.env.DEEP_RESEARCH_TIMEOUT || '300000'),
      ...config
    };
    this.traceId = this.generateTraceId();
  }

  private generateTraceId(): string {
    return `pharma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private buildCacheKey(inputs: any, model: string): string {
    const raw = stableStringify({ inputs, model, config: this.config });
    return `pharma:${createHash("sha256").update(raw).digest("hex")}`;
  }

  private async checkCache(cacheKey: string): Promise<any | null> {
    if (!this.config.enableCaching) return null;
    
    try {
      const cached = await redis.get(cacheKey);
      return cached ? unpack(Buffer.from(cached as string, 'base64')) : null;
    } catch (error) {
      console.warn('Cache check failed:', error);
      return null;
    }
  }

  private async setCache(cacheKey: string, data: any): Promise<void> {
    if (!this.config.enableCaching) return;
    
    try {
      const serialized = pack(data);
      if (Buffer.byteLength(serialized) <= 8_000_000) { // 8MB limit
        await redis.set(cacheKey, serialized.toString('base64'), { ex: 86400 }); // 24 hours
      }
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  private async executeResearchPhase(
    phase: ResearchPhase,
    context: any,
    model: string,
    isRetry: boolean = false,
    qualityAssessment?: any
  ): Promise<any> {
    const systemPrompt = generateSystemPrompt();
    const userPrompt = generatePharmaPrompt(context, getPromptConfig(context), isRetry, qualityAssessment);
    
    const payload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      search_domain_filter: phase.sources,
      search_mode: phase.phase === 'academic' ? 'academic' : 'company',
      reasoning_effort: 'high',
      max_tokens: 12000,
      temperature: 0.05,
      top_p: 0.9,
      top_k: 50,
      repetition_penalty: 1.1
    };

    console.log(`Executing research phase: ${phase.phase}`, {
      sources: phase.sources.length,
      priority: phase.priority,
      traceId: this.traceId
    });

    const response = await fetchPplx(payload);
    
    if (!response.choices?.[0]?.message?.content) {
      throw new Error(`Invalid response from Perplexity API for phase ${phase.phase}`);
    }

    let parsedOutput;
    try {
      const content = response.choices[0].message.content;
      parsedOutput = JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON response from phase ${phase.phase}: ${error}`);
    }

    return {
      phase: phase.phase,
      output: parsedOutput,
      sources: phase.sources,
      searchQueries: response.usage?.num_search_queries || 0
    };
  }

  private async executeMultiPassResearch(
    context: any,
    model: string,
    isRetry: boolean = false,
    qualityAssessment?: any
  ): Promise<any> {
    const results = [];
    let aggregatedOutput = null;

    for (const phase of RESEARCH_PHASES) {
      try {
        const phaseResult = await this.executeResearchPhase(phase, context, model, isRetry, qualityAssessment);
        results.push(phaseResult);
        
        // Aggregate results from all phases
        if (!aggregatedOutput) {
          aggregatedOutput = phaseResult.output;
        } else {
          // Merge phase results, prioritizing higher priority phases
          aggregatedOutput = this.mergePhaseResults(aggregatedOutput, phaseResult.output, phase.priority);
        }

        console.log(`Completed research phase: ${phase.phase}`, {
          searchQueries: phaseResult.searchQueries,
          traceId: this.traceId
        });

      } catch (error) {
        console.error(`Research phase ${phase.phase} failed:`, error);
        // Continue with other phases rather than failing completely
      }
    }

    return {
      aggregatedOutput,
      phaseResults: results,
      totalSearchQueries: results.reduce((sum, r) => sum + r.searchQueries, 0)
    };
  }

  private mergePhaseResults(baseOutput: any, phaseOutput: any, priority: number): any {
    // Simple merge strategy - in a production system, this would be more sophisticated
    const merged = { ...baseOutput };
    
    // For arrays, concatenate and deduplicate
    if (phaseOutput.directCompetitors && Array.isArray(phaseOutput.directCompetitors)) {
      merged.directCompetitors = [...new Set([...(merged.directCompetitors || []), ...phaseOutput.directCompetitors])];
    }
    
    if (phaseOutput.dealActivity && Array.isArray(phaseOutput.dealActivity)) {
      merged.dealActivity = [...(merged.dealActivity || []), ...phaseOutput.dealActivity];
    }
    
    // For objects, merge with priority weighting
    if (phaseOutput.strategicTailwindData) {
      merged.strategicTailwindData = { ...merged.strategicTailwindData, ...phaseOutput.strategicTailwindData };
    }
    
    return merged;
  }

  private async validateAndSanitizeOutput(output: any): Promise<any> {
    // Apply numeric sanity checks
    const sanityIssues = sanityCheck(output);
    if (sanityIssues.length > 0) {
      console.warn('Sanity check issues detected:', sanityIssues);
      // In production, you might want to fix these issues or reject the output
    }

    // Ensure all required fields are present
    const requiredFields = [
      'cagr', 'marketSize', 'directCompetitors', 'prvEligibility', 'nationalPriority',
      'reviewTimelineMonths', 'peakRevenue2030', 'total10YearRevenue', 'peakMarketShare2030',
      'peakPatients2030', 'avgSellingPrice', 'persistenceRate', 'treatmentDuration',
      'geographicSplit', 'competitorPricing', 'pricingScenarios', 'strategicTailwindData',
      'dealActivity', 'pipelineAnalysis'
    ];

    for (const field of requiredFields) {
      if (output[field] === undefined || output[field] === null) {
        output[field] = 'Unknown';
      }
    }

    return output;
  }

  public async orchestrate(
    inputs: any,
    model: string = 'sonar-deep-research'
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    let retryCount = 0;
    let cacheHit = false;
    const reviewResults = [];

    // Check cache first
    const cacheKey = this.buildCacheKey(inputs, model);
    let cachedResult = await this.checkCache(cacheKey);
    
    if (cachedResult) {
      console.log('Cache hit for pharma analysis', { traceId: this.traceId });
      return {
        output: cachedResult,
        qualityScore: 1.0, // Assume cached results are high quality
        retryCount: 0,
        totalTimeMs: Date.now() - startTime,
        sourcesUsed: cachedResult.sourcesUsed || 0,
        cacheHit: true,
        traceId: this.traceId
      };
    }

    let finalOutput = null;
    let qualityScore = 0;

    while (retryCount <= this.config.maxRetries && qualityScore < this.config.qualityThreshold) {
      try {
        console.log(`Starting pharma analysis attempt ${retryCount + 1}`, {
          model,
          traceId: this.traceId,
          enableMultiPass: this.config.enableMultiPassResearch
        });

        // Execute research
        const researchResult = this.config.enableMultiPassResearch ?
          await this.executeMultiPassResearch(inputs, model, retryCount > 0, reviewResults[retryCount - 1]?.assessment) :
          await this.executeResearchPhase(RESEARCH_PHASES[0], inputs, model, retryCount > 0, reviewResults[retryCount - 1]?.assessment);

        let output = researchResult.aggregatedOutput || researchResult.output;

        // Validate and sanitize output
        output = await this.validateAndSanitizeOutput(output);

        // Apply review pipeline if enabled
        if (this.config.enableReviewPipeline) {
          const reviewResult = await reviewPerplexityOutput(output, retryCount);
          reviewResults.push(reviewResult);
          
          qualityScore = reviewResult.assessment.overallScore;
          
          console.log(`Quality assessment for attempt ${retryCount + 1}:`, {
            overallScore: qualityScore,
            issues: reviewResult.assessment.issues.length,
            shouldRetry: reviewResult.assessment.shouldRetry,
            traceId: this.traceId
          });

          if (isQualityAcceptable(reviewResult.assessment)) {
            finalOutput = output;
            break;
          } else if (retryCount < this.config.maxRetries) {
            console.log(`Quality below threshold, retrying with corrective feedback`, {
              currentScore: qualityScore,
              threshold: this.config.qualityThreshold,
              traceId: this.traceId
            });
            retryCount++;
            continue;
          }
        } else {
          // Skip review pipeline, assume acceptable quality
          finalOutput = output;
          qualityScore = 0.9; // Default high score when review is disabled
          break;
        }

             } catch (error: any) {
         console.error(`Pharma analysis attempt ${retryCount + 1} failed:`, error);
         retryCount++;
         
         if (retryCount > this.config.maxRetries) {
           throw new Error(`Pharma analysis failed after ${this.config.maxRetries} attempts: ${error.message}`);
         }
       }
    }

    if (!finalOutput) {
      throw new Error('Failed to produce acceptable output within retry limit');
    }

    const totalTimeMs = Date.now() - startTime;
    const sourcesUsed = 0; // Will be calculated from research results

    // Cache the result
    await this.setCache(cacheKey, {
      ...finalOutput,
      sourcesUsed,
      qualityScore,
      retryCount
    });

    // Log to Supabase
    try {
      await sb.from("query_logs").insert({
        user_id: "pharma_orchestrator",
        model,
        inputs,
        created_at: new Date().toISOString(),
        duration_ms: totalTimeMs,
        source_count: sourcesUsed,
        trace_id: this.traceId,
        quality_score: qualityScore,
        retry_count: retryCount
      });
    } catch (error) {
      console.warn('Failed to log to Supabase:', error);
    }

    return {
      output: finalOutput,
      qualityScore,
      retryCount,
      totalTimeMs,
      sourcesUsed,
      reviewResults: this.config.enableReviewPipeline ? reviewResults : undefined,
      cacheHit,
      traceId: this.traceId
    };
  }
} 