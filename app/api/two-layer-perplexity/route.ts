import { NextRequest, NextResponse } from 'next/server';
import { TwoLayerPerplexityOrchestrator } from '@/lib/twoLayerPerplexityOrchestrator';

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

    // Initialize the two-layer orchestrator
    const orchestrator = new TwoLayerPerplexityOrchestrator({
      maxValidationCycles: config?.maxValidationCycles || 5,
      qualityThreshold: config?.qualityThreshold || 0.90,
      enableMathAudit: config?.enableMathAudit !== false,
      enableConsistencyCheck: config?.enableConsistencyCheck !== false,
      enableSourceValidation: config?.enableSourceValidation !== false,
      enableLogicAnnotations: config?.enableLogicAnnotations !== false,
      validationStrictness: config?.validationStrictness || 'ultra',
      gptPostProcessing: config?.gptPostProcessing !== false,
      timeoutMs: config?.timeoutMs || 300000
    });

    logs.push({ step: 'Initialized orchestrator', config: orchestrator.getConfiguration() });

    // Execute the two-layer orchestration
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
      totalTimeMs: result.metadata.totalTimeMs
    });

    return NextResponse.json({
      success: true,
      data: result.finalOutput,
      validationCycles: result.validationCycles,
      totalCycles: result.totalCycles,
      finalQualityScore: result.finalQualityScore,
      mathAuditResults: result.mathAuditResults,
      consistencyResults: result.consistencyResults,
      sourceValidationResults: result.sourceValidationResults,
      logicAnnotations: result.logicAnnotations,
      gptPostProcessingResults: result.gptPostProcessingResults,
      metadata: result.metadata,
      logs
    });

  } catch (error) {
    logs.push({ 
      error: 'Two-layer orchestration failed', 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({ 
      error: 'Two-layer orchestration failed', 
      details: error instanceof Error ? error.message : String(error),
      logs 
    }, { status: 500 });
  }
} 