const fs = require('fs');

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

async function testConsistencyAnalysis() {
  console.log('🔬 CONSISTENCY ANALYSIS TESTING');
  console.log('===============================\n');

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

  console.log('🔍 Running consistency analysis...');
  console.log('API Key configured:', !!process.env.OPENAI_API_KEY);
  console.log('');

  const results = [];
  const numTests = 5;

  for (let i = 1; i <= numTests; i++) {
    console.log(`📊 TEST ${i}/${numTests}`);
    console.log('------------------------');
    
    const startTime = Date.now();
    
    try {
      const reviewResult = await optimizedReviewPerplexityOutput(testInput, 0, {
        model: 'gpt-4o',
        temperature: 0.05,
        max_tokens: 4000
      });

      const reviewTime = Date.now() - startTime;
      const assessment = reviewResult.assessment;

      const result = {
        testNumber: i,
        overallScore: assessment.overallScore,
        confidenceLevel: assessment.confidenceLevel,
        reviewTime,
        tokensUsed: reviewResult.reviewMetadata?.tokensUsed || 0,
        categoryScores: Object.fromEntries(
          Object.entries(assessment.categoryScores).map(([key, value]) => [key, value.score])
        ),
        criticalIssues: assessment.criticalIssues.length,
        sourceQualityScore: assessment.sourceValidation.sourceQualityScore,
        assessment: assessment
      };

      results.push(result);

      console.log(`Overall Score: ${assessment.overallScore}/100`);
      console.log(`Confidence Level: ${(assessment.confidenceLevel * 100).toFixed(1)}%`);
      console.log(`Review Time: ${reviewTime}ms`);
      console.log(`Tokens Used: ${result.tokensUsed}`);
      console.log(`Critical Issues: ${result.criticalIssues}`);
      console.log('');

      // Add delay between tests
      if (i < numTests) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`Test ${i} failed:`, error.message);
      results.push({
        testNumber: i,
        overallScore: 0,
        confidenceLevel: 0,
        reviewTime: 0,
        tokensUsed: 0,
        categoryScores: {},
        criticalIssues: 0,
        sourceQualityScore: 0,
        error: error.message
      });
    }
  }

  // Analyze consistency
  console.log('📈 CONSISTENCY ANALYSIS RESULTS');
  console.log('==============================');

  const scores = results.filter(r => !r.error).map(r => r.overallScore);
  const confidences = results.filter(r => !r.error).map(r => r.confidenceLevel);
  const times = results.filter(r => !r.error).map(r => r.reviewTime);
  const tokens = results.filter(r => !r.error).map(r => r.tokensUsed);

  if (scores.length > 0) {
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const scoreVariance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const scoreStdDev = Math.sqrt(scoreVariance);
    const scoreRange = Math.max(...scores) - Math.min(...scores);

    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    const confidenceVariance = confidences.reduce((sum, conf) => sum + Math.pow(conf - avgConfidence, 2), 0) / confidences.length;
    const confidenceStdDev = Math.sqrt(confidenceVariance);

    console.log(`📊 Score Analysis:`);
    console.log(`   Average Score: ${avgScore.toFixed(1)}/100`);
    console.log(`   Score Range: ${scoreRange.toFixed(1)} (${Math.min(...scores)} - ${Math.max(...scores)})`);
    console.log(`   Score Standard Deviation: ${scoreStdDev.toFixed(2)}`);
    console.log(`   Score Coefficient of Variation: ${((scoreStdDev / avgScore) * 100).toFixed(1)}%`);
    console.log('');

    console.log(`🎯 Confidence Analysis:`);
    console.log(`   Average Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`   Confidence Range: ${((Math.max(...confidences) - Math.min(...confidences)) * 100).toFixed(1)}%`);
    console.log(`   Confidence Standard Deviation: ${(confidenceStdDev * 100).toFixed(2)}%`);
    console.log('');

    console.log(`⏱️ Performance Analysis:`);
    console.log(`   Average Review Time: ${(times.reduce((sum, time) => sum + time, 0) / times.length).toFixed(0)}ms`);
    console.log(`   Average Tokens Used: ${(tokens.reduce((sum, token) => sum + token, 0) / tokens.length).toFixed(0)}`);
    console.log('');

    // Consistency assessment
    const scoreConsistency = scoreStdDev < 3 ? 'EXCELLENT' : scoreStdDev < 5 ? 'GOOD' : scoreStdDev < 8 ? 'FAIR' : 'POOR';
    const confidenceConsistency = confidenceStdDev < 0.05 ? 'EXCELLENT' : confidenceStdDev < 0.1 ? 'GOOD' : confidenceStdDev < 0.15 ? 'FAIR' : 'POOR';

    console.log(`🔄 Consistency Assessment:`);
    console.log(`   Score Consistency: ${scoreConsistency} (StdDev: ${scoreStdDev.toFixed(2)})`);
    console.log(`   Confidence Consistency: ${confidenceConsistency} (StdDev: ${(confidenceStdDev * 100).toFixed(2)}%)`);
    console.log('');

    // Detailed results
    console.log(`📋 Detailed Results:`);
    results.forEach(result => {
      if (result.error) {
        console.log(`   Test ${result.testNumber}: ERROR - ${result.error}`);
      } else {
        console.log(`   Test ${result.testNumber}: ${result.overallScore}/100 (${(result.confidenceLevel * 100).toFixed(1)}% confidence, ${result.reviewTime}ms)`);
      }
    });
    console.log('');

    // Recommendations
    console.log(`💡 Consistency Recommendations:`);
    if (scoreStdDev > 5) {
      console.log(`   ⚠️ Score variance is high (${scoreStdDev.toFixed(2)}). Consider:`);
      console.log(`      - Reducing temperature further (current: 0.05)`);
      console.log(`      - Adding more specific scoring criteria`);
      console.log(`      - Implementing score normalization`);
    }
    if (confidenceStdDev > 0.1) {
      console.log(`   ⚠️ Confidence variance is high (${(confidenceStdDev * 100).toFixed(2)}%). Consider:`);
      console.log(`      - Standardizing confidence calculation`);
      console.log(`      - Adding confidence anchors in prompt`);
    }
    if (scoreConsistency === 'EXCELLENT' && confidenceConsistency === 'EXCELLENT') {
      console.log(`   ✅ Excellent consistency achieved!`);
    }
  }

  // Save detailed results
  const analysisResults = {
    timestamp: new Date().toISOString(),
    testInput,
    results,
    analysis: {
      avgScore: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
      scoreStdDev: scores.length > 0 ? Math.sqrt(scores.reduce((sum, score) => sum + Math.pow(score - (scores.reduce((sum, s) => sum + s, 0) / scores.length), 2), 0) / scores.length) : 0,
      avgConfidence: confidences.length > 0 ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length : 0,
      confidenceStdDev: confidences.length > 0 ? Math.sqrt(confidences.reduce((sum, conf) => sum + Math.pow(conf - (confidences.reduce((sum, c) => sum + c, 0) / confidences.length), 2), 0) / confidences.length) : 0
    }
  };

  fs.writeFileSync('consistency-analysis-results.json', JSON.stringify(analysisResults, null, 2));
  console.log('💾 Detailed results saved to: consistency-analysis-results.json');
}

// Optimized review function (same as before)
async function optimizedReviewPerplexityOutput(originalOutput, retryCount = 0, options = {}) {
  const startTime = Date.now();
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const reviewPrompt = `You are a senior pharmaceutical industry expert conducting rigorous quality assessment. Be extremely critical and thorough.

REPORT TO REVIEW:
${JSON.stringify(originalOutput, null, 2)}

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
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.05,
        top_p: options.top_p || 0.9,
        frequency_penalty: options.frequency_penalty || 0.2,
        presence_penalty: options.presence_penalty || 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const assessmentText = result.choices[0].message.content;
    
    let assessment;
    try {
      let cleanedText = assessmentText.trim();
      
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      cleanedText = cleanedText.trim();
      
      if (!cleanedText.startsWith('{')) {
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }
      }
      
      assessment = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      assessment = createOptimizedDefaultAssessment(parseError.message);
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
        completionTokens: result.usage?.completion_tokens,
        responseTime: totalTimeMs
      }
    };

  } catch (error) {
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

function createOptimizedDefaultAssessment(errorMessage) {
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

// Run the test
testConsistencyAnalysis().catch(console.error); 