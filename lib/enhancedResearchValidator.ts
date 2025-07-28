import { fetchPplx } from './pplxClient';
import { optimizedReviewPerplexityOutput } from './optimizedReviewClient';

interface ResearchValidationConfig {
  enableRealTimeResearch: boolean;
  enableMultiLayerValidation: boolean;
  enableFactChecking: boolean;
  enablePatientPopulationValidation: boolean;
  maxValidationAttempts: number;
  validationThreshold: number;
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
      ...config
    };
  }

  async validateDealActivity(target: string, indication: string): Promise<DealResearchResult[]> {
    console.log('[VALIDATOR] Starting real-time deal research validation...');
    
    // Step 1: Real-time Perplexity research for recent deals
    const realDeals = await this.performRealTimeDealResearch(target, indication);
    
    // Step 2: Multi-layer validation
    const validatedDeals = await this.validateDealsWithMultipleLayers(realDeals);
    
    // Step 3: Patient population validation
    const dealsWithPatientData = await this.validatePatientPopulations(validatedDeals, indication);
    
    return dealsWithPatientData;
  }

  private async performRealTimeDealResearch(target: string, indication: string): Promise<any[]> {
    const researchPrompt = `Perform comprehensive real-time research on recent pharmaceutical deals (2023-2024) related to ${target} and ${indication}.

REQUIREMENTS:
1. Search for ACTUAL deals from the last 18 months
2. Focus on deals involving ${target} inhibitors, ${indication} treatments, or related mechanisms
3. Include only VERIFIED deals with public announcements
4. Provide exact deal values, dates, and company names
5. Include source URLs for verification

RESEARCH SOURCES:
- BioCentury Intelligence
- Evaluate Pharma
- Fierce Biotech
- Pharma Intelligence
- Company press releases
- SEC filings
- Clinical trial databases

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
      "sources": ["URL1", "URL2"]
    }
  ]
}

CRITICAL: Only include deals that can be verified with public sources. If no recent deals exist, return empty array.`;

    try {
      const response = await fetchPplx({
        model: 'sonar-deep-research',
        messages: [
          {
            role: 'system',
            content: 'You are a senior pharmaceutical deal analyst with access to real-time deal databases. Provide only verified, factual information.'
          },
          {
            role: 'user',
            content: researchPrompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.1,
        reasoning_effort: 'high',
        web_search_options: {
          search_depth: 'deep',
          search_scope: 'comprehensive',
          search_context_size: 10,
          search_queries_per_search: 15
        },
        search_domain_filter: [
          'biocentury.com',
          'evaluate.com',
          'fiercebiotech.com',
          'pharmaintelligence.informa.com',
          'clinicaltrials.gov',
          'sec.gov',
          'reuters.com',
          'bloomberg.com'
        ]
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.deals || [];
    } catch (error) {
      console.error('[VALIDATOR] Real-time research failed:', error);
      return [];
    }
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
    const populationPrompt = `Research accurate patient population data for ${indication}:

REQUIREMENTS:
1. Find current epidemiological data
2. Include global and US-specific numbers
3. Provide addressable market estimates
4. Include source citations
5. Focus on recent data (2020-2024)

RESEARCH SOURCES:
- WHO epidemiological databases
- CDC data
- NIH/NCI statistics
- Published epidemiological studies
- Market research reports

OUTPUT: JSON with total patients, addressable market, and sources.`;

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