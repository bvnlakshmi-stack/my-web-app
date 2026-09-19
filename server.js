const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './database' }),
  secret: 'mySecretKey123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// ── AUTH ROUTES ──────────────────────────────
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
// Mount Predictive Analytics Engine
const predictRoutes = require('./routes/predict');
app.use('/api/predict', predictRoutes);

// ── PAGES ────────────────────────────────────

// Home → Login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Login page
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Register page
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Dashboard page  ← THIS IS THE NEW ONE
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});
// Forecasting Page Route
app.get('/forecasting.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'forecasting.html'));
});
// Milestone 3 - Digital Twin Simulation Engine
app.get('/simulation.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'simulation.html'));
});
// Profile page
app.get('/profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});
// Activity page
app.get('/activity.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'activity.html'));
});
// Workspace pages
app.get('/income.html',    (req, res) => res.sendFile(path.join(__dirname, 'views', 'income.html')));
app.get('/savings.html',   (req, res) => res.sendFile(path.join(__dirname, 'views', 'savings.html')));
app.get('/study.html',     (req, res) => res.sendFile(path.join(__dirname, 'views', 'study.html')));
app.get('/academics.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'academics.html')));
app.get('/habits.html',    (req, res) => res.sendFile(path.join(__dirname, 'views', 'habits.html')));
app.get('/fitness.html',   (req, res) => res.sendFile(path.join(__dirname, 'views', 'fitness.html')));
app.get('/goals.html',     (req, res) => res.sendFile(path.join(__dirname, 'views', 'goals.html')));

// ── START SERVER ─────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});