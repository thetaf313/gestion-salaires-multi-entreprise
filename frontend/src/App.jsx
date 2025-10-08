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

import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDashboard from "./pages/CompanyDashboard";
// import CompanyUsers from "./pages/CompanyUsers"; // Ancienne version sans pagination
import CompanyUsersWithPagination from "./pages/CompanyUsersWithPagination"; // Nouvelle version avec pagination
// import CompanyEmployees from "./pages/CompanyEmployees"; // Ancienne version sans pagination
import CompanyEmployeesWithPagination from "./pages/CompanyEmployeesWithPagination"; // Nouvelle version avec pagination
import EmployeeDetails from "./pages/EmployeeDetails";
// import PayrollCycles from "./pages/PayrollCycles"; // Ancienne version sans pagination
import PayrollCyclesWithPagination from "./pages/PayrollCyclesWithPagination"; // Nouvelle version avec pagination
// import Payslips from "./pages/Payslips"; // Ancienne version sans pagination
import PayslipsWithPagination from "./pages/PayslipsWithPagination"; // Nouvelle version avec pagination
import PayslipDetailsPage from "./pages/PayslipDetailsPage";
import CreatePaymentPage from "./pages/CreatePaymentPage";
import PaymentPageFixed from "./pages/PaymentPageFixed";
import SmartClockInPage from "./pages/SmartClockInPage";
import Reports from "./pages/Reports";
import CompanySettings from "./pages/CompanySettings";
import Settings from "./pages/Settings";
// import AttendancePage from "./pages/AttendancePage"; // Ancienne version sans pagination
import AttendanceWithPagination from "./pages/AttendanceWithPagination"; // Nouvelle version avec pagination
import WorkSchedulePage from "./pages/WorkSchedulePage";
import AttendanceStatsPage from "./pages/AttendanceStatsPage";
import EmployeeQRCodesPage from "./pages/EmployeeQRCodesPage";
import CreateEmployeePage from "./pages/CreateEmployeePage";
import AdminLayout from "./components/AdminLayout";
import WelcomePage from "./pages/WelcomePage";

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
          {/* Route d'accueil - sera la première page affichée */}
          <Route path="/" element={<WelcomePage />} />

          {/* Route de connexion */}
          <Route path="/login" element={<LoginPage />} />

          {/* Routes protégées */}
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
                          <CompanyUsersWithPagination />
                        </ProtectedRoute>
                      }
                    />

                    {/* Gestion des employés d'une entreprise */}
                    <Route
                      path="/company/:companyId/employees"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <CompanyEmployeesWithPagination />
                        </ProtectedRoute>
                      }
                    />

                    {/* Détails d'un employé */}
                    <Route
                      path="/company/:companyId/employees/:employeeId"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <EmployeeDetails />
                        </ProtectedRoute>
                      }
                    />

                    {/* Création d'employé */}
                    <Route
                      path="/company/:companyId/employees/create"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <CreateEmployeePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Pages spécifiques aux ADMIN */}
                    {/* Cycles de paie */}
                    <Route
                      path="/company/:companyId/payroll-cycles"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <PayrollCyclesWithPagination />
                        </ProtectedRoute>
                      }
                    />

                    {/* Bulletins de paie */}
                    <Route
                      path="/company/:companyId/payslips"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <PayslipsWithPagination />
                        </ProtectedRoute>
                      }
                    />

                    {/* Bulletins de paie d'un cycle spécifique */}
                    <Route
                      path="/company/:companyId/payroll/:payrunId/payslips"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <PayslipsWithPagination />
                        </ProtectedRoute>
                      }
                    />

                    {/* Détails d'un bulletin de paie */}
                    <Route
                      path="/company/:companyId/payslips/:payslipId"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <PayslipDetailsPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Créer un paiement pour un bulletin */}
                    <Route
                      path="/company/:companyId/payslips/:payslipId/payment"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <CreatePaymentPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Paiements */}
                    <Route
                      path="/company/:companyId/payments"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <PaymentPageFixed />
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

                    {/* Pointage des employés */}
                    <Route
                      path="/company/:companyId/attendance"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <AttendanceWithPagination />
                        </ProtectedRoute>
                      }
                    />

                    {/* Pointage intelligent */}
                    <Route
                      path="/company/:companyId/smart-clock"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "CASHIER", "USER"]}>
                          <SmartClockInPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Configuration des horaires de travail */}
                    <Route
                      path="/company/:companyId/work-schedule"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <WorkSchedulePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Statistiques de pointage */}
                    <Route
                      path="/company/:companyId/attendance-stats"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <AttendanceStatsPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* QR Codes des employés */}
                    <Route
                      path="/company/:companyId/employee-qr-codes"
                      element={
                        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                          <EmployeeQRCodesPage />
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
