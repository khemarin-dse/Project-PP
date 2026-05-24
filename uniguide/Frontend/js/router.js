// ─── PAGE ROUTER ──────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + id);
  if (pg) { pg.classList.add('active'); window.scrollTo(0,0); }
  ['home','about','contact'].forEach(n => {
    const el = document.getElementById('nav-' + n);
    if (el) el.classList.toggle('active', n === id);
  });
}

// ─── DASHBOARD ROUTER ─────────────────────────────────
function showDash(dash) {
  showPage(dash);
  if (dash === 'sa-management') renderAdminTable();
  if (dash === 'sa-users') renderUserTable();
  if (dash === 'sa-activitylogs') renderActivityLogs();
  if (dash === 'sa-dashboard') updateSADashboard();
  if (dash === 'admin-users') renderAdminUserTable();
  // Sync SA topbar + footer names
  if (DB.currentUser) {
    ['sa-topbar-name','sa-foot-name-sa-dashboard','sa-foot-name-sa-management',
     'sa-foot-name-sa-users','sa-foot-name-sa-activitylogs','sa-foot-name-sa-settings'
    ].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=DB.currentUser.name; });
  }
  if (dash === 'sa-settings' && DB.currentUser) {
    const n = document.getElementById('sa-profile-name');
    const e = document.getElementById('sa-profile-email');
    const en = document.getElementById('sa-edit-name');
    const ee = document.getElementById('sa-edit-email');
    if (n) n.textContent = DB.currentUser.name;
    if (e) e.textContent = DB.currentUser.email;
    if (en) en.value = DB.currentUser.name;
    if (ee) ee.value = DB.currentUser.email;
  }
  if (dash === 'admin-settings' && DB.currentUser) {
    const n = document.getElementById('admin-profile-name');
    const e = document.getElementById('admin-profile-email');
    if (n) n.textContent = DB.currentUser.name;
    if (e) e.textContent = DB.currentUser.email;
  }
}

