import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  SalaryChart,
  EmployeeChart,
  ContractTypeChart,
  PayrollChart,
  RealTimeChart,
} from "../components/charts";
import {
  PieChart as RePieChart,
  Pie as RePie,
  Cell as ReCell,
  ResponsiveContainer as ReResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";
import {
  Building2,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rawStats, setRawStats] = useState(null);

  // Chart data
  const [payrollChartData, setPayrollChartData] = useState(null);
  const [employeeChartData, setEmployeeChartData] = useState(null);
  const [contractChartData, setContractChartData] = useState(null);

  useEffect(() => {
    // Si l'utilisateur est ADMIN ou CASHIER, rediriger vers le dashboard de son entreprise
    if (user?.role === "ADMIN" || user?.role === "CASHIER") {
      if (user?.companyId) {
        navigate(`/company/${user.companyId}/dashboard`, { replace: true });
        return;
      }
    }

    const loadStats = async () => {
      setLoading(true);
      try {
        let res;
        if (user?.role === "SUPER_ADMIN") {
          res = await api.get('/stats/super-admin');
        } else if (user?.role === "ADMIN") {
          res = await api.get(`/stats/admin/${user.companyId}`);
        } else if (user?.role === "CASHIER") {
          res = await api.get(`/stats/cashier/${user.companyId}`);
        } else {
          res = await api.get('/stats/dashboard');
        }
        // API responses are wrapped: { success, message, data }
        const payload = res?.data || res;
        const wrapper = payload?.data || payload;

        // The backend often returns { stats, kpiSummary, timestamp } inside data
        const statsPayload = wrapper?.stats || wrapper;
        const kpiSummary = wrapper?.kpiSummary || wrapper?.kpi || null;

        // Helper to read KPI values from either stats or kpiSummary
        const findKpi = (labelMatch) => {
          if (kpiSummary && Array.isArray(kpiSummary)) {
            const found = kpiSummary.find((k) =>
              String(k.label).toLowerCase().includes(labelMatch.toLowerCase())
            );
            return found ? found.value : undefined;
          }
          return undefined;
        };

        const totalCompanies =
          statsPayload?.totalCompanies ?? statsPayload?.activeCompanies ?? findKpi('entreprise') ?? 0;

        const totalEmployees =
          statsPayload?.totalEmployees ?? statsPayload?.total_employees ?? statsPayload?.employees?.total ?? findKpi('employ') ?? 0;

        const totalPayslips =
          statsPayload?.totalPayslips ?? statsPayload?.total_payslips ?? statsPayload?.totalPayslipsCount ?? 0;

        const monthlyPayroll =
          statsPayload?.monthlyPayroll ?? statsPayload?.totalPayrollAmount ?? statsPayload?.payroll?.currentMonthBudget ?? findKpi('masse') ?? 0;

        setStats({
          totalCompanies,
          totalEmployees,
          totalPayslips,
          monthlyPayroll,
        });
        // keep raw payload for fallbacks and richer visualizations
        setRawStats(statsPayload);

        // Prepare chart data (tolerant to different shapes)
        const payrollHistory = wrapper?.payrollHistory || statsPayload?.payrollHistory || statsPayload?.payroll?.history || null;
        if (payrollHistory) setPayrollChartData(payrollHistory);

        const employeesByCompany = wrapper?.employeesByCompany || statsPayload?.employeesByCompany || statsPayload?.topCompanies || null;
        if (employeesByCompany) {
          // normalize topCompanies -> { name, value }
          if (Array.isArray(employeesByCompany) && employeesByCompany.length > 0 && employeesByCompany[0].employeeCount !== undefined) {
            setEmployeeChartData(
              employeesByCompany.map((c) => ({ name: c.name, value: c.employeeCount }))
            );
          } else {
            setEmployeeChartData(employeesByCompany);
          }
        }

        // If employeeChartData is not provided, try to fetch employee stats (departmentDistribution)
        if (!employeesByCompany) {
          try {
            const params = {};
            if (user?.role === 'ADMIN' && user?.companyId) params.companyId = user.companyId;
            // For SUPER_ADMIN leave params empty to get global distribution
            const empRes = await api.get('/statistics/employees', { params });
            const empPayload = empRes?.data || empRes;
            const empData = empPayload?.data || empPayload;
            if (empData?.departmentDistribution) {
              // normalize to chart format
              const deptData = empData.departmentDistribution.map((d) => ({ department: d.department, count: d.count }));
              setEmployeeChartData(deptData.map(d => ({ departement: d.department, actifs: d.count, inactifs: 0 })));
            }
          } catch (e) {
            // ignore, will fallback to other sources
            console.debug('No departmentDistribution available:', e);
          }
        }

        // Contract types: look for several possible keys
        const contractArr =
          statsPayload?.employees?.byContractType ||
          statsPayload?.employeesByContractType ||
          statsPayload?.contractTypes ||
          statsPayload?.contractTypeStats ||
          statsPayload?.contractTypeDistribution ||
          wrapper?.contractTypeStats ||
          [];

        if (Array.isArray(contractArr) && contractArr.length > 0) {
          const mapping = {
            DAILY: { name: 'Journalier', color: '#10b981' },
            FIXED: { name: 'Fixe', color: '#3b82f6' },
            HONORARIUM: { name: 'Honoraires', color: '#f59e0b' },
            Journalier: { name: 'Journalier', color: '#10b981' },
            Fixe: { name: 'Fixe', color: '#3b82f6' },
            Honoraire: { name: 'Honoraires', color: '#f59e0b' },
          };

          const ctData = contractArr.map((ct, idx) => {
            // ct may be { type, count } or { label, value } or { name, value }
            const type = ct.type || ct.label || ct.name || ct[0];
            const value = ct.count ?? ct.value ?? ct[1] ?? 0;
            const key = String(type || '').toUpperCase();
            // Try mapping by enum keys or by provided label
            return {
              name: mapping[key]?.name || ct.label || ct.name || type || key,
              value,
              color: mapping[key]?.color || mapping[type]?.color || '#8884d8',
            };
          });

          setContractChartData(ctData);
        }
      } catch (err) {
        console.error('Erreur chargement stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user, navigate]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Bonsoir";
    if (hour < 12) greeting = "Bonjour";
    else if (hour < 18) greeting = "Bon après-midi";

    return `${greeting}, ${user?.firstName} !`;
  };

  // Normalize employee chart data for the EmployeeChart component
  const employeeChartForRender = (() => {
    // If we already have department-style data (used by admin/company views), return it
    if (user?.role !== 'SUPER_ADMIN') return employeeChartData;

    // SUPER_ADMIN view: try multiple fallbacks to build { departement, actifs, inactifs }
    // 1) employeeChartData (already set from API) -> map name/value
    if (Array.isArray(employeeChartData) && employeeChartData.length > 0) {
      return employeeChartData.map((c) => ({
        departement: c.name || c.label || c.companyName || 'Entreprise',
        actifs: c.value ?? c.employeeCount ?? c.employees ?? 0,
        inactifs: 0,
      }));
    }

    // 2) rawStats.topCompanies (backend provides topCompanies with employeeCount)
    if (rawStats?.topCompanies && Array.isArray(rawStats.topCompanies)) {
      return rawStats.topCompanies.map((c) => ({
        departement: c.name || 'Entreprise',
        actifs: c.employeeCount ?? c.employees ?? 0,
        inactifs: 0,
      }));
    }

    // 3) If topCompanies missing, but we have per-company payrolls, show payroll as proxy
    if (rawStats?.topCompanies && Array.isArray(rawStats.topCompanies) === false && Array.isArray(rawStats?.topCompanies)) {
      // handled above; otherwise continue
    }

    if (rawStats?.topCompanies === undefined && Array.isArray(rawStats?.recentActivity) && rawStats.recentActivity.length > 0) {
      // recentActivity is not ideal, but we can show counts per activity type as fallback
      return rawStats.recentActivity.map((r, i) => ({
        departement: r.name || `Activité ${i + 1}`,
        actifs: r.count ?? 0,
        inactifs: 0,
      }));
    }

    // 4) contract type distribution as a last resort (maps contract types to bars)
    const contractArr = rawStats?.contractTypeStats || rawStats?.employeesByContractType || rawStats?.employees?.byContractType;
    if (Array.isArray(contractArr) && contractArr.length > 0) {
      return contractArr.map((ct) => ({
        departement: ct.label || ct.type || ct.name || 'Type',
        actifs: ct.count ?? ct.value ?? 0,
        inactifs: 0,
      }));
    }

    // 5) Final fallback: empty dataset to let the chart render default sample
    return null;
  })();

  const getRoleDisplay = (role) => {
    const roleConfig = {
      SUPER_ADMIN: { label: "Super Administrateur", color: "destructive" },
      ADMIN: { label: "Administrateur", color: "default" },
      CASHIER: { label: "Caissier", color: "secondary" },
    };
    return roleConfig[role] || { label: role, color: "default" };
  };

  const roleInfo = getRoleDisplay(user?.role);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getWelcomeMessage()}
          </h1>
          <p className="text-gray-600 mt-1">
            Voici un aperçu de votre plateforme de gestion des salaires
          </p>
        </div>
        <Badge variant={roleInfo.color} className="mt-2 sm:mt-0">
          {roleInfo.label}
        </Badge>
      </div>

      {/* Statistiques principales - Affichage conditionnel selon le rôle */}
      {user?.role === "SUPER_ADMIN" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Entreprises
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalCompanies || 0}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+2.5%</span>
              <span className="text-gray-500 ml-1">ce mois</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Employés
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalEmployees || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+5.2%</span>
              <span className="text-gray-500 ml-1">ce mois</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Masse Salariale
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === 'SUPER_ADMIN' ? (
                    new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                      maximumFractionDigits: 0,
                    }).format(stats?.monthlyPayroll || 0)
                  ) : (
                    new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(stats?.monthlyPayroll || 0)
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+3.1%</span>
              <span className="text-gray-500 ml-1">ce mois</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Fiches de Paie
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalPayslips || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.7%</span>
              <span className="text-gray-500 ml-1">ce mois</span>
            </div>
          </Card>
        </div>
      )}

      {/* Vue simplifiée pour les autres rôles */}
      {user?.role !== "SUPER_ADMIN" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Employés Actifs
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === "ADMIN" ? "35" : "12"}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Fiches ce Mois
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === "ADMIN" ? "35" : "12"}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {user?.role === "SUPER_ADMIN" ? (
          <>
            <PayrollChart
              title="Évolution globale de la masse salariale"
              data={payrollChartData}
            />
            {employeeChartForRender && employeeChartForRender.length > 0 ? (
              <EmployeeChart title="Employés par entreprise" data={employeeChartForRender} />
            ) : (
              // Fallback pie chart: try employeeChartData, rawStats.topCompanies, contract types, or show sample
              (() => {
                const pieSource =
                  (Array.isArray(employeeChartData) && employeeChartData.length > 0 && employeeChartData.map((c) => ({ name: c.name || c.label || c.companyName || c.name, value: c.value ?? c.employeeCount ?? 0 }))) ||
                  (rawStats?.topCompanies && rawStats.topCompanies.map((c) => ({ name: c.name, value: c.employeeCount ?? 0 }))) ||
                  (rawStats?.contractTypeStats && rawStats.contractTypeStats.map((c) => ({ name: c.label || c.type, value: c.count ?? c.value ?? 0 }))) ||
                  null;

                if (pieSource && pieSource.length > 0) {
                  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a28fd0"];
                  return (
                    <div className="bg-white rounded-lg shadow p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Employés par entreprise</h3>
                      <div style={{ width: "100%", height: 300 }}>
                        <ReResponsiveContainer>
                          <RePieChart>
                            <RePie data={pieSource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {pieSource.map((entry, index) => (
                                <ReCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </RePie>
                            <ReTooltip />
                          </RePieChart>
                        </ReResponsiveContainer>
                      </div>
                    </div>
                  );
                }

                // final fallback: render EmployeeChart with default sample (it will show its defaultData)
                return <EmployeeChart title="Employés par entreprise" />;
              })()
            )}
          </>
        ) : (
          <>
            <SalaryChart title="Évolution des salaires de l'entreprise" data={payrollChartData} />
            <ContractTypeChart title="Répartition des types de contrats" data={contractChartData} />
          </>
        )}
      </div>

      {user?.role !== "SUPER_ADMIN" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmployeeChart title="Employés par département" />
          <PayrollChart title="Masse salariale mensuelle" />
        </div>
      )}

      {/* Graphique temps réel */}
      <RealTimeChart title="Activité système en temps réel" />

      {/* Actions rapides */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actions Rapides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.role === "SUPER_ADMIN" && (
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Building2 className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Nouvelle Entreprise</h4>
              <p className="text-sm text-gray-600">
                Ajouter une nouvelle entreprise
              </p>
            </div>
          )}

          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <Users className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Nouvel Employé</h4>
            <p className="text-sm text-gray-600">Ajouter un nouvel employé</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <FileText className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Générer Paie</h4>
            <p className="text-sm text-gray-600">
              Lancer la génération des fiches
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
