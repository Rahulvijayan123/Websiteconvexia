import { NextResponse } from 'next/server';
import { RawFactsSchema, DerivedFactsSchema } from '@/schemas/commercialSchemas';
import { fetchPplx } from '@/lib/pplxClient';
import * as calc from '@/lib/crossFieldCalculator';
import { UserInputSchema } from '@/schemas/userInputs';
import { sanityCheck } from '@/lib/numericSanity';

// Helper function to parse JSON response
function parseJson(res: any) {
  try {
    return JSON.parse(res.choices[0].message.content);
  } catch (e) {
    throw new Error('Malformed JSON from PPLX');
  }
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

    // ---------- PASS 1: Retrieval ----------
    const retrievalPrompt = buildRetrievalPrompt(safeInputs);

    const rawFacts = await fetchPplx({
      model: selectModel(safeInputs), // use existing model selection logic
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

    // Return both merged
    return NextResponse.json({ ...rawFacts, ...derived });

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