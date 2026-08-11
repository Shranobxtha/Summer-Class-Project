// If already logged in, skip the login page entirely
if (isLoggedIn()) {
  window.location.href = 'products.html';
}

// Stamp today's date on the ticket, mono-style, just a nice detail tying into the theme
document.getElementById('ticketDate').textContent = new Date()
  .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  .toUpperCase();

const form = document.getElementById('loginForm');
const usernameField = document.getElementById('usernameField');
const passwordField = document.getElementById('passwordField');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.remove('show');

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // CLIENT-SIDE VALIDATION: immediate feedback, no round trip to the server needed
  let hasError = false;
  usernameField.classList.toggle('has-error', !username);
  passwordField.classList.toggle('has-error', !password);
  if (!username || !password) hasError = true;
  if (hasError) return;

  loginBtn.disabled = true;
  loginBtn.textContent = 'Checking credentials...';

  try {
    // SERVER-SIDE VALIDATION is the real gate - this call fails if credentials are wrong,
    // even if someone bypassed the client-side checks above
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username, password },
    });

    saveSession(data.token, data.username);
    window.location.href = 'products.html';
  } catch (err) {
    loginError.textContent = err.message;
    loginError.classList.add('show');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Enter warehouse';

    // Clear the password so they're not stuck manually deleting a wrong guess,
    // and put focus back on it since that's almost always what needs re-typing
    const passwordInput = document.getElementById('password');
    passwordInput.value = '';
    passwordInput.focus();
  }
});
