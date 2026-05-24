// ─── STATE ───────────────────────────────────────────
const DB = {
  users: [
    {id:1, name:'Admin User',      email:'admin@uniguide.com',   password:'admin123',   role:'admin',      active:true},
    {id:2, name:'Super Admin',     email:'super@uniguide.com',   password:'super123',   role:'superadmin', active:true},
    {id:3, name:'Kong Tana',       email:'tana@student.com',     password:'pass123',    role:'user',       active:true},
    {id:4, name:'Phat Khemarin',   email:'khemarin@student.com', password:'pass123',    role:'user',       active:true},
    {id:5, name:'Chrin Bunsopiney',email:'bun@student.com',      password:'pass123',    role:'user',       active:false},
    {id:6, name:'Phan Sokunmakara',email:'soku@student.com',     password:'pass123',    role:'user',       active:true},
    {id:7, name:'Sum Sopheranut',  email:'soph@student.com',     password:'pass123',    role:'user',       active:false},
  ],
  nextId: 8,
  currentUser: null,
};

