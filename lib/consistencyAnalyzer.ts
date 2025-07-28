import { fetchPplx } from './pplxClient';
import { optimizedReviewPerplexityOutput } from './optimizedReviewClient';

interface ConsistencyTestResult {
  testId: string;
  runNumber: number;
  target: string;
  indication: string;
  output: any;
  qualityScore: number;
  responseTime: number;
  tokenCount: number;
  sourceCount: number;
  issues: string[];
  recommendations: string[];
}

interface ConsistencyAnalysis {
  testId: string;
  target: string;
  indication: string;
  runs: ConsistencyTestResult[];
  averageQualityScore: number;
  qualityScoreVariance: number;
  averageResponseTime: number;
  averageTokenCount: number;
  averageSourceCount: number;
  consistencyIssues: string[];
  optimizationRecommendations: string[];
}

export class ConsistencyAnalyzer {
  private testResults: ConsistencyTestResult[] = [];

  async runConsistencyTest(
    target: string,
    indication: string,
    numberOfRuns: number = 3
  ): Promise<ConsistencyAnalysis> {
    const testId = `consistency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Starting consistency test: ${testId}`);
    console.log(`Target: ${target}, Indication: ${indication}, Runs: ${numberOfRuns}`);

    // Run multiple iterations
    for (let run = 1; run <= numberOfRuns; run++) {
      console.log(`\n--- Run ${run}/${numberOfRuns} ---`);
      
      const startTime = Date.now();
      
      try {
        // Generate prompt for this test
        const prompt = this.generateTestPrompt(target, indication);
        
        // Call Perplexity API
        const response = await fetchPplx({
          model: 'sonar-deep-research',
          messages: [
            { role: 'system', content: 'You are a senior pharmaceutical industry expert with 25+ years of experience.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 12000,
          temperature: 0.05,
          reasoning_effort: 'high',
          top_p: 0.9,
          top_k: 50,
          repetition_penalty: 1.1
        });

        const responseTime = Date.now() - startTime;
        
        if (!response.choices?.[0]?.message?.content) {
          throw new Error('Invalid response from Perplexity API');
        }

        let output;
        try {
          output = this.parsePerplexityResponse(response.choices[0].message.content);
        } catch (error) {
          throw new Error(`Failed to parse JSON response: ${error}`);
        }

        // Review the output for quality
        const reviewResult = await optimizedReviewPerplexityOutput(output, 0, {
          temperature: 0.05,
          max_tokens: 4000
        });

        const result: ConsistencyTestResult = {
          testId,
          runNumber: run,
          target,
          indication,
          output,
          qualityScore: reviewResult.assessment.overallScore * 100,
          responseTime,
          tokenCount: response.usage?.total_tokens || 0,
          sourceCount: response.usage?.num_search_queries || 0,
          issues: reviewResult.assessment.criticalIssues.map(issue => issue.description),
          recommendations: [reviewResult.assessment.correctiveInstructions]
        };

        this.testResults.push(result);
        
        console.log(`Run ${run} completed:`);
        console.log(`  Quality Score: ${result.qualityScore.toFixed(1)}%`);
        console.log(`  Response Time: ${result.responseTime}ms`);
        console.log(`  Token Count: ${result.tokenCount}`);
        console.log(`  Source Count: ${result.sourceCount}`);
        console.log(`  Issues: ${result.issues.length}`);
        
      } catch (error) {
        console.error(`Run ${run} failed:`, error);
        
        const result: ConsistencyTestResult = {
          testId,
          runNumber: run,
          target,
          indication,
          output: null,
          qualityScore: 0,
          responseTime: Date.now() - startTime,
          tokenCount: 0,
          sourceCount: 0,
          issues: [`Run failed: ${error}`],
          recommendations: ['Retry with different parameters']
        };
        
        this.testResults.push(result);
      }
    }

    // Analyze consistency
    return this.analyzeConsistency(testId, target, indication);
  }

  private generateTestPrompt(target: string, indication: string): string {
    return `COMPREHENSIVE PHARMACEUTICAL COMMERCIAL INTELLIGENCE ANALYSIS

RESEARCH CONTEXT:
Target: ${target}
Indication: ${indication}
Therapeutic Area: Auto-determined
Geography: Global
Development Phase: Phase 2

RESEARCH METHODOLOGY:
You must conduct exhaustive research across the following domains in order of priority:

1. REGULATORY LANDSCAPE (Highest Priority)
   - FDA/EMA guidance documents and precedents
   - Clinical trial requirements and endpoints
   - Regulatory designations (Breakthrough, Fast Track, Orphan Drug)
   - Review timelines and approval pathways
   - Post-marketing requirements and risk management

2. CLINICAL & SCIENTIFIC EVIDENCE
   - Published clinical trial data and meta-analyses
   - Mechanism of action and biological plausibility
   - Safety and efficacy profiles
   - Biomarker strategies and companion diagnostics
   - Real-world evidence and patient outcomes

3. COMPETITIVE INTELLIGENCE
   - Direct competitors with same target/indication
   - Pipeline analysis and development timelines
   - Market positioning and differentiation strategies
   - Pricing and access strategies of competitors
   - M&A activity and licensing deals

4. MARKET ACCESS & COMMERCIAL STRATEGY
   - Payer coverage and reimbursement landscape
   - Pricing strategy and gross-to-net considerations
   - Patient access programs and copay support
   - Geographic market dynamics and regional variations
   - Launch sequencing and market entry timing

5. INTELLECTUAL PROPERTY & EXCLUSIVITY
   - Patent landscape and expiration analysis
   - Regulatory exclusivity and data protection
   - Generic entry timing and impact assessment
   - Freedom-to-operate analysis
   - IP strategy and portfolio management

6. FINANCIAL PROJECTIONS & VALUATION
   - Market size and growth projections
   - Peak sales estimates and revenue modeling
   - Cost of development and commercialization
   - Risk-adjusted NPV and ROI analysis
   - Comparable asset valuations and deal multiples

SOURCE REQUIREMENTS:
- Minimum 25 unique, high-quality sources
- Primary sources: FDA.gov, EMA.europa.eu, ClinicalTrials.gov, PubMed
- Industry databases: EvaluatePharma, IQVIA, Citeline, Cortellis
- Financial sources: Bloomberg, Reuters, SEC filings
- Academic sources: Nature, Science, NEJM, Lancet
- Patent databases: USPTO, WIPO, Espacenet

QUALITY STANDARDS:
- All data must be current (within 2 years)
- Numerical values must be realistic and within industry ranges
- Drug names and mechanisms must be accurate
- Regulatory information must be precise and up-to-date
- Market projections must be evidence-based and conservative
- Source citations must be specific and verifiable

OUTPUT REQUIREMENTS:
Return ONLY a valid JSON object with the following structure:
{
  "cagr": "string (Compound Annual Growth Rate)",
  "marketSize": "string (current and projected market size)",
  "directCompetitors": ["array of strings (names of direct competitors)"],
  "prvEligibility": "string or number (Priority Review Voucher eligibility)",
  "nationalPriority": "string (public health priority tier)",
  "reviewTimelineMonths": "string or number (expected FDA review timeline)",
  "peakRevenue2030": "string (forecasted peak revenue by 2030)",
  "total10YearRevenue": "string (estimated total revenue over 10 years)",
  "peakMarketShare2030": "string (projected market share by 2030)",
  "peakPatients2030": "string (estimated treated patient population by 2030)",
  "avgSellingPrice": "string (average selling price per patient in dollars)",
  "persistenceRate": "string (12-month treatment persistence rate as percentage)",
  "treatmentDuration": "string (median treatment duration in months)",
  "geographicSplit": "string (revenue split between US and ex-US markets at peak)",
  "competitorPricing": [{"drugName": "string", "annualPrice": "string", "indication": "string", "accessLevel": "string", "rationale": "string"}],
  "pricingScenarios": [{"scenarioName": "string", "usPrice": "string", "exUsPrice": "string", "grossToNet": "string", "copaySupport": "string", "accessPrograms": "string", "genericEntryYear": "string", "lossOfExclusivityImpact": "string", "rationale": "string"}],
  "strategicTailwindData": {"fdaDesignations": {"status": "string", "rationale": "string"}, "guidanceDocuments": {"status": "string", "rationale": "string"}, "policyIncentives": {"status": "string", "rationale": "string"}, "advocacyActivity": {"status": "string", "rationale": "string"}, "marketPrecedent": {"status": "string", "rationale": "string"}},
  "dealActivity": [{"assetName": "string", "buyerAcquirer": "string", "developmentStage": "string", "dealPrice": "string", "dealDate": "string", "rationale": "string"}],
  "pipelineAnalysis": {"crowdingPercent": "string", "competitiveThreats": ["array of strings"], "strategicFitRank": "string"}
}

CRITICAL: This analysis must meet the standards of a senior pharmaceutical industry expert. No placeholder values, no generic statements, no unsubstantiated claims.`;
  }

  private analyzeConsistency(
    testId: string,
    target: string,
    indication: string
  ): ConsistencyAnalysis {
    const runs = this.testResults.filter(r => r.testId === testId);
    
    if (runs.length === 0) {
      throw new Error('No test results found for analysis');
    }

    // Calculate averages
    const qualityScores = runs.map(r => r.qualityScore).filter(score => score > 0);
    const responseTimes = runs.map(r => r.responseTime).filter(time => time > 0);
    const tokenCounts = runs.map(r => r.tokenCount).filter(count => count > 0);
    const sourceCounts = runs.map(r => r.sourceCount).filter(count => count > 0);

    const averageQualityScore = qualityScores.length > 0 ? 
      qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length : 0;
    
    const averageResponseTime = responseTimes.length > 0 ? 
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
    
    const averageTokenCount = tokenCounts.length > 0 ? 
      tokenCounts.reduce((a, b) => a + b, 0) / tokenCounts.length : 0;
    
    const averageSourceCount = sourceCounts.length > 0 ? 
      sourceCounts.reduce((a, b) => a + b, 0) / sourceCounts.length : 0;

    // Calculate variance in quality scores
    const qualityScoreVariance = qualityScores.length > 1 ? 
      this.calculateVariance(qualityScores) : 0;

    // Identify consistency issues
    const consistencyIssues: string[] = [];
    const optimizationRecommendations: string[] = [];

    // Check for high variance in quality scores
    if (qualityScoreVariance > 100) { // Variance of 10 points or more
      consistencyIssues.push('High variance in quality scores indicates inconsistent output quality');
      optimizationRecommendations.push('Implement stricter prompt engineering and model parameters');
    }

    // Check for failed runs
    const failedRuns = runs.filter(r => r.qualityScore === 0);
    if (failedRuns.length > 0) {
      consistencyIssues.push(`${failedRuns.length} runs failed completely`);
      optimizationRecommendations.push('Improve error handling and retry logic');
    }

    // Check for low average quality
    if (averageQualityScore < 80) {
      consistencyIssues.push('Average quality score below 80% indicates need for improvement');
      optimizationRecommendations.push('Enhance prompt engineering and source requirements');
    }

    // Check for high variance in response times
    const responseTimeVariance = this.calculateVariance(responseTimes);
    if (responseTimeVariance > 1000000) { // Variance of 1 second or more
      consistencyIssues.push('High variance in response times indicates unstable performance');
      optimizationRecommendations.push('Optimize API calls and implement better caching');
    }

    // Check for low source counts
    if (averageSourceCount < 20) {
      consistencyIssues.push('Average source count below 20 indicates insufficient research depth');
      optimizationRecommendations.push('Increase search queries and source requirements');
    }

    return {
      testId,
      target,
      indication,
      runs,
      averageQualityScore,
      qualityScoreVariance,
      averageResponseTime,
      averageTokenCount,
      averageSourceCount,
      consistencyIssues,
      optimizationRecommendations
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    return squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
  }

  private parsePerplexityResponse(content: string): any {
    // Handle thinking responses and extract JSON
    if (content.includes('<think>')) {
      const thinkMatch = content.match(/<think>[\s\S]*?<\/think>/);
      if (thinkMatch) {
        content = content.replace(thinkMatch[0], '').trim();
      }
    }
    
    // Try to extract JSON from the response
    try {
      return JSON.parse(content);
    } catch (e) {
      // Fallback: try to extract JSON from code block
      const codeBlockMatch = content.match(/^```(?:json)?\n([\s\S]*?)\n```$/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1]);
      }
      throw new Error(`Failed to parse JSON response: ${e}`);
    }
  }

  async runComprehensiveAnalysis(): Promise<void> {
    const testCases = [
      { target: 'HER2', indication: 'HER2-Positive Breast Cancer' },
      { target: 'PD-L1', indication: 'Non-Small Cell Lung Cancer' },
      { target: 'SOD1', indication: 'Amyotrophic Lateral Sclerosis' }
    ];

    console.log('Starting comprehensive consistency analysis...\n');

    for (const testCase of testCases) {
      console.log(`\n=== Testing: ${testCase.target} - ${testCase.indication} ===`);
      
      const analysis = await this.runConsistencyTest(
        testCase.target,
        testCase.indication,
        3
      );

      console.log('\n--- Analysis Results ---');
      console.log(`Average Quality Score: ${analysis.averageQualityScore.toFixed(1)}%`);
      console.log(`Quality Score Variance: ${analysis.qualityScoreVariance.toFixed(1)}`);
      console.log(`Average Response Time: ${analysis.averageResponseTime.toFixed(0)}ms`);
      console.log(`Average Token Count: ${analysis.averageTokenCount.toFixed(0)}`);
      console.log(`Average Source Count: ${analysis.averageSourceCount.toFixed(0)}`);
      
      if (analysis.consistencyIssues.length > 0) {
        console.log('\nConsistency Issues:');
        analysis.consistencyIssues.forEach(issue => console.log(`- ${issue}`));
      }
      
      if (analysis.optimizationRecommendations.length > 0) {
        console.log('\nOptimization Recommendations:');
        analysis.optimizationRecommendations.forEach(rec => console.log(`- ${rec}`));
      }
    }

    console.log('\n=== Comprehensive Analysis Complete ===');
  }
} 