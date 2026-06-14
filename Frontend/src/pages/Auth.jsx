import { useState } from "react";
import { useApp } from "../context/AppContext";
import { authApi } from "../data/api";

/* ─── REGISTER ─────────────────────────────────────────── */
export function Register() {
  const { login, setPage, showToast } = useApp();
  const [form, setForm] = useState({ name:"", email:"", pass:"", confirm:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const doRegister = async () => {
    const { name, email, pass, confirm } = form;
    if (!name || !email || !pass) { setError("Please fill in all fields."); return; }
    if (pass !== confirm) { setError("Passwords do not match."); return; }
    if (pass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const { user, token } = await authApi.register(name, email, pass, confirm);
      login(user, token);
      showToast(`Welcome to UniGuide, ${user.name}! 🎉`);
      setPage("quiz-1");
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active">
      <div className="auth-page">
        <div className="auth-wrapper">
          <div className="auth-logo-wrap" onClick={() => setPage("home")}>
            <span className="auth-logo-icon">🎓</span>
            <span className="auth-logo-text">UniGuide</span>
          </div>
          <div className="auth-card">
            <div className="auth-tabs">
              <div className="auth-tab active">Sign Up</div>
              <div className="auth-tab" onClick={() => setPage("login")}>Log In</div>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {["name","email","pass","confirm"].map((f,i) => (
              <div className="form-group" key={f}>
                <label className="form-label">{["Name","Email","Password","Confirm Password"][i]}</label>
                <input className="form-input"
                  type={f.includes("pass")||f==="confirm"?"password":f==="email"?"email":"text"}
                  placeholder={["Your full name","Enter your email","Create a password","Confirm your password"][i]}
                  value={form[f]} onChange={e => { setError(""); setForm({...form,[f]:e.target.value}); }} />
              </div>
            ))}
            <button className="btn-auth" onClick={doRegister} disabled={loading}>
              {loading ? "Creating account…" : "Sign Up"}
            </button>
            <p className="auth-note">Already have an account? <a onClick={() => setPage("login")}>Log in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── LOGIN ─────────────────────────────────────────────── */
export function Login() {
  const { login, setPage, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    if (!email || !pass) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const { user, token } = await authApi.login(email, pass);
      login(user, token);
      showToast(`Welcome back, ${user.name}! 👋`);
      if (user.role === "user") setPage("quiz-1");
      else setPage("home");
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active">
      <div className="auth-page">
        <div className="auth-wrapper">
          <div className="auth-logo-wrap" onClick={() => setPage("home")}>
            <span className="auth-logo-icon">🎓</span>
            <span className="auth-logo-text">UniGuide</span>
          </div>
          <div className="auth-card">
            <div className="auth-tabs">
              <div className="auth-tab" onClick={() => setPage("register")}>Sign Up</div>
              <div className="auth-tab active">Log In</div>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="Enter your email"
                value={email} onChange={e => { setError(""); setEmail(e.target.value); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Enter your password"
                value={pass} onChange={e => { setError(""); setPass(e.target.value); }}
                onKeyDown={e => e.key === "Enter" && doLogin()} />
            </div>
            <button className="btn-auth" onClick={doLogin} disabled={loading}>
              {loading ? "Logging in…" : "Log In"}
            </button>
            <p className="auth-note">Don't have an account? <a onClick={() => setPage("register")}>Sign up</a></p>
            <p className="auth-note" style={{marginTop:"0.5rem"}}>
              <a onClick={() => setPage("admin-login")} className="auth-link-admin">Admin login →</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ADMIN LOGIN ───────────────────────────────────────── */
export function AdminLogin() {
  const { login, setPage, showToast } = useApp();
  const [form, setForm] = useState({ name:"", email:"", pass:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const doAdminLogin = async () => {
    if (!form.email || !form.pass) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const { user, token } = await authApi.adminLogin(form.email, form.pass);
      login(user, token);
      showToast(`Logged in as Admin – ${user.name} 🔑`);
      setPage("admin-dashboard");
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active">
      <div className="auth-page">
        <div className="auth-wrapper">
          <div className="auth-logo-wrap" onClick={() => setPage("home")}>
            <span className="auth-logo-icon">🎓</span>
            <span className="auth-logo-text">UniGuide</span>
          </div>
          <div className="auth-card">
            <div className="auth-tabs">
              <div className="auth-tab active" style={{borderBottomColor:"#f59e0b",color:"#f59e0b"}}>Log In For Admin</div>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {["name","email","pass"].map((f,i) => (
              <div className="form-group" key={f}>
                <label className="form-label">{["Name","Email","Password"][i]}</label>
                <input className="form-input"
                  type={f==="pass"?"password":f==="email"?"email":"text"}
                  placeholder={["Admin name","Admin email","Admin password"][i]}
                  value={form[f]} onChange={e => { setError(""); setForm({...form,[f]:e.target.value}); }} />
              </div>
            ))}
            <button className="btn-auth" style={{background:"linear-gradient(135deg,#d97706,#f59e0b)"}}
              onClick={doAdminLogin} disabled={loading}>
              {loading ? "Logging in…" : "Log In as Admin"}
            </button>
            <p className="auth-note"><a onClick={() => setPage("sa-login")} className="auth-link-sa">Super Admin login →</a></p>
            <p className="auth-note" style={{marginTop:"0.25rem"}}><a onClick={() => setPage("login")}>← Back to user login</a></p>
            <p className="auth-note" style={{marginTop:"0.75rem",fontSize:"0.72rem",color:"rgba(255,255,255,0.2)"}}>
              Demo: admin@uniguide.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SUPER ADMIN LOGIN ─────────────────────────────────── */
export function SALogin() {
  const { login, setPage, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const doSALogin = async () => {
    if (!email || !pass) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const { user, token } = await authApi.adminLogin(email, pass);
      if (user.role !== "superadmin") { setError("❌ Insufficient permissions."); return; }
      login(user, token);
      showToast(`Logged in as Super Admin – ${user.name} 👑`);
      setPage("sa-dashboard");
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active">
      <div className="sa-auth-page">
        <div className="sa-auth-card">
          <div className="sa-auth-brand">
            <div className="sa-auth-shield">🛡️</div>
            <div className="sa-auth-badge">Super Admin Portal</div>
            <div className="sa-auth-title">Secure Access</div>
            <div className="sa-auth-subtitle">Sign in with your Super Admin credentials</div>
          </div>
          {error && <div className="alert alert-error" style={{marginBottom:"1rem",borderRadius:"10px"}}>{error}</div>}
          <label className="sa-auth-label">Email Address</label>
          <input className="sa-auth-input" type="email" placeholder="superadmin@uniguide.com"
            value={email} onChange={e => { setError(""); setEmail(e.target.value); }}
            onKeyDown={e => e.key==="Enter" && doSALogin()} />
          <label className="sa-auth-label">Password</label>
          <div style={{position:"relative",marginBottom:"1.25rem"}}>
            <input className="sa-auth-input" type={showPass?"text":"password"} placeholder="••••••••"
              style={{marginBottom:0,paddingRight:"2.75rem"}}
              value={pass} onChange={e => { setError(""); setPass(e.target.value); }}
              onKeyDown={e => e.key==="Enter" && doSALogin()} />
            <button onClick={() => setShowPass(s=>!s)}
              style={{position:"absolute",right:"0.85rem",top:"50%",transform:"translateY(-50%)",
                background:"none",border:"none",cursor:"pointer",fontSize:"1rem",color:"rgba(255,255,255,0.4)"}}>
              {showPass?"🙈":"👁"}
            </button>
          </div>
          <button className="sa-auth-btn" onClick={doSALogin} disabled={loading}>
            {loading ? "Signing in…" : "🔐 Sign In as Super Admin"}
          </button>
          <div className="sa-auth-links">
            <a onClick={() => setPage("admin-login")} className="highlight">← Back to Admin Login</a>
            <a onClick={() => setPage("login")}>Back to User Login</a>
          </div>
          <div className="sa-auth-demo">
            <div className="sa-auth-demo-label">Demo Credentials</div>
            <div className="sa-auth-demo-creds">super@uniguide.com &nbsp;/&nbsp; super123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
