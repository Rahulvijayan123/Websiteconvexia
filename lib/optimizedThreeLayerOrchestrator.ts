import { fetchPplx } from './pplxClient';
import { EnhancedMathAuditor } from './enhancedMathAuditor';
import { globalCostTracker } from './costTracker';
import { validateLogic, validateMath, enhanceOutputWithRationales, finalQualityEnhancement } from './gpt4oClient';
import commercialSchema from '@/schemas/commercialOutputSchema.json';

interface OptimizedConfig {
  maxValidationCycles: number;
  qualityThreshold: number;
  enableFieldLevelValidation: boolean;
  enableGPTLogicVerification: boolean;
  enableCaching: boolean;
  timeoutMs: number;
  validationStrictness: 'low' | 'medium' | 'high' | 'ultra';
  maxFieldRetries: number;
  rateLimitDelay: number;
  batchSize: number;
  enableSmartValidation: boolean;
  maxCostPerQuery: number;
  enableGPT4oEnhancement: boolean;
}

interface ValidationCycle {
  cycle: number;
  fieldValidations: FieldValidation[];
  overallScore: number;
  fieldsRequiringRegeneration: string[];
  totalFields: number;
  validatedFields: number;
  apiCallsMade: number;
  costMetrics: any;
}

interface FieldValidation {
  fieldName: string;
  isValid: boolean;
  score: number;
  requiresRegeneration: boolean;
  validationDetails: any;
}

interface OptimizedResult {
  finalOutput: any;
  validationCycles: ValidationCycle[];
  totalCycles: number;
  finalQualityScore: number;
  gptLogicVerification: any;
  mathAuditResults: any;
  fieldValidationSummary: any;
  gpt4oEnhancement: any;
  metadata: {
    totalTimeMs: number;
    sourcesUsed: number;
    searchQueries: number;
    validationAttempts: number;
    fieldRegenerations: number;
    totalApiCalls: number;
    costOptimization: {
      apiCallsSaved: number;
      estimatedCostReduction: number;
      efficiencyScore: number;
    };
    costMetrics: any;
  };
}

class OptimizedThreeLayerOrchestrator {
  private config: OptimizedConfig;
  private mathAuditor: EnhancedMathAuditor;
  private fieldCache: Map<string, any> = new Map();
  private apiCallCount: number = 0;
  private lastApiCall: number = 0;

  constructor(config: Partial<OptimizedConfig> = {}) {
    this.config = {
      maxValidationCycles: 2, // Back to 2 cycles for better quality
      qualityThreshold: 0.80, // Back to higher threshold for quality
      enableFieldLevelValidation: true,
      enableGPTLogicVerification: true,
      enableCaching: true,
      timeoutMs: 180000, // Back to 3 minutes
      validationStrictness: 'high', // Back to high for quality
      maxFieldRetries: 2, // Back to 2 retries
      rateLimitDelay: 2000, // Back to 2 seconds
      batchSize: 6, // Keep optimized batch size
      enableSmartValidation: true,
      maxCostPerQuery: 3.0, // Back to $3 limit for quality
      enableGPT4oEnhancement: true,
      ...config
    };

    this.mathAuditor = new EnhancedMathAuditor();
  }

  async orchestrate(inputs: any): Promise<OptimizedResult> {
    const startTime = Date.now();
    console.log('🚀 Starting Optimized Three-Layer Perplexity Orchestration');
    
    // Reset cost tracking for new query
    globalCostTracker.resetQuery();
    
    const validationCycles: ValidationCycle[] = [];
    let currentOutput: any = null;
    let cycleCount = 0;
    let finalQualityScore = 0;
    let totalFieldRegenerations = 0;
    let totalApiCalls = 0;

    try {
      // Layer 1: Initial Research Agent
      console.log('📚 Layer 1: Initial Research Agent');
      currentOutput = await this.executeLayer1Research(inputs);
      totalApiCalls++;
      
      // Validation and Refinement Loop
      while (cycleCount < this.config.maxValidationCycles) {
        cycleCount++;
        console.log(`\n🔄 Validation Cycle ${cycleCount}/${this.config.maxValidationCycles}`);
        
        // Check cost limit before proceeding
        if (globalCostTracker.getRemainingBudget() < 1.0) {
          console.log(`💰 Cost limit approaching, stopping validation cycles. Remaining: $${globalCostTracker.getRemainingBudget().toFixed(4)}`);
          break;
        }
        
        // Layer 2: Smart Field-Level Validation
        const fieldValidations = await this.executeSmartFieldValidation(inputs, currentOutput, cycleCount);
        totalApiCalls += fieldValidations.apiCallsMade;
        
        const fieldsRequiringRegeneration = fieldValidations.validations
          .filter(fv => fv.requiresRegeneration)
          .map(fv => fv.fieldName);
        
        const validatedFields = fieldValidations.validations.filter(fv => fv.isValid).length;
        const overallScore = fieldValidations.validations.reduce((sum, fv) => sum + fv.score, 0) / fieldValidations.validations.length;
        
        const cycle: ValidationCycle = {
          cycle: cycleCount,
          fieldValidations: fieldValidations.validations,
          overallScore,
          fieldsRequiringRegeneration,
          totalFields: fieldValidations.validations.length,
          validatedFields,
          apiCallsMade: fieldValidations.apiCallsMade,
          costMetrics: globalCostTracker.getCurrentMetrics()
        };

        validationCycles.push(cycle);
        totalFieldRegenerations += fieldsRequiringRegeneration.length;

        // Check if quality threshold is met
        if (overallScore >= this.config.qualityThreshold && fieldsRequiringRegeneration.length === 0) {
          console.log(`✅ Quality threshold met: ${overallScore.toFixed(2)} >= ${this.config.qualityThreshold}`);
          finalQualityScore = overallScore;
          break;
        }

        // Regenerate failed fields (only if we have budget)
        if (fieldsRequiringRegeneration.length > 0 && globalCostTracker.getRemainingBudget() > 0.8) {
          console.log(`🔄 Regenerating ${fieldsRequiringRegeneration.length} failed fields`);
          currentOutput = await this.regenerateFailedFields(inputs, currentOutput, fieldValidations.validations);
          totalApiCalls++;
        }
      }

      // Layer 3: GPT-4o Enhancement (Logic, Math, Writing)
      let gpt4oEnhancement = null;
      if (this.config.enableGPT4oEnhancement && globalCostTracker.getRemainingBudget() > 0.2) {
        console.log('\n🧠 Layer 3: GPT-4o Enhancement (Logic, Math, Writing)');
        gpt4oEnhancement = await this.executeGPT4oEnhancement(inputs, currentOutput);
        currentOutput = gpt4oEnhancement.finalOutput;
      }

      // Math Audit (only if we have budget)
      let mathAuditResults = null;
      if (this.config.enableGPTLogicVerification && globalCostTracker.getRemainingBudget() > 0.1) {
        console.log('\n🧮 Math Audit');
        mathAuditResults = await this.mathAuditor.auditMath(currentOutput);
      }

      const totalTimeMs = Date.now() - startTime;

      // Calculate cost optimization metrics
      const costOptimization = this.calculateCostOptimization(totalApiCalls, validationCycles);

      return {
        finalOutput: currentOutput,
        validationCycles,
        totalCycles: cycleCount,
        finalQualityScore,
        gptLogicVerification: gpt4oEnhancement?.logicValidation || null,
        mathAuditResults,
        fieldValidationSummary: this.generateFieldValidationSummary(validationCycles),
        gpt4oEnhancement,
        metadata: {
          totalTimeMs,
          sourcesUsed: this.calculateTotalSources(validationCycles),
          searchQueries: this.calculateTotalSearchQueries(validationCycles),
          validationAttempts: cycleCount,
          fieldRegenerations: totalFieldRegenerations,
          totalApiCalls,
          costOptimization,
          costMetrics: globalCostTracker.getCurrentMetrics()
        }
      };
    } catch (error: any) {
      console.error('❌ Orchestration failed:', error);
      throw error;
    }
  }

  private async executeLayer1Research(inputs: any): Promise<any> {
    await this.rateLimit();
    
    const prompt = this.generateLayer1Prompt(inputs);
    
    // Use cost-aware model selection
    const model = globalCostTracker.getOptimalModel('research', 1.5);
    
    const payload = {
      model,
      messages: [
        { role: 'system', content: 'You are a biotech commercial intelligence research agent. Conduct thorough, accurate research and return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 8000, // Back to original for quality
      temperature: 0.1,
      reasoning_effort: 'high', // Back to high for quality
      web_search_options: {
        search_context_size: 'high', // Changed from 'large' to 'high' (valid value)
        search_depth: 'standard'
      },
      search_queries_per_search: 4, // Back to original
      response_format: {
        type: 'json_schema' as const,
        json_schema: { schema: this.getCommercialSchema() }
      }
    };

    const response = await fetchPplx(payload);
    const parsedResponse = this.parsePerplexityResponse(response.choices[0].message.content);
    
    return parsedResponse;
  }

  private async executeSmartFieldValidation(inputs: any, currentOutput: any, cycleCount: number): Promise<{
    validations: FieldValidation[];
    apiCallsMade: number;
  }> {
    const fieldsToValidate = this.selectFieldsForValidation(currentOutput, cycleCount);
    const validations: FieldValidation[] = [];
    let apiCallsMade = 0;

    // Batch validation to reduce API calls
    const batches = this.createBatches(fieldsToValidate, this.config.batchSize);
    
    for (const batch of batches) {
      // Check cost before each batch
      if (!globalCostTracker.canAffordCall('sonar-pro', 1500, 800)) {
        console.log('💰 Cost limit reached during field validation, stopping');
        break;
      }
      
      try {
        const batchValidation = await this.validateFieldBatch(inputs, currentOutput, batch);
        validations.push(...batchValidation);
        apiCallsMade++;
      } catch (error: any) {
        console.error('❌ Batch validation failed:', error);
        // Mark fields as requiring regeneration on error
        batch.forEach(fieldName => {
          validations.push({
            fieldName,
            isValid: false,
            score: 0,
            requiresRegeneration: true,
            validationDetails: { error: error?.message || 'Unknown error' }
          });
        });
      }
    }

    return { validations, apiCallsMade };
  }

  private async validateFieldBatch(inputs: any, currentOutput: any, fieldNames: string[]): Promise<FieldValidation[]> {
    await this.rateLimit();
    
    const prompt = this.generateFieldValidationPrompt(inputs, currentOutput, fieldNames);
    
    const payload = {
      model: 'sonar-pro', // Use cheaper model for validation
      messages: [
        { role: 'system', content: 'You are a field validation expert. Analyze the provided data and return validation results.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500, // Back to original
      temperature: 0.1,
      reasoning_effort: 'medium', // Back to medium
      web_search_options: {
        search_context_size: 'medium', // Back to medium
        search_depth: 'standard'
      },
      search_queries_per_search: 2, // Back to original
      response_format: {
        type: 'json_schema' as const,
        json_schema: { schema: this.getValidationSchema() }
      }
    };

    const response = await fetchPplx(payload);
    const validationResult = this.parseValidationResponse(response.choices[0].message.content);
    
    return fieldNames.map(fieldName => ({
      fieldName,
      isValid: validationResult[fieldName]?.isValid || false,
      score: validationResult[fieldName]?.score || 0,
      requiresRegeneration: !validationResult[fieldName]?.isValid,
      validationDetails: validationResult[fieldName]?.details || {}
    }));
  }

  private async regenerateFailedFields(inputs: any, currentOutput: any, failedValidations: FieldValidation[]): Promise<any> {
    await this.rateLimit();
    
    const failedFields = failedValidations.filter(fv => fv.requiresRegeneration).map(fv => fv.fieldName);
    const prompt = this.generateFieldRegenerationPrompt(inputs, currentOutput, failedFields);
    
    // Use cost-aware model selection
    const model = globalCostTracker.getOptimalModel('validation', 0.8);
    
    const payload = {
      model,
      messages: [
        { role: 'system', content: 'You are a field regeneration expert. Fix the identified issues and return improved data.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 4000, // Back to original
      temperature: 0.1,
      reasoning_effort: 'high', // Back to high for quality
      web_search_options: {
        search_context_size: 'medium',
        search_depth: 'standard'
      },
      search_queries_per_search: 3, // Back to original
      response_format: {
        type: 'json_schema' as const,
        json_schema: { schema: this.getCommercialSchema() }
      }
    };

    const response = await fetchPplx(payload);
    const regeneratedOutput = this.parsePerplexityResponse(response.choices[0].message.content);
    
    // Merge regenerated fields with existing output
    const mergedOutput = { ...currentOutput };
    failedFields.forEach(fieldName => {
      if (regeneratedOutput[fieldName] !== undefined) {
        mergedOutput[fieldName] = regeneratedOutput[fieldName];
      }
    });
    
    return mergedOutput;
  }

  private async executeGPT4oEnhancement(inputs: any, currentOutput: any): Promise<any> {
    console.log('  🔍 Logic Validation...');
    const logicValidation = await validateLogic(currentOutput, inputs);
    
    console.log('  🧮 Math Validation...');
    const mathValidation = await validateMath(currentOutput);
    
    console.log('  ✍️  Adding Rationales...');
    const enhancedWithRationales = await enhanceOutputWithRationales(currentOutput, inputs);
    
    console.log('  🎯 Final Quality Enhancement...');
    const finalEnhanced = await finalQualityEnhancement(enhancedWithRationales, logicValidation, mathValidation);
    
    return {
      logicValidation,
      mathValidation,
      enhancedWithRationales,
      finalOutput: finalEnhanced,
      enhancementSummary: {
        logicScore: logicValidation.overallLogicScore,
        mathScore: mathValidation.mathScore,
        totalEnhancements: (logicValidation.logicCorrections?.length || 0) + (mathValidation.mathCorrections?.length || 0)
      }
    };
  }

  private selectFieldsForValidation(currentOutput: any, cycleCount: number): string[] {
    if (!this.config.enableSmartValidation) {
      return Object.keys(currentOutput);
    }

    // Smart field selection based on cycle and output quality
    const allFields = Object.keys(currentOutput);
    
    if (cycleCount === 1) {
      // First cycle: validate critical fields only
      const criticalFields = ['marketSize', 'peakRevenue2030', 'directCompetitors'];
      return criticalFields.filter(field => allFields.includes(field));
    } else {
      // Second cycle: validate remaining important fields
      const importantFields = ['cagr', 'avgSellingPrice', 'peakPatients2030', 'total10YearRevenue'];
      return importantFields.filter(field => allFields.includes(field));
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    
    if (timeSinceLastCall < this.config.rateLimitDelay) {
      const delay = this.config.rateLimitDelay - timeSinceLastCall;
      console.log(`  ⏳ Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastApiCall = Date.now();
    this.apiCallCount++;
  }

  private calculateCostOptimization(totalApiCalls: number, validationCycles: ValidationCycle[]): any {
    // Calculate baseline API calls (worst case scenario)
    const baselineApiCalls = 1 + // Layer 1
      (this.config.maxValidationCycles * 16) + // Individual field validation
      this.config.maxValidationCycles; // Field regeneration
    
    const apiCallsSaved = baselineApiCalls - totalApiCalls;
    const estimatedCostReduction = (apiCallsSaved / baselineApiCalls) * 100;
    const efficiencyScore = Math.min(100, (totalApiCalls / baselineApiCalls) * 100);
    
    return {
      apiCallsSaved,
      estimatedCostReduction,
      efficiencyScore,
      baselineApiCalls,
      actualApiCalls: totalApiCalls
    };
  }

  // Helper methods for prompts and schemas
  private generateLayer1Prompt(inputs: any): string {
    return `Generate comprehensive commercial intelligence data for:
Target: ${inputs.target}
Indication: ${inputs.indication}
Therapeutic Area: ${inputs.therapeuticArea}
Geography: ${inputs.geography}
Development Phase: ${inputs.developmentPhase}

Focus on the most critical fields first. Return only valid JSON matching the commercial schema.`;
  }

  private generateFieldValidationPrompt(inputs: any, currentOutput: any, fieldNames: string[]): string {
    return `Validate the following fields in the commercial intelligence data:
Fields: ${fieldNames.join(', ')}
Current Output: ${JSON.stringify(currentOutput)}
Inputs: ${JSON.stringify(inputs)}

Return validation results for each field.`;
  }

  private generateFieldRegenerationPrompt(inputs: any, currentOutput: any, failedFields: string[]): string {
    return `Regenerate the following failed fields:
Failed Fields: ${failedFields.join(', ')}
Current Output: ${JSON.stringify(currentOutput)}
Inputs: ${JSON.stringify(inputs)}

Return improved data for the failed fields.`;
  }

  private getCommercialSchema(): any {
    return commercialSchema;
  }

  private getValidationSchema(): any {
    return {
      type: 'object',
      properties: {
        // Dynamic validation schema
      }
    };
  }

  private parsePerplexityResponse(content: string): any {
    try {
      // First try to parse as-is
      return JSON.parse(content);
    } catch (error) {
      // If that fails, try to extract JSON from the response
      try {
        // Remove <think> tags and their content
        let cleanedContent = content.replace(/<think>[\s\S]*?<\/think>/g, '');
        
        // Remove any leading/trailing whitespace
        cleanedContent = cleanedContent.trim();
        
        // Look for JSON object boundaries
        const jsonStart = cleanedContent.indexOf('{');
        const jsonEnd = cleanedContent.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonContent);
        }
        
        // If no JSON found, try to extract from markdown code blocks
        const codeBlockMatch = cleanedContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          return JSON.parse(codeBlockMatch[1]);
        }
        
        // If still no JSON, try to find any JSON-like structure
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('No valid JSON found in response');
      } catch (extractError) {
        console.error('Failed to extract JSON from response:', extractError);
        console.error('Original content:', content.substring(0, 500) + '...');
        
        // Return a fallback response
        return {
          error: 'Failed to parse response',
          originalContent: content.substring(0, 200),
          fallbackData: {
            marketSize: 'Data unavailable',
            cagr: 'Data unavailable',
            peakRevenue2030: 'Data unavailable',
            directCompetitors: 'Data unavailable'
          }
        };
      }
    }
  }

  private parseValidationResponse(content: string): any {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse validation response: ${error}`);
    }
  }

  private generateFieldValidationSummary(validationCycles: ValidationCycle[]): any {
    return {
      totalCycles: validationCycles.length,
      totalFieldsValidated: validationCycles.reduce((sum, cycle) => sum + cycle.totalFields, 0),
      averageScore: validationCycles.reduce((sum, cycle) => sum + cycle.overallScore, 0) / validationCycles.length,
      totalRegenerations: validationCycles.reduce((sum, cycle) => sum + cycle.fieldsRequiringRegeneration.length, 0)
    };
  }

  private calculateTotalSources(validationCycles: ValidationCycle[]): number {
    return validationCycles.reduce((sum, cycle) => sum + cycle.apiCallsMade, 0);
  }

  private calculateTotalSearchQueries(validationCycles: ValidationCycle[]): number {
    return validationCycles.reduce((sum, cycle) => sum + cycle.apiCallsMade * 3, 0); // Estimate 3 queries per call
  }

  private quickQualityAssessment(output: any): { score: number; message: string } {
    const schema = this.getCommercialSchema();
    const errors: string[] = [];

    function checkField(fieldName: string, value: any, schema: any) {
      if (schema.properties[fieldName]) {
        const fieldSchema = schema.properties[fieldName];
        if (fieldSchema.type === 'object') {
          for (const subField in fieldSchema.properties) {
            checkField(subField, value[fieldName]?.[subField], fieldSchema.properties[subField]);
          }
        } else if (fieldSchema.type === 'array') {
          if (Array.isArray(value[fieldName])) {
            value[fieldName].forEach((item: any) => {
              for (const subField in fieldSchema.items.properties) {
                checkField(subField, item[subField], fieldSchema.items.properties[subField]);
              }
            });
          } else {
            errors.push(`Field "${fieldName}" is not an array.`);
          }
        } else if (typeof value[fieldName] !== fieldSchema.type) {
          errors.push(`Field "${fieldName}" has incorrect type. Expected ${fieldSchema.type}, got ${typeof value[fieldName]}.`);
        }
      } else {
        errors.push(`Field "${fieldName}" not found in schema.`);
      }
    }

    for (const fieldName in output) {
      checkField(fieldName, output[fieldName], schema);
    }

    const score = 1 - (errors.length / 10); // Simple scoring: 10 errors -> 0.0, 0 errors -> 1.0
    return { score: Math.max(0, Math.min(1, score)), message: errors.join(', ') };
  }

  getConfiguration(): OptimizedConfig {
    return { ...this.config };
  }
}

export { OptimizedThreeLayerOrchestrator }; 