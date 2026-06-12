import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Loading } from "../../shared/ui/loading";
import { ProtectedRoute, PublicRoute } from "./AuthRoutes";
import { useAuthStore } from "@/shared/lib/store/authStore";

// Lazy load feature pages
const Dashboard = lazy(() => import("@/features/pages/Dashboard"));
const Overview = lazy(() => import("@/features/pages/Overview"));
const AnalyticsPage = lazy(() => import("@/features/pages/Analytics"));
const SchedulesPage = lazy(() => import("@/features/pages/Schedules"));
const SettingsPage = lazy(() => import("@/features/pages/Settings"));
const LoginPage = lazy(() => import("@/features/pages/Login"));
const UsersPage = lazy(() => import("@/features/pages/Users"));

export const AppRouter = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <Suspense
      fallback={
        <Loading variant="spinner" text="Preparing your dashboard..." />
      }
    >
      <Routes>
        {/* Public routes — redirect to "/" if already authenticated */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes — redirect to "/login" if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {user?.role === "admin" && (
              <Route path="/users" element={<UsersPage />} />
            )}
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Suspense>
  );
};

