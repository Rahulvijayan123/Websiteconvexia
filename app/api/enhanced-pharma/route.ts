import { NextRequest, NextResponse } from 'next/server';
import { EnhancedPharmaOrchestrator } from '@/lib/enhancedPharmaOrchestrator';

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

    // Initialize the enhanced pharma orchestrator
    const orchestrator = new EnhancedPharmaOrchestrator({
      maxValidationCycles: config?.maxValidationCycles || 3,
      qualityThreshold: config?.qualityThreshold || 0.85,
      enableFieldLevelValidation: config?.enableFieldLevelValidation !== false,
      enableGPTLogicVerification: config?.enableGPTLogicVerification !== false,
      enableCaching: config?.enableCaching !== false,
      validationStrictness: config?.validationStrictness || 'high',
      maxFieldRetries: config?.maxFieldRetries || 2,
      timeoutMs: config?.timeoutMs || 180000,
      rateLimitDelay: config?.rateLimitDelay || 2000,
      batchSize: config?.batchSize || 6,
      enableSmartValidation: config?.enableSmartValidation !== false,
      maxCostPerQuery: config?.maxCostPerQuery || 3.0,
      enableGPT4oEnhancement: config?.enableGPT4oEnhancement !== false,
      enableExecutiveValidation: config?.enableExecutiveValidation !== false
    });

    logs.push({ step: 'Initialized enhanced pharma orchestrator', config: orchestrator.getConfiguration() });

    // Execute the enhanced pharma orchestration
    const inputs = {
      target,
      indication,
      therapeuticArea: therapeuticArea || 'Unknown',
      geography: geography || 'Global',
      developmentPhase: developmentPhase || 'Unknown'
    };

    logs.push({ step: 'Starting enhanced pharma orchestration', inputs });

    const result = await orchestrator.orchestrate(inputs);

    // Get final cost metrics
    const costMetrics = { totalCost: 2.5 }; // Placeholder
    const costOptimizationSuggestions = [];

    logs.push({ 
      step: 'Enhanced pharma orchestration completed', 
      totalCycles: result.totalCycles,
      finalQualityScore: result.finalQualityScore,
      totalTimeMs: result.metadata.totalTimeMs,
      fieldRegenerations: result.metadata.fieldRegenerations,
      totalApiCalls: result.metadata.totalApiCalls,
      costOptimization: result.metadata.costOptimization,
      totalCost: costMetrics.totalCost,
      remainingBudget: 0.5,
      executiveAnalysis: result.executiveAnalysis
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
      executiveAnalysis: result.executiveAnalysis,
      metadata: {
        ...result.metadata,
        costMetrics,
        costOptimizationSuggestions: [] as string[],
        remainingBudget: 0.5,
        costLimitExceeded: costMetrics.totalCost >= 3.0
      },
      logs
    });

  } catch (error: any) {
    console.error('Enhanced pharma orchestration failed:', error);
    
    logs.push({ 
      step: 'Enhanced pharma orchestration failed', 
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      error: error.message,
      logs
    }, { status: 500 });
  }
} 