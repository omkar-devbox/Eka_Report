import { useState } from "react";
import { Outlet, useLocation, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import { User, LogOut } from "lucide-react";
import { useAuthStore } from "@/shared/lib/store/authStore";
import { bindAuthStore } from "../api/api-client";

const BASE_URL =
  import.meta.env.DEV
    ? import.meta.env.VITE_API_URL || "http://localhost:8000"
    : "";

export const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  // Bind the store to the api-client so it can inject Bearer tokens and
  // call clearAuth on refresh failure, without circular imports.
  bindAuthStore({ accessToken, setAccessToken, clearAuth });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const displayName = user?.full_name ?? user?.username ?? "Unknown";
  const displayRole = user?.role ?? "viewer";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors — still log out locally
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col transition-colors duration-300">
      {/* Top Header */}
      <header className="h-16 bg-sidebar-bg/80 backdrop-blur-md border-b border-sidebar-border sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h1 className="text-md font-bold tracking-tight text-text-primary leading-none hidden sm:block">
              Eka Report Studio
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-neutral-surface/40"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/chassis-loss-report"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-neutral-surface/40"
                }`
              }
            >
              Chassis Loss
            </NavLink>
            <NavLink
              to="/trim-loss-report"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-neutral-surface/40"
                }`
              }
            >
              Trim Loss
            </NavLink>
            <NavLink
              to="/overview"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-neutral-surface/40"
                }`
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-neutral-surface/40"
                }`
              }
            >
              Analytics
            </NavLink>
            <NavLink
              to="/schedules"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-neutral-surface/40"
                }`
              }
            >
              Schedules
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-neutral-surface/40"
                }`
              }
            >
              Settings
            </NavLink>
            {displayRole === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-neutral-surface/40"
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-px bg-border" />

          {/* User + Logout */}
          <button
            id="logout-btn"
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 pl-2 cursor-pointer group hover:bg-error/5 p-1 rounded-lg transition-all disabled:opacity-60"
            title="Logout"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                {displayName}
              </p>
              <p className="text-xs text-text-secondary capitalize">{displayRole}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary group-hover:bg-error/10 group-hover:text-error group-hover:border-error/20 transition-all">
              {isLoggingOut ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <span className="text-xs font-bold group-hover:hidden">{initials}</span>
                  <LogOut size={16} className="hidden group-hover:block" />
                </>
              )}
            </div>
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main
        className="flex-grow p-4 md:p-8 overflow-x-hidden"
        style={{ scrollbarGutter: "stable" }}
      >
        <>
          <AnimatePresence mode="wait">
            <m.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Outlet />
            </m.div>
          </AnimatePresence>
        </>
      </main>
    </div>
  );
};
