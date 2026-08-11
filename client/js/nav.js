// Runs on every protected page. Redirects to login immediately if not authenticated.
requireLogin();

document.getElementById('navUsername').textContent = localStorage.getItem('ims_username') || 'admin';

document.getElementById('logoutBtn').addEventListener('click', () => {
  clearSession();
  window.location.href = 'index.html';
});

document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('mainNav').classList.toggle('open');
});
