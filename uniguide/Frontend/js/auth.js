// ─── AUTH HELPERS ─────────────────────────────────────
function updateNav() {
  const u = DB.currentUser;
  document.getElementById('nav-guest').style.display = u ? 'none' : 'flex';
  document.getElementById('nav-auth').style.display  = u ? 'flex' : 'none';
  if (u) {
    let badge = '';
    if (u.role === 'superadmin') badge = '<span class="role-badge badge-superadmin">Super Admin</span>';
    else if (u.role === 'admin') badge = '<span class="role-badge badge-admin">Admin</span>';
    document.getElementById('nav-username').innerHTML = 'Hi, ' + u.name + badge;
  }
  const badge = document.getElementById('hero-badge');
  const cta   = document.getElementById('hero-cta');
  const myResultsBtn = document.getElementById('nav-my-results-btn');
  if (u) {
    badge.textContent = 'Welcome back, ' + u.name + '!';
    cta.textContent = u.role === 'superadmin' ? 'Go to Super Admin Dashboard' : u.role === 'admin' ? 'Go to Admin Dashboard' : 'Start Quiz 🎯';
    cta.onclick = u.role === 'superadmin' ? () => showDash('sa-dashboard') : u.role === 'admin' ? () => showDash('admin-dashboard') : () => showPage('quiz-1');
    if (myResultsBtn) myResultsBtn.style.display = u.role === 'user' ? 'inline-flex' : 'none';
  } else {
    badge.textContent = 'Smart Career Guidance';
    cta.textContent = 'Start Now';
    cta.onclick = () => showPage('register');
    if (myResultsBtn) myResultsBtn.style.display = 'none';
  }
}

function showAlert(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

function toast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast toast-' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── REGISTER ────────────────────────────────────────
function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  const conf  = document.getElementById('reg-confirm').value;
  if (!name || !email || !pass) return showAlert('reg-alert','Please fill in all fields.');
  if (pass !== conf) return showAlert('reg-alert','Passwords do not match.');
  if (pass.length < 6) return showAlert('reg-alert','Password must be at least 6 characters.');
  if (DB.users.find(u => u.email === email)) return showAlert('reg-alert','Email already registered.');
  const user = {id: DB.nextId++, name, email, password:pass, role:'user', active:true};
  DB.users.push(user);
  DB.currentUser = user;
  updateNav();
  toast('Welcome to UniGuide, ' + name + '! 🎉 Let\'s find your major!');
  showPage('quiz-1');
}

// ─── LOGIN ───────────────────────────────────────────
function doLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  const user  = DB.users.find(u => u.email === email && u.password === pass);
  if (!user) return showAlert('login-alert','Invalid email or password.');
  DB.currentUser = user;
  updateNav();
  if (user.role === 'user') {
    toast('Welcome back, ' + user.name + '! 👋 Ready to explore?');
    showPage('quiz-1');
  } else {
    toast('Welcome back, ' + user.name + '! 👋');
    showPage('home');
  }
}

// ─── ADMIN LOGIN ─────────────────────────────────────
function doAdminLogin() {
  const email = document.getElementById('admin-email').value.trim().toLowerCase();
  const pass  = document.getElementById('admin-pass').value;
  const user  = DB.users.find(u => u.email === email && u.password === pass && (u.role === 'admin' || u.role === 'superadmin'));
  if (!user) return showAlert('admin-alert','Invalid admin credentials or insufficient permissions.');
  DB.currentUser = user;
  updateNav();
  toast('Logged in as Admin – ' + user.name + ' 🔑');
  showDash('admin-dashboard');
}

// ─── SUPER ADMIN LOGIN ───────────────────────────────
function doSuperAdminLogin() {
  const email = document.getElementById('sal-email').value.trim().toLowerCase();
  const pass  = document.getElementById('sal-pass').value;
  const user  = DB.users.find(u => u.email === email && u.password === pass && u.role === 'superadmin');
  if (!user) return showAlert('sa-alert','Invalid super admin credentials.');
  DB.currentUser = user;
  updateNav();
  toast('Logged in as Super Admin – ' + user.name + ' 👑');
  showDash('sa-dashboard');
  updateSADashboard();
  // Update all SA name references
  ['sa-topbar-name','sa-foot-name-sa-dashboard','sa-foot-name-sa-management',
   'sa-foot-name-sa-users','sa-foot-name-sa-activitylogs','sa-foot-name-sa-settings'
  ].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=user.name; });
}

// ─── LOGOUT ──────────────────────────────────────────
function doLogout() {
  DB.currentUser = null;
  updateNav();
  toast('You have been logged out.', 'error');
  showPage('home');
}

