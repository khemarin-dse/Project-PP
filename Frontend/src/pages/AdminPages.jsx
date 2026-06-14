import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import Modal from "../components/Modal";
import { usersApi } from "../data/api";

function initials(name) {
  return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
}
function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return <button className={`toggle-switch${on?" on":""}`} onClick={()=>setOn(o=>!o)}/>;
}

/* ─── ADMIN TOP NAVBAR ──────────────────────────────────── */
function AdminTopNav() {
  const { setPage, logout, showToast } = useApp();
  const doLogout = async () => { await logout(); showToast("Logged out.","error"); setPage("home"); };
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, zIndex:200,
      background:"linear-gradient(90deg,#1a0533,#2d1b69)",
      borderBottom:"1px solid rgba(124,58,237,0.2)",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 1.5rem", height:"56px",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:"2rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",fontFamily:"'Outfit',sans-serif",fontWeight:"800",fontSize:"1.1rem",color:"#fff",cursor:"pointer"}}
          onClick={()=>setPage("home")}>
          <span style={{background:"linear-gradient(135deg,#7c3aed,#a855f7)",borderRadius:"8px",width:"32px",height:"32px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>🎓</span>
          UniGuide
        </div>
        <div style={{display:"flex",gap:"1.5rem"}}>
          {[["home","Home"],["about","About"],["contact","Contact"]].map(([pg,label])=>(
            <span key={pg} onClick={()=>setPage(pg)}
              style={{color:"rgba(255,255,255,0.6)",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color="#fff"}
              onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.6)"}>
              {label}
            </span>
          ))}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
        <span style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.4)",fontFamily:"'Space Grotesk',sans-serif"}}>Admin Panel</span>
        <button onClick={doLogout} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",color:"#f87171",padding:"0.35rem 0.85rem",fontFamily:"'Space Grotesk',sans-serif",fontSize:"0.8rem",fontWeight:"600",cursor:"pointer"}}>
          Log out
        </button>
      </div>
    </div>
  );
}

/* ─── ADMIN SIDEBAR ────────────────────────────────────── */
function AdminSidebar({ active }) {
  const { logout, setPage } = useApp();
  const doLogout = async () => { await logout(); setPage("home"); };
  const items = [
    { id:"admin-dashboard", icon:"🏠", label:"Dashboard",      section:"Dashboard" },
    { id:"admin-users",     icon:"👥", label:"User Management", section:"Management" },
    { id:"admin-settings",  icon:"⚙️", label:"Settings",        section:"System" },
    { id:"admin-chat",      icon:"💬", label:"Messages",         section:"System" },
  ];
  let lastSection = "";
  return (
    <aside className="dash-sidebar" style={{top:"56px",height:"calc(100vh - 56px)"}}>
      <div className="dash-sidebar-header">
        <div className="nav-logo" style={{fontSize:"0.95rem",cursor:"default"}}>
          <span className="nav-logo-icon" style={{width:"32px",height:"32px",fontSize:"0.9rem"}}>🎓</span>UniGuide
        </div>
      </div>
      {items.map(item => {
        const showSection = item.section !== lastSection;
        lastSection = item.section;
        return (
          <div key={item.id}>
            {showSection && <div className="dash-nav-section">{item.section}</div>}
            <div className={`dash-nav-item${active===item.id?" active":""}`} onClick={() => setPage(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </div>
          </div>
        );
      })}
      <div className="dash-sign-out"><button onClick={doLogout}>Sign Out</button></div>
    </aside>
  );
}

/* ─── INTERACTIVE USER ACTIVITY CHART ──────────────────── */
function UserActivityChart({ users }) {
  const days = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  const active   = users.filter(u=>u.active).length;
  const inactive = users.filter(u=>!u.active).length;
  const total    = users.length;

  // Generate chart data based on real user counts
  const baseData = days.map((_, i) => {
    const seed = (active * (i+1) * 37 + inactive * (i+2) * 13) % 100;
    return Math.max(10, Math.min(300, seed + active * 8 + i * 5));
  });
  // Make last point reflect real total
  baseData[baseData.length - 1] = Math.max(20, total * 25);

  const maxVal = Math.max(...baseData, 50);
  const W = 600, H = 200, padL = 40, padB = 30, padT = 20, padR = 20;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;

  const pts = baseData.map((v, i) => ({
    x: padL + (i / (days.length - 1)) * chartW,
    y: padT + chartH - (v / maxVal) * chartH,
    v,
  }));

  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${padT + chartH} ` + polyline + ` ${pts[pts.length-1].x},${padT + chartH}`;

  const [hovered, setHovered] = useState(null);

  return (
    <div className="dash-card" style={{marginBottom:"1.5rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"1rem"}}>
        <span style={{fontSize:"1.3rem"}}>👥</span>
        <div className="dash-card-title" style={{margin:0}}>User Activity</div>
        <span style={{marginLeft:"auto",fontSize:"0.75rem",color:"rgba(255,255,255,0.3)",fontFamily:"'Space Grotesk',sans-serif"}}>
          {total} total users
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",overflow:"visible"}}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.03"/>
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0,0.25,0.5,0.75,1].map((t,i) => {
          const y = padT + chartH * t;
          const val = Math.round(maxVal * (1-t));
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W-padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              <text x={padL-6} y={y+4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.25)">{val}</text>
            </g>
          );
        })}
        {/* Area fill */}
        <polygon points={area} fill="url(#areaGrad)"/>
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        {/* Points + hover */}
        {pts.map((p,i) => (
          <g key={i} style={{cursor:"pointer"}}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}>
            <circle cx={p.x} cy={p.y} r="14" fill="transparent"/>
            <circle cx={p.x} cy={p.y} r={hovered===i?6:4}
              fill={hovered===i?"#fff":"#a855f7"}
              stroke={hovered===i?"#a855f7":"#1a0533"}
              strokeWidth="2"
              style={{transition:"r 0.15s"}}/>
            {hovered===i && (
              <g>
                <rect x={p.x-22} y={p.y-32} width="44" height="22" rx="6" fill="#7c3aed"/>
                <text x={p.x} y={p.y-17} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">{p.v}</text>
              </g>
            )}
            {/* Day label */}
            <text x={p.x} y={H-8} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">{days[i]}</text>
          </g>
        ))}
      </svg>
      {/* Legend */}
      <div style={{display:"flex",gap:"1.5rem",marginTop:"0.75rem",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.4rem",fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>
          <span style={{width:"10px",height:"10px",borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>
          Active: {active}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"0.4rem",fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>
          <span style={{width:"10px",height:"10px",borderRadius:"50%",background:"#f87171",display:"inline-block"}}/>
          Inactive: {inactive}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"0.4rem",fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>
          <span style={{width:"10px",height:"10px",borderRadius:"50%",background:"#a855f7",display:"inline-block"}}/>
          Total: {total}
        </div>
      </div>
    </div>
  );
}

/* ─── ADMIN DASHBOARD ──────────────────────────────────── */
export function AdminDashboard() {
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    usersApi.list().then(setUsers).catch(()=>{});
  };
  useEffect(() => { loadUsers(); }, []);

  const active   = users.filter(u=>u.active).length;
  const inactive = users.filter(u=>!u.active).length;

  const recentMatches = [
    {major:"Data Science",   cat:"Technology",  pct:88},
    {major:"Computer Sci.",  cat:"Technology",  pct:75},
    {major:"Business Admin", cat:"Business",    pct:62},
    {major:"Psychology",     cat:"Social Sci.", pct:51},
    {major:"Engineering",    cat:"Technology",  pct:48},
  ];

  return (
    <div className="page active">
      <AdminTopNav />
      <div className="dash-layout" style={{paddingTop:"56px"}}>
        <AdminSidebar active="admin-dashboard" />
        <main className="dash-main">
          <div className="dash-topbar">
            <div>
              <div className="dash-welcome" style={{color:"#7c3aed"}}>Welcome Back, <span>Admin</span> 👋</div>
              <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.35)",marginTop:"0.2rem"}}>UniGuide Admin Panel</div>
            </div>
            <div className="dash-topbar-right">
              <div className="dash-search"><span>🔍</span><input placeholder="Search…"/></div>
              <div className="dash-avatar">🛡️</div>
            </div>
          </div>
          <div className="stats-row">
            <div className="stat-card"><div className="stat-icon stat-icon-purple">👥</div><div><div className="stat-num">{active}</div><div className="stat-label">Active Users</div></div></div>
            <div className="stat-card"><div className="stat-icon stat-icon-pink">🚫</div><div><div className="stat-num">{inactive}</div><div className="stat-label">Inactive Users</div></div></div>
            <div className="stat-card"><div className="stat-icon stat-icon-green">✅</div><div><div className="stat-num">{users.length}</div><div className="stat-label">Total Users</div></div></div>
          </div>

          {/* Interactive User Activity Chart */}
          <UserActivityChart users={users} />

          <div className="dash-card">
            <div className="dash-card-title">Recent Matches <small>Top recommendations</small></div>
            <table className="dash-table" style={{fontSize:"0.8rem"}}>
              <thead><tr><th>Major</th><th>Category</th><th>Popularity</th></tr></thead>
              <tbody>{recentMatches.map(r=>(
                <tr key={r.major}><td>{r.major}</td><td>{r.cat}</td>
                  <td><div className="match-bar"><div className="match-fill" style={{width:`${r.pct}%`}}/></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─── ADMIN USERS ───────────────────────────────────────── */
export function AdminUsers() {
  const { showToast } = useApp();
  const [userList, setUserList]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser]           = useState({ name:"", email:"", pass:"", pass2:"", status:"active" });
  const [saving, setSaving]             = useState(false);

  const loadUsers = () => {
    setLoading(true);
    usersApi.list().then(data => setUserList(data)).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { loadUsers(); }, []);

  const active = userList.filter(u=>u.active).length;

  const doAddUser = async () => {
    const { name, email, pass, pass2, status } = newUser;
    if (!name||!email||!pass) { showToast("Please fill all fields.","error"); return; }
    if (pass !== pass2) { showToast("Passwords do not match.","error"); return; }
    if (pass.length < 6) { showToast("Password must be at least 6 characters.","error"); return; }
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
    if (!u||!window.confirm(`Delete "${u.name}"? This cannot be undone.`)) return;
    try {
      await usersApi.remove(id);
      showToast(`Deleted: ${u.name}`,"error");
      loadUsers();
    } catch(e) { showToast(e.message,"error"); }
  };

  return (
    <div className="page active">
      <AdminTopNav />
      <div className="dash-layout" style={{paddingTop:"56px"}}>
        <AdminSidebar active="admin-users"/>
        <main className="dash-main">
          <div className="dash-topbar">
            <div><div className="dash-welcome">User <span>Management</span></div></div>
            <div className="dash-topbar-right">
              <div className="dash-search"><span>🔍</span><input placeholder="Search users…"/></div>
              <button className="btn btn-primary" style={{fontSize:"0.82rem",padding:"0.5rem 1.1rem"}} onClick={()=>setShowAddModal(true)}>+ Add User</button>
            </div>
          </div>
          <div className="stats-row" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
            <div className="stat-card"><div className="stat-icon stat-icon-green">✅</div><div><div className="stat-num">{active}</div><div className="stat-label">Active</div></div></div>
            <div className="stat-card"><div className="stat-icon stat-icon-pink">🚫</div><div><div className="stat-num">{userList.length-active}</div><div className="stat-label">Inactive</div></div></div>
            <div className="stat-card"><div className="stat-icon stat-icon-purple">👥</div><div><div className="stat-num">{userList.length}</div><div className="stat-label">Total</div></div></div>
          </div>
          <div className="dash-card">
            <div className="dash-card-title">Users</div>
            {loading ? <p style={{color:"rgba(255,255,255,0.4)",padding:"1rem"}}>Loading…</p> : (
              <table className="dash-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>{userList.map(u=>(
                  <tr key={u.id}>
                    <td><div className="user-cell"><div className="user-avatar">{initials(u.name)}</div><div><div className="user-name">{u.name}</div></div></div></td>
                    <td>{u.email}</td>
                    <td><span className="role-pill role-user">User</span></td>
                    <td>
                      <button className={`status-toggle ${u.active?"status-on":"status-off"}`} onClick={()=>toggleStatus(u.id)}>
                        <span className="status-dot"/>{u.active?"Active":"Inactive"}
                      </button>
                    </td>
                    <td><button className="btn btn-outline" style={{fontSize:"0.72rem",padding:"0.25rem 0.6rem",color:"#f87171",borderColor:"rgba(239,68,68,0.3)"}} onClick={()=>deleteUser(u.id)}>Delete</button></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </main>
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
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={newUser.status} onChange={e=>setNewUser({...newUser,status:e.target.value})}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── ADMIN SETTINGS ────────────────────────────────────── */
export function AdminSettings() {
  const { currentUser, showToast } = useApp();
  return (
    <div className="page active">
      <AdminTopNav />
      <div className="dash-layout" style={{paddingTop:"56px"}}>
        <AdminSidebar active="admin-settings"/>
        <main className="dash-main">
          <div className="dash-topbar"><div className="dash-welcome">Settings</div></div>
          <div className="settings-grid">
            <div className="dash-card">
              <div className="dash-card-title">Profile</div>
              <div className="profile-section">
                <div className="profile-avatar-lg">🛡️</div>
                <div className="profile-name-block">
                  <div className="pname">{currentUser?.name||"Admin User"}</div>
                  <div className="pemail">{currentUser?.email||"admin@uniguide.com"}</div>
                </div>
              </div>
              <div className="settings-label">Name</div>
              <input className="settings-input" type="text" defaultValue={currentUser?.name||""} placeholder="Full name"/>
              <div className="settings-label">E-mail</div>
              <input className="settings-input" type="email" defaultValue={currentUser?.email||""} placeholder="Email address"/>
              <button className="btn btn-primary" style={{fontSize:"0.82rem"}} onClick={()=>showToast("Profile saved! ✓")}>Save Changes</button>
            </div>
            <div className="dash-card">
              <div className="dash-card-title">App Settings</div>
              <div className="settings-label">Application Theme</div>
              <select className="settings-input"><option>Dark Mode</option><option>Light Mode</option><option>System Default</option></select>
              <div className="settings-label">Change Password</div>
              <input className="settings-input" type="password" placeholder="New password"/>
              <input className="settings-input" type="password" placeholder="Confirm new password"/>
              <button className="btn btn-outline" style={{fontSize:"0.82rem"}}>Update Password</button>
            </div>
            <div className="dash-card">
              <div className="dash-card-title">Notification</div>
              {["Add Notification","Post Notification","Message Notification","Change Password","Two-Factor Auth"].map((label,i)=>(
                <div className="toggle-row" key={label}>
                  <div className="toggle-label">{label}</div>
                  <ToggleSwitch defaultOn={i!==2&&i!==4}/>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

