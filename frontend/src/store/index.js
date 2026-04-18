import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { authAPI } from "../api";


// 🔐 AUTH STORE — real JWT authentication
export const useAuthStore = create(
  persist( // 2. Wrap your store definition
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async ({ email, password, role }) => {
        try {
          const data = await authAPI.login(email, password, role);

          // Note: You don't technically need manual localStorage.setItem 
          // anymore because 'persist' handles the whole object for you.
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
        const token = get().token; // Get token from the persisted state
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
      name: "auth-storage", // 3. Unique key name in localStorage
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
          // Replace with your actual backend URL
          const res = await axios.patch(`http://127.0.0.1:8000/api/students/${rollNo}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          // Update the local list of students with the returned data
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

          // Update local state instantly
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
      // 3. ADD THIS CONFIGURATION OBJECT
      name: "student-storage", // This is the key name in LocalStorage
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

          // ✅ NORMALIZE SECTOR HERE (MAIN FIX)
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
      // 2. Add the unique storage key name
      name: "company-storage",
    }
  )
);


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
  selectedUser: null, // Holds the user data when editing
  isModalOpen: false,

  setSelectedUser: (user) => set({ selectedUser: user, isModalOpen: true }),
  closeModal: () => set({ selectedUser: null, isModalOpen: false }),

  // Existing addUser logic...

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
  // Inside your useUserStore
  addUser: async (userData) => {
    try {
      // 1. Ensure the URL is correct (match your prefix in main.py)
      const res = await axios.post("http://127.0.0.1:8000/api/users/register", userData);

      // 2. ✅ res.data.user contains the object we just returned from Python
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
      // Calls the DELETE route in users.py
      await axios.delete(`http://127.0.0.1:8000/api/users/${email}`);

      // Update UI by filtering out the deleted user
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
      // Ensure this matches your FastAPI mount point (e.g., /api/users)
      const res = await axios.get("http://127.0.0.1:8000/api/users");

      // Zustand set function updates the 'users' array
      set({ users: res.data });
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  },
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