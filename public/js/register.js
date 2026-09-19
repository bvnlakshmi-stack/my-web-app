document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const fullname = document.getElementById('fullname').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  // Show loading
  const btn = document.querySelector('.btn');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, password })
    });

    const data = await response.json();

    if (data.success) {
      message.className = 'success';
      message.textContent = '✅ ' + data.message;
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1500);
    } else {
      message.className = 'error';
      message.textContent = '❌ ' + data.message;
      btn.textContent = 'Create Account';
      btn.disabled = false;
    }
  } catch (err) {
    message.className = 'error';
    message.textContent = '❌ Something went wrong. Try again.';
    btn.textContent = 'Create Account';
    btn.disabled = false;
  }
});