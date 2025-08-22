exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const data = JSON.parse(event.body);
    const priorityScore = calculateLeadPriority(data);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        priorityScore: priorityScore.score,
        priorityLevel: priorityScore.level,
        breakdown: priorityScore.breakdown,
        recommendations: priorityScore.recommendations
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

function calculateLeadPriority(leadData) {
  const {
    sellerPrice,
    novationPrice,
    retailValue,
    propertyCondition,
    motivation,
    timeline,
    location,
    propertyType,
    cashOfferClaimed,
    leadSource
  } = leadData;

  let score = 0;
  let breakdown = {};
  let recommendations = [];

  // 1. WHOLESALE MARGIN SCORING (40% of total score - most important)
  const wholesaleMargin = novationPrice - sellerPrice;
  const marginPercentage = (wholesaleMargin / sellerPrice) * 100;
  
  let marginScore = 0;
  if (marginPercentage >= 100) { // 100%+ margin (like your example: $70K on $50K)
    marginScore = 40;
    recommendations.push("🔥 ULTRA HIGH MARGIN - Priority 1 lead!");
  } else if (marginPercentage >= 50) { // 50-99% margin
    marginScore = 35;
    recommendations.push("🚀 Excellent margin - High priority");
  } else if (marginPercentage >= 25) { // 25-49% margin
    marginScore = 25;
    recommendations.push("💰 Good margin - Medium priority");
  } else if (marginPercentage >= 15) { // 15-24% margin
    marginScore = 15;
    recommendations.push("✅ Acceptable margin - Standard priority");
  } else { // Under 15% margin
    marginScore = 5;
    recommendations.push("⚠️ Low margin - Consider passing");
  }
  
  score += marginScore;
  breakdown.wholesaleMargin = {
    points: marginScore,
    margin: `$${wholesaleMargin.toLocaleString()}`,
    percentage: `${marginPercentage.toFixed(1)}%`
  };

  // 2. DEAL SIZE SCORING (15% of total score)
  let dealSizeScore = 0;
  if (wholesaleMargin >= 100000) { // $100K+ margin
    dealSizeScore = 15;
  } else if (wholesaleMargin >= 50000) { // $50K-$99K margin
    dealSizeScore = 12;
  } else if (wholesaleMargin >= 25000) { // $25K-$49K margin
    dealSizeScore = 8;
  } else if (wholesaleMargin >= 10000) { // $10K-$24K margin
    dealSizeScore = 5;
  } else { // Under $10K margin
    dealSizeScore = 2;
  }
  
  score += dealSizeScore;
  breakdown.dealSize = { points: dealSizeScore, margin: `$${wholesaleMargin.toLocaleString()}` };

  // 3. SELLER MOTIVATION SCORING (15% of total score)
  let motivationScore = 0;
  const motivationScores = {
    'foreclosure': 15,
    'divorce': 12,
    'inheritance': 10,
    'job_relocation': 8,
    'financial_hardship': 12,
    'tired_landlord': 8,
    'downsizing': 6,
    'upgrade': 4,
    'other': 5
  };
  
  motivationScore = motivationScores[motivation] || 5;
  score += motivationScore;
  breakdown.motivation = { points: motivationScore, reason: motivation };

  // 4. TIMELINE URGENCY (10% of total score)
  let timelineScore = 0;
  const timelineScores = {
    'asap': 10,
    'within_30_days': 8,
    'within_60_days': 6,
    'within_90_days': 4,
    'no_rush': 2
  };
  
  timelineScore = timelineScores[timeline] || 4;
  score += timelineScore;
  breakdown.timeline = { points: timelineScore, urgency: timeline };

  // 5. PROPERTY CONDITION (10% of total score)
  let conditionScore = 0;
  const conditionScores = {
    'needs_major_work': 10, // Best for wholesale
    'needs_minor_work': 8,
    'move_in_ready': 6,
    'recently_renovated': 4
  };
  
  conditionScore = conditionScores[propertyCondition] || 6;
  score += conditionScore;
  breakdown.condition = { points: conditionScore, state: propertyCondition };

  // 6. CASH OFFER CLAIMED BONUS (5% of total score)
  let cashOfferScore = 0;
  if (cashOfferClaimed) {
    cashOfferScore = 5;
    recommendations.push("💸 Cash offer claimed - Highly motivated seller");
  }
  
  score += cashOfferScore;
  breakdown.cashOffer = { points: cashOfferScore, claimed: cashOfferClaimed };

  // 7. LOCATION/MARKET BONUS (5% of total score)
  let locationScore = 0;
  const hotMarkets = ['las_vegas', 'phoenix', 'austin', 'denver', 'seattle'];
  if (hotMarkets.includes(location?.toLowerCase())) {
    locationScore = 5;
  } else {
    locationScore = 3;
  }
  
  score += locationScore;
  breakdown.location = { points: locationScore, market: location };

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
    breakdown,
    recommendations,
    wholesaleMargin: `$${wholesaleMargin.toLocaleString()}`,
    marginPercentage: `${marginPercentage.toFixed(1)}%`
  };
}
