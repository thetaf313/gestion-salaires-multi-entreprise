import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyUsers from "./pages/CompanyUsers";
import CompanyEmployees from "./pages/CompanyEmployees";
import PayrollCycles from "./pages/PayrollCycles";
import Payslips from "./pages/Payslips";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import CompanySettings from "./pages/CompanySettings";
import Settings from "./pages/Settings";
import AdminLayout from "./components/AdminLayout";

// Import du script de test en développement
if (import.meta.env.DEV) {
  import("./utils/test-api.js");
}

function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes protégées avec layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    {/* Dashboard principal - redirige selon le rôle */}
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Gestion des entreprises - SUPER_ADMIN uniquement */}
                    <Route
                      path="/companies"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                          <Companies />
                        </ProtectedRoute>
                      }
                    />

                    {/* Dashboard d'une entreprise spécifique */}
                    <Route
                      path="/company/:companyId/dashboard"
                      element={
                        <ProtectedRoute
                          allowedRoles={["SUPER_ADMIN", "ADMIN", "CASHIER"]}
                        >
                          <CompanyDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Gestion des utilisateurs d'une entreprise */}
                    <Route
                      path="/company/:companyId/users"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <CompanyUsers />
                        </ProtectedRoute>
                      }
                    />

                    {/* Gestion des employés d'une entreprise */}
                    <Route
                      path="/company/:companyId/employees"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <CompanyEmployees />
                        </ProtectedRoute>
                      }
                    />

                    {/* Pages spécifiques aux ADMIN */}
                    {/* Cycles de paie */}
                    <Route
                      path="/company/:companyId/payroll-cycles"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <PayrollCycles />
                        </ProtectedRoute>
                      }
                    />

                    {/* Bulletins de paie */}
                    <Route
                      path="/company/:companyId/payslips"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <Payslips />
                        </ProtectedRoute>
                      }
                    />

                    {/* Paiements */}
                    <Route
                      path="/company/:companyId/payments"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <Payments />
                        </ProtectedRoute>
                      }
                    />

                    {/* Rapports */}
                    <Route
                      path="/company/:companyId/reports"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <Reports />
                        </ProtectedRoute>
                      }
                    />

                    {/* Paramètres de l'entreprise */}
                    <Route
                      path="/company/:companyId/company-settings"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <CompanySettings />
                        </ProtectedRoute>
                      }
                    />

                    {/* Paramètres */}
                    <Route path="/settings" element={<Settings />} />

                    {/* Redirection par défaut */}
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
