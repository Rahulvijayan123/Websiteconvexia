interface EnhancedPromptConfig {
  outputStrength: 'maximum' | 'high' | 'standard';
  consistencyLevel: 'strict' | 'balanced' | 'flexible';
  researchDepth: 'comprehensive' | 'standard' | 'focused';
  sourceEmphasis: 'regulatory' | 'market' | 'academic' | 'balanced';
  reasoningLevel: 'expert' | 'senior' | 'strategic';
}

interface QualityStandard {
  minSources: number;
  minQualityScore: number;
  requiredSourceTypes: string[];
  outputFormat: string;
  reasoningDepth: string;
}

// Enhanced prompt templates optimized for strength and consistency
const ENHANCED_PROMPT_TEMPLATES = {
  system: `You are a senior pharmaceutical industry expert with 25+ years of experience in:
- Regulatory Affairs & Drug Development
- Market Access & Pricing Strategy  
- Competitive Intelligence & Strategic Planning
- Clinical Trial Design & Biostatistics
- Intellectual Property & Patent Strategy
- Commercial Operations & Launch Planning

Your expertise spans therapeutic areas including oncology, neurology, immunology, cardiovascular, metabolic, and rare diseases. You have deep knowledge of FDA, EMA, and global regulatory pathways, market dynamics, and industry best practices.

CRITICAL REQUIREMENTS:
1. Provide analysis equivalent to a senior regulatory affairs lead or therapeutic area strategist
2. Use ONLY verifiable, current data from authoritative sources
3. Demonstrate deep understanding of pharmaceutical industry dynamics
4. Include comprehensive source citations with URLs
5. Provide multi-paragraph analysis with causal logic and strategic insights
6. Address regulatory, commercial, and scientific considerations holistically
7. Maintain consistent quality standards across all outputs
8. Provide rich, detailed analysis without unnecessary verbosity`,

  maximumStrength: `COMPREHENSIVE PHARMACEUTICAL COMMERCIAL INTELLIGENCE ANALYSIS - MAXIMUM STRENGTH

RESEARCH CONTEXT:
Target: {target}
Indication: {indication}
Therapeutic Area: {therapeuticArea}
Geography: {geography}
Development Phase: {developmentPhase}

RESEARCH METHODOLOGY - EXHAUSTIVE COVERAGE:
You must conduct exhaustive research across ALL domains with maximum depth and breadth:

1. REGULATORY LANDSCAPE (CRITICAL PRIORITY)
   - FDA/EMA guidance documents, precedents, and recent policy changes
   - Clinical trial requirements, endpoints, and statistical considerations
   - Regulatory designations (Breakthrough, Fast Track, Orphan Drug, Priority Review)
   - Review timelines, approval pathways, and post-marketing requirements
   - Risk management strategies and safety monitoring requirements
   - International regulatory harmonization and global approval strategies

2. CLINICAL & SCIENTIFIC EVIDENCE (COMPREHENSIVE)
   - Published clinical trial data, meta-analyses, and systematic reviews
   - Mechanism of action, biological plausibility, and target validation
   - Safety and efficacy profiles across patient populations
   - Biomarker strategies, companion diagnostics, and precision medicine
   - Real-world evidence, patient outcomes, and quality of life data
   - Comparative effectiveness and value-based healthcare considerations

3. COMPETITIVE INTELLIGENCE (DEEP ANALYSIS)
   - Direct competitors with same target/indication and mechanism
   - Pipeline analysis, development timelines, and clinical milestones
   - Market positioning, differentiation strategies, and competitive advantages
   - Pricing strategies, access programs, and reimbursement approaches
   - M&A activity, licensing deals, and strategic partnerships
   - Competitive response scenarios and market disruption potential

4. MARKET ACCESS & COMMERCIAL STRATEGY (STRATEGIC FOCUS)
   - Payer coverage landscape, formulary positioning, and reimbursement pathways
   - Pricing strategy, gross-to-net considerations, and value demonstration
   - Patient access programs, copay support, and affordability initiatives
   - Geographic market dynamics, regional variations, and launch sequencing
   - Market entry timing, competitive positioning, and commercial readiness
   - Value-based pricing, outcomes-based agreements, and innovative access models

5. INTELLECTUAL PROPERTY & EXCLUSIVITY (COMPREHENSIVE)
   - Patent landscape analysis, expiration timelines, and freedom-to-operate
   - Regulatory exclusivity, data protection, and market exclusivity periods
   - Generic entry timing, biosimilar competition, and exclusivity erosion
   - IP strategy, portfolio management, and defensive patenting
   - Technology transfer, licensing opportunities, and collaborative R&D
   - Patent litigation risks, invalidation scenarios, and enforcement strategies

6. FINANCIAL PROJECTIONS & VALUATION (DETAILED MODELING)
   - Market size analysis, growth projections, and penetration scenarios
   - Peak sales estimates, revenue modeling, and sensitivity analysis
   - Cost of development, commercialization, and manufacturing considerations
   - Risk-adjusted NPV, ROI analysis, and investment attractiveness
   - Comparable asset valuations, deal multiples, and M&A precedents
   - Financial risk factors, market volatility, and scenario planning

SOURCE REQUIREMENTS - MAXIMUM COVERAGE:
- Minimum 35 unique, high-quality, authoritative sources
- Primary regulatory sources: FDA.gov, EMA.europa.eu, ClinicalTrials.gov, PubMed
- Industry databases: EvaluatePharma, IQVIA, Citeline, Cortellis, GlobalData
- Financial sources: Bloomberg, Reuters, SEC filings, company investor relations
- Academic sources: Nature, Science, NEJM, Lancet, JAMA, specialized journals
- Patent databases: USPTO, WIPO, Espacenet, patent litigation databases
- Market research: Frost & Sullivan, Grand View Research, MarketsandMarkets
- Clinical databases: ClinicalTrials.gov, EU-CTR, WHO ICTRP, trial registries

QUALITY STANDARDS - MAXIMUM RIGOR:
- All data must be current (within 18 months for market data, 12 months for clinical data)
- Numerical values must be realistic, evidence-based, and within industry ranges
- Drug names, mechanisms, and targets must be 100% accurate and verified
- Regulatory information must be precise, up-to-date, and policy-compliant
- Market projections must be conservative, evidence-based, and scenario-tested
- Source citations must be specific, verifiable, and include direct URLs
- All assumptions must be explicitly stated and evidence-supported
- Alternative scenarios must be considered and analyzed

OUTPUT REQUIREMENTS - MAXIMUM DETAIL:
Return ONLY a valid JSON object with comprehensive analysis in ALL fields. Each field must contain:
- Detailed, evidence-based analysis with specific data points
- Multiple scenarios and sensitivity analyses where applicable
- Clear causal relationships and logical reasoning chains
- Specific source citations and evidence backing
- Strategic insights and actionable recommendations
- Risk assessments and mitigation strategies
- Competitive positioning and differentiation analysis

CRITICAL: This analysis must meet the standards of a senior pharmaceutical industry expert with maximum depth, accuracy, and strategic value. No placeholder values, no generic statements, no unsubstantiated claims. Every data point must be evidence-backed and every conclusion must be logically derived.`,

  strictConsistency: `COMPREHENSIVE PHARMACEUTICAL COMMERCIAL INTELLIGENCE ANALYSIS - STRICT CONSISTENCY

RESEARCH CONTEXT:
Target: {target}
Indication: {indication}
Therapeutic Area: {therapeuticArea}
Geography: {geography}
Development Phase: {developmentPhase}

CONSISTENCY REQUIREMENTS - MANDATORY STANDARDS:
You MUST maintain consistent quality standards across ALL outputs. This means:

1. QUALITY THRESHOLDS (NON-NEGOTIABLE)
   - Minimum 30 unique, high-quality sources per analysis
   - All numerical values must be within industry-standard ranges
   - All drug names and mechanisms must be 100% accurate
   - All regulatory information must be current and precise
   - All market projections must be evidence-based and conservative
   - All source citations must be specific and verifiable

2. RESEARCH DEPTH STANDARDS (CONSISTENT)
   - Regulatory analysis: Must include FDA/EMA guidance and precedents
   - Clinical analysis: Must include published trial data and meta-analyses
   - Competitive analysis: Must identify 3+ direct competitors minimum
   - Market analysis: Must include payer landscape and access strategies
   - IP analysis: Must include patent landscape and exclusivity analysis
   - Financial analysis: Must include detailed projections and sensitivity analysis

3. OUTPUT FORMAT STANDARDS (UNIFORM)
   - All fields must contain detailed, evidence-based analysis
   - All numerical values must include ranges or confidence intervals
   - All competitive assessments must include rationale and evidence
   - All market projections must include assumptions and scenarios
   - All regulatory assessments must include specific guidance references
   - All source citations must include direct URLs where available

4. REASONING STANDARDS (LOGICAL)
   - All conclusions must have clear causal relationships
   - All assumptions must be explicitly stated and evidence-backed
   - All alternative scenarios must be considered and analyzed
   - All risk factors must be identified and assessed
   - All strategic recommendations must be actionable and evidence-based

RESEARCH METHODOLOGY - STANDARDIZED APPROACH:
Follow this EXACT sequence for ALL analyses:

1. REGULATORY LANDSCAPE (ALWAYS FIRST)
   - FDA/EMA guidance documents and precedents
   - Clinical trial requirements and endpoints
   - Regulatory designations and incentives
   - Review timelines and approval pathways
   - Post-marketing requirements

2. CLINICAL & SCIENTIFIC EVIDENCE (ALWAYS SECOND)
   - Published clinical trial data and meta-analyses
   - Mechanism of action and biological plausibility
   - Safety and efficacy profiles
   - Biomarker strategies and companion diagnostics
   - Real-world evidence and patient outcomes

3. COMPETITIVE INTELLIGENCE (ALWAYS THIRD)
   - Direct competitors with same target/indication
   - Pipeline analysis and development timelines
   - Market positioning and differentiation strategies
   - Pricing and access strategies of competitors
   - M&A activity and licensing deals

4. MARKET ACCESS & COMMERCIAL STRATEGY (ALWAYS FOURTH)
   - Payer coverage and reimbursement landscape
   - Pricing strategy and gross-to-net considerations
   - Patient access programs and copay support
   - Geographic market dynamics and regional variations
   - Launch sequencing and market entry timing

5. INTELLECTUAL PROPERTY & EXCLUSIVITY (ALWAYS FIFTH)
   - Patent landscape and expiration analysis
   - Regulatory exclusivity and data protection
   - Generic entry timing and impact assessment
   - Freedom-to-operate analysis
   - IP strategy and portfolio management

6. FINANCIAL PROJECTIONS & VALUATION (ALWAYS SIXTH)
   - Market size and growth projections
   - Peak sales estimates and revenue modeling
   - Cost of development and commercialization
   - Risk-adjusted NPV and ROI analysis
   - Comparable asset valuations and deal multiples

SOURCE REQUIREMENTS - CONSISTENT STANDARDS:
- Minimum 30 unique, high-quality sources
- Primary sources: FDA.gov, EMA.europa.eu, ClinicalTrials.gov, PubMed
- Industry databases: EvaluatePharma, IQVIA, Citeline, Cortellis
- Financial sources: Bloomberg, Reuters, SEC filings
- Academic sources: Nature, Science, NEJM, Lancet
- Patent databases: USPTO, WIPO, Espacenet

QUALITY VALIDATION - MANDATORY CHECKS:
Before finalizing output, verify:
- All numerical values are within industry ranges
- All drug names and mechanisms are accurate
- All regulatory information is current and precise
- All market projections are evidence-based
- All source citations are specific and verifiable
- All conclusions have clear causal relationships
- All assumptions are explicitly stated
- All alternative scenarios are considered

OUTPUT REQUIREMENTS - CONSISTENT FORMAT:
Return ONLY a valid JSON object with the following structure, ensuring ALL fields contain detailed, evidence-based analysis:

{
  "cagr": "string (Compound Annual Growth Rate with range and confidence)",
  "marketSize": "string (current and projected market size with evidence)",
  "directCompetitors": ["array of strings (names of direct competitors with rationale)"],
  "prvEligibility": "string or number (Priority Review Voucher eligibility with evidence)",
  "nationalPriority": "string (public health priority tier with justification)",
  "reviewTimelineMonths": "string or number (expected FDA review timeline with basis)",
  "peakRevenue2030": "string (forecasted peak revenue by 2030 with assumptions)",
  "total10YearRevenue": "string (estimated total revenue over 10 years with methodology)",
  "peakMarketShare2030": "string (projected market share by 2030 with competitive analysis)",
  "peakPatients2030": "string (estimated treated patient population by 2030 with epidemiology)",
  "avgSellingPrice": "string (average selling price per patient with pricing analysis)",
  "persistenceRate": "string (12-month treatment persistence rate with clinical evidence)",
  "treatmentDuration": "string (median treatment duration with clinical data)",
  "geographicSplit": "string (revenue split between US and ex-US markets with rationale)",
  "competitorPricing": [{"drugName": "string", "annualPrice": "string", "indication": "string", "accessLevel": "string", "rationale": "string"}],
  "pricingScenarios": [{"scenarioName": "string", "usPrice": "string", "exUsPrice": "string", "grossToNet": "string", "copaySupport": "string", "accessPrograms": "string", "genericEntryYear": "string", "lossOfExclusivityImpact": "string", "rationale": "string"}],
  "strategicTailwindData": {"fdaDesignations": {"status": "string", "rationale": "string"}, "guidanceDocuments": {"status": "string", "rationale": "string"}, "policyIncentives": {"status": "string", "rationale": "string"}, "advocacyActivity": {"status": "string", "rationale": "string"}, "marketPrecedent": {"status": "string", "rationale": "string"}},
  "dealActivity": [{"assetName": "string", "buyerAcquirer": "string", "developmentStage": "string", "dealPrice": "string", "dealDate": "string", "rationale": "string"}],
  "pipelineAnalysis": {"crowdingPercent": "string", "competitiveThreats": ["array of strings"], "strategicFitRank": "string"}
}

CRITICAL: Maintain consistent quality standards across ALL outputs. This analysis must meet the standards of a senior pharmaceutical industry expert with uniform depth, accuracy, and strategic value.`,

  corrective: `URGENT QUALITY CORRECTION REQUIRED - ENHANCED STANDARDS

Previous analysis scored {qualityScore}% overall quality and failed to meet enhanced pharmaceutical expert standards.

CRITICAL ISSUES IDENTIFIED:
{issues}

REQUIRED IMPROVEMENTS:
{recommendations}

QUALITY BREAKDOWN:
- Factual Accuracy: {factualScore}%
- Scientific Coherence: {scientificScore}%
- Source Credibility: {sourceScore}%
- Pharma Expertise: {expertiseScore}%
- Reasoning Depth: {reasoningScore}%

MANDATORY CORRECTIONS - ENHANCED STANDARDS:
1. Verify every data point with authoritative sources (minimum 30 sources)
2. Ensure all drug names, targets, and mechanisms are 100% accurate
3. Provide realistic market projections within industry norms with evidence
4. Include comprehensive regulatory analysis with specific guidance references
5. Demonstrate deep pharmaceutical industry expertise with strategic insights
6. Build clear causal relationships and logical reasoning chains
7. Cite specific, verifiable sources for all claims with direct URLs
8. Include alternative scenarios and sensitivity analyses
9. Provide detailed competitive analysis with rationale and evidence
10. Ensure all numerical values include ranges or confidence intervals

RESEARCH CONTEXT:
Target: {target}
Indication: {indication}
Therapeutic Area: {therapeuticArea}
Geography: {geography}
Development Phase: {developmentPhase}

You MUST conduct additional research to address all identified issues. The output must meet enhanced senior regulatory affairs lead or therapeutic area strategist standards with maximum depth, accuracy, and strategic value.`
};

export function generateEnhancedPrompt(
  context: any,
  config: EnhancedPromptConfig = {
    outputStrength: 'maximum',
    consistencyLevel: 'strict',
    researchDepth: 'comprehensive',
    sourceEmphasis: 'balanced',
    reasoningLevel: 'expert'
  },
  isRetry: boolean = false,
  qualityAssessment?: any
): string {
  let basePrompt: string;

  // Select base prompt based on configuration
  if (config.outputStrength === 'maximum') {
    basePrompt = ENHANCED_PROMPT_TEMPLATES.maximumStrength;
  } else if (config.consistencyLevel === 'strict') {
    basePrompt = ENHANCED_PROMPT_TEMPLATES.strictConsistency;
  } else {
    basePrompt = ENHANCED_PROMPT_TEMPLATES.maximumStrength;
  }

  // Replace context variables
  basePrompt = basePrompt
    .replace('{target}', context.target)
    .replace('{indication}', context.indication)
    .replace('{therapeuticArea}', context.therapeuticArea || 'Auto-determined')
    .replace('{geography}', context.geography || 'Global')
    .replace('{developmentPhase}', context.developmentPhase || 'Phase 2');

  // Add research depth modifiers
  if (config.researchDepth === 'comprehensive') {
    basePrompt += `

ENHANCED RESEARCH REQUIREMENTS:
- Conduct multi-pass research across all source categories
- Minimum 35 unique sources with comprehensive coverage
- Deep dive into regulatory precedents and clinical evidence
- Exhaustive competitive landscape analysis
- Detailed financial modeling and risk assessment
- Include alternative scenarios and sensitivity analyses`;
  }

  // Add source emphasis
  if (config.sourceEmphasis === 'regulatory') {
    basePrompt += `

REGULATORY FOCUS - ENHANCED:
- Prioritize FDA, EMA, and global regulatory sources
- Focus on clinical trial requirements and approval pathways
- Emphasize regulatory designations and incentives
- Include post-marketing requirements and risk management
- Analyze regulatory precedents and policy changes`;
  } else if (config.sourceEmphasis === 'market') {
    basePrompt += `

MARKET INTELLIGENCE FOCUS - ENHANCED:
- Prioritize market research and financial databases
- Focus on competitive landscape and pricing strategies
- Emphasize market access and reimbursement analysis
- Include deal activity and M&A intelligence
- Analyze market dynamics and regional variations`;
  } else if (config.sourceEmphasis === 'academic') {
    basePrompt += `

ACADEMIC RESEARCH FOCUS - ENHANCED:
- Prioritize peer-reviewed literature and clinical data
- Focus on mechanism of action and scientific evidence
- Emphasize biomarker strategies and patient outcomes
- Include real-world evidence and meta-analyses
- Analyze comparative effectiveness and value-based healthcare`;
  }

  // Add reasoning level modifiers
  if (config.reasoningLevel === 'strategic') {
    basePrompt += `

STRATEGIC ANALYSIS REQUIREMENTS - ENHANCED:
- Provide strategic insights and actionable recommendations
- Assess competitive positioning and differentiation strategies
- Evaluate market entry timing and sequencing
- Consider long-term commercial implications
- Address risk mitigation strategies and contingency planning
- Include scenario analysis and sensitivity testing`;
  }

  // Add corrective instructions if this is a retry
  if (isRetry && qualityAssessment) {
    const correctivePrompt = ENHANCED_PROMPT_TEMPLATES.corrective
      .replace('{qualityScore}', (qualityAssessment.overallScore * 100).toFixed(1))
      .replace('{issues}', qualityAssessment.criticalIssues?.map((issue: any) => issue.description).join('\n') || 'Quality issues identified')
      .replace('{recommendations}', [qualityAssessment.correctiveInstructions].join('\n'))
      .replace('{factualScore}', (qualityAssessment.categoryScores?.factualAccuracy?.score || 0).toFixed(1))
      .replace('{scientificScore}', (qualityAssessment.categoryScores?.scientificCoherence?.score || 0).toFixed(1))
      .replace('{sourceScore}', (qualityAssessment.categoryScores?.sourceCredibility?.score || 0).toFixed(1))
      .replace('{expertiseScore}', (qualityAssessment.categoryScores?.pharmaExpertise?.score || 0).toFixed(1))
      .replace('{reasoningScore}', (qualityAssessment.categoryScores?.reasoningDepth?.score || 0).toFixed(1))
      .replace('{target}', context.target)
      .replace('{indication}', context.indication)
      .replace('{therapeuticArea}', context.therapeuticArea || 'Auto-determined')
      .replace('{geography}', context.geography || 'Global')
      .replace('{developmentPhase}', context.developmentPhase || 'Phase 2');

    basePrompt = correctivePrompt + '\n\n' + basePrompt;
  }

  return basePrompt;
}

export function generateEnhancedSystemPrompt(): string {
  return ENHANCED_PROMPT_TEMPLATES.system;
}

export function getEnhancedPromptConfig(context: any): EnhancedPromptConfig {
  // Determine output strength based on input complexity and user preference
  const inputComplexity = context.target.length + context.indication.length;
  const outputStrength = inputComplexity > 50 || context.fullResearch ? 'maximum' : 'high';
  
  // Determine consistency level based on development phase
  let consistencyLevel: 'strict' | 'balanced' | 'flexible' = 'balanced';
  if (['Phase 3', 'Filed', 'Marketed'].includes(context.developmentPhase)) {
    consistencyLevel = 'strict';
  } else if (['Preclinical', 'Phase 1'].includes(context.developmentPhase)) {
    consistencyLevel = 'flexible';
  }
  
  // Determine research depth based on therapeutic area
  const researchDepth = ['Oncology', 'Neurology', 'Rare Diseases'].includes(context.therapeuticArea) ? 'comprehensive' : 'standard';
  
  // Determine source emphasis based on development phase
  let sourceEmphasis: 'regulatory' | 'market' | 'academic' | 'balanced' = 'balanced';
  if (['Preclinical', 'Phase 1'].includes(context.developmentPhase)) {
    sourceEmphasis = 'academic';
  } else if (['Phase 3', 'Filed', 'Marketed'].includes(context.developmentPhase)) {
    sourceEmphasis = 'market';
  } else if (['Phase 2'].includes(context.developmentPhase)) {
    sourceEmphasis = 'regulatory';
  }
  
  // Determine reasoning level based on therapeutic area
  const reasoningLevel = ['Oncology', 'Neurology', 'Rare Diseases'].includes(context.therapeuticArea) ? 'strategic' : 'expert';
  
  return {
    outputStrength,
    consistencyLevel,
    researchDepth,
    sourceEmphasis,
    reasoningLevel
  };
}

export function getQualityStandard(config: EnhancedPromptConfig): QualityStandard {
  return {
    minSources: config.outputStrength === 'maximum' ? 35 : 30,
    minQualityScore: config.consistencyLevel === 'strict' ? 0.85 : 0.80,
    requiredSourceTypes: ['FDA.gov', 'ClinicalTrials.gov', 'PubMed', 'EvaluatePharma'],
    outputFormat: 'detailed',
    reasoningDepth: config.reasoningLevel === 'strategic' ? 'strategic' : 'expert'
  };
} 