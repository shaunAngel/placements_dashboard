import axios from "axios";

// ── Axios instance with JWT interceptor ──────────────
const API_BASE = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth API (uses /auth prefix, NOT /api) ───────────
const authApi = axios.create({
  baseURL: `${API_BASE}/auth`,
});

export const authAPI = {
  login: async (email, password, role) => {
    const res = await authApi.post("/login", { email, password, role });
    return res.data; // { access_token, token_type, user }
  },

  register: async (data) => {
    const res = await authApi.post("/register", data);
    return res.data;
  },

  getMe: async (token) => {
    const res = await authApi.get("/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // { email, role, name, rollNo }
  },

  seedDemoUsers: async () => {
    const res = await authApi.post("/seed");
    return res.data;
  },
};

// ── Data API ─────────────────────────────────────────

// 🔹 Stats
export const getOverview = async () => {
  const res = await api.get("/stats/overview");
  return res.data;
};

export const getCompanyStats = async () => {
  const res = await api.get("/stats/company-wise");
  return res.data;
};

// 🔹 Companies
export const getCompanies = async () => {
  const res = await api.get("/companies");
  return res.data;
};

// 🔹 Drives
export const getDrives = async () => {
  const res = await api.get("/drives");
  return res.data;
};

// 🔹 Students
export const getStudents = async () => {
  const res = await api.get("/students");
  return res.data;
};