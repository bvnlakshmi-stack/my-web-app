document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  // Show loading
  const btn = document.querySelector('.btn');
  btn.textContent = 'Logging in...';
  btn.disabled = true;

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      message.className = 'success';
      message.textContent = '✅ ' + data.message;
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    } else {
      message.className = 'error';
      message.textContent = '❌ ' + data.message;
      btn.textContent = 'Login';
      btn.disabled = false;
    }
  } catch (err) {
    message.className = 'error';
    message.textContent = '❌ Something went wrong. Try again.';
    btn.textContent = 'Login';
    btn.disabled = false;
  }
});