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
}

export async function fetchPplx(options: PplxOptions) {
  const payload = {
    model: options.model,
    messages: options.messages,
    max_tokens: options.max_tokens || 4000,
    temperature: options.temperature || 0.1,
    reasoning_effort: options.reasoning_effort || "medium",
    web_search_options: options.web_search_options || { search_context_size: "medium" },
    search_recency_filter: options.search_recency_filter || "year",
    search_domain_filter: options.search_domain_filter,
    search_queries_per_search: options.search_queries_per_search || 5,
    search_mode: options.search_mode,
    search_context_size: options.search_context_size,
    response_format: options.response_format || {
      type: 'json_schema',
      json_schema: { schema: commercialSchema }
    }
  };

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PPLX_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`PPLX API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
} 