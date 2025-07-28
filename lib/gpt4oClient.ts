import { globalCostTracker } from './costTracker';

interface GPT4oOptions {
  model: string;
  messages: any[];
  max_tokens?: number;
  temperature?: number;
}

export async function fetchGPT4o(options: GPT4oOptions) {
  // Estimate cost before making the call
  const inputText = JSON.stringify(options.messages);
  const estimatedInputTokens = Math.ceil(inputText.length / 4); // Back to original estimate
  const estimatedOutputTokens = options.max_tokens || 2000; // Back to original default
  
  // Check if we can afford this call
  if (!globalCostTracker.canAffordCall(options.model, estimatedInputTokens, estimatedOutputTokens)) {
    console.log(`💰 Cost limit reached, cannot afford GPT-4o call: $${globalCostTracker.getCurrentMetrics().totalCost.toFixed(4)}`);
    return {
      choices: [{
        message: {
          content: JSON.stringify({
            costLimitReached: true,
            currentCost: globalCostTracker.getCurrentMetrics().totalCost,
            remainingBudget: globalCostTracker.getRemainingBudget(),
            message: 'Cost limit reached, skipping GPT-4o processing'
          })
        }
      }],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0
      }
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        max_tokens: options.max_tokens || 2000,
        temperature: options.temperature || 0.1
        // Removed response_format as it's not supported the same way for GPT-4o
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    
    // Record the actual cost
    const actualInputTokens = result.usage?.prompt_tokens || estimatedInputTokens;
    const actualOutputTokens = result.usage?.completion_tokens || estimatedOutputTokens;
    globalCostTracker.recordApiCall(options.model, actualInputTokens, actualOutputTokens);
    
    return result;
    
  } catch (error: any) {
    console.error('GPT-4o API call failed:', error.message);
    throw error;
  }
}

// Logic validation function
export async function validateLogic(data: any, inputs: any): Promise<any> {
  const prompt = `You are a senior pharmaceutical industry expert conducting logic validation.

Analyze the following commercial intelligence data for logical consistency and accuracy:

INPUTS:
${JSON.stringify(inputs, null, 2)}

DATA TO VALIDATE:
${JSON.stringify(data, null, 2)}

Validate the following aspects:
1. Cross-field consistency (e.g., peak revenue should align with market size and share)
2. Mathematical accuracy (CAGR calculations, patient calculations)
3. Logical coherence (pricing vs competitors, market share vs pipeline density)
4. Source credibility and recency
5. Industry benchmark alignment

Return a JSON object with:
- overallLogicScore: number (0-1)
- logicIssues: array of strings
- logicCorrections: array of strings
- validatedFields: array of field names that passed validation
- confidenceLevel: number (0-1)

IMPORTANT: Return ONLY valid JSON, no other text.`;

  const response = await fetchGPT4o({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a logic validation expert. Be thorough and analytical. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1500, // Back to original
    temperature: 0.1
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse logic validation response:', error);
    return {
      overallLogicScore: 0.5,
      logicIssues: ['Failed to parse validation response'],
      logicCorrections: [],
      validatedFields: [],
      confidenceLevel: 0.0
    };
  }
}

// Math validation function
export async function validateMath(data: any): Promise<any> {
  const prompt = `You are a mathematical validation expert for pharmaceutical commercial intelligence.

Analyze the following data for mathematical accuracy:

${JSON.stringify(data, null, 2)}

Check these calculations:
1. CAGR = (Peak Revenue / Current Market Size)^(1/years_to_peak) - 1
2. Peak Patients = (Peak Revenue / Avg Selling Price) × Persistence Rate
3. Total 10-Year Revenue should be 5-8x peak revenue
4. Market share percentages should sum logically
5. Pricing consistency with competitors

Return a JSON object with:
- mathScore: number (0-1)
- mathErrors: array of strings
- mathCorrections: array of strings
- validatedCalculations: array of calculation names
- confidenceLevel: number (0-1)

IMPORTANT: Return ONLY valid JSON, no other text.`;

  const response = await fetchGPT4o({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a mathematical validation expert. Check all calculations thoroughly. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1000, // Back to original
    temperature: 0.1
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse math validation response:', error);
    return {
      mathScore: 0.5,
      mathErrors: ['Failed to parse validation response'],
      mathCorrections: [],
      validatedCalculations: [],
      confidenceLevel: 0.0
    };
  }
}

// Enhanced writing with rationales
export async function enhanceOutputWithRationales(data: any, inputs: any): Promise<any> {
  const prompt = `You are a senior pharmaceutical industry expert. Enhance the following commercial intelligence data with clear rationales and calculation explanations.

INPUTS:
${JSON.stringify(inputs, null, 2)}

CURRENT DATA:
${JSON.stringify(data, null, 2)}

For each field, add a detailed rationale explaining:

1. **For Math/Calculated Fields** (CAGR, Peak Revenue, Total Revenue, etc.):
   - Show the exact calculation formula used
   - Include the specific numbers plugged into the formula
   - Example: "CAGR = (Peak Revenue / Current Market Size)^(1/years) - 1 = ($4.2B / $2.1B)^(1/6) - 1 = 12.3%"

2. **For Geographic Split**:
   - Use real research data from sources like IQVIA, EvaluatePharma, or regional market reports
   - Reference specific sources and data points
   - Don't use placeholder values - find actual regional distribution data

3. **For Treatment Duration**:
   - Reference actual clinical trial data, prescribing information, or real-world evidence
   - Include specific sources and studies
   - Don't use generic placeholder values

4. **For PRV/Eligibility**:
   - Reference specific sources like OBBBA, FDA guidance, or regulatory documents
   - Include actual eligibility criteria and requirements
   - Cite specific regulatory pathways or designations

5. **For All Other Fields**:
   - How the number was calculated or derived
   - What sources or logic were used
   - Why this value is reasonable given the market context

Enhance the data structure to include rationales while maintaining the original format. Each field should have a "rationale" property.

Example format:
{
  "marketSize": "1.2B",
  "marketSize_rationale": "Based on EvaluatePharma 2024 NSCLC market report ($1.1B) plus 9% growth projection = $1.2B",
  "cagr": "12.3%",
  "cagr_rationale": "CAGR = (Peak Revenue / Current Market Size)^(1/years) - 1 = ($4.2B / $2.1B)^(1/6) - 1 = 12.3%",
  "geographicSplit": {"US": "65%", "EU": "25%", "ROW": "10%"},
  "geographicSplit_rationale": "Based on IQVIA 2024 regional sales data: US dominates with 65% market share, EU follows with 25%, ROW represents 10%",
  "treatmentDuration": "12 months",
  "treatmentDuration_rationale": "Based on KEYNOTE-024 trial data showing median treatment duration of 12.3 months for pembrolizumab in NSCLC"
}

Return the enhanced data with detailed rationales for all fields.

IMPORTANT: Return ONLY valid JSON, no other text. Use real research data and specific calculations.`;

  const response = await fetchGPT4o({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a pharmaceutical industry expert. Add clear, concise rationales for all data points. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 3000, // Back to original
    temperature: 0.1
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse rationale enhancement response:', error);
    // Return original data if parsing fails
    return data;
  }
}

// Final quality enhancement
export async function finalQualityEnhancement(data: any, logicValidation: any, mathValidation: any): Promise<any> {
  const prompt = `You are a final quality assurance expert. Review and enhance the commercial intelligence data based on validation results.

ORIGINAL DATA:
${JSON.stringify(data, null, 2)}

LOGIC VALIDATION RESULTS:
${JSON.stringify(logicValidation, null, 2)}

MATH VALIDATION RESULTS:
${JSON.stringify(mathValidation, null, 2)}

Based on the validation results:
1. Fix any identified logic or math errors
2. Ensure all calculation explanations in rationales are accurate and complete
3. Verify that geographic split and treatment duration use real research data (not placeholders)
4. Ensure PRV/eligibility references specific regulatory sources (OBBBA, FDA guidance, etc.)
5. Maintain all detailed calculation formulas in rationales
6. Ensure all cross-field relationships are consistent
7. Add any missing critical information with proper sourcing
8. Maintain the original data structure with enhanced quality

IMPORTANT REQUIREMENTS:
- Keep all calculation explanations (e.g., "CAGR = (Peak Revenue / Current Market Size)^(1/years) - 1 = ($4.2B / $2.1B)^(1/6) - 1 = 12.3%")
- Ensure geographic split references real regional data sources
- Ensure treatment duration references actual clinical trial data
- Ensure PRV/eligibility references specific regulatory documents
- Use real research data throughout, not placeholder values

Return the final enhanced data with all corrections applied and rationales included.

IMPORTANT: Return ONLY valid JSON, no other text.`;

  const response = await fetchGPT4o({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a final quality assurance expert. Apply all corrections and enhancements. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 4000, // Back to original
    temperature: 0.1
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse final enhancement response:', error);
    // Return original data if parsing fails
    return data;
  }
} 