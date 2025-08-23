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
    // Parse and validate input
    let propertyData;
    try {
      propertyData = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message 
        })
      };
    }

    // Validate required fields
    if (!propertyData.address && !propertyData.preconfirmedAddress) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Property address is required' 
        })
      };
    }
    
    // Calculate comprehensive offer analysis with error handling
    const offerAnalysis = await calculateOfferAnalysisWithFallback(propertyData);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        ...offerAnalysis
      })
    };

  } catch (error) {
    console.error('Offer calculation error:', error);
    
    // Return a fallback response instead of 502
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Calculation temporarily unavailable',
        fallbackResponse: true,
        marketValue: { 
          estimated: 250000, 
          methodology: 'Fallback estimate - manual review required' 
        },
        cashOfferRange: { 
          primary: 200000,
          range: { low: 190000, high: 210000 }
        },
        qualificationScore: { total: 50 },
        bonusEligibility: { qualifies: false },
        leadPriorityScore: {
          score: 50,
          level: 'MANUAL REVIEW',
          color: '#6c757d',
          recommendations: ['System error - manual review required'],
          wholesaleMargin: 'TBD',
          marginPercentage: 'TBD'
        },
        propertyInsights: { 
          marketPosition: 'Requires manual assessment',
          investmentPotential: 'Under review'
        },
        nextSteps: { 
          immediate: 'Contact our team for manual evaluation',
          timeline: 'Manual review within 24 hours'
        }
      })
    };
  }
};

async function calculateOfferAnalysisWithFallback(propertyData) {
  try {
    return await calculateOfferAnalysis(propertyData);
  } catch (error) {
    console.error('Primary calculation failed, using fallback:', error);
    
    // Return basic fallback calculation
    const fallbackMarketValue = estimateBasicMarketValue(propertyData);
    const fallbackCashOffer = calculateBasicCashOffer(fallbackMarketValue, propertyData);
    const fallbackPriority = calculateBasicPriority(propertyData, fallbackMarketValue, fallbackCashOffer);
    
    return {
      marketValue: fallbackMarketValue,
      cashOfferRange: fallbackCashOffer,
      qualificationScore: { total: 50 },
      bonusEligibility: { qualifies: false, reasoning: 'Manual review required' },
      leadPriorityScore: fallbackPriority,
      propertyInsights: {
        marketPosition: 'Requires manual assessment',
        investmentPotential: 'Under review',
        timeToClose: '14-30 days'
      },
      nextSteps: {
        immediate: 'Manual property evaluation scheduled',
        preparation: 'Gather property documents',
        timeline: 'Review within 24 hours'
      },
      fallbackUsed: true
    };
  }
}

function estimateBasicMarketValue(propertyData) {
  // Simple fallback market value estimation
  const address = propertyData.address || propertyData.preconfirmedAddress || '';
  let baseValue = 250000; // Default base value
  
  // Basic state adjustments
  if (address.includes('CA')) baseValue = 500000;
  else if (address.includes('FL') || address.includes('NV')) baseValue = 350000;
  else if (address.includes('TX') || address.includes('AZ')) baseValue = 300000;
  
  return {
    estimated: baseValue,
    range: {
      low: Math.round(baseValue * 0.85),
      high: Math.round(baseValue * 1.15)
    },
    confidence: 60,
    methodology: 'Basic fallback estimation'
  };
}

function calculateBasicCashOffer(marketValue, propertyData) {
  const baseOffer = Math.round(marketValue.estimated * 0.75); // 75% of market value
  
  return {
    primary: baseOffer,
    range: {
      low: Math.round(baseOffer * 0.95),
      high: Math.round(baseOffer * 1.05)
    },
    breakdown: {
      marketValue: marketValue.estimated,
      discountApplied: Math.round(marketValue.estimated * 0.25),
      methodology: 'Basic cash offer calculation'
    }
  };
}

function calculateBasicPriority(propertyData, marketValue, cashOffer) {
  // Basic priority calculation for fallback
  let score = 40; // Base score
  
  // Timeline bonus
  if (propertyData.timeline === 'asap') score += 15;
  else if (propertyData.timeline === '2-4-weeks') score += 10;
  
  // Cash offer claimed bonus
  if (propertyData.cashOfferClaimed) score += 10;
  
  // Condition adjustment
  if (propertyData.kitchenQuality === 'fixer-upper') score += 10;
  
  let level = 'STANDARD 📋';
  let color = '#6b7280';
  let priority = 'STANDARD';
  let contactTiming = 'Contact within 24-48 hours or allow self-booking';
  
  if (score >= 75) {
    level = 'URGENT 🚨🔥🔥🔥';
    color = '#dc2626';
    priority = 'HIGHEST';
    contactTiming = 'Call within 10 minutes';
  } else if (score >= 50) {
    level = 'IMPORTANT 🔥🔥';
    color = '#ea580c';
    priority = 'HIGH';
    contactTiming = 'Contact within 24 hours';
  }
  
  return {
    score,
    level,
    color,
    priority,
    contactTiming,
    recommendations: ['Manual review - basic scoring used'],
    wholesaleMargin: 'TBD',
    marginPercentage: 'TBD',
    fallbackCalculation: true
  };
}

// ... rest of the code remains the same ...
