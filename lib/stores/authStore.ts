"use client";

import { create } from "zustand";
import type { User, UserRole } from "@/lib/api/types";
import { clearTokens, getCurrentUser, logout as apiLogout, upgradeCurrentUserToAgent } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Actions
  setUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  upgradeToAgent: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  canCreateListing: () => boolean;
  canModerate: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  loadUser: async () => {
    set({ isLoading: true });
    const res = await getCurrentUser();
    if (res.data) {
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  upgradeToAgent: async () => {
    const currentUser = get().user;
    if (!currentUser) throw new Error("User is not authenticated");

    const res = await upgradeCurrentUserToAgent();
    if (res.error || !res.data) {
      throw new Error(res.error?.message ?? "Failed to upgrade user to agent");
    }

    set({ user: res.data, isAuthenticated: true });
  },

  logout: async () => {
    await apiLogout();
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  },

  canCreateListing: () => {
    const user = get().user;
    if (!user) return false;
    return ["owner", "agent", "admin"].includes(user.role);
  },

  canModerate: () => {
    const user = get().user;
    if (!user) return false;
    return ["moderator", "admin"].includes(user.role);
  },

  isAdmin: () => get().user?.role === "admin",
}));
