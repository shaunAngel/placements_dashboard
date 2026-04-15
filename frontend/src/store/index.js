import { create } from "zustand";


// 🔐 AUTH STORE
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: (data) => {
    let user = {
      email: data.email,
      role: data.role,
    };
  
    // ✅ Map demo email to real DB student
    if (
      data.email === "student@vnrjiet.ac.in" ||
      data.email === "sudigayathri2@gmail.com"
    ) {
      user.rollNo = "22071A3243";
      user.name = "S GAYATHRI";
    }
  
    set({
      user,
      isAuthenticated: true,
    });
  
    return { success: true };
  },

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));


// 👨‍🎓 STUDENT STORE
//import { create } from "zustand";
import axios from "axios";

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
      set({ companies: data });
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