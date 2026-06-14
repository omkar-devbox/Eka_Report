import { type ReactNode, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { ToastContainer } from "@/shared/ui/toast";
<<<<<<< Updated upstream
import { ThemeProvider } from "@/shared/lib/theme/ThemeContext";
import { useAuthStore } from "@/shared/lib/store/authStore";
import { bindAuthStore } from "../api/api-client";

const BASE_URL =
  import.meta.env.DEV
    ? import.meta.env.VITE_API_URL || "http://localhost:8000"
    : "";

/**
 * On app startup, if the user was previously authenticated (Zustand persisted
 * isAuthenticated=true) but the in-memory access token is missing (page reload),
 * try a silent refresh via the HttpOnly cookie.
 * If it fails the user lands on /login.
 */
function SilentRefreshOnMount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  // Bind the store on mount so the api-client can use it immediately
  bindAuthStore({ accessToken, setAccessToken, clearAuth });

  useEffect(() => {
    // Only attempt if user appears authenticated but token is missing in memory
    if (isAuthenticated && !accessToken) {
      fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.access_token && data?.user) {
            setAuth(data.user, data.access_token);
          } else {
            clearAuth();
          }
        })
        .catch(() => clearAuth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
=======
// import { ThemeProvider } from "@/shared/lib/theme/ThemeContext";
>>>>>>> Stashed changes

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <BrowserRouter>
<<<<<<< Updated upstream
      <ThemeProvider>
        <LazyMotion features={domAnimation}>
          <SilentRefreshOnMount />
          {children}
          <ToastContainer />
        </LazyMotion>
      </ThemeProvider>
=======
      {/* <ThemeProvider> */}
      <LazyMotion features={domAnimation}>
        {children}
        <ToastContainer />
      </LazyMotion>
      {/* </ThemeProvider> */}
>>>>>>> Stashed changes
    </BrowserRouter>
  );
};
