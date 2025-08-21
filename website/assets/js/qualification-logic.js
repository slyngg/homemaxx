/**
 * Cash Offer Qualification Logic
 * Determines eligibility for $7,500 instant cash offer
 */

class CashOfferQualification {
  constructor() {
    this.qualificationCriteria = {
      // Property requirements
      minValue: 50000,
      maxValue: 500000,
      excludedStates: ['CA', 'NY', 'HI'], // High regulation states
      
      // Seller situation requirements
      requiredMotivation: ['foreclosure', 'behind_payments', 'divorce', 'inheritance', 'relocation'],
      minTimeframe: 'asap', // Must sell ASAP or within 30 days
      
      // Property condition requirements
      maxRepairCost: 30000, // Estimated repair costs under $30k
      
      // Market requirements
      wholesaleMargin: 0.15, // Must have 15%+ wholesale margin potential
      
      // Risk factors (auto-disqualify)
      disqualifiers: [
        'new_construction',
        'luxury_property', 
        'commercial',
        'land_only',
        'mobile_home',
        'hoarder_house',
        'fire_damage',
        'flood_damage'
      ]
    };
    
    this.bonusCriteria = {
      // Criteria for $15k bonus tier
      minValue: 150000,
      wholesaleMargin: 0.25, // 25%+ margin
      fastClose: true, // Can close in 10 days
      cashBuyer: true // Have cash buyer lined up
    };
  }

  // Main qualification check
  async qualifyForCashOffer(propertyData, sellerData) {
    const qualification = {
      qualified: false,
      amount: 0,
      reasons: [],
      disqualifiers: [],
      confidence: 0
    };

    // Check basic property requirements
    if (!this.checkPropertyRequirements(propertyData, qualification)) {
      return qualification;
    }

    // Check seller motivation and timeline
    if (!this.checkSellerRequirements(sellerData, qualification)) {
      return qualification;
    }

    // Check for disqualifying factors
    if (this.hasDisqualifyingFactors(propertyData, qualification)) {
      return qualification;
    }

    // Calculate wholesale potential
    const wholesalePotential = await this.calculateWholesalePotential(propertyData);
    if (wholesalePotential.margin < this.qualificationCriteria.wholesaleMargin) {
      qualification.disqualifiers.push('Insufficient wholesale margin');
      return qualification;
    }

    // Determine qualification level
    if (this.qualifiesForBonus(propertyData, sellerData, wholesalePotential)) {
      qualification.qualified = true;
      qualification.amount = 15000;
      qualification.tier = 'bonus';
      qualification.confidence = 95;
      qualification.reasons.push('Exceptional deal with high margin potential');
    } else {
      qualification.qualified = true;
      qualification.amount = 7500;
      qualification.tier = 'standard';
      qualification.confidence = 85;
      qualification.reasons.push('Meets standard qualification criteria');
    }

    return qualification;
  }

  checkPropertyRequirements(propertyData, qualification) {
    const { estimatedValue, state, propertyType } = propertyData;

    // Value range check
    if (estimatedValue < this.qualificationCriteria.minValue) {
      qualification.disqualifiers.push('Property value too low');
      return false;
    }

    if (estimatedValue > this.qualificationCriteria.maxValue) {
      qualification.disqualifiers.push('Property value too high');
      return false;
    }

    // State restrictions
    if (this.qualificationCriteria.excludedStates.includes(state)) {
      qualification.disqualifiers.push('State not supported for cash advance');
      return false;
    }

    return true;
  }

  checkSellerRequirements(sellerData, qualification) {
    const { motivation, timeframe, situation } = sellerData;

    // Must have qualifying motivation
    if (!this.qualificationCriteria.requiredMotivation.includes(motivation)) {
      qualification.disqualifiers.push('Seller motivation does not qualify');
      return false;
    }

    // Must need to sell quickly
    if (timeframe !== 'asap' && timeframe !== '30_days') {
      qualification.disqualifiers.push('Timeline too flexible for cash advance');
      return false;
    }

    return true;
  }

  hasDisqualifyingFactors(propertyData, qualification) {
    const { condition, propertyType, issues } = propertyData;

    // Check property type disqualifiers
    if (this.qualificationCriteria.disqualifiers.includes(propertyType)) {
      qualification.disqualifiers.push(`Property type not eligible: ${propertyType}`);
      return true;
    }

    // Check for major issues
    if (issues && issues.some(issue => this.qualificationCriteria.disqualifiers.includes(issue))) {
      qualification.disqualifiers.push('Property has disqualifying issues');
      return true;
    }

    // Check repair costs
    if (propertyData.estimatedRepairs > this.qualificationCriteria.maxRepairCost) {
      qualification.disqualifiers.push('Repair costs too high');
      return true;
    }

    return false;
  }

  async calculateWholesalePotential(propertyData) {
    const { estimatedValue, estimatedRepairs } = propertyData;
    
    // Conservative wholesale calculation
    const afterRepairValue = estimatedValue;
    const wholesalePrice = afterRepairValue * 0.70; // 70% ARV rule
    const netProfit = wholesalePrice - estimatedRepairs;
    const margin = netProfit / afterRepairValue;

    return {
      arv: afterRepairValue,
      wholesalePrice,
      repairCosts: estimatedRepairs,
      netProfit,
      margin,
      assignmentFee: Math.min(netProfit * 0.1, 15000) // 10% or $15k max
    };
  }

  qualifiesForBonus(propertyData, sellerData, wholesalePotential) {
    return (
      propertyData.estimatedValue >= this.bonusCriteria.minValue &&
      wholesalePotential.margin >= this.bonusCriteria.wholesaleMargin &&
      sellerData.timeframe === 'asap' &&
      sellerData.cashBuyerAvailable === true
    );
  }

  // Generate qualification questions for funnel
  getQualificationQuestions() {
    return [
      {
        id: 'motivation',
        type: 'select',
        question: 'What best describes your situation?',
        options: [
          { value: 'foreclosure', label: 'Behind on mortgage payments/foreclosure' },
          { value: 'divorce', label: 'Divorce or separation' },
          { value: 'inheritance', label: 'Inherited property' },
          { value: 'relocation', label: 'Job relocation/moving' },
          { value: 'financial', label: 'Financial hardship' },
          { value: 'other', label: 'Other reason' }
        ],
        required: true
      },
      {
        id: 'timeframe',
        type: 'select',
        question: 'How quickly do you need to sell?',
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '30_days', label: 'Within 30 days' },
          { value: '60_days', label: 'Within 60 days' },
          { value: 'flexible', label: 'No rush/flexible' }
        ],
        required: true
      },
      {
        id: 'behind_payments',
        type: 'select',
        question: 'Are you behind on mortgage payments?',
        options: [
          { value: 'yes_current', label: 'Yes, but want to catch up' },
          { value: 'yes_foreclosure', label: 'Yes, facing foreclosure' },
          { value: 'no', label: 'No, payments are current' },
          { value: 'no_mortgage', label: 'No mortgage/own free and clear' }
        ],
        required: true,
        showIf: { motivation: ['foreclosure', 'financial'] }
      },
      {
        id: 'cash_needs',
        type: 'select',
        question: 'What would you use the instant cash for?',
        options: [
          { value: 'mortgage', label: 'Catch up on mortgage payments' },
          { value: 'moving', label: 'Moving and relocation expenses' },
          { value: 'bills', label: 'Urgent bills and expenses' },
          { value: 'other', label: 'Other immediate needs' }
        ],
        required: true
      }
    ];
  }

  // Risk assessment for approval
  assessRisk(qualification, propertyData, sellerData) {
    const riskFactors = [];
    let riskScore = 0;

    // Property risk factors
    if (propertyData.estimatedValue < 75000) {
      riskFactors.push('Low property value');
      riskScore += 20;
    }

    if (propertyData.estimatedRepairs > 20000) {
      riskFactors.push('High repair costs');
      riskScore += 15;
    }

    // Market risk factors
    if (propertyData.daysOnMarket > 90) {
      riskFactors.push('Property has been on market long');
      riskScore += 10;
    }

    // Seller risk factors
    if (sellerData.previousAttempts > 2) {
      riskFactors.push('Multiple previous sale attempts');
      riskScore += 15;
    }

    return {
      riskScore,
      riskLevel: riskScore < 30 ? 'low' : riskScore < 60 ? 'medium' : 'high',
      riskFactors,
      approved: riskScore < 50 && qualification.qualified
    };
  }
}

// Export for use in funnel
window.CashOfferQualification = CashOfferQualification;
