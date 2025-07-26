import { NextResponse } from 'next/server';
import { RawFactsSchema, DerivedFactsSchema } from '@/schemas/commercialSchemas';
import { fetchPplx } from '@/lib/pplxClient';

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

// Build computation prompt for derived facts
function buildComputePrompt(raw: any) {
  return [
    { role: 'system', content: 'You are a calculator. Return only JSON.' },
    { role: 'user', content: `
Using the RawFacts object provided, compute the DerivedFactsSchema. 
Apply the exact formulas below and do not change raw fields.

Formulas:
CAGR = (peakRevenue2030 / currentMarket) ** (1 / yearsToPeak) - 1
peakPatients2030 = (peakRevenue2030 / avgPrice) * persistenceRate
pipelineDensity = (sameTargetAssets / totalAssets) * 100
strategicFit = cosineSimilarity(vectorA, vectorB)

RawFacts:
${JSON.stringify(raw)} `}
  ];
}

export async function POST(req: Request) {
  try {
    // Parse user input
    const userInputs = await req.json(); // e.g., target, indication, geography

    // ---------- PASS 1: Retrieval ----------
    const retrievalPrompt = buildRetrievalPrompt(userInputs);

    const rawFacts = await fetchPplx({
      model: selectModel(userInputs), // use existing model selection logic
      messages: retrievalPrompt,
      response_format: {
        type: 'json_schema',
        json_schema: { schema: RawFactsSchema }
      }
    }).then(parseJson);

    // Optional: Zod validation (if using Zod)
    // RawFactsSchema.parse(rawFacts);

    // ---------- PASS 2: Computation ----------
    const computePrompt = buildComputePrompt(rawFacts);

    const derived = await fetchPplx({
      model: 'sonar-pro',
      messages: computePrompt,
      response_format: {
        type: 'json_schema',
        json_schema: { schema: DerivedFactsSchema }
      }
    }).then(parseJson);

    // Optional: Schema validation
    // DerivedFactsSchema.parse(derived);

    // Return both merged
    return NextResponse.json({ ...rawFacts, ...derived });

  } catch (error) {
    console.error('Commercial analysis error:', error);
    return NextResponse.json(
      { error: 'Commercial analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 