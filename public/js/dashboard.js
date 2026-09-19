async function loadDashboard() {
  try {
    const response = await fetch('/auth/me');
    const data = await response.json();

    if (!data.success) {
      window.location.href = '/login.html';
      return;
    }

    const user = data.user;
    document.getElementById('welcomeUser').textContent = '👋 ' + user.fullname;
    document.getElementById('dashboardTitle').textContent = 'Welcome back, ' + user.fullname + '! 👋';
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('memberSince').textContent = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

  } catch (err) {
    window.location.href = '/login.html';
  }
}

document.getElementById('logoutBtn').addEventListener('click', async function(e) {
  e.preventDefault();
  await fetch('/auth/logout');
  window.location.href = '/login.html';
});

loadDashboard();