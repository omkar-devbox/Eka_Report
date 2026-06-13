import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Loading } from "../../shared/ui/loading";
import { ProtectedRoute, PublicRoute, AdminRoute } from "./AuthRoutes";

// Lazy load feature pages
const Dashboard = lazy(() => import("@/features/pages/Dashboard"));
const SchedulesPage = lazy(() => import("@/features/pages/Schedules"));
const SettingsPage = lazy(() => import("@/features/pages/Settings"));
const ChassisLossReportPage = lazy(() => import("@/features/pages/ChassisLossReport"));
const TrimLossReportPage = lazy(() => import("@/features/pages/TrimLossReport"));
const LoginPage = lazy(() => import("@/features/pages/Login"));
const RegisterPage = lazy(() => import("@/features/pages/Register"));
const AdminPage = lazy(() => import("@/features/pages/Admin"));

export const AppRouter = () => {
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
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes — redirect to "/login" if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/chassis-loss-report" element={<ChassisLossReportPage />} />
            <Route path="/trim-loss-report" element={<TrimLossReportPage />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Suspense>
  );
};
