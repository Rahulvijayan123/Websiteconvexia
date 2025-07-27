interface PharmaResearchContext {
  target: string;
  indication: string;
  therapeuticArea: string;
  geography: string;
  developmentPhase: string;
  fullResearch?: boolean;
  academic?: boolean;
}

interface PromptConfig {
  researchDepth: 'comprehensive' | 'standard' | 'focused';
  sourceEmphasis: 'regulatory' | 'market' | 'academic' | 'balanced';
  outputFormat: 'detailed' | 'executive' | 'technical';
  reasoningLevel: 'expert' | 'senior' | 'strategic';
}

// Senior pharma domain expert prompt templates
const PHARMA_PROMPT_TEMPLATES = {
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
6. Address regulatory, commercial, and scientific considerations holistically`,

  research: `COMPREHENSIVE PHARMACEUTICAL COMMERCIAL INTELLIGENCE ANALYSIS

RESEARCH CONTEXT:
Target: {target}
Indication: {indication}
Therapeutic Area: {therapeuticArea}
Geography: {geography}
Development Phase: {developmentPhase}

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
Return ONLY a valid JSON object matching the commercialOutputSchema with:
- Comprehensive analysis in all required fields
- Realistic, evidence-based projections
- Detailed source citations for every data point
- Strategic insights and risk assessments
- Regulatory and commercial considerations

CRITICAL: This analysis must meet the standards of a senior pharmaceutical industry expert. No placeholder values, no generic statements, no unsubstantiated claims.`,

  corrective: `URGENT QUALITY CORRECTION REQUIRED

Previous analysis scored {qualityScore}% overall quality and failed to meet senior pharmaceutical expert standards.

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

MANDATORY CORRECTIONS:
1. Verify every data point with authoritative sources
2. Ensure all drug names, targets, and mechanisms are accurate
3. Provide realistic market projections within industry norms
4. Include comprehensive regulatory analysis
5. Demonstrate deep pharmaceutical industry expertise
6. Build clear causal relationships and logical reasoning
7. Cite specific, verifiable sources for all claims

RESEARCH CONTEXT:
Target: {target}
Indication: {indication}
Therapeutic Area: {therapeuticArea}
Geography: {geography}
Development Phase: {developmentPhase}

You MUST conduct additional research to address all identified issues. The output must meet senior regulatory affairs lead or therapeutic area strategist standards.`
};

export function generatePharmaPrompt(
  context: PharmaResearchContext,
  config: PromptConfig = {
    researchDepth: 'comprehensive',
    sourceEmphasis: 'balanced',
    outputFormat: 'detailed',
    reasoningLevel: 'expert'
  },
  isRetry: boolean = false,
  qualityAssessment?: any
): string {
  let basePrompt = PHARMA_PROMPT_TEMPLATES.research;
  
  // Replace context variables
  basePrompt = basePrompt
    .replace('{target}', context.target)
    .replace('{indication}', context.indication)
    .replace('{therapeuticArea}', context.therapeuticArea)
    .replace('{geography}', context.geography)
    .replace('{developmentPhase}', context.developmentPhase);

  // Add research depth modifiers
  if (config.researchDepth === 'comprehensive') {
    basePrompt += `

ENHANCED RESEARCH REQUIREMENTS:
- Conduct multi-pass research across all source categories
- Minimum 30 unique sources with comprehensive coverage
- Deep dive into regulatory precedents and clinical evidence
- Exhaustive competitive landscape analysis
- Detailed financial modeling and risk assessment`;
  }

  // Add source emphasis
  if (config.sourceEmphasis === 'regulatory') {
    basePrompt += `

REGULATORY FOCUS:
- Prioritize FDA, EMA, and global regulatory sources
- Focus on clinical trial requirements and approval pathways
- Emphasize regulatory designations and incentives
- Include post-marketing requirements and risk management`;
  } else if (config.sourceEmphasis === 'market') {
    basePrompt += `

MARKET INTELLIGENCE FOCUS:
- Prioritize market research and financial databases
- Focus on competitive landscape and pricing strategies
- Emphasize market access and reimbursement analysis
- Include deal activity and M&A intelligence`;
  } else if (config.sourceEmphasis === 'academic') {
    basePrompt += `

ACADEMIC RESEARCH FOCUS:
- Prioritize peer-reviewed literature and clinical data
- Focus on mechanism of action and scientific evidence
- Emphasize biomarker strategies and patient outcomes
- Include real-world evidence and meta-analyses`;
  }

  // Add reasoning level modifiers
  if (config.reasoningLevel === 'strategic') {
    basePrompt += `

STRATEGIC ANALYSIS REQUIREMENTS:
- Provide strategic insights and recommendations
- Assess competitive positioning and differentiation
- Evaluate market entry timing and sequencing
- Consider long-term commercial implications
- Address risk mitigation strategies`;
  }

  // Add corrective instructions if this is a retry
  if (isRetry && qualityAssessment) {
    const correctivePrompt = PHARMA_PROMPT_TEMPLATES.corrective
      .replace('{qualityScore}', (qualityAssessment.overallScore * 100).toFixed(1))
      .replace('{issues}', qualityAssessment.issues.join('\n'))
      .replace('{recommendations}', qualityAssessment.recommendations.join('\n'))
      .replace('{factualScore}', (qualityAssessment.factualAccuracy * 100).toFixed(1))
      .replace('{scientificScore}', (qualityAssessment.scientificCoherence * 100).toFixed(1))
      .replace('{sourceScore}', (qualityAssessment.sourceCredibility * 100).toFixed(1))
      .replace('{expertiseScore}', (qualityAssessment.pharmaExpertise * 100).toFixed(1))
      .replace('{reasoningScore}', (qualityAssessment.reasoningDepth * 100).toFixed(1))
      .replace('{target}', context.target)
      .replace('{indication}', context.indication)
      .replace('{therapeuticArea}', context.therapeuticArea)
      .replace('{geography}', context.geography)
      .replace('{developmentPhase}', context.developmentPhase);

    basePrompt = correctivePrompt + '\n\n' + basePrompt;
  }

  return basePrompt;
}

export function generateSystemPrompt(): string {
  return PHARMA_PROMPT_TEMPLATES.system;
}

export function getPromptConfig(context: PharmaResearchContext): PromptConfig {
  // Determine research depth based on input complexity
  const inputComplexity = context.target.length + context.indication.length;
  const researchDepth = inputComplexity > 50 || context.fullResearch ? 'comprehensive' : 'standard';
  
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
    researchDepth,
    sourceEmphasis,
    outputFormat: 'detailed',
    reasoningLevel
  };
} 