import { useState } from "react";
import Footer from "../components/Footer";
import { useApp } from "../context/AppContext";
import { contactApi } from "../data/api";

export default function Contact() {
  const { setPage, showToast, currentUser } = useApp();
  const [form, setForm] = useState({ subject:"", message:"" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const doContact = async () => {
    // If not logged in, redirect to register
    if (!currentUser) {
      showToast("Please sign up or log in to send a message.", "error");
      setPage("register");
      return;
    }

    if (!form.message) {
      showToast("Please write a message.", "error");
      return;
    }

    setLoading(true);
    try {
      await contactApi.send(currentUser.name, currentUser.email, form.subject, form.message);
      setSuccess(true);
      setForm({ subject:"", message:"" });
      setTimeout(() => setSuccess(false), 5000);
    } catch(e) {
      showToast(e.message || "Failed to send message.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active">
      <section className="page-hero">
        <div className="breadcrumb">
          <a onClick={() => setPage("home")}>Home</a> | <span style={{color:"rgba(255,255,255,0.8)"}}>Contact</span>
        </div>
        <h1>Contact us</h1>
      </section>
      <div className="contact-body">
        <div className="contact-card">
          <h3>Get in Touch</h3>

          {/* Not logged in — show sign up prompt */}
          {!currentUser && (
            <div style={{
              background:"rgba(124,58,237,0.1)",
              border:"1px solid rgba(124,58,237,0.3)",
              borderRadius:"12px", padding:"1.25rem",
              marginBottom:"1.25rem", textAlign:"center",
            }}>
              <div style={{fontSize:"1.5rem", marginBottom:"0.5rem"}}>🔒</div>
              <div style={{
                fontFamily:"'Outfit',sans-serif", fontWeight:"700",
                fontSize:"0.95rem", color:"rgba(255,255,255,0.85)",
                marginBottom:"0.4rem",
              }}>
                Sign in to send a message
              </div>
              <div style={{
                fontSize:"0.8rem", color:"rgba(255,255,255,0.45)",
                fontFamily:"'Space Grotesk',sans-serif", marginBottom:"1rem",
              }}>
                You need an account to contact our team
              </div>
              <div style={{display:"flex", gap:"0.75rem", justifyContent:"center", flexWrap:"wrap"}}>
                <button className="btn btn-primary" onClick={() => setPage("register")}
                  style={{fontSize:"0.85rem", padding:"0.5rem 1.25rem"}}>
                  Sign Up
                </button>
                <button className="btn btn-outline" onClick={() => setPage("login")}
                  style={{fontSize:"0.85rem", padding:"0.5rem 1.25rem"}}>
                  Log In
                </button>
              </div>
            </div>
          )}

          {/* Logged in — show sender info */}
          {currentUser && (
            <div style={{
              display:"flex", alignItems:"center", gap:"0.75rem",
              background:"rgba(124,58,237,0.1)",
              border:"1px solid rgba(124,58,237,0.25)",
              borderRadius:"10px", padding:"0.75rem 1rem", marginBottom:"1.25rem",
            }}>
              <div style={{
                width:"36px", height:"36px", borderRadius:"50%",
                background:"linear-gradient(135deg,#7c3aed,#a855f7)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"1rem", fontWeight:"700", color:"#fff", flexShrink:0,
              }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{fontSize:"0.82rem",fontWeight:"600",color:"rgba(255,255,255,0.9)"}}>
                  Sending as <strong>{currentUser.name}</strong>
                </div>
                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>
                  {currentUser.email}
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              ✓ Your message has been sent! We will get back to you soon.
            </div>
          )}

          {/* Form — only show if logged in */}
          {currentUser && (
            <>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="contact-input" placeholder="Write your message here…" rows={4}
                  value={form.message} onChange={e => setForm({...form, message:e.target.value})} />
              </div>
              <div className="form-group" style={{marginBottom:"1.25rem"}}>
                <input className="contact-input" type="text" placeholder="Enter Subject (optional)"
                  value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} />
              </div>
              <button className="btn-submit" onClick={doContact} disabled={loading}>
                {loading ? "Sending…" : "Send Message"}
              </button>
            </>
          )}

          {/* If not logged in, still show a disabled send button */}
          {!currentUser && (
            <button className="btn-submit" onClick={doContact}
              style={{opacity:0.4, cursor:"not-allowed"}}>
              Send Message
            </button>
          )}
        </div>

        <div className="info-card">
          <div className="info-item">
            <div className="info-icon">🏠</div>
            <div><div className="info-label">Home</div><div className="info-value">Information</div></div>
          </div>
          <div className="info-item">
            <div className="info-icon">📞</div>
            <div>
              <div className="info-label">Phone</div>
              <div className="info-value">011 111 111<br/><small className="info-small">Information</small></div>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">✉️</div>
            <div>
              <div className="info-label">Gmail</div>
              <div className="info-value">Gmail.com<br/><small className="info-small">Information</small></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
