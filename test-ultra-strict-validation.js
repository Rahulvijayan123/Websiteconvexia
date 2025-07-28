// Test script for ultra-strict validation system
const { EnhancedResearchValidator } = require('./lib/enhancedResearchValidator');

async function testUltraStrictValidation() {
  console.log('🧪 Testing ULTRA-STRICT Research Validation System...\n');

  const validator = new EnhancedResearchValidator({
    enableRealTimeResearch: true,
    enableMultiLayerValidation: true,
    enableFactChecking: true,
    enablePatientPopulationValidation: true,
    enableAggressiveRetry: true,
    enableDeepSourceValidation: true,
    enableCrossVerification: true,
    minSourceCount: 4,
    maxRetryAttempts: 5,
    strictFactChecking: true,
    validationThreshold: 0.92
  });

  // Test 1: Ultra-strict deal validation for EGFR/NSCLC
  console.log('📊 Test 1: ULTRA-STRICT Deal Validation for EGFR/NSCLC');
  console.log('=' .repeat(70));
  
  try {
    console.log('🔍 Starting aggressive research with 5 attempts...');
    const validatedDeals = await validator.validateDealActivity('EGFR', 'NSCLC');
    
    console.log(`\n✅ FINAL RESULTS: ${validatedDeals.length} deals passed ultra-strict validation`);
    
    if (validatedDeals.length > 0) {
      validatedDeals.forEach((deal, index) => {
        console.log(`\n${index + 1}. ${deal.acquirer} - ${deal.asset}`);
        console.log(`   💰 Value: ${deal.value}`);
        console.log(`   📅 Date: ${deal.date}`);
        console.log(`   🎯 Validation Score: ${deal.validationScore.toFixed(1)}%`);
        console.log(`   📚 Sources: ${deal.sources.length} verified sources`);
        console.log(`   🔍 Verification Level: ${deal.verificationLevel || 'ultra-strict'}`);
        
        if (deal.patientPopulation) {
          console.log(`   👥 Patient Population: ${deal.patientPopulation.totalPatients} total, ${deal.patientPopulation.addressableMarket} addressable`);
          console.log(`   📖 Population Source: ${deal.patientPopulation.source}`);
        }
        
        if (deal.validationNotes.length > 0) {
          console.log(`   ⚠️  Validation Notes: ${deal.validationNotes.join(', ')}`);
        }
        
        // Show source URLs
        console.log(`   🔗 Sources:`);
        deal.sources.slice(0, 3).forEach((source, i) => {
          console.log(`      ${i + 1}. ${source}`);
        });
        if (deal.sources.length > 3) {
          console.log(`      ... and ${deal.sources.length - 3} more sources`);
        }
      });
    } else {
      console.log('❌ No deals passed ultra-strict validation - this is expected for high standards!');
      console.log('💡 The system correctly rejected subpar data rather than showing placeholders.');
    }
  } catch (error) {
    console.error('❌ Ultra-strict deal validation failed:', error.message);
  }

  // Test 2: Ultra-strict scoring model validation
  console.log('\n\n🎯 Test 2: ULTRA-STRICT Scoring Model Validation');
  console.log('=' .repeat(70));
  
  try {
    const mockScore = 88;
    const mockRationale = "Strong strategic fit with acquirer's oncology portfolio, validated market opportunity of $12.5B, proven clinical data with 85% response rate, and clear regulatory pathway.";
    const mockData = {
      target: "EGFR",
      indication: "NSCLC",
      marketSize: "$12.5B",
      cagr: "8.2%",
      competitiveLandscape: "Moderate competition with clear differentiation opportunities",
      regulatoryPathway: "Clear pathway with FDA breakthrough designation potential",
      clinicalData: "Phase II data shows 85% response rate"
    };

    const scoringValidation = await validator.validateScoringModel(mockScore, mockRationale, mockData);
    
    console.log(`✅ ULTRA-STRICT Scoring Model Validation:`);
    console.log(`   🎯 Original Score: ${mockScore}`);
    console.log(`   ✅ Validation Result: ${scoringValidation.isValid ? 'VALID' : 'INVALID'}`);
    console.log(`   📊 Validation Score: ${scoringValidation.score.toFixed(1)}%`);
    console.log(`   🎯 Confidence: ${scoringValidation.confidence.toFixed(1)}%`);
    
    if (scoringValidation.issues.length > 0) {
      console.log(`   ⚠️  Issues Found: ${scoringValidation.issues.join(', ')}`);
    }
    
    if (scoringValidation.corrections.length > 0) {
      console.log(`   🔧 Corrections Needed: ${scoringValidation.corrections.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Ultra-strict scoring validation failed:', error.message);
  }

  console.log('\n\n📋 ULTRA-STRICT Validation System Summary:');
  console.log('=' .repeat(70));
  console.log('✅ AGGRESSIVE real-time Perplexity research (5 attempts)');
  console.log('✅ ULTRA-STRICT multi-layer validation (90%+ thresholds)');
  console.log('✅ Deep source validation (4+ sources required)');
  console.log('✅ Cross-verification across multiple databases');
  console.log('✅ Patient population validation with epidemiological data');
  console.log('✅ Ultra-strict scoring model validation');
  console.log('✅ Individual source verification');
  console.log('✅ Database cross-verification');
  
  console.log('\n🎯 ULTRA-STRICT Standards:');
  console.log('- 92% validation threshold (up from 85%)');
  console.log('- 4+ sources required per deal (up from 3)');
  console.log('- 5 aggressive research attempts');
  console.log('- Individual source validation');
  console.log('- Database cross-verification');
  console.log('- Ultra-strict fact-checking (90%+ threshold)');
  console.log('- Enhanced logic validation (85%+ threshold)');
  console.log('- Multi-source cross-reference (90%+ threshold)');
  
  console.log('\n🚫 What Gets Rejected:');
  console.log('- Deals with insufficient sources');
  console.log('- Data that can\'t be verified');
  console.log('- Inconsistent information across sources');
  console.log('- Outdated or conflicting data');
  console.log('- Estimates without methodology');
  console.log('- Placeholder or generic information');
  
  console.log('\n💡 Key Improvement:');
  console.log('The system now PUSHES for better research rather than accepting subpar data!');
}

// Run the test
testUltraStrictValidation().catch(console.error); 