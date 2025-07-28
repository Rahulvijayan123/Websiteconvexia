import commercialSchema from '@/schemas/commercialOutputSchema.json';
import { globalCostTracker } from './costTracker';

interface PplxOptions {
  model: string;
  messages: any[];
  response_format?: {
    type: 'json_schema';
    json_schema: { schema: any };
  };
  max_tokens?: number;
  temperature?: number;
  reasoning_effort?: string;
  web_search_options?: any;
  search_recency_filter?: string;
  search_domain_filter?: string[];
  search_queries_per_search?: number;
  search_mode?: string;
  search_context_size?: string;
  top_p?: number;
  top_k?: number;
  repetition_penalty?: number;
}

// Enhanced configuration with cost optimization
const PHARMA_OPTIMIZED_CONFIG = {
  'sonar-pro': {
    max_tokens: 4000,
    temperature: 0.1,
    reasoning_effort: 'medium',
    top_p: 0.9,
    top_k: 50,
    repetition_penalty: 1.1,
    web_search_options: {
      search_context_size: 'medium',
      search_depth: 'standard'
    },
    search_recency_filter: 'month',
    search_queries_per_search: 5,
    search_mode: 'web'
  },
  'sonar-deep-research': {
    max_tokens: 8000,
    temperature: 0.05,
    reasoning_effort: 'high',
    top_p: 0.85,
    top_k: 40,
    repetition_penalty: 1.15,
    web_search_options: {
      search_context_size: 'high',
      search_depth: 'deep'
    },
    search_recency_filter: 'month',
    search_queries_per_search: 10,
    search_mode: 'web'
  }
};

// Comprehensive pharma domain sources
const PHARMA_DOMAIN_SOURCES = {
  // Regulatory & Clinical
  regulatory: [
    'fda.gov', 'ema.europa.eu', 'clinicaltrials.gov', 'eudract.ema.europa.eu',
    'who.int', 'ich.org', 'fda.gov/drugs', 'accessdata.fda.gov'
  ],
  
  // Market Intelligence
  market: [
    'evaluate.com', 'iqvia.com', 'globaldata.com', 'citeline.com',
    'cortellis.com', 'biorender.com', 'pharmaprojects.com', 'trialtrove.com'
  ],
  
  // Financial & Deals
  financial: [
    'sec.gov', 'investor.sec.gov', 'edgar.sec.gov', 'pitchbook.com',
    'crunchbase.com', 'bloomberg.com', 'reuters.com', 'ft.com'
  ],
  
  // Academic & Research
  academic: [
    'pubmed.ncbi.nlm.nih.gov', 'scholar.google.com', 'nature.com',
    'science.org', 'cell.com', 'thelancet.com', 'nejm.org', 'jamanetwork.com'
  ],
  
  // Patent & IP
  patent: [
    'uspto.gov', 'epo.org', 'wipo.int', 'google.com/patents',
    'patents.google.com', 'espacenet.com', 'patentscope.wipo.int'
  ],
  
  // Deal Activity & M&A
  deals: [
    'pitchbook.com', 'crunchbase.com', 'businesswire.com', 'prnewswire.com',
    'sec.gov', 'investor.sec.gov', 'edgar.sec.gov', 'nasdaq.com'
  ],
  
  // Industry News & Analysis
  news: [
    'biospace.com', 'fiercebiotech.com', 'biopharmadive.com', 'pharmatimes.com',
    'pharmaceutical-journal.com', 'genengnews.com', 'bioworld.com',
    'endpts.com', 'statnews.com', 'medcitynews.com'
  ],
  
  // Company & Pipeline Data
  pipeline: [
    'citeline.com', 'cortellis.com', 'biorender.com', 'drugbank.ca',
    'chembl.org', 'uniprot.org', 'ensembl.org', 'kegg.jp'
  ]
};

// Exponential backoff for rate limiting
async function exponentialBackoff(attempt: number, baseDelay: number = 1000): Promise<void> {
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
  console.log(`⏳ Rate limit backoff: waiting ${delay}ms (attempt ${attempt})`);
  await new Promise(resolve => setTimeout(resolve, delay));
}

// Estimate tokens for cost tracking
function estimateTokens(text: string): number {
  // More accurate token estimation for cost tracking
  const words = text.split(/\s+/).length;
  const punctuation = (text.match(/[.,!?;:]/g) || []).length;
  const specialChars = (text.match(/[{}[\]"':]/g) || []).length;
  
  return Math.ceil(words * 1.3 + punctuation * 0.5 + specialChars * 0.3);
}

export async function fetchPplx(options: PplxOptions, maxRetries: number = 3) {
  const modelConfig = PHARMA_OPTIMIZED_CONFIG[options.model as keyof typeof PHARMA_OPTIMIZED_CONFIG] || PHARMA_OPTIMIZED_CONFIG['sonar-pro'];
  
  // Merge all pharma domain sources for comprehensive coverage (limit to 10)
  const allPharmaSources = Object.values(PHARMA_DOMAIN_SOURCES).flat().slice(0, 10);
  
  // Select optimal domain sources (max 10)
  const selectedSources = options.search_domain_filter || 
    ['fda.gov', 'evaluate.com', 'iqvia.com', 'pubmed.ncbi.nlm.nih.gov', 'sec.gov', 
     'clinicaltrials.gov', 'nature.com', 'biospace.com', 'pitchbook.com', 'citeline.com'];

  const payload = {
    model: options.model,
    messages: options.messages,
    max_tokens: options.max_tokens || modelConfig.max_tokens,
    temperature: options.temperature || modelConfig.temperature,
    reasoning_effort: options.reasoning_effort || modelConfig.reasoning_effort,
    top_p: options.top_p || modelConfig.top_p,
    top_k: options.top_k || modelConfig.top_k,
    repetition_penalty: options.repetition_penalty || modelConfig.repetition_penalty,
    web_search_options: options.web_search_options || modelConfig.web_search_options,
    search_recency_filter: options.search_recency_filter || modelConfig.search_recency_filter,
    search_domain_filter: selectedSources,
    search_queries_per_search: options.search_queries_per_search || modelConfig.search_queries_per_search,
    search_mode: options.search_mode || modelConfig.search_mode || 'web',
    search_context_size: options.search_context_size || modelConfig.web_search_options.search_context_size,
    response_format: options.response_format || {
      type: 'json_schema',
      json_schema: { schema: commercialSchema }
    }
  };

  // Estimate cost before making the call
  const inputText = JSON.stringify(payload);
  const estimatedInputTokens = estimateTokens(inputText);
  const estimatedOutputTokens = payload.max_tokens || 4000;
  
      // Check if we can afford this call
    if (!globalCostTracker.canAffordCall(options.model, estimatedInputTokens, estimatedOutputTokens)) {
      const cheaperModel = globalCostTracker.getCheaperModel(options.model);
      if (cheaperModel !== options.model) {
        console.log(`💰 Cost limit reached, switching from ${options.model} to ${cheaperModel}`);
        return fetchPplx({ ...options, model: cheaperModel }, maxRetries);
      } else {
        // Return a cost limit response instead of throwing an error
        return {
          choices: [{
            message: {
              content: JSON.stringify({
                costLimitReached: true,
                currentCost: globalCostTracker.getCurrentMetrics().totalCost,
                remainingBudget: globalCostTracker.getRemainingBudget(),
                message: 'Cost limit reached, returning partial results'
              })
            }
          }],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0
          }
        };
      }
    }

  const controller = new AbortController();
  const timeoutMs = options.model === 'sonar-deep-research' ? 
    parseInt(process.env.DEEP_RESEARCH_TIMEOUT || '300000') : 
    parseInt(process.env.ACADEMIC_MODE_TIMEOUT || '420000');
  
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        if (attempt < maxRetries) {
          await exponentialBackoff(attempt);
          continue;
        } else {
          throw new Error(`Rate limit exceeded after ${maxRetries} attempts`);
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PPLX API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      // Record the actual cost
      const actualInputTokens = result.usage?.prompt_tokens || estimatedInputTokens;
      const actualOutputTokens = result.usage?.completion_tokens || estimatedOutputTokens;
      globalCostTracker.recordApiCall(options.model, actualInputTokens, actualOutputTokens);
      
      return result;
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`PPLX API request timed out after ${timeoutMs}ms`);
      }
      
      if (error.message.includes('429') && attempt < maxRetries) {
        await exponentialBackoff(attempt);
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts`);
}

// Helper function to get sources for specific research phases
export function getSourcesForPhase(phase: 'regulatory' | 'market' | 'patent' | 'academic' | 'deals' | 'news' | 'pipeline'): string[] {
  return PHARMA_DOMAIN_SOURCES[phase] || [];
}

// Helper function to get all sources for comprehensive research
export function getAllPharmaSources(): string[] {
  return Object.values(PHARMA_DOMAIN_SOURCES).flat();
}

// Helper function to validate API key
export function validateApiKey(): boolean {
  return !!process.env.PERPLEXITY_API_KEY;
} 