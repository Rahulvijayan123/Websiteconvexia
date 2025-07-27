import { PharmaOrchestrator } from './pharmaOrchestrator';
import { reviewPerplexityOutput } from './openaiReviewClient';
import { generatePharmaPrompt } from './pharmaPromptEngine';

interface TestCase {
  name: string;
  inputs: {
    target: string;
    indication: string;
    therapeuticArea: string;
    geography: string;
    developmentPhase: string;
    fullResearch?: boolean;
  };
  expectedQuality: number;
  expectedFields: string[];
  description: string;
}

interface TestResult {
  testCase: TestCase;
  passed: boolean;
  qualityScore: number;
  totalTimeMs: number;
  retryCount: number;
  sourcesUsed: number;
  issues: string[];
  metadata: any;
}

// Comprehensive test cases covering different therapeutic areas and scenarios
const TEST_CASES: TestCase[] = [
  {
    name: 'Oncology - HER2+ Breast Cancer',
    inputs: {
      target: 'HER2',
      indication: 'HER2-Positive Breast Cancer',
      therapeuticArea: 'Oncology',
      geography: 'Global',
      developmentPhase: 'Phase 3',
      fullResearch: true
    },
    expectedQuality: 0.85,
    expectedFields: ['directCompetitors', 'dealActivity', 'pricingScenarios'],
    description: 'High-profile oncology target with extensive competitive landscape'
  },
  {
    name: 'Neurology - ALS',
    inputs: {
      target: 'SOD1',
      indication: 'Amyotrophic Lateral Sclerosis',
      therapeuticArea: 'Neurology',
      geography: 'US',
      developmentPhase: 'Phase 2',
      fullResearch: true
    },
    expectedQuality: 0.80,
    expectedFields: ['regulatoryIncentives', 'marketSize', 'strategicTailwindData'],
    description: 'Rare disease with regulatory incentives and limited market'
  },
  {
    name: 'Immunology - Rheumatoid Arthritis',
    inputs: {
      target: 'TNF-alpha',
      indication: 'Rheumatoid Arthritis',
      therapeuticArea: 'Immunology',
      geography: 'Global',
      developmentPhase: 'Marketed',
      fullResearch: false
    },
    expectedQuality: 0.90,
    expectedFields: ['competitorPricing', 'marketShare', 'genericEntry'],
    description: 'Established market with multiple competitors and generic threats'
  },
  {
    name: 'Rare Disease - Cystic Fibrosis',
    inputs: {
      target: 'CFTR',
      indication: 'Cystic Fibrosis',
      therapeuticArea: 'Rare Diseases',
      geography: 'US/EU',
      developmentPhase: 'Phase 1',
      fullResearch: true
    },
    expectedQuality: 0.85,
    expectedFields: ['orphanDrugStatus', 'regulatoryPathway', 'marketAccess'],
    description: 'Rare disease with orphan drug designation and specialized regulatory pathway'
  },
  {
    name: 'Cardiovascular - Heart Failure',
    inputs: {
      target: 'SGLT2',
      indication: 'Heart Failure',
      therapeuticArea: 'Cardiovascular',
      geography: 'Global',
      developmentPhase: 'Phase 3',
      fullResearch: true
    },
    expectedQuality: 0.88,
    expectedFields: ['clinicalEndpoints', 'payerCoverage', 'competitiveLandscape'],
    description: 'Large market with established clinical endpoints and payer considerations'
  }
];

export class PharmaTestSuite {
  private orchestrator: PharmaOrchestrator;

  constructor() {
    this.orchestrator = new PharmaOrchestrator({
      maxRetries: 2, // Reduced for testing
      qualityThreshold: 0.75, // Lower threshold for testing
      enableReviewPipeline: true,
      enableMultiPassResearch: true,
      enableCaching: false // Disable caching for testing
    });
  }

  async runSingleTest(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    const issues: string[] = [];

    try {
      console.log(`Running test: ${testCase.name}`);
      
      // Execute analysis
      const result = await this.orchestrator.orchestrate(testCase.inputs);
      
      const totalTimeMs = Date.now() - startTime;

      // Validate quality score
      if (result.qualityScore < testCase.expectedQuality) {
        issues.push(`Quality score ${result.qualityScore} below expected ${testCase.expectedQuality}`);
      }

      // Validate required fields
      for (const field of testCase.expectedFields) {
        if (!result.output[field] || result.output[field] === 'Unknown') {
          issues.push(`Missing or invalid field: ${field}`);
        }
      }

      // Validate output structure
      const requiredFields = [
        'cagr', 'marketSize', 'directCompetitors', 'prvEligibility', 'nationalPriority',
        'reviewTimelineMonths', 'peakRevenue2030', 'total10YearRevenue', 'peakMarketShare2030',
        'peakPatients2030', 'avgSellingPrice', 'persistenceRate', 'treatmentDuration',
        'geographicSplit', 'competitorPricing', 'pricingScenarios', 'strategicTailwindData',
        'dealActivity', 'pipelineAnalysis'
      ];

      for (const field of requiredFields) {
        if (result.output[field] === undefined || result.output[field] === null) {
          issues.push(`Missing required field: ${field}`);
        }
      }

      // Validate data quality
      if (result.output.directCompetitors && Array.isArray(result.output.directCompetitors)) {
        if (result.output.directCompetitors.length === 0) {
          issues.push('No direct competitors identified');
        }
      }

      if (result.output.dealActivity && Array.isArray(result.output.dealActivity)) {
        if (result.output.dealActivity.length === 0) {
          issues.push('No deal activity identified');
        }
      }

      const passed = issues.length === 0 && result.qualityScore >= testCase.expectedQuality;

      return {
        testCase,
        passed,
        qualityScore: result.qualityScore,
        totalTimeMs,
        retryCount: result.retryCount,
        sourcesUsed: result.sourcesUsed,
        issues,
        metadata: {
          cacheHit: result.cacheHit,
          reviewResults: result.reviewResults?.length || 0
        }
      };

    } catch (error: any) {
      const totalTimeMs = Date.now() - startTime;
      issues.push(`Test execution failed: ${error.message}`);

      return {
        testCase,
        passed: false,
        qualityScore: 0,
        totalTimeMs,
        retryCount: 0,
        sourcesUsed: 0,
        issues,
        metadata: {
          error: error.message
        }
      };
    }
  }

  async runAllTests(): Promise<{
    results: TestResult[];
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      averageQualityScore: number;
      averageTimeMs: number;
      totalIssues: number;
    };
  }> {
    console.log('Starting comprehensive pharma test suite...');
    
    const results: TestResult[] = [];
    
    for (const testCase of TEST_CASES) {
      const result = await this.runSingleTest(testCase);
      results.push(result);
      
      console.log(`Test ${result.passed ? 'PASSED' : 'FAILED'}: ${testCase.name}`, {
        qualityScore: result.qualityScore,
        timeMs: result.totalTimeMs,
        issues: result.issues.length
      });
      
      // Add delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Calculate summary statistics
    const passedTests = results.filter(r => r.passed).length;
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    const averageQualityScore = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
    const averageTimeMs = results.reduce((sum, r) => sum + r.totalTimeMs, 0) / results.length;

    const summary = {
      totalTests: results.length,
      passedTests,
      failedTests: results.length - passedTests,
      averageQualityScore,
      averageTimeMs,
      totalIssues
    };

    console.log('Test suite completed:', summary);

    return { results, summary };
  }

  async runQualityBenchmark(): Promise<{
    promptQuality: number;
    reviewQuality: number;
    overallQuality: number;
    recommendations: string[];
  }> {
    console.log('Running quality benchmark...');

    const testCase = TEST_CASES[0]; // Use oncology test case for benchmark
    const recommendations: string[] = [];

    try {
      // Test prompt generation quality
      const prompt = generatePharmaPrompt(testCase.inputs);
      const promptQuality = this.assessPromptQuality(prompt);
      
      if (promptQuality < 0.8) {
        recommendations.push('Enhance prompt engineering for better research guidance');
      }

      // Test review pipeline quality
      const mockOutput = this.generateMockOutput();
      const reviewResult = await reviewPerplexityOutput(mockOutput);
      const reviewQuality = reviewResult.assessment.overallScore;

      if (reviewQuality < 0.8) {
        recommendations.push('Strengthen review criteria for better quality assessment');
      }

      // Test overall system quality
      const result = await this.orchestrator.orchestrate(testCase.inputs);
      const overallQuality = result.qualityScore;

      if (overallQuality < 0.85) {
        recommendations.push('Improve overall system performance and quality thresholds');
      }

      return {
        promptQuality,
        reviewQuality,
        overallQuality,
        recommendations
      };

    } catch (error: any) {
      console.error('Quality benchmark failed:', error);
      return {
        promptQuality: 0,
        reviewQuality: 0,
        overallQuality: 0,
        recommendations: [`Benchmark failed: ${error.message}`]
      };
    }
  }

  private assessPromptQuality(prompt: string): number {
    let score = 0.5; // Base score

    // Check for comprehensive research requirements
    if (prompt.includes('regulatory') && prompt.includes('clinical') && prompt.includes('competitive')) {
      score += 0.2;
    }

    // Check for source requirements
    if (prompt.includes('FDA') && prompt.includes('PubMed') && prompt.includes('EvaluatePharma')) {
      score += 0.15;
    }

    // Check for quality standards
    if (prompt.includes('realistic') && prompt.includes('evidence-based') && prompt.includes('authoritative')) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }

  private generateMockOutput(): any {
    return {
      cagr: "12.5%",
      marketSize: "2.5B",
      directCompetitors: ["Drug A", "Drug B"],
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
      pipelineAnalysis: {}
    };
  }
}

// Export test cases for external use
export { TEST_CASES }; 