import { ReviewSystemTester } from './reviewSystemTester';
import { enhancedReviewPerplexityOutput } from './enhancedReviewClient';

interface TestExecutionResult {
  timestamp: string;
  testResults: any;
  scoringAnalysis: any;
  performanceAnalysis: any;
  thresholdAnalysis: any;
  optimizationReport: string;
  recommendations: string[];
  overallScore: number;
}

export class ComprehensiveTestRunner {
  private tester: ReviewSystemTester;
  private results: TestExecutionResult[] = [];

  constructor() {
    this.tester = new ReviewSystemTester();
  }

  async runComprehensiveTesting(): Promise<TestExecutionResult> {
    console.log('🚀 Starting comprehensive review system testing...');
    
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // 1. Run all review tests
      console.log('📊 Running review system tests...');
      const testResults = await this.tester.runAllTests();

      // 2. Analyze scoring accuracy
      console.log('🎯 Analyzing scoring accuracy...');
      const scoringAnalysis = await this.tester.runScoringAccuracyTest();

      // 3. Analyze performance
      console.log('⚡ Analyzing performance...');
      const performanceAnalysis = await this.tester.runPerformanceAnalysis();

      // 4. Test quality thresholds
      console.log('📈 Testing quality thresholds...');
      const thresholdAnalysis = await this.tester.runQualityThresholdTest();

      // 5. Generate optimization report
      console.log('📋 Generating optimization report...');
      const optimizationReport = this.tester.generateOptimizationReport();

      // 6. Generate comprehensive recommendations
      const recommendations = this.generateRecommendations(
        testResults,
        scoringAnalysis,
        performanceAnalysis,
        thresholdAnalysis
      );

      // 7. Calculate overall system score
      const overallScore = this.calculateOverallScore(
        testResults,
        scoringAnalysis,
        performanceAnalysis,
        thresholdAnalysis
      );

      const result: TestExecutionResult = {
        timestamp,
        testResults,
        scoringAnalysis,
        performanceAnalysis,
        thresholdAnalysis,
        optimizationReport,
        recommendations,
        overallScore
      };

      this.results.push(result);

      const totalTimeMs = Date.now() - startTime;
      console.log(`✅ Comprehensive testing completed in ${totalTimeMs}ms`);
      console.log(`📊 Overall System Score: ${overallScore.toFixed(1)}/100`);

      return result;

    } catch (error: any) {
      console.error('❌ Comprehensive testing failed:', error);
      throw error;
    }
  }

  async runQuickValidation(): Promise<{
    isValid: boolean;
    issues: string[];
    score: number;
  }> {
    console.log('🔍 Running quick validation...');
    
    try {
      // Test with a single high-quality case
      const testCase = {
        name: 'Quick Validation Test',
        input: {
          cagr: "12.5%",
          marketSize: "2.8B",
          directCompetitors: ["Enhertu", "Kadcyla"],
          prvEligibility: "Eligible",
          nationalPriority: "High",
          reviewTimelineMonths: "12",
          peakRevenue2030: "1.8B",
          total10YearRevenue: "12.5B",
          peakMarketShare2030: "15%",
          peakPatients2030: "150K",
          avgSellingPrice: "$45K",
          persistenceRate: "75%",
          treatmentDuration: "18 months",
          geographicSplit: "60% US / 40% Ex-US",
          competitorPricing: [],
          pricingScenarios: [],
          strategicTailwindData: {},
          dealActivity: [],
          pipelineAnalysis: {
            crowdingPercent: "12%",
            competitiveThreats: ["ADC competition"],
            strategicFitRank: "85"
          }
        },
        expectedScore: 85,
        expectedIssues: [],
        description: 'Quick validation test case',
        category: 'high_quality' as const
      };

      const result = await this.tester.runSingleTest(testCase);
      
      const isValid = result.passed && result.actualScore >= 80;
      const issues = result.passed ? [] : ['Review system not meeting quality standards'];
      const score = result.actualScore;

      return { isValid, issues, score };

    } catch (error: any) {
      console.error('Quick validation failed:', error);
      return {
        isValid: false,
        issues: ['Review system test failed', error.message],
        score: 0
      };
    }
  }

  async runOptimizationTest(): Promise<{
    originalScore: number;
    optimizedScore: number;
    improvements: string[];
  }> {
    console.log('🔧 Running optimization test...');
    
    try {
      // Test with original settings
      const originalResult = await enhancedReviewPerplexityOutput(
        this.getTestInput(),
        0,
        { temperature: 0.1, max_tokens: 4000 }
      );

      // Test with optimized settings
      const optimizedResult = await enhancedReviewPerplexityOutput(
        this.getTestInput(),
        0,
        { temperature: 0.05, max_tokens: 6000 }
      );

      const originalScore = originalResult.assessment.overallScore;
      const optimizedScore = optimizedResult.assessment.overallScore;
      const improvements = [];

      if (optimizedScore > originalScore) {
        improvements.push(`Score improved from ${originalScore} to ${optimizedScore}`);
      }

      if (optimizedResult.assessment.confidenceLevel > originalResult.assessment.confidenceLevel) {
        improvements.push('Confidence level improved');
      }

      if (optimizedResult.assessment.sourceValidation.sourceQualityScore > originalResult.assessment.sourceValidation.sourceQualityScore) {
        improvements.push('Source quality assessment improved');
      }

      return {
        originalScore,
        optimizedScore,
        improvements
      };

    } catch (error: any) {
      console.error('Optimization test failed:', error);
      return {
        originalScore: 0,
        optimizedScore: 0,
        improvements: ['Optimization test failed']
      };
    }
  }

  private getTestInput(): any {
    return {
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
  }

  private generateRecommendations(
    testResults: any,
    scoringAnalysis: any,
    performanceAnalysis: any,
    thresholdAnalysis: any
  ): string[] {
    const recommendations: string[] = [];

    // Test results recommendations
    if (testResults.summary.averageScoreAccuracy < 0.8) {
      recommendations.push('🔧 Improve scoring accuracy by refining assessment criteria and prompt engineering');
    }

    if (testResults.summary.averageIssuesAccuracy < 0.7) {
      recommendations.push('🎯 Enhance issue detection algorithms with more specific criteria');
    }

    // Scoring analysis recommendations
    if (scoringAnalysis.scoringAccuracy < 0.8) {
      recommendations.push('📊 Refine scoring criteria to reduce bias and improve accuracy');
    }

    Object.entries(scoringAnalysis.biasAnalysis).forEach(([category, bias]) => {
      if (Math.abs(bias as number) > 10) {
        recommendations.push(`⚖️ Address scoring bias in ${category} category (bias: ${(bias as number).toFixed(1)})`);
      }
    });

    // Performance recommendations
    if (performanceAnalysis.averageReviewTime > 8000) {
      recommendations.push('⚡ Optimize review prompt complexity and token usage for faster processing');
    }

    if (performanceAnalysis.timeDistribution.slow > 2) {
      recommendations.push('🚀 Consider implementing parallel processing for review tasks');
    }

    // Threshold recommendations
    if (thresholdAnalysis.thresholdAccuracy < 0.9) {
      recommendations.push(`📈 Adjust quality threshold from 85 to ${thresholdAnalysis.optimalThreshold} for better accuracy`);
    }

    if (thresholdAnalysis.falsePositives > 0) {
      recommendations.push('🛡️ Strengthen quality criteria to reduce false positives');
    }

    if (thresholdAnalysis.falseNegatives > 0) {
      recommendations.push('✅ Relax quality criteria slightly to reduce false negatives');
    }

    return recommendations;
  }

  private calculateOverallScore(
    testResults: any,
    scoringAnalysis: any,
    performanceAnalysis: any,
    thresholdAnalysis: any
  ): number {
    // Weighted scoring based on different aspects
    const testScore = testResults.summary.passedTests / testResults.summary.totalTests * 100;
    const scoringScore = scoringAnalysis.scoringAccuracy * 100;
    const performanceScore = Math.max(0, 100 - (performanceAnalysis.averageReviewTime - 5000) / 50);
    const thresholdScore = thresholdAnalysis.thresholdAccuracy * 100;

    // Weighted average
    const overallScore = (
      testScore * 0.4 +
      scoringScore * 0.3 +
      performanceScore * 0.2 +
      thresholdScore * 0.1
    );

    return Math.min(100, Math.max(0, overallScore));
  }

  getHistoricalResults(): TestExecutionResult[] {
    return this.results;
  }

  generateTrendAnalysis(): {
    trend: 'improving' | 'stable' | 'declining';
    averageScore: number;
    scoreChange: number;
    recommendations: string[];
  } {
    if (this.results.length < 2) {
      return {
        trend: 'stable',
        averageScore: this.results[0]?.overallScore || 0,
        scoreChange: 0,
        recommendations: ['Need more test runs to establish trends']
      };
    }

    const recentScores = this.results.slice(-3).map(r => r.overallScore);
    const averageScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const scoreChange = recentScores[recentScores.length - 1] - recentScores[0];

    let trend: 'improving' | 'stable' | 'declining';
    if (scoreChange > 5) {
      trend = 'improving';
    } else if (scoreChange < -5) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    const recommendations = [];
    if (trend === 'declining') {
      recommendations.push('📉 System performance is declining - investigate recent changes');
    } else if (trend === 'stable' && averageScore < 80) {
      recommendations.push('📊 System is stable but below target - implement optimization recommendations');
    }

    return {
      trend,
      averageScore,
      scoreChange,
      recommendations
    };
  }
}

// Export for easy access
export const testRunner = new ComprehensiveTestRunner(); 