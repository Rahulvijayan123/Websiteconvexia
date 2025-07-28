

async function quickTest() {
  console.log('🚀 Quick Three-Layer System Test');
  console.log('================================\n');

  try {
    console.log('Sending test request...');
    
    const response = await fetch('http://localhost:3000/api/three-layer-perplexity', {
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
          timeoutMs: 60000 // 1 minute timeout
        }
      })
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Success!');
      console.log(`Final quality score: ${result.finalQualityScore}`);
      console.log(`Total cycles: ${result.totalCycles}`);
      console.log(`Total time: ${result.metadata.totalTimeMs}ms`);
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

quickTest(); 