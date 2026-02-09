// Mock analytics data - hardcoded for demo purposes
// Future: These would come from a real-time analytics database (e.g., ClickHouse, BigQuery)

function generateTimeSeriesData(days = 30) {
  // TODO: Replace with real database query for time-series metrics
  // Future: Connect to analytics warehouse for real campaign performance data
  const data = [];
  const baseDate = new Date('2025-10-01');
  let impressions = 75000;
  let clicks = 3000;
  let conversions = 55;
  let spend = 1200;

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    // Add realistic variation with slight upward trend
    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.75 : 1.1;
    const trendFactor = 1 + (i / days) * 0.15; // 15% growth over period
    const randomVariation = 0.85 + Math.random() * 0.3;

    const dayImpressions = Math.round(impressions * weekendFactor * trendFactor * randomVariation);
    const dayClicks = Math.round(clicks * weekendFactor * trendFactor * randomVariation);
    const dayConversions = Math.round(conversions * weekendFactor * trendFactor * randomVariation);
    const daySpend = Math.round(spend * weekendFactor * trendFactor * randomVariation * 100) / 100;

    data.push({
      date: date.toISOString().split('T')[0],
      impressions: dayImpressions,
      clicks: dayClicks,
      conversions: dayConversions,
      spend: daySpend,
      ctr: Math.round((dayClicks / dayImpressions) * 10000) / 100,
      cpc: Math.round((daySpend / dayClicks) * 100) / 100,
    });
  }

  return data;
}

function getFunnelData() {
  // TODO: Replace with real funnel analytics from tracking pixels
  // Future: Connect to conversion tracking API for real funnel data
  return {
    impressions: 2400000,
    clicks: 96000,
    conversions: 1847,
    clickRate: 4.0,
    conversionRate: 1.92,
    costPerConversion: 28.42,
  };
}

function getPlatformComparison() {
  // TODO: Replace with aggregated data from each platform API
  // Future: Query Google Ads, Meta, and LinkedIn APIs for real metrics
  return [
    {
      platform: 'Glimmora Reach',
      impressions: 620000,
      clicks: 24800,
      ctr: 4.0,
      cpc: 0.85,
      conversions: 496,
      cpa: 17.14,
      spend: 8500,
      roas: 4.8,
    },
    {
      platform: 'Google Ads',
      impressions: 1080000,
      clicks: 43200,
      ctr: 4.0,
      cpc: 1.85,
      conversions: 864,
      cpa: 23.15,
      spend: 20000,
      roas: 3.4,
    },
    {
      platform: 'Meta',
      impressions: 840000,
      clicks: 33600,
      ctr: 4.0,
      cpc: 1.49,
      conversions: 672,
      cpa: 18.60,
      spend: 12500,
      roas: 4.1,
    },
    {
      platform: 'LinkedIn',
      impressions: 480000,
      clicks: 19200,
      ctr: 4.0,
      cpc: 4.69,
      conversions: 311,
      cpa: 48.23,
      spend: 15000,
      roas: 1.8,
    },
  ];
}

function getAttributionData(model = 'last_click') {
  // TODO: Replace with real multi-touch attribution engine
  // Future: Implement Shapley value or data-driven attribution models
  const models = {
    last_click: {
      model: 'Last Click',
      description: 'Gives 100% credit to the last touchpoint before conversion.',
      breakdown: {
        'Organic Search': 35,
        'Paid Search': 28,
        Social: 22,
        Direct: 10,
        Email: 5,
      },
    },
    first_click: {
      model: 'First Click',
      description: 'Gives 100% credit to the first touchpoint in the customer journey.',
      breakdown: {
        'Organic Search': 20,
        'Paid Search': 35,
        Social: 30,
        Direct: 8,
        Email: 7,
      },
    },
    linear: {
      model: 'Linear',
      description: 'Distributes credit equally across all touchpoints.',
      breakdown: {
        'Organic Search': 22,
        'Paid Search': 25,
        Social: 28,
        Direct: 14,
        Email: 11,
      },
    },
    time_decay: {
      model: 'Time Decay',
      description: 'Gives more credit to touchpoints closer to conversion.',
      breakdown: {
        'Organic Search': 30,
        'Paid Search': 30,
        Social: 20,
        Direct: 12,
        Email: 8,
      },
    },
    position_based: {
      model: 'Position Based',
      description: 'Gives 40% credit to first and last touchpoints, 20% distributed among middle.',
      breakdown: {
        'Organic Search': 28,
        'Paid Search': 32,
        Social: 18,
        Direct: 12,
        Email: 10,
      },
    },
  };

  return models[model] || models.last_click;
}

module.exports = {
  generateTimeSeriesData,
  getFunnelData,
  getPlatformComparison,
  getAttributionData,
};
