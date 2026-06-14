import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { MAJORS_DB } from "../data/db";
import { quizApi } from "../data/api";

const QUESTIONS = [
  { q:"How much do you enjoy reading complex texts and writing analytically?", labels:["Not Interested","Very Interested"] },
  { q:"How much do you enjoy solving mathematical problems and logical puzzles?", labels:["Not Interested","Very Interested"] },
  { q:"How interested are you in conducting experiments and scientific research?", labels:["Not Interested","Very Interested"] },
  { q:"Do you prefer working independently or collaborating in a team?", labels:["Independent","Team Player"] },
  { q:"How important is it for your work to directly help people or society?", labels:["Not Interested","Very Interested"] },
];

function QuizDots({ current }) {
  return (
    <div className="quiz-progress">
      {[1,2,3,4,5].map(n => (
        <div key={n} className={`quiz-dot ${n < current ? "done" : n === current ? "active" : ""}`} />
      ))}
    </div>
  );
}

export function QuizQuestion({ questionNum }) {
  const { quizAnswers, setQuizAnswers, setPage, showToast, currentUser } = useApp();
  const q = QUESTIONS[questionNum - 1];

  const selectRating = (val) => setQuizAnswers(prev => ({ ...prev, [questionNum]: val }));

  const handleNext = async () => {
    if (!quizAnswers[questionNum]) { showToast("Please select a rating before continuing.", "error"); return; }
    if (questionNum < 5) { setPage(`quiz-${questionNum + 1}`); return; }
    // Submit
    const answers = [quizAnswers[1], quizAnswers[2], quizAnswers[3], quizAnswers[4], quizAnswers[5]];
    try {
      const { top_majors } = await quizApi.submit(answers);
      // Enrich with full major data
      const enriched = top_majors.map(m => {
        const full = MAJORS_DB.find(x => x.id === m.id) || {};
        return { ...full, ...m };
      });
      window._quizTop3 = enriched;
    } catch(_) {
      // Fallback: compute locally if API fails
      const scores = MAJORS_DB.map(m => ({
        ...m,
        score: answers.reduce((sum, a, i) => sum + a * m.weights[i], 0)
      })).sort((a,b) => b.score - a.score);
      window._quizTop3 = scores.slice(0,3);
    }
    setPage("quiz-results");
  };

  return (
    <div className="page active">
      <div className="quiz-page">
        <div className="quiz-card">
          <QuizDots current={questionNum} />
          <div className="quiz-step">Question {questionNum} of 5</div>
          <div className="quiz-title">Question {questionNum}</div>
          <div className="quiz-question">{q.q}</div>
          <div className="quiz-rating">
            {[1,2,3,4,5].map(v => (
              <button key={v} className={`rating-btn${quizAnswers[questionNum]===v?" selected":""}`}
                onClick={() => selectRating(v)}>{v}</button>
            ))}
          </div>
          <div className="quiz-rating-labels"><span>{q.labels[0]}</span><span>{q.labels[1]}</span></div>
          <div className={`quiz-nav${questionNum > 1 ? " has-back" : ""}`}>
            {questionNum > 1 && (
              <button className="btn-quiz btn-quiz-ghost" onClick={() => setPage(`quiz-${questionNum-1}`)}>Back</button>
            )}
            <button className="btn-quiz btn-quiz-primary" onClick={handleNext}>
              {questionNum === 5 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const RANK_CONFIG = [
  { badge:"🥇 Top 1", cls:"gold",   cardCls:"top1" },
  { badge:"🥈 Top 2", cls:"silver", cardCls:"" },
  { badge:"🥉 Top 3", cls:"bronze", cardCls:"" },
];

export function QuizResults() {
  const { setPage, setQuizAnswers } = useApp();
  const top3 = window._quizTop3 || [];
  const display = [top3[1], top3[0], top3[2]].filter(Boolean);
  const dispRank = [RANK_CONFIG[1], RANK_CONFIG[0], RANK_CONFIG[2]];

  const retake = () => {
    setQuizAnswers({1:0,2:0,3:0,4:0,5:0});
    setPage("quiz-1");
  };

  return (
    <div className="page active">
      <div className="results-page">
        <div className="results-header">
          <h1>🎉 Explore Your Future!</h1>
          <p>Based on your answers, here are the best majors for you</p>
        </div>
        <div className="majors-grid">
          {display.map((m, i) => m && (
            <div key={m.id} className={`major-result-card ${dispRank[i].cardCls}`}
              onClick={() => { window._detailMajor = m.id; setPage("major-detail"); }}>
              <div className={`rank-badge ${dispRank[i].cls}`}>{dispRank[i].badge}</div>
              <span className="major-result-icon">{m.icon}</span>
              <div className="major-result-name">{m.name}</div>
              <div className="major-result-desc">{m.desc?.split(".")[0]}.</div>
              <button className="btn-see-more"
                onClick={e => { e.stopPropagation(); window._detailMajor = m.id; setPage("major-detail"); }}>
                See More →
              </button>
            </div>
          ))}
        </div>
        <div className="results-actions">
          <button className="btn-retake" onClick={retake}>🔄 Retake Quiz</button>
        </div>
      </div>
    </div>
  );
}

export function MajorDetail() {
  const { setPage } = useApp();
  const m = MAJORS_DB.find(x => x.id === window._detailMajor);
  if (!m) return null;
  return (
    <div className="page active">
      <div className="major-detail-page">
        <div className="detail-header">
          <div className="detail-icon-wrap">{m.icon}</div>
          <h1 className="detail-title">{m.name}</h1>
          <p className="detail-subtitle">{m.desc}</p>
        </div>
        <div className="detail-grid">
          {[
            { title:"Key Courses", items: m.courses },
            { title:"Skills You'll Gain", items: m.skills },
            { title:"Career Paths", items: m.careers },
          ].map(({ title, items }) => (
            <div className="detail-card" key={title}>
              <div className="detail-card-title">{title}</div>
              <ul className="detail-list">{items.map(c => <li key={c}>{c}</li>)}</ul>
            </div>
          ))}
        </div>
        <button className="detail-back-btn" onClick={() => setPage("quiz-results")}>← Back to Results</button>
      </div>
    </div>
  );
}

export function MyResults() {
  const { currentUser, setPage, setQuizAnswers } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const rankEmojis = ["🥇","🥈","🥉"];

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    quizApi.history()
      .then(data => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const retake = () => {
    setQuizAnswers({1:0,2:0,3:0,4:0,5:0});
    setPage("quiz-1");
  };

  return (
    <div className="page active">
      <div className="my-results-page">
        <div className="my-results-header">
          <h1>📋 My Quiz Results</h1>
          <p>Your past major predictions — tap any major to view full details</p>
        </div>
        <div className="my-results-list">
          {loading ? (
            <div className="my-results-empty"><p>Loading your results…</p></div>
          ) : history.length === 0 ? (
            <div className="my-results-empty">
              <span className="empty-icon">🎯</span>
              <p>You haven't taken the quiz yet.<br/>Take the quiz to discover your best-fit majors!</p>
              <br/>
              <button className="btn-retake" onClick={retake}>Start Quiz →</button>
            </div>
          ) : history.map((entry, i) => (
            <div className="my-result-entry" key={entry.id}>
              <div className="my-result-entry-header">
                <div className="my-result-entry-num">Quiz #{history.length - i}</div>
                <div className="my-result-entry-date">📅 {new Date(entry.created_at).toLocaleString()}</div>
              </div>
              <div className="my-result-podium">
                {(entry.top_majors||[]).map((m, rank) => (
                  <div className="my-result-chip" key={m.id}
                    onClick={() => { window._detailMajor = m.id; setPage("major-detail"); }}>
                    <span className="chip-rank">{rankEmojis[rank]}</span>
                    <span style={{fontSize:"1.1rem"}}>{m.icon}</span>
                    <span className="chip-name">{m.name}</span>
                    <span className="chip-score">{m.score}pts</span>
                  </div>
                ))}
              </div>
              <div className="my-result-retake">
                <span className="my-result-retake-label">Want a different result?</span>
                <button className="btn-my-retake" onClick={retake}>🔄 Retake Quiz</button>
              </div>
            </div>
          ))}
        </div>
        <div className="my-results-actions">
          <button className="btn-retake" onClick={retake}>🎯 Take Quiz Again</button>
          &nbsp;
          <button className="btn-retake" style={{marginTop:"0.5rem"}} onClick={() => setPage("home")}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
}
