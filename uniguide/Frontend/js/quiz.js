// ─── QUIZ HISTORY / MY RESULTS ────────────────────────
// Store results keyed by userId
if (!window.QUIZ_HISTORY) window.QUIZ_HISTORY = {};

function saveQuizResult(top3) {
  if (!DB.currentUser || DB.currentUser.role !== 'user') return;
  const uid = DB.currentUser.id;
  if (!QUIZ_HISTORY[uid]) QUIZ_HISTORY[uid] = [];
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})
    + ' at ' + now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
  QUIZ_HISTORY[uid].unshift({
    date: dateStr,
    top3: top3.map(m => ({ id:m.id, name:m.name, icon:m.icon, score:m.score })),
    answers: { ...QUIZ.answers }
  });
}

function goToMyResults() {
  if (!DB.currentUser) { showPage('login'); return; }
  renderMyResults();
  showPage('my-results');
}

function renderMyResults() {
  const uid = DB.currentUser ? DB.currentUser.id : null;
  const history = uid && QUIZ_HISTORY[uid] ? QUIZ_HISTORY[uid] : [];
  const container = document.getElementById('my-results-container');
  if (!container) return;

  if (history.length === 0) {
    container.innerHTML = `
      <div class="my-results-empty">
        <span class="empty-icon">🎯</span>
        <p>You haven't taken the quiz yet.<br>Take the quiz to discover your best-fit majors!</p>
        <br>
        <button class="btn-retake" onclick="retakeQuiz();showPage('quiz-1')">Start Quiz →</button>
      </div>`;
    return;
  }

  const rankEmojis = ['🥇','🥈','🥉'];
  container.innerHTML = history.map((entry, i) => `
    <div class="my-result-entry">
      <div class="my-result-entry-header">
        <div class="my-result-entry-num">Quiz #${history.length - i}</div>
        <div class="my-result-entry-date">📅 ${entry.date}</div>
      </div>
      <div class="my-result-podium">
        ${entry.top3.map((m, rank) => `
          <div class="my-result-chip" onclick="showMajorDetail('${m.id}')">
            <span class="chip-rank">${rankEmojis[rank]}</span>
            <span style="font-size:1.1rem">${m.icon}</span>
            <span class="chip-name">${m.name}</span>
            <span class="chip-score">${m.score}pts</span>
          </div>
        `).join('')}
      </div>
      <div class="my-result-retake">
        <span class="my-result-retake-label">Want a different result?</span>
        <button class="btn-my-retake" onclick="retakeQuiz();showPage('quiz-1')">🔄 Retake Quiz</button>
      </div>
    </div>
  `).join('');
}


// ─── THEME TOGGLE ─────────────────────────────────────
let isDarkMode = true;
function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('light-mode', !isDarkMode);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = isDarkMode ? '🌙' : '☀️';
}

// ─── QUIZ STATE ───────────────────────────────────────
const QUIZ = {
  answers: {1:0, 2:0, 3:0, 4:0, 5:0},
};

// Major definitions with scoring weights
// [analytical, math, science, teamwork, social]
const MAJORS_DB = [
  {
    id:'data-science',
    name:'Data Science',
    icon:'📊',
    desc:'Dive into data analysis, machine learning, and decision making. A data science major focuses on analyzing and interpreting complex data to gain actionable insights.',
    weights:[3,5,4,3,2],
    courses:['Introduction to Data Science','Machine Learning & AI','Data Visualization','Database Systems','Statistics & Probability'],
    skills:['Data Analysis','AI & Machine Learning','Programming','Problem Solving','Database Management','Data Visualization'],
    careers:['Data Scientist','Machine Learning Engineer','Business Analyst','Data Analyst','AI Engineer'],
  },
  {
    id:'computer-science',
    name:'Computer Science',
    icon:'💻',
    desc:'Study algorithms, software development, and problem solving using technology. Computer Science opens doors to every industry in the digital age.',
    weights:[4,5,3,3,1],
    courses:['Programming Fundamentals','Data Structures & Algorithms','Operating Systems','Software Engineering','Computer Networks'],
    skills:['Programming','Algorithm Design','System Architecture','Problem Solving','Software Development','Cybersecurity'],
    careers:['Software Engineer','Backend Developer','Full-Stack Developer','Systems Architect','DevOps Engineer'],
  },
  {
    id:'cloud-engineering',
    name:'Cloud Engineering',
    icon:'☁️',
    desc:'Learn how to build, manage, and scale cloud systems and networks. Cloud engineers design the infrastructure that powers modern businesses.',
    weights:[3,4,4,4,2],
    courses:['Cloud Architecture','DevOps & CI/CD','Network Security','Distributed Systems','Infrastructure as Code'],
    skills:['Cloud Platforms (AWS/GCP)','DevOps','Networking','Security','Containerization','Automation'],
    careers:['Cloud Architect','DevOps Engineer','Site Reliability Engineer','Cloud Consultant','Infrastructure Engineer'],
  },
  {
    id:'psychology',
    name:'Psychology',
    icon:'🧠',
    desc:'Understand human behavior, mental processes, and emotional wellbeing. Psychology graduates are equipped to help individuals and communities thrive.',
    weights:[4,1,3,4,5],
    courses:['Introduction to Psychology','Cognitive Psychology','Behavioral Science','Research Methods','Counseling Techniques'],
    skills:['Empathy & Communication','Research Analysis','Counseling','Behavioral Assessment','Data Interpretation','Critical Thinking'],
    careers:['Counselor','Clinical Psychologist','Human Resources Specialist','Researcher','UX Researcher'],
  },
  {
    id:'business',
    name:'Business Administration',
    icon:'📈',
    desc:'Learn to manage organizations, lead teams, and drive strategic growth. Business Administration develops entrepreneurs and corporate leaders.',
    weights:[3,3,2,5,4],
    courses:['Principles of Management','Marketing Strategy','Financial Accounting','Business Analytics','Entrepreneurship'],
    skills:['Leadership','Strategic Planning','Financial Analysis','Marketing','Team Management','Negotiation'],
    careers:['Business Manager','Marketing Director','Financial Analyst','Entrepreneur','Operations Manager'],
  },
  {
    id:'biology',
    name:'Biology',
    icon:'🔬',
    desc:'Explore life sciences, genetics, and ecosystems. Biology prepares students for careers in medicine, research, conservation, and biotechnology.',
    weights:[3,3,5,3,4],
    courses:['Cell Biology','Genetics','Ecology','Biochemistry','Microbiology'],
    skills:['Lab Research','Scientific Analysis','Data Collection','Critical Thinking','Report Writing','Environmental Assessment'],
    careers:['Biologist','Medical Researcher','Environmental Scientist','Biotech Specialist','Science Teacher'],
  },
];

function selectRating(question, value) {
  QUIZ.answers[question] = value;
  const btns = document.querySelectorAll('#rating-' + question + ' .rating-btn');
  btns.forEach((btn, i) => {
    btn.classList.toggle('selected', (i + 1) === value);
  });
}

function quizNext(currentQ) {
  if (!QUIZ.answers[currentQ]) {
    toast('Please select a rating before continuing.', 'error');
    return;
  }
  showPage('quiz-' + (currentQ + 1));
}

function submitQuiz() {
  if (!QUIZ.answers[5]) {
    toast('Please select a rating before submitting.', 'error');
    return;
  }
  computeResults();
  showPage('quiz-results');
}

function computeResults() {
  const ans = QUIZ.answers;
  // Score each major: sum of (answer * weight) for each dimension
  const scores = MAJORS_DB.map(m => {
    const score =
      ans[1] * m.weights[0] +
      ans[2] * m.weights[1] +
      ans[3] * m.weights[2] +
      ans[4] * m.weights[3] +
      ans[5] * m.weights[4];
    return { ...m, score };
  });
  scores.sort((a,b) => b.score - a.score);
  const top3 = scores.slice(0, 3);

  const grid = document.getElementById('majors-grid');
  const rankConfig = [
    { badge:'🥇 Top 1', cls:'gold',   cardCls:'top1' },
    { badge:'🥈 Top 2', cls:'silver', cardCls:'' },
    { badge:'🥉 Top 3', cls:'bronze', cardCls:'' },
  ];
  // Display: Top2 | Top1 | Top3
  const display = [top3[1], top3[0], top3[2]];
  const dispRank = [rankConfig[1], rankConfig[0], rankConfig[2]];

  grid.innerHTML = display.map((m, i) => `
    <div class="major-result-card ${dispRank[i].cardCls}" onclick="showMajorDetail('${m.id}')">
      <div class="rank-badge ${dispRank[i].cls}">${dispRank[i].badge}</div>
      <span class="major-result-icon">${m.icon}</span>
      <div class="major-result-name">${m.name}</div>
      <div class="major-result-desc">${m.desc.split('.')[0]}.</div>
      <button class="btn-see-more" onclick="event.stopPropagation();showMajorDetail('${m.id}')">See More →</button>
    </div>
  `).join('');
  QUIZ.top3 = top3;
  saveQuizResult(top3);
}

function showMajorDetail(majorId) {
  const m = MAJORS_DB.find(x => x.id === majorId);
  if (!m) return;
  document.getElementById('detail-icon').textContent = m.icon;
  document.getElementById('detail-name').textContent = m.name;
  document.getElementById('detail-desc').textContent = m.desc;
  document.getElementById('detail-grid').innerHTML = `
    <div class="detail-card">
      <div class="detail-card-title">Key Courses</div>
      <ul class="detail-list">${m.courses.map(c => '<li>' + c + '</li>').join('')}</ul>
    </div>
    <div class="detail-card">
      <div class="detail-card-title">Skills You'll Gain</div>
      <ul class="detail-list">${m.skills.map(s => '<li>' + s + '</li>').join('')}</ul>
    </div>
    <div class="detail-card">
      <div class="detail-card-title">Career Paths</div>
      <ul class="detail-list">${m.careers.map(c => '<li>' + c + '</li>').join('')}</ul>
    </div>
  `;
  showPage('major-detail');
}

function retakeQuiz() {
  QUIZ.answers = {1:0, 2:0, 3:0, 4:0, 5:0};
  [1,2,3,4,5].forEach(q => {
    const btns = document.querySelectorAll('#rating-' + q + ' .rating-btn');
    btns.forEach(b => b.classList.remove('selected'));
  });
  showPage('quiz-1');
}


