import { Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RequireAdmin } from "./auth/RequireAdmin";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegistrationsPage } from "./pages/RegistrationsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/registrations"
          element={
            <RequireAdmin>
              <RegistrationsPage />
            </RequireAdmin>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}