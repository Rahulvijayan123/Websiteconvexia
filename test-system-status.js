const fs = require('fs');

async function testSystemStatus() {
  console.log('🔍 Testing System Status');
  console.log('========================\n');

  // Test 1: Check if server is running
  console.log('1️⃣ Testing server connectivity...');
  try {
    const response = await fetch('http://localhost:3000/api/three-layer-perplexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: 'HER2',
        indication: 'HER2-Positive Breast Cancer',
        config: {
          maxValidationCycles: 2,
          qualityThreshold: 0.80,
          enableFieldLevelValidation: true,
          enableGPTLogicVerification: true,
          timeoutMs: 120000 // 2 minutes timeout
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Three-layer system is working!');
      console.log(`📊 Final quality score: ${result.finalQualityScore.toFixed(3)}`);
      console.log(`🔄 Total validation cycles: ${result.totalCycles}`);
      console.log(`⏱️ Total time: ${result.metadata.totalTimeMs}ms`);
      console.log(`🔧 Field regenerations: ${result.metadata.fieldRegenerations}`);
      
      // Check if output has expected structure
      if (result.data && typeof result.data === 'object') {
        console.log('✅ Output structure is valid');
        
        // Check for key fields
        const keyFields = ['cagr', 'marketSize', 'directCompetitors', 'peakRevenue2030'];
        const presentFields = keyFields.filter(field => 
          result.data[field] !== undefined && result.data[field] !== null
        );
        
        console.log(`📋 Key fields present: ${presentFields.length}/${keyFields.length}`);
        console.log(`📋 Present fields: ${presentFields.join(', ')}`);
      }
      
      // Check validation cycles
      if (result.validationCycles && Array.isArray(result.validationCycles)) {
        console.log(`🔄 Validation cycles completed: ${result.validationCycles.length}`);
        
        result.validationCycles.forEach((cycle, index) => {
          console.log(`  Cycle ${index + 1}: Score ${cycle.overallScore.toFixed(3)}, Fields regenerated: ${cycle.fieldsRequiringRegeneration.length}`);
        });
      }
      
    } else {
      console.log('❌ Three-layer system returned error:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Failed to connect to three-layer system:', error.message);
  }

  // Test 2: Check two-layer system
  console.log('\n2️⃣ Testing two-layer system...');
  try {
    const response = await fetch('http://localhost:3000/api/two-layer-perplexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: 'PD-L1',
        indication: 'Non-Small Cell Lung Cancer',
        config: {
          maxValidationCycles: 2,
          qualityThreshold: 0.80,
          timeoutMs: 120000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Two-layer system is working!');
      console.log(`📊 Final quality score: ${result.finalQualityScore.toFixed(3)}`);
      console.log(`🔄 Total validation cycles: ${result.totalCycles}`);
      console.log(`⏱️ Total time: ${result.metadata.totalTimeMs}ms`);
    } else {
      console.log('❌ Two-layer system returned error:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Failed to connect to two-layer system:', error.message);
  }

  // Test 3: Check original perplexity system
  console.log('\n3️⃣ Testing original perplexity system...');
  try {
    const response = await fetch('http://localhost:3000/api/perplexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: 'SOD1',
        indication: 'Amyotrophic Lateral Sclerosis'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Original perplexity system is working!');
      console.log(`📊 Output received successfully`);
      
      // Check if output has expected structure
      if (result.data && typeof result.data === 'object') {
        console.log('✅ Output structure is valid');
      }
    } else {
      console.log('❌ Original perplexity system returned error:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Failed to connect to original perplexity system:', error.message);
  }

  console.log('\n🎯 System Status Test Complete!');
}

// Run the test
if (require.main === module) {
  testSystemStatus().catch(console.error);
}

module.exports = { testSystemStatus }; 