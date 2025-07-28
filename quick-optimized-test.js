async function quickOptimizedTest() {
  console.log('🚀 Quick Optimized Three-Layer System Test');
  console.log('==========================================\n');

  try {
    console.log('Sending test request to optimized system...');
    
    const response = await fetch('http://localhost:3000/api/optimized-three-layer-perplexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: 'HER2',
        indication: 'HER2-Positive Breast Cancer',
        config: {
          maxValidationCycles: 1,
          qualityThreshold: 0.70,
          enableFieldLevelValidation: true,
          enableGPTLogicVerification: true,
          enableCaching: true,
          validationStrictness: 'high',
          maxFieldRetries: 1,
          timeoutMs: 60000,
          rateLimitDelay: 1000,
          batchSize: 4,
          enableSmartValidation: true
        }
      })
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Optimized system is working!');
      console.log(`📊 Final quality score: ${result.finalQualityScore}`);
      console.log(`🔄 Total cycles: ${result.totalCycles}`);
      console.log(`⏱️ Total time: ${result.metadata.totalTimeMs}ms`);
      console.log(`📞 Total API calls: ${result.metadata.totalApiCalls}`);
      console.log(`🔧 Field regenerations: ${result.metadata.fieldRegenerations}`);
      
      if (result.metadata.costOptimization) {
        console.log(`💰 Cost optimization:`);
        console.log(`   API calls saved: ${result.metadata.costOptimization.apiCallsSaved}`);
        console.log(`   Cost reduction: ${result.metadata.costOptimization.estimatedCostReduction.toFixed(1)}%`);
        console.log(`   Efficiency score: ${result.metadata.costOptimization.efficiencyScore.toFixed(1)}%`);
      }
      
      // Check validation cycles
      if (result.validationCycles && Array.isArray(result.validationCycles)) {
        console.log(`🔄 Validation cycles: ${result.validationCycles.length}`);
        result.validationCycles.forEach((cycle, index) => {
          console.log(`  Cycle ${index + 1}: Score ${cycle.overallScore.toFixed(3)}, API calls: ${cycle.apiCallsMade}, Fields regenerated: ${cycle.fieldsRequiringRegeneration.length}`);
        });
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

quickOptimizedTest(); 