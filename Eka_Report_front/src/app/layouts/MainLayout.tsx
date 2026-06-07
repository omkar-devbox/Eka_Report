import { useState, lazy, Suspense } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import {
  Search,
  User,
  Sparkles,
  LogOut,
} from "lucide-react";

export const MainLayout = () => {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const location = useLocation();
  const currentUser = {
    name: "Omkar S.",
    email: "omkar@eka.com",
    roles: ["Admin"],
  };

  const logout = () => {
    console.log("Logout triggered");
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
          </nav>
        </div>

        <div className="flex items-center gap-3">


          <div className="h-8 w-px bg-border" />
          <div
            onClick={logout}
            className="flex items-center gap-3 pl-2 cursor-pointer group hover:bg-error/5 p-1 rounded-lg transition-all"
            title="Logout"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                {currentUser.name}
              </p>
              <p className="text-xs text-text-secondary">
                {currentUser.roles.join(", ")}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary group-hover:bg-error/10 group-hover:text-error group-hover:border-error/20 transition-all">
              <User size={18} className="group-hover:hidden" />
              <LogOut size={18} className="hidden group-hover:block" />
            </div>
          </div>
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
