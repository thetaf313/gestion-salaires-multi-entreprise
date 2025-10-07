import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import CompanyEmployeesWithPagination from "./pages/CompanyEmployeesWithPagination";
import PayrollCyclesWithPagination from "./pages/PayrollCyclesWithPagination";
import AttendanceWithPagination from "./pages/AttendanceWithPagination";
import PayslipsWithPagination from "./pages/PayslipsWithPagination";

function PaginationTestApp() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <Routes>
            {/* Test des pages avec pagination */}
            <Route
              path="/test/employees/:companyId"
              element={<CompanyEmployeesWithPagination />}
            />
            <Route
              path="/test/payroll/:companyId"
              element={<PayrollCyclesWithPagination />}
            />
            <Route
              path="/test/attendance/:companyId"
              element={<AttendanceWithPagination />}
            />
            <Route
              path="/test/payslips/:companyId"
              element={<PayslipsWithPagination />}
            />
            <Route
              path="/test/payslips/:companyId/:payrunId"
              element={<PayslipsWithPagination />}
            />

            {/* Page d'index pour tester */}
            <Route
              path="/"
              element={
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">
                      Test des Pages avec Pagination
                    </h1>
                    <p className="text-muted-foreground mb-8">
                      Testez les différentes pages avec le nouveau système de
                      pagination
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-lg">
                      <h2 className="text-xl font-semibold mb-4">
                        Pages avec Pagination
                      </h2>
                      <div className="space-y-3">
                        <a
                          href="/test/employees/1"
                          className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <h3 className="font-medium">
                            Employés avec Pagination
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Gestion des employés avec filtres et pagination
                          </p>
                        </a>

                        <a
                          href="/test/payroll/1"
                          className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <h3 className="font-medium">
                            Cycles de Paie avec Pagination
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Gestion des cycles de paie avec filtres
                          </p>
                        </a>

                        <a
                          href="/test/attendance/1"
                          className="block p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                        >
                          <h3 className="font-medium">
                            Pointages avec Pagination
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Gestion des pointages avec filtres par date
                          </p>
                        </a>

                        <a
                          href="/test/payslips/1"
                          className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <h3 className="font-medium">
                            Bulletins avec Pagination
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Gestion des bulletins de paie avec filtres
                          </p>
                        </a>
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg">
                      <h2 className="text-xl font-semibold mb-4">
                        Fonctionnalités
                      </h2>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Pagination avec navigation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Filtres par statut, date, etc.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Recherche en temps réel</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Persistance des filtres dans l'URL</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Interface responsive mobile</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Choix du nombre d'éléments par page</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Badges d'état interactifs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Statistiques en temps réel</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-3">
                      Instructions de Test
                    </h2>
                    <div className="text-sm space-y-2">
                      <p>
                        1. Cliquez sur une des pages ci-dessus pour tester la
                        pagination
                      </p>
                      <p>2. Utilisez les filtres de recherche et de statut</p>
                      <p>
                        3. Naviguez entre les pages avec les contrôles de
                        pagination
                      </p>
                      <p>4. Changez le nombre d'éléments par page</p>
                      <p>5. Testez sur mobile pour voir la responsiveness</p>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default PaginationTestApp;
