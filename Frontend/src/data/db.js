export const INITIAL_USERS = [
  {id:1, name:'Admin User',       email:'admin@uniguide.com',   password:'admin123',   role:'admin',      active:true},
  {id:2, name:'Super Admin',      email:'super@uniguide.com',   password:'super123',   role:'superadmin', active:true},
  {id:3, name:'Kong Tana',        email:'tana@student.com',     password:'pass123',    role:'user',       active:true},
  {id:4, name:'Phat Khemarin',    email:'khemarin@student.com', password:'pass123',    role:'user',       active:true},
  {id:5, name:'Chrin Bunsopiney', email:'bun@student.com',      password:'pass123',    role:'user',       active:false},
  {id:6, name:'Phan Sokunmakara', email:'soku@student.com',     password:'pass123',    role:'user',       active:true},
  {id:7, name:'Sum Sopheranut',   email:'soph@student.com',     password:'pass123',    role:'user',       active:false},
];

export const INITIAL_ACTIVITY_LOGS = [
  { id:1, action:"Promoted Timothy Green to Super Admin", admin:'Michael Lee', role:'Super Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:2, action:"Changed Ashley Carter's permissions",   admin:'Michael Lee', role:'Super Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:3, action:"Added a new admin, Daniel Kim",         admin:'Michael Lee', role:'Admin',       date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:4, action:"Deleted user Olivia Brown",             admin:'Michael Lee', role:'Admin',       date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:5, action:"Password reset for Lisa Thompson",      admin:'Emily White', role:'Admin',       date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:6, action:"Created a new admin profile for Emily White", admin:'Michael Lee', role:'Super Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:7, action:"Deleted the admin profile for Sarah Jordan",  admin:'Michael Lee', role:'Admin',       date:'2 days ago – April 8, 2026 at 11:10 AM' },
  { id:8, action:"Added a new admin, Daniel Kim",         admin:'Timothy Green', role:'Super Admin', date:'2 days ago – April 8, 2026 at 11:10 AM' },
];

export const MAJORS_DB = [
  {
    id:'data-science', name:'Data Science', icon:'📊',
    desc:'Dive into data analysis, machine learning, and decision making. A data science major focuses on analyzing and interpreting complex data to gain actionable insights.',
    weights:[3,5,4,3,2],
    courses:['Introduction to Data Science','Machine Learning & AI','Data Visualization','Database Systems','Statistics & Probability'],
    skills:['Data Analysis','AI & Machine Learning','Programming','Problem Solving','Database Management','Data Visualization'],
    careers:['Data Scientist','Machine Learning Engineer','Business Analyst','Data Analyst','AI Engineer'],
  },
  {
    id:'computer-science', name:'Computer Science', icon:'💻',
    desc:'Study algorithms, software development, and problem solving using technology. Computer Science opens doors to every industry in the digital age.',
    weights:[4,5,3,3,1],
    courses:['Programming Fundamentals','Data Structures & Algorithms','Operating Systems','Software Engineering','Computer Networks'],
    skills:['Programming','Algorithm Design','System Architecture','Problem Solving','Software Development','Cybersecurity'],
    careers:['Software Engineer','Backend Developer','Full-Stack Developer','Systems Architect','DevOps Engineer'],
  },
  {
    id:'cloud-engineering', name:'Cloud Engineering', icon:'☁️',
    desc:'Learn how to build, manage, and scale cloud systems and networks. Cloud engineers design the infrastructure that powers modern businesses.',
    weights:[3,4,4,4,2],
    courses:['Cloud Architecture','DevOps & CI/CD','Network Security','Distributed Systems','Infrastructure as Code'],
    skills:['Cloud Platforms (AWS/GCP)','DevOps','Networking','Security','Containerization','Automation'],
    careers:['Cloud Architect','DevOps Engineer','Site Reliability Engineer','Cloud Consultant','Infrastructure Engineer'],
  },
  {
    id:'psychology', name:'Psychology', icon:'🧠',
    desc:'Understand human behavior, mental processes, and emotional wellbeing. Psychology graduates are equipped to help individuals and communities thrive.',
    weights:[4,1,3,4,5],
    courses:['Introduction to Psychology','Cognitive Psychology','Behavioral Science','Research Methods','Counseling Techniques'],
    skills:['Empathy & Communication','Research Analysis','Counseling','Behavioral Assessment','Data Interpretation','Critical Thinking'],
    careers:['Counselor','Clinical Psychologist','Human Resources Specialist','Researcher','UX Researcher'],
  },
  {
    id:'business', name:'Business Administration', icon:'📈',
    desc:'Learn to manage organizations, lead teams, and drive strategic growth. Business Administration develops entrepreneurs and corporate leaders.',
    weights:[3,3,2,5,4],
    courses:['Principles of Management','Marketing Strategy','Financial Accounting','Business Analytics','Entrepreneurship'],
    skills:['Leadership','Strategic Planning','Financial Analysis','Marketing','Team Management','Negotiation'],
    careers:['Business Manager','Marketing Director','Financial Analyst','Entrepreneur','Operations Manager'],
  },
  {
    id:'biology', name:'Biology', icon:'🔬',
    desc:'Explore life sciences, genetics, and ecosystems. Biology prepares students for careers in medicine, research, conservation, and biotechnology.',
    weights:[3,3,5,3,4],
    courses:['Cell Biology','Genetics','Ecology','Biochemistry','Microbiology'],
    skills:['Lab Research','Scientific Analysis','Data Collection','Critical Thinking','Report Writing','Environmental Assessment'],
    careers:['Biologist','Medical Researcher','Environmental Scientist','Biotech Specialist','Science Teacher'],
  },
];
