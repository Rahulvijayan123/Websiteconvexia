import { NextRequest, NextResponse } from 'next/server';
import { PharmaOrchestrator } from '@/lib/pharmaOrchestrator';
import { UserInputSchema } from '@/schemas/userInputs';
import { validateApiKey } from '@/lib/pplxClient';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const traceId = `pharma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Validate API keys
    if (!validateApiKey()) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse and validate request
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const safeInputs = UserInputSchema.parse(body);

    // Determine model based on input complexity and user preference
    const inputComplexity = safeInputs.target.length + safeInputs.indication.length;
    const model = inputComplexity > 50 || safeInputs.fullResearch ? 'sonar-deep-research' : 'sonar-pro';

    console.log('Starting optimized pharma analysis', {
      target: safeInputs.target,
      indication: safeInputs.indication,
      model,
      inputComplexity,
      traceId
    });

    // Create orchestrator with optimized configuration
    const orchestrator = new PharmaOrchestrator({
      maxRetries: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
      qualityThreshold: parseFloat(process.env.QUALITY_THRESHOLD_SCORE || '0.85'),
      enableReviewPipeline: true,
      enableMultiPassResearch: true,
      enableCaching: true,
      timeoutMs: parseInt(process.env.DEEP_RESEARCH_TIMEOUT || '300000')
    });

    // Execute comprehensive pharma analysis
    const result = await orchestrator.orchestrate(safeInputs, model);

    const totalTimeMs = Date.now() - startTime;

    console.log('Optimized pharma analysis completed', {
      qualityScore: result.qualityScore,
      retryCount: result.retryCount,
      totalTimeMs,
      sourcesUsed: result.sourcesUsed,
      cacheHit: result.cacheHit,
      traceId
    });

    // Return response with comprehensive metadata
    return NextResponse.json({
      ...result.output,
      metadata: {
        qualityScore: result.qualityScore,
        retryCount: result.retryCount,
        totalTimeMs,
        sourcesUsed: result.sourcesUsed,
        cacheHit: result.cacheHit,
        traceId: result.traceId,
        model,
        reviewResults: result.reviewResults?.map(r => ({
          overallScore: r.assessment.overallScore,
          issues: r.assessment.issues.length,
          recommendations: r.assessment.recommendations.length,
          timeMs: r.totalTimeMs
        }))
      }
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Trace-ID': result.traceId,
        'X-Quality-Score': result.qualityScore.toString(),
        'X-Sources-Used': result.sourcesUsed.toString(),
        'X-Retry-Count': result.retryCount.toString()
      }
    });

  } catch (error: any) {
    const totalTimeMs = Date.now() - startTime;
    
    console.error('Optimized pharma analysis failed', {
      error: error.message,
      totalTimeMs,
      traceId
    });

    // Handle specific error types
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: error.message,
          traceId 
        },
        { status: 400 }
      );
    }

    if (error.message?.includes('API key not configured')) {
      return NextResponse.json(
        { 
          error: 'API configuration error', 
          details: error.message,
          traceId 
        },
        { status: 500 }
      );
    }

    if (error.message?.includes('Failed to produce acceptable output')) {
      return NextResponse.json(
        { 
          error: 'Quality threshold not met', 
          details: 'Analysis failed to meet minimum quality standards after maximum retries',
          traceId,
          totalTimeMs
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Optimized pharma analysis failed', 
        details: error.message,
        traceId,
        totalTimeMs
      },
      { status: 500 }
    );
  }
} 