const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');

// Helper to log activity
function logActivity(userId, action) {
  db.run('INSERT INTO activity_log (user_id, action) VALUES (?, ?)', [userId, action]);
}

// ── REGISTER ──────────────────────────────────────
router.post('/register', (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.json({ success: false, message: 'All fields are required!' });
  }

  if (password.length < 6) {
    return res.json({ success: false, message: 'Password must be at least 6 characters!' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (user) {
      return res.json({ success: false, message: 'Email already registered!' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
      'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)',
      [fullname, email, hashedPassword],
      function(err) {
        if (err) {
          return res.json({ success: false, message: 'Registration failed!' });
        }
        logActivity(this.lastID, 'Account Created');
        res.json({ success: true, message: 'Account created successfully!' });
      }
    );
  });
});

// ── LOGIN ─────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'All fields are required!' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (!user) {
      return res.json({ success: false, message: 'Email not found!' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Incorrect password!' });
    }

    req.session.user = {
      id: user.id,
      fullname: user.fullname,
      email: user.email
    };

    logActivity(user.id, 'Logged In');
    res.json({ success: true, message: 'Login successful!' });
  });
});

// ── LOGOUT ────────────────────────────────────────
router.get('/logout', (req, res) => {
  if (req.session.user) {
    logActivity(req.session.user.id, 'Logged Out');
  }
  req.session.destroy();
  res.json({ success: true, message: 'Logged out!' });
});

// ── GET CURRENT USER ──────────────────────────────
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false, message: 'Not logged in' });
  }
});

// ── UPDATE PROFILE ────────────────────────────────
router.post('/update-profile', (req, res) => {
  if (!req.session.user) {
    return res.json({ success: false, message: 'Not logged in!' });
  }

  const { fullname, bio } = req.body;
  const userId = req.session.user.id;

  db.run(
    'UPDATE users SET fullname = ?, bio = ? WHERE id = ?',
    [fullname, bio, userId],
    function(err) {
      if (err) {
        return res.json({ success: false, message: 'Update failed!' });
      }
      logActivity(userId, 'Profile Updated');
      req.session.user.fullname = fullname;
      res.json({ success: true, message: 'Profile updated!' });
    }
  );
});

// ── ACTIVITY HISTORY ──────────────────────────────
router.get('/activity', (req, res) => {
  if (!req.session.user) {
    return res.json({ success: false, message: 'Not logged in!' });
  }

  db.all(
    'SELECT action, timestamp FROM activity_log WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50',
    [req.session.user.id],
    (err, rows) => {
      if (err) {
        return res.json({ success: false, message: 'Failed to load activity!' });
      }
      res.json({ success: true, activity: rows });
    }
  );
});

module.exports = router;