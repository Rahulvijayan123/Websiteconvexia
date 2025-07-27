#!/usr/bin/env ts-node

import { testRunner } from '../lib/testRunner';

async function main() {
  console.log('🔬 PHARMA REVIEW SYSTEM COMPREHENSIVE TESTING');
  console.log('==============================================\n');

  try {
    // 1. Quick validation first
    console.log('🔍 STEP 1: Quick Validation');
    console.log('---------------------------');
    const quickValidation = await testRunner.runQuickValidation();
    console.log(`Status: ${quickValidation.isValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Score: ${quickValidation.score}/100`);
    if (quickValidation.issues.length > 0) {
      console.log('Issues:', quickValidation.issues.join(', '));
    }
    console.log('');

    if (!quickValidation.isValid) {
      console.log('❌ Quick validation failed. Stopping comprehensive testing.');
      process.exit(1);
    }

    // 2. Optimization test
    console.log('🔧 STEP 2: Optimization Test');
    console.log('----------------------------');
    const optimizationTest = await testRunner.runOptimizationTest();
    console.log(`Original Score: ${optimizationTest.originalScore}/100`);
    console.log(`Optimized Score: ${optimizationTest.optimizedScore}/100`);
    if (optimizationTest.improvements.length > 0) {
      console.log('Improvements:', optimizationTest.improvements.join(', '));
    }
    console.log('');

    // 3. Comprehensive testing
    console.log('🚀 STEP 3: Comprehensive Testing');
    console.log('--------------------------------');
    const comprehensiveResult = await testRunner.runComprehensiveTesting();

    // 4. Display results
    console.log('\n📊 COMPREHENSIVE TEST RESULTS');
    console.log('==============================');
    console.log(`Overall System Score: ${comprehensiveResult.overallScore.toFixed(1)}/100`);
    console.log(`Timestamp: ${comprehensiveResult.timestamp}`);
    console.log('');

    // Test Results Summary
    console.log('📈 TEST RESULTS SUMMARY');
    console.log('------------------------');
    const testSummary = comprehensiveResult.testResults.summary;
    console.log(`Total Tests: ${testSummary.totalTests}`);
    console.log(`Passed Tests: ${testSummary.passedTests} (${((testSummary.passedTests / testSummary.totalTests) * 100).toFixed(1)}%)`);
    console.log(`Average Score Accuracy: ${(testSummary.averageScoreAccuracy * 100).toFixed(1)}%`);
    console.log(`Average Issues Accuracy: ${(testSummary.averageIssuesAccuracy * 100).toFixed(1)}%`);
    console.log(`Average Review Time: ${testSummary.averageReviewTimeMs.toFixed(0)}ms`);
    console.log('');

    // Category Breakdown
    console.log('📋 CATEGORY BREAKDOWN');
    console.log('---------------------');
    Object.entries(testSummary.categoryBreakdown).forEach(([category, stats]) => {
      const statsData = stats as { passed: number; total: number; averageScore: number };
      console.log(`${category}: ${statsData.passed}/${statsData.total} passed (${((statsData.passed/statsData.total)*100).toFixed(1)}%), avg score: ${statsData.averageScore.toFixed(1)}`);
    });
    console.log('');

    // Scoring Analysis
    console.log('🎯 SCORING ANALYSIS');
    console.log('-------------------');
    const scoringAnalysis = comprehensiveResult.scoringAnalysis;
    console.log(`Scoring Accuracy: ${(scoringAnalysis.scoringAccuracy * 100).toFixed(1)}%`);
    console.log('Bias Analysis:');
    Object.entries(scoringAnalysis.biasAnalysis).forEach(([category, bias]) => {
      console.log(`  ${category}: ${(bias as number).toFixed(1)}`);
    });
    console.log('');

    // Performance Analysis
    console.log('⚡ PERFORMANCE ANALYSIS');
    console.log('----------------------');
    const performanceAnalysis = comprehensiveResult.performanceAnalysis;
    console.log(`Average Review Time: ${performanceAnalysis.averageReviewTime.toFixed(0)}ms`);
    console.log('Time Distribution:');
    console.log(`  Fast (<5s): ${performanceAnalysis.timeDistribution.fast}`);
    console.log(`  Medium (5-10s): ${performanceAnalysis.timeDistribution.medium}`);
    console.log(`  Slow (>10s): ${performanceAnalysis.timeDistribution.slow}`);
    console.log('');

    // Threshold Analysis
    console.log('📈 THRESHOLD ANALYSIS');
    console.log('--------------------');
    const thresholdAnalysis = comprehensiveResult.thresholdAnalysis;
    console.log(`Threshold Accuracy: ${(thresholdAnalysis.thresholdAccuracy * 100).toFixed(1)}%`);
    console.log(`False Positives: ${thresholdAnalysis.falsePositives}`);
    console.log(`False Negatives: ${thresholdAnalysis.falseNegatives}`);
    console.log(`Optimal Threshold: ${thresholdAnalysis.optimalThreshold}`);
    console.log('');

    // Recommendations
    console.log('💡 OPTIMIZATION RECOMMENDATIONS');
    console.log('-------------------------------');
    comprehensiveResult.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.log('');

    // Optimization Report
    console.log('📋 DETAILED OPTIMIZATION REPORT');
    console.log('-------------------------------');
    console.log(comprehensiveResult.optimizationReport);
    console.log('');

    // Trend Analysis
    console.log('📊 TREND ANALYSIS');
    console.log('-----------------');
    const trendAnalysis = testRunner.generateTrendAnalysis();
    console.log(`Trend: ${trendAnalysis.trend.toUpperCase()}`);
    console.log(`Average Score: ${trendAnalysis.averageScore.toFixed(1)}/100`);
    console.log(`Score Change: ${trendAnalysis.scoreChange.toFixed(1)}`);
    if (trendAnalysis.recommendations.length > 0) {
      console.log('Trend Recommendations:');
      trendAnalysis.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    console.log('');

    // Final Assessment
    console.log('🎯 FINAL ASSESSMENT');
    console.log('-------------------');
    if (comprehensiveResult.overallScore >= 90) {
      console.log('✅ EXCELLENT: Review system is performing at optimal levels');
    } else if (comprehensiveResult.overallScore >= 80) {
      console.log('🟡 GOOD: Review system is performing well with room for improvement');
    } else if (comprehensiveResult.overallScore >= 70) {
      console.log('🟠 FAIR: Review system needs optimization to meet quality standards');
    } else {
      console.log('🔴 POOR: Review system requires significant improvements');
    }

    console.log(`\n📊 Overall System Score: ${comprehensiveResult.overallScore.toFixed(1)}/100`);
    
    // Save results to file
    const fs = require('fs');
    const resultsFile = `test-results-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(comprehensiveResult, null, 2));
    console.log(`\n💾 Results saved to: ${resultsFile}`);

  } catch (error: any) {
    console.error('❌ Testing failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
} 