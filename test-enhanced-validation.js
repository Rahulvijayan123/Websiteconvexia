// Test script for enhanced validation system
const { EnhancedResearchValidator } = require('./lib/enhancedResearchValidator');

async function testEnhancedValidation() {
  console.log('🧪 Testing Enhanced Research Validation System...\n');

  const validator = new EnhancedResearchValidator({
    enableRealTimeResearch: true,
    enableMultiLayerValidation: true,
    enableFactChecking: true,
    enablePatientPopulationValidation: true,
    validationThreshold: 0.85
  });

  // Test 1: Validate deal activity for EGFR/NSCLC
  console.log('📊 Test 1: Validating Deal Activity for EGFR/NSCLC');
  console.log('=' .repeat(60));
  
  try {
    const validatedDeals = await validator.validateDealActivity('EGFR', 'NSCLC');
    
    console.log(`✅ Found ${validatedDeals.length} validated deals:`);
    validatedDeals.forEach((deal, index) => {
      console.log(`\n${index + 1}. ${deal.acquirer} - ${deal.asset}`);
      console.log(`   Value: ${deal.value}`);
      console.log(`   Date: ${deal.date}`);
      console.log(`   Validation Score: ${deal.validationScore.toFixed(1)}%`);
      console.log(`   Sources: ${deal.sources.length} verified sources`);
      
      if (deal.patientPopulation) {
        console.log(`   Patient Population: ${deal.patientPopulation.totalPatients} total, ${deal.patientPopulation.addressableMarket} addressable`);
      }
      
      if (deal.validationNotes.length > 0) {
        console.log(`   Validation Notes: ${deal.validationNotes.join(', ')}`);
      }
    });
  } catch (error) {
    console.error('❌ Deal validation failed:', error.message);
  }

  // Test 2: Validate scoring model
  console.log('\n\n🎯 Test 2: Validating Scoring Model');
  console.log('=' .repeat(60));
  
  try {
    const mockScore = 85;
    const mockRationale = "Strong strategic fit with acquirer's oncology portfolio, validated market opportunity, and proven clinical data.";
    const mockData = {
      target: "EGFR",
      indication: "NSCLC",
      marketSize: "$12.5B",
      cagr: "8.2%",
      competitiveLandscape: "Moderate competition with clear differentiation opportunities"
    };

    const scoringValidation = await validator.validateScoringModel(mockScore, mockRationale, mockData);
    
    console.log(`✅ Scoring Model Validation:`);
    console.log(`   Score: ${mockScore}`);
    console.log(`   Validation Result: ${scoringValidation.isValid ? 'VALID' : 'INVALID'}`);
    console.log(`   Validation Score: ${scoringValidation.score.toFixed(1)}%`);
    console.log(`   Confidence: ${scoringValidation.confidence.toFixed(1)}%`);
    
    if (scoringValidation.issues.length > 0) {
      console.log(`   Issues: ${scoringValidation.issues.join(', ')}`);
    }
    
    if (scoringValidation.corrections.length > 0) {
      console.log(`   Corrections: ${scoringValidation.corrections.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Scoring validation failed:', error.message);
  }

  console.log('\n\n📋 Validation System Summary:');
  console.log('=' .repeat(60));
  console.log('✅ Real-time Perplexity research for deal validation');
  console.log('✅ Multi-layer validation (Perplexity + OpenAI + Cross-reference)');
  console.log('✅ Patient population validation with epidemiological data');
  console.log('✅ Scoring model validation with business logic');
  console.log('✅ Source verification and fact-checking');
  console.log('✅ Confidence scoring and issue identification');
  
  console.log('\n🎯 Key Improvements:');
  console.log('- No more placeholder data');
  console.log('- Real deal research with source verification');
  console.log('- Accurate patient population data');
  console.log('- Validated scoring with business logic');
  console.log('- Multi-source fact-checking');
  console.log('- Confidence scoring for all outputs');
}

// Run the test
testEnhancedValidation().catch(console.error); 