// Shared workspace utilities

// Check login and set username in navbar
async function initPage() {
  try {
    const res = await fetch('/auth/me');
    const data = await res.json();
    if (!data.success) {
      window.location.href = '/login.html';
      return null;
    }
    const el = document.getElementById('welcomeUser');
    if (el) el.textContent = '👋 ' + data.user.fullname;
    return data.user;
  } catch {
    window.location.href = '/login.html';
    return null;
  }
}

// Save data to localStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Load data from localStorage
function loadData(key) {
  const d = localStorage.getItem(key);
  return d ? JSON.parse(d) : [];
}

// Format date nicely
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

// Logout
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      await fetch('/auth/logout');
      window.location.href = '/login.html';
    });
  }
});