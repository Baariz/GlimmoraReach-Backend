const express = require('express');
const router = express.Router();
const {
  generateTimeSeriesData,
  getFunnelData,
  getPlatformComparison,
  getAttributionData,
} = require('../data/mockAnalytics');

// GET /api/analytics/funnel - Get funnel metrics
// TODO: Replace with real funnel analytics from tracking pixels
router.get('/funnel', (req, res) => {
  setTimeout(() => {
    res.json({ success: true, data: getFunnelData() });
  }, 150);
});

// GET /api/analytics/timeseries - Get time-series data
// TODO: Replace with real-time analytics database query
router.get('/timeseries', (req, res) => {
  const days = parseInt(req.query.days) || 30;

  setTimeout(() => {
    res.json({ success: true, data: generateTimeSeriesData(days) });
  }, 200);
});

// GET /api/analytics/platforms - Get platform comparison
// TODO: Replace with aggregated data from each platform API
router.get('/platforms', (req, res) => {
  setTimeout(() => {
    res.json({ success: true, data: getPlatformComparison() });
  }, 180);
});

// GET /api/analytics/attribution - Get attribution data
// TODO: Replace with real multi-touch attribution engine
router.get('/attribution', (req, res) => {
  const model = req.query.model || 'last_click';

  setTimeout(() => {
    res.json({ success: true, data: getAttributionData(model) });
  }, 200);
});

module.exports = router;
