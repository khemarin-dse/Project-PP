// ─── CONTACT ─────────────────────────────────────────
function doContact() {
  const name = document.getElementById('c-name').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const msg = document.getElementById('c-message').value.trim();
  if (!name || !email || !msg) { toast('Please fill in all required fields.','error'); return; }
  const el = document.getElementById('contact-alert');
  el.textContent = '✓ Your message has been sent! We will get back to you soon.';
  el.style.display = 'block';
  document.getElementById('c-name').value = '';
  document.getElementById('c-email').value = '';
  document.getElementById('c-subject').value = '';
  document.getElementById('c-message').value = '';
  setTimeout(() => el.style.display = 'none', 5000);
}

// ─── MODALS ──────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ─── RENDER TABLES ───────────────────────────────────
function rolePill(role) {
  const map = {user:'role-user',admin:'role-admin',superadmin:'role-superadmin'};
  const label = {user:'User',admin:'Admin',superadmin:'Super Admin'};
  return `<span class="role-pill ${map[role]||'role-user'}">${label[role]||role}</span>`;
}
function statusToggle(user, context) {
  const cls = user.active ? 'status-on' : 'status-off';
  const lbl = user.active ? 'Active' : 'Inactive';
  return `<button class="status-toggle ${cls}" onclick="toggleStatus(${user.id},'${context}')">
    <span class="status-dot"></span>${lbl}
  </button>`;
}
function initials(name) {
  return name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
}
function userCell(u) {
  return `<div class="user-cell"><div class="user-avatar">${initials(u.name)}</div><div><div class="user-name">${u.name}</div><div class="user-email">${u.email}</div></div></div>`;
}

function toggleStatus(id, context) {
  const u = DB.users.find(x=>x.id===id);
  if (!u) return;
  u.active = !u.active;
  addActivityLog((u.active?'Activated':'Deactivated') + ' user "' + u.name + '"', DB.currentUser ? DB.currentUser.name : 'Admin');
  toast((u.active ? '✓ Activated: ' : '✗ Deactivated: ') + u.name, u.active ? 'success' : 'error');
  if (context === 'sa-admin') renderAdminTable();
  else if (context === 'sa-user') renderUserTable();
  else if (context === 'admin-user') renderAdminUserTable();
}

function deleteUser(id, context) {
  const idx = DB.users.findIndex(x=>x.id===id);
  if (idx < 0) return;
  const u = DB.users[idx];
  if (!confirm("Delete \"" + u.name + "\"? This cannot be undone.")) return;
  DB.users.splice(idx, 1);
  addActivityLog('Deleted ' + (u.role==='user'?'user':'admin') + ' "' + u.name + '"', DB.currentUser ? DB.currentUser.name : 'Super Admin');
  toast('Deleted: ' + u.name, 'error');
  if (context === 'sa-admin') { renderAdminTable(); updateSADashboard(); }
  else if (context === 'sa-user') { renderUserTable(); updateSADashboard(); }
  else if (context === 'admin-user') renderAdminUserTable();
}

function renderAdminTable(filter) {
  const admins = DB.users.filter(u => u.role === 'admin' || u.role === 'superadmin');
  const tbody = document.getElementById('admin-tbody');
  if (!tbody) return;
  // Update SA dashboard stat
  const dashAdmins = document.getElementById('sa-dash-admins');
  if (dashAdmins) dashAdmins.textContent = admins.length;
  const list = filter ? admins.filter(u=>u.name.toLowerCase().includes(filter)||u.email.toLowerCase().includes(filter)) : admins;
  tbody.innerHTML = list.map(u => `<tr>
    <td><input type="checkbox" class="sa-checkbox"></td>
    <td><div class="sa-user-cell">
      <div class="sa-user-avatar">${initials(u.name)}</div>
      <div><div class="sa-user-name">${u.name}</div><div class="sa-user-email">${u.email}</div></div>
    </div></td>
    <td>${u.email}</td>
    <td><span class="sa-role-pill ${u.role==='superadmin'?'sa-role-superadmin':'sa-role-admin'}">${u.role==='superadmin'?'Super Admin':'Admin'}</span></td>
    <td>
      <button class="sa-action-btn" title="Settings" onclick="openEditAdminModal(${u.id})">⚙️</button>
      <button class="sa-delete-btn" onclick="deleteUser(${u.id},'sa-admin')">Delete</button>
    </td>
  </tr>`).join('');
}

function renderUserTable(filter) {
  const users = DB.users.filter(u => u.role === 'user');
  const actv = users.filter(u=>u.active).length;
  const tbody = document.getElementById('user-tbody');
  if (!tbody) return;
  // Update stat counters (SA users page)
  const saOn = document.getElementById('sa-online-count');
  const saOff = document.getElementById('sa-offline-count');
  if (saOn) saOn.textContent = actv.toLocaleString();
  if (saOff) saOff.textContent = (users.length - actv).toLocaleString();
  // Update SA dashboard stat
  const dashUsers = document.getElementById('sa-dash-users');
  if (dashUsers) dashUsers.textContent = users.length.toLocaleString();
  const list = filter ? users.filter(u=>u.name.toLowerCase().includes(filter.toLowerCase())||u.email.toLowerCase().includes(filter.toLowerCase())) : users;
  tbody.innerHTML = list.map(u => `<tr>
    <td><input type="checkbox" class="sa-checkbox"></td>
    <td><div class="sa-user-cell">
      <div class="sa-user-avatar">${initials(u.name)}</div>
      <div><div class="sa-user-name">${u.name}</div></div>
    </div></td>
    <td>${u.email}</td>
    <td><span class="sa-role-pill sa-role-user">User</span></td>
    <td>
      <button class="sa-status-toggle ${u.active?'sa-status-on':'sa-status-off'}" onclick="toggleStatus(${u.id},'sa-user')">
        <span class="sa-status-dot"></span>${u.active?'Online':'Offline'}
      </button>
    </td>
    <td>
      <button class="sa-action-btn" title="Edit" onclick="openEditUserModal(${u.id})">⚙️</button>
      <button class="sa-delete-btn" onclick="deleteUser(${u.id},'sa-user')">Delete</button>
    </td>
  </tr>`).join('');
}

function renderAdminUserTable() {
  const users = DB.users.filter(u => u.role === 'user');
  const actv = users.filter(u=>u.active).length;
  const tbody = document.getElementById('admin-user-tbody');
  if (!tbody) return;
  const au = document.getElementById('au-active');
  const ain = document.getElementById('au-inactive');
  const at = document.getElementById('au-total');
  if (au) au.textContent = actv;
  if (ain) ain.textContent = users.length - actv;
  if (at) at.textContent = users.length;
  tbody.innerHTML = users.map(u => `<tr>
    <td>${userCell(u)}</td>
    <td>${u.email}</td>
    <td>${rolePill(u.role)}</td>
    <td>${statusToggle(u,'admin-user')}</td>
    <td><button class="btn btn-outline" style="font-size:0.72rem;padding:0.25rem 0.6rem;color:#f87171;border-color:rgba(239,68,68,0.3)" onclick="deleteUser(${u.id},'admin-user')">Delete</button></td>
  </tr>`).join('');
}

function filterUsers(val) { renderUserTable(val); }

// ─── ADD ADMIN ───────────────────────────────────────
function doAddAdmin() {
  const name  = document.getElementById('new-admin-name').value.trim();
  const email = document.getElementById('new-admin-email').value.trim().toLowerCase();
  const role  = document.getElementById('new-admin-role').value;
  const pass  = document.getElementById('new-admin-pass').value;
  const pass2 = document.getElementById('new-admin-pass2').value;
  if (!name || !email || !pass) return toast('Please fill all fields.','error');
  if (pass !== pass2) return toast('Passwords do not match.','error');
  if (pass.length < 6) return toast('Password must be at least 6 characters.','error');
  if (DB.users.find(u=>u.email===email)) return toast('Email already exists.','error');
  const roleLabel = role === 'superadmin' ? 'Super Admin' : 'Admin';
  DB.users.push({id:DB.nextId++, name, email, password:pass, role, active:true});
  // Log the action
  addActivityLog(roleLabel + ' "' + name + '" added', DB.currentUser ? DB.currentUser.name : 'Super Admin');
  closeModal('modal-add-admin');
  toast(roleLabel + ' ' + name + ' created! ✓');
  renderAdminTable();
  document.getElementById('new-admin-name').value='';
  document.getElementById('new-admin-email').value='';
  document.getElementById('new-admin-role').value='admin';
  document.getElementById('new-admin-pass').value='';
  document.getElementById('new-admin-pass2').value='';
}

// ─── ADD USER ────────────────────────────────────────
function doAddUser() {
  const name   = document.getElementById('new-user-name').value.trim();
  const email  = document.getElementById('new-user-email').value.trim().toLowerCase();
  const statusEl = document.getElementById('new-user-status');
  const active = statusEl ? statusEl.value === 'active' : true;
  const pass   = document.getElementById('new-user-pass').value;
  const pass2  = document.getElementById('new-user-pass2').value;
  if (!name || !email || !pass) return toast('Please fill all fields.','error');
  if (pass !== pass2) return toast('Passwords do not match.','error');
  if (pass.length < 6) return toast('Password must be at least 6 characters.','error');
  if (DB.users.find(u=>u.email===email)) return toast('Email already exists.','error');
  DB.users.push({id:DB.nextId++, name, email, password:pass, role:'user', active});
  addActivityLog('User "' + name + '" added', DB.currentUser ? DB.currentUser.name : 'Admin');
  closeModal('modal-add-user');
  toast('User ' + name + ' created! ✓');
  renderUserTable();
  renderAdminUserTable();
  document.getElementById('new-user-name').value='';
  document.getElementById('new-user-email').value='';
  document.getElementById('new-user-pass').value='';
  document.getElementById('new-user-pass2').value='';
  if (statusEl) statusEl.value='active';
}

// ─── SETTINGS SAVE ───────────────────────────────────
function saveSAProfile() {
  const name = document.getElementById('sa-edit-name').value.trim();
  const email = document.getElementById('sa-edit-email').value.trim();
  if (DB.currentUser) {
    if (name) DB.currentUser.name = name;
    if (email) DB.currentUser.email = email;
    updateNav();
    const pn = document.getElementById('sa-profile-name');
    const pe = document.getElementById('sa-profile-email');
    if (pn) pn.textContent = DB.currentUser.name;
    if (pe) pe.textContent = DB.currentUser.email;
    // Sync all SA topbar/footer name elements
    ['sa-topbar-name','sa-foot-name-sa-dashboard','sa-foot-name-sa-management',
     'sa-foot-name-sa-users','sa-foot-name-sa-activitylogs','sa-foot-name-sa-settings'
    ].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=DB.currentUser.name; });
  }
  toast('Profile saved! ✓');
}

// ─── CHAT ────────────────────────────────────────────
function sendChat() {
  const inp = document.getElementById('chat-input-field');
  const msg = inp.value.trim();
  if (!msg) return;
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg sent';
  div.innerHTML = `<div class="chat-msg-avatar">🛡️</div><div><div class="chat-bubble">${msg}</div></div>`;
  container.appendChild(div);
  inp.value = '';
  container.scrollTop = container.scrollHeight;
}



// ─── PASSWORD VISIBILITY TOGGLE ───────────────────────
function togglePassVis(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const isHidden = inp.type === 'password';
  inp.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁';
}

// ─── SUPER ADMIN LOGIN ────────────────────────────────
function doSALogin() {
  const email = document.getElementById('sal-email').value.trim().toLowerCase();
  const pass  = document.getElementById('sal-pass').value;
  const alert = document.getElementById('sa-alert');
  const user  = DB.users.find(u => u.email === email && u.password === pass && u.role === 'superadmin');
  if (!user) {
    alert.textContent = '❌ Invalid credentials or insufficient permissions.';
    alert.style.display = 'block';
    setTimeout(() => alert.style.display = 'none', 4000);
    return;
  }
  DB.currentUser = user;
  updateNav();
  toast('Logged in as Super Admin – ' + user.name + ' 👑');
  showDash('sa-dashboard');
  updateSADashboard();
  ['sa-topbar-name','sa-foot-name-sa-dashboard','sa-foot-name-sa-management',
   'sa-foot-name-sa-users','sa-foot-name-sa-activitylogs','sa-foot-name-sa-settings'
  ].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=user.name; });
  document.getElementById('sal-email').value = '';
  document.getElementById('sal-pass').value  = '';
}

