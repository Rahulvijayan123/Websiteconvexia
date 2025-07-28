const fs = require('fs');

// Test the two-layer Perplexity system with comprehensive validation
async function testTwoLayerSystem() {
  console.log('🧪 Testing Two-Layer Perplexity System');
  console.log('=====================================\n');

  const testCases = [
    {
      target: 'HER2',
      indication: 'HER2-Positive Breast Cancer',
      therapeuticArea: 'Oncology',
      geography: 'Global',
      developmentPhase: 'Phase 3',
      description: 'High-value oncology target with established market'
    },
    {
      target: 'PD-L1',
      indication: 'Non-Small Cell Lung Cancer',
      therapeuticArea: 'Oncology',
      geography: 'Global',
      developmentPhase: 'Phase 2',
      description: 'Immuno-oncology target with competitive landscape'
    },
    {
      target: 'SOD1',
      indication: 'Amyotrophic Lateral Sclerosis',
      therapeuticArea: 'Neurology',
      geography: 'Global',
      developmentPhase: 'Phase 1',
      description: 'Rare disease target with high unmet need'
    }
  ];

  const results = [];

  for (const testCase of testCases) {
    console.log(`\n📊 Testing: ${testCase.target} - ${testCase.indication}`);
    console.log(`📝 Description: ${testCase.description}`);
    console.log('─'.repeat(80));

    const testResults = [];
    
    // Run multiple iterations for consistency analysis
    for (let run = 1; run <= 3; run++) {
      console.log(`\n🔄 Run ${run}/3`);
      
      try {
        const startTime = Date.now();
        
        // Call the two-layer API endpoint
        const response = await fetch('http://localhost:3000/api/two-layer-perplexity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...testCase,
            config: {
              maxValidationCycles: 5,
              qualityThreshold: 0.90,
              enableMathAudit: true,
              enableConsistencyCheck: true,
              enableSourceValidation: true,
              enableLogicAnnotations: true,
              validationStrictness: 'ultra',
              gptPostProcessing: true,
              timeoutMs: 300000
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

        // Analyze the output quality
        const qualityMetrics = analyzeTwoLayerOutputQuality(result);
        
        const runResult = {
          run: run,
          target: testCase.target,
          indication: testCase.indication,
          responseTime,
          output: result.data,
          validationCycles: result.validationCycles,
          totalCycles: result.totalCycles,
          finalQualityScore: result.finalQualityScore,
          mathAuditResults: result.mathAuditResults,
          consistencyResults: result.consistencyResults,
          sourceValidationResults: result.sourceValidationResults,
          logicAnnotations: result.logicAnnotations,
          gptPostProcessingResults: result.gptPostProcessingResults,
          metadata: result.metadata,
          qualityMetrics,
          timestamp: new Date().toISOString()
        };
        
        testResults.push(runResult);
        
        console.log(`  ✅ Run ${run} completed`);
        console.log(`  ⏱️  Response time: ${responseTime}ms`);
        console.log(`  🔄 Validation cycles: ${result.totalCycles}`);
        console.log(`  📈 Final quality score: ${result.finalQualityScore.toFixed(3)}`);
        console.log(`  🧮 Math audit score: ${qualityMetrics.mathAuditScore.toFixed(1)}%`);
        console.log(`  🔍 Consistency score: ${qualityMetrics.consistencyScore.toFixed(1)}%`);
        console.log(`  📖 Source validation: ${qualityMetrics.sourceValidationScore.toFixed(1)}%`);
        console.log(`  💭 Logic annotations: ${qualityMetrics.logicAnnotationScore.toFixed(1)}%`);
        
      } catch (error) {
        console.error(`  ❌ Run ${run} failed:`, error.message);
        
        testResults.push({
          run: run,
          target: testCase.target,
          indication: testCase.indication,
          responseTime: 0,
          output: null,
          error: error.message,
          qualityMetrics: {
            overallScore: 0,
            mathAuditScore: 0,
            consistencyScore: 0,
            sourceValidationScore: 0,
            logicAnnotationScore: 0,
            validationEfficiency: 0,
            outputCompleteness: 0
          },
          timestamp: new Date().toISOString()
        });
      }
    }

    // Analyze consistency across runs
    const consistencyAnalysis = analyzeTwoLayerConsistency(testResults);
    
    const testCaseResult = {
      target: testCase.target,
      indication: testCase.indication,
      description: testCase.description,
      runs: testResults,
      consistencyAnalysis,
      averageQualityScore: testResults.reduce((sum, run) => sum + run.qualityMetrics.overallScore, 0) / testResults.length,
      averageResponseTime: testResults.reduce((sum, run) => sum + run.responseTime, 0) / testResults.length,
      successRate: testResults.filter(run => !run.error).length / testResults.length
    };

    results.push(testCaseResult);
    
    console.log(`\n📊 Test Case Summary:`);
    console.log(`  🎯 Average quality score: ${testCaseResult.averageQualityScore.toFixed(1)}%`);
    console.log(`  ⏱️  Average response time: ${testCaseResult.averageResponseTime.toFixed(0)}ms`);
    console.log(`  ✅ Success rate: ${(testCaseResult.successRate * 100).toFixed(1)}%`);
    console.log(`  🔄 Average validation cycles: ${consistencyAnalysis.averageValidationCycles.toFixed(1)}`);
    console.log(`  📈 Consistency score: ${consistencyAnalysis.consistencyScore.toFixed(1)}%`);
  }

  // Generate comprehensive analysis report
  const analysisReport = generateTwoLayerAnalysisReport(results);
  
  // Save results to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `two-layer-test-results-${timestamp}.json`;
  
  fs.writeFileSync(filename, JSON.stringify({
    testResults: results,
    analysisReport,
    timestamp: new Date().toISOString()
  }, null, 2));

  console.log(`\n📄 Results saved to: ${filename}`);
  console.log('\n🎯 Two-Layer System Analysis Complete!');
}

function analyzeTwoLayerOutputQuality(result) {
  const output = result.data;
  const validationCycles = result.validationCycles;
  const mathAudit = result.mathAuditResults;
  const consistency = result.consistencyResults;
  const sourceValidation = result.sourceValidationResults;
  const logicAnnotations = result.logicAnnotations;

  // Calculate various quality metrics
  const mathAuditScore = mathAudit?.overallMathScore ? mathAudit.overallMathScore * 100 : 0;
  const consistencyScore = consistency?.overallConsistencyScore ? consistency.overallConsistencyScore * 100 : 0;
  const sourceValidationScore = sourceValidation?.confidenceScore ? sourceValidation.confidenceScore * 100 : 0;
  const logicAnnotationScore = logicAnnotations?._annotations ? 90 : 0; // Simplified scoring

  // Calculate validation efficiency
  const validationEfficiency = validationCycles.length > 0 ? 
    (result.finalQualityScore / validationCycles.length) * 100 : 0;

  // Calculate output completeness
  const requiredFields = [
    'cagr', 'marketSize', 'directCompetitors', 'peakRevenue2030', 
    'total10YearRevenue', 'peakMarketShare2030', 'peakPatients2030',
    'avgSellingPrice', 'persistenceRate', 'treatmentDuration',
    'geographicSplit', 'competitorPricing', 'pricingScenarios',
    'strategicTailwindData', 'dealActivity', 'pipelineAnalysis'
  ];
  
  const presentFields = requiredFields.filter(field => {
    const value = getNestedValue(output, field);
    return value !== undefined && value !== null && value !== 'Unknown' && value !== '';
  });
  
  const outputCompleteness = (presentFields.length / requiredFields.length) * 100;

  // Overall score calculation
  const overallScore = (
    result.finalQualityScore * 0.4 +
    mathAuditScore * 0.2 +
    consistencyScore * 0.15 +
    sourceValidationScore * 0.15 +
    logicAnnotationScore * 0.1
  );

  return {
    overallScore,
    mathAuditScore,
    consistencyScore,
    sourceValidationScore,
    logicAnnotationScore,
    validationEfficiency,
    outputCompleteness,
    fieldCompleteness: {
      total: requiredFields.length,
      present: presentFields.length,
      missing: requiredFields.length - presentFields.length
    }
  };
}

function analyzeTwoLayerConsistency(runs) {
  const successfulRuns = runs.filter(run => !run.error);
  
  if (successfulRuns.length === 0) {
    return {
      consistencyScore: 0,
      averageValidationCycles: 0,
      qualityScoreVariance: 0,
      responseTimeVariance: 0,
      issues: ['No successful runs to analyze']
    };
  }

  // Extract key metrics for consistency analysis
  const qualityScores = successfulRuns.map(run => run.finalQualityScore);
  const responseTimes = successfulRuns.map(run => run.responseTime);
  const validationCycles = successfulRuns.map(run => run.totalCycles);

  // Calculate variances
  const qualityScoreVariance = calculateVariance(qualityScores);
  const responseTimeVariance = calculateVariance(responseTimes);

  // Consistency score based on variance (lower variance = higher consistency)
  const maxQualityVariance = 0.1; // 10% variance threshold
  const maxResponseTimeVariance = 30000; // 30 second variance threshold
  
  const qualityConsistency = Math.max(0, 100 - (qualityScoreVariance / maxQualityVariance) * 100);
  const responseTimeConsistency = Math.max(0, 100 - (responseTimeVariance / maxResponseTimeVariance) * 100);
  
  const consistencyScore = (qualityConsistency + responseTimeConsistency) / 2;

  return {
    consistencyScore,
    averageValidationCycles: validationCycles.reduce((sum, cycles) => sum + cycles, 0) / validationCycles.length,
    qualityScoreVariance,
    responseTimeVariance,
    qualityScores,
    responseTimes,
    validationCycles,
    issues: []
  };
}

function generateTwoLayerAnalysisReport(results) {
  const totalTests = results.length;
  const totalRuns = results.reduce((sum, test) => sum + test.runs.length, 0);
  const successfulRuns = results.reduce((sum, test) => sum + test.runs.filter(run => !run.error).length, 0);
  
  const overallSuccessRate = successfulRuns / totalRuns;
  const averageQualityScore = results.reduce((sum, test) => sum + test.averageQualityScore, 0) / totalTests;
  const averageResponseTime = results.reduce((sum, test) => sum + test.averageResponseTime, 0) / totalTests;

  // Performance analysis
  const performanceAnalysis = {
    overallSuccessRate: overallSuccessRate * 100,
    averageQualityScore,
    averageResponseTime,
    totalTests,
    totalRuns,
    successfulRuns,
    failedRuns: totalRuns - successfulRuns
  };

  // Quality breakdown by test case
  const qualityBreakdown = results.map(test => ({
    target: test.target,
    indication: test.indication,
    averageQualityScore: test.averageQualityScore,
    averageResponseTime: test.averageResponseTime,
    successRate: test.successRate * 100,
    consistencyScore: test.consistencyAnalysis.consistencyScore
  }));

  // Validation efficiency analysis
  const validationEfficiency = results.map(test => ({
    target: test.target,
    indication: test.indication,
    averageValidationCycles: test.consistencyAnalysis.averageValidationCycles,
    averageQualityScore: test.averageQualityScore,
    efficiencyRatio: test.averageQualityScore / test.consistencyAnalysis.averageValidationCycles
  }));

  return {
    performanceAnalysis,
    qualityBreakdown,
    validationEfficiency,
    recommendations: generateRecommendations(results),
    timestamp: new Date().toISOString()
  };
}

function generateRecommendations(results) {
  const recommendations = [];

  // Analyze overall performance
  const overallSuccessRate = results.reduce((sum, test) => sum + test.successRate, 0) / results.length;
  const averageQualityScore = results.reduce((sum, test) => sum + test.averageQualityScore, 0) / results.length;

  if (overallSuccessRate < 0.8) {
    recommendations.push({
      category: 'Reliability',
      priority: 'High',
      recommendation: 'Improve system reliability - success rate below 80%',
      action: 'Review error handling and timeout configurations'
    });
  }

  if (averageQualityScore < 85) {
    recommendations.push({
      category: 'Quality',
      priority: 'High',
      recommendation: 'Enhance output quality - average score below 85%',
      action: 'Adjust validation thresholds and improve research prompts'
    });
  }

  // Analyze validation efficiency
  const inefficientTests = results.filter(test => 
    test.consistencyAnalysis.averageValidationCycles > 3 && test.averageQualityScore < 90
  );

  if (inefficientTests.length > 0) {
    recommendations.push({
      category: 'Efficiency',
      priority: 'Medium',
      recommendation: 'Optimize validation cycles for better efficiency',
      action: 'Fine-tune quality thresholds and validation strategies',
      affectedTests: inefficientTests.map(test => `${test.target} - ${test.indication}`)
    });
  }

  return recommendations;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function calculateVariance(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}

// Run the test
if (require.main === module) {
  testTwoLayerSystem().catch(console.error);
}

module.exports = {
  testTwoLayerSystem,
  analyzeTwoLayerOutputQuality,
  analyzeTwoLayerConsistency,
  generateTwoLayerAnalysisReport
}; 