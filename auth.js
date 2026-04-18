// ══════════════════════════════════════════
// BETKING — AUTHENTICATION
// ══════════════════════════════════════════

let currentUser = null;

// ─── AUTH STATE ───
async function initAuth() {
  if (!supabaseClient) {
    // Demo mode: auto-login
    currentUser = { id: 'demo_user', email: 'demo@betking.com', user_metadata: { full_name: 'Demo Player' } };
    onAuthStateChange(currentUser);
    return;
  }

  // Get current session
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session?.user) {
    currentUser = session.user;
    onAuthStateChange(currentUser);
  }

  // Listen for auth changes
  supabaseClient.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    onAuthStateChange(currentUser);
  });
}

function onAuthStateChange(user) {
  if (user) {
    document.getElementById('nav-guest').classList.add('hidden');
    document.getElementById('nav-user').classList.remove('hidden');
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player';
    document.getElementById('user-name-display').textContent = name;
    loadWallet(user.id);
  } else {
    document.getElementById('nav-guest').classList.remove('hidden');
    document.getElementById('nav-user').classList.add('hidden');
    document.getElementById('wallet-balance').textContent = '₹0.00';
  }
}

// ─── LOGIN ───
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';

  if (!email || !password) { errEl.textContent = 'Please fill all fields.'; return; }

  if (!supabaseClient) {
    // Demo mode
    currentUser = { id: 'demo_user', email, user_metadata: { full_name: 'Demo Player' } };
    onAuthStateChange(currentUser);
    closeModal('auth-modal');
    showToast('Welcome back! (Demo Mode)', 'success');
    return;
  }

  const btn = document.querySelector('#login-form .btn-primary');
  btn.textContent = 'Logging in...';
  btn.disabled = true;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  btn.textContent = 'Login';
  btn.disabled = false;

  if (error) { errEl.textContent = error.message; return; }

  closeModal('auth-modal');
  showToast('Welcome back!', 'success');
}

// ─── SIGNUP ───
async function handleSignup() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const errEl = document.getElementById('signup-error');
  errEl.textContent = '';

  if (!name || !email || !password) { errEl.textContent = 'Please fill all fields.'; return; }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }

  if (!supabaseClient) {
    currentUser = { id: 'demo_user', email, user_metadata: { full_name: name } };
    onAuthStateChange(currentUser);
    closeModal('auth-modal');
    showToast('Account created! Welcome to BetKing (Demo Mode)', 'success');
    return;
  }

  const btn = document.querySelector('#signup-form .btn-primary');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  const { data, error } = await supabaseClient.auth.signUp({
    email, password,
    options: { data: { full_name: name } }
  });

  btn.textContent = 'Create Account';
  btn.disabled = false;

  if (error) { errEl.textContent = error.message; return; }

  // Create wallet for new user
  if (data.user) {
    await createWallet(data.user.id);
  }

  closeModal('auth-modal');
  showToast('Account created! Check your email to verify.', 'success');
}

// ─── LOGOUT ───
async function handleLogout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  currentUser = null;
  onAuthStateChange(null);
  showToast('Logged out successfully.', 'success');
}

// ─── MODAL TAB SWITCH ───
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
  document.getElementById(`${tab}-form`).classList.remove('hidden');
  document.querySelectorAll('.auth-tab').forEach(t => {
    if (t.textContent.toLowerCase().includes(tab === 'login' ? 'log' : 'sign')) {
      t.classList.add('active');
    }
  });
}

// ─── REQUIRE AUTH ───
function requireAuth(action) {
  if (!currentUser) {
    openModal('auth-modal');
    showToast('Please login to continue.', 'error');
    return false;
  }
  return true;
}
