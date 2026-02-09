// AI Service - Hardcoded "AI" recommendations
// TODO: Replace all functions with real ML model API calls
// Future: Connect to trained models for each recommendation type

/**
 * Generate campaign recommendations based on campaign data
 * TODO: Replace with ML model that analyzes campaign performance patterns
 */
function generateCampaignRecommendations(campaign) {
  // MOCK DATA: This is hardcoded for demo purposes
  // Future: ML model will analyze historical performance data
  const recommendations = [];

  if (campaign.metrics && campaign.metrics.ctr < 3.5) {
    recommendations.push({
      type: 'optimization',
      priority: 'high',
      title: 'Improve Click-Through Rate',
      description: 'Your CTR is below industry average. Consider refreshing ad creatives and testing new headlines.',
      impact: '+15-25% CTR improvement expected',
    });
  }

  if (campaign.budget && campaign.budget.spent / campaign.budget.total > 0.7) {
    recommendations.push({
      type: 'budget',
      priority: 'medium',
      title: 'Budget Pacing Alert',
      description: 'You\'ve spent 70%+ of your budget. Consider adjusting daily spend to maintain campaign duration.',
      impact: 'Extend campaign by 5-7 days',
    });
  }

  if (campaign.metrics && campaign.metrics.roas < 2.0) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      title: 'Improve Return on Ad Spend',
      description: 'ROAS is below target. Recommend narrowing audience targeting and focusing on high-intent keywords.',
      impact: '+40% ROAS improvement potential',
    });
  }

  // Always include a general recommendation
  recommendations.push({
    type: 'general',
    priority: 'low',
    title: 'A/B Test Ad Variations',
    description: 'Running 2-3 creative variations can improve overall campaign performance by identifying top performers.',
    impact: '+10-20% performance uplift',
  });

  return recommendations;
}

/**
 * Generate creative insights for a specific creative
 * TODO: Replace with computer vision API and generative AI analysis
 */
function generateCreativeInsights(creative) {
  // MOCK DATA: Hardcoded creative tips
  // Future: Computer vision API will analyze visual elements
  // Future: NLP model will analyze copy effectiveness

  const insights = {
    score: creative.performance === 'high' ? 92 : creative.performance === 'medium' ? 68 : 41,
    highPerformingElements: [],
    suggestedVariations: [],
    predictedImprovement: 0,
  };

  if (creative.metrics.ctr > 4) {
    insights.highPerformingElements.push('Strong call-to-action placement');
    insights.highPerformingElements.push('Effective use of brand colors');
    insights.highPerformingElements.push('Clear value proposition in headline');
  } else if (creative.metrics.ctr > 2.5) {
    insights.highPerformingElements.push('Good visual hierarchy');
    insights.highPerformingElements.push('Recognizable brand elements');
  } else {
    insights.highPerformingElements.push('Consistent brand identity');
  }

  if (creative.metrics.conversions > 200) {
    insights.highPerformingElements.push('High-converting CTA button design');
  }

  // Suggested variations - hardcoded recommendations
  // TODO: Connect to generative AI for creative variation suggestions
  insights.suggestedVariations = [
    'Try a contrasting CTA button color for higher visibility',
    'Add social proof elements (testimonials, ratings)',
    'Test a shorter headline with action-oriented language',
    'Include a limited-time offer badge to create urgency',
    'Experiment with lifestyle imagery instead of product shots',
  ];

  // Predicted improvement - random realistic range
  // TODO: Replace with ML prediction model
  insights.predictedImprovement = creative.performance === 'high'
    ? Math.round(10 + Math.random() * 10)
    : creative.performance === 'medium'
      ? Math.round(15 + Math.random() * 20)
      : Math.round(25 + Math.random() * 25);

  return insights;
}

/**
 * Estimate audience size based on targeting parameters
 * TODO: Connect to audience graph API for real sizing
 */
function estimateAudienceSize(targeting) {
  // Simple range calculation based on parameters
  // TODO: Replace with real audience graph query
  let baseSize = 2000000; // 2M base

  // Narrow by age range
  const ageRange = (targeting.ageMax || 55) - (targeting.ageMin || 18);
  const ageFactor = ageRange / 37; // 37 is full range (18-55)
  baseSize *= ageFactor;

  // Narrow by gender
  if (targeting.gender && targeting.gender !== 'all') {
    baseSize *= 0.52;
  }

  // Narrow by locations
  const locationCount = targeting.locations ? targeting.locations.length : 1;
  if (locationCount === 1) baseSize *= 0.3;
  else if (locationCount <= 3) baseSize *= 0.5;

  // Narrow by interests
  const interestCount = targeting.interests ? targeting.interests.length : 0;
  if (interestCount > 0) {
    baseSize *= Math.max(0.1, 1 - (interestCount * 0.08));
  }

  const min = Math.round(baseSize * 0.8 / 1000) * 1000;
  const max = Math.round(baseSize * 1.2 / 1000) * 1000;

  return {
    min,
    max,
    formatted: `${(min / 1000).toFixed(0)}K - ${(max / 1000).toFixed(0)}K`,
    quality: min > 500000 ? 'broad' : min > 100000 ? 'balanced' : 'niche',
  };
}

/**
 * Generate budget recommendation based on objective
 * TODO: Replace with ML budget optimization model
 */
function generateBudgetRecommendation(objective, platforms) {
  // MOCK DATA: Simple rule-based budget suggestions
  const baseRecommendations = {
    awareness: { min: 3000, max: 15000, daily: { min: 100, max: 500 } },
    consideration: { min: 5000, max: 20000, daily: { min: 150, max: 650 } },
    conversion: { min: 8000, max: 25000, daily: { min: 250, max: 800 } },
  };

  const rec = baseRecommendations[objective] || baseRecommendations.consideration;

  // Adjust for platform count
  const platformCount = platforms ? platforms.length : 1;
  const platformMultiplier = 1 + (platformCount - 1) * 0.3;

  return {
    min: Math.round(rec.min * platformMultiplier),
    max: Math.round(rec.max * platformMultiplier),
    dailyMin: Math.round(rec.daily.min * platformMultiplier),
    dailyMax: Math.round(rec.daily.max * platformMultiplier),
    reasoning: `Based on ${objective} objective across ${platformCount} platform(s). Industry benchmarks suggest this range for optimal reach and frequency.`,
  };
}

module.exports = {
  generateCampaignRecommendations,
  generateCreativeInsights,
  estimateAudienceSize,
  generateBudgetRecommendation,
};
