import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Loading } from "../../shared/ui/loading";

// Lazy load feature pages
const Dashboard = lazy(() => import("@/features/pages/Dashboard"));
const Overview = lazy(() => import("@/features/pages/Overview"));
const AnalyticsPage = lazy(() => import("@/features/pages/Analytics"));
const SchedulesPage = lazy(() => import("@/features/pages/Schedules"));
const SettingsPage = lazy(() => import("@/features/pages/Settings"));

export const AppRouter = () => {
  return (
    <Suspense
      fallback={
        <Loading variant="spinner" text="Preparing your dashboard..." />
      }
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
};
