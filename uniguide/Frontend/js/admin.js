// ─── ACTIVITY LOGS ───────────────────────────────────
const ACTIVITY_LOGS = [
  { id:1, action:"Promoted Timothy Green to Super Admin", admin:'Michael Lee', role:'Super Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:2, action:"Changed Ashley Carter's permissions", admin:'Michael Lee', role:'Super Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:3, action:"Added a new admin, Daniel Kim", admin:'Michael Lee', role:'Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:4, action:"Deleted user Olivia Brown", admin:'Michael Lee', role:'Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:5, action:"Password reset for Lisa Thompson", admin:'Emily White', role:'Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:6, action:"Created a new admin profile for Emily White", admin:'Michael Lee', role:'Super Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:7, action:"Created a new admin profile for Emily White", admin:'Michael Lee', role:'Super Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:8, action:"Deleted the admin profile for Sarah Jordan", admin:'Michael Lee', role:'Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:9, action:"Created a new admin profile for Emily White", admin:'Michael Lee', role:'Super Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:10, action:"Deleted user Olivia Brown", admin:'Michael Lee', role:'Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:11, action:"Added a new admin, Daniel Kim", admin:'Timothy Green', role:'Super Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
];
let activityLogFilter = '';

function addActivityLog(action, adminName) {
  const now = new Date();
  const dateStr = 'Just now – ' + now.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) + ' at ' + now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
  ACTIVITY_LOGS.unshift({ id: Date.now(), action, admin: adminName, role: DB.currentUser ? (DB.currentUser.role==='superadmin'?'Super Admin':'Admin') : 'Admin', date: dateStr });
}

function renderActivityLogs(filter) {
  const tbody = document.getElementById('activity-log-tbody');
  if (!tbody) return;
  const f = (filter !== undefined ? filter : activityLogFilter).toLowerCase();
  const list = f ? ACTIVITY_LOGS.filter(l => l.action.toLowerCase().includes(f) || l.admin.toLowerCase().includes(f)) : ACTIVITY_LOGS;
  tbody.innerHTML = list.map(l => `<tr>
    <td><input type="checkbox" class="sa-checkbox"></td>
    <td><div class="sa-activity-text">${l.action}</div></td>
    <td>
      <div class="sa-user-cell">
        <div class="sa-user-avatar" style="background:rgba(124,58,237,0.15);color:#7c3aed;font-size:0.9rem">👤</div>
        <div>
          <div class="sa-user-name">${l.admin}</div>
          <div class="sa-user-email">${l.role}</div>
        </div>
      </div>
    </td>
    <td style="font-size:0.78rem;color:rgba(109,40,217,0.6);white-space:nowrap">${l.date}</td>
  </tr>`).join('');
}

function filterActivityLogs(val) {
  activityLogFilter = val;
  renderActivityLogs(val);
}

// ─── SA DASHBOARD LIVE UPDATE ─────────────────────────
function updateSADashboard() {
  const users = DB.users.filter(u => u.role === 'user').length;
  const admins = DB.users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
  const du = document.getElementById('sa-dash-users');
  const da = document.getElementById('sa-dash-admins');
  if (du) du.textContent = users.toLocaleString();
  if (da) da.textContent = admins;
}

// ─── EDIT ADMIN MODAL ─────────────────────────────────
function openEditAdminModal(id) {
  const u = DB.users.find(x=>x.id===id);
  if (!u) return;
  const box = document.createElement('div');
  box.className = 'modal-overlay open';
  box.id = 'modal-edit-admin-temp';
  box.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" onclick="document.getElementById('modal-edit-admin-temp').remove()">✕</button>
      <div class="modal-title">✏️ Edit Admin — ${u.name}</div>
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input class="form-input" id="edit-admin-name" type="text" value="${u.name}">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="edit-admin-email" type="email" value="${u.email}">
      </div>
      <div class="form-group">
        <label class="form-label">Role</label>
        <select class="form-input" id="edit-admin-role" style="cursor:pointer">
          <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
          <option value="superadmin" ${u.role==='superadmin'?'selected':''}>Super Admin</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-input" id="edit-admin-status" style="cursor:pointer">
          <option value="active" ${u.active?'selected':''}>Active</option>
          <option value="inactive" ${!u.active?'selected':''}>Inactive</option>
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="document.getElementById('modal-edit-admin-temp').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="saveAdminEdit(${id})">Save Changes</button>
      </div>
    </div>`;
  document.body.appendChild(box);
  box.addEventListener('click', e => { if(e.target===box) box.remove(); });
}

function saveAdminEdit(id) {
  const u = DB.users.find(x=>x.id===id);
  if (!u) return;
  u.name   = document.getElementById('edit-admin-name').value.trim() || u.name;
  u.email  = document.getElementById('edit-admin-email').value.trim() || u.email;
  u.role   = document.getElementById('edit-admin-role').value;
  u.active = document.getElementById('edit-admin-status').value === 'active';
  document.getElementById('modal-edit-admin-temp').remove();
  toast('Admin "' + u.name + '" updated! ✓');
  addActivityLog('Updated admin "' + u.name + '"', DB.currentUser ? DB.currentUser.name : 'Super Admin');
  renderAdminTable();
}

// ─── EDIT USER MODAL ──────────────────────────────────
function openEditUserModal(id) {
  const u = DB.users.find(x=>x.id===id);
  if (!u) return;
  const box = document.createElement('div');
  box.className = 'modal-overlay open';
  box.id = 'modal-edit-user-temp';
  box.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" onclick="document.getElementById('modal-edit-user-temp').remove()">✕</button>
      <div class="modal-title">✏️ Edit User — ${u.name}</div>
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input class="form-input" id="edit-user-name" type="text" value="${u.name}">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="edit-user-email" type="email" value="${u.email}">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-input" id="edit-user-status" style="cursor:pointer">
          <option value="active" ${u.active?'selected':''}>Online / Active</option>
          <option value="inactive" ${!u.active?'selected':''}>Offline / Inactive</option>
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="document.getElementById('modal-edit-user-temp').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="saveUserEdit(${id})">Save Changes</button>
      </div>
    </div>`;
  document.body.appendChild(box);
  box.addEventListener('click', e => { if(e.target===box) box.remove(); });
}

function saveUserEdit(id) {
  const u = DB.users.find(x=>x.id===id);
  if (!u) return;
  u.name   = document.getElementById('edit-user-name').value.trim() || u.name;
  u.email  = document.getElementById('edit-user-email').value.trim() || u.email;
  u.active = document.getElementById('edit-user-status').value === 'active';
  document.getElementById('modal-edit-user-temp').remove();
  toast('User "' + u.name + '" updated! ✓');
  addActivityLog('Updated user "' + u.name + '"', DB.currentUser ? DB.currentUser.name : 'Admin');
  renderUserTable();
  renderAdminUserTable();
}

