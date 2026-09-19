async function loadProfile() {
  try {
    const response = await fetch('/auth/me');
    const data = await response.json();

    if (!data.success) {
      window.location.href = '/login.html';
      return;
    }

    const user = data.user;

    // Set avatar letter
    document.getElementById('avatarCircle').textContent = user.fullname.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent = user.fullname;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('welcomeUser').textContent = '👋 ' + user.fullname;

    // Fill form
    document.getElementById('fullname').value = user.fullname;
    document.getElementById('email').value = user.email;
    document.getElementById('bio').value = user.bio || '';

  } catch (err) {
    window.location.href = '/login.html';
  }
}

// Save profile changes
document.getElementById('profileForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const fullname = document.getElementById('fullname').value;
  const bio = document.getElementById('bio').value;
  const msg = document.getElementById('profileMessage');

  const btn = document.querySelector('.save-btn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  try {
    const response = await fetch('/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, bio })
    });

    const data = await response.json();

    if (data.success) {
      msg.className = 'success';
      msg.textContent = '✅ Profile updated successfully!';
      document.getElementById('profileName').textContent = fullname;
      document.getElementById('avatarCircle').textContent = fullname.charAt(0).toUpperCase();
    } else {
      msg.className = 'error';
      msg.textContent = '❌ ' + data.message;
    }
  } catch (err) {
    msg.className = 'error';
    msg.textContent = '❌ Something went wrong!';
  }

  btn.textContent = '💾 Save Changes';
  btn.disabled = false;
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async function(e) {
  e.preventDefault();
  await fetch('/auth/logout');
  window.location.href = '/login.html';
});

loadProfile();