import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { notificationsApi } from "../data/api";

const TYPE_CONFIG = {
  admin_reply: { icon:"💬", color:"#7c3aed", label:"ADMIN REPLY" },
  system:      { icon:"✅", color:"#22c55e", label:"SYSTEM" },
  welcome:     { icon:"🎓", color:"#a855f7", label:"WELCOME" },
  reminder:    { icon:"⚠️", color:"#f59e0b", label:"REMINDER" },
};

function groupByDate(notifications) {
  const groups = {};
  const now = new Date();

  notifications.forEach(n => {
    const d = new Date(n.created_at);
    const diffDays = Math.floor((now - d) / 86400000);
    let label;
    if (diffDays === 0)      label = "TODAY";
    else if (diffDays === 1) label = "YESTERDAY";
    else if (diffDays < 7)   label = "THIS WEEK";
    else                     label = "EARLIER";
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  return groups;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US",{month:"short",day:"numeric"});
}

export default function Notifications() {
  const { setPage } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState("All");

  const load = () => {
    notificationsApi.list()
      .then(data => setNotifications(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    await notificationsApi.markAllRead().catch(()=>{});
    setNotifications(prev => prev.map(n => ({...n, read:true})));
  };

  const markRead = async (id) => {
    await notificationsApi.markRead(id).catch(()=>{});
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read:true} : n));
  };

  const filtered = notifications.filter(n => {
    if (filter === "All")     return true;
    if (filter === "Unread")  return !n.read;
    if (filter === "Replies") return n.type === "admin_reply";
    if (filter === "System")  return n.type === "system" || n.type === "welcome" || n.type === "reminder";
    return true;
  });

  const groups = groupByDate(filtered);
  const groupOrder = ["TODAY","YESTERDAY","THIS WEEK","EARLIER"];

  return (
    <div className="page active" style={{minHeight:"100vh",background:"#0f0a1e",paddingTop:"var(--nav-h)"}}>
      <div style={{maxWidth:"680px",margin:"0 auto",padding:"2rem 1rem"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem",flexWrap:"wrap",gap:"1rem"}}>
          <div>
            <h1 style={{fontFamily:"'Outfit',sans-serif",fontWeight:"800",fontSize:"1.8rem",color:"#a855f7",margin:0}}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <div style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"20px",padding:"0.25rem 0.75rem",marginTop:"0.5rem"}}>
                <span style={{width:"8px",height:"8px",borderRadius:"50%",background:"#ef4444",display:"inline-block"}}/>
                <span style={{fontSize:"0.78rem",color:"#f87171",fontFamily:"'Space Grotesk',sans-serif",fontWeight:"600"}}>
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background:"none",border:"1px solid rgba(168,85,247,0.3)",borderRadius:"8px",
                color:"#a855f7",padding:"0.4rem 0.85rem",fontFamily:"'Space Grotesk',sans-serif",
                fontSize:"0.8rem",fontWeight:"600",cursor:"pointer",
              }}>✓ Mark all as read</button>
            )}
            <button onClick={() => setPage("home")} style={{
              background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",
              borderRadius:"8px",color:"rgba(255,255,255,0.7)",padding:"0.4rem 0.85rem",
              fontFamily:"'Space Grotesk',sans-serif",fontSize:"0.8rem",cursor:"pointer",
            }}>← Back</button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{display:"flex",gap:"0.5rem",marginBottom:"1.5rem",flexWrap:"wrap"}}>
          {["All","Unread","Replies","System"].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} style={{
              padding:"0.4rem 1rem",borderRadius:"8px",fontFamily:"'Space Grotesk',sans-serif",
              fontSize:"0.82rem",fontWeight:"600",cursor:"pointer",transition:"all 0.2s",
              background: filter === tab ? "#7c3aed" : "rgba(255,255,255,0.05)",
              border: filter === tab ? "1px solid #7c3aed" : "1px solid rgba(255,255,255,0.1)",
              color: filter === tab ? "#fff" : "rgba(255,255,255,0.6)",
            }}>{tab}</button>
          ))}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem",fontFamily:"'Space Grotesk',sans-serif"}}>
            Loading notifications…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"4rem 1rem"}}>
            <div style={{fontSize:"3rem",marginBottom:"1rem"}}>🔔</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontFamily:"'Space Grotesk',sans-serif"}}>
              No notifications yet
            </div>
          </div>
        ) : (
          groupOrder.map(group => {
            if (!groups[group] || groups[group].length === 0) return null;
            return (
              <div key={group} style={{marginBottom:"1.5rem"}}>
                <div style={{fontSize:"0.7rem",fontWeight:"700",color:"rgba(255,255,255,0.25)",
                  fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"0.1em",marginBottom:"0.6rem"}}>
                  {group}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                  {groups[group].map(n => {
                    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                    return (
                      <div key={n.id}
                        onClick={() => markRead(n.id)}
                        style={{
                          display:"flex",gap:"0.85rem",alignItems:"flex-start",
                          background: n.read ? "rgba(255,255,255,0.03)" : "rgba(124,58,237,0.08)",
                          border: n.read ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(124,58,237,0.2)",
                          borderRadius:"12px",padding:"0.85rem 1rem",cursor:"pointer",
                          transition:"background 0.2s",position:"relative",
                        }}>
                        {/* Icon */}
                        <div style={{
                          width:"40px",height:"40px",borderRadius:"10px",flexShrink:0,
                          background:`${cfg.color}22`,border:`1px solid ${cfg.color}44`,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",
                        }}>
                          {cfg.icon}
                        </div>
                        {/* Content */}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"0.7rem",fontWeight:"700",color:cfg.color,
                            fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"0.08em",marginBottom:"0.2rem"}}>
                            {cfg.label}
                          </div>
                          <div style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.85)",
                            fontFamily:"'Space Grotesk',sans-serif",lineHeight:"1.4",marginBottom:"0.25rem",
                            overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",
                            WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                            {n.message}
                          </div>
                          <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.3)",fontFamily:"'Space Grotesk',sans-serif"}}>
                            {timeAgo(n.created_at)}
                          </div>
                        </div>
                        {/* Unread dot */}
                        {!n.read && (
                          <div style={{
                            width:"8px",height:"8px",borderRadius:"50%",background:"#7c3aed",
                            flexShrink:0,marginTop:"0.3rem",
                          }}/>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
