async function loadActivity() {
  try {
    const meRes = await fetch('/auth/me');
    const meData = await meRes.json();

    if (!meData.success) {
      window.location.href = '/login.html';
      return;
    }

    document.getElementById('welcomeUser').textContent = '👋 ' + meData.user.fullname;

    const res = await fetch('/auth/activity');
    const data = await res.json();

    const tbody = document.getElementById('activityBody');

    if (!data.activity || data.activity.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" class="loading-row">No activity yet!</td></tr>';
      return;
    }

    tbody.innerHTML = data.activity.map(item => {
      const date = new Date(item.timestamp).toLocaleString('en-US', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit', hour12: true
      });

      let badgeClass = 'action-login';
      if (item.action.includes('Out'))      badgeClass = 'action-logout';
      if (item.action.includes('Created'))  badgeClass = 'action-register';
      if (item.action.includes('Profile'))  badgeClass = 'action-profile';

      return `
        <tr>
          <td>${date}</td>
          <td><span class="action-badge ${badgeClass}">${item.action}</span></td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    window.location.href = '/login.html';
  }
}

document.getElementById('logoutBtn').addEventListener('click', async function(e) {
  e.preventDefault();
  await fetch('/auth/logout');
  window.location.href = '/login.html';
});

loadActivity();