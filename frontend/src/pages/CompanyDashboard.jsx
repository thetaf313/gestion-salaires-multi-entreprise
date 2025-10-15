import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  SalaryChart,
  EmployeeChart,
  ContractTypeChart,
  PayrollChart,
} from "../components/charts";
import QuickAttendanceWidget from "../components/QuickAttendanceWidget";
import {
  Building2,
  Users,
  DollarSign,
  FileText,
  Plus,
  Settings,
  ArrowLeft,
  TrendingUp,
  Calendar,
  CreditCard,
  UserCheck,
} from "lucide-react";
import companyService from "../services/companyService";

const CompanyDashboard = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    monthlyPayroll: 0,
    lastPayRun: null,
    pendingPayslips: 0,
  });

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const [companyResponse, statsResponse] = await Promise.all([
        companyService.getCompanyById(companyId),
        companyService.getCompanyStats(companyId),
      ]);

      if (companyResponse.success) {
        setCompany(companyResponse.data);
      }

      if (statsResponse.success) {
        const payload = statsResponse.data || statsResponse;
        // payload may contain { stats, kpiSummary }
        const s = payload.stats || payload;

        setStats({
          totalEmployees: s?.employees?.total || companyResponse.data?._count?.employees || 0,
          activeEmployees: s?.employees?.active || companyResponse.data?._count?.employees || 0,
          monthlyPayroll: s?.payroll?.currentMonthBudget ?? s?.totalPayrollAmount ?? s?.monthlyPayroll ?? 0,
          lastPayRun: s?.lastPayRun ? new Date(s.lastPayRun) : null,
          pendingPayslips: s?.pendingPayslips ?? s?.payslipStatus?.pending ?? 0,
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCompanies = () => {
    if (user?.role === "SUPER_ADMIN") {
      navigate("/companies");
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Entreprise non trouvée
        </h2>
        <p className="text-gray-600 mb-4">
          L'entreprise demandée n'existe pas ou vous n'avez pas accès.
        </p>
        <Button onClick={handleBackToCompanies}>
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec informations de l'entreprise */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          {user?.role === "SUPER_ADMIN" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToCompanies}
              className="mb-2 sm:mb-0"
            >
              <ArrowLeft size={16} className="mr-2" />
              Retour
            </Button>
          )}
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={`Logo ${company.name}`}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {company.name}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={company.isActive ? "default" : "secondary"}>
                  {company.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-sm text-gray-500">
                  {company.payPeriodType === "MONTHLY"
                    ? "Mensuelle"
                    : company.payPeriodType === "WEEKLY"
                    ? "Hebdomadaire"
                    : "Journalière"}{" "}
                  • {company.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Settings size={16} className="mr-2" />
            Paramètres
          </Button>
          {(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
            <Button
              size="sm"
              onClick={() => navigate(`/company/${companyId}/employees`)}
            >
              <Users size={16} className="mr-2" />
              Employés
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques de l'entreprise */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Employés
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEmployees}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">
              {stats.activeEmployees} actifs
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Masse Salariale
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: company.currency || "EUR",
                }).format(stats.monthlyPayroll)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+3.2%</span>
            <span className="text-gray-500 ml-1">ce mois</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Fiches en Attente
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingPayslips}
              </p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-purple-600">À traiter</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dernière Paie</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.lastPayRun
                  ? stats.lastPayRun.toLocaleDateString()
                  : "Aucune"}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Widget de pointage rapide pour les utilisateurs qui sont aussi employés */}
      {user?.employeeId && <QuickAttendanceWidget />}

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalaryChart title={`Évolution des salaires - ${company?.name}`} />
        <ContractTypeChart title="Types de contrats" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeChart title="Employés par département" />
        <PayrollChart title="Masse salariale mensuelle" />
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-6 w-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">
              Gestion des Employés
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Ajouter, modifier ou supprimer des employés
          </p>
          <div className="space-y-2">
            {/* <Button
              className="w-full"
              size="sm"
              onClick={() => navigate(`/company/${companyId}/employees`)}
            >
              <Plus size={14} className="mr-2" />
              Nouvel Employé
            </Button> */}
            <Button
              // variant="outline"
              className="w-full"
              size="sm"
              onClick={() => navigate(`/company/${companyId}/employees`)}
            >
              Voir tous les employés
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <UserCheck className="h-6 w-6 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">
              Gestion des Utilisateurs
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Gérer les comptes d'accès au système
          </p>
          <div className="space-y-2">
            {/* <Button
              className="w-full"
              size="sm"
              onClick={() => navigate(`/company/${companyId}/users`)}
            >
              <Plus size={14} className="mr-2" />
              Nouvel Utilisateur
            </Button> */}
            <Button
              // variant="outline"
              className="w-full"
              size="sm"
              onClick={() => navigate(`/company/${companyId}/users`)}
            >
              Voir tous les utilisateurs
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Gestion des Paies</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Générer et gérer les fiches de paie
          </p>
          <div className="space-y-2">
            {/* <Button className="w-full" size="sm" variant="outline">
              Nouvelle Paie
            </Button> */}
            {/* <Button variant="outline" className="w-full" size="sm"> */}
            <Button className="w-full" size="sm">
              Historique des Paies
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-6 w-6 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Rapports</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Générer des rapports et statistiques
          </p>
          <div className="space-y-2">
            <Button className="w-full" size="sm" variant="outline">
              Rapport Mensuel
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              Exporter Données
            </Button>
          </div>
        </Card>
      </div>

      {/* Activité récente */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Activité Récente
        </h3>
        <div className="space-y-4">
          {[
            {
              action: "Nouvelle fiche de paie générée",
              user: "Jean Dupont",
              time: "Il y a 2 heures",
            },
            {
              action: "Employé ajouté",
              user: "Marie Martin",
              time: "Il y a 5 heures",
            },
            {
              action: "Paie validée",
              user: "Pierre Durand",
              time: "Il y a 1 jour",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.user}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Informations de l'entreprise */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informations de l'entreprise
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">
                Adresse:
              </span>
              <p className="text-gray-900">{company.address}</p>
            </div>
            {company.email && (
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Email:
                </span>
                <p className="text-gray-900">{company.email}</p>
              </div>
            )}
            {company.phone && (
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Téléphone:
                </span>
                <p className="text-gray-900">{company.phone}</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">
                Date de création:
              </span>
              <p className="text-gray-900">
                {new Date(company.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Devise:</span>
              <p className="text-gray-900">{company.currency}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Période de paie:
              </span>
              <p className="text-gray-900">
                {company.payPeriodType === "MONTHLY"
                  ? "Mensuelle"
                  : company.payPeriodType === "WEEKLY"
                  ? "Hebdomadaire"
                  : "Journalière"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompanyDashboard;
