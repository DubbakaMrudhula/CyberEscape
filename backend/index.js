import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Automatically load .env file if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envData = fs.readFileSync(envPath, 'utf8');
    envData.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.warn('Could not read .env file:', e.message);
}

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'vault-breaker-super-secret-key-2024';

app.use(cors());
app.use(express.json());

// --- In-Memory Fallback Stores (if MongoDB isn't running) ---
const memUsers = [];
const memRuns = [];
const memScenarios = [];
const memAuditLogs = [];
let gameSettings = {
  startingLives: 3,
  streakBonus: 50,
  passScoreThreshold: 750,
  lockdownMode: false,
  timerModeSeconds: 0 // 0 = untimed
};

// --- Mongoose Schemas & Models ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  bestScore: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const runSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  alias: { type: String, required: true, maxlength: 24 },
  score: { type: Number, required: true, min: 0 },
  cleared: { type: Boolean, default: false },
  livesRemaining: { type: Number, default: 0 },
  rankBadge: { type: String, default: 'C' },
  mistakes: { type: Map, of: Number, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const scenarioSchema = new mongoose.Schema({
  caseId: { type: String, required: true }, // 'phishing' | 'passwords' | 'qr' | 'scams'
  scenarioId: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // 'email' | 'password' | 'qr' | 'sms'
  difficulty: { type: String, default: 'CUSTOM DETECTIVE VECTOR' },
  title: { type: String, required: true },
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  correctAction: { type: String, enum: ['block', 'trust'], required: true },
  points: { type: Number, default: 100 },
  signal: { type: String, default: '' },
  companionReaction: {
    correct: { type: String, default: 'Sharp intuition, Agent!' },
    wrong: { type: String, default: 'Trap sprung! Credential compromise.' }
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actor: { type: String, default: 'SYSTEM' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Run = mongoose.model('Run', runSchema);
const Scenario = mongoose.model('Scenario', scenarioSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

const isMongo = () => mongoose.connection.readyState === 1;

// --- Helper: Audit Logger ---
async function logAudit(action, actor = 'SYSTEM', details = {}) {
  const entry = { action, actor, details, timestamp: new Date() };
  memAuditLogs.unshift(entry);
  if (memAuditLogs.length > 200) memAuditLogs.pop();

  if (isMongo()) {
    try {
      await AuditLog.create(entry);
    } catch (e) {
      console.warn('Could not write audit log to Mongo:', e.message);
    }
  }
}

// --- Seed Default Admin Account ---
async function seedDefaultAdmin() {
  const adminEmail = 'admin@vault.net';
  const adminUsername = 'admin';
  const adminPassword = 'admin123';

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  // In-memory store admin check
  const memExists = memUsers.find(u => u.email === adminEmail || u.username === adminUsername);
  if (!memExists) {
    memUsers.push({
      id: 'admin_root',
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      bestScore: 2400,
      gamesPlayed: 12,
      badges: ['DIRECTOR', 'ZERO_DAY'],
      createdAt: new Date()
    });
  }

  // MongoDB check
  if (isMongo()) {
    try {
      const dbAdmin = await User.findOne({ email: adminEmail });
      if (!dbAdmin) {
        await User.create({
          username: adminUsername,
          email: adminEmail,
          passwordHash,
          role: 'admin',
          bestScore: 2400,
          gamesPlayed: 12,
          badges: ['DIRECTOR', 'ZERO_DAY']
        });
        console.log('✓ Seeded Default Master Admin Account: admin@vault.net');
      }
    } catch (e) {
      console.warn('Could not seed admin to Mongo:', e.message);
    }
  }
}

// --- Auth Middleware ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  });
}

// Require Admin Role Middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Master Admin credentials required.' });
  }
  next();
}

app.use(authenticateToken);

// --- Root / Welcome Route ---
app.get('/', (req, res) => {
  const dbStatus = isMongo() ? 'MongoDB Atlas Connected' : 'In-Memory Store (Add MONGO_URI in Vercel settings to connect Atlas)';
  if (req.accepts('html')) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vault Breaker API // Online</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 540px; width: 100%; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .status { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; color: #16a34a; background: #dcfce7; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px; }
          .status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; }
          h1 { font-size: 24px; font-weight: 800; margin: 0 0 8px; color: #0f172a; }
          p { color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
          .meta { background: #f1f5f9; border-radius: 8px; padding: 14px 16px; font-family: monospace; font-size: 12px; margin-bottom: 20px; }
          .endpoints { display: flex; flex-direction: column; gap: 8px; }
          .endpoints a { display: flex; justify-content: space-between; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; text-decoration: none; color: #2563eb; font-weight: 600; font-size: 13px; }
          .endpoints a:hover { background: #eff6ff; border-color: #bfdbfe; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="status"><span class="status-dot"></span> API ONLINE & RUNNING</div>
          <h1>Vault Breaker Backend</h1>
          <p>The cybersecurity escape room game API is live on Vercel. Connect your frontend or explore the endpoints below.</p>
          <div class="meta">
            <div><strong>Database:</strong> ${dbStatus}</div>
            <div><strong>Timestamp:</strong> ${new Date().toISOString()}</div>
          </div>
          <div class="endpoints">
            <a href="/api/health" target="_blank"><span>Health Check Endpoint</span><span>/api/health →</span></a>
            <a href="/api/runs" target="_blank"><span>Leaderboard High Scores</span><span>/api/runs →</span></a>
            <a href="/api/admin/overview" target="_blank"><span>Admin Overview</span><span>/api/admin/overview →</span></a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
  res.json({
    status: 'online',
    system: 'Vault Breaker Security Core',
    database: dbStatus,
    endpoints: {
      health: '/api/health',
      runs: '/api/runs',
      authLogin: '/api/auth/login',
      authRegister: '/api/auth/register'
    }
  });
});

// --- Health / Status ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Vault Breaker Security Core',
    database: isMongo() ? 'MongoDB Connected' : 'In-Memory Resilient Store',
    timestamp: new Date().toISOString()
  });
});

// --- Auth Endpoints ---

// 1. Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (isMongo()) {
      const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
      if (existing) {
        return res.status(409).json({ message: 'Username or email already registered.' });
      }

      const user = await User.create({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'user'
      });

      const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      await logAudit('USER_REGISTERED', user.username, { email: user.email });

      return res.status(201).json({
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role, bestScore: user.bestScore, gamesPlayed: user.gamesPlayed }
      });
    } else {
      // Memory store fallback
      const exists = memUsers.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(409).json({ message: 'Username or email already registered.' });
      }

      const user = {
        id: 'mem_' + Date.now(),
        username: username.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'user',
        bestScore: 0,
        gamesPlayed: 0,
        badges: []
      };
      memUsers.push(user);

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      await logAudit('USER_REGISTERED', user.username, { email: user.email });

      return res.status(201).json({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role, bestScore: user.bestScore, gamesPlayed: user.gamesPlayed }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required.' });
    }

    let user;
    if (isMongo()) {
      user = await User.findOne({
        $or: [{ email: identifier.toLowerCase().trim() }, { username: identifier.trim() }]
      });
    } else {
      user = memUsers.find(
        u => u.email.toLowerCase() === identifier.toLowerCase().trim() || u.username.toLowerCase() === identifier.toLowerCase().trim()
      );
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const validPass = await bcrypt.compare(password, user.passwordHash);
    if (!validPass) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const userId = user._id || user.id;
    const userRole = user.role || 'user';
    const token = jwt.sign({ id: userId, username: user.username, role: userRole }, JWT_SECRET, { expiresIn: '7d' });

    await logAudit('USER_LOGIN', user.username, { role: userRole });

    return res.json({
      token,
      user: {
        id: userId,
        username: user.username,
        email: user.email,
        role: userRole,
        bestScore: user.bestScore || 0,
        gamesPlayed: user.gamesPlayed || 0
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// 3. Current User Profile
app.get('/api/auth/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

  if (isMongo()) {
    const user = await User.findById(req.user.id).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } else {
    const user = memUsers.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser });
  }
});

// --- Runs / Leaderboard Endpoints ---

// Get Leaderboard
app.get('/api/runs', async (req, res) => {
  try {
    if (isMongo()) {
      const topRuns = await Run.find()
        .sort({ score: -1, createdAt: -1 })
        .limit(15)
        .lean();
      return res.json({ runs: topRuns });
    } else {
      const sorted = [...memRuns].sort((a, b) => b.score - a.score).slice(0, 15);
      return res.json({ runs: sorted });
    }
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch runs' });
  }
});

// Submit a new run
app.post('/api/runs', async (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators cannot record game runs. Please use a player account.' });
    }

    const { alias, score, mistakes, cleared, livesRemaining, rankBadge } = req.body;
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ message: 'Valid score is required' });
    }

    const runAlias = (req.user ? req.user.username : alias || 'AGENT-ZERO').trim().slice(0, 24);
    const runPayload = {
      userId: req.user ? req.user.id : null,
      alias: runAlias,
      score,
      cleared: Boolean(cleared),
      livesRemaining: Number(livesRemaining) || 0,
      rankBadge: rankBadge || 'C',
      mistakes: mistakes || {},
      createdAt: new Date()
    };

    if (isMongo()) {
      const savedRun = await Run.create(runPayload);

      // If registered user, update user stats
      if (req.user) {
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { gamesPlayed: 1 },
          $max: { bestScore: score }
        });
      }

      await logAudit('RUN_COMPLETED', runAlias, { score, rankBadge, cleared });
      const topRuns = await Run.find().sort({ score: -1, createdAt: -1 }).limit(15).lean();
      return res.status(201).json({ run: savedRun, runs: topRuns });
    } else {
      memRuns.push(runPayload);
      if (req.user) {
        const u = memUsers.find(user => user.id === req.user.id);
        if (u) {
          u.gamesPlayed = (u.gamesPlayed || 0) + 1;
          u.bestScore = Math.max(u.bestScore || 0, score);
        }
      }
      await logAudit('RUN_COMPLETED', runAlias, { score, rankBadge, cleared });
      const sorted = [...memRuns].sort((a, b) => b.score - a.score).slice(0, 15);
      return res.status(201).json({ run: runPayload, runs: sorted });
    }
  } catch (error) {
    console.error('Error saving run:', error);
    res.status(500).json({ message: 'Failed to record run.' });
  }
});

// Get personal run history
app.get('/api/user/history', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    if (isMongo()) {
      const history = await Run.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10).lean();
      return res.json({ history });
    } else {
      const history = memRuns.filter(r => r.userId === req.user.id).slice(-10).reverse();
      return res.json({ history });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to load history' });
  }
});

// ==========================================
// --- ADMIN MANAGEMENT & ANALYTICS APIs ---
// ==========================================

// 1. Admin Analytics Overview
app.get('/api/admin/overview', requireAdmin, async (req, res) => {
  try {
    let usersList = [];
    let runsList = [];

    if (isMongo()) {
      usersList = await User.find().select('-passwordHash').lean();
      runsList = await Run.find().lean();
    } else {
      usersList = memUsers.map(({ passwordHash, ...rest }) => rest);
      runsList = [...memRuns];
    }

    const totalUsers = usersList.length;
    const totalRuns = runsList.length;
    const totalScore = runsList.reduce((acc, r) => acc + (r.score || 0), 0);
    const avgScore = totalRuns > 0 ? Math.round(totalScore / totalRuns) : 0;
    const clearedRuns = runsList.filter(r => r.cleared || r.score >= (gameSettings.passScoreThreshold || 750)).length;
    const passRate = totalRuns > 0 ? Math.round((clearedRuns / totalRuns) * 100) : 0;

    // Threat vector vulnerability breakdown (aggregate mistakes)
    const vectorBreakdown = {
      phishing: 0,
      passwords: 0,
      qr: 0,
      scams: 0
    };

    runsList.forEach(run => {
      if (run.mistakes) {
        // Handle Map or plain object
        const m = run.mistakes instanceof Map ? Object.fromEntries(run.mistakes) : run.mistakes;
        if (m.phishing) vectorBreakdown.phishing += Number(m.phishing) || 0;
        if (m.passwords) vectorBreakdown.passwords += Number(m.passwords) || 0;
        if (m.qr) vectorBreakdown.qr += Number(m.qr) || 0;
        if (m.scams) vectorBreakdown.scams += Number(m.scams) || 0;
      }
    });

    const recentRuns = [...runsList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

    res.json({
      analytics: {
        totalUsers,
        totalRuns,
        avgScore,
        passRate,
        vectorBreakdown,
        gameSettings
      },
      system: {
        database: isMongo() ? 'MongoDB Replica' : 'In-Memory Store',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      },
      recentRuns
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ message: 'Failed to generate admin overview' });
  }
});

// 2. User Directory Management
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    if (isMongo()) {
      const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
      return res.json({ users });
    } else {
      const users = memUsers.map(({ passwordHash, ...rest }) => rest);
      return res.json({ users: users.reverse() });
    }
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch users' });
  }
});

// Admin Add New User
app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password required.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const assignedRole = role === 'admin' ? 'admin' : 'user';

    if (isMongo()) {
      const user = await User.create({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: assignedRole
      });
      await logAudit('ADMIN_CREATED_USER', req.user.username, { newUser: user.username, role: assignedRole });
      return res.status(201).json({ user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    } else {
      const newUser = {
        id: 'mem_' + Date.now(),
        username: username.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: assignedRole,
        bestScore: 0,
        gamesPlayed: 0,
        badges: [],
        createdAt: new Date()
      };
      memUsers.push(newUser);
      await logAudit('ADMIN_CREATED_USER', req.user.username, { newUser: newUser.username, role: assignedRole });
      const { passwordHash: _, ...safeUser } = newUser;
      return res.status(201).json({ user: safeUser });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error creating user' });
  }
});

// Admin Change User Role
app.patch('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    if (isMongo()) {
      const updated = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash').lean();
      if (!updated) return res.status(404).json({ message: 'User not found' });
      await logAudit('USER_ROLE_CHANGED', req.user.username, { target: updated.username, newRole: role });
      return res.json({ user: updated });
    } else {
      const user = memUsers.find(u => u.id === id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.role = role;
      await logAudit('USER_ROLE_CHANGED', req.user.username, { target: user.username, newRole: role });
      const { passwordHash, ...safe } = user;
      return res.json({ user: safe });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Admin Delete User
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongo()) {
      const deleted = await User.findByIdAndDelete(id);
      if (deleted) {
        await logAudit('USER_DELETED', req.user.username, { deletedUser: deleted.username });
      }
      return res.json({ success: true });
    } else {
      const idx = memUsers.findIndex(u => u.id === id);
      if (idx !== -1) {
        const deleted = memUsers.splice(idx, 1)[0];
        await logAudit('USER_DELETED', req.user.username, { deletedUser: deleted.username });
      }
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// 3. Admin Run Sessions Audit
app.get('/api/admin/runs', requireAdmin, async (req, res) => {
  try {
    const { q, rank } = req.query;
    let runsList = [];

    if (isMongo()) {
      let filter = {};
      if (q) filter.alias = { $regex: q, $options: 'i' };
      if (rank) filter.rankBadge = rank.toUpperCase();
      runsList = await Run.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    } else {
      runsList = [...memRuns];
      if (q) runsList = runsList.filter(r => r.alias && r.alias.toLowerCase().includes(q.toLowerCase()));
      if (rank) runsList = runsList.filter(r => r.rankBadge === rank.toUpperCase());
      runsList = runsList.reverse().slice(0, 100);
    }

    res.json({ runs: runsList });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch runs' });
  }
});

// Admin Delete Run
app.delete('/api/admin/runs/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongo()) {
      await Run.findByIdAndDelete(id);
      await logAudit('RUN_DELETED', req.user.username, { runId: id });
    } else {
      const idx = memRuns.findIndex(r => r.id === id || String(r.createdAt) === id);
      if (idx !== -1) memRuns.splice(idx, 1);
      await logAudit('RUN_DELETED', req.user.username, { runId: id });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete run' });
  }
});

// 4. Admin Scenario Content Management System (CMS)
app.get('/api/admin/scenarios', async (req, res) => {
  try {
    if (isMongo()) {
      const scenarios = await Scenario.find().lean();
      return res.json({ scenarios });
    } else {
      return res.json({ scenarios: memScenarios });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch scenarios' });
  }
});

app.post('/api/admin/scenarios', requireAdmin, async (req, res) => {
  try {
    const scenarioData = req.body;
    const scenarioId = 'cust_' + Date.now();
    const payload = { ...scenarioData, scenarioId, createdAt: new Date() };

    if (isMongo()) {
      const created = await Scenario.create(payload);
      await logAudit('SCENARIO_CREATED', req.user.username, { scenarioId, title: payload.title });
      return res.status(201).json({ scenario: created });
    } else {
      memScenarios.push(payload);
      await logAudit('SCENARIO_CREATED', req.user.username, { scenarioId, title: payload.title });
      return res.status(201).json({ scenario: payload });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create scenario' });
  }
});

app.delete('/api/admin/scenarios/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongo()) {
      await Scenario.findOneAndDelete({ scenarioId: id });
    } else {
      const idx = memScenarios.findIndex(s => s.scenarioId === id);
      if (idx !== -1) memScenarios.splice(idx, 1);
    }
    await logAudit('SCENARIO_DELETED', req.user.username, { scenarioId: id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete scenario' });
  }
});

// 5. Game Engine Settings
app.get('/api/admin/settings', async (req, res) => {
  res.json({ settings: gameSettings });
});

app.post('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const { startingLives, streakBonus, passScoreThreshold, lockdownMode } = req.body;
    if (startingLives !== undefined) gameSettings.startingLives = Number(startingLives);
    if (streakBonus !== undefined) gameSettings.streakBonus = Number(streakBonus);
    if (passScoreThreshold !== undefined) gameSettings.passScoreThreshold = Number(passScoreThreshold);
    if (lockdownMode !== undefined) gameSettings.lockdownMode = Boolean(lockdownMode);

    await logAudit('SETTINGS_UPDATED', req.user.username, gameSettings);
    res.json({ success: true, settings: gameSettings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// 6. Security Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, async (req, res) => {
  try {
    if (isMongo()) {
      const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50).lean();
      return res.json({ logs });
    } else {
      return res.json({ logs: memAuditLogs.slice(0, 50) });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
});

// Serve dist in production
app.use(express.static('dist'));

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[VAULT BREAKER CORE] API active at http://localhost:${port}`);
    seedDefaultAdmin();
  });
}

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vault_breaker';
mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 6000 })
  .then(() => {
    const maskedUri = mongoUri.replace(/\/\/.*@/, '//<credentials>@');
    console.log('✓ MongoDB Connected Successfully to Cluster:', maskedUri);
    seedDefaultAdmin();
  })
  .catch((error) => console.log('ℹ Notice: MongoDB Atlas (' + error.message + '). Seamlessly using built-in in-memory fallback store.'));

export default app;