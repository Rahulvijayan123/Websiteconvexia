import { NextRequest, NextResponse } from 'next/server';

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

  // Use the 'sonar-pro' model as per Perplexity's latest documentation (June 2024)
  const model = 'sonar-pro';
  logs.push({ step: 'Using Perplexity model', model });

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

You must conduct a deep, thorough web and literature review using at least 100 unique, high-quality, up-to-date, and diverse sources. You are required to use live web search and cite URLs, not just static knowledge. Your research must include industry reports, regulatory databases, analyst forecasts, recent news, and primary sources. Do not fabricate information—always use real, verifiable data from the web and literature. Prioritize primary sources, recent publications, and authoritative industry data. You must use at least 100 unique, high-quality web searches for every request, and your websearches should be as exhaustive and creative as possible to find all relevant public information.

CRITICAL SEARCH LOGIC: You must search extensively using ALL the provided input fields (therapeutic area, indication, target, geography, development phase). Use creative search combinations and variations. Only after conducting at least 100 web searches and finding NO relevant data should you return "N/A" or "Unknown" for any field. If you find ANY relevant information, even if partial, you must use it and provide estimates based on similar assets or industry benchmarks.

For each field below, you must:
- Use the best available data from your research.
- If no exact value is available, provide your best estimate based on similar assets, industry averages, or logical inference.
- Never return 'Unknown' or leave a field blank—always provide a value, even if it is an estimate or a range.
- For marketSize (peak sales estimate), return only the number or range in billions, e.g., "1.2B" or "1.2-1.5B". Do not include any text or explanation.
- For cagr, return only the percentage or range, e.g., "12.3%" or "12.3-13.6%". Do not include any text or explanation.
- For peakRevenue2030, return only the number or range in billions, e.g., "1.2B" or "1.2-1.5B". Do not include any text or explanation.
- For total10YearRevenue:
  - You must calculate a realistic estimate for total revenue over 10 years, based on the provided or estimated peak revenue. Use a plausible industry revenue curve (e.g., total 10 year revenue should typically be 5-8x the peak year, or the sum of a realistic 10-year ramp-up, plateau, and decline). Do NOT return a value that is less than or only slightly more than peak revenue. If you cannot calculate a logical value, explain step-by-step in the research log how you arrived at your number, and why it is consistent with the peak revenue. This explanation is required in the research log.

- For peakMarketShare2030, return only the percentage or range, e.g., "12.3%" or "12.3-13.6%". Do not include any text or explanation.
- For peakPatients2030, return only the number or range, e.g., "500K", "1.2M", or "1.2M-1.5M". Do not include any text or explanation.
- For pipelineAnalysis.crowdingPercent (pipeline density), return only the percentage or range, e.g., "12%" or "10-15%". Do not include any text or explanation.

- For directCompetitors:
  - You must prioritize drugs or assets that match BOTH the exact same target (e.g., HER2, SOD1, PD-L1) AND the exact same indication (e.g., Triple-Negative Breast Cancer, ALS, NSCLC) as the user input.
  - Look for at least 3 direct competitors, but display up to 10 if possible. If fewer than 3 exist, explain why (e.g., novel target/indication). For each competitor, provide a short rationale for why it is a competitor, and cite your sources. Always return the closest available competitors, and explain any differences or gaps in your research log.
  - Do NOT include assets with unrelated targets or indications, but do include near-matches if no exact matches exist, and explain why.
  - Use exhaustive, up-to-date web searching to verify the target and indication for each asset. Do not rely on static knowledge. Cite URLs for each competitor.
  - List only the names of specific drugs or assets (not company names), and include their generic/brand names if available. Do not list only big pharma or company names, and do not hallucinate assets.

- For dealActivity:
  - You MUST find and list at least 3 recent deals (acquisitions, licensing, partnerships, investments) involving assets that match BOTH the exact same target and indication as the user input, or the closest available if no exact matches exist (explain the difference). Display up to 10 deals if possible. For each deal, include: asset name, buyer/acquirer, development stage at deal time, deal price (value), deal date, and a clear, concise rationale. All of this information is public and online, and you must use at least 100 unique, high-quality web searches to find it. If you cannot find a field after exhaustive searching, output 'Unknown' for that field, but still include the deal in the output. In your research log, explain what you searched and why any field could not be found.
  - Always provide a clear, concise rationale for each deal, based on your research and sources, and cite URLs for each deal.
  - Deal Activity must be a subset or add-on to Direct Competitors (i.e., only deals involving the listed direct competitors or near-matches, with explanation).
  - Always provide a clear, concise rationale for each deal, based on your research and sources.
  - Use extensive, up-to-date web searching to verify each deal and cite URLs for each.

- For pipelineAnalysis.competitiveThreats:
  - Always output multiple (at least 3 if possible) distinct competitive threats, each with a short rationale. Use your websearches to identify as many relevant threats as possible, and provide a brief explanation for each.

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
- dealActivity: array of objects (recent M&A/licensing deals)
- pipelineAnalysis: object (crowdingPercent, competitiveThreats)

Do not include any extra text, explanation, or markdown. Output ONLY the JSON object. In your research log, list all 25+ sources you used, including URLs where possible.

---

`;

  // Ensure the research call runs for at least 3 minutes for deeper sourcing and validation
  await new Promise(r => setTimeout(r, 180000));
  logs.push({ step: 'Composed prompt', prompt });

  // Call Perplexity API
  try {
    const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a biotech commercial intelligence assistant.' },
          { role: 'user', content: prompt },
        ],
        stream: false,
      }),
    });
    logs.push({ step: 'Perplexity API response status', status: perplexityRes.status });
    const perplexityText = await perplexityRes.text();
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