import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { contactApi } from "../data/api";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
}

function initials(name) {
  return (name||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
}

/* ─── ADMIN TOP NAVBAR ── (same as AdminPages) ──────────── */
function AdminTopNav() {
  const { setPage, logout, showToast } = useApp();
  const doLogout = async () => { await logout(); showToast("Logged out.","error"); setPage("home"); };
  return (
    <div style={{
      position:"fixed",top:0,left:0,right:0,zIndex:200,
      background:"linear-gradient(90deg,#1a0533,#2d1b69)",
      borderBottom:"1px solid rgba(124,58,237,0.2)",
      display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"0 1.5rem",height:"56px",
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
              style={{color:"rgba(255,255,255,0.6)",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif"}}
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

export default function AdminChat() {
  const { setPage, currentUser } = useApp();
  const [messages, setMessages]         = useState([]);
  const [selected, setSelected]         = useState(null);
  const [replyText, setReplyText]       = useState("");
  const [sending, setSending]           = useState(false);
  const [loading, setLoading]           = useState(true);
  const messagesEndRef                  = useRef(null);

  const loadMessages = () => {
    contactApi.list()
      .then(data => {
        setMessages(data);
        if (data.length > 0 && !selected) setSelected(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMessages(); }, []);

  useEffect(() => {
    if (selected) {
      // Mark as read when opened
      if (!selected.read) {
        contactApi.markRead(selected.id).catch(()=>{});
        setMessages(prev => prev.map(m => m.id === selected.id ? {...m, read:true} : m));
      }
    }
  }, [selected?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [selected]);

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      await contactApi.reply(selected.id, replyText.trim());
      setReplyText("");
      // Reload to get updated replies
      const updated = await contactApi.list();
      setMessages(updated);
      setSelected(updated.find(m => m.id === selected.id) || null);
    } catch(e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="page active">
      <AdminTopNav />
      <div style={{paddingTop:"56px",display:"flex",height:"100vh"}}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{
          width:"280px",flexShrink:0,
          background:"linear-gradient(180deg,#1a0533 0%,#12022b 100%)",
          borderRight:"1px solid rgba(124,58,237,0.15)",
          display:"flex",flexDirection:"column",overflow:"hidden",
        }}>
          {/* Sidebar nav */}
          <div style={{padding:"1rem",borderBottom:"1px solid rgba(124,58,237,0.1)"}}>
            <div className="nav-logo" style={{fontSize:"0.85rem",marginBottom:"0.75rem",cursor:"default"}}>
              <span className="nav-logo-icon" style={{width:"28px",height:"28px",fontSize:"0.8rem"}}>🎓</span>UniGuide
            </div>
            {[{icon:"🏠",label:"Dashboard",pg:"admin-dashboard"},
              {icon:"👥",label:"Users",pg:"admin-users"},
              {icon:"💬",label:"Messages",pg:"admin-chat",active:true},
              {icon:"⚙️",label:"Settings",pg:"admin-settings"}].map(item=>(
              <div key={item.pg} className={`dash-nav-item${item.active?" active":""}`}
                style={{padding:"0.4rem 0"}} onClick={()=>setPage(item.pg)}>
                <span className="nav-icon">{item.icon}</span>{item.label}
              </div>
            ))}
          </div>

          {/* Messages header */}
          <div style={{padding:"0.75rem 1rem",borderBottom:"1px solid rgba(124,58,237,0.1)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:"700",fontSize:"0.85rem",color:"rgba(255,255,255,0.7)"}}>
              Messages
            </span>
            {unreadCount > 0 && (
              <span style={{background:"#ef4444",color:"#fff",borderRadius:"10px",fontSize:"0.65rem",fontWeight:"700",padding:"0.15rem 0.45rem"}}>
                {unreadCount}
              </span>
            )}
          </div>

          {/* Message list */}
          <div style={{flex:1,overflowY:"auto"}}>
            {loading ? (
              <div style={{padding:"1rem",color:"rgba(255,255,255,0.3)",fontSize:"0.8rem",textAlign:"center"}}>Loading…</div>
            ) : messages.length === 0 ? (
              <div style={{padding:"1.5rem",color:"rgba(255,255,255,0.3)",fontSize:"0.8rem",textAlign:"center"}}>
                No messages yet
              </div>
            ) : messages.map(msg => (
              <div key={msg.id}
                onClick={() => setSelected(msg)}
                style={{
                  padding:"0.85rem 1rem",cursor:"pointer",
                  background: selected?.id === msg.id ? "rgba(124,58,237,0.2)" : "transparent",
                  borderLeft: selected?.id === msg.id ? "3px solid #7c3aed" : "3px solid transparent",
                  borderBottom:"1px solid rgba(124,58,237,0.08)",
                  transition:"background 0.15s",
                }}>
                <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.25rem"}}>
                  <div style={{
                    width:"32px",height:"32px",borderRadius:"50%",flexShrink:0,
                    background:"linear-gradient(135deg,#7c3aed,#a855f7)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:"0.75rem",fontWeight:"700",color:"#fff",
                  }}>
                    {initials(msg.name)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:"600",fontSize:"0.82rem",
                        color:"rgba(255,255,255,0.85)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {msg.name}
                      </span>
                      {!msg.read && (
                        <span style={{width:"7px",height:"7px",borderRadius:"50%",background:"#7c3aed",flexShrink:0}}/>
                      )}
                    </div>
                    <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.35)",overflow:"hidden",
                      textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Space Grotesk',sans-serif"}}>
                      {msg.subject || msg.message.slice(0,40)}…
                    </div>
                  </div>
                </div>
                <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.25)",fontFamily:"'Space Grotesk',sans-serif",paddingLeft:"2.4rem"}}>
                  {timeAgo(msg.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT CHAT PANEL ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",background:"#0f0a1e",overflow:"hidden"}}>
          {!selected ? (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"1rem"}}>
              <div style={{fontSize:"3rem"}}>💬</div>
              <div style={{color:"rgba(255,255,255,0.3)",fontFamily:"'Space Grotesk',sans-serif"}}>
                Select a message to reply
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{
                padding:"1rem 1.5rem",borderBottom:"1px solid rgba(124,58,237,0.15)",
                background:"rgba(124,58,237,0.05)",
                display:"flex",alignItems:"center",gap:"0.75rem",
              }}>
                <div style={{
                  width:"40px",height:"40px",borderRadius:"50%",
                  background:"linear-gradient(135deg,#7c3aed,#a855f7)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"0.9rem",fontWeight:"700",color:"#fff",
                }}>
                  {initials(selected.name)}
                </div>
                <div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:"700",fontSize:"0.95rem",color:"#fff"}}>
                    {selected.name}
                  </div>
                  <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)",fontFamily:"'Space Grotesk',sans-serif"}}>
                    {selected.email}
                    {selected.subject && <> · <em>{selected.subject}</em></>}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{flex:1,overflowY:"auto",padding:"1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>

                {/* Original message from user */}
                <div style={{display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
                  <div style={{
                    width:"36px",height:"36px",borderRadius:"50%",flexShrink:0,
                    background:"rgba(255,255,255,0.1)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:"0.8rem",fontWeight:"700",color:"rgba(255,255,255,0.7)",
                  }}>
                    {initials(selected.name)}
                  </div>
                  <div style={{maxWidth:"70%"}}>
                    <div style={{
                      background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",
                      borderRadius:"0 12px 12px 12px",padding:"0.75rem 1rem",
                      fontFamily:"'Space Grotesk',sans-serif",fontSize:"0.85rem",
                      color:"rgba(255,255,255,0.85)",lineHeight:"1.5",
                    }}>
                      {selected.message}
                    </div>
                    <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.25)",marginTop:"0.3rem",fontFamily:"'Space Grotesk',sans-serif"}}>
                      {timeAgo(selected.created_at)}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {(selected.replies || []).map((r, i) => (
                  <div key={i} style={{display:"flex",gap:"0.75rem",alignItems:"flex-start",flexDirection:"row-reverse"}}>
                    <div style={{
                      width:"36px",height:"36px",borderRadius:"50%",flexShrink:0,
                      background:"linear-gradient(135deg,#7c3aed,#a855f7)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:"0.8rem",fontWeight:"700",color:"#fff",
                    }}>
                      {initials(r.admin?.name || "Admin")}
                    </div>
                    <div style={{maxWidth:"70%"}}>
                      <div style={{
                        background:"linear-gradient(135deg,rgba(124,58,237,0.3),rgba(168,85,247,0.2))",
                        border:"1px solid rgba(124,58,237,0.3)",
                        borderRadius:"12px 0 12px 12px",padding:"0.75rem 1rem",
                        fontFamily:"'Space Grotesk',sans-serif",fontSize:"0.85rem",
                        color:"rgba(255,255,255,0.9)",lineHeight:"1.5",
                      }}>
                        {r.reply}
                      </div>
                      <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.25)",marginTop:"0.3rem",fontFamily:"'Space Grotesk',sans-serif",textAlign:"right"}}>
                        {r.admin?.name || "Admin"} · {timeAgo(r.created_at)}
                      </div>
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef}/>
              </div>

              {/* Reply input */}
              <div style={{
                padding:"1rem 1.5rem",borderTop:"1px solid rgba(124,58,237,0.15)",
                background:"rgba(124,58,237,0.05)",
                display:"flex",gap:"0.75rem",alignItems:"flex-end",
              }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendReply(); }}}
                  placeholder="Type your reply… (Enter to send, Shift+Enter for new line)"
                  rows={2}
                  style={{
                    flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(124,58,237,0.25)",
                    borderRadius:"10px",padding:"0.75rem 1rem",color:"rgba(255,255,255,0.85)",
                    fontFamily:"'Space Grotesk',sans-serif",fontSize:"0.85rem",resize:"none",
                    outline:"none",lineHeight:"1.5",
                  }}
                />
                <button onClick={sendReply} disabled={sending || !replyText.trim()} style={{
                  background:"linear-gradient(135deg,#7c3aed,#a855f7)",border:"none",
                  borderRadius:"10px",padding:"0.75rem 1.25rem",color:"#fff",
                  fontFamily:"'Space Grotesk',sans-serif",fontSize:"0.85rem",fontWeight:"600",
                  cursor: sending || !replyText.trim() ? "not-allowed" : "pointer",
                  opacity: sending || !replyText.trim() ? 0.5 : 1,
                  flexShrink:0,
                }}>
                  {sending ? "Sending…" : "Send ➤"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
