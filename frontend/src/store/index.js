import { create } from "zustand";
import axios from "axios";
import { authAPI } from "../api";


// 🔐 AUTH STORE — real JWT authentication
export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,  // true while checking saved session on app boot

  // ── Login via backend /auth/login ──────────────────
  login: async ({ email, password, role }) => {
    try {
      const data = await authAPI.login(email, password, role);
      // data = { access_token, token_type, user: { email, role, name, rollNo } }

      localStorage.setItem("access_token", data.access_token);

      set({
        user: data.user,
        token: data.access_token,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Login failed. Please try again.";
      return { success: false, error: detail };
    }
  },

  // ── Logout — clear token and state ─────────────────
  logout: () => {
    localStorage.removeItem("access_token");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // ── Restore session from saved token ───────────────
  restoreSession: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const user = await authAPI.getMe(token);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // Token invalid or expired
      localStorage.removeItem("access_token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));


// 👨‍🎓 STUDENT STORE
export const useStudentStore = create((set) => ({
  students: [],
  loading: false,

  fetchStudents: async () => {
    try {
      set({ loading: true });

      const res = await axios.get("http://127.0.0.1:8000/api/students");

      set({
        students: res.data,
        loading: false,
      });

    } catch (err) {
      console.error("Student fetch error:", err);
      set({ loading: false });
    }
  },
}));


// 🏢 COMPANY STORE
export const useCompanyStore = create((set) => ({
  companies: [],

  setCompanies: (data) => set({ companies: data }),

  fetchCompanies: async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/companies");
      const data = await res.json();

      // 🔥 NORMALIZE SECTOR HERE (MAIN FIX)
      const normalized = data.map((c) => {
        let sector = c.companySector?.toUpperCase() || "";
        
        if (sector.includes("IT PROD")) sector = "IT Prod";
        else if (sector.includes("IT")) sector = "IT";
        else if (sector.includes("CORE")) sector = "Core";
        else if (sector.includes("BFSI") || sector.includes("FINANCE")) sector = "Finance";
        else if (sector.includes("STARTUP")) sector = "Startup";
        else sector = "Other";

        return {
          ...c,
          companySector: sector,
        };
      });

      set({ companies: normalized });

    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  },
}));


// 💼 OFFER STORE
export const useOfferStore = create((set) => ({
  offers: [],
  setOffers: (data) => set({ offers: data }),
}));


// 📄 SUBMISSION STORE
export const useSubmissionStore = create((set) => ({
  submissions: [],
  setSubmissions: (data) => set({ submissions: data }),
}));


// 👥 USER STORE (ADMIN PANEL)
export const useUserStore = create((set) => ({
  users: [],
  setUsers: (data) => set({ users: data }),
}));


// 🔔 NOTIFICATION STORE
export const useNotificationStore = create((set, get) => ({
  notifications: [
    { id: 1, message: "New company added", read: false, time: "2m ago" },
    { id: 2, message: "Offer updated", read: false, time: "5m ago" },
  ],

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read: true,
      })),
    })),

  getUnreadCount: () =>
    get().notifications.filter((n) => !n.read).length,
}));