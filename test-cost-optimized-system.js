const { OptimizedThreeLayerOrchestrator } = require('./lib/optimizedThreeLayerOrchestrator');
const { globalCostTracker } = require('./lib/costTracker');

async function testCostOptimizedSystem() {
  console.log('🧪 Testing Cost-Optimized System');
  console.log('Target: $0.50-1.00 per run while maintaining quality\n');

  const orchestrator = new OptimizedThreeLayerOrchestrator({
    maxCostPerQuery: 1.0,
    maxValidationCycles: 1,
    qualityThreshold: 0.70,
    batchSize: 8,
    validationStrictness: 'medium'
  });

  const testInputs = {
    target: "PD-1 inhibitor for lung cancer",
    indication: "Non-small cell lung cancer (NSCLC)",
    therapeuticArea: "Oncology",
    geography: "United States",
    developmentPhase: "Phase 3"
  };

  try {
    console.log('🚀 Starting optimized orchestration...');
    const startTime = Date.now();
    
    const result = await orchestrator.orchestrate(testInputs);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n📊 Results:');
    console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
    console.log(`💰 Total Cost: $${result.metadata.costMetrics.totalCost.toFixed(4)}`);
    console.log(`🎯 Quality Score: ${result.finalQualityScore.toFixed(3)}`);
    console.log(`🔄 Validation Cycles: ${result.totalCycles}`);
    console.log(`📡 API Calls: ${result.metadata.totalApiCalls}`);
    console.log(`🔧 Field Regenerations: ${result.metadata.fieldRegenerations}`);
    
    console.log('\n📈 Cost Breakdown:');
    console.log(`   Input Tokens: ${result.metadata.costMetrics.inputTokens}`);
    console.log(`   Output Tokens: ${result.metadata.costMetrics.outputTokens}`);
    console.log(`   Model Used: ${result.metadata.costMetrics.model}`);
    
    console.log('\n🎯 Cost Optimization Metrics:');
    console.log(`   API Calls Saved: ${result.metadata.costOptimization.apiCallsSaved}`);
    console.log(`   Estimated Cost Reduction: ${result.metadata.costOptimization.estimatedCostReduction.toFixed(1)}%`);
    console.log(`   Efficiency Score: ${result.metadata.costOptimization.efficiencyScore.toFixed(1)}%`);
    
    // Quality assessment
    const hasRequiredFields = result.finalOutput && 
      result.finalOutput.marketSize && 
      result.finalOutput.peakRevenue2030 && 
      result.finalOutput.directCompetitors;
    
    console.log('\n✅ Quality Assessment:');
    console.log(`   Has Required Fields: ${hasRequiredFields ? '✅' : '❌'}`);
    console.log(`   Schema Compliance: ${result.finalQualityScore >= 0.7 ? '✅' : '❌'}`);
    console.log(`   Cost Target Met: ${result.metadata.costMetrics.totalCost <= 1.0 ? '✅' : '❌'}`);
    
    if (result.metadata.costMetrics.totalCost <= 1.0 && result.finalQualityScore >= 0.7) {
      console.log('\n🎉 SUCCESS: System optimized successfully!');
      console.log('   - Cost target met: ≤$1.00');
      console.log('   - Quality maintained: ≥0.7 score');
    } else {
      console.log('\n⚠️  OPTIMIZATION NEEDED:');
      if (result.metadata.costMetrics.totalCost > 1.0) {
        console.log(`   - Cost too high: $${result.metadata.costMetrics.totalCost.toFixed(4)} > $1.00`);
      }
      if (result.finalQualityScore < 0.7) {
        console.log(`   - Quality too low: ${result.finalQualityScore.toFixed(3)} < 0.7`);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testCostOptimizedSystem()
    .then(() => {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testCostOptimizedSystem }; 