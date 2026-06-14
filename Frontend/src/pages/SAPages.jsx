import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Modal from "../components/Modal";
import { usersApi, adminsApi, logsApi } from "../data/api";

function initials(name) {
  return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
}
function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return <button className={`toggle-switch${on?" on":""}`} onClick={()=>setOn(o=>!o)}/>;
}

/* ─── SA SIDEBAR ────────────────────────────────────────── */
function SASidebar({ active }) {
  const { currentUser, logout, setPage } = useApp();
  const doLogout = async () => { await logout(); setPage("home"); };
  const items = [
    { id:"sa-dashboard",    icon:"🏠", label:"Dashboard" },
    { id:"sa-management",   icon:"🛡️", label:"Admins Management" },
    { id:"sa-users",        icon:"👥", label:"Users Management" },
    { id:"sa-activitylogs", icon:"📋", label:"Activity Logs" },
    { id:"sa-settings",     icon:"⚙️", label:"Setting" },
  ];
  return (
    <aside className="sa-sidebar">
      <div className="sa-sidebar-brand">
        <div className="sa-brand-icon">🛡️</div>
        <div><div className="sa-brand-text">Super Admin</div></div>
      </div>
      <div style={{padding:"0.75rem 0"}}>
        {items.map(item=>(
          <div key={item.id} className={`sa-nav-item${active===item.id?" active":""}`} onClick={()=>setPage(item.id)}>
            <span className="nav-icon">{item.icon}</span>{item.label}
          </div>
        ))}
      </div>
      <div className="sa-profile-foot" style={{marginTop:"auto",paddingBottom:"0.5rem"}}>
        <div className="sa-profile-avatar">👑</div>
        <div>
          <div className="sa-profile-name">{currentUser?.name||"Super Admin"}</div>
          <div className="sa-profile-role">Super Admin</div>
        </div>
      </div>
      <div className="sa-sign-out"><button onClick={doLogout}>↪ Sign out</button></div>
    </aside>
  );
}

function SATopbar({ title }) {
  const { currentUser } = useApp();
  return (
    <div className="sa-topbar">
      <div className="sa-topbar-left"><div className="sa-topbar-title">≡ {title}</div></div>
      <div className="sa-topbar-right">
        <div className="sa-topbar-search"><span style={{color:"rgba(109,40,217,0.5)"}}>🔍</span><input placeholder="Search..."/></div>
        <div style={{fontSize:"1.2rem",cursor:"pointer",color:"#7c3aed"}}>🔔</div>
        <div className="sa-topbar-avatar">
          <div className="sa-topbar-avatar-img">👑</div>
          <div className="sa-topbar-avatar-info">
            <div className="name">{currentUser?.name||"Super Admin"}</div>
            <div className="role">Super Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SA DASHBOARD ──────────────────────────────────────── */
export function SADashboard() {
  const [stats, setStats]   = useState({ users:0, admins:0 });
  const [logs, setLogs]     = useState([]);

  useEffect(() => {
    usersApi.list().then(u => setStats(s=>({...s, users: u.length}))).catch(()=>{});
    adminsApi.list().then(a => setStats(s=>({...s, admins: a.length}))).catch(()=>{});
    logsApi.list().then(setLogs).catch(()=>{});
  }, []);

  return (
    <div className="page active">
      <div style={{display:"flex",minHeight:"100vh"}}>
        <SASidebar active="sa-dashboard"/>
        <div className="sa-main">
          <SATopbar title="Dashboard"/>
          <div className="sa-content">
            <div className="sa-welcome-banner">
              <h2>Welcome Back! Super Admin.</h2>
              <p>Here's what's happening on the platform today.</p>
            </div>
            <div className="sa-stats-row">
              <div className="sa-stat-card"><div className="sa-stat-icon sa-stat-icon-purple">👤</div><div><div className="sa-stat-num">{stats.users}</div><div className="sa-stat-label">Total Users</div></div></div>
              <div className="sa-stat-card"><div className="sa-stat-icon sa-stat-icon-yellow">🛡️</div><div><div className="sa-stat-num">{stats.admins}</div><div className="sa-stat-label">Total Admins</div></div></div>
              <div className="sa-stat-card"><div className="sa-stat-icon sa-stat-icon-green">✅</div><div><div className="sa-stat-num">All Systems</div><div className="sa-stat-label">System Status: Operational</div></div></div>
            </div>
            <div className="sa-card">
              <div className="sa-card-title" style={{fontSize:"1.1rem",fontWeight:"800"}}>Recent Activity</div>
              {logs.slice(0,7).map((log,i)=>(
                <div className="sa-activity-item" key={log.id||i}>
                  <div className="sa-activity-icon">👑</div>
                  <div>
                    <div className="sa-activity-text"><strong>{log.performed_by}</strong> — {log.action}</div>
                    <div className="sa-activity-time">{new Date(log.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SA ADMIN MANAGEMENT ───────────────────────────────── */
export function SAManagement() {
  const { showToast } = useApp();
  const [admins, setAdmins]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAdmin, setEditAdmin]       = useState(null);
  const [newAdmin, setNewAdmin]         = useState({ name:"", email:"", role:"admin", pass:"", pass2:"" });
  const [saving, setSaving]             = useState(false);

  const loadAdmins = () => {
    setLoading(true);
    adminsApi.list().then(setAdmins).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { loadAdmins(); }, []);

  const doAddAdmin = async () => {
    const { name, email, role, pass, pass2 } = newAdmin;
    if (!name||!email||!pass) { showToast("Please fill all fields.","error"); return; }
    if (pass!==pass2) { showToast("Passwords do not match.","error"); return; }
    if (pass.length<6) { showToast("Password must be at least 6 characters.","error"); return; }
    setSaving(true);
    try {
      await adminsApi.create(name, email, pass, pass2, role);
      showToast(`${role==="superadmin"?"Super Admin":"Admin"} ${name} created! ✓`);
      setShowAddModal(false);
      setNewAdmin({ name:"", email:"", role:"admin", pass:"", pass2:"" });
      loadAdmins();
    } catch(e) { showToast(e.message,"error"); }
    finally { setSaving(false); }
  };

  const doSaveEdit = async () => {
    if (!editAdmin) return;
    setSaving(true);
    try {
      await adminsApi.update(editAdmin.id, { name:editAdmin.name, email:editAdmin.email, role:editAdmin.role, active:editAdmin.active });
      showToast(`Admin "${editAdmin.name}" updated! ✓`);
      setEditAdmin(null);
      loadAdmins();
    } catch(e) { showToast(e.message,"error"); }
    finally { setSaving(false); }
  };

  const deleteAdmin = async (id) => {
    const u = admins.find(x=>x.id===id);
    if (!u||!window.confirm(`Delete "${u.name}"?`)) return;
    try {
      await adminsApi.remove(id);
      showToast(`Deleted: ${u.name}`,"error");
      loadAdmins();
    } catch(e) { showToast(e.message,"error"); }
  };

  return (
    <div className="page active">
      <div style={{display:"flex",minHeight:"100vh"}}>
        <SASidebar active="sa-management"/>
        <div className="sa-main">
          <SATopbar title="Dashboard"/>
          <div className="sa-content">
            <div className="sa-card-title" style={{fontSize:"1.2rem",fontWeight:"800",color:"#3b0764",marginBottom:"1.25rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              Admin Management
              <button className="sa-add-btn" onClick={()=>setShowAddModal(true)}>+ Add Admin</button>
            </div>
            <div className="sa-card">
              {loading ? <p style={{padding:"1rem",color:"rgba(109,40,217,0.5)"}}>Loading…</p> : (
                <table className="sa-table">
                  <thead><tr><th style={{width:"30px"}}></th><th>Username</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                  <tbody>{admins.map(u=>(
                    <tr key={u.id}>
                      <td><input type="checkbox" className="sa-checkbox"/></td>
                      <td><div className="sa-user-cell">
                        <div className="sa-user-avatar">{initials(u.name)}</div>
                        <div><div className="sa-user-name">{u.name}</div><div className="sa-user-email">{u.email}</div></div>
                      </div></td>
                      <td>{u.email}</td>
                      <td><span className={`sa-role-pill ${u.role==="superadmin"?"sa-role-superadmin":"sa-role-admin"}`}>{u.role==="superadmin"?"Super Admin":"Admin"}</span></td>
                      <td>
                        <button className="sa-action-btn" onClick={()=>setEditAdmin({...u})}>⚙️</button>
                        <button className="sa-delete-btn" onClick={()=>deleteAdmin(u.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      {showAddModal && (
        <Modal title="➕ Add New Admin" onClose={()=>setShowAddModal(false)}
          footer={<><button className="btn btn-outline" onClick={()=>setShowAddModal(false)}>Cancel</button><button className="btn btn-primary" onClick={doAddAdmin} disabled={saving}>{saving?"Saving…":"Create Admin"}</button></>}>
          {["name","email","pass","pass2"].map((f,i)=>(
            <div className="form-group" key={f}>
              <label className="form-label">{["Full Name","Email","Password","Confirm Password"][i]}</label>
              <input className="form-input" type={f.includes("pass")?"password":f==="email"?"email":"text"}
                placeholder={["Admin's full name","Admin's email","Temporary password","Confirm password"][i]}
                value={newAdmin[f]} onChange={e=>setNewAdmin({...newAdmin,[f]:e.target.value})}/>
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={newAdmin.role} onChange={e=>setNewAdmin({...newAdmin,role:e.target.value})}>
              <option value="admin">Admin</option><option value="superadmin">Super Admin</option>
            </select>
          </div>
        </Modal>
      )}
      {editAdmin && (
        <Modal title={`✏️ Edit Admin — ${editAdmin.name}`} onClose={()=>setEditAdmin(null)}
          footer={<><button className="btn btn-outline" onClick={()=>setEditAdmin(null)}>Cancel</button><button className="btn btn-primary" onClick={doSaveEdit} disabled={saving}>{saving?"Saving…":"Save Changes"}</button></>}>
          <div className="form-group"><label className="form-label">Full Name</label>
            <input className="form-input" value={editAdmin.name} onChange={e=>setEditAdmin({...editAdmin,name:e.target.value})}/></div>
          <div className="form-group"><label className="form-label">Email</label>
            <input className="form-input" type="email" value={editAdmin.email} onChange={e=>setEditAdmin({...editAdmin,email:e.target.value})}/></div>
          <div className="form-group"><label className="form-label">Role</label>
            <select className="form-input" value={editAdmin.role} onChange={e=>setEditAdmin({...editAdmin,role:e.target.value})}>
              <option value="admin">Admin</option><option value="superadmin">Super Admin</option>
            </select></div>
          <div className="form-group"><label className="form-label">Status</label>
            <select className="form-input" value={editAdmin.active?"active":"inactive"} onChange={e=>setEditAdmin({...editAdmin,active:e.target.value==="active"})}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select></div>
        </Modal>
      )}
    </div>
  );
}

/* ─── SA USERS ──────────────────────────────────────────── */
export function SAUsers() {
  const { showToast } = useApp();
  const [userList, setUserList]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser]         = useState(null);
  const [newUser, setNewUser]           = useState({ name:"", email:"", pass:"", pass2:"", status:"active" });
  const [saving, setSaving]             = useState(false);

  const loadUsers = () => {
    setLoading(true);
    usersApi.list().then(setUserList).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { loadUsers(); }, []);

  const online = userList.filter(u=>u.active).length;

  const doAddUser = async () => {
    const { name, email, pass, pass2, status } = newUser;
    if (!name||!email||!pass) { showToast("Please fill all fields.","error"); return; }
    if (pass!==pass2) { showToast("Passwords do not match.","error"); return; }
    if (pass.length<6) { showToast("Password must be at least 6 characters.","error"); return; }
    setSaving(true);
    try {
      await usersApi.create(name, email, pass, pass2, status === "active");
      showToast(`User ${name} created! ✓`);
      setShowAddModal(false);
      setNewUser({name:"",email:"",pass:"",pass2:"",status:"active"});
      loadUsers();
    } catch(e) { showToast(e.message,"error"); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (id) => {
    try {
      const updated = await usersApi.toggleStatus(id);
      showToast((updated.active?"✓ Activated: ":"✗ Deactivated: ")+updated.name, updated.active?"success":"error");
      loadUsers();
    } catch(e) { showToast(e.message,"error"); }
  };

  const deleteUser = async (id) => {
    const u = userList.find(x=>x.id===id);
    if (!u||!window.confirm(`Delete "${u.name}"?`)) return;
    try {
      await usersApi.remove(id);
      showToast(`Deleted: ${u.name}`,"error");
      loadUsers();
    } catch(e) { showToast(e.message,"error"); }
  };

  const doSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await usersApi.update(editUser.id, { name:editUser.name, email:editUser.email, active:editUser.active });
      showToast(`User "${editUser.name}" updated! ✓`);
      setEditUser(null);
      loadUsers();
    } catch(e) { showToast(e.message,"error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="page active">
      <div style={{display:"flex",minHeight:"100vh"}}>
        <SASidebar active="sa-users"/>
        <div className="sa-main">
          <SATopbar title="Dashboard"/>
          <div className="sa-content">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem",flexWrap:"wrap",gap:"0.75rem"}}>
              <div className="sa-card-title" style={{fontSize:"1.2rem",fontWeight:"800",color:"#3b0764",marginBottom:0}}>Users Management</div>
              <button className="sa-add-btn" onClick={()=>setShowAddModal(true)}>+ Add User</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1.5rem"}}>
              <div className="sa-online-card"><div><div className="sa-online-label">User Online</div><div className="sa-online-num">{online}</div></div><div className="sa-online-dot green"/></div>
              <div className="sa-online-card"><div><div className="sa-online-label">User Offline</div><div className="sa-online-num">{userList.length-online}</div></div><div className="sa-online-dot red"/></div>
            </div>
            <div className="sa-card">
              {loading ? <p style={{padding:"1rem",color:"rgba(109,40,217,0.5)"}}>Loading…</p> : (
                <table className="sa-table">
                  <thead><tr><th style={{width:"30px"}}></th><th>Username</th><th>Email</th><th>Role</th><th>User Status</th><th>Action</th></tr></thead>
                  <tbody>{userList.map(u=>(
                    <tr key={u.id}>
                      <td><input type="checkbox" className="sa-checkbox"/></td>
                      <td><div className="sa-user-cell">
                        <div className="sa-user-avatar">{initials(u.name)}</div>
                        <div><div className="sa-user-name">{u.name}</div></div>
                      </div></td>
                      <td>{u.email}</td>
                      <td><span className="sa-role-pill sa-role-user">User</span></td>
                      <td>
                        <button className={`sa-status-toggle ${u.active?"sa-status-on":"sa-status-off"}`} onClick={()=>toggleStatus(u.id)}>
                          <span className="sa-status-dot"/>{u.active?"Online":"Offline"}
                        </button>
                      </td>
                      <td>
                        <button className="sa-action-btn" onClick={()=>setEditUser({...u})}>⚙️</button>
                        <button className="sa-delete-btn" onClick={()=>deleteUser(u.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      {showAddModal && (
        <Modal title="➕ Add New User" onClose={()=>setShowAddModal(false)}
          footer={<><button className="btn btn-outline" onClick={()=>setShowAddModal(false)}>Cancel</button><button className="btn btn-primary" onClick={doAddUser} disabled={saving}>{saving?"Saving…":"Create User"}</button></>}>
          {["name","email","pass","pass2"].map((f,i)=>(
            <div className="form-group" key={f}>
              <label className="form-label">{["Full Name","Email","Password","Confirm Password"][i]}</label>
              <input className="form-input" type={f.includes("pass")?"password":f==="email"?"email":"text"}
                placeholder={["User's full name","User's email","Temporary password","Confirm password"][i]}
                value={newUser[f]} onChange={e=>setNewUser({...newUser,[f]:e.target.value})}/>
            </div>
          ))}
          <div className="form-group"><label className="form-label">Status</label>
            <select className="form-input" value={newUser.status} onChange={e=>setNewUser({...newUser,status:e.target.value})}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select></div>
        </Modal>
      )}
      {editUser && (
        <Modal title={`✏️ Edit User — ${editUser.name}`} onClose={()=>setEditUser(null)}
          footer={<><button className="btn btn-outline" onClick={()=>setEditUser(null)}>Cancel</button><button className="btn btn-primary" onClick={doSaveEdit} disabled={saving}>{saving?"Saving…":"Save Changes"}</button></>}>
          <div className="form-group"><label className="form-label">Full Name</label>
            <input className="form-input" value={editUser.name} onChange={e=>setEditUser({...editUser,name:e.target.value})}/></div>
          <div className="form-group"><label className="form-label">Email</label>
            <input className="form-input" type="email" value={editUser.email} onChange={e=>setEditUser({...editUser,email:e.target.value})}/></div>
          <div className="form-group"><label className="form-label">Status</label>
            <select className="form-input" value={editUser.active?"active":"inactive"} onChange={e=>setEditUser({...editUser,active:e.target.value==="active"})}>
              <option value="active">Online / Active</option><option value="inactive">Offline / Inactive</option>
            </select></div>
        </Modal>
      )}
    </div>
  );
}

/* ─── SA ACTIVITY LOGS ──────────────────────────────────── */
export function SAActivityLogs() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    logsApi.list().then(setLogs).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = filter
    ? logs.filter(l => l.action.toLowerCase().includes(filter.toLowerCase()) || l.performed_by.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  return (
    <div className="page active">
      <div style={{display:"flex",minHeight:"100vh"}}>
        <SASidebar active="sa-activitylogs"/>
        <div className="sa-main">
          <SATopbar title="Activity Logs"/>
          <div className="sa-content">
            <div style={{marginBottom:"1.5rem"}}>
              <div className="sa-topbar-search" style={{maxWidth:"320px",borderRadius:"10px"}}>
                <span style={{color:"rgba(109,40,217,0.5)"}}>🔍</span>
                <input placeholder="Search..." style={{width:"280px"}} value={filter} onChange={e=>setFilter(e.target.value)}/>
              </div>
            </div>
            <div className="sa-card">
              {loading ? <p style={{padding:"1rem",color:"rgba(109,40,217,0.5)"}}>Loading…</p> : (
                <table className="sa-table">
                  <thead><tr><th style={{width:"30px"}}></th><th>Activity</th><th>Admin</th><th>Date</th></tr></thead>
                  <tbody>{filtered.map((l,i)=>(
                    <tr key={l.id||i}>
                      <td><input type="checkbox" className="sa-checkbox"/></td>
                      <td><div className="sa-activity-text">{l.action}</div></td>
                      <td>
                        <div className="sa-user-cell">
                          <div className="sa-user-avatar" style={{background:"rgba(124,58,237,0.15)",color:"#7c3aed",fontSize:"0.9rem"}}>👤</div>
                          <div><div className="sa-user-name">{l.performed_by}</div><div className="sa-user-email">{l.performed_role}</div></div>
                        </div>
                      </td>
                      <td style={{fontSize:"0.78rem",color:"rgba(109,40,217,0.6)",whiteSpace:"nowrap"}}>{new Date(l.created_at).toLocaleString()}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SA SETTINGS ───────────────────────────────────────── */
export function SASettings() {
  const { currentUser, showToast } = useApp();
  const [name,  setName]  = useState(currentUser?.name||"");
  const [email, setEmail] = useState(currentUser?.email||"");

  return (
    <div className="page active">
      <div style={{display:"flex",minHeight:"100vh"}}>
        <SASidebar active="sa-settings"/>
        <div className="sa-main">
          <SATopbar title="Dashboard"/>
          <div className="sa-content">
            <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:"800",fontSize:"1.2rem",color:"#3b0764",marginBottom:"1.5rem"}}>Setting</div>
            <div className="sa-settings-grid">
              <div className="sa-card">
                <div className="sa-profile-section">
                  <div className="sa-profile-avatar-lg">👑</div>
                  <div>
                    <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:"700",fontSize:"1rem",color:"#3b0764"}}>{currentUser?.name}</div>
                    <div style={{fontSize:"0.78rem",color:"rgba(109,40,217,0.55)"}}>{currentUser?.email}</div>
                  </div>
                </div>
                <label className="sa-settings-label">Name</label>
                <input className="sa-settings-input" type="text" value={name} onChange={e=>setName(e.target.value)}/>
                <label className="sa-settings-label">E-mail</label>
                <input className="sa-settings-input" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
                <button className="sa-add-btn" style={{fontSize:"0.82rem",width:"100%",justifyContent:"center",marginTop:"0.25rem"}}
                  onClick={()=>showToast("Profile saved! ✓")}>Save Changes</button>
              </div>
              <div className="sa-card">
                <div className="sa-card-title">User Activity</div>
                <svg viewBox="0 0 300 120" style={{width:"100%",height:"120px"}}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02"/>
                    </linearGradient>
                  </defs>
                  <polyline points="0,100 40,80 80,85 120,50 160,40 200,30 240,55 280,20 300,25" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinejoin="round"/>
                  <polygon points="0,100 40,80 80,85 120,50 160,40 200,30 240,55 280,20 300,25 300,120 0,120" fill="url(#chartGrad)"/>
                </svg>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.65rem",color:"rgba(109,40,217,0.5)",marginTop:"0.25rem"}}>
                  {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d=><span key={d}>{d}</span>)}
                </div>
              </div>
              <div className="sa-card">
                <div className="sa-card-title">App Settings</div>
                <label className="sa-settings-label">Application Name</label>
                <input className="sa-settings-input" type="text" defaultValue="Career Admin"/>
                <label className="sa-settings-label">Primary Color</label>
                <select className="sa-settings-input"><option>Purple</option><option>Blue</option><option>Green</option></select>
                <label className="sa-settings-label">Language</label>
                <select className="sa-settings-input"><option>English</option><option>Khmer</option></select>
              </div>
              <div className="sa-card">
                <div className="sa-card-title">Notification</div>
                {["Email Notification","Push Notification","SMS Notification","Unusual Activity","Low Engagement"].map((label,i)=>(
                  <div className="sa-toggle-row" key={label}>
                    <div className="sa-toggle-label">{label}</div>
                    <ToggleSwitch defaultOn={i<4}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
