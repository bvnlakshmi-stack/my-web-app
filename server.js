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

// ============ PROJECT ECHO CHATBOT API ============
const PROJECT_ECHO_SYSTEM_PROMPT = `
You are Echo AI, a highly advanced, intelligent assistant for "Project Echo - AI Lifestyle Digital Twin".

CRITICAL INSTRUCTIONS FOR YOUR BEHAVIOR:
1. DIRECT ANSWERS ONLY: Never tell the user to navigate to a page, sidebar, or section to find their answer. Since you already know the data, just give them the exact answer immediately.
2. BE CONCISE: Give short, direct, and precise answers. Do not add unnecessary fluff, explanations, or repeated information.
3. NO NAVIGATION ADVICE: Never say "Go to the Academics section" or "You can find this in...".
4. GENERAL KNOWLEDGE: If the user asks a general question not related to the project (e.g., "What is the capital of France?" or "How do black holes work?"), answer it naturally and accurately like a normal helpful AI.

COMPLETE PROJECT DATA & CONTEXT:
- Academics: There are currently two subjects in your academics: Physics and Science.
- Digital Twin Health & Fitness: Health Score is 85/100.
- M3 Simulation Engine: Burnout Risk is 12% (Optimal). Current Cash Runway is 1.5 Months.
- Income, Expenses & Savings: Net Savings Rate is 97.3% (Exceptional).
- Expense Allocation Orbit Breakdown: Food & Dining (₹5.20 Lakhs, 25%), Travel & Transit (₹5.60 Lakhs, 26%), Shopping & Gear (₹4.20 Lakhs, 20%), Utilities & Tech (₹3.60 Lakhs, 17%), Health & Wellness (₹2.60 Lakhs, 12%).
- Study & Habits: Daily Study Average is 4.2 hours focused time.
- Forecasting (Longitudinal Intelligence): Neural Accuracy is 98.6% High, Stability Wave is 92.4% Optimal, Variance Delta is ±3.8% Low. Tracks 2,000+ daily synthesized telemetry signals.

EXAMPLE CONVERSATIONS:
User: What subjects are included in my academics?
Assistant: There are two subjects in your academics: Physics and Science.

User: What is my burnout risk?
Assistant: Your current burnout risk is 12%, which is optimal.

User: How much did I spend on food?
Assistant: You have spent ₹5.20 Lakhs on Food & Dining, which is 25% of your expenses.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        
        const messages = [
            { role: 'system', content: PROJECT_ECHO_SYSTEM_PROMPT },
            ...history.slice(-6),
            { role: 'user', content: message }
        ];

        const ollamaRes = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen2.5:7b',
                messages: messages,
                stream: false,
                options: {
                    temperature: 0.2, // Forces the model to be strict, factual, and not overly talkative
                    top_p: 0.9
                }
            })
        });

        if (!ollamaRes.ok) {
            return res.status(500).json({ error: 'Ollama is not running. Please start it with: ollama serve' });
        }

        const data = await ollamaRes.json();
        res.json({ reply: data.message?.content || 'Sorry, I could not generate a response.' });

    } catch (err) {
        console.error('Chatbot error:', err);
        res.status(500).json({ error: 'Make sure Ollama is running: ollama serve' });
    }
});
// ============ END PROJECT ECHO CHATBOT API ============

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});