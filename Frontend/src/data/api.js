const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const getToken   = ()      => localStorage.getItem("ug_token");
export const setToken   = (token) => localStorage.setItem("ug_token", token);
export const clearToken = ()      => localStorage.removeItem("ug_token");

async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      json?.message ??
      Object.values(json?.errors ?? {})?.[0]?.[0] ??
      "An error occurred.";
    throw new Error(msg);
  }

  return json;
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (name, email, password, passwordConfirmation) =>
    api("/register", { method:"POST", body:{ name, email, password, password_confirmation: passwordConfirmation } }),
  login: (email, password) =>
    api("/login", { method:"POST", body:{ email, password } }),
  adminLogin: (email, password) =>
    api("/admin/login", { method:"POST", body:{ email, password } }),
  logout: () => api("/logout", { method:"POST" }),
  me: () => api("/me"),
};

// ── QUIZ ──────────────────────────────────────────────────────────────────────
export const quizApi = {
  submit:  (answers) => api("/quiz/submit", { method:"POST", body:{ answers } }),
  history: ()        => api("/quiz/history"),
};

// ── USERS ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list:         (search = "") => api(`/users${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  create:       (name, email, password, passwordConfirmation, active = true) =>
    api("/users", { method:"POST", body:{ name, email, password, password_confirmation: passwordConfirmation, active } }),
  update:       (id, data)    => api(`/users/${id}`,        { method:"PATCH",  body: data }),
  toggleStatus: (id)          => api(`/users/${id}/toggle`, { method:"PATCH" }),
  remove:       (id)          => api(`/users/${id}`,        { method:"DELETE" }),
};

// ── ADMINS ────────────────────────────────────────────────────────────────────
export const adminsApi = {
  list:   ()                                                     => api("/admins"),
  create: (name, email, password, passwordConfirmation, role = "admin") =>
    api("/admins", { method:"POST", body:{ name, email, password, password_confirmation: passwordConfirmation, role } }),
  update: (id, data) => api(`/admins/${id}`, { method:"PATCH",  body: data }),
  remove: (id)       => api(`/admins/${id}`, { method:"DELETE" }),
};

// ── ACTIVITY LOGS ─────────────────────────────────────────────────────────────
export const logsApi = {
  list: (search = "") => api(`/activity-logs${search ? `?search=${encodeURIComponent(search)}` : ""}`),
};

// ── CONTACT ───────────────────────────────────────────────────────────────────
export const contactApi = {
  send:    (name, email, subject, message) =>
    api("/contact", { method:"POST", body:{ name, email, subject, message } }),
  list:    ()    => api("/contact"),
  markRead:(id)  => api(`/contact/${id}/read`, { method:"PATCH" }),
  reply:   (id, reply) => api(`/contact/${id}/reply`, { method:"POST", body:{ reply } }),
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list:        ()   => api("/notifications"),
  unreadCount: ()   => api("/notifications/unread-count"),
  markRead:    (id) => api(`/notifications/${id}/read`, { method:"PATCH" }),
  markAllRead: ()   => api("/notifications/read-all",   { method:"PATCH" }),
};
