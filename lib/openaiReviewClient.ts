interface OpenAIReviewOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface QualityAssessment {
  overallScore: number;
  factualAccuracy: number;
  scientificCoherence: number;
  sourceCredibility: number;
  pharmaExpertise: number;
  reasoningDepth: number;
  issues: string[];
  recommendations: string[];
  shouldRetry: boolean;
  correctivePrompt?: string;
}

interface ReviewResult {
  assessment: QualityAssessment;
  originalOutput: any;
  reviewedOutput?: any;
  retryCount: number;
  totalTimeMs: number;
}

// Senior pharma domain expert review criteria
const PHARMA_QUALITY_CRITERIA = {
  factualAccuracy: {
    weight: 0.25,
    criteria: [
      'All numerical values are realistic and within industry ranges',
      'Drug names, targets, and indications are accurately identified',
      'Regulatory timelines and requirements are correct',
      'Market data sources are current and authoritative',
      'Patent information is accurate and up-to-date'
    ]
  },
  scientificCoherence: {
    weight: 0.20,
    criteria: [
      'Biological mechanisms are correctly described',
      'Clinical trial data interpretation is sound',
      'Drug development pathways are realistic',
      'Safety and efficacy profiles are consistent',
      'Dosing and administration are scientifically plausible'
    ]
  },
  sourceCredibility: {
    weight: 0.20,
    criteria: [
      'Primary sources are used (FDA, EMA, clinical trials.gov)',
      'Peer-reviewed literature is cited appropriately',
      'Industry reports are from reputable sources',
      'Patent databases are correctly referenced',
      'Financial data comes from authoritative sources'
    ]
  },
  pharmaExpertise: {
    weight: 0.20,
    criteria: [
      'Regulatory strategy is well-articulated',
      'Market access considerations are comprehensive',
      'Competitive landscape analysis is thorough',
      'Pricing strategy is realistic and well-reasoned',
      'Risk assessment is balanced and informed'
    ]
  },
  reasoningDepth: {
    weight: 0.15,
    criteria: [
      'Causal relationships are clearly established',
      'Assumptions are explicitly stated and justified',
      'Alternative scenarios are considered',
      'Limitations are acknowledged',
      'Conclusions are supported by evidence'
    ]
  }
};

const REVIEW_PROMPT_TEMPLATE = `You are a senior pharmaceutical industry expert with 25+ years of experience in regulatory affairs, market access, and strategic planning. You are conducting a rigorous quality assessment of a commercial intelligence report.

REPORT TO REVIEW:
{originalOutput}

QUALITY ASSESSMENT CRITERIA:
1. Factual Accuracy (25%): Verify all data points, drug names, regulatory information, and market figures
2. Scientific Coherence (20%): Assess biological plausibility, clinical trial interpretation, and development pathways
3. Source Credibility (20%): Evaluate source quality, recency, and authority
4. Pharma Expertise (20%): Check regulatory strategy, market access analysis, and competitive intelligence
5. Reasoning Depth (15%): Assess logical flow, assumption clarity, and evidence-based conclusions

SCORING SYSTEM:
- 0.9-1.0: Exceptional quality, meets senior expert standards
- 0.8-0.89: High quality, minor issues
- 0.7-0.79: Good quality, some concerns
- 0.6-0.69: Acceptable quality, significant issues
- Below 0.6: Unacceptable quality, requires complete revision

CRITICAL FAILURE INDICATORS:
- Any fabricated or hallucinated data
- Incorrect drug names or mechanisms
- Unrealistic market projections (>10x industry norms)
- Missing critical regulatory considerations
- Inadequate source citations

Provide a detailed assessment in the following JSON format:
{
  "overallScore": 0.85,
  "factualAccuracy": 0.9,
  "scientificCoherence": 0.85,
  "sourceCredibility": 0.8,
  "pharmaExpertise": 0.9,
  "reasoningDepth": 0.8,
  "issues": ["Issue 1", "Issue 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "shouldRetry": false,
  "correctivePrompt": "If shouldRetry is true, provide specific instructions for improvement"
}

Be extremely strict in your assessment. This report must meet the standards of a regulatory affairs lead or therapeutic area strategist.`;

export async function reviewPerplexityOutput(
  originalOutput: any,
  retryCount: number = 0
): Promise<ReviewResult> {
  const startTime = Date.now();
  const maxRetries = parseInt(process.env.MAX_RETRY_ATTEMPTS || '3');
  const qualityThreshold = parseFloat(process.env.QUALITY_THRESHOLD_SCORE || '0.85');

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const reviewPrompt = REVIEW_PROMPT_TEMPLATE.replace(
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
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a senior pharmaceutical industry expert conducting rigorous quality assessment. Be extremely critical and thorough.'
          },
          {
            role: 'user',
            content: reviewPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for consistent assessment
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const assessmentText = result.choices[0].message.content;
    
    let assessment: QualityAssessment;
    try {
      assessment = JSON.parse(assessmentText);
    } catch (parseError) {
      throw new Error(`Failed to parse assessment JSON: ${parseError}`);
    }

    const totalTimeMs = Date.now() - startTime;

    // Determine if retry is needed
    const shouldRetry = assessment.shouldRetry && 
                       retryCount < maxRetries && 
                       assessment.overallScore < qualityThreshold;

    return {
      assessment,
      originalOutput,
      retryCount,
      totalTimeMs,
      reviewedOutput: shouldRetry ? undefined : originalOutput
    };

  } catch (error: any) {
    const totalTimeMs = Date.now() - startTime;
    
    // If review fails, create a default assessment that triggers retry
    const defaultAssessment: QualityAssessment = {
      overallScore: 0.5,
      factualAccuracy: 0.5,
      scientificCoherence: 0.5,
      sourceCredibility: 0.5,
      pharmaExpertise: 0.5,
      reasoningDepth: 0.5,
      issues: ['Review process failed', error.message],
      recommendations: ['Retry with improved error handling'],
      shouldRetry: retryCount < maxRetries
    };

    return {
      assessment: defaultAssessment,
      originalOutput,
      retryCount,
      totalTimeMs
    };
  }
}

export function generateCorrectivePrompt(
  assessment: QualityAssessment,
  originalOutput: any
): string {
  const issues = assessment.issues.join(', ');
  const recommendations = assessment.recommendations.join(', ');
  
  return `CRITICAL QUALITY ISSUES DETECTED:
Previous output scored ${(assessment.overallScore * 100).toFixed(1)}% overall quality.

MAJOR ISSUES:
${assessment.issues.map(issue => `- ${issue}`).join('\n')}

REQUIRED IMPROVEMENTS:
${assessment.recommendations.map(rec => `- ${rec}`).join('\n')}

QUALITY BREAKDOWN:
- Factual Accuracy: ${(assessment.factualAccuracy * 100).toFixed(1)}%
- Scientific Coherence: ${(assessment.scientificCoherence * 100).toFixed(1)}%
- Source Credibility: ${(assessment.sourceCredibility * 100).toFixed(1)}%
- Pharma Expertise: ${(assessment.pharmaExpertise * 100).toFixed(1)}%
- Reasoning Depth: ${(assessment.reasoningDepth * 100).toFixed(1)}%

You MUST address ALL identified issues in your next response. Focus on:
1. Verifying every data point with authoritative sources
2. Ensuring scientific accuracy and biological plausibility
3. Providing comprehensive source citations
4. Demonstrating deep pharmaceutical industry expertise
5. Building clear causal relationships and logical reasoning

The output must meet senior regulatory affairs or therapeutic area strategist standards.`;
}

export function isQualityAcceptable(assessment: QualityAssessment): boolean {
  const threshold = parseFloat(process.env.QUALITY_THRESHOLD_SCORE || '0.85');
  return assessment.overallScore >= threshold && !assessment.shouldRetry;
} 