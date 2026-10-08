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
const PROJECT_ECHO_SYSTEM_PROMPT_TEMPLATE = `
You are Echo AI, the intelligent assistant for "Project Echo - AI Lifestyle Digital Twin".

ABSOLUTE RULES (NEVER BREAK THESE):
1. ONLY USE THE DATA PROVIDED BELOW. Never invent, guess, or assume any data that is not explicitly listed below.
2. If the user asks about something and the data for it IS listed below, give the EXACT answer from the data (exact numbers, exact names, exact amounts).
3. If the user asks about something and the data for it is NOT listed below or shows 0 entries, say: "Based on your current data, I don't have that information yet. Please add the data to the relevant page first."
4. NEVER say "Go to the page" or "Navigate to" - just give the direct answer.
5. BE CONCISE. Short, direct, precise answers only.
6. For month-specific questions (e.g., "July expenses"), look at the Monthly Expenses section below and give the exact amount for that month.
7. For count questions (e.g., "How many habits?"), give the exact count from the data below.
8. For general knowledge questions NOT about the project (e.g., "What is AI?", "Capital of France"), answer normally like a helpful assistant.
9. ALWAYS prefer exact data over summaries. If someone asks "What are my habits?", list each habit by name.

HERE IS THE USER'S COMPLETE LIVE PROJECT DATA (this is 100% real-time, accurate data):

{LIVE_CONTEXT}

Remember: The data above is the SINGLE SOURCE OF TRUTH. If a section shows entries, those entries exist. If a section is missing or empty, that data has not been added yet.
`

// Build the old static prompt as fallback
const PROJECT_ECHO_SYSTEM_PROMPT_STATIC = `
You are Echo AI, a highly advanced, intelligent assistant for "Project Echo - AI Lifestyle Digital Twin".
CRITICAL INSTRUCTIONS: Give direct, concise answers using the live data provided by the user.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [], liveContext = '' } = req.body;
        
        // Build system prompt with LIVE data
        let systemPrompt = PROJECT_ECHO_SYSTEM_PROMPT_TEMPLATE.replace('{LIVE_CONTEXT}', liveContext || 'No live data provided. Answer based on general knowledge.');
        
        const messages = [
            { role: 'system', content: systemPrompt || PROJECT_ECHO_SYSTEM_PROMPT_STATIC },
            ...history.slice(-10),
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
                    temperature: 0.1, // Ultra-strict: forces exact factual answers from the data
                    top_p: 0.85
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