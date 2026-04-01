import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/shared/AppLayout";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import RoleGuard from "../components/shared/RoleGuard";

// Auth
import Login from "../pages/auth/Login";

// Director
import DirectorDashboard from "../pages/director/DirectorDashboard";
import Supervisors from "../pages/director/Supervisors";
import Assign from "../pages/director/Assign";
import Sessions from "../pages/director/Sessions";

// Corper
import CorperDashboard from "../pages/corper/CorperDashboard";
import Students from "../pages/corper/Students";
import Orientation from "../pages/corper/Orientation";
import Reports from "../pages/corper/Reports";

// Supervisor
import SupervisorDashboard from "../pages/supervisor/SupervisorDashboard";
import MyStudents from "../pages/supervisor/MyStudents";
import ScoreEntry from "../pages/supervisor/ScoreEntry";

// Role-based redirect from /dashboard
import DashboardRedirect from "./DashboardRedirect";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    // All authenticated routes
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardRedirect />,
      },
      {
        element: <AppLayout />,
        children: [
          // ── Director ──────────────────────────────────────────────────
          {
            element: <RoleGuard allowed={["director"]} />,
            children: [
              { path: "/director/dashboard", element: <DirectorDashboard /> },
              { path: "/director/supervisors", element: <Supervisors /> },
              { path: "/director/students", element: <Students /> },
              { path: "/director/assign", element: <Assign /> },
              { path: "/director/sessions", element: <Sessions /> },
            ],
          },
          // ── Corper ────────────────────────────────────────────────────
          {
            element: <RoleGuard allowed={["corper"]} />,
            children: [
              { path: "/corper/dashboard", element: <CorperDashboard /> },
              { path: "/corper/students", element: <Students /> },
              { path: "/corper/orientation", element: <Orientation /> },
              { path: "/corper/reports", element: <Reports /> },
            ],
          },
          // ── Supervisor ───────────────────────────────────────────────
          {
            element: <RoleGuard allowed={["supervisor"]} />,
            children: [
              {
                path: "/supervisor/dashboard",
                element: <SupervisorDashboard />,
              },
              { path: "/supervisor/students", element: <MyStudents /> },
              {
                path: "/supervisor/students/:id/score",
                element: <ScoreEntry />,
              },
            ],
          },
        ],
      },
    ],
  },
  // Catch-all
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
