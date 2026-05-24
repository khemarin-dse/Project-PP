# UniGuide – Major Recommendation App

A university major recommendation web app with quiz, user auth, admin panel, and super admin dashboard.

---

## Project Structure

```
uniguide/
│
├── index.html              ← Main entry point (wires all partials + scripts)
│
├── css/                    ← Stylesheets (split by concern)
│   ├── base.css            ← CSS reset, :root variables, body
│   ├── nav.css             ← Navigation bar styles
│   ├── auth.css            ← Login / Register page styles
│   ├── pages.css           ← Home, About, Contact, hero sections
│   ├── components.css      ← Shared UI: footer, toast, cards, tables, charts, modal, chat
│   ├── quiz.css            ← Quiz question & results page styles
│   ├── admin.css           ← Admin & Super Admin dashboard component styles
│   └── theme.css           ← Light mode overrides + responsive breakpoints
│
├── js/                     ← JavaScript modules (split by feature)
│   ├── db.js               ← In-memory database / app state (DB object)
│   ├── router.js           ← Page router (showPage, showDash)
│   ├── auth.js             ← Auth helpers, register, login, logout (all roles)
│   ├── ui.js               ← Contact form, modals, table renderers, add/edit, chat
│   ├── quiz.js             ← Quiz state, MAJORS_DB, quiz logic, results, history
│   ├── admin.js            ← Activity logs, SA dashboard updates, edit admin/user modals
│   └── init.js             ← Bootstrap: showPage('home') + updateNav()
│
├── pages/                  ← HTML partials (one file per page/section)
│   ├── navbar.html         ← Top navigation bar
│   ├── home.html           ← Landing / hero page
│   ├── about.html          ← About page
│   ├── contact.html        ← Contact page
│   ├── register.html       ← User registration
│   ├── login.html          ← User login
│   ├── admin-login.html    ← Admin login
│   ├── superadmin-login.html ← Super admin login
│   ├── quiz-q1.html        ← Quiz question 1
│   ├── quiz-q2.html        ← Quiz question 2
│   ├── quiz-q3.html        ← Quiz question 3
│   ├── quiz-q4.html        ← Quiz question 4
│   ├── quiz-q5.html        ← Quiz question 5
│   ├── quiz-results.html   ← Quiz results / major matches
│   ├── major-detail.html   ← Major detail view
│   ├── my-results.html     ← User quiz history
│   ├── admin-dashboard.html     ← Admin dashboard
│   ├── admin-users.html         ← Admin: user management
│   ├── admin-settings.html      ← Admin: settings
│   ├── admin-chat.html          ← Admin: chat/messages
│   ├── superadmin-dashboard.html  ← Super admin dashboard
│   ├── superadmin-admins.html     ← SA: admin management
│   ├── superadmin-users.html      ← SA: user management
│   ├── superadmin-logs.html       ← SA: activity logs
│   ├── superadmin-settings.html   ← SA: settings
│   ├── modals.html          ← Add admin & add user modals
│   └── toast.html           ← Toast notification element
│
└── assets/                 ← Images, icons, fonts (add your own)
```

---

## How to Use

### Option A — Quick Start (copy partials into index.html)
Since this is a vanilla JS single-page app, the simplest approach is to paste all the page partial HTML from `pages/*.html` directly into `index.html` (replacing the `<!--#include-->` comments), then open `index.html` in a browser.

### Option B — Local Dev Server with Includes
Use a server that supports SSI (Server Side Includes) or a build tool:

```bash
# Python simple server (no includes support, use Option A)
python3 -m http.server 8080

# Apache/Nginx with SSI enabled supports <!--#include file="..." -->
```

### Option C — Build Tool (recommended for production)
Use a bundler like Vite or Parcel to properly import HTML partials, combine CSS, and bundle JS modules with ES module `import/export` syntax.

---

## Roles & Credentials (in-memory defaults)

| Role        | Email                   | Password  |
|-------------|-------------------------|-----------|
| User        | Register any email      | any pass  |
| Admin       | admin@uniguide.com      | admin123  |
| Super Admin | superadmin@uniguide.com | super123  |

---

## Tech Stack

- Vanilla HTML, CSS, JavaScript (no framework)
- Google Fonts: Outfit, Space Grotesk
- All state is in-memory (DB object in `js/db.js`) — refreshing resets data
