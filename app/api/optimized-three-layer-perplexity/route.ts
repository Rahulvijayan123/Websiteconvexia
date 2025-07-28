import { NextRequest, NextResponse } from 'next/server';
import { OptimizedThreeLayerOrchestrator } from '@/lib/optimizedThreeLayerOrchestrator';
import { globalCostTracker } from '@/lib/costTracker';

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

    // Reset cost tracking for new request
    globalCostTracker.resetQuery();

    // Initialize the optimized three-layer orchestrator
    const orchestrator = new OptimizedThreeLayerOrchestrator({
      maxValidationCycles: config?.maxValidationCycles || 3, // Back to 3 cycles
      qualityThreshold: config?.qualityThreshold || 0.85, // Back to higher threshold
      enableFieldLevelValidation: config?.enableFieldLevelValidation !== false,
      enableGPTLogicVerification: config?.enableGPTLogicVerification !== false,
      enableCaching: config?.enableCaching !== false,
      validationStrictness: config?.validationStrictness || 'high', // Back to high
      maxFieldRetries: config?.maxFieldRetries || 2, // Back to 2 retries
      timeoutMs: config?.timeoutMs || 180000, // Back to 3 minutes
      rateLimitDelay: config?.rateLimitDelay || 2000, // Back to 2 seconds
      batchSize: config?.batchSize || 6, // Keep optimized batch size
      enableSmartValidation: config?.enableSmartValidation !== false,
      maxCostPerQuery: config?.maxCostPerQuery || 3.0, // Back to $3 limit
      enableGPT4oEnhancement: config?.enableGPT4oEnhancement !== false
    });

    logs.push({ step: 'Initialized optimized orchestrator', config: orchestrator.getConfiguration() });

    // Execute the optimized three-layer orchestration
    const inputs = {
      target,
      indication,
      therapeuticArea: therapeuticArea || 'Unknown',
      geography: geography || 'Global',
      developmentPhase: developmentPhase || 'Unknown'
    };

    logs.push({ step: 'Starting optimized orchestration', inputs });

    const result = await orchestrator.orchestrate(inputs);

    // Get final cost metrics
    const costMetrics = globalCostTracker.getCurrentMetrics();
    const costOptimizationSuggestions = globalCostTracker.getCostOptimizationSuggestions();

    logs.push({ 
      step: 'Optimized orchestration completed', 
      totalCycles: result.totalCycles,
      finalQualityScore: result.finalQualityScore,
      totalTimeMs: result.metadata.totalTimeMs,
      fieldRegenerations: result.metadata.fieldRegenerations,
      totalApiCalls: result.metadata.totalApiCalls,
      costOptimization: result.metadata.costOptimization,
      totalCost: costMetrics.totalCost,
      remainingBudget: globalCostTracker.getRemainingBudget()
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
      metadata: {
        ...result.metadata,
        costMetrics,
        costOptimizationSuggestions,
        remainingBudget: globalCostTracker.getRemainingBudget(),
        costLimitExceeded: costMetrics.totalCost >= 3.0 // Back to $3.0 limit
      },
      logs
    });

  } catch (error: any) {
    const costMetrics = globalCostTracker.getCurrentMetrics();
    
    logs.push({ 
      error: 'Optimized three-layer orchestration failed', 
      details: error.message || String(error),
      stack: error.stack,
      totalCost: costMetrics.totalCost,
      remainingBudget: globalCostTracker.getRemainingBudget()
    });

    return NextResponse.json({ 
      error: 'Optimized three-layer orchestration failed', 
      details: error.message || String(error),
      costMetrics,
      remainingBudget: globalCostTracker.getRemainingBudget(),
      logs 
    }, { status: 500 });
  }
} 