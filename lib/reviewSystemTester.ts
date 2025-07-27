import { enhancedReviewPerplexityOutput, isEnhancedQualityAcceptable } from './enhancedReviewClient';

interface TestCase {
  name: string;
  input: any;
  expectedScore: number;
  expectedIssues: string[];
  description: string;
  category: 'high_quality' | 'medium_quality' | 'low_quality' | 'problematic';
}

interface TestResult {
  testCase: TestCase;
  actualScore: number;
  scoreAccuracy: number;
  issuesFound: string[];
  issuesAccuracy: number;
  reviewTimeMs: number;
  confidenceLevel: number;
  sourceQualityScore: number;
  criticalIssues: number;
  passed: boolean;
  assessment: any;
}

// Comprehensive test cases with known quality levels
const REVIEW_TEST_CASES: TestCase[] = [
  {
    name: 'High Quality - HER2+ Breast Cancer Analysis',
    input: {
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
    },
    expectedScore: 85,
    expectedIssues: [],
    description: 'Comprehensive analysis with realistic data and good sources',
    category: 'high_quality'
  },
  {
    name: 'Medium Quality - Missing Sources',
    input: {
      cagr: "15%",
      marketSize: "3.2B",
      directCompetitors: ["Drug A", "Drug B"],
      prvEligibility: "Unknown",
      nationalPriority: "Medium",
      reviewTimelineMonths: "18",
      peakRevenue2030: "2.1B",
      total10YearRevenue: "15.2B",
      peakMarketShare2030: "18%",
      peakPatients2030: "180K",
      avgSellingPrice: "$50K",
      persistenceRate: "80%",
      treatmentDuration: "24 months",
      geographicSplit: "65% US / 35% Ex-US",
      competitorPricing: [],
      pricingScenarios: [],
      strategicTailwindData: {},
      dealActivity: [],
      pipelineAnalysis: {
        crowdingPercent: "15%",
        competitiveThreats: ["Generic competition"],
        strategicFitRank: "70"
      }
    },
    expectedScore: 65,
    expectedIssues: ['Missing source citations', 'Incomplete competitor analysis'],
    description: 'Reasonable data but missing critical sources and details',
    category: 'medium_quality'
  },
  {
    name: 'Low Quality - Unrealistic Projections',
    input: {
      cagr: "45%",
      marketSize: "25B",
      directCompetitors: ["Competitor 1"],
      prvEligibility: "Yes",
      nationalPriority: "Very High",
      reviewTimelineMonths: "6",
      peakRevenue2030: "18B",
      total10YearRevenue: "150B",
      peakMarketShare2030: "85%",
      peakPatients2030: "2M",
      avgSellingPrice: "$200K",
      persistenceRate: "95%",
      treatmentDuration: "36 months",
      geographicSplit: "80% US / 20% Ex-US",
      competitorPricing: [],
      pricingScenarios: [],
      strategicTailwindData: {},
      dealActivity: [],
      pipelineAnalysis: {
        crowdingPercent: "5%",
        competitiveThreats: ["None"],
        strategicFitRank: "95"
      }
    },
    expectedScore: 45,
    expectedIssues: ['Unrealistic market projections', 'Inflated revenue estimates'],
    description: 'Unrealistic projections and inflated estimates',
    category: 'low_quality'
  },
  {
    name: 'Problematic - Fabricated Data',
    input: {
      cagr: "Unknown",
      marketSize: "Unknown",
      directCompetitors: ["FakeDrug123", "TestCompound456"],
      prvEligibility: "Maybe",
      nationalPriority: "Unknown",
      reviewTimelineMonths: "Unknown",
      peakRevenue2030: "Unknown",
      total10YearRevenue: "Unknown",
      peakMarketShare2030: "Unknown",
      peakPatients2030: "Unknown",
      avgSellingPrice: "Unknown",
      persistenceRate: "Unknown",
      treatmentDuration: "Unknown",
      geographicSplit: "Unknown",
      competitorPricing: [],
      pricingScenarios: [],
      strategicTailwindData: {},
      dealActivity: [],
      pipelineAnalysis: {
        crowdingPercent: "Unknown",
        competitiveThreats: ["Unknown"],
        strategicFitRank: "Unknown"
      }
    },
    expectedScore: 25,
    expectedIssues: ['Fabricated drug names', 'Missing critical data', 'Inadequate analysis'],
    description: 'Fabricated data with inadequate analysis',
    category: 'problematic'
  }
];

export class ReviewSystemTester {
  private testResults: TestResult[] = [];

  async runSingleTest(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`Running review test: ${testCase.name}`);
      
      const reviewResult = await enhancedReviewPerplexityOutput(testCase.input, 0, {
        model: 'gpt-4o',
        temperature: 0.05,
        max_tokens: 6000
      });

      const totalTimeMs = Date.now() - startTime;
      const assessment = reviewResult.assessment;

      // Calculate score accuracy
      const scoreAccuracy = Math.abs(assessment.overallScore - testCase.expectedScore) <= 10 ? 1 : 0;

      // Calculate issues accuracy
      const actualIssues = assessment.criticalIssues.map((issue: any) => issue.description);
      const issuesAccuracy = this.calculateIssuesAccuracy(actualIssues, testCase.expectedIssues);

      // Determine if test passed
      const passed = scoreAccuracy > 0.8 && issuesAccuracy > 0.7;

      const result: TestResult = {
        testCase,
        actualScore: assessment.overallScore,
        scoreAccuracy,
        issuesFound: actualIssues,
        issuesAccuracy,
        reviewTimeMs: totalTimeMs,
        confidenceLevel: assessment.confidenceLevel,
        sourceQualityScore: assessment.sourceValidation.sourceQualityScore,
        criticalIssues: assessment.criticalIssues.filter((issue: any) => issue.severity === 'critical').length,
        passed,
        assessment
      };

      console.log(`Test ${result.passed ? 'PASSED' : 'FAILED'}: ${testCase.name}`, {
        expectedScore: testCase.expectedScore,
        actualScore: result.actualScore,
        scoreAccuracy: result.scoreAccuracy,
        reviewTimeMs: result.reviewTimeMs
      });

      return result;

    } catch (error: any) {
      console.error(`Test failed: ${testCase.name}`, error);
      
      return {
        testCase,
        actualScore: 0,
        scoreAccuracy: 0,
        issuesFound: [],
        issuesAccuracy: 0,
        reviewTimeMs: Date.now() - startTime,
        confidenceLevel: 0,
        sourceQualityScore: 0,
        criticalIssues: 0,
        passed: false,
        assessment: { error: error.message }
      };
    }
  }

  async runAllTests(): Promise<{
    results: TestResult[];
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      averageScoreAccuracy: number;
      averageIssuesAccuracy: number;
      averageReviewTimeMs: number;
      categoryBreakdown: Record<string, { passed: number; total: number; averageScore: number }>;
    };
  }> {
    console.log('Starting comprehensive review system testing...');
    
    this.testResults = [];
    
    for (const testCase of REVIEW_TEST_CASES) {
      const result = await this.runSingleTest(testCase);
      this.testResults.push(result);
      
      // Add delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const summary = this.calculateSummary();
    console.log('Review system testing completed:', summary);

    return { results: this.testResults, summary };
  }

  async runScoringAccuracyTest(): Promise<{
    scoringAccuracy: number;
    biasAnalysis: Record<string, number>;
    recommendations: string[];
  }> {
    console.log('Running scoring accuracy analysis...');
    
    const scoringAnalysis = {
      scoringAccuracy: 0,
      biasAnalysis: {} as Record<string, number>,
      recommendations: [] as string[]
    };

    // Analyze scoring patterns
    const scoreDifferences = this.testResults.map(result => 
      Math.abs(result.actualScore - result.testCase.expectedScore)
    );

    scoringAnalysis.scoringAccuracy = 1 - (scoreDifferences.reduce((sum, diff) => sum + diff, 0) / (this.testResults.length * 100));

    // Analyze bias by category
    const categories = ['high_quality', 'medium_quality', 'low_quality', 'problematic'];
    categories.forEach(category => {
      const categoryResults = this.testResults.filter(r => r.testCase.category === category);
      if (categoryResults.length > 0) {
        const avgDifference = categoryResults.reduce((sum, result) => 
          sum + (result.actualScore - result.testCase.expectedScore), 0
        ) / categoryResults.length;
        scoringAnalysis.biasAnalysis[category] = avgDifference;
      }
    });

    // Generate recommendations
    if (scoringAnalysis.scoringAccuracy < 0.8) {
      scoringAnalysis.recommendations.push('Improve scoring accuracy by refining assessment criteria');
    }

    Object.entries(scoringAnalysis.biasAnalysis).forEach(([category, bias]) => {
      if (Math.abs(bias) > 10) {
        scoringAnalysis.recommendations.push(`Address scoring bias in ${category} category (bias: ${bias.toFixed(1)})`);
      }
    });

    return scoringAnalysis;
  }

  async runPerformanceAnalysis(): Promise<{
    averageReviewTime: number;
    timeDistribution: Record<string, number>;
    optimizationOpportunities: string[];
  }> {
    const reviewTimes = this.testResults.map(r => r.reviewTimeMs);
    const averageReviewTime = reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length;

    const timeDistribution = {
      fast: reviewTimes.filter(t => t < 5000).length,
      medium: reviewTimes.filter(t => t >= 5000 && t < 10000).length,
      slow: reviewTimes.filter(t => t >= 10000).length
    };

    const optimizationOpportunities = [];
    if (averageReviewTime > 8000) {
      optimizationOpportunities.push('Consider reducing prompt complexity to improve review speed');
    }
    if (timeDistribution.slow > 2) {
      optimizationOpportunities.push('Optimize token usage for faster processing');
    }

    return {
      averageReviewTime,
      timeDistribution,
      optimizationOpportunities
    };
  }

  async runQualityThresholdTest(): Promise<{
    thresholdAccuracy: number;
    falsePositives: number;
    falseNegatives: number;
    optimalThreshold: number;
  }> {
    console.log('Testing quality threshold accuracy...');
    
    const thresholdResults = this.testResults.map(result => {
      const isAcceptable = isEnhancedQualityAcceptable(result.assessment);
      const shouldBeAcceptable = result.testCase.category === 'high_quality';
      
      return {
        isAcceptable,
        shouldBeAcceptable,
        score: result.actualScore
      };
    });

    const falsePositives = thresholdResults.filter(r => r.isAcceptable && !r.shouldBeAcceptable).length;
    const falseNegatives = thresholdResults.filter(r => !r.isAcceptable && r.shouldBeAcceptable).length;
    const totalTests = thresholdResults.length;
    
    const thresholdAccuracy = (totalTests - falsePositives - falseNegatives) / totalTests;

    // Find optimal threshold
    const highQualityScores = this.testResults
      .filter(r => r.testCase.category === 'high_quality')
      .map(r => r.actualScore);
    const lowQualityScores = this.testResults
      .filter(r => r.testCase.category !== 'high_quality')
      .map(r => r.actualScore);

    const optimalThreshold = this.findOptimalThreshold(highQualityScores, lowQualityScores);

    return {
      thresholdAccuracy,
      falsePositives,
      falseNegatives,
      optimalThreshold
    };
  }

  private calculateIssuesAccuracy(actualIssues: string[], expectedIssues: string[]): number {
    if (expectedIssues.length === 0 && actualIssues.length === 0) return 1;
    if (expectedIssues.length === 0 || actualIssues.length === 0) return 0;

    const matchedIssues = expectedIssues.filter(expected => 
      actualIssues.some(actual => 
        actual.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(actual.toLowerCase())
      )
    );

    return matchedIssues.length / expectedIssues.length;
  }

  private calculateSummary() {
    const passedTests = this.testResults.filter(r => r.passed).length;
    const averageScoreAccuracy = this.testResults.reduce((sum, r) => sum + r.scoreAccuracy, 0) / this.testResults.length;
    const averageIssuesAccuracy = this.testResults.reduce((sum, r) => sum + r.issuesAccuracy, 0) / this.testResults.length;
    const averageReviewTimeMs = this.testResults.reduce((sum, r) => sum + r.reviewTimeMs, 0) / this.testResults.length;

    const categoryBreakdown: Record<string, { passed: number; total: number; averageScore: number }> = {};
    
    ['high_quality', 'medium_quality', 'low_quality', 'problematic'].forEach(category => {
      const categoryResults = this.testResults.filter(r => r.testCase.category === category);
      categoryBreakdown[category] = {
        passed: categoryResults.filter(r => r.passed).length,
        total: categoryResults.length,
        averageScore: categoryResults.reduce((sum, r) => sum + r.actualScore, 0) / categoryResults.length
      };
    });

    return {
      totalTests: this.testResults.length,
      passedTests,
      failedTests: this.testResults.length - passedTests,
      averageScoreAccuracy,
      averageIssuesAccuracy,
      averageReviewTimeMs,
      categoryBreakdown
    };
  }

  private findOptimalThreshold(highQualityScores: number[], lowQualityScores: number[]): number {
    if (highQualityScores.length === 0 || lowQualityScores.length === 0) return 85;

    const minHigh = Math.min(...highQualityScores);
    const maxLow = Math.max(...lowQualityScores);
    
    // Optimal threshold is midpoint between highest low-quality and lowest high-quality
    return Math.round((minHigh + maxLow) / 2);
  }

  generateOptimizationReport(): string {
    const summary = this.calculateSummary();
    
    return `
REVIEW SYSTEM OPTIMIZATION REPORT
================================

PERFORMANCE SUMMARY:
- Total Tests: ${summary.totalTests}
- Passed Tests: ${summary.passedTests} (${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%)
- Average Score Accuracy: ${(summary.averageScoreAccuracy * 100).toFixed(1)}%
- Average Issues Accuracy: ${(summary.averageIssuesAccuracy * 100).toFixed(1)}%
- Average Review Time: ${summary.averageReviewTimeMs.toFixed(0)}ms

CATEGORY BREAKDOWN:
${Object.entries(summary.categoryBreakdown).map(([category, stats]) => 
  `- ${category}: ${stats.passed}/${stats.total} passed (${((stats.passed/stats.total)*100).toFixed(1)}%), avg score: ${stats.averageScore.toFixed(1)}`
).join('\n')}

RECOMMENDATIONS:
${summary.averageScoreAccuracy < 0.8 ? '- Improve scoring accuracy by refining assessment criteria' : ''}
${summary.averageIssuesAccuracy < 0.7 ? '- Enhance issue detection algorithms' : ''}
${summary.averageReviewTimeMs > 8000 ? '- Optimize review prompt for faster processing' : ''}
${summary.passedTests / summary.totalTests < 0.8 ? '- Adjust quality thresholds based on test results' : ''}
    `.trim();
  }
}

// Export test cases for external use
export { REVIEW_TEST_CASES }; 