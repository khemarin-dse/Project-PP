import { useApp } from "../context/AppContext";
import Footer from "../components/Footer";

export default function Home() {
  const { currentUser, setPage, showToast } = useApp();

  const heroBadge = currentUser ? `Welcome back, ${currentUser.name}!` : "Smart Career Guidance";

  const handleCTA = () => {
    if (!currentUser) { setPage("register"); return; }
    if (currentUser.role === "superadmin") setPage("sa-dashboard");
    else if (currentUser.role === "admin") setPage("admin-dashboard");
    else setPage("quiz-1");
  };

  const ctaLabel = !currentUser ? "Start Now"
    : currentUser.role === "superadmin" ? "Go to Super Admin Dashboard"
    : currentUser.role === "admin" ? "Go to Admin Dashboard"
    : "Start Quiz 🎯";

  return (
    <div className="page active">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">{heroBadge}</div>
          <h1>Major<br/>Recommendation</h1>
          <p>Discovering your strength. Explore your interest and find the university major that will lead your future career.</p>
          <button className="btn btn-primary btn-lg" onClick={handleCTA}>{ctaLabel}</button>
        </div>
        <div className="hero-illus">
          <div className="hero-illus-card">
            <span className="hero-illus-icon">📚</span>
            <div className="hero-illus-text">Find your perfect major</div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Our Developer</h2>
        <div className="team-grid">
          {[
            {emoji:"👨‍🎨",name:"Kong Tana",role:"Designer"},
            {emoji:"👩‍💻",name:"Phat Khemarin",role:"Backend"},
            {emoji:"👨‍💻",name:"Chrin Bunsopiney",role:"Frontend"},
            {emoji:"🧑‍💻",name:"Phan Sokunmakara",role:"Frontend"},
            {emoji:"👨‍🔬",name:"Sum Sopheranut",role:"Backend"},
          ].map(m => (
            <div className="team-card" key={m.name}>
              <div className="team-avatar">{m.emoji}</div>
              <div className="team-name">{m.name}</div>
              <div className="team-role">{m.role}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
