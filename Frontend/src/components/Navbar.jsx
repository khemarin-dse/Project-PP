import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { notificationsApi } from "../data/api";

export default function Navbar() {
  const { currentUser, logout, setPage, showToast, isDarkMode, toggleTheme } = useApp();
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for unread notifications every 15 seconds
  useEffect(() => {
    if (!currentUser || currentUser.role !== "user") return;

    const fetchCount = () => {
      notificationsApi.unreadCount()
        .then(data => setUnreadCount(data.count))
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const goToMyResults = () => setPage("my-results");

  const doLogout = async () => {
    await logout();
    showToast("You have been logged out.", "error");
    setPage("home");
    setUnreadCount(0);
  };

  const roleBadge = (role) => {
    if (role === "superadmin") return <span className="role-badge badge-superadmin">Super Admin</span>;
    if (role === "admin")      return <span className="role-badge badge-admin">Admin</span>;
    return null;
  };

  return (
    <nav>
      <div className="nav-logo" onClick={() => setPage("home")}>
        <span className="nav-logo-icon">🎓</span>UniGuide
      </div>
      <ul className="nav-links">
        <li><a onClick={() => setPage("home")}>Home</a></li>
        <li><a onClick={() => setPage("about")}>About</a></li>
        <li><a onClick={() => setPage("contact")}>Contact</a></li>
      </ul>
      <div className="nav-actions">
        {!currentUser ? (
          <div style={{display:"flex",gap:"0.75rem"}}>
            <button className="btn btn-outline" onClick={() => setPage("login")}>Log in</button>
            <button className="btn btn-primary" onClick={() => setPage("register")}>Sign up</button>
          </div>
        ) : (
          <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
            <span style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)"}}>
              Hi, {currentUser.name}{roleBadge(currentUser.role)}
            </span>

            {/* My Results — users only */}
            {currentUser.role === "user" && (
              <button className="btn btn-outline btn-sm"
                onClick={goToMyResults}
                style={{fontSize:"0.78rem",padding:"0.4rem 0.85rem"}}>
                📋 My Results
              </button>
            )}

            {/* Notification Bell — users only */}
            {currentUser.role === "user" && (
              <button
                onClick={() => setPage("notifications")}
                style={{
                  position:"relative", background:"none", border:"none",
                  cursor:"pointer", fontSize:"1.2rem", padding:"0.3rem",
                  color:"rgba(255,255,255,0.7)", lineHeight:1,
                }}
                title="Notifications">
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position:"absolute", top:"-2px", right:"-4px",
                    background:"#ef4444", color:"#fff", borderRadius:"50%",
                    fontSize:"0.6rem", fontWeight:"700",
                    width:"16px", height:"16px",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Space Grotesk',sans-serif",
                  }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            <button className="btn btn-outline" onClick={doLogout}>Log out</button>
          </div>
        )}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark mode">
          {isDarkMode ? "🌙" : "☀️"}
        </button>
      </div>
    </nav>
  );
}
