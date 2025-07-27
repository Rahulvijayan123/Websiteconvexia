const fs = require('fs');
const path = require('path');

// Load environment variables manually
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

async function testReviewSystem() {
  console.log('🔬 PHARMA REVIEW SYSTEM TESTING');
  console.log('================================\n');

  // Test input data
  const testInput = {
    cagr: "12.5%",
    marketSize: "2.8B",
    directCompetitors: ["Enhertu", "Kadcyla", "Perjeta"],
    prvEligibility: "Eligible - Orphan Drug Designation",
    nationalPriority: "High - Unmet Medical Need",
    reviewTimelineMonths: "12",
    peakRevenue2030: "1.8B",
    total10YearRevenue: "12.5B",
    peakMarketShare2030: "15%",
    peakPatients2030: "150K",
    avgSellingPrice: "$45K",
    persistenceRate: "75%",
    treatmentDuration: "18 months",
    geographicSplit: "60% US / 40% Ex-US",
    competitorPricing: [
      {
        drugName: "Enhertu",
        annualPrice: "$165K",
        indication: "HER2+ Breast Cancer",
        accessLevel: "Broad",
        rationale: "FDA approved with broad payer coverage"
      }
    ],
    pricingScenarios: [
      {
        scenario: "Base Case",
        usPrice: "$180K",
        exUsPrice: "$120K",
        grossToNet: "35%",
        copay: "Yes",
        access: "Yes",
        genericYear: "Yr 8",
        lossOfExclusivity: "65%",
        rationale: "Competitive pricing with comprehensive access programs"
      }
    ],
    strategicTailwindData: {
      fdaDesignations: {
        breakthroughTherapy: "Likely",
        fastTrack: "Eligible",
        orphanDrug: "Eligible",
        priorityReview: "Likely",
        rationale: "Unmet medical need in metastatic setting"
      }
    },
    dealActivity: [
      {
        assetName: "Enhertu",
        buyer: "AstraZeneca",
        developmentStage: "Phase 3",
        dealPrice: "$6.9B",
        dealDate: "2020-03-27",
        rationale: "Major global co-development and commercialization deal"
      }
    ],
    pipelineAnalysis: {
      crowdingPercent: "12%",
      competitiveThreats: ["ADC competition", "Novel HER2 inhibitors"],
      strategicFitRank: "85"
    }
  };

  console.log('🔍 Testing OpenAI Review System...');
  console.log('API Key configured:', !!process.env.OPENAI_API_KEY);
  console.log('');

  try {
    // Test 1: Basic review
    console.log('📊 TEST 1: Basic Review');
    console.log('----------------------');
    const startTime = Date.now();
    
    const reviewResult = await enhancedReviewPerplexityOutput(testInput, 0, {
      model: 'gpt-4o',
      temperature: 0.05,
      max_tokens: 6000
    });

    const reviewTime = Date.now() - startTime;
    const assessment = reviewResult.assessment;

    console.log(`Review Time: ${reviewTime}ms`);
    console.log(`Overall Score: ${assessment.overallScore}/100`);
    console.log(`Confidence Level: ${(assessment.confidenceLevel * 100).toFixed(1)}%`);
    console.log(`Source Quality Score: ${assessment.sourceValidation.sourceQualityScore}/100`);
    console.log(`Critical Issues: ${assessment.criticalIssues.filter(issue => issue.severity === 'critical').length}`);
    console.log('');

    // Test 2: Quality assessment
    console.log('🎯 TEST 2: Quality Assessment');
    console.log('----------------------------');
    const isAcceptable = isEnhancedQualityAcceptable(assessment);
    console.log(`Quality Acceptable: ${isAcceptable ? '✅ YES' : '❌ NO'}`);
    console.log(`Should Retry: ${assessment.shouldRetry ? '🔄 YES' : '✅ NO'}`);
    console.log(`Retry Priority: ${assessment.retryPriority.toUpperCase()}`);
    console.log('');

    // Test 3: Detailed scoring breakdown
    console.log('📋 TEST 3: Detailed Scoring Breakdown');
    console.log('------------------------------------');
    Object.entries(assessment.categoryScores).forEach(([category, score]) => {
      console.log(`${category}: ${score.score}/100 (confidence: ${(score.confidence * 100).toFixed(1)}%)`);
    });
    console.log('');

    // Test 4: Critical issues analysis
    console.log('⚠️ TEST 4: Critical Issues Analysis');
    console.log('----------------------------------');
    if (assessment.criticalIssues.length === 0) {
      console.log('✅ No critical issues found');
    } else {
      assessment.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.description}`);
        console.log(`   Impact: ${issue.impact}`);
        console.log(`   Suggested Fix: ${issue.suggestedFix}`);
      });
    }
    console.log('');

    // Test 5: Source validation
    console.log('🔍 TEST 5: Source Validation');
    console.log('----------------------------');
    const sourceValidation = assessment.sourceValidation;
    console.log(`Total Sources: ${sourceValidation.totalSources}`);
    console.log(`Valid Sources: ${sourceValidation.validSources}`);
    console.log(`Primary Sources: ${sourceValidation.primarySources}`);
    console.log(`Recent Sources: ${sourceValidation.recentSources}`);
    console.log(`Authoritative Sources: ${sourceValidation.authoritativeSources}`);
    console.log(`Source Quality Score: ${sourceValidation.sourceQualityScore}/100`);
    
    if (sourceValidation.missingCriticalSources.length > 0) {
      console.log(`Missing Critical Sources: ${sourceValidation.missingCriticalSources.join(', ')}`);
    }
    console.log('');

    // Test 6: Performance analysis
    console.log('⚡ TEST 6: Performance Analysis');
    console.log('-------------------------------');
    console.log(`Review Time: ${reviewTime}ms`);
    console.log(`Tokens Used: ${reviewResult.reviewMetadata?.tokensUsed || 'N/A'}`);
    console.log(`Prompt Tokens: ${reviewResult.reviewMetadata?.promptTokens || 'N/A'}`);
    console.log(`Completion Tokens: ${reviewResult.reviewMetadata?.completionTokens || 'N/A'}`);
    console.log('');

    // Overall assessment
    console.log('🎯 OVERALL ASSESSMENT');
    console.log('---------------------');
    if (assessment.overallScore >= 90) {
      console.log('✅ EXCELLENT: Review system is performing at optimal levels');
    } else if (assessment.overallScore >= 80) {
      console.log('🟡 GOOD: Review system is performing well with room for improvement');
    } else if (assessment.overallScore >= 70) {
      console.log('🟠 FAIR: Review system needs optimization to meet quality standards');
    } else {
      console.log('🔴 POOR: Review system requires significant improvements');
    }

    console.log(`\n📊 Final Score: ${assessment.overallScore}/100`);
    console.log(`🎯 Confidence: ${(assessment.confidenceLevel * 100).toFixed(1)}%`);
    console.log(`⏱️ Performance: ${reviewTime}ms`);

    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      testInput,
      assessment,
      reviewTime,
      reviewMetadata: reviewResult.reviewMetadata,
      overallScore: assessment.overallScore
    };

    fs.writeFileSync('review-test-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results saved to: review-test-results.json');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Enhanced review function (simplified version)
async function enhancedReviewPerplexityOutput(originalOutput, retryCount = 0, options = {}) {
  const startTime = Date.now();
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const reviewPrompt = `You are a senior pharmaceutical industry expert with 25+ years of experience conducting rigorous quality assessment of commercial intelligence reports. You must be extremely critical and thorough.

REPORT TO REVIEW:
${JSON.stringify(originalOutput, null, 2)}

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

PROVIDE RESPONSE IN PURE JSON FORMAT (NO MARKDOWN, NO CODE BLOCKS):
{
  "overallScore": 85.5,
  "categoryScores": {
    "factualAccuracy": {"score": 88, "confidence": 0.9, "reasoning": "Strong numerical accuracy"},
    "scientificCoherence": {"score": 85, "confidence": 0.85, "reasoning": "Good biological plausibility"},
    "sourceCredibility": {"score": 75, "confidence": 0.7, "reasoning": "Missing primary sources"},
    "pharmaExpertise": {"score": 90, "confidence": 0.9, "reasoning": "Excellent industry knowledge"},
    "reasoningDepth": {"score": 80, "confidence": 0.8, "reasoning": "Good causal relationships"},
    "regulatoryCompliance": {"score": 85, "confidence": 0.85, "reasoning": "Strong regulatory understanding"},
    "marketIntelligence": {"score": 88, "confidence": 0.88, "reasoning": "Excellent market analysis"},
    "competitiveAnalysis": {"score": 82, "confidence": 0.82, "reasoning": "Good competitive assessment"}
  },
  "criticalIssues": [
    {
      "severity": "medium",
      "category": "sourceCredibility",
      "description": "Missing primary regulatory sources",
      "impact": "Reduces confidence in regulatory analysis",
      "suggestedFix": "Include FDA.gov and EMA.europa.eu sources"
    }
  ],
  "sourceValidation": {
    "totalSources": 20,
    "validSources": 18,
    "primarySources": 8,
    "recentSources": 15,
    "authoritativeSources": 12,
    "sourceQualityScore": 82,
    "missingCriticalSources": ["FDA.gov", "clinicaltrials.gov"]
  },
  "confidenceLevel": 0.85,
  "shouldRetry": false,
  "retryPriority": "low",
  "correctiveInstructions": "Add FDA guidance documents to improve source credibility",
  "estimatedImprovementPotential": 8.5
}

Be extremely strict and thorough. This assessment determines whether the report meets senior pharmaceutical industry expert standards.

IMPORTANT: Respond with ONLY the JSON object. Do not include any markdown formatting, code blocks, or explanatory text.`;

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
        max_tokens: options.max_tokens || 8000,
        temperature: options.temperature || 0.05,
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
    
    let assessment;
    try {
      // Clean the response text to extract JSON
      let cleanedText = assessmentText.trim();
      
      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      // Remove any leading/trailing whitespace
      cleanedText = cleanedText.trim();
      
      assessment = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Raw response length:', assessmentText.length);
      console.error('Parse error:', parseError);
      
      // Try to extract partial JSON if possible
      try {
        const lines = assessmentText.split('\n');
        let jsonStart = -1;
        let jsonEnd = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('{')) {
            jsonStart = i;
            break;
          }
        }
        
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].trim().endsWith('}')) {
            jsonEnd = i;
            break;
          }
        }
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const partialJson = lines.slice(jsonStart, jsonEnd + 1).join('\n');
          console.log('Attempting to parse partial JSON...');
          assessment = JSON.parse(partialJson);
        } else {
          throw new Error('Could not extract JSON from response');
        }
      } catch (partialParseError) {
        throw new Error(`Failed to parse assessment JSON: ${parseError}. Partial parse also failed: ${partialParseError}`);
      }
    }

    const totalTimeMs = Date.now() - startTime;

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

  } catch (error) {
    const totalTimeMs = Date.now() - startTime;
    
    // Default assessment for failures
    const defaultAssessment = {
      overallScore: 50,
      categoryScores: {
        factualAccuracy: { score: 50, maxPossibleScore: 100, breakdown: [], confidence: 0.5, reasoning: 'Default score due to assessment failure' },
        scientificCoherence: { score: 50, maxPossibleScore: 100, breakdown: [], confidence: 0.5, reasoning: 'Default score due to assessment failure' },
        sourceCredibility: { score: 50, maxPossibleScore: 100, breakdown: [], confidence: 0.5, reasoning: 'Default score due to assessment failure' },
        pharmaExpertise: { score: 50, maxPossibleScore: 100, breakdown: [], confidence: 0.5, reasoning: 'Default score due to assessment failure' },
        reasoningDepth: { score: 50, maxPossibleScore: 100, breakdown: [], confidence: 0.5, reasoning: 'Default score due to assessment failure' },
        regulatoryCompliance: { score: 50, maxPossibleScore: 100, breakdown: [], confidence: 0.5, reasoning: 'Default score due to assessment failure' },
        marketIntelligence: { score: 50, maxPossibleScore: 100, breakdown: [], confidence: 0.5, reasoning: 'Default score due to assessment failure' },
        competitiveAnalysis: { score: 50, maxPossibleScore: 100, breakdown: [], confidence: 0.5, reasoning: 'Default score due to assessment failure' }
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
      sourceValidation: {
        totalSources: 0,
        validSources: 0,
        primarySources: 0,
        recentSources: 0,
        authoritativeSources: 0,
        sourceQualityScore: 0,
        missingCriticalSources: [],
        sourceRecencyIssues: [],
        sourceAuthorityIssues: []
      },
      confidenceLevel: 0.5,
      shouldRetry: retryCount < 3,
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

function isEnhancedQualityAcceptable(assessment) {
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

// Run the test
testReviewSystem().catch(console.error); 