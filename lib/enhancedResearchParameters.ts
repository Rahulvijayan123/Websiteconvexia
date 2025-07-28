export interface ResearchParameters {
  // Quality thresholds
  qualityThreshold: number;
  validationStrictness: 'low' | 'medium' | 'high' | 'ultra';
  maxValidationCycles: number;
  maxFieldRetries: number;
  
  // Research depth
  searchDepth: 'standard' | 'deep' | 'comprehensive';
  searchContextSize: 'medium' | 'high' | 'extensive';
  searchQueriesPerSearch: number;
  reasoningEffort: 'low' | 'medium' | 'high' | 'maximum';
  
  // Cost management
  maxCostPerQuery: number;
  enableCostOptimization: boolean;
  costAwareModelSelection: boolean;
  
  // Validation settings
  enableFieldLevelValidation: boolean;
  enableSmartValidation: boolean;
  enableGPTLogicVerification: boolean;
  enableExecutiveValidation: boolean;
  enableGPT4oEnhancement: boolean;
  
  // Caching and efficiency
  enableCaching: boolean;
  batchSize: number;
  rateLimitDelay: number;
  timeoutMs: number;
  
  // Therapeutic area specific parameters
  therapeuticAreaParams: TherapeuticAreaParams;
  
  // Development phase specific parameters
  developmentPhaseParams: DevelopmentPhaseParams;
  
  // Geographic specific parameters
  geographicParams: GeographicParams;
}

export interface TherapeuticAreaParams {
  dermatology: {
    competitorAnalysisDepth: number;
    pricingSensitivity: number;
    regulatoryComplexity: number;
    marketMaturity: number;
  };
  ophthalmology: {
    competitorAnalysisDepth: number;
    pricingSensitivity: number;
    regulatoryComplexity: number;
    marketMaturity: number;
  };
  psychiatry: {
    competitorAnalysisDepth: number;
    pricingSensitivity: number;
    regulatoryComplexity: number;
    marketMaturity: number;
  };
  urology: {
    competitorAnalysisDepth: number;
    pricingSensitivity: number;
    regulatoryComplexity: number;
    marketMaturity: number;
  };
  vaccines: {
    competitorAnalysisDepth: number;
    pricingSensitivity: number;
    regulatoryComplexity: number;
    marketMaturity: number;
  };
}

export interface DevelopmentPhaseParams {
  preclinical: {
    revenueProjectionLimit: number;
    marketShareLimit: number;
    competitorAnalysisDepth: number;
    regulatoryFocus: string[];
  };
  phase1: {
    revenueProjectionLimit: number;
    marketShareLimit: number;
    competitorAnalysisDepth: number;
    regulatoryFocus: string[];
  };
  phase2: {
    revenueProjectionLimit: number;
    marketShareLimit: number;
    competitorAnalysisDepth: number;
    regulatoryFocus: string[];
  };
  phase3: {
    revenueProjectionLimit: number;
    marketShareLimit: number;
    competitorAnalysisDepth: number;
    regulatoryFocus: string[];
  };
  approved: {
    revenueProjectionLimit: number;
    marketShareLimit: number;
    competitorAnalysisDepth: number;
    regulatoryFocus: string[];
  };
}

export interface GeographicParams {
  us: {
    pricingAnalysisDepth: number;
    regulatoryAnalysisDepth: number;
    marketAccessComplexity: number;
    competitorFocus: string[];
  };
  eu: {
    pricingAnalysisDepth: number;
    regulatoryAnalysisDepth: number;
    marketAccessComplexity: number;
    competitorFocus: string[];
  };
  global: {
    pricingAnalysisDepth: number;
    regulatoryAnalysisDepth: number;
    marketAccessComplexity: number;
    competitorFocus: string[];
  };
  southKorea: {
    pricingAnalysisDepth: number;
    regulatoryAnalysisDepth: number;
    marketAccessComplexity: number;
    competitorFocus: string[];
  };
  brazil: {
    pricingAnalysisDepth: number;
    regulatoryAnalysisDepth: number;
    marketAccessComplexity: number;
    competitorFocus: string[];
  };
}

export class EnhancedResearchParameters {
  private static instance: EnhancedResearchParameters;
  private defaultParams: ResearchParameters;

  private constructor() {
    this.defaultParams = this.initializeDefaultParameters();
  }

  static getInstance(): EnhancedResearchParameters {
    if (!EnhancedResearchParameters.instance) {
      EnhancedResearchParameters.instance = new EnhancedResearchParameters();
    }
    return EnhancedResearchParameters.instance;
  }

  private initializeDefaultParameters(): ResearchParameters {
    return {
      // Quality thresholds
      qualityThreshold: 0.85,
      validationStrictness: 'high',
      maxValidationCycles: 3,
      maxFieldRetries: 2,
      
      // Research depth
      searchDepth: 'deep',
      searchContextSize: 'high',
      searchQueriesPerSearch: 4,
      reasoningEffort: 'high',
      
      // Cost management
      maxCostPerQuery: 5.0,
      enableCostOptimization: true,
      costAwareModelSelection: true,
      
      // Validation settings
      enableFieldLevelValidation: true,
      enableSmartValidation: true,
      enableGPTLogicVerification: true,
      enableExecutiveValidation: true,
      enableGPT4oEnhancement: true,
      
      // Caching and efficiency
      enableCaching: true,
      batchSize: 6,
      rateLimitDelay: 2000,
      timeoutMs: 180000,
      
      // Therapeutic area specific parameters
      therapeuticAreaParams: {
        dermatology: {
          competitorAnalysisDepth: 8,
          pricingSensitivity: 7,
          regulatoryComplexity: 5,
          marketMaturity: 8
        },
        ophthalmology: {
          competitorAnalysisDepth: 9,
          pricingSensitivity: 8,
          regulatoryComplexity: 7,
          marketMaturity: 7
        },
        psychiatry: {
          competitorAnalysisDepth: 7,
          pricingSensitivity: 6,
          regulatoryComplexity: 8,
          marketMaturity: 6
        },
        urology: {
          competitorAnalysisDepth: 6,
          pricingSensitivity: 5,
          regulatoryComplexity: 4,
          marketMaturity: 7
        },
        vaccines: {
          competitorAnalysisDepth: 9,
          pricingSensitivity: 9,
          regulatoryComplexity: 9,
          marketMaturity: 8
        }
      },
      
      // Development phase specific parameters
      developmentPhaseParams: {
        preclinical: {
          revenueProjectionLimit: 0.1,
          marketShareLimit: 5,
          competitorAnalysisDepth: 5,
          regulatoryFocus: ['safety', 'mechanism']
        },
        phase1: {
          revenueProjectionLimit: 0.5,
          marketShareLimit: 10,
          competitorAnalysisDepth: 6,
          regulatoryFocus: ['safety', 'dosing', 'mechanism']
        },
        phase2: {
          revenueProjectionLimit: 1.0,
          marketShareLimit: 15,
          competitorAnalysisDepth: 7,
          regulatoryFocus: ['efficacy', 'safety', 'dosing']
        },
        phase3: {
          revenueProjectionLimit: 2.0,
          marketShareLimit: 25,
          competitorAnalysisDepth: 8,
          regulatoryFocus: ['efficacy', 'safety', 'labeling']
        },
        approved: {
          revenueProjectionLimit: 5.0,
          marketShareLimit: 40,
          competitorAnalysisDepth: 9,
          regulatoryFocus: ['labeling', 'post-marketing', 'lifecycle']
        }
      },
      
      // Geographic specific parameters
      geographicParams: {
        us: {
          pricingAnalysisDepth: 9,
          regulatoryAnalysisDepth: 9,
          marketAccessComplexity: 8,
          competitorFocus: ['top10', 'emerging', 'biosimilars']
        },
        eu: {
          pricingAnalysisDepth: 8,
          regulatoryAnalysisDepth: 8,
          marketAccessComplexity: 7,
          competitorFocus: ['top10', 'emerging', 'biosimilars']
        },
        global: {
          pricingAnalysisDepth: 7,
          regulatoryAnalysisDepth: 6,
          marketAccessComplexity: 6,
          competitorFocus: ['top10', 'emerging', 'regional']
        },
        southKorea: {
          pricingAnalysisDepth: 6,
          regulatoryAnalysisDepth: 7,
          marketAccessComplexity: 5,
          competitorFocus: ['domestic', 'top10', 'emerging']
        },
        brazil: {
          pricingAnalysisDepth: 5,
          regulatoryAnalysisDepth: 6,
          marketAccessComplexity: 4,
          competitorFocus: ['domestic', 'top10', 'emerging']
        }
      }
    };
  }

  /**
   * Get optimized parameters for specific input
   */
  getOptimizedParameters(inputs: any): ResearchParameters {
    const params = { ...this.defaultParams };
    
    // Adjust based on therapeutic area
    const therapeuticArea = inputs.therapeuticArea?.toLowerCase();
    if (therapeuticArea && params.therapeuticAreaParams[therapeuticArea as keyof TherapeuticAreaParams]) {
      const areaParams = params.therapeuticAreaParams[therapeuticArea as keyof TherapeuticAreaParams];
      
      // Adjust search depth based on competitor analysis depth
      if (areaParams.competitorAnalysisDepth >= 8) {
        params.searchDepth = 'comprehensive';
        params.searchQueriesPerSearch = 5;
      } else if (areaParams.competitorAnalysisDepth >= 6) {
        params.searchDepth = 'deep';
        params.searchQueriesPerSearch = 4;
      }
      
      // Adjust validation strictness based on regulatory complexity
      if (areaParams.regulatoryComplexity >= 8) {
        params.validationStrictness = 'ultra';
        params.maxValidationCycles = 4;
      } else if (areaParams.regulatoryComplexity >= 6) {
        params.validationStrictness = 'high';
        params.maxValidationCycles = 3;
      }
    }
    
    // Adjust based on development phase
    const developmentPhase = inputs.developmentPhase?.toLowerCase();
    if (developmentPhase && params.developmentPhaseParams[developmentPhase as keyof DevelopmentPhaseParams]) {
      const phaseParams = params.developmentPhaseParams[developmentPhase as keyof DevelopmentPhaseParams];
      
      // Adjust quality threshold based on phase
      if (developmentPhase === 'preclinical') {
        params.qualityThreshold = 0.75; // Lower threshold for early stage
        params.enableGPT4oEnhancement = false; // Skip enhancement for preclinical
      } else if (developmentPhase === 'approved') {
        params.qualityThreshold = 0.90; // Higher threshold for approved drugs
        params.enableExecutiveValidation = true;
      }
      
      // Adjust reasoning effort based on competitor analysis depth
      if (phaseParams.competitorAnalysisDepth >= 8) {
        params.reasoningEffort = 'maximum';
      } else if (phaseParams.competitorAnalysisDepth >= 6) {
        params.reasoningEffort = 'high';
      }
    }
    
    // Adjust based on geography
    const geography = inputs.geography?.toLowerCase();
    if (geography && params.geographicParams[geography as keyof GeographicParams]) {
      const geoParams = params.geographicParams[geography as keyof GeographicParams];
      
      // Adjust search context size based on market access complexity
      if (geoParams.marketAccessComplexity >= 8) {
        params.searchContextSize = 'extensive';
        params.searchQueriesPerSearch = Math.max(params.searchQueriesPerSearch, 5);
      }
      
      // Adjust pricing analysis depth
      if (geoParams.pricingAnalysisDepth >= 8) {
        params.enableFieldLevelValidation = true;
        params.enableSmartValidation = true;
      }
    }
    
    return params;
  }

  /**
   * Get validation thresholds for specific field
   */
  getFieldValidationThresholds(fieldName: string, inputs: any): {
    minScore: number;
    requiresRegeneration: boolean;
    validationStrictness: 'low' | 'medium' | 'high';
  } {
    const baseThresholds = {
      marketSize: { minScore: 0.7, requiresRegeneration: true, validationStrictness: 'high' as const },
      peakRevenue2030: { minScore: 0.8, requiresRegeneration: true, validationStrictness: 'high' as const },
      cagr: { minScore: 0.8, requiresRegeneration: true, validationStrictness: 'high' as const },
      directCompetitors: { minScore: 0.6, requiresRegeneration: false, validationStrictness: 'medium' as const },
      avgSellingPrice: { minScore: 0.7, requiresRegeneration: true, validationStrictness: 'high' as const },
      geographicSplit: { minScore: 0.8, requiresRegeneration: true, validationStrictness: 'high' as const },
      pricingScenarios: { minScore: 0.6, requiresRegeneration: false, validationStrictness: 'medium' as const },
      strategicTailwindData: { minScore: 0.5, requiresRegeneration: false, validationStrictness: 'low' as const }
    };

    const thresholds = baseThresholds[fieldName as keyof typeof baseThresholds] || {
      minScore: 0.6,
      requiresRegeneration: false,
      validationStrictness: 'medium' as const
    };

    // Adjust based on development phase
    const developmentPhase = inputs.developmentPhase?.toLowerCase();
    if (developmentPhase === 'preclinical') {
      thresholds.minScore *= 0.8; // Lower thresholds for preclinical
    } else if (developmentPhase === 'approved') {
      thresholds.minScore *= 1.1; // Higher thresholds for approved drugs
    }

    // Adjust based on therapeutic area
    const therapeuticArea = inputs.therapeuticArea?.toLowerCase();
    if (therapeuticArea === 'vaccines') {
      thresholds.validationStrictness = 'high';
    } else if (therapeuticArea === 'psychiatry') {
      thresholds.validationStrictness = 'high';
    }

    return thresholds;
  }

  /**
   * Get research prompt enhancements for specific input
   */
  getResearchPromptEnhancements(inputs: any): {
    additionalRequirements: string[];
    focusAreas: string[];
    dataSources: string[];
    validationCriteria: string[];
  } {
    const enhancements: {
      additionalRequirements: string[];
      focusAreas: string[];
      dataSources: string[];
      validationCriteria: string[];
    } = {
      additionalRequirements: [],
      focusAreas: [],
      dataSources: [],
      validationCriteria: []
    };

    // Therapeutic area specific enhancements
    const therapeuticArea = inputs.therapeuticArea?.toLowerCase();
    if (therapeuticArea === 'dermatology') {
      enhancements.focusAreas.push('biologic vs small molecule landscape', 'patient access patterns', 'dermatologist prescribing behavior');
      enhancements.dataSources.push('IQVIA dermatology reports', 'Dermatology Times', 'American Academy of Dermatology');
    } else if (therapeuticArea === 'ophthalmology') {
      enhancements.focusAreas.push('retinal specialist network', 'injection frequency patterns', 'anti-VEGF market dynamics');
      enhancements.dataSources.push('Retina Today', 'American Academy of Ophthalmology', 'Ophthalmology Times');
    } else if (therapeuticArea === 'psychiatry') {
      enhancements.focusAreas.push('mental health access barriers', 'psychiatrist prescribing patterns', 'insurance coverage trends');
      enhancements.dataSources.push('Psychiatric Times', 'American Psychiatric Association', 'Mental Health America');
    } else if (therapeuticArea === 'urology') {
      enhancements.focusAreas.push('urologist practice patterns', 'patient persistence rates', 'generic erosion patterns');
      enhancements.dataSources.push('Urology Times', 'American Urological Association', 'Urology Practice');
    } else if (therapeuticArea === 'vaccines') {
      enhancements.focusAreas.push('public health infrastructure', 'vaccination rates', 'government procurement patterns');
      enhancements.dataSources.push('CDC vaccine reports', 'WHO immunization data', 'Vaccine journal');
    }

    // Development phase specific enhancements
    const developmentPhase = inputs.developmentPhase?.toLowerCase();
    if (developmentPhase === 'preclinical') {
      enhancements.additionalRequirements.push('Focus on mechanism of action validation', 'Include preclinical safety data', 'Consider regulatory pathway requirements');
      enhancements.validationCriteria.push('Mechanism plausibility', 'Preclinical safety profile', 'Regulatory pathway clarity');
    } else if (developmentPhase === 'phase1') {
      enhancements.additionalRequirements.push('Include Phase 1 safety data', 'Consider dose-ranging studies', 'Evaluate PK/PD relationships');
      enhancements.validationCriteria.push('Safety profile assessment', 'Dose-response relationships', 'PK/PD modeling');
    } else if (developmentPhase === 'phase2') {
      enhancements.additionalRequirements.push('Include efficacy signals', 'Consider biomarker data', 'Evaluate patient selection criteria');
      enhancements.validationCriteria.push('Efficacy signal strength', 'Biomarker validation', 'Patient population definition');
    } else if (developmentPhase === 'phase3') {
      enhancements.additionalRequirements.push('Include pivotal trial design', 'Consider regulatory endpoints', 'Evaluate competitive positioning');
      enhancements.validationCriteria.push('Trial design adequacy', 'Endpoint validation', 'Competitive differentiation');
    } else if (developmentPhase === 'approved') {
      enhancements.additionalRequirements.push('Include post-marketing data', 'Consider real-world evidence', 'Evaluate lifecycle management');
      enhancements.validationCriteria.push('Post-marketing safety', 'Real-world effectiveness', 'Lifecycle opportunities');
    }

    // Geographic specific enhancements
    const geography = inputs.geography?.toLowerCase();
    if (geography === 'us') {
      enhancements.focusAreas.push('FDA regulatory pathway', 'Medicare/Medicaid coverage', 'commercial insurance landscape');
      enhancements.dataSources.push('FDA databases', 'CMS data', 'Kaiser Family Foundation');
    } else if (geography === 'eu') {
      enhancements.focusAreas.push('EMA regulatory pathway', 'HTA requirements', 'national reimbursement systems');
      enhancements.dataSources.push('EMA databases', 'EUnetHTA', 'national HTA agencies');
    } else if (geography === 'global') {
      enhancements.focusAreas.push('WHO guidelines', 'regional regulatory differences', 'access programs');
      enhancements.dataSources.push('WHO databases', 'regional regulatory agencies', 'access program reports');
    }

    return enhancements;
  }

  /**
   * Get cost optimization parameters
   */
  getCostOptimizationParameters(inputs: any): {
    maxCostPerQuery: number;
    enableCostOptimization: boolean;
    costAwareModelSelection: boolean;
    budgetAllocation: {
      research: number;
      validation: number;
      enhancement: number;
    };
  } {
    const baseBudget = 5.0;
    const therapeuticArea = inputs.therapeuticArea?.toLowerCase();
    const developmentPhase = inputs.developmentPhase?.toLowerCase();
    const geography = inputs.geography?.toLowerCase();

    let adjustedBudget = baseBudget;

    // Adjust budget based on therapeutic area complexity
    if (therapeuticArea === 'vaccines') {
      adjustedBudget *= 1.2; // Higher complexity
    } else if (therapeuticArea === 'psychiatry') {
      adjustedBudget *= 1.1; // Medium complexity
    } else if (therapeuticArea === 'urology') {
      adjustedBudget *= 0.9; // Lower complexity
    }

    // Adjust budget based on development phase
    if (developmentPhase === 'preclinical') {
      adjustedBudget *= 0.8; // Less data available
    } else if (developmentPhase === 'approved') {
      adjustedBudget *= 1.1; // More data available
    }

    // Adjust budget based on geography
    if (geography === 'global') {
      adjustedBudget *= 1.2; // More complex analysis
    } else if (geography === 'southKorea' || geography === 'brazil') {
      adjustedBudget *= 0.9; // Less data available
    }

    return {
      maxCostPerQuery: adjustedBudget,
      enableCostOptimization: true,
      costAwareModelSelection: true,
      budgetAllocation: {
        research: 0.4,
        validation: 0.4,
        enhancement: 0.2
      }
    };
  }
} 