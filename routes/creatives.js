const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateCreativeInsights } = require('../services/aiService');

// GET /api/creatives - List user-scoped creatives
router.get('/', (req, res) => {
  const userEmail = req.headers['x-user-email'] || '';
  const { campaignId } = req.query;

  let filtered = db.readForUser('creatives', userEmail);
  if (campaignId) {
    filtered = filtered.filter(c => c.campaignId === campaignId);
  }

  setTimeout(() => {
    res.json({ success: true, data: filtered, total: filtered.length });
  }, 180);
});

// GET /api/creatives/:id - Get creative detail
router.get('/:id', (req, res) => {
  const allCreatives = db.read('creatives');
  const creative = allCreatives.find(c => c.id === req.params.id);

  if (!creative) {
    return res.status(404).json({ success: false, error: 'Creative not found' });
  }

  setTimeout(() => {
    res.json({ success: true, data: creative });
  }, 150);
});

// POST /api/creatives - Create new creative entry (saved to JSON)
router.post('/', (req, res) => {
  const userEmail = req.headers['x-user-email'] || '';
  const allCreatives = db.read('creatives');
  const newId = db.nextId('creatives', 'cr');

  const newCreative = {
    id: newId,
    userEmail,
    name: req.body.name || 'Untitled Creative',
    type: req.body.type || 'image',
    format: req.body.format || 'banner',
    dimensions: req.body.dimensions || '1200x628',
    campaignId: req.body.campaignId || null,
    status: 'active',
    thumbnail: req.body.thumbnail || 'https://placehold.co/1200x628/6b4d3d/white?text=Creative',
    performance: 'new',
    metrics: { impressions: 0, clicks: 0, ctr: 0, conversions: 0 },
    createdAt: new Date().toISOString().split('T')[0],
  };

  allCreatives.push(newCreative);
  db.write('creatives', allCreatives);

  setTimeout(() => {
    res.status(201).json({ success: true, data: newCreative });
  }, 200);
});

// DELETE /api/creatives/:id - Delete a creative
router.delete('/:id', (req, res) => {
  const allCreatives = db.read('creatives');
  const index = allCreatives.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Creative not found' });
  }

  allCreatives.splice(index, 1);
  db.write('creatives', allCreatives);

  setTimeout(() => {
    res.json({ success: true, message: 'Creative deleted' });
  }, 150);
});

// POST /api/creatives/:id/insights - Get AI insights for a creative
router.post('/:id/insights', (req, res) => {
  const allCreatives = db.read('creatives');
  const creative = allCreatives.find(c => c.id === req.params.id);

  if (!creative) {
    return res.status(404).json({ success: false, error: 'Creative not found' });
  }

  const insights = generateCreativeInsights(creative);

  setTimeout(() => {
    res.json({ success: true, data: insights });
  }, 300);
});

module.exports = router;
