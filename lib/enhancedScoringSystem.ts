import { EnhancedMathAuditor } from './enhancedMathAuditor';

export interface ScoringMetrics {
  dataCompleteness: number;
  logicalConsistency: number;
  mathematicalAccuracy: number;
  factualAlignment: number;
  phaseAppropriateness: number;
  geographicConsistency: number;
  competitiveIntelligence: number;
  regulatoryAlignment: number;
  overallQuality: number;
  confidence: number;
  issues: string[];
  recommendations: string[];
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  corrections: string[];
  confidence: number;
}

export class EnhancedScoringSystem {
  private mathAuditor: EnhancedMathAuditor;

  constructor() {
    this.mathAuditor = new EnhancedMathAuditor();
  }

  /**
   * Comprehensive quality assessment with enhanced scoring
   */
  async assessOutputQuality(data: any, inputs: any): Promise<ScoringMetrics> {
    const metrics: ScoringMetrics = {
      dataCompleteness: 0,
      logicalConsistency: 0,
      mathematicalAccuracy: 0,
      factualAlignment: 0,
      phaseAppropriateness: 0,
      geographicConsistency: 0,
      competitiveIntelligence: 0,
      regulatoryAlignment: 0,
      overallQuality: 0,
      confidence: 0,
      issues: [],
      recommendations: []
    };

    // 1. Data Completeness Assessment
    metrics.dataCompleteness = this.assessDataCompleteness(data);
    
    // 2. Logical Consistency Check
    metrics.logicalConsistency = this.assessLogicalConsistency(data, inputs);
    
    // 3. Mathematical Accuracy
    metrics.mathematicalAccuracy = await this.assessMathematicalAccuracy(data);
    
    // 4. Factual Alignment
    metrics.factualAlignment = this.assessFactualAlignment(data, inputs);
    
    // 5. Phase Appropriateness
    metrics.phaseAppropriateness = this.assessPhaseAppropriateness(data, inputs);
    
    // 6. Geographic Consistency
    metrics.geographicConsistency = this.assessGeographicConsistency(data, inputs);
    
    // 7. Competitive Intelligence Quality
    metrics.competitiveIntelligence = this.assessCompetitiveIntelligence(data);
    
    // 8. Regulatory Alignment
    metrics.regulatoryAlignment = this.assessRegulatoryAlignment(data, inputs);

    // Calculate overall quality score
    metrics.overallQuality = this.calculateOverallQuality(metrics);
    
    // Calculate confidence level
    metrics.confidence = this.calculateConfidence(metrics);

    return metrics;
  }

  /**
   * Enhanced data completeness assessment
   */
  private assessDataCompleteness(data: any): number {
    const criticalFields = [
      'marketSize', 'peakRevenue2030', 'cagr', 'directCompetitors',
      'avgSellingPrice', 'pricingScenarios', 'strategicTailwindData'
    ];

    const importantFields = [
      'dealActivity', 'pipelineAnalysis', 'competitorPricing',
      'geographicSplit', 'patentStatus', 'prvEligibility'
    ];

    let score = 0;
    let totalFields = criticalFields.length + importantFields.length;

    // Check critical fields (weighted more heavily)
    criticalFields.forEach(field => {
      if (this.hasValidValue(data[field])) {
        score += 2; // Critical fields worth 2 points each
      }
    });

    // Check important fields
    importantFields.forEach(field => {
      if (this.hasValidValue(data[field])) {
        score += 1; // Important fields worth 1 point each
      }
    });

    return Math.min(10, (score / (criticalFields.length * 2 + importantFields.length)) * 10);
  }

  /**
   * Enhanced logical consistency assessment
   */
  private assessLogicalConsistency(data: any, inputs: any): number {
    let score = 10;
    const issues: string[] = [];

    // Market size vs revenue projections
    if (data.marketSize && data.peakRevenue2030) {
      const marketSize = this.extractNumericValue(data.marketSize);
      const peakRevenue = this.extractNumericValue(data.peakRevenue2030);
      
      if (marketSize && peakRevenue) {
        const revenueToMarketRatio = peakRevenue / marketSize;
        if (revenueToMarketRatio > 0.4) {
          issues.push(`Peak revenue (${peakRevenue}B) exceeds 40% of market size (${marketSize}B)`);
          score -= 2;
        } else if (revenueToMarketRatio > 0.25) {
          issues.push(`Peak revenue (${peakRevenue}B) exceeds 25% of market size (${marketSize}B)`);
          score -= 1;
        }
      }
    }

    // Development phase appropriateness
    if (inputs.developmentPhase === 'Preclinical' && data.peakRevenue2030) {
      const peakRevenue = this.extractNumericValue(data.peakRevenue2030);
      if (peakRevenue && peakRevenue > 0.5) {
        issues.push(`Preclinical asset has high revenue projection: ${peakRevenue}B`);
        score -= 2;
      }
    }

    // Geographic consistency
    if (inputs.geography !== 'Global' && data.geographicSplit) {
      if (typeof data.geographicSplit === 'object') {
        const total = data.geographicSplit.us + data.geographicSplit.exUs;
        if (Math.abs(total - 100) > 5) {
          issues.push(`Geographic split doesn't sum to 100%: ${total}%`);
          score -= 1;
        }
      }
    }

    // CAGR consistency
    if (data.cagr) {
      const cagr = this.extractNumericValue(data.cagr);
      if (cagr && (cagr > 50 || cagr < -20)) {
        issues.push(`Unrealistic CAGR: ${cagr}%`);
        score -= 1;
      }
    }

    // Pricing consistency
    if (data.avgSellingPrice && data.pricingScenarios) {
      const avgPrice = this.extractNumericValue(data.avgSellingPrice);
      if (avgPrice && avgPrice > 1000000) {
        issues.push(`Unrealistic average selling price: $${avgPrice}`);
        score -= 1;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Enhanced mathematical accuracy assessment
   */
  private async assessMathematicalAccuracy(data: any): Promise<number> {
    const mathAudit = await this.mathAuditor.auditMath(data);
    return Math.min(10, (mathAudit.overallScore / 2) * 10); // Normalize to 0-10 scale
  }

  /**
   * Enhanced factual alignment assessment
   */
  private assessFactualAlignment(data: any, inputs: any): number {
    let score = 10;
    const issues: string[] = [];

    // Check therapeutic area alignment
    if (data.strategicTailwindData?.fdaDesignations) {
      const designations = data.strategicTailwindData.fdaDesignations;
      
      // Dermatology-specific checks
      if (inputs.therapeuticArea === 'Dermatology') {
        if (designations.orphanDrug === 'Yes') {
          issues.push('Dermatology indication unlikely to qualify for orphan drug status');
          score -= 1;
        }
      }

      // Psychiatry-specific checks
      if (inputs.therapeuticArea === 'Psychiatry') {
        if (designations.breakthroughTherapy === 'No' && inputs.developmentPhase === 'Approved') {
          issues.push('Approved psychiatry drug should have breakthrough therapy consideration');
          score -= 1;
        }
      }

      // Vaccine-specific checks
      if (inputs.therapeuticArea === 'Vaccines') {
        if (designations.orphanDrug === 'Yes') {
          issues.push('Vaccines typically don\'t qualify for orphan drug status');
          score -= 1;
        }
      }
    }

    // Check competitor alignment
    if (data.directCompetitors && Array.isArray(data.directCompetitors)) {
      const competitors = data.directCompetitors;
      if (competitors.length < 2) {
        issues.push('Insufficient competitor analysis');
        score -= 1;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Enhanced phase appropriateness assessment
   */
  private assessPhaseAppropriateness(data: any, inputs: any): number {
    let score = 10;
    const phase = inputs.developmentPhase;

    // Revenue projections by phase
    if (data.peakRevenue2030) {
      const peakRevenue = this.extractNumericValue(data.peakRevenue2030);
      if (peakRevenue) {
        switch (phase) {
          case 'Preclinical':
            if (peakRevenue > 0.1) {
              score -= 3;
            }
            break;
          case 'Phase 1':
            if (peakRevenue > 0.5) {
              score -= 2;
            }
            break;
          case 'Phase 2':
            if (peakRevenue > 1.0) {
              score -= 1;
            }
            break;
          case 'Phase 3':
            if (peakRevenue > 2.0) {
              score -= 1;
            }
            break;
          case 'Approved':
            // Approved drugs can have high projections
            break;
        }
      }
    }

    // Patent status by phase
    if (data.patentStatus) {
      if (phase === 'Preclinical' && data.patentStatus.includes('Expired')) {
        score -= 2;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Enhanced geographic consistency assessment
   */
  private assessGeographicConsistency(data: any, inputs: any): number {
    let score = 10;

    if (inputs.geography === 'Global') {
      if (data.geographicSplit && typeof data.geographicSplit === 'object') {
        const usShare = data.geographicSplit.us || 0;
        const exUsShare = data.geographicSplit.exUs || 0;
        
        if (usShare < 30 || usShare > 70) {
          score -= 1; // Global should have reasonable US/ex-US split
        }
      }
    } else if (inputs.geography === 'US') {
      if (data.geographicSplit && typeof data.geographicSplit === 'object') {
        const usShare = data.geographicSplit.us || 0;
        if (usShare < 80) {
          score -= 2; // US-focused should be primarily US
        }
      }
    } else if (inputs.geography === 'EU') {
      if (data.geographicSplit && typeof data.geographicSplit === 'object') {
        const exUsShare = data.geographicSplit.exUs || 0;
        if (exUsShare < 60) {
          score -= 2; // EU-focused should be primarily ex-US
        }
      }
    }

    return Math.max(0, score);
  }

  /**
   * Enhanced competitive intelligence assessment
   */
  private assessCompetitiveIntelligence(data: any): number {
    let score = 10;

    // Check competitor analysis depth
    if (data.directCompetitors && Array.isArray(data.directCompetitors)) {
      if (data.directCompetitors.length < 3) {
        score -= 1;
      }
    } else {
      score -= 2;
    }

    // Check pricing analysis
    if (data.competitorPricing && Array.isArray(data.competitorPricing)) {
      if (data.competitorPricing.length < 2) {
        score -= 1;
      }
    } else {
      score -= 1;
    }

    // Check deal activity analysis
    if (data.dealActivity && Array.isArray(data.dealActivity)) {
      if (data.dealActivity.length < 1) {
        score -= 1;
      }
    } else {
      score -= 1;
    }

    return Math.max(0, score);
  }

  /**
   * Enhanced regulatory alignment assessment
   */
  private assessRegulatoryAlignment(data: any, inputs: any): number {
    let score = 10;

    // Check PRV eligibility
    if (data.prvEligibility) {
      const isEligible = data.prvEligibility.toLowerCase().includes('eligible');
      
      // Phase 1 and earlier should not have PRV eligibility for most indications
      if (['Phase 1', 'Preclinical'].includes(inputs.developmentPhase) && isEligible) {
        score -= 1;
      }
    }

    // Check review timeline
    if (data.reviewTimelineMonths) {
      const timeline = parseInt(data.reviewTimelineMonths);
      if (timeline < 6 || timeline > 18) {
        score -= 1;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallQuality(metrics: ScoringMetrics): number {
    const weights = {
      dataCompleteness: 0.20,
      logicalConsistency: 0.25,
      mathematicalAccuracy: 0.15,
      factualAlignment: 0.15,
      phaseAppropriateness: 0.10,
      geographicConsistency: 0.05,
      competitiveIntelligence: 0.05,
      regulatoryAlignment: 0.05
    };

    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      const value = metrics[key as keyof ScoringMetrics];
      if (typeof value === 'number') {
        weightedSum += value * weight;
      }
      totalWeight += weight;
    });

    return Math.round((weightedSum / totalWeight) * 100) / 100;
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(metrics: ScoringMetrics): number {
    // Base confidence on data completeness and logical consistency
    const baseConfidence = (metrics.dataCompleteness + metrics.logicalConsistency) / 2;
    
    // Adjust based on number of issues
    const issuePenalty = Math.min(30, metrics.issues.length * 5);
    
    return Math.max(0, Math.min(100, baseConfidence * 10 - issuePenalty));
  }

  /**
   * Enhanced field validation
   */
  validateField(fieldName: string, value: any, inputs: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      score: 10,
      issues: [],
      corrections: [],
      confidence: 100
    };

    // Check if value exists
    if (!this.hasValidValue(value)) {
      result.isValid = false;
      result.score = 0;
      result.issues.push(`Missing or invalid ${fieldName}`);
      result.confidence = 0;
      return result;
    }

    // Field-specific validation
    switch (fieldName) {
      case 'marketSize':
        this.validateMarketSize(value, result, inputs);
        break;
      case 'peakRevenue2030':
        this.validatePeakRevenue(value, result, inputs);
        break;
      case 'cagr':
        this.validateCAGR(value, result);
        break;
      case 'directCompetitors':
        this.validateCompetitors(value, result);
        break;
      case 'avgSellingPrice':
        this.validatePricing(value, result, inputs);
        break;
      case 'geographicSplit':
        this.validateGeographicSplit(value, result, inputs);
        break;
    }

    return result;
  }

  private validateMarketSize(value: any, result: ValidationResult, inputs: any): void {
    const marketSize = this.extractNumericValue(value);
    if (marketSize) {
      if (marketSize < 0.01) {
        result.issues.push('Market size too small');
        result.score -= 2;
      } else if (marketSize > 100) {
        result.issues.push('Market size unrealistically large');
        result.score -= 2;
      }
    }
  }

  private validatePeakRevenue(value: any, result: ValidationResult, inputs: any): void {
    const peakRevenue = this.extractNumericValue(value);
    if (peakRevenue) {
      const phase = inputs.developmentPhase;
      
      if (phase === 'Preclinical' && peakRevenue > 0.1) {
        result.issues.push('Preclinical asset has high revenue projection');
        result.score -= 3;
      } else if (phase === 'Phase 1' && peakRevenue > 0.5) {
        result.issues.push('Phase 1 asset has high revenue projection');
        result.score -= 2;
      }
    }
  }

  private validateCAGR(value: any, result: ValidationResult): void {
    const cagr = this.extractNumericValue(value);
    if (cagr) {
      if (cagr > 50 || cagr < -20) {
        result.issues.push('Unrealistic CAGR');
        result.score -= 2;
      }
    }
  }

  private validateCompetitors(value: any, result: ValidationResult): void {
    if (Array.isArray(value)) {
      if (value.length < 2) {
        result.issues.push('Insufficient competitor analysis');
        result.score -= 1;
      }
    } else {
      result.issues.push('Competitors should be an array');
      result.score -= 2;
    }
  }

  private validatePricing(value: any, result: ValidationResult, inputs: any): void {
    const price = this.extractNumericValue(value);
    if (price) {
      if (price > 1000000) {
        result.issues.push('Unrealistic pricing');
        result.score -= 2;
      }
    }
  }

  private validateGeographicSplit(value: any, result: ValidationResult, inputs: any): void {
    if (typeof value === 'object' && value.us !== undefined && value.exUs !== undefined) {
      const total = value.us + value.exUs;
      if (Math.abs(total - 100) > 5) {
        result.issues.push('Geographic split doesn\'t sum to 100%');
        result.score -= 1;
      }
    }
  }

  private hasValidValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '' && value !== 'Data unavailable';
  }

  private extractNumericValue(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const match = value.match(/[\d,]+\.?\d*/);
      if (match) {
        return parseFloat(match[0].replace(/,/g, ''));
      }
    }
    return null;
  }
} 