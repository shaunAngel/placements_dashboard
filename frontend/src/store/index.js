import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { authAPI } from "../api";


// 🔐 AUTH STORE — real JWT authentication
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async ({ email, password, role }) => {
        try {
          const data = await authAPI.login(email, password, role);

          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
          });

          return { success: true };
        } catch (err) {
          const detail = err.response?.data?.detail || "Login failed.";
          return { success: false, error: detail };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      restoreSession: async () => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const user = await authAPI.getMe(token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);


// 👨‍🎓 STUDENT STORE
export const useStudentStore = create(
  persist(
    (set, get) => ({
      students: [],
      loading: false,
      updateStudent: async (rollNo, formData) => {
        try {
          const res = await axios.patch(`http://127.0.0.1:8000/api/students/${rollNo}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          const updatedStudents = get().students.map((s) =>
            s.rollNo === rollNo ? res.data : s
          );

          set({ students: updatedStudents });
          return { success: true };
        } catch (err) {
          console.error("Update failed:", err);
          return { success: false, error: err.message };
        }
      },
      clearPfp: async (rollNo) => {
        try {
          const res = await axios.delete(`http://127.0.0.1:8000/api/students/${rollNo}/clear-pfp`);

          const updatedStudents = get().students.map((s) =>
            s.rollNo === rollNo ? res.data : s
          );
          set({ students: updatedStudents });

          return { success: true };
        } catch (err) {
          console.error("Clear PFP failed:", err);
          return { success: false };
        }
      },
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
    }),
    {
      name: "student-storage",
    }
  )
);


// 🏢 COMPANY STORE
export const useCompanyStore = create(
  persist(
    (set) => ({
      companies: [],

      setCompanies: (data) => set({ companies: data }),

      fetchCompanies: async () => {
        try {
          const res = await fetch("http://127.0.0.1:8000/api/companies");
          const data = await res.json();

          // ✅ NORMALIZE SECTOR HERE
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
    }),
    {
      name: "company-storage",
    }
  )
);


// 💼 OFFER STORE
export const useOfferStore = create((set) => ({
  offers: [],
  setOffers: (data) => set({ offers: data }),
}));


// ⚙️ SETTINGS STORE
export const useSettingStore = create(
  persist(
    (set) => ({
      branches: [],
      batches: [],
      fetchSettings: async () => {
        try {
          const [branchRes, batchRes] = await Promise.all([
            axios.get("http://127.0.0.1:8000/api/settings/branches"),
            axios.get("http://127.0.0.1:8000/api/settings/batches")
          ]);
          set({ 
            branches: branchRes.data.map(b => b.name), 
            batches: batchRes.data.map(b => b.name) 
          });
        } catch (err) {
          console.error("Failed to fetch settings", err);
        }
      }
    }),
    { name: "settings-storage" }
  )
);

// 📄 SUBMISSION STORE
export const useSubmissionStore = create((set, get) => ({
  submissions: [],
  setSubmissions: (data) => set({ submissions: data }),
  fetchSubmissions: async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/offer");
      // Map it to what Profile expects, or just store directly
      const formatted = res.data.map(o => ({
        id: o._id || o.rollNo + o.company,
        rollNo: o.rollNo,
        company: o.company,
        status: o.status,
        offerType: o.offerType || "Full-Time",
        package: o.package,
        submissionDate: o.createdAt,
        file: o.file
      }));
      set({ submissions: formatted });
    } catch(err) {
      console.error(err);
    }
  }
}));


// 👥 USER STORE (ADMIN PANEL)
export const useUserStore = create((set) => ({
  users: [],
  setUsers: (data) => set({ users: data }),
  selectedUser: null,
  isModalOpen: false,

  setSelectedUser: (user) => set({ selectedUser: user, isModalOpen: true }),
  closeModal: () => set({ selectedUser: null, isModalOpen: false }),

  updateUser: async (email, updatedData) => {
    try {
      const res = await axios.patch(`http://127.0.0.1:8000/api/users/${email}`, updatedData);
      
      set((state) => ({
        users: state.users.map((u) => (u.email === email ? { ...u, ...updatedData } : u)),
        isModalOpen: false,
        selectedUser: null
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: "Failed to update user" };
    }
  },

  addUser: async (userData) => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/users/register", userData);

      set((state) => ({
        users: [...state.users, res.data.user]
      }));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || "Failed to add user" };
    }
  },
  deleteUser: async (email) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${email}`);

      set((state) => ({
        users: state.users.filter((user) => user.email !== email)
      }));
      return { success: true };
    } catch (err) {
      console.error("Delete failed:", err);
      return { success: false, error: "Failed to delete user" };
    }
  },

  fetchUsers: async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/users");
      set({ users: res.data });
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  },
}));


// 🔔 NOTIFICATION STORE — fetches from backend, only valid events
export const useNotificationStore = create((set, get) => ({
  notifications: [],

  fetchNotifications: async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/notifications/");
      const notifs = res.data.map((n) => ({
        id: n._id,
        message: n.message,
        read: n.read || false,
        time: n.time || "",
        type: n.type,
      }));
      set({ notifications: notifs });
    } catch (err) {
      // If backend has no notifications, start empty
      console.error("Notification fetch error:", err);
      set({ notifications: [] });
    }
  },

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read: true,
      })),
    }));
    // Also mark on backend
    axios.put("http://127.0.0.1:8000/api/notifications/read/all").catch(() => {});
  },

  getUnreadCount: () =>
    get().notifications.filter((n) => !n.read).length,
}));