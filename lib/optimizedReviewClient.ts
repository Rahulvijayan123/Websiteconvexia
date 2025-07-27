interface OptimizedReviewOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface OptimizedQualityAssessment {
  overallScore: number;
  categoryScores: {
    factualAccuracy: OptimizedScore;
    scientificCoherence: OptimizedScore;
    sourceCredibility: OptimizedScore;
    pharmaExpertise: OptimizedScore;
    reasoningDepth: OptimizedScore;
    regulatoryCompliance: OptimizedScore;
    marketIntelligence: OptimizedScore;
    competitiveAnalysis: OptimizedScore;
  };
  criticalIssues: OptimizedCriticalIssue[];
  sourceValidation: OptimizedSourceValidation;
  confidenceLevel: number;
  shouldRetry: boolean;
  retryPriority: 'high' | 'medium' | 'low';
  correctiveInstructions: string;
  estimatedImprovementPotential: number;
}

interface OptimizedScore {
  score: number;
  confidence: number;
  reasoning: string;
  evidence: string[];
  issues: string[];
}

interface OptimizedCriticalIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  impact: string;
  suggestedFix: string;
}

interface OptimizedSourceValidation {
  totalSources: number;
  validSources: number;
  primarySources: number;
  recentSources: number;
  authoritativeSources: number;
  sourceQualityScore: number;
  missingCriticalSources: string[];
  sourceGaps: string[];
}

// Optimized prompt - streamlined and focused on key areas
const OPTIMIZED_REVIEW_PROMPT = `You are a senior pharmaceutical industry expert conducting rigorous quality assessment. Be extremely critical and thorough.

REPORT TO REVIEW:
{originalOutput}

QUALITY ASSESSMENT CRITERIA:

1. **FACTUAL ACCURACY (20%)**: Verify numerical values, drug names, regulatory info, market data
2. **SCIENTIFIC COHERENCE (15%)**: Assess biological plausibility, clinical interpretation, development pathways
3. **SOURCE CREDIBILITY (15%)**: Evaluate source quality, primary sources, peer-reviewed literature
4. **PHARMA EXPERTISE (15%)**: Check regulatory strategy, market access, competitive landscape
5. **REASONING DEPTH (10%)**: Assess causal relationships, assumptions, alternative scenarios
6. **REGULATORY COMPLIANCE (10%)**: Verify FDA/EMA guidance, clinical endpoints
7. **MARKET INTELLIGENCE (10%)**: Validate market projections, competitive positioning
8. **COMPETITIVE ANALYSIS (5%)**: Assess competitor identification, threats, advantages

CRITICAL REQUIREMENTS:
- MUST include FDA.gov or EMA.europa.eu sources for regulatory claims
- MUST include clinicaltrials.gov for clinical trial data
- MUST provide causal relationships and evidence chains
- MUST identify 3+ alternative scenarios
- MUST validate all assumptions with evidence

SEVERITY LEVELS:
- CRITICAL: Fabricated data, incorrect drug names, unrealistic projections
- HIGH: Missing regulatory sources, inadequate clinical data, major factual errors
- MEDIUM: Incomplete analysis, weak reasoning, outdated sources
- LOW: Minor inconsistencies, formatting issues

RESPOND WITH PURE JSON (NO MARKDOWN):
{
  "overallScore": 85.5,
  "categoryScores": {
    "factualAccuracy": {"score": 88, "confidence": 0.9, "reasoning": "Strong numerical accuracy", "evidence": ["Market data verified"], "issues": []},
    "scientificCoherence": {"score": 85, "confidence": 0.85, "reasoning": "Good biological plausibility", "evidence": ["Mechanism validated"], "issues": []},
    "sourceCredibility": {"score": 85, "confidence": 0.85, "reasoning": "Primary sources included", "evidence": ["FDA.gov cited"], "issues": []},
    "pharmaExpertise": {"score": 90, "confidence": 0.9, "reasoning": "Excellent industry knowledge", "evidence": ["Regulatory strategy clear"], "issues": []},
    "reasoningDepth": {"score": 85, "confidence": 0.85, "reasoning": "Strong causal relationships", "evidence": ["3 scenarios analyzed"], "issues": []},
    "regulatoryCompliance": {"score": 85, "confidence": 0.85, "reasoning": "FDA guidance followed", "evidence": ["Guidance documents cited"], "issues": []},
    "marketIntelligence": {"score": 88, "confidence": 0.88, "reasoning": "Excellent market analysis", "evidence": ["Projections validated"], "issues": []},
    "competitiveAnalysis": {"score": 82, "confidence": 0.82, "reasoning": "Good competitive assessment", "evidence": ["Competitors identified"], "issues": []}
  },
  "criticalIssues": [
    {
      "severity": "medium",
      "category": "sourceCredibility",
      "description": "Missing clinical trial data",
      "impact": "Reduces clinical confidence",
      "suggestedFix": "Include clinicaltrials.gov data"
    }
  ],
  "sourceValidation": {
    "totalSources": 20,
    "validSources": 18,
    "primarySources": 8,
    "recentSources": 15,
    "authoritativeSources": 12,
    "sourceQualityScore": 85,
    "missingCriticalSources": ["clinicaltrials.gov"],
    "sourceGaps": ["Limited Phase 3 data"]
  },
  "confidenceLevel": 0.85,
  "shouldRetry": false,
  "retryPriority": "low",
  "correctiveInstructions": "Add clinical trial data from clinicaltrials.gov",
  "estimatedImprovementPotential": 5.0
}`;

export async function optimizedReviewPerplexityOutput(
  originalOutput: any,
  retryCount: number = 0,
  options: OptimizedReviewOptions = {}
): Promise<{
  assessment: OptimizedQualityAssessment;
  originalOutput: any;
  retryCount: number;
  totalTimeMs: number;
  reviewMetadata: any;
}> {
  const startTime = Date.now();
  const maxRetries = parseInt(process.env.MAX_RETRY_ATTEMPTS || '3');
  const qualityThreshold = parseFloat(process.env.QUALITY_THRESHOLD_SCORE || '0.82') * 100; // Adjusted threshold

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const reviewPrompt = OPTIMIZED_REVIEW_PROMPT.replace(
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
            content: 'You are a senior pharmaceutical industry expert conducting rigorous quality assessment. Be extremely critical, thorough, and analytical. Focus on source credibility, reasoning depth, and scientific coherence. Respond with ONLY valid JSON.'
          },
          {
            role: 'user',
            content: reviewPrompt
          }
        ],
        max_tokens: options.max_tokens || 4000, // Optimized token limit
        temperature: options.temperature || 0.05,
        top_p: options.top_p || 0.9,
        frequency_penalty: options.frequency_penalty || 0.2, // Increased to reduce repetition
        presence_penalty: options.presence_penalty || 0.2 // Increased to encourage comprehensive coverage
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const assessmentText = result.choices[0].message.content;
    
    let assessment: OptimizedQualityAssessment;
    try {
      // Enhanced JSON parsing with better error handling
      let cleanedText = assessmentText.trim();
      
      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      cleanedText = cleanedText.trim();
      
      // Try to extract JSON if response is malformed
      if (!cleanedText.startsWith('{')) {
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }
      }
      
      assessment = JSON.parse(cleanedText);
    } catch (parseError: any) {
      console.error('JSON parsing failed:', parseError);
      console.error('Response length:', assessmentText.length);
      
      // Return optimized default assessment
      assessment = createOptimizedDefaultAssessment(parseError.message);
    }

    const totalTimeMs = Date.now() - startTime;

    // Enhanced retry logic with source credibility focus
    const shouldRetry = determineOptimizedRetryDecision(assessment, retryCount, maxRetries, qualityThreshold);

    return {
      assessment,
      originalOutput,
      retryCount,
      totalTimeMs,
      reviewMetadata: {
        model: options.model || 'gpt-4o',
        tokensUsed: result.usage?.total_tokens,
        promptTokens: result.usage?.prompt_tokens,
        completionTokens: result.usage?.completion_tokens,
        responseTime: totalTimeMs
      }
    };

  } catch (error: any) {
    const totalTimeMs = Date.now() - startTime;
    
    const defaultAssessment = createOptimizedDefaultAssessment(error.message);

    return {
      assessment: defaultAssessment,
      originalOutput,
      retryCount,
      totalTimeMs,
      reviewMetadata: { error: error.message }
    };
  }
}

function createOptimizedDefaultAssessment(errorMessage: string): OptimizedQualityAssessment {
  return {
    overallScore: 50,
    categoryScores: {
      factualAccuracy: { score: 50, confidence: 0.5, reasoning: 'Assessment failed', evidence: [], issues: [errorMessage] },
      scientificCoherence: { score: 50, confidence: 0.5, reasoning: 'Assessment failed', evidence: [], issues: [errorMessage] },
      sourceCredibility: { score: 50, confidence: 0.5, reasoning: 'Assessment failed', evidence: [], issues: [errorMessage] },
      pharmaExpertise: { score: 50, confidence: 0.5, reasoning: 'Assessment failed', evidence: [], issues: [errorMessage] },
      reasoningDepth: { score: 50, confidence: 0.5, reasoning: 'Assessment failed', evidence: [], issues: [errorMessage] },
      regulatoryCompliance: { score: 50, confidence: 0.5, reasoning: 'Assessment failed', evidence: [], issues: [errorMessage] },
      marketIntelligence: { score: 50, confidence: 0.5, reasoning: 'Assessment failed', evidence: [], issues: [errorMessage] },
      competitiveAnalysis: { score: 50, confidence: 0.5, reasoning: 'Assessment failed', evidence: [], issues: [errorMessage] }
    },
    criticalIssues: [{
      severity: 'critical',
      category: 'system',
      description: 'Review process failed',
      impact: 'Unable to assess quality',
      suggestedFix: 'Retry with improved error handling'
    }],
    sourceValidation: {
      totalSources: 0,
      validSources: 0,
      primarySources: 0,
      recentSources: 0,
      authoritativeSources: 0,
      sourceQualityScore: 0,
      missingCriticalSources: ['FDA.gov', 'clinicaltrials.gov'],
      sourceGaps: ['Assessment failed']
    },
    confidenceLevel: 0.5,
    shouldRetry: true,
    retryPriority: 'high',
    correctiveInstructions: 'Review process failed - retry with improved error handling',
    estimatedImprovementPotential: 50
  };
}

function determineOptimizedRetryDecision(
  assessment: OptimizedQualityAssessment,
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
  if (assessment.overallScore < qualityThreshold) {
    return retryCount < maxRetries;
  }

  // Check source credibility specifically (highest priority)
  if (assessment.categoryScores.sourceCredibility.score < 80) {
    return retryCount < maxRetries;
  }

  // Check reasoning depth (second priority)
  if (assessment.categoryScores.reasoningDepth.score < 80) {
    return retryCount < maxRetries;
  }

  // Check improvement potential
  if (assessment.estimatedImprovementPotential > 8) {
    return retryCount < maxRetries;
  }

  // Check confidence level
  if (assessment.confidenceLevel < 0.8) {
    return retryCount < maxRetries;
  }

  return false;
}

export function isOptimizedQualityAcceptable(assessment: OptimizedQualityAssessment): boolean {
  const threshold = parseFloat(process.env.QUALITY_THRESHOLD_SCORE || '0.82') * 100; // Adjusted threshold
  
  // Check overall score
  if (assessment.overallScore < threshold) {
    return false;
  }

  // Check for critical issues
  const criticalIssues = assessment.criticalIssues.filter(issue => issue.severity === 'critical');
  if (criticalIssues.length > 0) {
    return false;
  }

  // Check source credibility (highest priority)
  if (assessment.categoryScores.sourceCredibility.score < 80) {
    return false;
  }

  // Check reasoning depth (second priority)
  if (assessment.categoryScores.reasoningDepth.score < 80) {
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

export function generateOptimizedCorrectivePrompt(assessment: OptimizedQualityAssessment): string {
  const criticalIssues = assessment.criticalIssues
    .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
    .map(issue => `- ${issue.description}: ${issue.suggestedFix}`)
    .join('\n');

  const sourceGaps = assessment.sourceValidation.sourceGaps.length > 0 
    ? `\nSOURCE GAPS:\n${assessment.sourceValidation.sourceGaps.map(gap => `- ${gap}`).join('\n')}`
    : '';

  return `OPTIMIZED QUALITY ASSESSMENT RESULTS:
Overall Score: ${assessment.overallScore}/100
Confidence Level: ${(assessment.confidenceLevel * 100).toFixed(1)}%
Estimated Improvement Potential: ${assessment.estimatedImprovementPotential} points

CRITICAL ISSUES TO ADDRESS:
${criticalIssues}

SOURCE VALIDATION:
- Total Sources: ${assessment.sourceValidation.totalSources}
- Primary Sources: ${assessment.sourceValidation.primarySources}
- Missing Critical Sources: ${assessment.sourceValidation.missingCriticalSources.join(', ')}${sourceGaps}

CATEGORY SCORES:
- Source Credibility: ${assessment.categoryScores.sourceCredibility.score}/100 (Target: 80+)
- Reasoning Depth: ${assessment.categoryScores.reasoningDepth.score}/100 (Target: 80+)
- Scientific Coherence: ${assessment.categoryScores.scientificCoherence.score}/100 (Target: 80+)

SPECIFIC CORRECTIVE ACTIONS:
${assessment.correctiveInstructions}

You MUST address ALL critical and high-severity issues. Focus on improving source credibility and reasoning depth. The output must meet senior pharmaceutical industry expert standards.`;
} 