import { fetchPplx } from './pplxClient';
import { optimizedReviewPerplexityOutput } from './optimizedReviewClient';

interface ResearchValidationConfig {
  enableRealTimeResearch: boolean;
  enableMultiLayerValidation: boolean;
  enableFactChecking: boolean;
  enablePatientPopulationValidation: boolean;
  maxValidationAttempts: number;
  validationThreshold: number;
  enableAggressiveRetry: boolean;
  enableDeepSourceValidation: boolean;
  enableCrossVerification: boolean;
  minSourceCount: number;
  maxRetryAttempts: number;
  strictFactChecking: boolean;
}

interface DealResearchResult {
  acquirer: string;
  asset: string;
  indication: string;
  rationale: string;
  date: string;
  value: string;
  stage: string;
  sources: string[];
  validationScore: number;
  validationNotes: string[];
  patientPopulation?: {
    totalPatients: string;
    addressableMarket: string;
    source: string;
  };
}

interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  corrections: string[];
  confidence: number;
  sources: string[];
}

export class EnhancedResearchValidator {
  private config: ResearchValidationConfig;

  constructor(config: Partial<ResearchValidationConfig> = {}) {
    this.config = {
      enableRealTimeResearch: true,
      enableMultiLayerValidation: true,
      enableFactChecking: true,
      enablePatientPopulationValidation: true,
      maxValidationAttempts: 3,
      validationThreshold: 0.85,
      enableAggressiveRetry: true,
      enableDeepSourceValidation: true,
      enableCrossVerification: true,
      minSourceCount: 3,
      maxRetryAttempts: 5,
      strictFactChecking: true,
      ...config
    };
  }

  async validateDealActivity(target: string, indication: string): Promise<DealResearchResult[]> {
    console.log('[VALIDATOR] Starting AGGRESSIVE real-time deal research validation...');
    
    let attempts = 0;
    let bestDeals: DealResearchResult[] = [];
    let lastValidationScore = 0;
    
    while (attempts < this.config.maxRetryAttempts) {
      attempts++;
      console.log(`\n[VALIDATOR] Attempt ${attempts}/${this.config.maxRetryAttempts} - Aggressive Research Mode`);
      
      // Step 1: Real-time Perplexity research with increasing specificity
      const realDeals = await this.performAggressiveRealTimeDealResearch(target, indication, attempts);
      
      if (realDeals.length === 0) {
        console.log(`[VALIDATOR] No deals found in attempt ${attempts}, trying more aggressive search...`);
        continue;
      }
      
      // Step 2: Ultra-strict multi-layer validation
      const validatedDeals = await this.validateDealsWithUltraStrictValidation(realDeals, attempts);
      
      // Step 3: Deep source validation
      const sourceValidatedDeals = await this.performDeepSourceValidation(validatedDeals);
      
      // Step 4: Cross-verification across multiple databases
      const crossVerifiedDeals = await this.performCrossVerification(sourceValidatedDeals);
      
      // Step 5: Patient population validation
      const dealsWithPatientData = await this.validatePatientPopulations(crossVerifiedDeals, indication);
      
      // Calculate overall validation score
      const overallScore = dealsWithPatientData.reduce((sum, deal) => sum + deal.validationScore, 0) / dealsWithPatientData.length;
      
      console.log(`[VALIDATOR] Attempt ${attempts} Results:`);
      console.log(`  - Deals found: ${dealsWithPatientData.length}`);
      console.log(`  - Average validation score: ${overallScore.toFixed(1)}%`);
      console.log(`  - Meets threshold: ${overallScore >= this.config.validationThreshold ? 'YES' : 'NO'}`);
      
      // Keep the best results so far
      if (overallScore > lastValidationScore && dealsWithPatientData.length > 0) {
        bestDeals = dealsWithPatientData;
        lastValidationScore = overallScore;
      }
      
      // If we have high-quality results, we can stop
      if (overallScore >= this.config.validationThreshold && dealsWithPatientData.length >= 2) {
        console.log(`[VALIDATOR] High-quality results achieved, stopping aggressive search`);
        break;
      }
      
      // If this is the last attempt, use the best results we have
      if (attempts === this.config.maxRetryAttempts) {
        console.log(`[VALIDATOR] Final attempt completed, using best results found`);
        break;
      }
      
      // Wait before next attempt to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`[VALIDATOR] Final Results: ${bestDeals.length} validated deals with ${lastValidationScore.toFixed(1)}% average score`);
    return bestDeals;
  }

  private async performAggressiveRealTimeDealResearch(target: string, indication: string, attempt: number): Promise<any[]> {
    const searchSpecificity = this.getSearchSpecificity(attempt);
    const researchPrompt = `Perform ULTRA-AGGRESSIVE real-time research on recent pharmaceutical deals (2023-2024) related to ${target} and ${indication}.

RESEARCH REQUIREMENTS (Attempt ${attempt}):
1. Search for ACTUAL deals from the last 18 months with ${searchSpecificity} specificity
2. Focus on deals involving ${target} inhibitors, ${indication} treatments, or related mechanisms
3. Include only VERIFIED deals with public announcements and SEC filings
4. Provide exact deal values, dates, and company names with source URLs
5. Minimum ${this.config.minSourceCount} sources per deal required
6. NO placeholder data, NO estimates, ONLY verified facts

RESEARCH SOURCES (MANDATORY):
- BioCentury Intelligence (biocentury.com)
- Evaluate Pharma (evaluate.com)
- Fierce Biotech (fiercebiotech.com)
- Pharma Intelligence (pharmaintelligence.informa.com)
- Company press releases and SEC filings (sec.gov)
- Clinical trial databases (clinicaltrials.gov)
- Reuters and Bloomberg for financial data
- PubMed for related research context

SEARCH STRATEGY:
- Use multiple search queries with different keywords
- Cross-reference every deal across at least 3 sources
- Verify deal values against SEC filings
- Check company names against official registries
- Validate dates against multiple news sources

OUTPUT FORMAT:
Return ONLY valid JSON with this structure:
{
  "deals": [
    {
      "acquirer": "Exact company name",
      "asset": "Specific drug/technology name",
      "indication": "Exact indication",
      "rationale": "Deal rationale from public sources",
      "date": "Exact date (YYYY-MM-DD)",
      "value": "Exact deal value with currency",
      "stage": "Development stage at deal time",
      "sources": ["URL1", "URL2", "URL3"],
      "verificationLevel": "high/medium/low"
    }
  ]
}

CRITICAL: Only include deals that can be verified with ${this.config.minSourceCount}+ sources. If no recent deals exist, return empty array.`;

    try {
      const response = await fetchPplx({
        model: 'sonar-deep-research',
        messages: [
          {
            role: 'system',
            content: `You are a senior pharmaceutical deal analyst with access to real-time deal databases. This is attempt ${attempt} - be EXTREMELY thorough and aggressive in your research. Provide only verified, factual information with multiple source validation.`
          },
          {
            role: 'user',
            content: researchPrompt
          }
        ],
        max_tokens: 10000,
        temperature: 0.05,
        reasoning_effort: 'high',
        web_search_options: {
          search_depth: 'deep',
          search_scope: 'comprehensive',
          search_context_size: 15,
          search_queries_per_search: 20
        },
        search_domain_filter: [
          'biocentury.com',
          'evaluate.com',
          'fiercebiotech.com',
          'pharmaintelligence.informa.com',
          'clinicaltrials.gov',
          'sec.gov',
          'reuters.com',
          'bloomberg.com',
          'pubmed.ncbi.nlm.nih.gov',
          'nature.com',
          'science.org'
        ]
      });

      const result = JSON.parse(response.choices[0].message.content);
      const deals = result.deals || [];
      
      // Filter deals based on minimum source count
      const filteredDeals = deals.filter((deal: any) => 
        deal.sources && deal.sources.length >= this.config.minSourceCount
      );
      
      console.log(`[VALIDATOR] Found ${deals.length} deals, ${filteredDeals.length} meet minimum source requirements`);
      return filteredDeals;
    } catch (error) {
      console.error('[VALIDATOR] Aggressive real-time research failed:', error);
      return [];
    }
  }

  private getSearchSpecificity(attempt: number): string {
    const specificities = [
      'broad',
      'moderate',
      'specific',
      'very specific',
      'ultra-specific'
    ];
    return specificities[Math.min(attempt - 1, specificities.length - 1)];
  }

  private async validateDealsWithUltraStrictValidation(deals: any[], attempt: number): Promise<DealResearchResult[]> {
    const validatedDeals: DealResearchResult[] = [];
    const strictThreshold = Math.min(90 + (attempt * 2), 98); // Increasing threshold with each attempt

    console.log(`[VALIDATOR] Ultra-strict validation with ${strictThreshold}% threshold`);

    for (const deal of deals) {
      console.log(`[VALIDATOR] Validating deal: ${deal.acquirer} - ${deal.asset} (Attempt ${attempt})`);
      
      // Layer 1: Ultra-strict Perplexity fact-checking
      const perplexityValidation = await this.performUltraStrictFactCheck(deal, attempt);
      
      // Layer 2: Enhanced OpenAI logic validation
      const openaiValidation = await this.performEnhancedLogicValidation(deal, attempt);
      
      // Layer 3: Multi-source cross-reference validation
      const crossReferenceValidation = await this.performMultiSourceCrossReference(deal, attempt);
      
      // Calculate weighted validation score (more weight to fact-checking)
      const weightedScore = (
        (perplexityValidation.score * 0.5) +
        (openaiValidation.score * 0.3) +
        (crossReferenceValidation.score * 0.2)
      );
      
      const isValid = weightedScore >= strictThreshold;
      
      const validationNotes = [
        ...perplexityValidation.issues,
        ...openaiValidation.issues,
        ...crossReferenceValidation.issues
      ];

      if (isValid) {
        validatedDeals.push({
          ...deal,
          validationScore: weightedScore,
          validationNotes,
          sources: [...new Set([...deal.sources, ...perplexityValidation.sources, ...openaiValidation.sources, ...crossReferenceValidation.sources])]
        });
        console.log(`[VALIDATOR] ✅ Deal validated with ${weightedScore.toFixed(1)}% score`);
      } else {
        console.log(`[VALIDATOR] ❌ Deal rejected with ${weightedScore.toFixed(1)}% score (threshold: ${strictThreshold}%)`);
      }
    }

    return validatedDeals;
  }

  private async performDeepSourceValidation(deals: DealResearchResult[]): Promise<DealResearchResult[]> {
    console.log('[VALIDATOR] Performing deep source validation...');
    
    const validatedDeals: DealResearchResult[] = [];
    
    for (const deal of deals) {
      const sourceValidation = await this.validateSourcesIndividually(deal);
      
      if (sourceValidation.isValid) {
        validatedDeals.push({
          ...deal,
          validationScore: Math.min(deal.validationScore + 5, 100), // Bonus for source validation
          validationNotes: [...deal.validationNotes, 'Deep source validation passed']
        });
      } else {
        console.log(`[VALIDATOR] ❌ Deal ${deal.acquirer} failed deep source validation`);
      }
    }
    
    return validatedDeals;
  }

  private async performCrossVerification(deals: DealResearchResult[]): Promise<DealResearchResult[]> {
    console.log('[VALIDATOR] Performing cross-verification across databases...');
    
    const verifiedDeals: DealResearchResult[] = [];
    
    for (const deal of deals) {
      const crossVerification = await this.crossVerifyAcrossDatabases(deal);
      
      if (crossVerification.isValid) {
        verifiedDeals.push({
          ...deal,
          validationScore: Math.min(deal.validationScore + 3, 100), // Bonus for cross-verification
          validationNotes: [...deal.validationNotes, 'Cross-verification passed']
        });
      } else {
        console.log(`[VALIDATOR] ❌ Deal ${deal.acquirer} failed cross-verification`);
      }
    }
    
    return verifiedDeals;
  }

  private async validateDealsWithMultipleLayers(deals: any[]): Promise<DealResearchResult[]> {
    const validatedDeals: DealResearchResult[] = [];

    for (const deal of deals) {
      console.log(`[VALIDATOR] Validating deal: ${deal.acquirer} - ${deal.asset}`);
      
      // Layer 1: Perplexity fact-checking
      const perplexityValidation = await this.perplexityFactCheck(deal);
      
      // Layer 2: OpenAI logic validation
      const openaiValidation = await this.openaiLogicValidation(deal);
      
      // Layer 3: Cross-reference validation
      const crossReferenceValidation = await this.crossReferenceValidation(deal);
      
      // Combine validation results
      const combinedScore = (perplexityValidation.score + openaiValidation.score + crossReferenceValidation.score) / 3;
      const isValid = combinedScore >= this.config.validationThreshold;
      
      const validationNotes = [
        ...perplexityValidation.issues,
        ...openaiValidation.issues,
        ...crossReferenceValidation.issues
      ];

      validatedDeals.push({
        ...deal,
        validationScore: combinedScore,
        validationNotes,
        sources: [...new Set([...deal.sources, ...perplexityValidation.sources, ...openaiValidation.sources, ...crossReferenceValidation.sources])]
      });
    }

    return validatedDeals.filter(deal => deal.validationScore >= this.config.validationThreshold);
  }

  private async perplexityFactCheck(deal: any): Promise<ValidationResult> {
    const factCheckPrompt = `Fact-check this pharmaceutical deal information:

DEAL: ${JSON.stringify(deal, null, 2)}

VALIDATION REQUIREMENTS:
1. Verify company names are correct and current
2. Confirm deal values match public announcements
3. Validate dates are accurate
4. Check if asset names are correct
5. Verify indication accuracy
6. Confirm development stage at deal time

RESEARCH METHOD:
- Search for official press releases
- Check SEC filings
- Verify with multiple sources
- Cross-reference with clinical trial databases

OUTPUT: JSON with validation score (0-100), issues found, and sources used.`;

    try {
      const response = await fetchPplx({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a pharmaceutical fact-checker. Provide accurate validation scores and specific issues found.'
          },
          {
            role: 'user',
            content: factCheckPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.05,
        web_search_options: {
          search_depth: 'deep',
          search_scope: 'comprehensive'
        }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        isValid: result.score >= 80,
        score: result.score,
        issues: result.issues || [],
        corrections: result.corrections || [],
        confidence: result.confidence || 0,
        sources: result.sources || []
      };
    } catch (error) {
      console.error('[VALIDATOR] Perplexity fact-check failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Fact-checking failed'],
        corrections: [],
        confidence: 0,
        sources: []
      };
    }
  }

  private async openaiLogicValidation(deal: any): Promise<ValidationResult> {
    const logicValidationPrompt = `Validate the logical consistency and business rationale of this pharmaceutical deal:

DEAL: ${JSON.stringify(deal, null, 2)}

VALIDATION CRITERIA:
1. Business Logic: Does the deal make strategic sense?
2. Market Timing: Is the timing logical given market conditions?
3. Value Assessment: Is the deal value reasonable for the stage/indication?
4. Strategic Fit: Does it align with acquirer's portfolio?
5. Risk Assessment: Are the risks appropriately reflected?

SCORING:
- 90-100: Excellent logic, strong strategic fit
- 80-89: Good logic, reasonable fit
- 70-79: Acceptable logic, some concerns
- Below 70: Poor logic, significant issues

OUTPUT: JSON with score, specific issues, and confidence level.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a senior pharmaceutical business analyst. Provide rigorous logical validation.'
            },
            {
              role: 'user',
              content: logicValidationPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      const result = await response.json();
      const validation = JSON.parse(result.choices[0].message.content);
      
      return {
        isValid: validation.score >= 80,
        score: validation.score,
        issues: validation.issues || [],
        corrections: validation.corrections || [],
        confidence: validation.confidence || 0,
        sources: []
      };
    } catch (error) {
      console.error('[VALIDATOR] OpenAI logic validation failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Logic validation failed'],
        corrections: [],
        confidence: 0,
        sources: []
      };
    }
  }

  private async performUltraStrictFactCheck(deal: any, attempt: number): Promise<ValidationResult> {
    const factCheckPrompt = `Perform ULTRA-STRICT fact-checking on this pharmaceutical deal (Attempt ${attempt}):

DEAL: ${JSON.stringify(deal, null, 2)}

ULTRA-STRICT VALIDATION REQUIREMENTS:
1. Verify company names are correct and current (check official registries)
2. Confirm deal values match public announcements EXACTLY
3. Validate dates are accurate to the day
4. Check if asset names are correct and current
5. Verify indication accuracy with medical databases
6. Confirm development stage at deal time
7. Verify ALL source URLs are accessible and contain the claimed information
8. Cross-reference with SEC filings for financial data
9. Check for any discrepancies across multiple sources

RESEARCH METHOD:
- Search for official press releases
- Check SEC filings (10-K, 8-K, 8-K/A)
- Verify with multiple news sources
- Cross-reference with clinical trial databases
- Check company investor relations pages
- Verify with industry databases

SCORING CRITERIA:
- 95-100: Perfect verification across all sources
- 90-94: Minor discrepancies, mostly verified
- 85-89: Some verification issues, needs improvement
- Below 85: Significant verification problems

OUTPUT: JSON with validation score (0-100), specific issues found, and sources used.`;

    try {
      const response = await fetchPplx({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `You are an ultra-strict pharmaceutical fact-checker. This is attempt ${attempt} - be EXTREMELY thorough and critical. Accept nothing less than perfect verification.`
          },
          {
            role: 'user',
            content: factCheckPrompt
          }
        ],
        max_tokens: 5000,
        temperature: 0.01,
        web_search_options: {
          search_depth: 'deep',
          search_scope: 'comprehensive'
        }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        isValid: result.score >= 90,
        score: result.score,
        issues: result.issues || [],
        corrections: result.corrections || [],
        confidence: result.confidence || 0,
        sources: result.sources || []
      };
    } catch (error) {
      console.error('[VALIDATOR] Ultra-strict fact-check failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Ultra-strict fact-checking failed'],
        corrections: [],
        confidence: 0,
        sources: []
      };
    }
  }

  private async performEnhancedLogicValidation(deal: any, attempt: number): Promise<ValidationResult> {
    const logicValidationPrompt = `Perform ENHANCED logical validation of this pharmaceutical deal (Attempt ${attempt}):

DEAL: ${JSON.stringify(deal, null, 2)}

ENHANCED VALIDATION CRITERIA:
1. Business Logic: Does the deal make strategic sense given market conditions?
2. Market Timing: Is the timing logical given regulatory and competitive landscape?
3. Value Assessment: Is the deal value reasonable for the stage/indication/market?
4. Strategic Fit: Does it align with acquirer's portfolio and strategy?
5. Risk Assessment: Are the risks appropriately reflected in deal terms?
6. Competitive Context: Does this make sense given competitive landscape?
7. Regulatory Environment: Is this deal feasible given current regulations?
8. Financial Viability: Is the deal financially sound for both parties?

SCORING:
- 95-100: Excellent logic, perfect strategic fit
- 90-94: Very good logic, strong strategic fit
- 85-89: Good logic, reasonable fit
- 80-84: Acceptable logic, some concerns
- Below 80: Poor logic, significant issues

OUTPUT: JSON with score, specific issues, and confidence level.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a senior pharmaceutical business analyst. This is attempt ${attempt} - be extremely critical and thorough in your logical validation.`
            },
            {
              role: 'user',
              content: logicValidationPrompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.05
        })
      });

      const result = await response.json();
      const validation = JSON.parse(result.choices[0].message.content);
      
      return {
        isValid: validation.score >= 85,
        score: validation.score,
        issues: validation.issues || [],
        corrections: validation.corrections || [],
        confidence: validation.confidence || 0,
        sources: []
      };
    } catch (error) {
      console.error('[VALIDATOR] Enhanced logic validation failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Enhanced logic validation failed'],
        corrections: [],
        confidence: 0,
        sources: []
      };
    }
  }

  private async performMultiSourceCrossReference(deal: any, attempt: number): Promise<ValidationResult> {
    const crossReferencePrompt = `Perform MULTI-SOURCE cross-reference validation of this deal (Attempt ${attempt}):

DEAL: ${JSON.stringify(deal, null, 2)}

MULTI-SOURCE CROSS-REFERENCE REQUIREMENTS:
1. Check consistency across ALL provided sources
2. Verify with additional independent sources
3. Cross-reference with company financial reports
4. Check regulatory filings and databases
5. Verify with clinical trial databases
6. Check news sources for consistency
7. Verify with industry databases
8. Check for any conflicting information

SOURCES TO CHECK:
- Company press releases and investor relations
- SEC filings (10-K, 8-K, 8-K/A)
- ClinicalTrials.gov
- PubMed for related research
- Industry databases (Evaluate, BioCentury, FierceBiotech)
- News sources (Reuters, Bloomberg, STAT)
- Regulatory databases (FDA, EMA)

CONSISTENCY SCORING:
- 95-100: Perfect consistency across all sources
- 90-94: High consistency, minor variations
- 85-89: Good consistency, some variations
- 80-84: Acceptable consistency, some discrepancies
- Below 80: Poor consistency, significant discrepancies

OUTPUT: JSON with consistency score, discrepancies found, and sources checked.`;

    try {
      const response = await fetchPplx({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `You are a pharmaceutical data cross-referencing specialist. This is attempt ${attempt} - check consistency across ALL sources thoroughly.`
          },
          {
            role: 'user',
            content: crossReferencePrompt
          }
        ],
        max_tokens: 5000,
        temperature: 0.01,
        web_search_options: {
          search_depth: 'deep',
          search_scope: 'comprehensive'
        }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        isValid: result.consistencyScore >= 90,
        score: result.consistencyScore,
        issues: result.discrepancies || [],
        corrections: result.corrections || [],
        confidence: result.confidence || 0,
        sources: result.sourcesChecked || []
      };
    } catch (error) {
      console.error('[VALIDATOR] Multi-source cross-reference failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Multi-source cross-reference failed'],
        corrections: [],
        confidence: 0,
        sources: []
      };
    }
  }

  private async validateSourcesIndividually(deal: DealResearchResult): Promise<ValidationResult> {
    console.log(`[VALIDATOR] Validating ${deal.sources.length} sources individually for ${deal.acquirer}`);
    
    let validSources = 0;
    const sourceIssues: string[] = [];
    
    for (const source of deal.sources) {
      try {
        const sourceValidation = await this.validateSingleSource(source, deal);
        if (sourceValidation.isValid) {
          validSources++;
        } else {
          sourceIssues.push(`Source ${source}: ${sourceValidation.issues.join(', ')}`);
        }
      } catch (error) {
        sourceIssues.push(`Source ${source}: Validation failed`);
      }
    }
    
    const sourceScore = (validSources / deal.sources.length) * 100;
    const isValid = sourceScore >= 80 && validSources >= this.config.minSourceCount;
    
    return {
      isValid,
      score: sourceScore,
      issues: sourceIssues,
      corrections: [],
      confidence: sourceScore,
      sources: deal.sources
    };
  }

  private async validateSingleSource(source: string, deal: DealResearchResult): Promise<ValidationResult> {
    const sourceValidationPrompt = `Validate this source for deal information:

SOURCE: ${source}
DEAL: ${deal.acquirer} - ${deal.asset}

VALIDATION REQUIREMENTS:
1. Check if source URL is accessible
2. Verify source contains the claimed deal information
3. Check if information is current and accurate
4. Verify source credibility and authority
5. Check for any discrepancies with deal data

OUTPUT: JSON with validation result and issues found.`;

    try {
      const response = await fetchPplx({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a source validation specialist. Verify each source thoroughly.'
          },
          {
            role: 'user',
            content: sourceValidationPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.05
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        isValid: result.isValid,
        score: result.score || 0,
        issues: result.issues || [],
        corrections: [],
        confidence: result.confidence || 0,
        sources: [source]
      };
    } catch (error) {
      return {
        isValid: false,
        score: 0,
        issues: ['Source validation failed'],
        corrections: [],
        confidence: 0,
        sources: [source]
      };
    }
  }

  private async crossVerifyAcrossDatabases(deal: DealResearchResult): Promise<ValidationResult> {
    const crossVerifyPrompt = `Cross-verify this deal across multiple databases:

DEAL: ${JSON.stringify(deal, null, 2)}

DATABASES TO CHECK:
1. BioCentury Intelligence
2. Evaluate Pharma
3. Fierce Biotech
4. Pharma Intelligence
5. SEC EDGAR
6. ClinicalTrials.gov
7. PubMed
8. Company investor relations

VERIFICATION REQUIREMENTS:
1. Check if deal appears in multiple databases
2. Verify consistency of deal terms across databases
3. Check for any conflicting information
4. Verify deal status and timeline
5. Check for related regulatory filings

OUTPUT: JSON with verification result and consistency score.`;

    try {
      const response = await fetchPplx({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a database cross-verification specialist. Check consistency across all major pharmaceutical databases.'
          },
          {
            role: 'user',
            content: crossVerifyPrompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.05,
        web_search_options: {
          search_depth: 'deep',
          search_scope: 'comprehensive'
        }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        isValid: result.isValid,
        score: result.consistencyScore || 0,
        issues: result.discrepancies || [],
        corrections: [],
        confidence: result.confidence || 0,
        sources: result.databasesChecked || []
      };
    } catch (error) {
      return {
        isValid: false,
        score: 0,
        issues: ['Cross-verification failed'],
        corrections: [],
        confidence: 0,
        sources: []
      };
    }
  }

  private async crossReferenceValidation(deal: any): Promise<ValidationResult> {
    const crossReferencePrompt = `Cross-reference this deal information across multiple sources:

DEAL: ${JSON.stringify(deal, null, 2)}

CROSS-REFERENCE REQUIREMENTS:
1. Check multiple news sources for consistency
2. Verify with company financial reports
3. Cross-reference with clinical trial databases
4. Check regulatory filings
5. Verify with industry databases

SOURCES TO CHECK:
- Company press releases
- SEC filings (10-K, 8-K)
- ClinicalTrials.gov
- PubMed for related research
- Industry databases (Evaluate, BioCentury)
- News sources (Reuters, Bloomberg)

OUTPUT: JSON with consistency score, discrepancies found, and sources checked.`;

    try {
      const response = await fetchPplx({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a pharmaceutical data cross-referencing specialist. Check consistency across multiple sources.'
          },
          {
            role: 'user',
            content: crossReferencePrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.05,
        web_search_options: {
          search_depth: 'deep',
          search_scope: 'comprehensive'
        }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        isValid: result.consistencyScore >= 85,
        score: result.consistencyScore,
        issues: result.discrepancies || [],
        corrections: result.corrections || [],
        confidence: result.confidence || 0,
        sources: result.sourcesChecked || []
      };
    } catch (error) {
      console.error('[VALIDATOR] Cross-reference validation failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Cross-reference validation failed'],
        corrections: [],
        confidence: 0,
        sources: []
      };
    }
  }

  private async validatePatientPopulations(deals: DealResearchResult[], indication: string): Promise<DealResearchResult[]> {
    const populationPrompt = `Perform ULTRA-STRICT patient population research for ${indication}:

ULTRA-STRICT REQUIREMENTS:
1. Find CURRENT epidemiological data (2020-2024 ONLY)
2. Include global and US-specific numbers with EXACT figures
3. Provide addressable market estimates with methodology
4. Include MULTIPLE source citations (minimum 3 sources)
5. Cross-reference across multiple authoritative databases
6. Verify data consistency across sources
7. Include confidence intervals and data quality metrics
8. Check for any conflicting or outdated information

MANDATORY RESEARCH SOURCES:
- WHO epidemiological databases (who.int)
- CDC data (cdc.gov)
- NIH/NCI statistics (cancer.gov)
- Published epidemiological studies (PubMed)
- Market research reports (Evaluate, IQVIA)
- Regulatory databases (FDA, EMA)
- Academic journals (Nature, Lancet, NEJM)

VALIDATION CRITERIA:
- Data must be from 2020-2024
- Multiple source verification required
- No estimates without methodology
- No conflicting data across sources
- Must include confidence intervals

OUTPUT: JSON with total patients, addressable market, confidence intervals, methodology, and ALL sources used.`;

    try {
      const response = await fetchPplx({
        model: 'sonar-deep-research',
        messages: [
          {
            role: 'system',
            content: 'You are an epidemiological data specialist. Provide accurate, current patient population data.'
          },
          {
            role: 'user',
            content: populationPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,
        web_search_options: {
          search_depth: 'deep',
          search_scope: 'comprehensive'
        },
        search_domain_filter: [
          'who.int',
          'cdc.gov',
          'cancer.gov',
          'pubmed.ncbi.nlm.nih.gov',
          'nature.com',
          'thelancet.com'
        ]
      });

      const populationData = JSON.parse(response.choices[0].message.content);
      
      return deals.map(deal => ({
        ...deal,
        patientPopulation: {
          totalPatients: populationData.totalPatients,
          addressableMarket: populationData.addressableMarket,
          source: populationData.sources.join(', ')
        }
      }));
    } catch (error) {
      console.error('[VALIDATOR] Patient population validation failed:', error);
      return deals;
    }
  }

  async validateScoringModel(score: number, rationale: string, data: any): Promise<ValidationResult> {
    const scoringValidationPrompt = `Validate this scoring model output:

SCORE: ${score}
RATIONALE: ${rationale}
DATA: ${JSON.stringify(data, null, 2)}

VALIDATION CRITERIA:
1. Score Consistency: Does the score align with the data quality?
2. Rationale Logic: Is the reasoning sound and evidence-based?
3. Data Accuracy: Are the underlying data points correct?
4. Market Reality: Does this reflect real market conditions?
5. Competitive Context: Is the competitive analysis accurate?

OUTPUT: JSON with validation score, issues, and corrections needed.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a pharmaceutical scoring model validation expert. Ensure accuracy and consistency.'
            },
            {
              role: 'user',
              content: scoringValidationPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      const result = await response.json();
      const validation = JSON.parse(result.choices[0].message.content);
      
      return {
        isValid: validation.score >= 85,
        score: validation.score,
        issues: validation.issues || [],
        corrections: validation.corrections || [],
        confidence: validation.confidence || 0,
        sources: []
      };
    } catch (error) {
      console.error('[VALIDATOR] Scoring model validation failed:', error);
      return {
        isValid: false,
        score: 0,
        issues: ['Scoring validation failed'],
        corrections: [],
        confidence: 0,
        sources: []
      };
    }
  }
} 