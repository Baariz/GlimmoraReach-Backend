const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateCampaignRecommendations } = require('../services/aiService');

// GET /api/campaigns - List user-scoped campaigns
router.get('/', (req, res) => {
  const userEmail = req.headers['x-user-email'] || '';
  const { status } = req.query;

  let filtered = db.readForUser('campaigns', userEmail);
  if (status && status !== 'all') {
    filtered = filtered.filter(c => c.status === status);
  }

  setTimeout(() => {
    res.json({ success: true, data: filtered, total: filtered.length });
  }, 200);
});

// GET /api/campaigns/:id - Get campaign detail
router.get('/:id', (req, res) => {
  const userEmail = req.headers['x-user-email'] || '';
  const campaigns = db.readForUser('campaigns', userEmail);
  const campaign = campaigns.find(c => c.id === req.params.id);

  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  const recommendations = generateCampaignRecommendations(campaign);

  setTimeout(() => {
    res.json({ success: true, data: { ...campaign, recommendations } });
  }, 180);
});

// POST /api/campaigns - Create new campaign (saved to JSON file)
router.post('/', (req, res) => {
  const userEmail = req.headers['x-user-email'] || '';
  const allCampaigns = db.read('campaigns');
  const newId = db.nextId('campaigns', 'camp');

  const newCampaign = {
    id: newId,
    userEmail,
    name: req.body.name || 'Untitled Campaign',
    status: req.body.status || 'active',
    objective: req.body.objective || 'awareness',
    platforms: req.body.platforms || ['glimmora'],
    campaignType: req.body.campaignType || 'display',
    adCopy: req.body.adCopy || '',
    description: req.body.description || '',
    targetUrl: req.body.targetUrl || '',
    budget: {
      total: Number(req.body.budgetAmount || req.body.budget || req.body.dailyBudget) || 5000,
      spent: 0,
      daily: req.body.budgetType === 'daily'
        ? Number(req.body.budgetAmount || req.body.budget || req.body.dailyBudget) || 500
        : Math.round((Number(req.body.budgetAmount || req.body.budget) || 5000) / 30),
      type: req.body.budgetType || 'daily',
    },
    schedule: {
      start: req.body.startDate || new Date().toISOString().split('T')[0],
      end: req.body.endDate || '',
    },
    targeting: {
      ageRange: [req.body.ageMin || 18, req.body.ageMax || 55],
      gender: req.body.gender || 'all',
      locations: req.body.locations || [],
      interests: req.body.interests || [],
    },
    bidding: {
      strategy: req.body.biddingStrategy || 'cpc',
      maxBid: 2.50,
    },
    metrics: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      conversions: 0,
      cpa: 0,
      spend: 0,
      roas: 0,
    },
    createdAt: new Date().toISOString().split('T')[0],
  };

  allCampaigns.push(newCampaign);
  db.write('campaigns', allCampaigns);

  // Auto-generate placement records for each platform in the campaign
  const allPlacements = db.read('placements');
  const platformMap = {
    glimmora: { name: 'Glimmora', types: ['Display', 'Native'] },
    google: { name: 'Google', types: ['Search', 'Display'] },
    meta: { name: 'Meta', types: ['Feed', 'Stories'] },
    linkedin: { name: 'LinkedIn', types: ['Sponsored Content', 'Message Ads'] },
  };

  const campaignPlatforms = newCampaign.platforms || ['glimmora'];
  for (const pKey of campaignPlatforms) {
    const pInfo = platformMap[pKey];
    if (!pInfo) continue;
    for (const pType of pInfo.types) {
      const placementId = db.nextId('placements', 'pl');
      allPlacements.push({
        id: placementId,
        userEmail,
        campaignId: newCampaign.id,
        platform: pInfo.name,
        type: pType,
        status: 'active',
        impressions: 0,
        clicks: 0,
        ctr: 0,
        spend: 0,
      });
    }
  }
  db.write('placements', allPlacements);

  setTimeout(() => {
    res.status(201).json({ success: true, data: newCampaign });
  }, 250);
});

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', (req, res) => {
  const allCampaigns = db.read('campaigns');
  const index = allCampaigns.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  const updated = { ...allCampaigns[index] };

  if (req.body.name) updated.name = req.body.name;
  if (req.body.objective) updated.objective = req.body.objective;
  if (req.body.platforms) updated.platforms = req.body.platforms;
  if (req.body.adCopy !== undefined) updated.adCopy = req.body.adCopy;
  if (req.body.description !== undefined) updated.description = req.body.description;
  if (req.body.targetUrl !== undefined) updated.targetUrl = req.body.targetUrl;

  if (req.body.budgetAmount || req.body.budget) {
    const amount = Number(req.body.budgetAmount || req.body.budget);
    updated.budget = {
      ...updated.budget,
      total: amount,
      daily: req.body.budgetType === 'daily' ? amount : Math.round(amount / 30),
    };
  }

  if (req.body.startDate || req.body.endDate) {
    updated.schedule = {
      start: req.body.startDate || updated.schedule?.start || '',
      end: req.body.endDate || updated.schedule?.end || '',
    };
  }

  if (req.body.targeting) {
    updated.targeting = { ...updated.targeting, ...req.body.targeting };
  }

  allCampaigns[index] = updated;
  db.write('campaigns', allCampaigns);

  setTimeout(() => {
    res.json({ success: true, data: updated });
  }, 200);
});

// PATCH /api/campaigns/:id/status - Change campaign status
router.patch('/:id/status', (req, res) => {
  const allCampaigns = db.read('campaigns');
  const index = allCampaigns.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  const { status } = req.body;
  if (!['active', 'paused', 'completed', 'draft'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  allCampaigns[index] = { ...allCampaigns[index], status };
  db.write('campaigns', allCampaigns);

  setTimeout(() => {
    res.json({ success: true, data: allCampaigns[index] });
  }, 150);
});

// DELETE /api/campaigns/:id - Delete campaign
router.delete('/:id', (req, res) => {
  const allCampaigns = db.read('campaigns');
  const index = allCampaigns.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  allCampaigns.splice(index, 1);
  db.write('campaigns', allCampaigns);

  setTimeout(() => {
    res.json({ success: true, message: 'Campaign deleted' });
  }, 150);
});

module.exports = router;
