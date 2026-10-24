import { create } from 'zustand';
import * as authApi from '@/api/auth';
import { saveTokens, getAccessToken, getRefreshToken, clearTokens } from '@/utils/secureStorage';
import type { UserProfile } from '@/types/api';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean; // true while bootstrapping on app start
  isAuthenticated: boolean;

  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; phone: string; password: string }) => Promise<{ userId: string }>;
  verifyOtp: (userId: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // Called once from the root layout on app start - checks if a stored
  // access token still resolves to a valid user (apiRequest will silently
  // refresh it if expired but the refresh token is still valid).
  bootstrap: async () => {
    const token = await getAccessToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const tokens = await authApi.login({ email, password });
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    const user = await authApi.getMe();
    set({ user, isAuthenticated: true });
  },

  register: async (input) => {
    return authApi.register(input);
  },

  verifyOtp: async (userId, otp) => {
    const tokens = await authApi.verifyOtp({ userId, otp });
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    const user = await authApi.getMe();
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      // Best-effort - don't block logout on this succeeding.
      authApi.logout(refreshToken).catch(() => {});
    }
    await clearTokens();
    set({ user: null, isAuthenticated: false });
  },
}));
