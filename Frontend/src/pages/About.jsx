import Footer from "../components/Footer";
import { useApp } from "../context/AppContext";

export default function About() {
  const { setPage } = useApp();
  return (
    <div className="page active">
      <section className="page-hero">
        <div className="breadcrumb"><a onClick={() => setPage("home")}>Home</a> | <span style={{color:"rgba(255,255,255,0.8)"}}>About</span></div>
        <h1>About us</h1>
      </section>
      <div className="about-body">
        <p className="about-statement">Our app guides students in choosing the right university major by analyzing their interests, skills, and career goals to provide smart recommendations.</p>
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
      </div>
      <Footer />
    </div>
  );
}
