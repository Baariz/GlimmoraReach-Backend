const express = require('express');
const cors = require('cors');
const db = require('./db');

// Seed data from mock files on first run
const mockCampaigns = require('./data/mockCampaigns');
const { creatives: mockCreativesRaw } = { creatives: require('./data/mockCreatives') };
const { placements: mockPlacements, platformStatus: mockPlatformStatus } = require('./data/mockPlacements');

// Tag demo data with userEmail for scoping
const demoEmail = 'admin@glimmora.com';

db.seed('campaigns', mockCampaigns.map(c => ({ ...c, userEmail: demoEmail })));
db.seed('creatives', mockCreativesRaw.map(c => ({ ...c, userEmail: demoEmail })));
db.seed('placements', mockPlacements.map(p => ({ ...p, userEmail: demoEmail })));
db.seed('users', [
  { email: 'admin@glimmora.com', password: 'admin123', name: 'Admin User', role: 'admin', avatar: 'AU', company: 'Glimmora Inc' },
  { email: 'manager@glimmora.com', password: 'manager123', name: 'Sarah Chen', role: 'campaign_manager', avatar: 'SC', company: 'Glimmora Inc' },
  { email: 'analyst@glimmora.com', password: 'analyst123', name: 'Raj Patel', role: 'analyst', avatar: 'RP', company: 'Glimmora Inc' },
  { email: 'demo@glimmora.com', password: 'demo123', name: 'Demo User', role: 'viewer', avatar: 'DU', company: 'Demo Corp' },
]);
db.seed('team', []);

// Add Glimmora Reach platform status to the stored platform status
const platformStatusWithGlimmora = {
  ...mockPlatformStatus,
  glimmora: {
    name: 'Glimmora Reach',
    connected: true,
    lastSync: new Date().toISOString(),
    accountId: 'GR-INTERNAL-001',
    placements: [
      { type: 'Glimmora Display', active: 5, total: 8 },
      { type: 'Glimmora Native', active: 3, total: 5 },
      { type: 'Glimmora Search', active: 2, total: 4 },
    ],
    metrics: {
      impressions: 620000,
      clicks: 24800,
      spend: 8500,
      conversions: 496,
    },
  },
};

// Import routes
const campaignRoutes = require('./routes/campaigns');
const analyticsRoutes = require('./routes/analytics');
const placementRoutes = require('./routes/placements');
const creativeRoutes = require('./routes/creatives');
const { calculateOptimalBid } = require('./services/biddingService');
const { estimateAudienceSize, generateBudgetRecommendation } = require('./services/aiService');
const { generateTimeSeriesData } = require('./data/mockAnalytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://glimmora-reach.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-email'],
}));
app.use(express.json());

// Make platform status available to routes
app.locals.platformStatus = platformStatusWithGlimmora;

// Routes
app.use('/api/campaigns', campaignRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/platforms', placementRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/creatives', creativeRoutes);

// GET /api/dashboard - Dashboard summary stats (user-scoped)
app.get('/api/dashboard', (req, res) => {
  const userEmail = req.headers['x-user-email'] || '';
  const campaigns = db.readForUser('campaigns', userEmail);

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget?.total || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.budget?.spent || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0);

  const stats = {
    activeCampaigns: activeCampaigns.length,
    activeCampaignsGrowth: campaigns.length > 0 ? 12.5 : 0,
    totalBudget,
    totalSpent,
    budgetUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
    totalImpressions,
    impressionsGrowth: campaigns.length > 0 ? 8.3 : 0,
    totalConversions,
    conversionsGrowth: campaigns.length > 0 ? 15.2 : 0,
    recentCampaigns: campaigns.slice(0, 6),
    platformDistribution: [
      { name: 'Google Ads', value: 35 },
      { name: 'Meta', value: 25 },
      { name: 'LinkedIn', value: 15 },
      { name: 'Glimmora Reach', value: 25 },
    ],
    performanceData: generateTimeSeriesData(7),
  };

  setTimeout(() => {
    res.json({ success: true, data: stats });
  }, 150);
});

// POST /api/bidding/calculate
app.post('/api/bidding/calculate', (req, res) => {
  const result = calculateOptimalBid(req.body);
  setTimeout(() => {
    res.json({ success: true, data: result });
  }, 200);
});

// POST /api/audience/estimate
app.post('/api/audience/estimate', (req, res) => {
  const result = estimateAudienceSize(req.body);
  setTimeout(() => {
    res.json({ success: true, data: result });
  }, 150);
});

// POST /api/budget/recommend
app.post('/api/budget/recommend', (req, res) => {
  const { objective, platforms } = req.body;
  const result = generateBudgetRecommendation(objective, platforms);
  setTimeout(() => {
    res.json({ success: true, data: result });
  }, 150);
});

// POST /api/auth/register - Register user (stored in JSON)
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, company, role } = req.body;
  const users = db.read('users');
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, error: 'Email already registered' });
  }
  const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const newUser = { email, password, name, role: role || 'admin', avatar, company: company || '', createdAt: new Date().toISOString() };
  users.push(newUser);
  db.write('users', users);
  res.status(201).json({ success: true, data: { email, name, role: newUser.role, avatar, company: newUser.company } });
});

// POST /api/auth/login - Validate user
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const users = db.read('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
  const { password: _, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

// GET /api/team - Get team members for a company
app.get('/api/team', (req, res) => {
  const userEmail = req.headers['x-user-email'] || '';
  const users = db.read('users');
  const currentUser = users.find(u => u.email === userEmail);
  if (!currentUser || !currentUser.company) {
    return res.json({ success: true, data: [] });
  }
  const team = db.read('team').filter(t => t.company === currentUser.company);
  res.json({ success: true, data: team });
});

// POST /api/team - Invite a team member
app.post('/api/team', (req, res) => {
  const userEmail = req.headers['x-user-email'] || '';
  const users = db.read('users');
  const currentUser = users.find(u => u.email === userEmail);
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  const { name, email, role } = req.body;
  const team = db.read('team');
  const exists = team.find(t => t.email.toLowerCase() === email.toLowerCase() && t.company === currentUser.company);
  if (exists) {
    return res.status(400).json({ success: false, error: 'Team member already invited' });
  }

  const member = {
    id: `tm-${Date.now()}`,
    name,
    email,
    role: role || 'viewer',
    company: currentUser.company,
    status: 'invited',
    invitedBy: userEmail,
    invitedAt: new Date().toISOString(),
  };
  team.push(member);
  db.write('team', team);
  res.status(201).json({ success: true, data: member });
});

// DELETE /api/team/:id - Remove team member
app.delete('/api/team/:id', (req, res) => {
  const team = db.read('team');
  const index = team.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Team member not found' });
  }
  team.splice(index, 1);
  db.write('team', team);
  res.json({ success: true, message: 'Team member removed' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Glimmora Reach API server running on port ${PORT}`);
  console.log('Data stored in backend/data/db/ as JSON files');
});
