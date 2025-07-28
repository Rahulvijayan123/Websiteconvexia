import { NextRequest, NextResponse } from 'next/server';
import { ThreeLayerPerplexityOrchestrator } from '@/lib/threeLayerPerplexityOrchestrator';

export async function POST(req: NextRequest) {
  const logs: any[] = [];
  
  try {
    const body = await req.json();
    logs.push({ step: 'Parsed request body', body });

    const { target, indication, therapeuticArea, geography, developmentPhase, config } = body;

    if (!target || !indication) {
      return NextResponse.json({ 
        error: 'Missing required fields: target and indication are required' 
      }, { status: 400 });
    }

    // Initialize the three-layer orchestrator
    const orchestrator = new ThreeLayerPerplexityOrchestrator({
      maxValidationCycles: config?.maxValidationCycles || 5,
      qualityThreshold: config?.qualityThreshold || 0.90,
      enableFieldLevelValidation: config?.enableFieldLevelValidation !== false,
      enableGPTLogicVerification: config?.enableGPTLogicVerification !== false,
      enableCaching: config?.enableCaching !== false,
      validationStrictness: config?.validationStrictness || 'ultra',
      maxFieldRetries: config?.maxFieldRetries || 3,
      timeoutMs: config?.timeoutMs || 300000
    });

    logs.push({ step: 'Initialized orchestrator', config: orchestrator.getConfiguration() });

    // Execute the three-layer orchestration
    const inputs = {
      target,
      indication,
      therapeuticArea: therapeuticArea || 'Unknown',
      geography: geography || 'Global',
      developmentPhase: developmentPhase || 'Unknown'
    };

    logs.push({ step: 'Starting orchestration', inputs });

    const result = await orchestrator.orchestrate(inputs);

    logs.push({ 
      step: 'Orchestration completed', 
      totalCycles: result.totalCycles,
      finalQualityScore: result.finalQualityScore,
      totalTimeMs: result.metadata.totalTimeMs,
      fieldRegenerations: result.metadata.fieldRegenerations
    });

    return NextResponse.json({
      success: true,
      data: result.finalOutput,
      validationCycles: result.validationCycles,
      totalCycles: result.totalCycles,
      finalQualityScore: result.finalQualityScore,
      gptLogicVerification: result.gptLogicVerification,
      mathAuditResults: result.mathAuditResults,
      fieldValidationSummary: result.fieldValidationSummary,
      metadata: result.metadata,
      logs
    });

  } catch (error) {
    logs.push({ 
      error: 'Three-layer orchestration failed', 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({ 
      error: 'Three-layer orchestration failed', 
      details: error instanceof Error ? error.message : String(error),
      logs 
    }, { status: 500 });
  }
} 