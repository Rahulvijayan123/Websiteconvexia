# Pharma Analysis System Optimization Guide

## Overview

This document describes the comprehensive optimization of the pharmaceutical commercial intelligence analysis system to deliver **senior pharma domain expert-level output quality** (25+ years, PhD-level reasoning). The system prioritizes research depth, factual rigor, and reasoning traceability over response time.

## System Architecture

### Core Components

1. **Enhanced Perplexity Client** (`lib/pplxClient.ts`)
   - Optimized model configurations for pharma domain expertise
   - Comprehensive source categorization and filtering
   - Advanced timeout and error handling
   - Domain-specific parameter tuning

2. **OpenAI Review Pipeline** (`lib/openaiReviewClient.ts`)
   - Second-stage quality assurance layer
   - Senior pharma expert assessment criteria
   - Corrective feedback generation
   - Retry logic with quality thresholds

3. **Pharma Prompt Engine** (`lib/pharmaPromptEngine.ts`)
   - Domain-specific prompt templates
   - Multi-phase research strategies
   - Context-aware prompt generation
   - Quality-driven prompt optimization

4. **Pharma Orchestrator** (`lib/pharmaOrchestrator.ts`)
   - Multi-agent coordination
   - Quality-driven retry logic
   - Comprehensive caching strategy
   - Performance monitoring and logging

5. **Test Suite** (`lib/pharmaTestSuite.ts`)
   - Comprehensive validation framework
   - Quality benchmarking
   - Performance testing
   - Regression testing

## Key Optimizations

### 1. Perplexity Model Configuration

**Enhanced Parameters for Senior Expert Output:**
- `temperature: 0.05` (very low for factual accuracy)
- `reasoning_effort: "high"` (maximum reasoning depth)
- `max_tokens: 12000` (extended context for comprehensive analysis)
- `top_p: 0.9, top_k: 50` (balanced creativity and accuracy)
- `repetition_penalty: 1.1` (reduces redundancy)

**Comprehensive Source Coverage:**
```typescript
const PHARMA_DOMAIN_SOURCES = {
  regulatory: ['fda.gov', 'ema.europa.eu', 'clinicaltrials.gov', ...],
  market: ['evaluatepharma.com', 'iqvia.com', 'globaldata.com', ...],
  patent: ['uspto.gov', 'wipo.int', 'espacenet.com', ...],
  academic: ['pubmed.ncbi.nlm.nih.gov', 'nature.com', 'science.org', ...],
  deals: ['pitchbook.com', 'sec.gov', 'businesswire.com', ...],
  news: ['biospace.com', 'fiercebiotech.com', 'biopharmadive.com', ...],
  pipeline: ['citeline.com', 'cortellis.com', 'drugbank.ca', ...]
};
```

### 2. Multi-Phase Research Strategy

The system executes research across 6 prioritized phases:

1. **Regulatory Landscape** (Priority 1)
   - FDA/EMA guidance documents
   - Clinical trial requirements
   - Regulatory designations

2. **Clinical & Scientific Evidence** (Priority 2)
   - Published clinical data
   - Mechanism of action
   - Safety/efficacy profiles

3. **Competitive Intelligence** (Priority 3)
   - Direct competitors
   - Pipeline analysis
   - M&A activity

4. **Market Access & Commercial Strategy** (Priority 4)
   - Payer coverage
   - Pricing strategies
   - Market dynamics

5. **Intellectual Property & Exclusivity** (Priority 5)
   - Patent landscape
   - Exclusivity analysis
   - Generic entry timing

6. **Financial Projections & Valuation** (Priority 6)
   - Market size projections
   - Revenue modeling
   - Valuation analysis

### 3. Quality Assurance Pipeline

**OpenAI Review Criteria:**
- **Factual Accuracy (25%)**: Verify data points, drug names, regulatory info
- **Scientific Coherence (20%)**: Assess biological plausibility, clinical interpretation
- **Source Credibility (20%)**: Evaluate source quality and authority
- **Pharma Expertise (20%)**: Check regulatory strategy, market access analysis
- **Reasoning Depth (15%)**: Assess logical flow and evidence-based conclusions

**Quality Thresholds:**
- 0.9-1.0: Exceptional quality (senior expert standards)
- 0.8-0.89: High quality (minor issues)
- 0.7-0.79: Good quality (some concerns)
- Below 0.7: Requires revision

### 4. Advanced Prompt Engineering

**Senior Expert Persona:**
```
You are a senior pharmaceutical industry expert with 25+ years of experience in:
- Regulatory Affairs & Drug Development
- Market Access & Pricing Strategy
- Competitive Intelligence & Strategic Planning
- Clinical Trial Design & Biostatistics
- Intellectual Property & Patent Strategy
- Commercial Operations & Launch Planning
```

**Research Methodology:**
- Minimum 25 unique, high-quality sources
- Primary sources: FDA.gov, EMA.europa.eu, ClinicalTrials.gov, PubMed
- Industry databases: EvaluatePharma, IQVIA, Citeline, Cortellis
- Financial sources: Bloomberg, Reuters, SEC filings
- Academic sources: Nature, Science, NEJM, Lancet

## Configuration

### Environment Variables

```bash
# API Keys
PERPLEXITY_API_KEY=your_perplexity_key
OPENAI_API_KEY=your_openai_key

# Optimization Settings
MAX_RETRY_ATTEMPTS=3
QUALITY_THRESHOLD_SCORE=0.85
MAX_CONTEXT_WINDOW=32000
DEEP_RESEARCH_TIMEOUT=300000
ACADEMIC_MODE_TIMEOUT=420000
```

### Orchestrator Configuration

```typescript
const orchestrator = new PharmaOrchestrator({
  maxRetries: 3,
  qualityThreshold: 0.85,
  enableReviewPipeline: true,
  enableMultiPassResearch: true,
  enableCaching: true,
  timeoutMs: 300000
});
```

## Usage

### Basic Usage

```typescript
import { PharmaOrchestrator } from '@/lib/pharmaOrchestrator';

const orchestrator = new PharmaOrchestrator();

const inputs = {
  target: 'HER2',
  indication: 'HER2-Positive Breast Cancer',
  therapeuticArea: 'Oncology',
  geography: 'Global',
  developmentPhase: 'Phase 3',
  fullResearch: true
};

const result = await orchestrator.orchestrate(inputs, 'sonar-deep-research');

console.log('Quality Score:', result.qualityScore);
console.log('Retry Count:', result.retryCount);
console.log('Sources Used:', result.sourcesUsed);
```

### API Endpoint

```bash
POST /api/pharma-optimized
Content-Type: application/json

{
  "target": "HER2",
  "indication": "HER2-Positive Breast Cancer",
  "therapeuticArea": "Oncology",
  "geography": "Global",
  "developmentPhase": "Phase 3",
  "fullResearch": true
}
```

### Testing

```typescript
import { PharmaTestSuite } from '@/lib/pharmaTestSuite';

const testSuite = new PharmaTestSuite();

// Run all tests
const { results, summary } = await testSuite.runAllTests();

// Run quality benchmark
const benchmark = await testSuite.runQualityBenchmark();
```

## Quality Metrics

### Output Quality Criteria

1. **Source-Backed Analysis**
   - Minimum 25 unique, high-quality sources
   - Primary regulatory and clinical sources
   - Current data (within 2 years)
   - Verifiable citations with URLs

2. **Multi-Paragraph Format**
   - Comprehensive analysis in all fields
   - Causal logic and strategic insights
   - Regulatory and commercial considerations
   - Risk assessments and limitations

3. **Senior Expert Standards**
   - Regulatory affairs lead level analysis
   - Therapeutic area strategist insights
   - Deep pharmaceutical industry expertise
   - Evidence-based recommendations

### Performance Metrics

- **Quality Score**: 0.85+ threshold for acceptance
- **Retry Count**: Maximum 3 attempts with quality improvement
- **Source Coverage**: 25+ unique sources per analysis
- **Response Time**: 3-5 minutes for comprehensive analysis
- **Cache Hit Rate**: 24-hour caching for duplicate requests

## Error Handling

### Common Issues and Solutions

1. **Quality Below Threshold**
   - System automatically retries with corrective feedback
   - Review pipeline identifies specific issues
   - Enhanced prompts address quality gaps

2. **API Timeouts**
   - Configurable timeouts per model type
   - Graceful fallback to faster models
   - Progress tracking and recovery

3. **Source Limitations**
   - Multi-phase research covers all source categories
   - Fallback to alternative sources
   - Quality validation ensures source credibility

## Monitoring and Logging

### Supabase Logging

```sql
-- Query logs table structure
CREATE TABLE query_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  model text,
  inputs jsonb,
  created_at timestamptz DEFAULT now(),
  duration_ms integer,
  source_count integer,
  trace_id text,
  quality_score numeric,
  retry_count integer
);
```

### Performance Monitoring

- **Trace IDs**: Unique identifiers for request tracking
- **Quality Scores**: Per-request quality assessment
- **Retry Metrics**: Success rates and improvement tracking
- **Source Analytics**: Coverage and credibility metrics

## Best Practices

### For Optimal Results

1. **Input Quality**
   - Provide specific target and indication names
   - Include development phase information
   - Specify geographic scope
   - Enable full research for complex queries

2. **Quality Expectations**
   - Allow 3-5 minutes for comprehensive analysis
   - Expect multiple retry attempts for quality improvement
   - Review quality scores in response metadata
   - Check source citations for verification

3. **System Configuration**
   - Use appropriate quality thresholds
   - Enable review pipeline for critical analyses
   - Configure caching for repeated queries
   - Monitor performance metrics

### Troubleshooting

1. **Low Quality Scores**
   - Check input specificity and completeness
   - Review error logs for specific issues
   - Consider adjusting quality thresholds
   - Verify API key configuration

2. **Timeout Issues**
   - Increase timeout values for complex queries
   - Use standard research mode for faster results
   - Check network connectivity
   - Monitor API rate limits

3. **Missing Data**
   - Verify source availability
   - Check domain filtering configuration
   - Review research phase execution
   - Examine quality assessment results

## Future Enhancements

### Planned Improvements

1. **Advanced Reasoning**
   - Multi-step reasoning chains
   - Hypothesis testing and validation
   - Uncertainty quantification
   - Confidence scoring

2. **Enhanced Sources**
   - Real-time data integration
   - Proprietary database access
   - Automated source validation
   - Source credibility scoring

3. **Quality Improvements**
   - Domain-specific quality metrics
   - Expert validation workflows
   - Continuous learning from feedback
   - Automated quality optimization

4. **Performance Optimization**
   - Parallel research execution
   - Intelligent caching strategies
   - Resource optimization
   - Scalability improvements

## Conclusion

This optimized system delivers pharmaceutical commercial intelligence analysis at the level of a senior domain expert with 25+ years of experience. The multi-layered approach ensures comprehensive research, rigorous quality assurance, and evidence-based insights that meet the highest standards of pharmaceutical industry analysis.

The system prioritizes accuracy, depth, and traceability over speed, making it ideal for strategic decision-making, regulatory planning, and competitive intelligence in the pharmaceutical industry. 