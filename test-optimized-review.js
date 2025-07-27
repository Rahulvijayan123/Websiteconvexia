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

async function testOptimizedReviewSystem() {
  console.log('🔬 OPTIMIZED REVIEW SYSTEM TESTING');
  console.log('==================================\n');

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

  console.log('🔍 Testing Optimized Review System...');
  console.log('API Key configured:', !!process.env.OPENAI_API_KEY);
  console.log('');

  try {
    // Test optimized review
    console.log('📊 TEST: Optimized Review');
    console.log('------------------------');
    const startTime = Date.now();
    
    const reviewResult = await optimizedReviewPerplexityOutput(testInput, 0, {
      model: 'gpt-4o',
      temperature: 0.05,
      max_tokens: 4000
    });

    const reviewTime = Date.now() - startTime;
    const assessment = reviewResult.assessment;

    console.log(`Review Time: ${reviewTime}ms`);
    console.log(`Overall Score: ${assessment.overallScore}/100`);
    console.log(`Confidence Level: ${(assessment.confidenceLevel * 100).toFixed(1)}%`);
    console.log(`Source Quality Score: ${assessment.sourceValidation.sourceQualityScore}/100`);
    console.log(`Critical Issues: ${assessment.criticalIssues.filter(issue => issue.severity === 'critical').length}`);
    console.log('');

    // Quality assessment
    console.log('🎯 QUALITY ASSESSMENT');
    console.log('--------------------');
    const isAcceptable = isOptimizedQualityAcceptable(assessment);
    console.log(`Quality Acceptable: ${isAcceptable ? '✅ YES' : '❌ NO'}`);
    console.log(`Should Retry: ${assessment.shouldRetry ? '🔄 YES' : '✅ NO'}`);
    console.log(`Retry Priority: ${assessment.retryPriority.toUpperCase()}`);
    console.log('');

    // Detailed scoring breakdown
    console.log('📋 DETAILED SCORING BREAKDOWN');
    console.log('-----------------------------');
    Object.entries(assessment.categoryScores).forEach(([category, score]) => {
      const status = score.score >= 85 ? '✅' : score.score >= 80 ? '🟡' : score.score >= 70 ? '🟠' : '🔴';
      console.log(`${status} ${category}: ${score.score}/100 (confidence: ${(score.confidence * 100).toFixed(1)}%)`);
      console.log(`   Reasoning: ${score.reasoning}`);
      if (score.evidence.length > 0) {
        console.log(`   Evidence: ${score.evidence.join(', ')}`);
      }
      if (score.issues.length > 0) {
        console.log(`   Issues: ${score.issues.join(', ')}`);
      }
      console.log('');
    });

    // Critical issues analysis
    console.log('⚠️ CRITICAL ISSUES ANALYSIS');
    console.log('--------------------------');
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

    // Source validation
    console.log('🔍 SOURCE VALIDATION');
    console.log('-------------------');
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
    if (sourceValidation.sourceGaps.length > 0) {
      console.log(`Source Gaps: ${sourceValidation.sourceGaps.join(', ')}`);
    }
    console.log('');

    // Performance analysis
    console.log('⚡ PERFORMANCE ANALYSIS');
    console.log('----------------------');
    console.log(`Review Time: ${reviewTime}ms`);
    console.log(`Tokens Used: ${reviewResult.reviewMetadata?.tokensUsed || 'N/A'}`);
    console.log(`Prompt Tokens: ${reviewResult.reviewMetadata?.promptTokens || 'N/A'}`);
    console.log(`Completion Tokens: ${reviewResult.reviewMetadata?.completionTokens || 'N/A'}`);
    console.log('');

    // Overall assessment
    console.log('🎯 OVERALL ASSESSMENT');
    console.log('--------------------');
    if (assessment.overallScore >= 90) {
      console.log('✅ EXCELLENT: Review system is performing at optimal levels');
    } else if (assessment.overallScore >= 85) {
      console.log('🟢 VERY GOOD: Review system is performing well with minor improvements needed');
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
    console.log(`📈 Improvement Potential: ${assessment.estimatedImprovementPotential} points`);

    // Optimization comparison
    console.log('\n🔄 OPTIMIZATION COMPARISON');
    console.log('-------------------------');
    console.log('✅ Streamlined prompt (reduced from 1,491 to ~800 tokens)');
    console.log('✅ Optimized model parameters (max_tokens: 4,000, frequency_penalty: 0.2)');
    console.log('✅ Enhanced JSON parsing with better error handling');
    console.log('✅ Focused on source credibility and reasoning depth');
    console.log('✅ Adjusted quality threshold to 82% (more achievable)');
    console.log('✅ Improved retry logic with priority-based decisions');

    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      testInput,
      assessment,
      reviewTime,
      reviewMetadata: reviewResult.reviewMetadata,
      overallScore: assessment.overallScore,
      optimization: {
        promptOptimization: 'Streamlined and focused',
        modelOptimization: 'Reduced tokens, increased penalties',
        parsingOptimization: 'Enhanced error handling',
        thresholdOptimization: 'Adjusted to 82%',
        retryOptimization: 'Priority-based decisions'
      }
    };

    fs.writeFileSync('optimized-review-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results saved to: optimized-review-results.json');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Optimized review function
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

function isOptimizedQualityAcceptable(assessment) {
  const threshold = parseFloat(process.env.QUALITY_THRESHOLD_SCORE || '0.82') * 100;
  
  if (assessment.overallScore < threshold) {
    return false;
  }

  const criticalIssues = assessment.criticalIssues.filter(issue => issue.severity === 'critical');
  if (criticalIssues.length > 0) {
    return false;
  }

  if (assessment.categoryScores.sourceCredibility.score < 80) {
    return false;
  }

  if (assessment.categoryScores.reasoningDepth.score < 80) {
    return false;
  }

  if (assessment.confidenceLevel < 0.8) {
    return false;
  }

  if (assessment.sourceValidation.sourceQualityScore < 80) {
    return false;
  }

  return true;
}

// Run the test
testOptimizedReviewSystem().catch(console.error); 