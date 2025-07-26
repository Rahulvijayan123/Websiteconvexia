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
function buildRetrievalPrompt(inputs: any) {
  return [
    { role: 'system', content: 'You are an analyst. Return only JSON.' },
    { role: 'user', content: `
Given:
${JSON.stringify(inputs, null, 2)}

Instructions:
1. Return a structured JSON object that satisfies RawFactsSchema. Do not skip fields. Use null for missing values but always include a brief rationale for each.
2. For dealActivity[], extract from PitchBook, BusinessWire, or SEC filings. Each entry must include: asset name, stage, deal price (USD), deal date (ISO), rationale, and sources.
3. For keyMarketAssumptions, extract: avgSellingPriceUSD, persistenceRate, treatmentDurationMonths, and geographicSplit. Cite real values and sources from EvaluatePharma, IQVIA, or GlobalData.
4. For regIncentives (PRV eligibility, national priority, review timeline), include a short 1-2 sentence rationale explaining each value, citing relevant FDA/EMA sources.
5. For ipStrength (exclusivity years, genericEntryRiskPercent, coreIpPosition), provide specific real-world estimates — not placeholders like "45%" or "strong" — and include a rationale and source URLs.
6. For financialForecast.totalTenYearRevenueUSD, use a number that reflects peakRevenue2030 and back it up with a concise rationale.
7. Return a sourceMap: {field:[urls]} for every non-null field.
8. Return only valid JSON conforming to RawFactsSchema.` }
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
          messages: retrievalPrompt,
          response_format: {
            type: 'json_schema',
            json_schema: { schema: RawFactsSchema }
          },
          ...extra
        }).then(parseJson);

        clearTimeout(timeoutId);

        // Validate schema
        RawFactsSchema.parse(rawFacts);

        // Retry if critical fields are missing
        const critical = ['dealActivity','keyMarketAssumptions','financialForecast'];
        if (critical.some(k => !rawFacts[k] || (Array.isArray(rawFacts[k]) && rawFacts[k].length === 0))) {
          console.warn('Critical fields missing, retrying with high reasoning effort', { missing: critical.filter(k => !rawFacts[k] || (Array.isArray(rawFacts[k]) && rawFacts[k].length === 0)), traceId });
          
          const retryBody = {
            model: model,
            messages: retrievalPrompt,
            response_format: {
              type: 'json_schema',
              json_schema: { schema: RawFactsSchema }
            },
            reasoning_effort: 'high',
            ...extra
          };
          
          rawFacts = await fetchPplx(retryBody).then(parseJson);
          RawFactsSchema.parse(rawFacts); // enforce schema again
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