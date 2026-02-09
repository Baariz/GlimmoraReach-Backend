const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/platforms/status - Get platform connection status (includes Glimmora Reach)
router.get('/status', (req, res) => {
  const platformStatus = req.app.locals.platformStatus;
  setTimeout(() => {
    res.json({ success: true, data: platformStatus });
  }, 100);
});

// GET /api/placements - Get user-scoped placements with campaign & creative info
router.get('/', (req, res) => {
  const userEmail = req.headers['x-user-email'] || '';
  const { platform, status, campaignId } = req.query;

  let filtered = db.readForUser('placements', userEmail);
  if (platform) {
    filtered = filtered.filter(p => p.platform.toLowerCase() === platform.toLowerCase());
  }
  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }
  if (campaignId) {
    filtered = filtered.filter(p => p.campaignId === campaignId);
  }

  // Enrich with campaign name and creative info
  const allCampaigns = db.readForUser('campaigns', userEmail);
  const allCreatives = db.readForUser('creatives', userEmail);

  const enriched = filtered.map(p => {
    const campaign = allCampaigns.find(c => c.id === p.campaignId);
    const creative = allCreatives.find(cr => cr.campaignId === p.campaignId && cr.status === 'active');
    return {
      ...p,
      campaignName: campaign ? campaign.name : 'Unknown Campaign',
      creativeName: creative ? creative.name : null,
      creativeThumbnail: creative ? creative.thumbnail : null,
    };
  });

  setTimeout(() => {
    res.json({ success: true, data: enriched, total: enriched.length });
  }, 150);
});

module.exports = router;
