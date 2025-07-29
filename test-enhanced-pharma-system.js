const fs = require('fs');

async function testEnhancedPharmaSystem() {
  console.log('🏥 ENHANCED PHARMA SYSTEM VALIDATION');
  console.log('=====================================');
  console.log('Executive-Level Quality Standards');
  console.log('Pre-IC Investment Memo Standards\n');

  const testAssets = [
    {
      id: 1,
      target: 'GLP-1 Receptor',
      indication: 'Type 2 Diabetes',
      therapeuticArea: 'Endocrinology',
      geography: 'US',
      developmentPhase: 'Phase 3',
      description: 'High-value diabetes market with established GLP-1 class'
    },
    {
      id: 2,
      target: 'TGF-β',
      indication: 'Idiopathic Pulmonary Fibrosis',
      therapeuticArea: 'Respiratory',
      geography: 'EU',
      developmentPhase: 'Phase 2',
      description: 'Orphan disease with high unmet need and premium pricing'
    }
  ];

  const results = [];
  const executiveAnalysis = [];

  for (const asset of testAssets) {
    console.log(`\n🔬 TESTING ASSET ${asset.id}: ${asset.target} - ${asset.indication}`);
    console.log(`📊 Therapeutic Area: ${asset.therapeuticArea}`);
    console.log(`🌍 Geography: ${asset.geography}`);
    console.log(`📈 Phase: ${asset.developmentPhase}`);
    console.log(`📝 Description: ${asset.description}`);
    console.log('─'.repeat(100));

    try {
      // Test with enhanced pharma system
      console.log('\n🚀 Executing Enhanced Pharma Analysis...');
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3000/api/enhanced-pharma', {
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
            enableGPT4oEnhancement: true,
            enableExecutiveValidation: true
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

      // Store results
      const assetResult = {
        asset,
        result: result.data,
        metadata: result.metadata,
        responseTime,
        executiveAnalysis: result.executiveAnalysis,
        validationCycles: result.validationCycles,
        finalQualityScore: result.finalQualityScore,
        mathAuditResults: result.mathAuditResults,
        gptLogicVerification: result.gptLogicVerification
      };

      results.push(assetResult);
      executiveAnalysis.push(result.executiveAnalysis);

      // Print executive summary
      printEnhancedExecutiveSummary(asset, assetResult, result.executiveAnalysis);

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
  await generateEnhancedExecutiveReport(results, executiveAnalysis);
}

function printEnhancedExecutiveSummary(asset, assetResult, executiveAnalysis) {
  console.log('\n📋 ENHANCED EXECUTIVE SUMMARY');
  console.log('─'.repeat(50));
  console.log(`Asset: ${asset.target} - ${asset.indication}`);
  console.log(`Overall Score: ${executiveAnalysis.overallScore.toFixed(2)}/1.00`);
  console.log(`Recommendation: ${executiveAnalysis.recommendation}`);
  console.log(`Critical Issues: ${executiveAnalysis.criticalIssues.length}`);
  
  if (executiveAnalysis.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    executiveAnalysis.criticalIssues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
  }

  console.log('\n📊 DOMAIN SCORES:');
  executiveAnalysis.domainScores.forEach(domain => {
    console.log(`   ${domain.domain}: ${domain.score.toFixed(2)} (Weight: ${domain.weight})`);
  });

  console.log(`\n⏱️  Response Time: ${assetResult.responseTime}ms`);
  console.log(`💰 Cost: $${assetResult.metadata?.costMetrics?.totalCost?.toFixed(4) || 'N/A'}`);
  console.log(`🔄 Validation Cycles: ${assetResult.validationCycles?.length || 0}`);
  console.log(`🎯 Final Quality Score: ${assetResult.finalQualityScore?.toFixed(3) || 'N/A'}`);
}

async function generateEnhancedExecutiveReport(results, executiveAnalysis) {
  console.log('\n\n📊 ENHANCED EXECUTIVE REPORT');
  console.log('='.repeat(100));

  const report = {
    timestamp: new Date().toISOString(),
    totalAssets: results.length,
    successfulRuns: results.filter(r => !r.error).length,
    failedRuns: results.filter(r => r.error).length,
    averageScore: executiveAnalysis.reduce((sum, a) => sum + a.overallScore, 0) / executiveAnalysis.length,
    totalCriticalIssues: executiveAnalysis.reduce((sum, a) => sum + a.criticalIssues.length, 0),
    recommendations: executiveAnalysis.map(a => a.recommendation),
    assetDetails: results.map((result, index) => ({
      asset: result.asset,
      score: executiveAnalysis[index]?.overallScore || 0,
      criticalIssues: executiveAnalysis[index]?.criticalIssues || [],
      recommendation: executiveAnalysis[index]?.recommendation || 'N/A',
      responseTime: result.responseTime,
      cost: result.metadata?.costMetrics?.totalCost || 0,
      finalQualityScore: result.finalQualityScore || 0
    })),
    systemPerformance: {
      averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
      totalCost: results.reduce((sum, r) => sum + (r.metadata?.costMetrics?.totalCost || 0), 0),
      averageValidationCycles: results.reduce((sum, r) => sum + (r.validationCycles?.length || 0), 0) / results.length,
      averageQualityScore: results.reduce((sum, r) => sum + (r.finalQualityScore || 0), 0) / results.length
    }
  };

  console.log(`📈 Overall Performance:`);
  console.log(`   Average Score: ${report.averageScore.toFixed(2)}/1.00`);
  console.log(`   Total Critical Issues: ${report.totalCriticalIssues}`);
  console.log(`   Success Rate: ${((report.successfulRuns / report.totalAssets) * 100).toFixed(1)}%`);
  console.log(`   Average Quality Score: ${report.systemPerformance.averageQualityScore.toFixed(3)}`);

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
  const reportFilename = `enhanced-pharma-report-${Date.now()}.json`;
  fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportFilename}`);

  return report;
}

// Run the test
testEnhancedPharmaSystem().catch(console.error); 