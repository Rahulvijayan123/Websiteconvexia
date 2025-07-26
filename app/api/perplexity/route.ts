import { NextRequest, NextResponse } from 'next/server';
import commercialSchema from '@/schemas/commercialOutputSchema.json';

function estimateTokens(str: string): number {
  // More accurate token estimation: ~4 characters per token for English text
  // This is a reasonable approximation for most text content
  return Math.ceil(str.length / 4);
}

console.log('ENV KEYS:', Object.keys(process.env));

export async function POST(req: NextRequest) {
  const logs: any[] = [];
  const apiKey = process.env.PPLX_API_KEY;
  logs.push({ step: 'Read API key', apiKeyPresent: !!apiKey });
  if (!apiKey) {
    logs.push({ error: 'API key not configured.' });
    return NextResponse.json({ error: 'API key not configured.', logs }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
    logs.push({ step: 'Parsed request body', body });
  } catch (e) {
    logs.push({ error: 'Invalid JSON', details: String(e) });
    return NextResponse.json({ error: 'Invalid JSON', logs }, { status: 400 });
  }

  // Determine model
  const inputText = JSON.stringify(body);
  const inputTokens = estimateTokens(inputText);
  const userRequestedFullResearch = body?.fullResearch === true;

  let model = 'sonar-pro';
  if (inputTokens > 350 || userRequestedFullResearch) {
    model = 'sonar-deep-research';
  }
  logs.push({ 
    step: 'Using Perplexity model', 
    model, 
    inputTokens, 
    userRequestedFullResearch,
    modelSelectionReason: inputTokens > 350 ? 'high_token_count' : userRequestedFullResearch ? 'explicit_request' : 'default'
  });

  const isDeep = model === 'sonar-deep-research';

  // Comprehensive source categories organized by type
  const sourceCategories = {
    // Deal Activity & M&A Sources
    dealSources: [
      "evaluatepharma.com",
      "pitchbook.com",
      "clarivate.com",
      "biocentury.com",
      "citeline.com",
      "spglobal.com",
      "seekingalpha.com",
      "morningstar.com",
      "reuters.com",
      "bloomberg.com"
    ],
    
    // Pipeline & Clinical Sources
    clinicalSources: [
      "clinicaltrials.gov",
      "pubmed.ncbi.nlm.nih.gov",
      "citeline.com",
      "who.int",
      "biorender.com",
      "litcovid.org",
      "pmc.ncbi.nlm.nih.gov",
      "nejm.org",
      "thelancet.com",
      "jamanetwork.com"
    ],
    
    // Regulatory & Patent Sources
    regulatorySources: [
      "fda.gov",
      "ema.europa.eu",
      "uspto.gov",
      "wipo.int",
      "orpha.net",
      "cdc.gov",
      "pmda.go.jp",
      "espacenet.com",
      "jpo.go.jp",
      "inpadoc.epo.org"
    ],
    
    // Market & Financial Sources
    marketSources: [
      "evaluatepharma.com",
      "iqvia.com",
      "globaldata.com",
      "statista.com",
      "frost.com",
      "wsj.com",
      "ft.com",
      "biopharminsight.com",
      "firstwordpharma.com",
      "roche.com"
    ],
    
    // Academic & Research Sources
    academicSources: [
      "nature.com",
      "science.org",
      "pubmed.ncbi.nlm.nih.gov",
      "scholar.google.com",
      "ieee.org",
      "acm.org",
      "arxiv.org",
      "biorxiv.org",
      "medrxiv.org",
      "bmj.com"
    ],
    
    // News & Industry Sources
    newsSources: [
      "biospace.com",
      "fiercebiotech.com",
      "biopharmadive.com",
      "pharmatimes.com",
      "pharmaceutical-journal.com",
      "reuters.com",
      "bloomberg.com",
      "wsj.com",
      "ft.com",
      "crunchbase.com"
    ],
    
    // IP & Patent Sources
    patentSources: [
      "uspto.gov",
      "wipo.int",
      "espacenet.com",
      "jpo.go.jp",
      "patents.google.com",
      "lens.org",
      "patsnap.com",
      "drugbank.ca",
      "chembl.org",
      "reaxys.com"
    ]
  };

  // Function to get sources for a specific pass
  const getSourcesForPass = (passNumber: number) => {
    switch (passNumber) {
      case 1: return sourceCategories.dealSources; // Start with deal activity
      case 2: return sourceCategories.clinicalSources; // Then clinical data
      case 3: return sourceCategories.regulatorySources; // Then regulatory
      case 4: return sourceCategories.marketSources; // Then market data
      case 5: return sourceCategories.academicSources; // Then academic
      case 6: return sourceCategories.newsSources; // Then news
      case 7: return sourceCategories.patentSources; // Finally patents
      default: return sourceCategories.dealSources;
    }
  };

  // Use deal sources for initial search
  const domainAllowlist = getSourcesForPass(1);

  // Extract target and indication from the request body
  const target = body.target || '';
  const indication = body.indication || '';

  // Compose a highly detailed prompt for Perplexity to output ONLY the required JSON fields
  const prompt = `You are a biotech commercial intelligence assistant.

You will be provided with the following user input:
Target: ${target}
Indication: ${indication}

A target is a specific biological molecule or gene (e.g., HER2, SOD1, PD-L1, EGFR, BRAF, ALK, VEGF, KRAS, CD19, PCSK9, etc.).
An indication is a specific disease or condition (e.g., Triple-Negative Breast Cancer, ALS, Non-Small Cell Lung Cancer, Type 2 Diabetes, Crohn's Disease, etc.).

If either the target or indication is missing or unclear, explain what is missing and request clarification, but still attempt to provide the most relevant information possible based on the available input.

You must conduct a deep, thorough web and literature review using high-quality, up-to-date, and diverse sources. You are required to use live web search and cite URLs, not just static knowledge. Your research must include industry reports, regulatory databases, analyst forecasts, recent news, and primary sources. Do not fabricate information—always use real, verifiable data from the web and literature. Prioritize primary sources, recent publications, and authoritative industry data. Your websearches should be exhaustive and creative to find all relevant public information.

CRITICAL SEARCH LOGIC: You must search extensively using ALL the provided input fields (therapeutic area, indication, target, geography, development phase). Use creative search combinations and variations. Only after conducting exhaustive web searches and finding NO relevant data should you return "N/A" or "Unknown" for any field. If you find ANY relevant information, even if partial, you must use it and provide estimates based on similar assets or industry benchmarks.

DATA SOURCES TO QUERY, IN THIS ORDER:
1. Direct competitors and deal activity: EvaluatePharma asset search, Clarivate Cortellis Deals, Citeline TrialTrove, company 8-K filings, PitchBook, S&P Capital IQ
2. Pipeline density and threats: Citeline PharmaProjects, Cortellis Clinical Trials Intelligence, ClinicalTrials.gov, EU‑CTR, WHO ICTRP
3. Market size and growth: EvaluatePharma forecasts, IQVIA MIDAS current sales, GlobalData EpiCast prevalence, Datamonitor Healthcare
4. Regulatory incentives: FDA Orphan Drug DB, FDA Tropical Disease PRV list, EMA PRIME list, US National Priority guidance, FDA approval stats by program type
5. Patent and exclusivity: FDA Orange Book, USPTO PAIR latest grants, WIPO PatentScope, INPADOC
6. Financial forecasting: EvaluatePharma forecast table, company investor decks, equity research models

CROSS‑FIELD LOGIC:
- Peak Sales Estimate must equal Peak Revenue in Financial Forecasting. If one source missing, compute from the other.
- CAGR = (Peak Sales Estimate ÷ Current Market Size)^(1 ÷ years_to_peak) − 1, years_to_peak ends at 2030.
- Peak Patients = (Peak Revenue ÷ Avg Selling Price) × Persistence Rate.
- Pipeline Density = number of same‑target assets ÷ total assets in indication, show as percent.
- Strategic Fit Rank = cosine similarity between asset features and buyer portfolio features, express 0‑100.

For each field below, you must:
- Use the best available data from your research.
- If no exact value is available, provide your best estimate based on similar assets, industry averages, or logical inference.
- Never return 'Unknown' or leave a field blank—always provide a value, even if it is an estimate or a range.
- For marketSize (peak sales estimate), return only the number or range in billions, e.g., "1.2B" or "1.2-1.5B". This must equal peakRevenue2030. If one is missing, calculate from the other using the cross-field logic. Do not include any text or explanation.
- For cagr, calculate using the formula: (Peak Sales Estimate ÷ Current Market Size)^(1 ÷ years_to_peak) − 1, where years_to_peak ends at 2030. Return only the percentage or range, e.g., "12.3%" or "12.3-13.6%". Do not include any text or explanation.
- For peakRevenue2030, return only the number or range in billions, e.g., "1.2B" or "1.2-1.5B". This must equal marketSize. If one is missing, calculate from the other. Do not include any text or explanation.
- For total10YearRevenue:
  - You must calculate a realistic estimate for total revenue over 10 years, based on the provided or estimated peak revenue. Use a plausible industry revenue curve (e.g., total 10 year revenue should typically be 5-8x the peak year, or the sum of a realistic 10-year ramp-up, plateau, and decline). Do NOT return a value that is less than or only slightly more than peak revenue. If you cannot calculate a logical value, explain step-by-step in the research log how you arrived at your number, and why it is consistent with the peak revenue. This explanation is required in the research log.

- For peakMarketShare2030, return only the percentage or range, e.g., "12.3%" or "12.3-13.6%". Do not include any text or explanation.
- For peakPatients2030, calculate using the formula: (Peak Revenue ÷ Avg Selling Price) × Persistence Rate. Return only the number or range, e.g., "500K", "1.2M", or "1.2M-1.5M". Do not include any text or explanation.

- For avgSellingPrice:
  - Research and provide the average selling price per patient in dollars. This should be based on similar drugs in the same therapeutic area, pricing analysis, and regional variations.
  - Return only the value, e.g., "$15,000", "$25K", or "$50,000-75,000". Do not include any text or explanation.
  - Use pricing data from similar approved drugs, payer negotiations, and regional pricing analysis.

- For persistenceRate:
  - Research and provide the 12-month treatment persistence rate as a percentage. This should be based on clinical trial data, real-world evidence, and similar drug performance.
  - Return only the percentage, e.g., "75%", "85%", or "70-80%". Do not include any text or explanation.
  - Use clinical trial data, real-world evidence studies, and similar drug persistence rates.

- For treatmentDuration:
  - Research and provide the median treatment duration in months. This should be based on clinical protocols, patient outcomes, and similar drug treatment patterns.
  - Return only the duration, e.g., "12 months", "18 mo", or "6-12 months". Do not include any text or explanation.
  - Use clinical trial protocols, patient outcome studies, and similar drug treatment duration data.

- For geographicSplit:
  - Research and provide the revenue split between US and ex-US markets at peak. This should be based on market access, pricing, regulatory approval timelines, and regional market dynamics.
  - Return only the split, e.g., "60% US / 40% Ex-US", "70/30", or "55% US, 45% Ex-US". Do not include any text or explanation.
  - Use market access analysis, regulatory approval timelines, and regional pricing dynamics.

- For competitorPricing:
  - Research and provide pricing and access data for the direct competitors identified in directCompetitors. For each competitor, find: drug name, annual price, indication, access level, and rationale.
  - Return an array of objects with: drugName (string), annualPrice (string), indication (string), accessLevel (string), rationale (string).
  - Annual price should be in format like "$165K", "$150K", or "$180K".
  - Access level should be "Broad", "Moderate", or "Limited" based on payer coverage and restrictions.
  - Rationale should explain the pricing strategy and access level for each competitor.
  - Use pricing databases, payer coverage analysis, and market intelligence sources.
  - This must match the competitors listed in directCompetitors.

- For pipelineAnalysis.crowdingPercent (pipeline density), calculate as: number of same‑target assets ÷ total assets in indication, show as percent. Return only the percentage or range, e.g., "12%" or "10-15%". Do not include any text or explanation.

- For directCompetitors:
  - You must prioritize drugs or assets that match BOTH the exact same target (e.g., HER2, SOD1, PD-L1) AND the exact same indication (e.g., Triple-Negative Breast Cancer, ALS, NSCLC) as the user input.
  - Look for at least 3 direct competitors, but display up to 10 if possible. If fewer than 3 exist, explain why (e.g., novel target/indication). For each competitor, provide a short rationale for why it is a competitor, and cite your sources. Always return the closest available competitors, and explain any differences or gaps in your research log.
  - Do NOT include assets with unrelated targets or indications, but do include near-matches if no exact matches exist, and explain why.
  - Use exhaustive, up-to-date web searching to verify the target and indication for each asset. Do not rely on static knowledge. Cite URLs for each competitor.
  - List only the names of specific drugs or assets (not company names), and include their generic/brand names if available. Do not list only big pharma or company names, and do not hallucinate assets.

- For dealActivity:
  - You MUST find and list at least 3 recent deals (acquisitions, licensing, partnerships, investments) involving assets that match BOTH the exact same target and indication as the user input, or the closest available if no exact matches exist (explain the difference). Display up to 10 deals if possible. For each deal, include: asset name, buyer/acquirer, development stage at deal time, deal price (value), deal date, and a clear, concise rationale. All of this information is public and online, and you must use extensive, high-quality web searches to find it. If you cannot find a field after exhaustive searching, output 'Unknown' for that field, but still include the deal in the output. In your research log, explain what you searched and why any field could not be found.
  - Always provide a clear, concise rationale for each deal, based on your research and sources, and cite URLs for each deal.
  - Deal Activity must be a subset or add-on to Direct Competitors (i.e., only deals involving the listed direct competitors or near-matches, with explanation).
  - Always provide a clear, concise rationale for each deal, based on your research and sources.
  - Use extensive, up-to-date web searching to verify each deal and cite URLs for each.

- For pipelineAnalysis.competitiveThreats:
  - Always output multiple (at least 3 if possible) distinct competitive threats, each with a short rationale. Use your websearches to identify as many relevant threats as possible, and provide a brief explanation for each.

- For pipelineAnalysis.strategicFitRank:
  - Calculate using cosine similarity between asset features and buyer portfolio features, express as 0-100. Use the formula to determine strategic alignment with major pharma buyer portfolios.

- For all fields, cite the most relevant sources in your research log. You must use at least 25 unique, high-quality, and up-to-date sources, and you must use live web search for all research. Do not fabricate sources or data.

Return ONLY a valid JSON object with the following keys:
- cagr: string (Compound Annual Growth Rate)
- marketSize: string (current and projected market size)
- directCompetitors: array of strings (names of direct competitors)
- prvEligibility: string or number (Priority Review Voucher eligibility)
- nationalPriority: string (public health priority tier)
- reviewTimelineMonths: string or number (expected FDA review timeline)
- peakRevenue2030: string (forecasted peak revenue by 2030)
- total10YearRevenue: string (estimated total revenue over 10 years)
- peakMarketShare2030: string (projected market share by 2030)
- peakPatients2030: string (estimated treated patient population by 2030)
- avgSellingPrice: string (average selling price per patient in dollars)
- persistenceRate: string (12-month treatment persistence rate as percentage)
- treatmentDuration: string (median treatment duration in months)
- geographicSplit: string (revenue split between US and ex-US markets at peak)
- competitorPricing: array of objects (pricing and access data for direct competitors)
- dealActivity: array of objects (recent M&A/licensing deals)
- pipelineAnalysis: object (crowdingPercent, competitiveThreats)

Do not include any extra text, explanation, or markdown. Output ONLY the JSON object. In your research log, list all 25+ sources you used, including URLs where possible.

---

`;

  // Ensure the research call runs for at least 3 minutes for deeper sourcing and validation
  await new Promise(r => setTimeout(r, 180000));
  logs.push({ step: 'Composed prompt', prompt });

  // Timeout helper function
  function timeout(ms: number) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
  }

  async function fetchWithFallback(payload: any, originalModel: string, passNumber: number = 1): Promise<Response> {
    // Smart timeout based on model and pass number
    const getTimeout = () => {
      if (originalModel === 'sonar-deep-research') {
        switch (passNumber) {
          case 1: return 180_000; // 3 minutes for initial deep research
          case 2: return 240_000; // 4 minutes for expanded search
          case 3: return 300_000; // 5 minutes for academic mode
          default: return 180_000;
        }
      }
      return 60_000; // 1 minute for sonar-pro
    };

    const timeoutMs = getTimeout();
    
    try {
      logs.push({ 
        step: 'Starting API call', 
        model: payload.model, 
        passNumber, 
        timeoutMs,
        searchMode: payload.search_mode || 'standard'
      });
      
      return await Promise.race([
        fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PPLX_API_KEY}`,
          },
          body: JSON.stringify(payload),
        }),
        timeout(timeoutMs),
      ]) as Response;
    } catch (error) {
      if (originalModel === 'sonar-deep-research' && passNumber < 3) {
        // Only fallback to sonar-pro if we're not in the final pass
        const fallbackPayload = {
          ...payload,
          model: 'sonar-pro',
          reasoning_effort: undefined,
          web_search_options: { search_context_size: "medium" },
          max_tokens: 4000,
          search_queries_per_search: 5
        };
        logs.push({ 
          step: 'Fallback to sonar-pro due to timeout', 
          originalModel, 
          passNumber, 
          timeoutMs 
        });
        return fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PPLX_API_KEY}`,
          },
          body: JSON.stringify(fallbackPayload),
        });
      }
      throw error;
    }
  }

  // Call Perplexity API
  try {
    const webSearchOptions = {
      search_context_size: isDeep ? "high" : "medium",
      search_depth: isDeep ? "deep" : "standard"
    };

    const payload = {
      model,
      messages: [
        { role: 'system', content: 'You are a biotech commercial intelligence assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: isDeep ? 8000 : 4000,
      temperature: 0.1,
      reasoning_effort: isDeep ? "high" : "medium",
      web_search_options: webSearchOptions,
      search_recency_filter: "year",
      search_domain_filter: domainAllowlist,
      search_queries_per_search: isDeep ? 10 : 5,
      response_format: {
        type: 'json_schema',
        json_schema: { schema: commercialSchema }
      },
      ...(body?.academic === true && { search_mode: "academic" })
    };

    let perplexityRes = await fetchWithFallback(payload, model, 1);
    
        // Multi-pass instrumentation-based retry with comprehensive source coverage
    const MIN_QUERIES_PER_PASS = 20;
    let perplexityText = await perplexityRes.text();
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(perplexityText);
    } catch (e) {
      parsedResponse = null;
    }
    
    logs.push({ 
      step: 'Perplexity API response status', 
      status: perplexityRes.status,
      numSearchQueries: parsedResponse?.usage?.num_search_queries,
      searchContextSize: payload.web_search_options?.search_context_size,
      reasoningEffort: payload.reasoning_effort,
      pass: 1,
      sourcesUsed: domainAllowlist
    });
    
    // Multi-pass strategy to cover all source categories
    let currentPass = 1;
    const maxPasses = 7; // Cover all 7 source categories
    
    while (parsedResponse?.usage?.num_search_queries < MIN_QUERIES_PER_PASS && 
           currentPass < maxPasses && 
           isDeep) {
      
      currentPass++;
      const nextSources = getSourcesForPass(currentPass);
      
      logs.push({ 
        step: `Pass ${currentPass}: Retrying with ${nextSources.length} sources`, 
        numSearchQueries: parsedResponse?.usage?.num_search_queries,
        minQueries: MIN_QUERIES_PER_PASS,
        sources: nextSources,
        sourceCategory: Object.keys(sourceCategories)[currentPass - 1]
      });
      
      const retryPayload = {
        ...payload,
        web_search_options: { 
          search_context_size: "high",
          search_depth: "deep"
        },
        reasoning_effort: "high",
        max_tokens: 8000,
        search_queries_per_search: 15,
        search_domain_filter: nextSources,
        response_format: {
          type: 'json_schema',
          json_schema: { schema: commercialSchema }
        }
      };
      
      perplexityRes = await fetchWithFallback(retryPayload, model, currentPass);
      perplexityText = await perplexityRes.text();
      
      try {
        parsedResponse = JSON.parse(perplexityText);
      } catch (e) {
        parsedResponse = null;
      }
      
      logs.push({ 
        step: `Pass ${currentPass} response status`, 
        status: perplexityRes.status,
        numSearchQueries: parsedResponse?.usage?.num_search_queries,
        pass: currentPass,
        sourcesUsed: nextSources
      });
      
      if (!perplexityRes.ok) {
        logs.push({ error: `Perplexity API pass ${currentPass} error`, details: perplexityText });
        return NextResponse.json({ error: `Perplexity API pass ${currentPass} error: ${perplexityText}`, status: perplexityRes.status, logs }, { status: 500 });
      }
    }
    
    // Final pass: Academic mode with web search for comprehensive coverage
    if (parsedResponse?.usage?.num_search_queries < MIN_QUERIES_PER_PASS && isDeep) {
      logs.push({ 
        step: 'Final pass: Academic mode with web search', 
        numSearchQueries: parsedResponse?.usage?.num_search_queries,
        minQueries: MIN_QUERIES_PER_PASS
      });
      
      const finalPayload = {
        ...payload,
        search_mode: "academic",
        web_search_options: { 
          search_context_size: "high",
          search_depth: "deep"
        },
        reasoning_effort: "high",
        max_tokens: 10000,
        search_queries_per_search: 25,
        response_format: {
          type: 'json_schema',
          json_schema: { schema: commercialSchema }
        }
      };
      // Remove domain filter for comprehensive web search
      const { search_domain_filter, ...finalPayloadWithoutDomain } = finalPayload;
      
      perplexityRes = await fetchWithFallback(finalPayloadWithoutDomain, model, 8);
      perplexityText = await perplexityRes.text();
      
      try {
        parsedResponse = JSON.parse(perplexityText);
      } catch (e) {
        parsedResponse = null;
      }
      
      logs.push({ 
        step: 'Final pass response status', 
        status: perplexityRes.status,
        numSearchQueries: parsedResponse?.usage?.num_search_queries,
        pass: 8,
        mode: 'academic_web_search'
      });
      
      if (!perplexityRes.ok) {
        logs.push({ error: 'Perplexity API final pass error', details: perplexityText });
        return NextResponse.json({ error: `Perplexity API final pass error: ${perplexityText}`, status: perplexityRes.status, logs }, { status: 500 });
      }
    }
    logs.push({ step: 'Perplexity API raw response', perplexityText });
    if (!perplexityRes.ok) {
      logs.push({ error: 'Perplexity API error', details: perplexityText });
      return NextResponse.json({ error: `Perplexity API error: ${perplexityText}`, status: perplexityRes.status, logs }, { status: 500 });
    }
    // Log the raw Perplexity response
    logs.push({ step: 'Raw Perplexity response', raw: perplexityText });

    let parsed;
    let parseError = null;
    try {
      // Try to extract JSON from the LLM output
      parsed = JSON.parse(perplexityText);
      logs.push({ step: 'Parsed Perplexity JSON', parsed });
    } catch (err) {
      parseError = err instanceof Error ? err.message : String(err);
      logs.push({ step: 'Parse error', error: parseError });
    }

    if (!parsed) {
      // If parsing failed, return the raw output for debugging
      return NextResponse.json({
        error: 'Failed to parse Perplexity response as JSON',
        raw: perplexityText,
        logs,
      }, { status: 200 });
    }

    // Try to extract JSON from the response
    let output;
    try {
      output = JSON.parse(parsed.choices[0].message.content);
      logs.push({ step: 'Parsed Perplexity content JSON', output });
    } catch (e) {
      // Fallback: try to extract JSON from code block
      let content = parsed.choices[0].message.content.trim();
      const codeBlockMatch = content.match(/^```(?:json)?\n([\s\S]*?)\n```$/);
      if (codeBlockMatch) {
        try {
          output = JSON.parse(codeBlockMatch[1]);
          logs.push({ step: 'Extracted and parsed JSON from code block', output });
        } catch (err2) {
          output = { raw: content };
          logs.push({ error: 'Failed to parse JSON inside code block', details: String(err2), content });
        }
      } else {
        output = { raw: content };
        logs.push({ error: 'Failed to parse Perplexity content JSON', details: String(e), content });
      }
    }

    // --- Normalization Layer: Ensure all required fields are present ---
    const requiredFields = {
      cagr: 'Unknown',
      marketSize: 'Unknown',
      directCompetitors: [],
      prvEligibility: 'Unknown',
      nationalPriority: 'Unknown',
      reviewTimelineMonths: 'Unknown',
      peakRevenue2030: 'Unknown',
      peakMarketShare2030: 'Unknown',
      peakPatients2030: 'Unknown',
      dealActivity: [],
      pipelineAnalysis: {},
      dealCommentary: 'Unknown',
    } as const;
    type FieldKey = keyof typeof requiredFields;
    for (const key of Object.keys(requiredFields) as FieldKey[]) {
      if (output[key] === undefined) {
        output[key] = requiredFields[key];
      }
    }
    logs.push({ step: 'Normalized output', output });
    // --- End Normalization ---

    return NextResponse.json({ ...output, logs });
  } catch (err) {
    logs.push({ error: 'Failed to call Perplexity API', details: String(err) });
    return NextResponse.json({ error: 'Failed to call Perplexity API', logs }, { status: 500 });
  }
} 