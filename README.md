# UniGuide – Full-Stack Major Recommendation System

## Project Structure

```
uniguide/
├── uniguide-react/      ← React 18 + Vite frontend
└── uniguide-laravel/    ← Laravel 11 + Sanctum backend
```

---

## 🚀 Quick Start

### 1. Frontend — React + Vite

```bash
cd uniguide-react
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:8000/api
```

Start dev server:
```bash
npm run dev
# → http://localhost:5173
```

---

### 2. Backend — Laravel 11

#### Requirements
- PHP >= 8.2
- Composer
- MySQL 8+ **or** SQLite (for quick local dev)

```bash
cd uniguide-laravel
composer install
cp .env.example .env
php artisan key:generate
```

#### Database setup

**Option A – MySQL (recommended)**
1. Create a database: `CREATE DATABASE uniguide;`
2. Edit `.env`: set `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

**Option B – SQLite (zero-config)**
```bash
# In .env, comment out the MySQL lines and add:
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/uniguide-laravel/database/database.sqlite

touch database/database.sqlite
```

#### Run migrations & seed

```bash
php artisan migrate --seed
```

This creates all tables and seeds the demo accounts:

| Role       | Email                   | Password  |
|------------|-------------------------|-----------|
| Super Admin | super@uniguide.com     | super123  |
| Admin       | admin@uniguide.com     | admin123  |
| User        | tana@student.com       | pass123   |
| User        | khemarin@student.com   | pass123   |

#### Start the server

```bash
php artisan serve
# → http://localhost:8000
```

---

## 🗄️ Database Schema

### `users`
| Column     | Type     | Notes                         |
|------------|----------|-------------------------------|
| id         | bigint   | PK                            |
| name       | string   |                               |
| email      | string   | unique                        |
| password   | string   | bcrypt hashed                 |
| role       | enum     | `user` / `admin` / `superadmin` |
| active     | boolean  | default true                  |
| created_at | timestamp |                              |
| updated_at | timestamp |                              |

### `quiz_results`
| Column     | Type     | Notes                    |
|------------|----------|--------------------------|
| id         | bigint   | PK                       |
| user_id    | bigint   | FK → users               |
| answers    | json     | Array of 5 scores (1–5)  |
| top_majors | json     | Top 3 scored majors      |
| created_at | timestamp |                         |

### `activity_logs`
| Column         | Type      | Notes                   |
|----------------|-----------|-------------------------|
| id             | bigint    | PK                      |
| action         | string    | Description of action   |
| performed_by   | string    | Admin name              |
| performed_role | string    | Admin / Super Admin     |
| created_at     | timestamp |                         |

### `contact_messages`
| Column    | Type    | Notes                  |
|-----------|---------|------------------------|
| id        | bigint  | PK                     |
| name      | string  |                        |
| email     | string  |                        |
| subject   | string  | nullable               |
| message   | text    |                        |
| read      | boolean | default false          |

---

## 📡 API Endpoints

All endpoints are prefixed with `/api`.

### Public
| Method | Path           | Description              |
|--------|----------------|--------------------------|
| POST   | /register      | Register a new user      |
| POST   | /login         | User login               |
| POST   | /admin/login   | Admin / Super Admin login |
| POST   | /contact       | Send a contact message   |

### Authenticated (any role)
| Method | Path             | Description          |
|--------|------------------|----------------------|
| GET    | /me              | Get current user     |
| POST   | /logout          | Logout               |
| POST   | /quiz/submit     | Submit quiz answers  |
| GET    | /quiz/history    | Get quiz history     |

### Admin & Super Admin
| Method | Path                        | Description          |
|--------|-----------------------------|----------------------|
| GET    | /users                      | List all users       |
| POST   | /users                      | Create a user        |
| PATCH  | /users/{id}                 | Update a user        |
| PATCH  | /users/{id}/toggle          | Toggle active status |
| DELETE | /users/{id}                 | Delete a user        |
| GET    | /contact                    | List contact messages|
| PATCH  | /contact/{id}/read          | Mark message as read |

### Super Admin only
| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| GET    | /admins           | List all admins          |
| POST   | /admins           | Create an admin          |
| PATCH  | /admins/{id}      | Update an admin          |
| DELETE | /admins/{id}      | Delete an admin          |
| GET    | /activity-logs    | List activity logs       |

---

## 🔐 Authentication

The backend uses **Laravel Sanctum** (token-based API auth).

After a successful login, the API returns:
```json
{
  "user":  { "id": 1, "name": "...", "email": "...", "role": "user", "active": true },
  "token": "1|abc123..."
}
```

The React app stores the token and sends it as `Authorization: Bearer <token>` on every subsequent request.

The React API service is located at:
```
uniguide-react/src/data/api.js
```

---

## 🛠️ Technology Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React 18, Vite          |
| Styling   | CSS (original design, unchanged) |
| State     | React Context API       |
| Backend   | Laravel 11              |
| Auth      | Laravel Sanctum (tokens)|
| Database  | MySQL 8 / SQLite        |
| API       | RESTful JSON            |

---

## 📁 React Source Structure

```
src/
├── context/
│   └── AppContext.jsx       ← Global state (users, auth, quiz, theme)
├── data/
│   ├── db.js               ← Static demo data (majors, mock users)
│   └── api.js              ← Laravel API service layer
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Modal.jsx
│   └── Toast.jsx
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   ├── Auth.jsx            ← Register, Login, AdminLogin, SALogin
│   ├── Quiz.jsx            ← QuizQuestion, QuizResults, MajorDetail, MyResults
│   ├── AdminPages.jsx      ← Dashboard, Users, Settings, Chat
│   └── SAPages.jsx         ← SA Dashboard, Management, Users, Logs, Settings
├── styles/
│   └── index.css           ← All original CSS (unchanged)
├── App.jsx                 ← Page router
└── main.jsx                ← Entry point
```

## 📁 Laravel Source Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── UserController.php
│   │   ├── AdminController.php
│   │   ├── QuizController.php
│   │   ├── ContactController.php
│   │   └── ActivityLogController.php
│   └── Middleware/
│       └── RoleMiddleware.php
├── Models/
│   ├── User.php
│   ├── QuizResult.php
│   ├── ActivityLog.php
│   └── ContactMessage.php
database/
├── migrations/             ← 4 migration files
└── seeders/
    └── DatabaseSeeder.php
routes/
└── api.php
config/
└── cors.php
```
