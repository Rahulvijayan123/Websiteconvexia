interface EnhancedReviewOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  enableDetailedScoring?: boolean;
  enableSourceValidation?: boolean;
  enableCrossReference?: boolean;
}

interface DetailedQualityAssessment {
  overallScore: number;
  categoryScores: {
    factualAccuracy: DetailedScore;
    scientificCoherence: DetailedScore;
    sourceCredibility: DetailedScore;
    pharmaExpertise: DetailedScore;
    reasoningDepth: DetailedScore;
    regulatoryCompliance: DetailedScore;
    marketIntelligence: DetailedScore;
    competitiveAnalysis: DetailedScore;
  };
  criticalIssues: CriticalIssue[];
  improvementAreas: ImprovementArea[];
  sourceValidation: SourceValidationResult;
  confidenceLevel: number;
  shouldRetry: boolean;
  retryPriority: 'high' | 'medium' | 'low';
  correctiveInstructions: string;
  estimatedImprovementPotential: number;
}

interface DetailedScore {
  score: number;
  maxPossibleScore: number;
  breakdown: ScoreBreakdown[];
  confidence: number;
  reasoning: string;
}

interface ScoreBreakdown {
  criterion: string;
  score: number;
  weight: number;
  evidence: string[];
  issues: string[];
}

interface CriticalIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  impact: string;
  suggestedFix: string;
  evidence: string[];
}

interface ImprovementArea {
  category: string;
  currentScore: number;
  targetScore: number;
  specificActions: string[];
  expectedImpact: number;
}

interface SourceValidationResult {
  totalSources: number;
  validSources: number;
  primarySources: number;
  recentSources: number;
  authoritativeSources: number;
  sourceQualityScore: number;
  missingCriticalSources: string[];
  sourceRecencyIssues: string[];
  sourceAuthorityIssues: string[];
}

// Enhanced scoring criteria with detailed breakdowns
const ENHANCED_SCORING_CRITERIA = {
  factualAccuracy: {
    weight: 0.20,
    maxScore: 100,
    criteria: {
      numericalAccuracy: { weight: 0.3, description: 'All numerical values are realistic and within industry ranges' },
      drugIdentification: { weight: 0.25, description: 'Drug names, targets, and indications are accurately identified' },
      regulatoryAccuracy: { weight: 0.25, description: 'Regulatory timelines and requirements are correct' },
      marketDataAccuracy: { weight: 0.2, description: 'Market data is current and accurate' }
    }
  },
  scientificCoherence: {
    weight: 0.15,
    maxScore: 100,
    criteria: {
      biologicalPlausibility: { weight: 0.3, description: 'Biological mechanisms are correctly described' },
      clinicalInterpretation: { weight: 0.25, description: 'Clinical trial data interpretation is sound' },
      developmentPathway: { weight: 0.25, description: 'Drug development pathways are realistic' },
      safetyEfficacy: { weight: 0.2, description: 'Safety and efficacy profiles are consistent' }
    }
  },
  sourceCredibility: {
    weight: 0.15,
    maxScore: 100,
    criteria: {
      primarySourceUsage: { weight: 0.3, description: 'Primary sources are used (FDA, EMA, clinical trials.gov)' },
      peerReviewedLiterature: { weight: 0.25, description: 'Peer-reviewed literature is cited appropriately' },
      industryReports: { weight: 0.25, description: 'Industry reports are from reputable sources' },
      sourceRecency: { weight: 0.2, description: 'Sources are current (within 2 years)' }
    }
  },
  pharmaExpertise: {
    weight: 0.15,
    maxScore: 100,
    criteria: {
      regulatoryStrategy: { weight: 0.25, description: 'Regulatory strategy is well-articulated' },
      marketAccess: { weight: 0.25, description: 'Market access considerations are comprehensive' },
      competitiveLandscape: { weight: 0.25, description: 'Competitive landscape analysis is thorough' },
      pricingStrategy: { weight: 0.25, description: 'Pricing strategy is realistic and well-reasoned' }
    }
  },
  reasoningDepth: {
    weight: 0.10,
    maxScore: 100,
    criteria: {
      causalRelationships: { weight: 0.3, description: 'Causal relationships are clearly established' },
      assumptionClarity: { weight: 0.25, description: 'Assumptions are explicitly stated and justified' },
      alternativeScenarios: { weight: 0.25, description: 'Alternative scenarios are considered' },
      evidenceSupport: { weight: 0.2, description: 'Conclusions are supported by evidence' }
    }
  },
  regulatoryCompliance: {
    weight: 0.10,
    maxScore: 100,
    criteria: {
      fdaGuidance: { weight: 0.4, description: 'FDA guidance and requirements are correctly interpreted' },
      emaCompliance: { weight: 0.3, description: 'EMA requirements are appropriately addressed' },
      clinicalEndpoints: { weight: 0.3, description: 'Clinical endpoints and trial design are appropriate' }
    }
  },
  marketIntelligence: {
    weight: 0.10,
    maxScore: 100,
    criteria: {
      marketSizeAccuracy: { weight: 0.3, description: 'Market size projections are realistic and evidence-based' },
      growthProjections: { weight: 0.25, description: 'Growth projections are reasonable and supported' },
      competitivePositioning: { weight: 0.25, description: 'Competitive positioning analysis is thorough' },
      marketAccess: { weight: 0.2, description: 'Market access barriers and opportunities are identified' }
    }
  },
  competitiveAnalysis: {
    weight: 0.05,
    maxScore: 100,
    criteria: {
      competitorIdentification: { weight: 0.4, description: 'Direct competitors are correctly identified' },
      competitiveAdvantages: { weight: 0.3, description: 'Competitive advantages and disadvantages are analyzed' },
      threatAssessment: { weight: 0.3, description: 'Competitive threats are properly assessed' }
    }
  }
};

// Enhanced review prompt with detailed scoring instructions
const ENHANCED_REVIEW_PROMPT = `You are a senior pharmaceutical industry expert with 25+ years of experience conducting rigorous quality assessment of commercial intelligence reports. You must be extremely critical and thorough.

REPORT TO REVIEW:
{originalOutput}

ENHANCED QUALITY ASSESSMENT INSTRUCTIONS:

1. **DETAILED SCORING BREAKDOWN**
   For each category, provide a detailed score (0-100) with specific reasoning:
   - Factual Accuracy (20%): Numerical accuracy, drug identification, regulatory accuracy, market data accuracy
   - Scientific Coherence (15%): Biological plausibility, clinical interpretation, development pathway, safety/efficacy
   - Source Credibility (15%): Primary source usage, peer-reviewed literature, industry reports, source recency
   - Pharma Expertise (15%): Regulatory strategy, market access, competitive landscape, pricing strategy
   - Reasoning Depth (10%): Causal relationships, assumption clarity, alternative scenarios, evidence support
   - Regulatory Compliance (10%): FDA guidance, EMA compliance, clinical endpoints
   - Market Intelligence (10%): Market size accuracy, growth projections, competitive positioning, market access
   - Competitive Analysis (5%): Competitor identification, competitive advantages, threat assessment

2. **CRITICAL ISSUE IDENTIFICATION**
   Identify issues with severity levels:
   - CRITICAL: Fabricated data, incorrect drug names, unrealistic projections (>10x norms)
   - HIGH: Missing regulatory considerations, inadequate source citations, major factual errors
   - MEDIUM: Incomplete analysis, weak reasoning, outdated sources
   - LOW: Minor inconsistencies, formatting issues, missing details

3. **SOURCE VALIDATION**
   Analyze source quality:
   - Count total sources and validate URLs
   - Identify primary vs secondary sources
   - Check source recency (within 2 years preferred)
   - Assess source authority and reputation
   - Identify missing critical sources

4. **IMPROVEMENT POTENTIAL**
   Estimate improvement potential and provide specific corrective actions.

PROVIDE RESPONSE IN THIS EXACT JSON FORMAT:
{
  "overallScore": 85.5,
  "categoryScores": {
    "factualAccuracy": {
      "score": 88,
      "maxPossibleScore": 100,
      "breakdown": [
        {
          "criterion": "numericalAccuracy",
          "score": 90,
          "weight": 0.3,
          "evidence": ["Market size projections are within industry norms"],
          "issues": []
        }
      ],
      "confidence": 0.9,
      "reasoning": "Strong numerical accuracy with minor issues in regulatory timelines"
    }
  },
  "criticalIssues": [
    {
      "severity": "medium",
      "category": "sourceCredibility",
      "description": "Missing primary regulatory sources",
      "impact": "Reduces confidence in regulatory analysis",
      "suggestedFix": "Include FDA.gov and EMA.europa.eu sources",
      "evidence": ["No FDA guidance documents cited"]
    }
  ],
  "improvementAreas": [
    {
      "category": "sourceCredibility",
      "currentScore": 75,
      "targetScore": 90,
      "specificActions": ["Add FDA guidance documents", "Include recent clinical trial data"],
      "expectedImpact": 15
    }
  ],
  "sourceValidation": {
    "totalSources": 20,
    "validSources": 18,
    "primarySources": 8,
    "recentSources": 15,
    "authoritativeSources": 12,
    "sourceQualityScore": 82,
    "missingCriticalSources": ["FDA.gov", "clinicaltrials.gov"],
    "sourceRecencyIssues": ["2 sources from 2021"],
    "sourceAuthorityIssues": ["1 unverified industry blog"]
  },
  "confidenceLevel": 0.85,
  "shouldRetry": false,
  "retryPriority": "low",
  "correctiveInstructions": "Add FDA guidance documents and recent clinical trial data to improve source credibility",
  "estimatedImprovementPotential": 8.5
}

Be extremely strict and thorough. This assessment determines whether the report meets senior pharmaceutical industry expert standards.`;

export async function enhancedReviewPerplexityOutput(
  originalOutput: any,
  retryCount: number = 0,
  options: EnhancedReviewOptions = {}
): Promise<{
  assessment: DetailedQualityAssessment;
  originalOutput: any;
  retryCount: number;
  totalTimeMs: number;
  reviewMetadata: any;
}> {
  const startTime = Date.now();
  const maxRetries = parseInt(process.env.MAX_RETRY_ATTEMPTS || '3');
  const qualityThreshold = parseFloat(process.env.QUALITY_THRESHOLD_SCORE || '0.85');

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const reviewPrompt = ENHANCED_REVIEW_PROMPT.replace(
    '{originalOutput}',
    JSON.stringify(originalOutput, null, 2)
  );

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a senior pharmaceutical industry expert conducting rigorous quality assessment. Be extremely critical, thorough, and analytical. Provide detailed scoring with specific evidence and reasoning.'
          },
          {
            role: 'user',
            content: reviewPrompt
          }
        ],
        max_tokens: options.max_tokens || 6000,
        temperature: options.temperature || 0.05, // Very low for consistent assessment
        top_p: options.top_p || 0.9,
        frequency_penalty: options.frequency_penalty || 0.1,
        presence_penalty: options.presence_penalty || 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const assessmentText = result.choices[0].message.content;
    
    let assessment: DetailedQualityAssessment;
    try {
      assessment = JSON.parse(assessmentText);
    } catch (parseError) {
      throw new Error(`Failed to parse assessment JSON: ${parseError}`);
    }

    const totalTimeMs = Date.now() - startTime;

    // Enhanced retry logic based on detailed assessment
    const shouldRetry = determineRetryDecision(assessment, retryCount, maxRetries, qualityThreshold);

    return {
      assessment,
      originalOutput,
      retryCount,
      totalTimeMs,
      reviewMetadata: {
        model: options.model || 'gpt-4o',
        tokensUsed: result.usage?.total_tokens,
        promptTokens: result.usage?.prompt_tokens,
        completionTokens: result.usage?.completion_tokens
      }
    };

  } catch (error: any) {
    const totalTimeMs = Date.now() - startTime;
    
    // Enhanced default assessment for failures
    const defaultAssessment: DetailedQualityAssessment = {
      overallScore: 50,
      categoryScores: {
        factualAccuracy: createDefaultScore(50),
        scientificCoherence: createDefaultScore(50),
        sourceCredibility: createDefaultScore(50),
        pharmaExpertise: createDefaultScore(50),
        reasoningDepth: createDefaultScore(50),
        regulatoryCompliance: createDefaultScore(50),
        marketIntelligence: createDefaultScore(50),
        competitiveAnalysis: createDefaultScore(50)
      },
      criticalIssues: [{
        severity: 'critical',
        category: 'system',
        description: 'Review process failed',
        impact: 'Unable to assess quality',
        suggestedFix: 'Retry with improved error handling',
        evidence: [error.message]
      }],
      improvementAreas: [],
      sourceValidation: createDefaultSourceValidation(),
      confidenceLevel: 0.5,
      shouldRetry: retryCount < maxRetries,
      retryPriority: 'high',
      correctiveInstructions: 'Review process failed - retry with improved error handling',
      estimatedImprovementPotential: 50
    };

    return {
      assessment: defaultAssessment,
      originalOutput,
      retryCount,
      totalTimeMs,
      reviewMetadata: { error: error.message }
    };
  }
}

function determineRetryDecision(
  assessment: DetailedQualityAssessment,
  retryCount: number,
  maxRetries: number,
  qualityThreshold: number
): boolean {
  // Check for critical issues that require immediate retry
  const criticalIssues = assessment.criticalIssues.filter(issue => issue.severity === 'critical');
  if (criticalIssues.length > 0) {
    return retryCount < maxRetries;
  }

  // Check overall score against threshold
  if (assessment.overallScore < qualityThreshold * 100) {
    return retryCount < maxRetries;
  }

  // Check improvement potential
  if (assessment.estimatedImprovementPotential > 10) {
    return retryCount < maxRetries;
  }

  // Check confidence level
  if (assessment.confidenceLevel < 0.8) {
    return retryCount < maxRetries;
  }

  return false;
}

function createDefaultScore(score: number): DetailedScore {
  return {
    score,
    maxPossibleScore: 100,
    breakdown: [],
    confidence: 0.5,
    reasoning: 'Default score due to assessment failure'
  };
}

function createDefaultSourceValidation(): SourceValidationResult {
  return {
    totalSources: 0,
    validSources: 0,
    primarySources: 0,
    recentSources: 0,
    authoritativeSources: 0,
    sourceQualityScore: 0,
    missingCriticalSources: [],
    sourceRecencyIssues: [],
    sourceAuthorityIssues: []
  };
}

export function generateEnhancedCorrectivePrompt(assessment: DetailedQualityAssessment): string {
  const criticalIssues = assessment.criticalIssues
    .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
    .map(issue => `- ${issue.description}: ${issue.suggestedFix}`)
    .join('\n');

  const improvementAreas = assessment.improvementAreas
    .map(area => `- ${area.category}: ${area.specificActions.join(', ')}`)
    .join('\n');

  return `ENHANCED QUALITY ASSESSMENT RESULTS:
Overall Score: ${assessment.overallScore}/100
Confidence Level: ${(assessment.confidenceLevel * 100).toFixed(1)}%
Estimated Improvement Potential: ${assessment.estimatedImprovementPotential} points

CRITICAL ISSUES TO ADDRESS:
${criticalIssues}

IMPROVEMENT AREAS:
${improvementAreas}

SOURCE VALIDATION ISSUES:
- Total Sources: ${assessment.sourceValidation.totalSources}
- Valid Sources: ${assessment.sourceValidation.validSources}
- Primary Sources: ${assessment.sourceValidation.primarySources}
- Missing Critical Sources: ${assessment.sourceValidation.missingCriticalSources.join(', ')}

SPECIFIC CORRECTIVE ACTIONS:
${assessment.correctiveInstructions}

You MUST address ALL critical and high-severity issues. Focus on improving the lowest-scoring categories and adding missing critical sources. The output must meet senior pharmaceutical industry expert standards.`;
}

export function isEnhancedQualityAcceptable(assessment: DetailedQualityAssessment): boolean {
  const threshold = parseFloat(process.env.QUALITY_THRESHOLD_SCORE || '0.85') * 100;
  
  // Check overall score
  if (assessment.overallScore < threshold) {
    return false;
  }

  // Check for critical issues
  const criticalIssues = assessment.criticalIssues.filter(issue => issue.severity === 'critical');
  if (criticalIssues.length > 0) {
    return false;
  }

  // Check confidence level
  if (assessment.confidenceLevel < 0.8) {
    return false;
  }

  // Check source quality
  if (assessment.sourceValidation.sourceQualityScore < 80) {
    return false;
  }

  return true;
} 