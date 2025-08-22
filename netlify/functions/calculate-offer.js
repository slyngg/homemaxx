const fetch = require('node-fetch');

// Market data and pricing constants
const MARKET_MULTIPLIERS = {
  'NV': { hot: 1.15, normal: 1.0, slow: 0.85, assignmentBase: 15000 },
  'TX': { hot: 1.12, normal: 1.0, slow: 0.88, assignmentBase: 12000 },
  'GA': { hot: 1.10, normal: 1.0, slow: 0.90, assignmentBase: 10000 },
  'FL': { hot: 1.18, normal: 1.0, slow: 0.82, assignmentBase: 18000 },
  'CA': { hot: 1.25, normal: 1.0, slow: 0.75, assignmentBase: 25000 },
  'AZ': { hot: 1.14, normal: 1.0, slow: 0.86, assignmentBase: 13000 }
};

const CONDITION_MULTIPLIERS = {
  'high-end': 0.95,      // 5% discount for high-end (less work needed)
  'standard': 0.90,      // 10% discount for standard
  'dated': 0.80,         // 20% discount for dated
  'fixer-upper': 0.65    // 35% discount for fixer-upper
};

const TIMELINE_URGENCY = {
  'asap': { multiplier: 0.85, priority: 100 },        // 15% discount for speed
  '2-4-weeks': { multiplier: 0.88, priority: 90 },   // 12% discount
  '4-6-weeks': { multiplier: 0.92, priority: 70 },   // 8% discount
  '6-weeks-plus': { multiplier: 0.95, priority: 50 }, // 5% discount
  'just-browsing': { multiplier: 0.98, priority: 20 } // 2% discount
};

const SYSTEM_CONFIG = {
  mode: process.env.OFFER_CALCULATION_MODE || 'manual', // 'manual' or 'automated'
  requireDataProviders: process.env.REQUIRE_DATA_PROVIDERS === 'true',
  fallbackToManual: true // Always allow manual override
};

const REAL_ESTATE_APIS = {
  rentspree: {
    baseUrl: 'https://api.rentspree.com/v1',
    apiKey: process.env.RENTSPREE_API_KEY,
    enabled: !!process.env.RENTSPREE_API_KEY
  },
  attom: {
    baseUrl: 'https://api.gateway.attomdata.com/propertyapi/v1.0.0',
    apiKey: process.env.ATTOM_API_KEY,
    enabled: !!process.env.ATTOM_API_KEY
  },
  realtyMole: {
    baseUrl: 'https://realty-mole-property-api.p.rapidapi.com',
    apiKey: process.env.REALTY_MOLE_API_KEY,
    enabled: !!process.env.REALTY_MOLE_API_KEY
  }
};

const INVESTMENT_CRITERIA = {
  targetPriceRatio: 0.60,
  minimumProfitMargin: 0.25,
  maxDaysOnMarket: 90,
  minComparableSales: 3,
  comparableRadius: 0.5,
  comparableTimeframe: 90,
  
  hotMarketDays: 30,
  normalMarketDays: 60,
  slowMarketDays: 90,
  
  conditionMultipliers: {
    'excellent': 0.95,
    'good': 0.85,
    'fair': 0.70,
    'poor': 0.55,
    'distressed': 0.45
  }
};

const OFFER_TEMPLATES = {
  'distressed-seller': {
    targetRatio: 0.55,
    description: 'Motivated seller, quick close needed',
    assignmentFeeMultiplier: 1.2
  },
  'standard-wholesale': {
    targetRatio: 0.60,
    description: 'Standard wholesale deal',
    assignmentFeeMultiplier: 1.0
  },
  'premium-property': {
    targetRatio: 0.65,
    description: 'High-end property, competitive market',
    assignmentFeeMultiplier: 1.5
  },
  'fix-and-flip': {
    targetRatio: 0.50,
    description: 'Heavy rehab required',
    assignmentFeeMultiplier: 0.8
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const propertyData = JSON.parse(event.body);
    
    // Determine calculation method
    const calculationMethod = determineCalculationMethod(propertyData);
    
    let offerAnalysis;
    
    if (calculationMethod === 'manual' || propertyData.manualOffer) {
      // Use manual offer system
      offerAnalysis = await processManualOffer(propertyData);
    } else if (calculationMethod === 'automated' && hasRequiredDataProviders()) {
      // Use automated system with real data
      offerAnalysis = await performAutomatedAnalysis(propertyData);
    } else {
      // Fallback to estimated analysis without external APIs
      offerAnalysis = await performEstimatedAnalysis(propertyData);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        calculationMethod,
        ...offerAnalysis
      })
    };

  } catch (error) {
    console.error('Offer calculation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to calculate offer',
        details: error.message 
      })
    };
  }
};

function determineCalculationMethod(propertyData) {
  // Check if manual offer is provided
  if (propertyData.manualOffer) {
    return 'manual';
  }
  
  // Check system configuration
  if (SYSTEM_CONFIG.mode === 'manual') {
    return 'manual';
  }
  
  // Check if automated mode is possible
  if (SYSTEM_CONFIG.mode === 'automated' && hasRequiredDataProviders()) {
    return 'automated';
  }
  
  // Default to estimated analysis
  return 'estimated';
}

function hasRequiredDataProviders() {
  return REAL_ESTATE_APIS.attom.enabled || REAL_ESTATE_APIS.rentspree.enabled;
}

async function processManualOffer(propertyData) {
  console.log('Processing manual offer input...');
  
  const {
    manualOffer,
    marketValue,
    offerTemplate,
    teamMemberNotes,
    approvedBy
  } = propertyData;
  
  // Use provided manual data or calculate from template
  let calculatedOffer;
  let assignmentFeeAnalysis;
  
  if (manualOffer && marketValue) {
    // Direct manual input
    calculatedOffer = {
      primary: manualOffer,
      range: {
        min: Math.round(manualOffer * 0.95),
        max: Math.round(manualOffer * 1.05)
      },
      actualRatio: Math.round((manualOffer / marketValue) * 100) / 100,
      methodology: 'Manual Input by Team Member'
    };
    
    assignmentFeeAnalysis = calculateAssignmentFeeFromSpread(
      { estimated: marketValue }, 
      calculatedOffer
    );
  } else if (offerTemplate && marketValue) {
    // Template-based calculation
    const template = OFFER_TEMPLATES[offerTemplate];
    if (!template) {
      throw new Error(`Unknown offer template: ${offerTemplate}`);
    }
    
    const offerAmount = Math.round(marketValue * template.targetRatio);
    
    calculatedOffer = {
      primary: offerAmount,
      range: {
        min: Math.round(offerAmount * 0.95),
        max: Math.round(offerAmount * 1.05)
      },
      actualRatio: template.targetRatio,
      template: offerTemplate,
      methodology: `Template: ${template.description}`
    };
    
    assignmentFeeAnalysis = calculateAssignmentFeeFromSpread(
      { estimated: marketValue }, 
      calculatedOffer
    );
    assignmentFeeAnalysis.projectedFee *= template.assignmentFeeMultiplier;
  } else {
    throw new Error('Manual offer requires either direct offer amount or template with market value');
  }
  
  // Calculate qualification score based on manual input
  const qualificationScore = calculateManualQualificationScore(
    marketValue, calculatedOffer, assignmentFeeAnalysis, propertyData
  );
  
  // Calculate lead priority score
  const leadPriorityScore = calculateLeadPriorityScore(propertyData, marketValue, calculatedOffer);
  
  return {
    marketValue: { estimated: marketValue, methodology: 'Manual Input' },
    cashOfferRange: calculatedOffer,
    assignmentFeeProjection: assignmentFeeAnalysis,
    qualificationScore: qualificationScore.total,
    bonusEligible: qualificationScore.total >= 70,
    leadPriorityScore,
    marketInsights: generateManualInsights(propertyData),
    nextSteps: generateNextSteps(qualificationScore.total >= 70, assignmentFeeAnalysis),
    manualOverride: true,
    teamMemberNotes: teamMemberNotes || '',
    approvedBy: approvedBy || 'System',
    calculationTimestamp: new Date().toISOString()
  };
}

async function performEstimatedAnalysis(propertyData) {
  console.log('Performing estimated analysis without external APIs...');
  
  // Use simplified estimation without external data providers
  const estimatedMarketValue = estimateMarketValueBasic(propertyData);
  const conditionAssessment = assessPropertyConditionBasic(propertyData);
  const marketAnalysis = assessMarketBasic(propertyData);
  
  const hedgeFundOffer = calculateHedgeFundOfferBasic(
    estimatedMarketValue, conditionAssessment, marketAnalysis
  );
  
  const assignmentFeeAnalysis = calculateAssignmentFeeFromSpread(
    estimatedMarketValue, hedgeFundOffer
  );
  
  const qualificationScore = calculateBasicQualificationScore(
    estimatedMarketValue, hedgeFundOffer, assignmentFeeAnalysis, propertyData
  );
  
  // Calculate lead priority score
  const leadPriorityScore = calculateLeadPriorityScore(propertyData, estimatedMarketValue, hedgeFundOffer);
  
  return {
    marketValue: estimatedMarketValue,
    cashOfferRange: hedgeFundOffer,
    assignmentFeeProjection: assignmentFeeAnalysis,
    qualificationScore: qualificationScore.total,
    bonusEligible: qualificationScore.total >= 70,
    leadPriorityScore,
    marketInsights: generateBasicInsights(marketAnalysis),
    nextSteps: generateNextSteps(qualificationScore.total >= 70, assignmentFeeAnalysis),
    methodology: 'Estimated Analysis (No External APIs)',
    disclaimer: 'Estimates based on general market data. Manual review recommended.'
  };
}

async function performAutomatedAnalysis(propertyData) {
  // This would be the full automated system when data providers are available
  console.log('Performing automated analysis with external APIs...');
  
  // For now, fall back to estimated analysis
  // In the future, this would call the full hedge fund analysis
  return await performEstimatedAnalysis(propertyData);
}

// Simplified estimation functions for non-API mode
function estimateMarketValueBasic(propertyData) {
  const { address, bedrooms = 3, bathrooms = 2, sqft = 2000, yearBuilt = 2000 } = propertyData;
  
  // Basic price per sqft by state
  const statePrices = {
    'CA': 400, 'FL': 180, 'NV': 200, 'TX': 150, 'AZ': 170, 'GA': 140, 'NM': 130,
    'OR': 250, 'WA': 300, 'UT': 200
  };
  
  const state = address?.state || 'TX';
  const pricePerSqft = statePrices[state] || 160;
  
  let baseValue = sqft * pricePerSqft;
  
  // Adjust for features
  baseValue += (bedrooms - 3) * 15000;
  baseValue += (bathrooms - 2) * 8000;
  
  // Age adjustment
  const currentYear = new Date().getFullYear();
  const age = currentYear - yearBuilt;
  if (age < 10) baseValue *= 1.1;
  else if (age > 30) baseValue *= 0.9;
  
  return {
    estimated: Math.round(baseValue),
    confidence: 0.7,
    methodology: 'Basic Market Estimation',
    pricePerSqft
  };
}

function assessPropertyConditionBasic(propertyData) {
  const kitchenQuality = propertyData.kitchenQuality || 'standard';
  const propertyIssues = propertyData.propertyIssues || [];
  
  let totalRepairCosts = 8000; // Base cosmetic
  
  // Kitchen repairs
  const kitchenCosts = {
    'high-end': 2500,
    'standard': 11500,
    'dated': 20000,
    'fixer-upper': 35000
  };
  
  totalRepairCosts += kitchenCosts[kitchenQuality] || 11500;
  
  // Structural issues
  if (propertyIssues.includes('foundation-issues')) totalRepairCosts += 32500;
  if (propertyIssues.includes('roof-issues')) totalRepairCosts += 16500;
  if (propertyIssues.includes('fire-damage')) totalRepairCosts += 40000;
  
  return {
    totalRepairCosts: Math.round(totalRepairCosts),
    overallCondition: propertyIssues.length > 2 ? 'poor' : 'fair'
  };
}

function assessMarketBasic(propertyData) {
  const state = propertyData.address?.state || 'TX';
  const hotMarkets = ['CA', 'FL', 'NV', 'WA'];
  const normalMarkets = ['TX', 'AZ', 'OR'];
  
  let condition = 'slow';
  if (hotMarkets.includes(state)) condition = 'hot';
  else if (normalMarkets.includes(state)) condition = 'normal';
  
  return {
    condition,
    avgDaysOnMarket: condition === 'hot' ? 25 : condition === 'normal' ? 45 : 65
  };
}

function calculateHedgeFundOfferBasic(marketValue, conditionAssessment, marketAnalysis) {
  const { estimated: marketVal } = marketValue;
  const { totalRepairCosts } = conditionAssessment;
  
  // Start with 60% target
  let baseOffer = marketVal * INVESTMENT_CRITERIA.targetPriceRatio;
  
  // Subtract costs
  baseOffer -= totalRepairCosts;
  baseOffer -= marketVal * 0.015; // Carrying costs
  baseOffer -= marketVal * 0.025; // Transaction costs
  
  // Market adjustment
  if (marketAnalysis.condition === 'slow') baseOffer *= 0.95;
  else if (marketAnalysis.condition === 'hot') baseOffer *= 1.02;
  
  const actualRatio = baseOffer / marketVal;
  
  return {
    primary: Math.round(baseOffer),
    range: {
      min: Math.round(baseOffer * 0.95),
      max: Math.round(baseOffer * 1.05)
    },
    actualRatio: Math.round(actualRatio * 100) / 100,
    targetRatio: INVESTMENT_CRITERIA.targetPriceRatio,
    methodology: 'Basic Hedge Fund Calculation'
  };
}

function calculateManualQualificationScore(marketValue, offer, assignmentFee, propertyData) {
  let score = 0;
  const factors = [];
  
  // Assignment fee potential (40%)
  if (assignmentFee.projectedFee >= 40000) {
    score += 40;
    factors.push('Exceptional assignment fee potential ($40k+)');
  } else if (assignmentFee.projectedFee >= 25000) {
    score += 30;
    factors.push('Strong assignment fee potential ($25k+)');
  } else if (assignmentFee.projectedFee >= 15000) {
    score += 20;
    factors.push('Good assignment fee potential ($15k+)');
  } else {
    score += 10;
    factors.push('Limited assignment fee potential');
  }
  
  // Profit margin (30%)
  const profitMargin = (marketValue - offer.primary) / marketValue;
  if (profitMargin >= 0.40) {
    score += 30;
    factors.push('Excellent profit margin (40%+)');
  } else if (profitMargin >= 0.30) {
    score += 25;
    factors.push('Good profit margin (30%+)');
  } else if (profitMargin >= 0.25) {
    score += 20;
    factors.push('Acceptable profit margin (25%+)');
  } else {
    score += 10;
    factors.push('Marginal profit margin');
  }
  
  // Manual review bonus (30%)
  score += 30;
  factors.push('Manual review and approval by team');
  
  return {
    total: Math.min(score, 100),
    factors,
    tier: score >= 80 ? 'Premium Deal' : score >= 70 ? 'Good Deal' : 'Review Required'
  };
}

function calculateBasicQualificationScore(marketValue, offer, assignmentFee, propertyData) {
  let score = 0;
  const factors = [];
  
  // Assignment fee (40%)
  if (assignmentFee.projectedFee >= 25000) {
    score += 35;
    factors.push('Strong assignment potential');
  } else if (assignmentFee.projectedFee >= 15000) {
    score += 25;
    factors.push('Good assignment potential');
  } else {
    score += 15;
    factors.push('Limited assignment potential');
  }
  
  // Profit margin (35%)
  const profitMargin = (marketValue.estimated - offer.primary) / marketValue.estimated;
  if (profitMargin >= 0.35) {
    score += 30;
    factors.push('Strong profit margin');
  } else if (profitMargin >= 0.25) {
    score += 25;
    factors.push('Good profit margin');
  } else {
    score += 15;
    factors.push('Acceptable profit margin');
  }
  
  // Property condition (25%)
  const hasIssues = propertyData.propertyIssues?.length > 0;
  if (!hasIssues) {
    score += 25;
    factors.push('No major issues reported');
  } else if (propertyData.propertyIssues?.length <= 2) {
    score += 20;
    factors.push('Minor issues only');
  } else {
    score += 10;
    factors.push('Multiple property issues');
  }
  
  return {
    total: Math.min(score, 100),
    factors,
    tier: score >= 70 ? 'Qualified' : 'Review Required'
  };
}

// Keep existing helper functions
function calculateAssignmentFeeFromSpread(marketValue, hedgeFundOffer) {
  const spread = marketValue.estimated - hedgeFundOffer.primary;
  const projectedFee = spread * 0.30;
  
  let tier;
  if (projectedFee >= 40000) tier = 'premium';
  else if (projectedFee >= 25000) tier = 'high';
  else if (projectedFee >= 15000) tier = 'standard';
  else tier = 'basic';
  
  return {
    projectedFee: Math.round(projectedFee),
    range: {
      conservative: Math.round(spread * 0.25),
      aggressive: Math.round(spread * 0.40)
    },
    tier,
    spreadAnalysis: {
      totalSpread: spread,
      assignmentPercentage: 30,
      marketValue: marketValue.estimated,
      ourOffer: hedgeFundOffer.primary
    }
  };
}

function generateManualInsights(propertyData) {
  return [
    {
      icon: '👥',
      title: 'Manual Review',
      description: 'Offer calculated and approved by team member'
    },
    {
      icon: '💰',
      title: 'Custom Analysis',
      description: 'Tailored offer based on specific property factors'
    },
    {
      icon: '⚡',
      title: 'Quick Decision',
      description: 'No waiting for automated data processing'
    }
  ];
}

function generateBasicInsights(marketAnalysis) {
  return [
    {
      icon: '📊',
      title: `${marketAnalysis.condition.toUpperCase()} Market`,
      description: `Estimated ${marketAnalysis.avgDaysOnMarket} days average sale time`
    },
    {
      icon: '🏠',
      title: 'Basic Analysis',
      description: 'Calculated using general market data'
    },
    {
      icon: '⚠️',
      title: 'Manual Review Recommended',
      description: 'Consider detailed comp analysis for final offer'
    }
  ];
}

function generateNextSteps(qualifies, assignmentFeeAnalysis) {
  if (qualifies) {
    return {
      immediate: 'Schedule property walkthrough and due diligence',
      preparation: 'Prepare proof of funds and purchase agreement',
      timeline: 'Close in 7-14 days with cash offer'
    };
  } else {
    return {
      immediate: 'Manual review required - contact team lead',
      preparation: 'Gather additional property information',
      timeline: 'Review and revise offer within 24 hours'
    };
  }
}

async function calculateOfferAnalysis(propertyData) {
  // Step 1: Estimate market value
  const marketValue = await estimateMarketValue(propertyData);
  
  // Step 2: Calculate assignment fee potential
  const assignmentFeeAnalysis = calculateAssignmentFeePotential(propertyData, marketValue);
  
  // Step 3: Determine cash offer range
  const cashOfferRange = calculateCashOfferRange(propertyData, marketValue);
  
  // Step 4: Calculate qualification score with assignment fee weighting
  const qualificationScore = calculateEnhancedQualificationScore(propertyData, assignmentFeeAnalysis);
  
  // Step 5: Determine bonus eligibility
  const bonusEligibility = determineBonusEligibility(qualificationScore, assignmentFeeAnalysis);

  // Step 6: Calculate lead priority score for internal use
  const leadPriorityScore = calculateLeadPriorityScore(propertyData, marketValue, cashOfferRange);

  return {
    marketValue,
    assignmentFeeAnalysis,
    cashOfferRange,
    qualificationScore,
    bonusEligibility,
    leadPriorityScore, // NEW: Add priority scoring
    propertyInsights: generatePropertyInsights(propertyData, marketValue),
    nextSteps: generateNextSteps(bonusEligibility, assignmentFeeAnalysis)
  };
}

function calculateLeadPriorityScore(propertyData, marketValue, cashOfferRange) {
  try {
    // Calculate wholesale margin based on your boss's example
    const sellerPrice = cashOfferRange.primary;
    const novationPrice = Math.round(marketValue.estimated * 0.80); // 80% of market value for wholesale
    const wholesaleMargin = novationPrice - sellerPrice;
    const marginPercentage = (wholesaleMargin / sellerPrice) * 100;
    
    let score = 0;
    let recommendations = [];
    
    // 1. WHOLESALE MARGIN SCORING (40% weight - most important per your boss)
    let marginScore = 0;
    if (marginPercentage >= 100) { // 100%+ margin like $70K on $50K
      marginScore = 40;
      recommendations.push("🔥 ULTRA HIGH MARGIN - Priority 1 lead!");
    } else if (marginPercentage >= 50) {
      marginScore = 35;
      recommendations.push("🚀 Excellent margin - High priority");
    } else if (marginPercentage >= 25) {
      marginScore = 25;
      recommendations.push("💰 Good margin - Medium priority");
    } else if (marginPercentage >= 15) {
      marginScore = 15;
      recommendations.push("✅ Acceptable margin - Standard priority");
    } else {
      marginScore = 5;
      recommendations.push("⚠️ Low margin - Consider passing");
    }
    score += marginScore;
    
    // 2. DEAL SIZE SCORING (15% weight)
    let dealSizeScore = 0;
    if (wholesaleMargin >= 50000) dealSizeScore = 15;
    else if (wholesaleMargin >= 25000) dealSizeScore = 12;
    else if (wholesaleMargin >= 10000) dealSizeScore = 8;
    else dealSizeScore = 3;
    score += dealSizeScore;
    
    // 3. TIMELINE URGENCY (15% weight)
    let timelineScore = 0;
    const timelineData = TIMELINE_URGENCY[propertyData.timeline] || TIMELINE_URGENCY['4-6-weeks'];
    if (timelineData.priority >= 90) timelineScore = 15;
    else if (timelineData.priority >= 70) timelineScore = 10;
    else timelineScore = 5;
    score += timelineScore;
    
    // 4. CASH OFFER CLAIMED BONUS (10% weight)
    let cashOfferScore = 0;
    if (propertyData.cashOfferClaimed) {
      cashOfferScore = 10;
      recommendations.push("💸 Cash offer claimed - Highly motivated seller");
    }
    score += cashOfferScore;
    
    // 5. PROPERTY CONDITION (10% weight)
    let conditionScore = 0;
    const conditionMultiplier = CONDITION_MULTIPLIERS[propertyData.kitchenQuality] || 0.90;
    if (conditionMultiplier <= 0.80) conditionScore = 10; // Needs work = better for wholesale
    else if (conditionMultiplier <= 0.90) conditionScore = 8;
    else conditionScore = 5;
    score += conditionScore;
    
    // 6. LOCATION/MARKET (10% weight)
    let locationScore = 0;
    const state = propertyData.address?.state;
    if (['NV', 'CA', 'FL', 'AZ', 'TX'].includes(state)) locationScore = 10;
    else locationScore = 5;
    score += locationScore;
    
    // Determine priority level
    let level = '';
    let color = '';
    
    if (score >= 80) {
      level = 'ULTRA HOT 🔥🔥🔥';
      color = '#ff0000';
      recommendations.unshift("🚨 CALL IMMEDIATELY - Exceptional deal!");
    } else if (score >= 65) {
      level = 'HOT 🔥🔥';
      color = '#ff6600';
      recommendations.unshift("📞 Call within 1 hour - High priority");
    } else if (score >= 50) {
      level = 'WARM 🔥';
      color = '#ff9900';
      recommendations.unshift("📱 Call within 4 hours - Good opportunity");
    } else if (score >= 35) {
      level = 'LUKEWARM';
      color = '#ffcc00';
      recommendations.unshift("📧 Follow up within 24 hours");
    } else {
      level = 'COLD';
      color = '#cccccc';
      recommendations.unshift("🗂️ Add to nurture sequence");
    }

    return {
      score: Math.round(score),
      level,
      color,
      recommendations,
      wholesaleMargin: `$${wholesaleMargin.toLocaleString()}`,
      marginPercentage: `${marginPercentage.toFixed(1)}%`,
      breakdown: {
        marginScore,
        dealSizeScore,
        timelineScore,
        cashOfferScore,
        conditionScore,
        locationScore
      }
    };
  } catch (error) {
    console.error('Priority scoring error:', error);
    return {
      score: 50,
      level: 'UNSCORED',
      color: '#6c757d',
      recommendations: ['Manual review required'],
      wholesaleMargin: '$0',
      marginPercentage: '0.0%'
    };
  }
}

function estimateMarketValue(propertyData) {
  const { address, bedrooms, bathrooms, sqft, yearBuilt, propertyType } = propertyData;
  
  // Base calculation using square footage and market data
  let baseValue = sqft * getMarketPricePerSqft(address?.state, propertyType);
  
  // Adjust for property features
  baseValue += (bedrooms - 3) * 15000; // Adjust for bedroom count
  baseValue += (bathrooms - 2) * 8000;  // Adjust for bathroom count
  
  // Age adjustment
  const currentYear = new Date().getFullYear();
  const age = currentYear - (yearBuilt || 1990);
  if (age < 10) baseValue *= 1.1;
  else if (age < 20) baseValue *= 1.0;
  else if (age < 30) baseValue *= 0.95;
  else baseValue *= 0.85;

  // Market condition adjustment
  const marketCondition = getMarketCondition(address?.state);
  const marketMultiplier = MARKET_MULTIPLIERS[address?.state]?.[marketCondition] || 1.0;
  
  const estimatedValue = Math.round(baseValue * marketMultiplier);
  
  return {
    estimated: estimatedValue,
    range: {
      low: Math.round(estimatedValue * 0.9),
      high: Math.round(estimatedValue * 1.1)
    },
    confidence: calculateConfidence(propertyData),
    methodology: 'Comparative Market Analysis + Property Features'
  };
}

function calculateAssignmentFeePotential(propertyData, marketValue) {
  const state = propertyData.address?.state || 'TX';
  const baseAssignmentFee = MARKET_MULTIPLIERS[state]?.assignmentBase || 12000;
  
  // Calculate potential assignment fee based on property value and market
  let assignmentFee = baseAssignmentFee;
  
  // Value-based scaling
  if (marketValue.estimated > 500000) {
    assignmentFee *= 2.5; // High-value properties
  } else if (marketValue.estimated > 300000) {
    assignmentFee *= 1.8; // Mid-value properties
  } else if (marketValue.estimated > 200000) {
    assignmentFee *= 1.2; // Standard properties
  }
  
  // Timeline urgency bonus
  const timelineData = TIMELINE_URGENCY[propertyData.timeline] || TIMELINE_URGENCY['4-6-weeks'];
  if (timelineData.priority > 80) {
    assignmentFee *= 1.3; // Urgent deals command higher fees
  }
  
  // Property condition impact
  const conditionMultiplier = CONDITION_MULTIPLIERS[propertyData.kitchenQuality] || 0.90;
  if (conditionMultiplier > 0.90) {
    assignmentFee *= 1.2; // Better condition = higher assignment potential
  }
  
  const finalAssignmentFee = Math.round(assignmentFee);
  
  return {
    projected: finalAssignmentFee,
    range: {
      conservative: Math.round(finalAssignmentFee * 0.7),
      aggressive: Math.round(finalAssignmentFee * 1.4)
    },
    tier: getAssignmentFeeTier(finalAssignmentFee),
    factors: {
      marketValue: marketValue.estimated,
      timeline: propertyData.timeline,
      condition: propertyData.kitchenQuality,
      location: state
    }
  };
}

function calculateCashOfferRange(propertyData, marketValue) {
  const conditionMultiplier = CONDITION_MULTIPLIERS[propertyData.kitchenQuality] || 0.90;
  const timelineData = TIMELINE_URGENCY[propertyData.timeline] || TIMELINE_URGENCY['4-6-weeks'];
  
  // Base offer calculation
  let baseOffer = marketValue.estimated * conditionMultiplier * timelineData.multiplier;
  
  // Subtract estimated repair costs and fees
  const repairCosts = estimateRepairCosts(propertyData);
  const closingCosts = marketValue.estimated * 0.02; // 2% closing costs
  const profitMargin = marketValue.estimated * 0.08; // 8% profit margin
  
  baseOffer = baseOffer - repairCosts - closingCosts - profitMargin;
  
  return {
    primary: Math.round(baseOffer),
    range: {
      low: Math.round(baseOffer * 0.95),
      high: Math.round(baseOffer * 1.05)
    },
    breakdown: {
      marketValue: marketValue.estimated,
      conditionAdjustment: Math.round(marketValue.estimated * (1 - conditionMultiplier)),
      timelineDiscount: Math.round(marketValue.estimated * (1 - timelineData.multiplier)),
      repairCosts,
      closingCosts: Math.round(closingCosts),
      profitMargin: Math.round(profitMargin)
    }
  };
}

function calculateEnhancedQualificationScore(propertyData, assignmentFeeAnalysis) {
  let score = 0;
  const factors = [];

  // Assignment fee potential (NEW - weighted heavily)
  if (assignmentFeeAnalysis.projected > 40000) {
    score += 35; // High assignment fee potential
    factors.push("🔥 ULTRA HIGH MARGIN - Priority 1 lead!");
  } else if (assignmentFeeAnalysis.projected > 25000) {
    score += 25; // Medium-high assignment fee
    factors.push("🚀 Excellent margin - High priority");
  } else if (assignmentFeeAnalysis.projected > 15000) {
    score += 15; // Medium assignment fee
    factors.push("💰 Good margin - Medium priority");
  } else {
    score += 5; // Low assignment fee
    factors.push("⚠️ Low margin - Consider passing");
  }

  // Timeline urgency
  const timelineData = TIMELINE_URGENCY[propertyData.timeline] || TIMELINE_URGENCY['4-6-weeks'];
  if (timelineData.priority >= 90) {
    score += 20;
    factors.push("📞 Call within 1 hour - High priority");
  } else if (timelineData.priority >= 70) {
    score += 15;
    factors.push("📱 Call within 4 hours - Good opportunity");
  } else {
    score += 5;
    factors.push("📧 Follow up within 24 hours");
  }

  // Property condition
  const conditionMultiplier = CONDITION_MULTIPLIERS[propertyData.kitchenQuality] || 0.90;
  if (conditionMultiplier >= 0.90) {
    score += 15;
    factors.push("🏠 Good property condition");
  } else if (conditionMultiplier >= 0.80) {
    score += 10;
    factors.push("🏠 Fair property condition");
  } else {
    score += 5;
    factors.push("🏠 Needs work");
  }

  // Location/Market
  const state = propertyData.address?.state;
  if (['CA', 'FL', 'NV'].includes(state)) {
    score += 15;
    factors.push("📈 High-value market");
  } else if (['TX', 'AZ'].includes(state)) {
    score += 10;
    factors.push("📈 Good market");
  } else {
    score += 5;
    factors.push("📈 Emerging market");
  }

  // Property issues (deductions)
  const hasSerousIssues = propertyData.propertyIssues?.some(issue => 
    ['foundation-issues', 'fire-damage', 'asbestos-siding'].includes(issue)
  );
  if (!hasSerousIssues) {
    score += 10;
    factors.push("🏠 No major structural issues");
  } else {
    factors.push("🏠 Has structural concerns");
  }

  // Contact completeness
  if (propertyData.email && propertyData.phone && propertyData.firstName) {
    score += 5;
    factors.push("📝 Complete contact information");
  }

  return {
    total: score,
    maxPossible: 100,
    percentage: Math.round((score / 100) * 100),
    factors,
    tier: getQualificationTier(score)
  };
}

function determineBonusEligibility(qualificationScore, assignmentFeeAnalysis) {
  const qualifies = qualificationScore.total >= 70;
  const bonusAmount = getBonusAmount(assignmentFeeAnalysis.projected);
  
  return {
    qualifies,
    bonusAmount,
    reasoning: qualifies ? 
      `Qualified with ${qualificationScore.total}/100 points and ${assignmentFeeAnalysis.tier} assignment potential` :
      `Needs ${70 - qualificationScore.total} more points to qualify`,
    requirements: {
      minimumScore: 70,
      currentScore: qualificationScore.total,
      assignmentFeeTier: assignmentFeeAnalysis.tier
    }
  };
}

// Helper functions
function getMarketPricePerSqft(state, propertyType) {
  const basePrices = {
    'CA': 400, 'FL': 180, 'NV': 200, 'TX': 150, 'AZ': 170, 'GA': 140
  };
  
  const typeMultipliers = {
    'single-family': 1.0,
    'townhome': 0.9,
    'condo': 0.85,
    'multi-family': 1.1
  };
  
  return (basePrices[state] || 160) * (typeMultipliers[propertyType] || 1.0);
}

function getMarketCondition(state) {
  // Simplified market condition logic
  const hotMarkets = ['CA', 'FL', 'NV'];
  const normalMarkets = ['TX', 'AZ'];
  
  if (hotMarkets.includes(state)) return 'hot';
  if (normalMarkets.includes(state)) return 'normal';
  return 'slow';
}

function estimateRepairCosts(propertyData) {
  let repairCosts = 5000; // Base repair costs
  
  if (propertyData.kitchenQuality === 'fixer-upper') repairCosts += 25000;
  else if (propertyData.kitchenQuality === 'dated') repairCosts += 15000;
  else if (propertyData.kitchenQuality === 'standard') repairCosts += 8000;
  
  // Add costs for specific issues
  if (propertyData.propertyIssues?.includes('foundation-issues')) repairCosts += 20000;
  if (propertyData.propertyIssues?.includes('fire-damage')) repairCosts += 30000;
  if (propertyData.propertyIssues?.includes('asbestos-siding')) repairCosts += 15000;
  
  return repairCosts;
}

function calculateConfidence(propertyData) {
  let confidence = 70; // Base confidence
  
  if (propertyData.sqft && propertyData.yearBuilt) confidence += 15;
  if (propertyData.address?.state) confidence += 10;
  if (propertyData.propertyType) confidence += 5;
  
  return Math.min(confidence, 95);
}

function getAssignmentFeeTier(fee) {
  if (fee >= 40000) return 'Premium ($40k+)';
  if (fee >= 25000) return 'High ($25k+)';
  if (fee >= 15000) return 'Standard ($15k+)';
  return 'Basic (<$15k)';
}

function getQualificationTier(score) {
  if (score >= 85) return 'Platinum';
  if (score >= 75) return 'Gold';
  if (score >= 65) return 'Silver';
  return 'Bronze';
}

function getBonusAmount(assignmentFee) {
  if (assignmentFee >= 40000) return 10000; // Higher bonus for premium deals
  if (assignmentFee >= 25000) return 7500;  // Standard bonus
  if (assignmentFee >= 15000) return 5000;  // Lower bonus
  return 2500; // Minimum bonus
}

function generatePropertyInsights(propertyData, marketValue) {
  return {
    marketPosition: marketValue.estimated > 400000 ? 'High-value property' : 
                   marketValue.estimated > 250000 ? 'Mid-market property' : 'Entry-level property',
    investmentPotential: marketValue.confidence > 80 ? 'High confidence' : 'Moderate confidence',
    timeToClose: TIMELINE_URGENCY[propertyData.timeline]?.priority > 80 ? '7-14 days' : '14-30 days'
  };
}

function generateNextSteps(bonusEligibility, assignmentFeeAnalysis) {
  if (bonusEligibility) {
    return {
      immediate: 'Schedule consultation to claim bonus offer',
      preparation: 'Gather property documents and recent photos',
      timeline: 'Consultation → Offer → Closing in 7-21 days'
    };
  } else {
    return {
      immediate: 'Review property details to improve qualification',
      preparation: 'Consider timeline flexibility or property improvements',
      timeline: 'Standard offer process, 21-45 days'
    };
  }
}
