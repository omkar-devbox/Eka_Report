import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: number;
  created_at: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      /** Called after a successful login or token refresh. */
      setAuth: (user: User, accessToken: string) =>
        set({ user, accessToken, isAuthenticated: true }),

      /** Update only the access token (used after a silent refresh). */
      setAccessToken: (token: string) => set({ accessToken: token }),

      /** Called on logout or when refresh fails. Wipes all auth state. */
      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: "eka-auth",          // localStorage key
      partialize: (state) => ({  // only persist user info, not the token
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Access token is NOT persisted — it lives in memory only.
        // On page reload the app will silently refresh via the HttpOnly cookie.
      }),
    }
  )
);
