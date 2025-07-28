const fs = require('fs');

async function testOptimizedSystem() {
  console.log('🧪 Testing Optimized Three-Layer System');
  console.log('=======================================\n');

  const testCases = [
    {
      target: 'HER2',
      indication: 'HER2-Positive Breast Cancer',
      therapeuticArea: 'Oncology',
      geography: 'Global',
      developmentPhase: 'Phase 3',
      description: 'High-value oncology target with established market'
    }
  ];

  const results = [];

  for (const testCase of testCases) {
    console.log(`\n📊 Testing: ${testCase.target} - ${testCase.indication}`);
    console.log(`📝 Description: ${testCase.description}`);
    console.log('─'.repeat(80));

    // Test 1: Optimized Three-Layer System
    console.log('\n1️⃣ Testing Optimized Three-Layer System...');
    const optimizedResult = await testSystem('optimized-three-layer-perplexity', testCase, {
      maxValidationCycles: 2,
      qualityThreshold: 0.80,
      enableFieldLevelValidation: true,
      enableGPTLogicVerification: true,
      enableCaching: true,
      validationStrictness: 'high',
      maxFieldRetries: 2,
      timeoutMs: 120000,
      rateLimitDelay: 2000,
      batchSize: 6,
      enableSmartValidation: true
    });

    // Test 2: Original Three-Layer System (for comparison)
    console.log('\n2️⃣ Testing Original Three-Layer System...');
    const originalResult = await testSystem('three-layer-perplexity', testCase, {
      maxValidationCycles: 2,
      qualityThreshold: 0.80,
      enableFieldLevelValidation: true,
      enableGPTLogicVerification: true,
      timeoutMs: 120000
    });

    // Test 3: Two-Layer System (for comparison)
    console.log('\n3️⃣ Testing Two-Layer System...');
    const twoLayerResult = await testSystem('two-layer-perplexity', testCase, {
      maxValidationCycles: 2,
      qualityThreshold: 0.80,
      timeoutMs: 120000
    });

    // Compare results
    const comparison = compareSystems(optimizedResult, originalResult, twoLayerResult);
    
    const testCaseResult = {
      target: testCase.target,
      indication: testCase.indication,
      description: testCase.description,
      optimized: optimizedResult,
      original: originalResult,
      twoLayer: twoLayerResult,
      comparison
    };

    results.push(testCaseResult);
    
    console.log('\n📊 System Comparison:');
    console.log(`  🚀 Optimized System:`);
    console.log(`    ⏱️  Response time: ${optimizedResult.responseTime}ms`);
    console.log(`    📈 Quality score: ${optimizedResult.qualityScore.toFixed(3)}`);
    console.log(`    🔄 Validation cycles: ${optimizedResult.totalCycles}`);
    console.log(`    📞 API calls: ${optimizedResult.totalApiCalls}`);
    console.log(`    💰 Cost reduction: ${optimizedResult.costOptimization?.estimatedCostReduction.toFixed(1)}%`);
    
    console.log(`  📚 Original System:`);
    console.log(`    ⏱️  Response time: ${originalResult.responseTime}ms`);
    console.log(`    📈 Quality score: ${originalResult.qualityScore.toFixed(3)}`);
    console.log(`    🔄 Validation cycles: ${originalResult.totalCycles}`);
    console.log(`    📞 API calls: ${originalResult.totalApiCalls || 'N/A'}`);
    
    console.log(`  🔄 Two-Layer System:`);
    console.log(`    ⏱️  Response time: ${twoLayerResult.responseTime}ms`);
    console.log(`    📈 Quality score: ${twoLayerResult.qualityScore.toFixed(3)}`);
    console.log(`    🔄 Validation cycles: ${twoLayerResult.totalCycles}`);
    console.log(`    📞 API calls: ${twoLayerResult.totalApiCalls || 'N/A'}`);
  }

  // Generate comprehensive analysis report
  const analysisReport = generateOptimizationAnalysisReport(results);
  
  // Save results to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `optimized-system-test-results-${timestamp}.json`;
  
  fs.writeFileSync(filename, JSON.stringify({
    testResults: results,
    analysisReport,
    timestamp: new Date().toISOString()
  }, null, 2));

  console.log(`\n📄 Results saved to: ${filename}`);
  console.log('\n🎯 Optimization Analysis Complete!');
}

async function testSystem(endpoint, testCase, config) {
  try {
    const startTime = Date.now();
    
    const response = await fetch(`http://localhost:3000/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...testCase,
        config
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

    return {
      success: true,
      responseTime,
      qualityScore: result.finalQualityScore || 0,
      totalCycles: result.totalCycles || 0,
      totalApiCalls: result.metadata?.totalApiCalls || 0,
      fieldRegenerations: result.metadata?.fieldRegenerations || 0,
      costOptimization: result.metadata?.costOptimization || null,
      output: result.data,
      validationCycles: result.validationCycles || [],
      fieldValidationSummary: result.fieldValidationSummary || null,
      mathAuditResults: result.mathAuditResults || null,
      gptLogicVerification: result.gptLogicVerification || null
    };
    
  } catch (error) {
    console.error(`  ❌ ${endpoint} failed:`, error.message);
    
    return {
      success: false,
      responseTime: 0,
      qualityScore: 0,
      totalCycles: 0,
      totalApiCalls: 0,
      fieldRegenerations: 0,
      costOptimization: null,
      error: error.message,
      output: null,
      validationCycles: [],
      fieldValidationSummary: null,
      mathAuditResults: null,
      gptLogicVerification: null
    };
  }
}

function compareSystems(optimized, original, twoLayer) {
  const comparison = {
    performance: {
      optimizedVsOriginal: {
        timeImprovement: original.success ? ((original.responseTime - optimized.responseTime) / original.responseTime * 100) : 0,
        apiCallReduction: original.success ? ((original.totalApiCalls - optimized.totalApiCalls) / original.totalApiCalls * 100) : 0,
        qualityDifference: optimized.qualityScore - (original.qualityScore || 0)
      },
      optimizedVsTwoLayer: {
        timeImprovement: twoLayer.success ? ((twoLayer.responseTime - optimized.responseTime) / twoLayer.responseTime * 100) : 0,
        apiCallReduction: twoLayer.success ? ((twoLayer.totalApiCalls - optimized.totalApiCalls) / twoLayer.totalApiCalls * 100) : 0,
        qualityDifference: optimized.qualityScore - (twoLayer.qualityScore || 0)
      }
    },
    costEfficiency: {
      optimizedCostReduction: optimized.costOptimization?.estimatedCostReduction || 0,
      apiCallsSaved: optimized.costOptimization?.apiCallsSaved || 0,
      efficiencyScore: optimized.costOptimization?.efficiencyScore || 0
    },
    quality: {
      optimizedQuality: optimized.qualityScore,
      originalQuality: original.qualityScore || 0,
      twoLayerQuality: twoLayer.qualityScore || 0,
      qualityRanking: [optimized, original, twoLayer]
        .filter(system => system.success)
        .sort((a, b) => b.qualityScore - a.qualityScore)
        .map(system => system.qualityScore)
    }
  };

  return comparison;
}

function generateOptimizationAnalysisReport(results) {
  const totalTests = results.length;
  const successfulOptimized = results.filter(r => r.optimized.success).length;
  const successfulOriginal = results.filter(r => r.original.success).length;
  const successfulTwoLayer = results.filter(r => r.twoLayer.success).length;

  // Performance analysis
  const performanceAnalysis = {
    optimizedSuccessRate: (successfulOptimized / totalTests) * 100,
    originalSuccessRate: (successfulOriginal / totalTests) * 100,
    twoLayerSuccessRate: (successfulTwoLayer / totalTests) * 100,
    averageTimeImprovement: results.reduce((sum, r) => sum + r.comparison.performance.optimizedVsOriginal.timeImprovement, 0) / totalTests,
    averageApiCallReduction: results.reduce((sum, r) => sum + r.comparison.performance.optimizedVsOriginal.apiCallReduction, 0) / totalTests,
    averageCostReduction: results.reduce((sum, r) => sum + r.comparison.costEfficiency.optimizedCostReduction, 0) / totalTests
  };

  // Quality analysis
  const qualityAnalysis = {
    averageOptimizedQuality: results.reduce((sum, r) => sum + r.optimized.qualityScore, 0) / successfulOptimized,
    averageOriginalQuality: results.reduce((sum, r) => sum + (r.original.qualityScore || 0), 0) / successfulOriginal,
    averageTwoLayerQuality: results.reduce((sum, r) => sum + (r.twoLayer.qualityScore || 0), 0) / successfulTwoLayer,
    qualityImprovement: results.reduce((sum, r) => sum + r.comparison.performance.optimizedVsOriginal.qualityDifference, 0) / totalTests
  };

  // Cost efficiency analysis
  const costEfficiencyAnalysis = {
    averageApiCallsSaved: results.reduce((sum, r) => sum + r.comparison.costEfficiency.apiCallsSaved, 0) / totalTests,
    averageEfficiencyScore: results.reduce((sum, r) => sum + r.comparison.costEfficiency.efficiencyScore, 0) / totalTests,
    totalApiCallsSaved: results.reduce((sum, r) => sum + r.comparison.costEfficiency.apiCallsSaved, 0),
    estimatedTotalCostReduction: results.reduce((sum, r) => sum + r.comparison.costEfficiency.optimizedCostReduction, 0) / totalTests
  };

  return {
    performanceAnalysis,
    qualityAnalysis,
    costEfficiencyAnalysis,
    recommendations: generateOptimizationRecommendations(results),
    timestamp: new Date().toISOString()
  };
}

function generateOptimizationRecommendations(results) {
  const recommendations = [];

  // Analyze performance improvements
  const avgTimeImprovement = results.reduce((sum, r) => sum + r.comparison.performance.optimizedVsOriginal.timeImprovement, 0) / results.length;
  const avgCostReduction = results.reduce((sum, r) => sum + r.comparison.costEfficiency.optimizedCostReduction, 0) / results.length;

  if (avgTimeImprovement > 20) {
    recommendations.push({
      category: 'Performance',
      priority: 'High',
      recommendation: 'Optimized system shows significant performance improvement',
      details: `${avgTimeImprovement.toFixed(1)}% faster response time`,
      action: 'Consider adopting optimized system for production use'
    });
  }

  if (avgCostReduction > 30) {
    recommendations.push({
      category: 'Cost Efficiency',
      priority: 'High',
      recommendation: 'Optimized system shows significant cost reduction',
      details: `${avgCostReduction.toFixed(1)}% cost reduction achieved`,
      action: 'Implement optimized system to reduce operational costs'
    });
  }

  // Analyze quality maintenance
  const qualityMaintained = results.every(r => 
    r.optimized.success && r.original.success && 
    Math.abs(r.optimized.qualityScore - r.original.qualityScore) < 0.05
  );

  if (qualityMaintained) {
    recommendations.push({
      category: 'Quality',
      priority: 'Medium',
      recommendation: 'Quality maintained while improving efficiency',
      details: 'No significant quality degradation observed',
      action: 'Proceed with optimization deployment'
    });
  }

  return recommendations;
}

// Run the test
if (require.main === module) {
  testOptimizedSystem().catch(console.error);
}

module.exports = {
  testOptimizedSystem,
  testSystem,
  compareSystems,
  generateOptimizationAnalysisReport
}; 