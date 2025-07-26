import { NextResponse } from 'next/server';
import { RawFactsSchema, DerivedFactsSchema } from '@/schemas/commercialSchemas';
import { fetchPplx } from '@/lib/pplxClient';
import * as calc from '@/lib/crossFieldCalculator';
import { UserInputSchema } from '@/schemas/userInputs';
import { sanityCheck } from '@/lib/numericSanity';
import { redis } from '@/lib/redisClient';
import { sb } from '@/lib/supabaseClient';
import { safeParseJson } from '@/lib/safeJson';
import { createHash } from "crypto";

// Cache configuration
const TTL_SECONDS = 60 * 60 * 24; // 24 hours

// Helper function to parse JSON response
function parseJson(res: any) {
  try {
    return JSON.parse(res.choices[0].message.content);
  } catch (e) {
    throw new Error('Malformed JSON from PPLX');
  }
}

// Create deterministic cache key
function buildCacheKey(inputs: any, model: string, params: any): string {
  const raw = JSON.stringify({ inputs, model, params });
  return "pplx:" + createHash("sha256").update(raw).digest("hex");
}

// Model selection logic (reused from perplexity route)
function selectModel(inputs: any): string {
  const inputText = JSON.stringify(inputs);
  const inputTokens = Math.ceil(inputText.length / 4);
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

Return an object matching RawFactsSchema. 
Populate every numeric field with a number, not a range. 
Echo a sourceMap: {field: [urls...]}. One primary source per field minimum.` }
  ];
}



export async function POST(req: Request) {
  try {
    // Parse and validate user input
    const rawBody = await req.json();
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

      const rawFacts = await fetchPplx({
        model: model,
        messages: retrievalPrompt,
        response_format: {
          type: 'json_schema',
          json_schema: { schema: RawFactsSchema }
        }
      }).then(parseJson);

      // Apply numeric sanity checks after raw model output
      const issues = sanityCheck(rawFacts);
      if (issues.length > 0) {
        console.warn('Sanity check failed', { issues, rawFacts });
        return NextResponse.json({ error: 'Sanity check failed', issues }, { status: 422 });
      }

      // ---------- PASS 2: Deterministic Computation ----------
      // Calculate derived fields using pure functions instead of model calls
      const derived = {
        cagr: calc.calcCAGR(rawFacts.peakRevenue2030, rawFacts.currentMarket, rawFacts.yearsToPeak),
        peakPatients2030: calc.calcPeakPatients(rawFacts.peakRevenue2030, rawFacts.avgPrice, rawFacts.persistenceRate),
        pipelineDensity: calc.calcPipelineDensity(rawFacts.sameTargetAssets, rawFacts.totalAssets),
        strategicFit: calc.calcStrategicFit(rawFacts.vectorA, rawFacts.vectorB)
      };

      // Merge results
      const finalResult = { ...rawFacts, ...derived };

      // Cache the complete result
      await redis.set(cacheKey, finalResult, { ex: TTL_SECONDS });

      // Log to Supabase
      await sb.from("query_logs").insert({
        user_id: req.headers.get("x-user-id") ?? "anon",
        model,
        inputs: safeInputs,
        search_params: searchParams,
        duration_ms: Date.now() - start,
        source_count: rawFacts.sourceMap ? Object.keys(rawFacts.sourceMap).length : 0
      });

      cached = finalResult;
    }

    return NextResponse.json(cached);

  } catch (error) {
    console.error('Commercial analysis error:', error);
    
    // Handle Zod validation errors specifically
    if (error instanceof Error && error.message.includes('ZodError')) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Commercial analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 