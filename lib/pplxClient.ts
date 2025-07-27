import commercialSchema from '@/schemas/commercialOutputSchema.json';

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

// Enhanced configuration for senior pharma domain expertise
const PHARMA_OPTIMIZED_CONFIG = {
  // Model-specific configurations
  'sonar-deep-research': {
    max_tokens: 12000,
    temperature: 0.05, // Very low temperature for factual accuracy
    reasoning_effort: 'high',
    top_p: 0.9,
    top_k: 50,
    repetition_penalty: 1.1,
    web_search_options: {
      search_context_size: 'high',
      search_depth: 'deep',
      search_scope: 'comprehensive'
    },
    search_queries_per_search: 15,
    search_recency_filter: 'month', // More recent for pharma
    search_mode: 'academic'
  },
  'sonar-pro': {
    max_tokens: 8000,
    temperature: 0.1,
    reasoning_effort: 'medium',
    top_p: 0.95,
    top_k: 40,
    repetition_penalty: 1.05,
    web_search_options: {
      search_context_size: 'medium',
      search_depth: 'standard'
    },
    search_queries_per_search: 8,
    search_recency_filter: 'year',
    search_mode: 'standard'
  }
};

// Comprehensive pharma-specific domain sources
const PHARMA_DOMAIN_SOURCES = {
  // Regulatory & Clinical Sources
  regulatory: [
    'fda.gov', 'ema.europa.eu', 'pmda.go.jp', 'hc-sc.gc.ca',
    'clinicaltrials.gov', 'eudract.ema.europa.eu', 'who.int',
    'orangebook.fda.gov', 'drugs@fda.fda.gov', 'accessdata.fda.gov'
  ],
  
  // Market Intelligence & Financial
  market: [
    'evaluatepharma.com', 'iqvia.com', 'globaldata.com', 'citeline.com',
    'biocentury.com', 'spglobal.com', 'bloomberg.com', 'reuters.com',
    'wsj.com', 'ft.com', 'seekingalpha.com', 'morningstar.com'
  ],
  
  // Patent & IP Sources
  patent: [
    'uspto.gov', 'wipo.int', 'espacenet.com', 'patents.google.com',
    'lens.org', 'patsnap.com', 'patentlens.net', 'inpadoc.epo.org'
  ],
  
  // Academic & Research
  academic: [
    'pubmed.ncbi.nlm.nih.gov', 'nature.com', 'science.org', 'nejm.org',
    'thelancet.com', 'jamanetwork.com', 'bmj.com', 'biorxiv.org',
    'medrxiv.org', 'scholar.google.com', 'ieee.org', 'acm.org'
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

export async function fetchPplx(options: PplxOptions) {
  const modelConfig = PHARMA_OPTIMIZED_CONFIG[options.model as keyof typeof PHARMA_OPTIMIZED_CONFIG] || PHARMA_OPTIMIZED_CONFIG['sonar-pro'];
  
  // Merge all pharma domain sources for comprehensive coverage
  const allPharmaSources = Object.values(PHARMA_DOMAIN_SOURCES).flat();
  
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
    search_domain_filter: options.search_domain_filter || allPharmaSources,
    search_queries_per_search: options.search_queries_per_search || modelConfig.search_queries_per_search,
    search_mode: options.search_mode || modelConfig.search_mode,
    search_context_size: options.search_context_size || modelConfig.web_search_options.search_context_size,
    response_format: options.response_format || {
      type: 'json_schema',
      json_schema: { schema: commercialSchema }
    }
  };

  const controller = new AbortController();
  const timeoutMs = options.model === 'sonar-deep-research' ? 
    parseInt(process.env.DEEP_RESEARCH_TIMEOUT || '300000') : 
    parseInt(process.env.ACADEMIC_MODE_TIMEOUT || '420000');
  
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PPLX API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`PPLX API request timed out after ${timeoutMs}ms`);
    }
    
    throw error;
  }
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