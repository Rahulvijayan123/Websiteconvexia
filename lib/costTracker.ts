// Cost tracking and limiting system for API calls
export interface CostConfig {
  maxCostPerQuery: number; // $3 limit
  sonarProCostPer1kTokens: number; // $0.20 per 1K tokens
  sonarDeepResearchCostPer1kTokens: number; // $0.50 per 1K tokens
  gpt4oCostPer1kTokens: number; // $0.005 per 1K tokens (input) + $0.015 per 1K tokens (output)
  fallbackToCheaperModel: boolean;
  enableCostTracking: boolean;
}

export interface CostMetrics {
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
  model: string;
  apiCalls: number;
  costBreakdown: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
}

export class CostTracker {
  private currentQueryCost: number = 0;
  private currentQueryMetrics: CostMetrics = {
    totalCost: 0,
    inputTokens: 0,
    outputTokens: 0,
    model: '',
    apiCalls: 0,
    costBreakdown: {
      inputCost: 0,
      outputCost: 0,
      totalCost: 0
    }
  };
  
  private config: CostConfig;

  constructor(config: Partial<CostConfig> = {}) {
    this.config = {
      maxCostPerQuery: 3.0, // Back to $3 limit for quality
      sonarProCostPer1kTokens: 0.20,
      sonarDeepResearchCostPer1kTokens: 0.50,
      gpt4oCostPer1kTokens: 0.005, // input
      fallbackToCheaperModel: true,
      enableCostTracking: true,
      ...config
    };
  }

  // Estimate cost for a potential API call
  estimateCost(model: string, estimatedInputTokens: number, estimatedOutputTokens: number = 0): number {
    let costPer1kInput: number;
    let costPer1kOutput: number;

    switch (model) {
      case 'sonar-pro':
        costPer1kInput = this.config.sonarProCostPer1kTokens;
        costPer1kOutput = this.config.sonarProCostPer1kTokens;
        break;
      case 'sonar-deep-research':
        costPer1kInput = this.config.sonarDeepResearchCostPer1kTokens;
        costPer1kOutput = this.config.sonarDeepResearchCostPer1kTokens;
        break;
      case 'gpt-4o':
      case 'gpt-4o-mini':
        costPer1kInput = 0.005;
        costPer1kOutput = 0.015;
        break;
      default:
        costPer1kInput = this.config.sonarProCostPer1kTokens;
        costPer1kOutput = this.config.sonarProCostPer1kTokens;
    }

    const inputCost = (estimatedInputTokens / 1000) * costPer1kInput;
    const outputCost = (estimatedOutputTokens / 1000) * costPer1kOutput;
    
    return inputCost + outputCost;
  }

  // Check if we can afford another API call
  canAffordCall(model: string, estimatedInputTokens: number, estimatedOutputTokens: number = 0): boolean {
    if (!this.config.enableCostTracking) return true;
    
    const estimatedCost = this.estimateCost(model, estimatedInputTokens, estimatedOutputTokens);
    const totalEstimatedCost = this.currentQueryCost + estimatedCost;
    
    return totalEstimatedCost <= this.config.maxCostPerQuery;
  }

  // Get cheaper model if current model is too expensive
  getCheaperModel(currentModel: string): string {
    if (!this.config.fallbackToCheaperModel) return currentModel;

    switch (currentModel) {
      case 'sonar-deep-research':
        return 'sonar-pro';
      case 'sonar-pro':
        return 'sonar-pro'; // Already the cheapest Perplexity model
      case 'gpt-4o':
        return 'gpt-4o-mini';
      case 'gpt-4o-mini':
        return 'gpt-4o-mini'; // Already the cheapest GPT model
      default:
        return 'sonar-pro';
    }
  }

  // Get optimal model for specific task with budget constraint
  getOptimalModel(task: 'research' | 'validation' | 'logic' | 'math' | 'writing', budget: number): string {
    // For research tasks, prefer sonar-pro over sonar-deep-research to save costs
    if (task === 'research') {
      if (budget > 0.5) {
        return 'sonar-deep-research';
      } else {
        return 'sonar-pro';
      }
    }
    
    // For validation tasks, always use sonar-pro (cheaper)
    if (task === 'validation') {
      return 'sonar-pro';
    }
    
    // For logic/math/writing tasks, use GPT-4o-mini (cheaper than GPT-4o)
    if (['logic', 'math', 'writing'].includes(task)) {
      return 'gpt-4o-mini';
    }
    
    // Default to cheapest option
    return 'sonar-pro';
  }

  // Record actual API call cost
  recordApiCall(model: string, inputTokens: number, outputTokens: number): void {
    if (!this.config.enableCostTracking) return;

    const cost = this.estimateCost(model, inputTokens, outputTokens);
    this.currentQueryCost += cost;
    this.currentQueryMetrics.totalCost += cost;
    this.currentQueryMetrics.inputTokens += inputTokens;
    this.currentQueryMetrics.outputTokens += outputTokens;
    this.currentQueryMetrics.apiCalls += 1;
    this.currentQueryMetrics.model = model;

    // Update cost breakdown
    let costPer1kInput: number;
    let costPer1kOutput: number;

    switch (model) {
      case 'sonar-pro':
        costPer1kInput = this.config.sonarProCostPer1kTokens;
        costPer1kOutput = this.config.sonarProCostPer1kTokens;
        break;
      case 'sonar-deep-research':
        costPer1kInput = this.config.sonarDeepResearchCostPer1kTokens;
        costPer1kOutput = this.config.sonarDeepResearchCostPer1kTokens;
        break;
      case 'gpt-4o':
      case 'gpt-4o-mini':
        costPer1kInput = 0.005;
        costPer1kOutput = 0.015;
        break;
      default:
        costPer1kInput = this.config.sonarProCostPer1kTokens;
        costPer1kOutput = this.config.sonarProCostPer1kTokens;
    }

    const inputCost = (inputTokens / 1000) * costPer1kInput;
    const outputCost = (outputTokens / 1000) * costPer1kOutput;

    this.currentQueryMetrics.costBreakdown.inputCost += inputCost;
    this.currentQueryMetrics.costBreakdown.outputCost += outputCost;
    this.currentQueryMetrics.costBreakdown.totalCost += cost;

    console.log(`💰 API Call Cost: $${cost.toFixed(4)} (${model}) - Total: $${this.currentQueryCost.toFixed(4)}/${this.config.maxCostPerQuery}`);
  }

  // Reset cost tracking for new query
  resetQuery(): void {
    this.currentQueryCost = 0;
    this.currentQueryMetrics = {
      totalCost: 0,
      inputTokens: 0,
      outputTokens: 0,
      model: '',
      apiCalls: 0,
      costBreakdown: {
        inputCost: 0,
        outputCost: 0,
        totalCost: 0
      }
    };
  }

  // Get current query metrics
  getCurrentMetrics(): CostMetrics {
    return { ...this.currentQueryMetrics };
  }

  // Get remaining budget
  getRemainingBudget(): number {
    return Math.max(0, this.config.maxCostPerQuery - this.currentQueryCost);
  }

  // Check if we're approaching the limit
  isApproachingLimit(estimatedCost: number): boolean {
    const remaining = this.getRemainingBudget();
    return remaining < estimatedCost * 1.5; // 50% buffer
  }

  // Get cost optimization suggestions
  getCostOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    
    if (this.currentQueryMetrics.apiCalls > 5) {
      suggestions.push('Consider reducing validation cycles to save API calls');
    }
    
    if (this.currentQueryMetrics.model === 'sonar-deep-research' && this.currentQueryCost > 2) {
      suggestions.push('Consider switching to sonar-pro for remaining calls');
    }
    
    if (this.currentQueryMetrics.inputTokens > 50000) {
      suggestions.push('Consider optimizing prompts to reduce input tokens');
    }
    
    return suggestions;
  }
}

// Global cost tracker instance
export const globalCostTracker = new CostTracker(); 