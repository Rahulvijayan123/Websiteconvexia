import { NextResponse } from 'next/server';
import { RawFactsSchema, DerivedFactsSchema } from '@/schemas/commercialSchemas';
import { fetchPplx } from '@/lib/pplxClient';
import * as calc from '@/lib/crossFieldCalculator';
import { UserInputSchema } from '@/schemas/userInputs';
import { sanityCheck } from '@/lib/numericSanity';
import { redis } from '@/lib/redisClient';
import { sb } from '@/lib/supabaseClient';
import { createHash, randomUUID } from "crypto";
import stableStringify from 'fast-json-stable-stringify';
import { pack } from 'msgpackr';

// Configuration constants
const TTL_SECONDS = 60 * 60 * 24; // 24 hours
const MAX_BODY_SIZE = 1024 * 1024; // 1MB
const MAX_CACHE_SIZE = 8_000_000; // 8MB (Upstash limit is 10MB)
const REVENUE_DIFF_TOLERANCE = parseInt(process.env.REVENUE_DIFF_TOLERANCE || '2');

// Body size guard helper
async function readRequestBody(req: Request): Promise<any> {
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    throw new Error(`Request body too large: ${contentLength} bytes exceeds ${MAX_BODY_SIZE} limit`);
  }
  
  const body = await req.text();
  if (body.length > MAX_BODY_SIZE) {
    throw new Error(`Request body too large: ${body.length} bytes exceeds ${MAX_BODY_SIZE} limit`);
  }
  
  return JSON.parse(body);
}

// Helper function to parse JSON response with hardening
function parseJson(res: any) {
  try {
    const content = res.choices[0].message.content;
    // Strip everything before the first { character
    const jsonStart = content.indexOf('{');
    if (jsonStart === -1) {
      throw new Error('No JSON object found in response');
    }
    const cleanContent = content.substring(jsonStart);
    return JSON.parse(cleanContent);
  } catch (e) {
    throw new Error('Malformed JSON from PPLX');
  }
}

// Create deterministic cache key with stable stringify
function buildCacheKey(inputs: any, model: string, params: any): string {
  const raw = stableStringify({ inputs, model, params });
  return "pplx:" + createHash("sha256").update(raw).digest("hex");
}

// Improved token counting (more accurate than length/4)
function countTokens(text: string): number {
  // More accurate approximation for English text
  // Words are typically 1.3 tokens, punctuation adds tokens
  const words = text.split(/\s+/).length;
  const punctuation = (text.match(/[.,!?;:]/g) || []).length;
  const specialChars = (text.match(/[{}[\]"':]/g) || []).length;
  
  // Base tokens from words + punctuation + special characters
  const estimatedTokens = Math.ceil(words * 1.3 + punctuation * 0.5 + specialChars * 0.3);
  
  // Ensure minimum reasonable token count
  return Math.max(estimatedTokens, Math.ceil(text.length / 6));
}

// Model selection logic with real token counting
function selectModel(inputs: any): string {
  const inputText = JSON.stringify(inputs);
  const inputTokens = countTokens(inputText);
  const userRequestedFullResearch = inputs?.fullResearch === true;

  if (inputTokens > 350 || userRequestedFullResearch) {
    return 'sonar-deep-research';
  }
  return 'sonar-pro';
}

// Build retrieval prompt for raw facts
function buildRetrievalPrompt(inputs: any, isRetry: boolean = false) {
  const basePrompt = `CRITICAL: You are analyzing ${inputs.therapeuticArea} - ${inputs.indication} targeting ${inputs.target} in ${inputs.geography} at ${inputs.developmentPhase} stage.

REQUIRED OUTPUT FORMAT - Return ONLY valid JSON matching RawFactsSchema:

1. DEAL ACTIVITY (dealActivity[]):
   - Search PitchBook, BusinessWire, SEC filings for REAL deals in this space
   - EVERY SINGLE DEAL ENTRY MUST include ALL of these fields:
     * asset: Exact asset/drug name (string, required)
     * stage: Development stage (must be: Preclinical, Phase 1, Phase 2, Phase 3, Filed, or Marketed)
     * priceUSD: Actual deal price in USD (number, required, must be > 0)
     * dateISO: Exact deal date in YYYY-MM-DD format (string, required)
     * rationale: Detailed explanation of deal logic (string, minimum 20 characters)
     * sources: Array of valid URLs (array of strings, minimum 1 URL)
   - Example: {"asset": "Enhertu", "stage": "Phase 3", "priceUSD": 6900000000, "dateISO": "2023-03-20", "rationale": "AstraZeneca expanded collaboration with Daiichi Sankyo for HER2-targeted ADC to cover additional breast cancer indications, reflecting strong commercial potential", "sources": ["https://pitchbook.com/...", "https://sec.gov/..."]}
   - CRITICAL: If you cannot find real deals with complete information, return an empty array rather than incomplete entries

2. KEY MARKET ASSUMPTIONS (keyMarketAssumptions):
   - avgSellingPriceUSD: Real price from EvaluatePharma, IQVIA, or GlobalData (NOT placeholder)
   - persistenceRate: Actual patient persistence data (0.0-1.0)
   - treatmentDurationMonths: Real treatment duration from clinical studies
   - geographicSplit: Real market distribution (us + eu + row = 1.0)
   - rationale: Detailed explanation of each assumption
   - sources: URLs to supporting data

3. REGULATORY INCENTIVES (regIncentives):
   - prvEligibility: Boolean + 2-3 sentence explanation citing FDA guidance
   - nationalPriority: Specific priority level + rationale from FDA/EMA documents
   - reviewTimelineMonths: Real timeline estimate + explanation
   - Each field MUST include rationale and source URLs

4. IP STRENGTH (ipStrength):
   - exclusivityYears: Real patent expiration analysis (NOT placeholder)
   - genericEntryRiskPercent: Actual risk assessment (0-100)
   - coreIpPosition: Specific strength level + detailed explanation
   - NO default values like "45%" or "strong"

5. FINANCIAL FORECAST (financialForecast):
   - totalTenYearRevenueUSD: Calculate based on peakRevenue2030, market dynamics, competition
   - peakMarketSharePercent: Real market share projection
   - peakPatientsCount: Actual patient population estimate
   - Each field MUST include detailed rationale and sources

6. SOURCE MAP (sourceMap):
   - Every non-null field must have corresponding source URLs
   - Format: {"fieldName": ["url1", "url2"]}

FAILURE CRITERIA - If you cannot provide real data for any field, return null with explanation in rationale.

Return ONLY valid JSON. No explanations outside the JSON structure.`;

  const retryPrompt = `${basePrompt}

URGENT RETRY: Previous response contained placeholder values or insufficient data. You MUST:
- Search more thoroughly across all specified sources
- Provide REAL market data, not estimates or placeholders
- Include detailed rationales for every value
- Ensure all source URLs are valid and accessible
- Double-check that no default values like "45%", "strong", or "25.654B" are used

CRITICAL DEAL ACTIVITY REQUIREMENTS:
- EVERY deal entry MUST have asset name, stage, priceUSD, dateISO, rationale, and sources
- NO incomplete deal entries allowed - either complete data or empty array
- Validate all deal prices are real numbers > 0
- Ensure all dates are in YYYY-MM-DD format
- Check all source URLs start with "http"`;

  return [
    { role: 'system', content: 'You are a senior biotech commercial intelligence analyst with 15+ years of experience. You MUST return complete, accurate data with full rationales and sources. NEVER use placeholder values like "45%", "strong", or "25.654B". ALWAYS provide real market data with detailed explanations.' },
    { role: 'user', content: isRetry ? retryPrompt : basePrompt }
  ];
}



export async function POST(req: Request) {
  const traceId = randomUUID();
  
  try {
    // Parse and validate user input with body size guard
    const rawBody = await readRequestBody(req);
    const safeInputs = UserInputSchema.parse(rawBody); // Throws 400 on failure

    // Build cache key for the complete analysis
    const model = selectModel(safeInputs);
    const searchParams = {
      model,
      fullResearch: safeInputs.fullResearch
    };
    const cacheKey = buildCacheKey(safeInputs, model, searchParams);

    // Check cache first
    let cached = await redis.get(cacheKey);

    if (!cached) {
      const start = Date.now();

      // ---------- PASS 1: Retrieval ----------
      const retrievalPrompt = buildRetrievalPrompt(safeInputs);

      // Wrap Perplexity fetch with AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        // Enhanced search parameters for better data retrieval
        const extra = {
          search_domain_filter: [
            'pitchbook.com','businesswire.com','sec.gov',
            'evaluatepharma.com','iqvia.com','globaldata.com',
            'orangebook.fda.gov','pair.uspto.gov','patentscope.wipo.int',
            'fda.gov','ema.europa.eu'
          ],
          search_context_size: model === 'sonar-deep-research' ? 'high' : 'medium',
          search_mode: 'company'
        };

        let rawFacts = await fetchPplx({
          model: model,
          messages: buildRetrievalPrompt(safeInputs, false),
          response_format: {
            type: 'json_schema',
            json_schema: { schema: RawFactsSchema }
          },
          ...extra
        }).then(parseJson);

        clearTimeout(timeoutId);

        // Validate schema
        RawFactsSchema.parse(rawFacts);

        // Enhanced validation and retry logic for incomplete data
        const validateDataQuality = (data: any) => {
          const issues: string[] = [];
          
          // Check for placeholder values
          if (data.financialForecast?.totalTenYearRevenueUSD?.value === 25.654) {
            issues.push('financialForecast.totalTenYearRevenueUSD is placeholder value');
          }
          if (data.ipStrength?.genericEntryRiskPercent?.value === 45) {
            issues.push('ipStrength.genericEntryRiskPercent is placeholder value');
          }
          if (data.ipStrength?.coreIpPosition?.value === 'strong') {
            issues.push('ipStrength.coreIpPosition is placeholder value');
          }
          
          // CRITICAL: Validate every single deal activity entry has all required fields
          if (!data.dealActivity || data.dealActivity.length === 0) {
            issues.push('dealActivity is missing or empty');
          } else {
            data.dealActivity.forEach((deal: any, index: number) => {
              if (!deal.asset || deal.asset.trim() === '') {
                issues.push(`dealActivity[${index}]: asset name is missing or empty`);
              }
              if (!deal.stage || !['Preclinical','Phase 1','Phase 2','Phase 3','Filed','Marketed'].includes(deal.stage)) {
                issues.push(`dealActivity[${index}]: stage is missing or invalid (must be one of: Preclinical, Phase 1, Phase 2, Phase 3, Filed, Marketed)`);
              }
              if (!deal.rationale || deal.rationale.trim().length < 20) {
                issues.push(`dealActivity[${index}]: rationale is missing or too short (minimum 20 characters)`);
              }
              if (!deal.priceUSD || typeof deal.priceUSD !== 'number' || deal.priceUSD <= 0) {
                issues.push(`dealActivity[${index}]: deal price (priceUSD) is missing, not a number, or invalid`);
              }
              if (!deal.dateISO || !deal.dateISO.match(/^\d{4}-\d{2}-\d{2}$/)) {
                issues.push(`dealActivity[${index}]: deal date (dateISO) is missing or invalid format (must be YYYY-MM-DD)`);
              }
              if (!deal.sources || !Array.isArray(deal.sources) || deal.sources.length === 0) {
                issues.push(`dealActivity[${index}]: sources array is missing or empty`);
              } else {
                deal.sources.forEach((source: string, sourceIndex: number) => {
                  if (!source || !source.startsWith('http')) {
                    issues.push(`dealActivity[${index}].sources[${sourceIndex}]: invalid URL format`);
                  }
                });
              }
            });
          }
          
          // Check for missing critical data
          if (!data.keyMarketAssumptions?.avgSellingPriceUSD) {
            issues.push('keyMarketAssumptions.avgSellingPriceUSD is missing');
          }
          if (!data.regIncentives?.prvEligibility?.rationale || data.regIncentives.prvEligibility.rationale.length < 20) {
            issues.push('regIncentives.prvEligibility rationale is insufficient');
          }
          
          return issues;
        };

        let dataQualityIssues = validateDataQuality(rawFacts);
        let retryCount = 0;
        const maxRetries = 2;

        while (dataQualityIssues.length > 0 && retryCount < maxRetries) {
          console.warn(`Data quality issues detected (attempt ${retryCount + 1}/${maxRetries})`, { 
            issues: dataQualityIssues, 
            traceId 
          });
          
          retryCount++;
          
          const retryBody = {
            model: model,
            messages: buildRetrievalPrompt(safeInputs, true),
            response_format: {
              type: 'json_schema' as const,
              json_schema: { schema: RawFactsSchema }
            },
            reasoning_effort: 'high',
            max_tokens: 8000,
            ...extra
          };
          
          rawFacts = await fetchPplx(retryBody).then(parseJson);
          RawFactsSchema.parse(rawFacts);
          dataQualityIssues = validateDataQuality(rawFacts);
        }

        if (dataQualityIssues.length > 0) {
          console.error('Data quality issues persist after retries', { issues: dataQualityIssues, traceId });
          return NextResponse.json({ 
            error: 'Insufficient data quality', 
            issues: dataQualityIssues,
            traceId 
          }, { status: 422 });
        }

        // Apply numeric sanity checks after raw model output
        const issues = sanityCheck(rawFacts);
        if (issues.length > 0) {
          console.warn('Sanity check failed', { issues, rawFacts, traceId });
          return NextResponse.json({ error: 'Sanity check failed', issues }, { status: 422 });
        }

        // ---------- PASS 2: Deterministic Computation ----------
        // Calculate derived fields using pure functions instead of model calls
        const derived = {
          cagr: calc.calcCAGR(rawFacts.peakRevenue2030, rawFacts.currentMarket, rawFacts.yearsToPeak),
          peakPatients2030: calc.calcPeakPatients(rawFacts.peakRevenue2030, rawFacts.keyMarketAssumptions.avgSellingPriceUSD, rawFacts.keyMarketAssumptions.persistenceRate),
          pipelineDensity: calc.calcPipelineDensity(rawFacts.sameTargetAssets, rawFacts.totalAssets),
          strategicFit: calc.calcStrategicFit(rawFacts.vectorA, rawFacts.vectorB)
        };

        // Merge results
        const finalResult = { ...rawFacts, ...derived };

        // Serialize with msgpackr and check size before caching
        const serialized = pack(finalResult);
        if (Buffer.byteLength(serialized) > MAX_CACHE_SIZE) {
          console.error('Cache payload too large', { size: Buffer.byteLength(serialized), traceId });
          // Continue without caching rather than failing
        } else {
          // Cache the complete result
          const cacheResult = await redis.set(cacheKey, serialized, { ex: TTL_SECONDS });
          if (cacheResult !== 'OK') {
            console.error('Redis cache write failed', { result: cacheResult, traceId });
          }
        }

        // Log to Supabase
        await sb.from("query_logs").insert({
          user_id: req.headers.get("x-user-id") ?? "anon",
          model,
          inputs: safeInputs,
          search_params: searchParams,
          created_at: new Date().toISOString(),
          duration_ms: Date.now() - start,
          source_count: rawFacts.sourceMap ? Object.keys(rawFacts.sourceMap).length : 0,
          trace_id: traceId
        });

        cached = finalResult;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Perplexity API request timed out after 60 seconds');
        }
        throw fetchError;
      }
    }

    // Return with cache control headers
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Trace-ID': traceId
      }
    });

  } catch (error: any) {
    console.error('Commercial analysis error:', { error: error.message, traceId });
    
    // Handle specific error types
    if (error.message?.includes('Request body too large')) {
      return NextResponse.json(
        { error: 'Request too large', details: error.message },
        { status: 413 }
      );
    }
    
    // Handle Zod validation errors by type
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Commercial analysis failed', details: error.message, traceId },
      { status: 500 }
    );
  }
} 