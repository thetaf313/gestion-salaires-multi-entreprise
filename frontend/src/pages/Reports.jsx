import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SalaryChart,
  EmployeeChart,
  ContractTypeChart,
  PayrollChart,
  CombinedChart,
} from "../components/charts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  FileText,
  PieChart,
  Activity,
  Target,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("current-year");
  const [selectedReport, setSelectedReport] = useState("overview");

  // Données mockées pour les rapports
  const mockData = {
    overview: {
      totalEmployees: 15,
      totalSalaries: 4250000,
      averageSalary: 283333,
      payrollCycles: 12,
      monthlyGrowth: 5.2,
    },
    monthlyData: [
      { month: "Jan", salaries: 3800000, employees: 12 },
      { month: "Fév", salaries: 3950000, employees: 13 },
      { month: "Mar", salaries: 4100000, employees: 14 },
      { month: "Avr", salaries: 4250000, employees: 15 },
      { month: "Mai", salaries: 4300000, employees: 15 },
      { month: "Jun", salaries: 4450000, employees: 16 },
    ],
    contractTypes: [
      { type: "CDI", count: 8, percentage: 53.3 },
      { type: "CDD", count: 4, percentage: 26.7 },
      { type: "Stage", count: 2, percentage: 13.3 },
      { type: "Freelance", count: 1, percentage: 6.7 },
    ],
    departmentCosts: [
      { department: "IT", cost: 1200000, employees: 5 },
      { department: "Commercial", cost: 950000, employees: 4 },
      { department: "RH", cost: 800000, employees: 3 },
      { department: "Finance", cost: 700000, employees: 2 },
      { department: "Autres", cost: 600000, employees: 1 },
    ],
  };

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? "+" : ""}${value}%`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Rapports et Analyses
          </h1>
          <p className="text-muted-foreground">
            Analysez les données de paie et RH
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Mois en cours</SelectItem>
              <SelectItem value="last-month">Mois précédent</SelectItem>
              <SelectItem value="current-quarter">
                Trimestre en cours
              </SelectItem>
              <SelectItem value="current-year">Année en cours</SelectItem>
              <SelectItem value="last-year">Année précédente</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {mockData.overview.totalEmployees}
                </p>
                <p className="text-sm text-muted-foreground">Employés actifs</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-500">+2 ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(mockData.overview.totalSalaries)}
                </p>
                <p className="text-sm text-muted-foreground">Masse salariale</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-500">
                {formatPercentage(mockData.overview.monthlyGrowth)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(mockData.overview.averageSalary)}
                </p>
                <p className="text-sm text-muted-foreground">Salaire moyen</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              <Activity className="w-3 h-3 text-blue-500 mr-1" />
              <span className="text-blue-500">Stable</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {mockData.overview.payrollCycles}
                </p>
                <p className="text-sm text-muted-foreground">Cycles de paie</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              <FileText className="w-3 h-3 text-gray-500 mr-1" />
              <span className="text-gray-500">Cette année</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalaryChart title="Évolution des salaires" height={350} />
        <PayrollChart title="Masse salariale mensuelle" height={350} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeChart title="Employés par département" height={350} />
        <ContractTypeChart title="Répartition des contrats" height={350} />
      </div>

      {/* Analyse combinée avancée */}
      <CombinedChart
        title="Analyse complète des performances RH"
        height={500}
      />

      {/* Graphiques et analyses détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Évolution Mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.monthlyData.map((data, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{data.month}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.employees} employés
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(data.salaries)}</p>
                    <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(data.salaries / 4500000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition par type de contrat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Types de Contrats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.contractTypes.map((contract, index) => {
                const colors = [
                  "bg-blue-500",
                  "bg-green-500",
                  "bg-yellow-500",
                  "bg-purple-500",
                ];
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${colors[index]}`}
                      ></div>
                      <span className="font-medium">{contract.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">
                        {contract.count}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {contract.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex h-3 rounded-full overflow-hidden">
                {mockData.contractTypes.map((contract, index) => {
                  const colors = [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-yellow-500",
                    "bg-purple-500",
                  ];
                  return (
                    <div
                      key={index}
                      className={colors[index]}
                      style={{ width: `${contract.percentage}%` }}
                    ></div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coûts par département */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Coûts par Département
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {mockData.departmentCosts.map((dept, index) => {
                const colors = [
                  "bg-blue-500",
                  "bg-green-500",
                  "bg-yellow-500",
                  "bg-purple-500",
                  "bg-pink-500",
                ];
                const maxCost = Math.max(
                  ...mockData.departmentCosts.map((d) => d.cost)
                );
                const percentage = (dept.cost / maxCost) * 100;

                return (
                  <div
                    key={index}
                    className="text-center p-4 border rounded-lg"
                  >
                    <div className="mb-3">
                      <div
                        className={`w-16 h-16 ${colors[index]} rounded-full mx-auto flex items-center justify-center text-white font-bold text-lg`}
                      >
                        {dept.employees}
                      </div>
                    </div>
                    <h3 className="font-medium mb-1">{dept.department}</h3>
                    <p className="text-2xl font-bold">
                      {formatCurrency(dept.cost)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(dept.cost / dept.employees).toLocaleString("fr-FR")}{" "}
                      F/emp
                    </p>
                    <div className="mt-3">
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 ${colors[index]} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé et recommandations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Résumé Exécutif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">
                Points Positifs
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>
                  • Croissance de{" "}
                  {formatPercentage(mockData.overview.monthlyGrowth)} de la
                  masse salariale
                </li>
                <li>• Recrutement de 2 nouveaux employés ce mois</li>
                <li>• Stabilité du salaire moyen</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">
                Points d'Attention
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Coût par employé élevé dans le département IT</li>
                <li>• Répartition inégale entre les départements</li>
                <li>• Besoin d'optimisation des coûts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommandations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Optimiser les coûts IT</p>
                  <p className="text-sm text-muted-foreground">
                    Réviser la structure salariale du département IT
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Équilibrer les équipes</p>
                  <p className="text-sm text-muted-foreground">
                    Renforcer les départements sous-dotés
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Planifier la croissance</p>
                  <p className="text-sm text-muted-foreground">
                    Prévoir le budget pour les futurs recrutements
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
