import { create } from "zustand";
import { api } from "@/lib/api";

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role_id: number;
  profile_image?: string;
  preferred_category: string;
  status: string;
  email_verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { full_name: string; email: string; phone?: string; password: string; role_id: number }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) localStorage.setItem("user", JSON.stringify(user));
      else localStorage.removeItem("user");
    }
    set({ user });
  },

  setToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    }
    set({ token });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", { email, password });
      const { access_token } = res.data;
      localStorage.setItem("token", access_token);
      set({ token: access_token });

      // Fetch user profile
      const userRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const user = userRes.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      await api.post("/auth/sign-up", data);
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  loadUser: async () => {
    try {
      const res = await api.get("/auth/me");
      const user = res.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
    } catch {
      set({ user: null, token: null });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
}));


// Hook to hydrate auth state from localStorage on client mount
import { useEffect } from "react";

export function useAuthHydration() {
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token) setToken(token);
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        // ignore
      }
    }
  }, [setUser, setToken]);
}
