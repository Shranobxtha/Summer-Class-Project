// This file is loaded on every page. It centralizes all communication with the backend
// so no other file needs to know the base URL or how tokens are attached.

// While developing (localhost) this talks to your local server.
// Once deployed, it talks to your Render backend instead - just fill in the URL below
// after you deploy to Render (it's shown at the top of your service's Render dashboard,
// looks like https://your-service-name.onrender.com).
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const RENDER_BACKEND_URL = 'https://summer-class-project-server.onrender.com'; // <-- update this after deploying

const SERVER_BASE = isLocal ? 'http://localhost:5000' : RENDER_BACKEND_URL;
const API_BASE = `${SERVER_BASE}/api`;

// Reads the saved login token from the browser's storage
function getToken() {
  return localStorage.getItem('ims_token');
}

function isLoggedIn() {
  return !!getToken();
}

function saveSession(token, username) {
  localStorage.setItem('ims_token', token);
  localStorage.setItem('ims_username', username);
}

function clearSession() {
  localStorage.removeItem('ims_token');
  localStorage.removeItem('ims_username');
}

// Sends a JSON request (used for login, and for suppliers which have no file upload)
async function apiRequest(path, { method = 'GET', body = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  // Only auto-redirect on 401 if we actually SENT a token (meaning a real session expired).
  // A login attempt with no token yet should just show the error message normally, not redirect.
  return handleResponse(res, !!token);
}

// Sends a multipart/form-data request (used for products, which include an image file)
async function apiRequestForm(path, { method = 'POST', formData }) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // NOTE: don't set Content-Type manually for FormData - the browser sets the correct
  // multipart boundary automatically. Setting it yourself breaks the upload.

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData,
  });

  return handleResponse(res, !!token);
}

async function handleResponse(res, hadToken) {
  // Only treat 401 as "your session expired, go log in again" when a token was actually sent.
  // Otherwise (e.g. a wrong username/password on the login form itself) it's just a normal
  // error to display on the current page - no redirect, no reload.
  if (res.status === 401 && hadToken) {
    clearSession();
    window.location.href = 'index.html';
    throw new Error('Session expired');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // The server always sends { error: "specific message" } - surface that exact message
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// Call this at the top of every protected page (products.html, suppliers.html, etc.)
// If there's no valid session, it immediately redirects to login.
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = 'index.html';
  }
}
