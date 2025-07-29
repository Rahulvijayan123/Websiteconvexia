const fs = require('fs');

async function testHighStakesPharmaAssets() {
  console.log('🏥 HIGH-STAKES PHARMA ASSET VALIDATION');
  console.log('=======================================');
  console.log('Executive-Level Scrutiny: 40+ Years Pharma Experience');
  console.log('Quality Bar: Pre-IC Investment Memo Standards\n');

  const highStakesAssets = [
    {
      id: 6,
      target: 'GLP-1 Receptor',
      indication: 'Type 2 Diabetes',
      therapeuticArea: 'Endocrinology',
      geography: 'US',
      developmentPhase: 'Phase 3',
      description: 'High-value diabetes market with established GLP-1 class'
    },
    {
      id: 7,
      target: 'TGF-β',
      indication: 'Idiopathic Pulmonary Fibrosis',
      therapeuticArea: 'Respiratory',
      geography: 'EU',
      developmentPhase: 'Phase 2',
      description: 'Orphan disease with high unmet need and premium pricing'
    },
    {
      id: 8,
      target: 'BCL11A',
      indication: 'Sickle Cell Disease',
      therapeuticArea: 'Hematology',
      geography: 'Africa',
      developmentPhase: 'Phase 1',
      description: 'Gene therapy in emerging market with complex access dynamics'
    },
    {
      id: 9,
      target: 'IL-23',
      indication: 'Psoriasis',
      therapeuticArea: 'Autoimmune',
      geography: 'Canada',
      developmentPhase: 'Approved',
      description: 'Established market with multiple approved competitors'
    },
    {
      id: 10,
      target: 'Integrin α4β7',
      indication: 'Crohn\'s Disease',
      therapeuticArea: 'Gastroenterology',
      geography: 'Australia',
      developmentPhase: 'Phase 2',
      description: 'Specialty GI market with complex reimbursement landscape'
    }
  ];

  const results = [];
  const executiveAnalysis = [];

  for (const asset of highStakesAssets) {
    console.log(`\n🔬 ASSET ${asset.id}: ${asset.target} - ${asset.indication}`);
    console.log(`📊 Therapeutic Area: ${asset.therapeuticArea}`);
    console.log(`🌍 Geography: ${asset.geography}`);
    console.log(`📈 Phase: ${asset.developmentPhase}`);
    console.log(`📝 Description: ${asset.description}`);
    console.log('─'.repeat(100));

    try {
      // Test with optimized three-layer system
      console.log('\n🚀 Executing Optimized Three-Layer Analysis...');
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3000/api/optimized-three-layer-perplexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: asset.target,
          indication: asset.indication,
          therapeuticArea: asset.therapeuticArea,
          geography: asset.geography,
          developmentPhase: asset.developmentPhase,
          config: {
            maxValidationCycles: 3,
            qualityThreshold: 0.85,
            enableFieldLevelValidation: true,
            enableGPTLogicVerification: true,
            enableCaching: true,
            validationStrictness: 'high',
            maxFieldRetries: 2,
            timeoutMs: 180000,
            rateLimitDelay: 2000,
            batchSize: 6,
            enableSmartValidation: true,
            maxCostPerQuery: 3.0,
            enableGPT4oEnhancement: true
          }
        })
      });

      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Orchestration failed: ${result.error}`);
      }

      // Executive-level analysis of the 8 domains
      const domainAnalysis = await performExecutiveDomainAnalysis(asset, result.data);
      
      // Store results
      const assetResult = {
        asset,
        result: result.data,
        metadata: result.metadata,
        responseTime,
        domainAnalysis,
        validationCycles: result.validationCycles,
        finalQualityScore: result.finalQualityScore,
        mathAuditResults: result.mathAuditResults,
        gptLogicVerification: result.gptLogicVerification
      };

      results.push(assetResult);
      executiveAnalysis.push(domainAnalysis);

      // Print executive summary
      printExecutiveSummary(asset, assetResult, domainAnalysis);

    } catch (error) {
      console.error(`❌ Error testing asset ${asset.id}:`, error.message);
      results.push({
        asset,
        error: error.message,
        responseTime: 0
      });
    }
  }

  // Generate comprehensive executive report
  await generateExecutiveReport(results, executiveAnalysis);
}

async function performExecutiveDomainAnalysis(asset, output) {
  console.log('\n🔍 EXECUTIVE DOMAIN ANALYSIS');
  console.log('─'.repeat(50));

  const domains = [
    {
      name: 'Deal Activity',
      criteria: ['comparableDeals', 'dealPricing', 'buyerProfile'],
      weight: 0.15
    },
    {
      name: 'Competitive Threats & Pipeline Crowding',
      criteria: ['directCompetitors', 'indirectCompetitors', 'pipelineCrowding'],
      weight: 0.15
    },
    {
      name: 'Peak Sales Estimates & CAGR',
      criteria: ['peakRevenue2030', 'cagr', 'marketSize'],
      weight: 0.20
    },
    {
      name: 'Payer Sentiment & Pricing Scenarios',
      criteria: ['avgSellingPrice', 'pricingScenarios', 'payerSentiment'],
      weight: 0.15
    },
    {
      name: 'Rare Disease Eligibility & Regulatory',
      criteria: ['rareDiseaseEligibility', 'prvEligibility', 'regulatoryTimeline'],
      weight: 0.10
    },
    {
      name: 'Patent & Exclusivity',
      criteria: ['patentStatus', 'exclusivityPeriod', 'ipPositioning'],
      weight: 0.10
    },
    {
      name: 'Financial Projections',
      criteria: ['tenYearRevenue', 'geographicSplit', 'persistenceRate'],
      weight: 0.10
    },
    {
      name: 'Strategic Tailwind Score',
      criteria: ['strategicTailwindScore', 'marketDrivers', 'regulatoryCatalysts'],
      weight: 0.05
    }
  ];

  const domainScores = [];
  const criticalIssues = [];
  const dataQualityIssues = [];

  for (const domain of domains) {
    console.log(`\n📊 ${domain.name}:`);
    
    const domainScore = await analyzeDomain(domain, output, asset);
    domainScores.push({
      domain: domain.name,
      score: domainScore.score,
      weight: domain.weight,
      weightedScore: domainScore.score * domain.weight,
      issues: domainScore.issues,
      dataQuality: domainScore.dataQuality
    });

    if (domainScore.issues.length > 0) {
      criticalIssues.push(...domainScore.issues.map(issue => `${domain.name}: ${issue}`));
    }

    if (domainScore.dataQuality < 0.7) {
      dataQualityIssues.push(`${domain.name}: Low data quality (${domainScore.dataQuality.toFixed(2)})`);
    }

    console.log(`   Score: ${domainScore.score.toFixed(2)}`);
    console.log(`   Data Quality: ${domainScore.dataQuality.toFixed(2)}`);
    if (domainScore.issues.length > 0) {
      console.log(`   Issues: ${domainScore.issues.length}`);
    }
  }

  const overallScore = domainScores.reduce((sum, d) => sum + d.weightedScore, 0);
  const overallDataQuality = domainScores.reduce((sum, d) => sum + d.dataQuality, 0) / domainScores.length;

  return {
    domainScores,
    overallScore,
    overallDataQuality,
    criticalIssues,
    dataQualityIssues,
    recommendation: generateRecommendation(overallScore, criticalIssues.length)
  };
}

async function analyzeDomain(domain, output, asset) {
  let score = 0;
  let dataQuality = 0;
  const issues = [];
  let criteriaCount = 0;

  for (const criterion of domain.criteria) {
    criteriaCount++;
    const field = output[criterion];
    
    if (!field) {
      issues.push(`Missing ${criterion} data`);
      continue;
    }

    // Assess data quality and logical consistency
    const fieldAnalysis = await analyzeField(criterion, field, asset);
    score += fieldAnalysis.score;
    dataQuality += fieldAnalysis.dataQuality;
    
    if (fieldAnalysis.issues.length > 0) {
      issues.push(...fieldAnalysis.issues);
    }
  }

  return {
    score: criteriaCount > 0 ? score / criteriaCount : 0,
    dataQuality: criteriaCount > 0 ? dataQuality / criteriaCount : 0,
    issues
  };
}

async function analyzeField(fieldName, fieldValue, asset) {
  let score = 0;
  let dataQuality = 0;
  const issues = [];

  // Field-specific validation logic
  switch (fieldName) {
    case 'peakRevenue2030':
      if (typeof fieldValue === 'number' && fieldValue > 0) {
        score = 0.8;
        dataQuality = 0.8;
        
        // Validate against market size
        if (fieldValue > 10000000000) { // $10B
          issues.push('Peak revenue seems unrealistically high');
          score -= 0.3;
        }
      } else {
        issues.push('Invalid peak revenue value');
        score = 0.2;
        dataQuality = 0.2;
      }
      break;

    case 'cagr':
      if (typeof fieldValue === 'number' && fieldValue > 0 && fieldValue < 100) {
        score = 0.8;
        dataQuality = 0.8;
        
        if (fieldValue > 50) {
          issues.push('CAGR seems unrealistically high');
          score -= 0.2;
        }
      } else {
        issues.push('Invalid CAGR value');
        score = 0.2;
        dataQuality = 0.2;
      }
      break;

    case 'avgSellingPrice':
      if (typeof fieldValue === 'number' && fieldValue > 0) {
        score = 0.8;
        dataQuality = 0.8;
        
        // Validate against therapeutic area
        if (asset.therapeuticArea === 'Oncology' && fieldValue < 50000) {
          issues.push('Oncology pricing seems low');
          score -= 0.1;
        }
      } else {
        issues.push('Invalid pricing data');
        score = 0.2;
        dataQuality = 0.2;
      }
      break;

    case 'rareDiseaseEligibility':
      if (typeof fieldValue === 'boolean') {
        score = 0.8;
        dataQuality = 0.8;
      } else {
        issues.push('Invalid rare disease eligibility');
        score = 0.2;
        dataQuality = 0.2;
      }
      break;

    case 'directCompetitors':
      if (Array.isArray(fieldValue) && fieldValue.length > 0) {
        score = 0.8;
        dataQuality = 0.8;
        
        if (fieldValue.length < 2) {
          issues.push('Limited competitor analysis');
          score -= 0.2;
        }
      } else {
        issues.push('Missing competitor data');
        score = 0.2;
        dataQuality = 0.2;
      }
      break;

    default:
      // Generic validation for other fields
      if (fieldValue !== null && fieldValue !== undefined) {
        score = 0.7;
        dataQuality = 0.7;
      } else {
        issues.push(`Missing ${fieldName} data`);
        score = 0.2;
        dataQuality = 0.2;
      }
  }

  return { score, dataQuality, issues };
}

function generateRecommendation(overallScore, criticalIssuesCount) {
  if (overallScore >= 0.8 && criticalIssuesCount === 0) {
    return 'STRONG BUY - High confidence, no critical issues';
  } else if (overallScore >= 0.7 && criticalIssuesCount <= 2) {
    return 'BUY - Good confidence, minor issues to address';
  } else if (overallScore >= 0.6 && criticalIssuesCount <= 4) {
    return 'HOLD - Moderate confidence, significant issues need resolution';
  } else {
    return 'PASS - Low confidence, too many critical issues';
  }
}

function printExecutiveSummary(asset, assetResult, domainAnalysis) {
  console.log('\n📋 EXECUTIVE SUMMARY');
  console.log('─'.repeat(50));
  console.log(`Asset: ${asset.target} - ${asset.indication}`);
  console.log(`Overall Score: ${domainAnalysis.overallScore.toFixed(2)}/1.00`);
  console.log(`Data Quality: ${domainAnalysis.overallDataQuality.toFixed(2)}/1.00`);
  console.log(`Critical Issues: ${domainAnalysis.criticalIssues.length}`);
  console.log(`Recommendation: ${domainAnalysis.recommendation}`);
  
  if (domainAnalysis.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    domainAnalysis.criticalIssues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
  }

  if (domainAnalysis.dataQualityIssues.length > 0) {
    console.log('\n⚠️  DATA QUALITY ISSUES:');
    domainAnalysis.dataQualityIssues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
  }

  console.log(`\n⏱️  Response Time: ${assetResult.responseTime}ms`);
  console.log(`💰 Cost: $${assetResult.metadata?.costMetrics?.totalCost?.toFixed(4) || 'N/A'}`);
  console.log(`🔄 Validation Cycles: ${assetResult.validationCycles?.length || 0}`);
}

async function generateExecutiveReport(results, executiveAnalysis) {
  console.log('\n\n📊 COMPREHENSIVE EXECUTIVE REPORT');
  console.log('='.repeat(100));

  const report = {
    timestamp: new Date().toISOString(),
    totalAssets: results.length,
    successfulRuns: results.filter(r => !r.error).length,
    failedRuns: results.filter(r => r.error).length,
    averageScore: executiveAnalysis.reduce((sum, a) => sum + a.overallScore, 0) / executiveAnalysis.length,
    averageDataQuality: executiveAnalysis.reduce((sum, a) => sum + a.overallDataQuality, 0) / executiveAnalysis.length,
    totalCriticalIssues: executiveAnalysis.reduce((sum, a) => sum + a.criticalIssues.length, 0),
    recommendations: executiveAnalysis.map(a => a.recommendation),
    assetDetails: results.map((result, index) => ({
      asset: result.asset,
      score: executiveAnalysis[index]?.overallScore || 0,
      dataQuality: executiveAnalysis[index]?.overallDataQuality || 0,
      criticalIssues: executiveAnalysis[index]?.criticalIssues || [],
      recommendation: executiveAnalysis[index]?.recommendation || 'N/A',
      responseTime: result.responseTime,
      cost: result.metadata?.costMetrics?.totalCost || 0
    })),
    systemPerformance: {
      averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
      totalCost: results.reduce((sum, r) => sum + (r.metadata?.costMetrics?.totalCost || 0), 0),
      averageValidationCycles: results.reduce((sum, r) => sum + (r.validationCycles?.length || 0), 0) / results.length
    }
  };

  console.log(`📈 Overall Performance:`);
  console.log(`   Average Score: ${report.averageScore.toFixed(2)}/1.00`);
  console.log(`   Average Data Quality: ${report.averageDataQuality.toFixed(2)}/1.00`);
  console.log(`   Total Critical Issues: ${report.totalCriticalIssues}`);
  console.log(`   Success Rate: ${((report.successfulRuns / report.totalAssets) * 100).toFixed(1)}%`);

  console.log(`\n💰 System Performance:`);
  console.log(`   Average Response Time: ${report.systemPerformance.averageResponseTime.toFixed(0)}ms`);
  console.log(`   Total Cost: $${report.systemPerformance.totalCost.toFixed(4)}`);
  console.log(`   Average Validation Cycles: ${report.systemPerformance.averageValidationCycles.toFixed(1)}`);

  console.log(`\n📋 Asset Rankings:`);
  const sortedAssets = [...report.assetDetails].sort((a, b) => b.score - a.score);
  sortedAssets.forEach((asset, index) => {
    console.log(`   ${index + 1}. ${asset.asset.target} - ${asset.asset.indication}: ${asset.score.toFixed(2)} (${asset.recommendation})`);
  });

  // Save detailed report
  const reportFilename = `high-stakes-pharma-report-${Date.now()}.json`;
  fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportFilename}`);

  return report;
}

// Run the test
testHighStakesPharmaAssets().catch(console.error); 