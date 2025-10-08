import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  LogOut, 
  User, 
  Building, 
  CreditCard, 
  Users, 
  Clock, 
  TrendingUp,
  BarChart3,
  DollarSign,
  FileText,
  Repeat
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalCompanies: 0,
    attendanceToday: 0,
    contractTypeStats: []
  });
  const [monthlyStats, setMonthlyStats] = useState({
    totalAttendances: 0,
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    attendanceRate: 0
  });
  const [payrollStats, setPayrollStats] = useState({
    totalPayslips: 0,
    totalPayruns: 0,
    totalPayments: 0,
    payrollMass: {
      grossSalary: 0,
      netSalary: 0,
      totalDeductions: 0
    }
  });
  const [employeeStats, setEmployeeStats] = useState({
    totalActiveEmployees: 0,
    contractTypeDistribution: [],
    departmentDistribution: []
  });
  const [loading, setLoading] = useState(true);

  // Récupérer les statistiques générales
  const fetchGeneralStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log("🔄 Récupération des stats générales, token:", token ? "✅ Présent" : "❌ Absent");
      
      let url = "http://localhost:3003/api/statistics/general";
      
      // Pour les admins (pas super admin), on filtre par leur entreprise
      if (user?.role === 'ADMIN' && user?.companyId) {
        url += `?companyId=${user.companyId}`;
      }
      // Pour les caissiers, on ne récupère que leurs propres données si ils ont un employeeId
      else if (user?.role === 'CASHIER' && user?.employeeId) {
        url += `?employeeId=${user.employeeId}`;
      }
      
      console.log("🌐 URL d'appel:", url);
      console.log("👤 User role:", user?.role, "companyId:", user?.companyId, "employeeId:", user?.employeeId);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Réponse API stats générales:", response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Données stats générales reçues:", data);
        setStats(data.data);
      } else {
        const errorData = await response.text();
        console.error("❌ Erreur API stats générales:", response.status, errorData);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des statistiques:", error);
    }
  };

  // Récupérer les statistiques mensuelles
  const fetchMonthlyStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log("🔄 Récupération des stats mensuelles, token:", token ? "✅ Présent" : "❌ Absent");
      
      let url = "http://localhost:3003/api/statistics/monthly";
      
      // Même logique de filtrage que pour les stats générales
      if (user?.role === 'ADMIN' && user?.companyId) {
        url += `?companyId=${user.companyId}`;
      }
      else if (user?.role === 'CASHIER' && user?.employeeId) {
        url += `?employeeId=${user.employeeId}`;
      }
      
      console.log("🌐 URL d'appel monthly:", url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Réponse API stats mensuelles:", response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Données stats mensuelles reçues:", data);
        setMonthlyStats(data.data);
      } else {
        const errorData = await response.text();
        console.error("❌ Erreur API stats mensuelles:", response.status, errorData);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des statistiques mensuelles:", error);
    }
  };

  // Récupérer les statistiques de paie
  const fetchPayrollStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log("🔄 Récupération des stats de paie, token:", token ? "✅ Présent" : "❌ Absent");
      
      let url = "http://localhost:3003/api/statistics/payroll";
      
      if (user?.role === 'ADMIN' && user?.companyId) {
        url += `?companyId=${user.companyId}`;
      }
      else if (user?.role === 'CASHIER' && user?.employeeId) {
        url += `?employeeId=${user.employeeId}`;
      }
      
      console.log("🌐 URL d'appel payroll:", url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Réponse API stats paie:", response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Données stats paie reçues:", data);
        setPayrollStats(data.data);
      } else {
        const errorData = await response.text();
        console.error("❌ Erreur API stats paie:", response.status, errorData);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des statistiques de paie:", error);
    }
  };

  // Récupérer les statistiques des employés
  const fetchEmployeeStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log("🔄 Récupération des stats employés, token:", token ? "✅ Présent" : "❌ Absent");
      
      let url = "http://localhost:3003/api/statistics/employees";
      
      if (user?.role === 'ADMIN' && user?.companyId) {
        url += `?companyId=${user.companyId}`;
      }
      else if (user?.role === 'CASHIER' && user?.employeeId) {
        url += `?employeeId=${user.employeeId}`;
      }
      
      console.log("🌐 URL d'appel employees:", url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Réponse API stats employés:", response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Données stats employés reçues:", data);
        setEmployeeStats(data.data);
      } else {
        const errorData = await response.text();
        console.error("❌ Erreur API stats employés:", response.status, errorData);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des statistiques des employés:", error);
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchGeneralStats(), 
        fetchMonthlyStats(),
        fetchPayrollStats(),
        fetchEmployeeStats()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Building className="h-5 w-5" />;
      case "ADMIN":
        return <User className="h-5 w-5" />;
      case "CASHIER":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Administrateur";
      case "ADMIN":
        return "Administrateur";
      case "CASHIER":
        return "Caissier";
      default:
        return role;
    }
  };

  // Couleurs pour le graphique des types de contrat
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Préparer les données pour les graphiques
  const contractChartData = employeeStats.contractTypeDistribution?.map((item, index) => ({
    name: item.type,
    value: item.count,
    label: item.label,
    color: COLORS[index % COLORS.length]
  })) || [];

  const attendanceChartData = [
    { name: 'Présent', value: monthlyStats.presentDays, color: '#00C49F' },
    { name: 'En retard', value: monthlyStats.lateDays, color: '#FFBB28' },
    { name: 'Absent', value: monthlyStats.absentDays, color: '#FF8042' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Synergy Pay
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>{user?.firstName.charAt(0)}{user?.lastName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getRoleIcon(user?.role)}
                <span>
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {getRoleName(user?.role)}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h2>
          <p className="text-gray-600">
            Bienvenue, {user?.firstName}! Voici votre vue d'ensemble.
          </p>
        </div>

        {/* Statistiques principales */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Statistiques communes à tous les rôles */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {user?.role === 'SUPER_ADMIN' 
                        ? 'Total Employés' 
                        : user?.role === 'ADMIN' 
                        ? 'Employés Actifs'
                        : 'Mon Profil'
                      }
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {user?.role === 'CASHIER' ? '1' : employeeStats.totalActiveEmployees || stats.totalEmployees}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-[#212121]" />
                </div>
              </CardContent>
            </Card>

            {/* Masse salariale - Pour ADMIN et SUPER_ADMIN */}
            {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Masse Salariale (Mois)</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('fr-FR', { 
                          style: 'currency', 
                          currency: 'XOF' 
                        }).format(payrollStats.payrollMass?.netSalary || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Brut: {new Intl.NumberFormat('fr-FR', { 
                          style: 'currency', 
                          currency: 'XOF' 
                        }).format(payrollStats.payrollMass?.grossSalary || 0)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bulletins générés - Pour ADMIN et SUPER_ADMIN */}
            {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bulletins Générés</p>
                      <p className="text-2xl font-bold text-gray-900">{payrollStats.totalPayslips || 0}</p>
                      <p className="text-xs text-gray-500">
                        {payrollStats.totalPayruns || 0} cycle(s) de paie
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Paiements effectués */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {user?.role === 'CASHIER' ? 'Mes Paiements' : 'Paiements Effectués'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{payrollStats.totalPayments || 0}</p>
                    <p className="text-xs text-gray-500">
                      Ce mois
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            {/* Statistique spécifique au SUPER_ADMIN */}
            {user?.role === 'SUPER_ADMIN' && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Entreprises</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies || 0}</p>
                    </div>
                    <Building className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistique des présences */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {user?.role === 'SUPER_ADMIN' 
                        ? 'Présences Aujourd\'hui (Global)'
                        : user?.role === 'ADMIN'
                        ? 'Présences Aujourd\'hui'
                        : 'Mes Présences ce Mois'
                      }
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {user?.role === 'CASHIER' 
                        ? monthlyStats.presentDays + monthlyStats.lateDays
                        : stats.attendanceToday
                      }
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            {/* Taux de présence */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {user?.role === 'CASHIER' 
                        ? 'Mon Taux de Présence'
                        : 'Taux de Présence Moyen'
                      }
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {monthlyStats.attendanceRate ? monthlyStats.attendanceRate.toFixed(1) : '0.0'}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Graphiques */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Graphique des types de contrat - Seulement pour SUPER_ADMIN et ADMIN */}
            {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && contractChartData?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Types de Contrat
                  </CardTitle>
                  <CardDescription>
                    {user?.role === 'SUPER_ADMIN' 
                      ? 'Répartition globale des employés par type de contrat'
                      : 'Répartition des employés de votre entreprise par type de contrat'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contractChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ label, value }) => `${label}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {contractChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Graphique des présences mensuelles - Pour tous les rôles */}
            {(monthlyStats.presentDays > 0 || monthlyStats.lateDays > 0 || monthlyStats.absentDays > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {user?.role === 'CASHIER' ? 'Mes Présences ce Mois' : 'Présences ce Mois'}
                  </CardTitle>
                  <CardDescription>
                    {user?.role === 'SUPER_ADMIN' 
                      ? 'Répartition globale des statuts de présence'
                      : user?.role === 'ADMIN'
                      ? 'Répartition des statuts de présence de votre entreprise'
                      : 'Répartition de vos statuts de présence'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8">
                          {attendanceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Message pour les caissiers s'ils n'ont pas de données */}
            {user?.role === 'CASHIER' && monthlyStats.presentDays === 0 && monthlyStats.lateDays === 0 && monthlyStats.absentDays === 0 && (
              <Card className="lg:col-span-2">
                <CardContent className="p-12 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune donnée de présence
                  </h3>
                  <p className="text-gray-600">
                    Vous n'avez pas encore de données de présence pour ce mois. 
                    Commencez à pointer pour voir vos statistiques ici.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Message pour les admins s'ils n'ont pas de données */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && contractChartData?.length === 0 && (
              <Card className="lg:col-span-2">
                <CardContent className="p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun employé enregistré
                  </h3>
                  <p className="text-gray-600">
                    {user?.role === 'SUPER_ADMIN' 
                      ? 'Aucun employé n\'est encore enregistré dans le système.'
                      : 'Aucun employé n\'est encore enregistré dans votre entreprise.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center h-32 mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#212121]"></div>
            <span className="ml-2 text-gray-600">Chargement des statistiques...</span>
          </div>
        )}

        {/* Informations utilisateur */}
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getRoleIcon(user?.role)}
                Informations de votre compte
              </CardTitle>
              <CardDescription>
                Détails de votre profil utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nom complet
                  </label>
                  <p className="text-lg font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Rôle
                  </label>
                  <p className="text-lg font-medium">
                    {getRoleName(user?.role)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Statut
                  </label>
                  <p className="text-lg">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Actif
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides selon le rôle */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions disponibles</CardTitle>
              <CardDescription>
                Fonctionnalités accessibles avec votre rôle{" "}
                {getRoleName(user?.role)}
                {user?.role === 'SUPER_ADMIN' && ' - Accès complet à toutes les fonctionnalités'}
                {user?.role === 'ADMIN' && ' - Gestion de votre entreprise'}
                {user?.role === 'CASHIER' && ' - Gestion des paiements et consultation de vos données'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Actions spécifiques au SUPER_ADMIN */}
                {user?.role === "SUPER_ADMIN" && (
                  <>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <Building className="h-8 w-8 text-[#212121] mb-2" />
                      <h3 className="font-medium mb-1">
                        Gestion des entreprises
                      </h3>
                      <p className="text-sm text-gray-600">
                        Créer et gérer toutes les entreprises du système
                      </p>
                      <p className="text-xs text-[#212121] mt-1 font-medium">
                        {stats.totalCompanies || 0} entreprise(s) enregistrée(s)
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <User className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-medium mb-1">
                        Gestion globale des utilisateurs
                      </h3>
                      <p className="text-sm text-gray-600">
                        Administrer tous les utilisateurs de toutes les entreprises
                      </p>
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        Accès administrateur complet
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                      <h3 className="font-medium mb-1">Statistiques globales</h3>
                      <p className="text-sm text-gray-600">
                        Voir les statistiques de toutes les entreprises
                      </p>
                      <p className="text-xs text-purple-600 mt-1 font-medium">
                        {stats.totalEmployees || 0} employé(s) au total
                      </p>
                    </div>
                  </>
                )}

                {/* Actions pour ADMIN et SUPER_ADMIN */}
                {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
                  <>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <Users className="h-8 w-8 text-indigo-600 mb-2" />
                      <h3 className="font-medium mb-1">
                        {user?.role === "SUPER_ADMIN" ? "Gestion des employés" : "Mes employés"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user?.role === "SUPER_ADMIN" 
                          ? "Gérer tous les employés de toutes les entreprises"
                          : "Ajouter et modifier les employés de votre entreprise"
                        }
                      </p>
                      <p className="text-xs text-indigo-600 mt-1 font-medium">
                        {user?.role === "SUPER_ADMIN" 
                          ? `${stats.totalEmployees || 0} employé(s) total`
                          : `${stats.totalEmployees || 0} employé(s) dans votre entreprise`
                        }
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <CreditCard className="h-8 w-8 text-orange-600 mb-2" />
                      <h3 className="font-medium mb-1">Cycles de paie</h3>
                      <p className="text-sm text-gray-600">
                        Créer et approuver les cycles de paie
                      </p>
                      <p className="text-xs text-orange-600 mt-1 font-medium">
                        Gestion des salaires
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <Clock className="h-8 w-8 text-teal-600 mb-2" />
                      <h3 className="font-medium mb-1">Suivi des présences</h3>
                      <p className="text-sm text-gray-600">
                        Consulter et gérer les pointages
                      </p>
                      <p className="text-xs text-teal-600 mt-1 font-medium">
                        {stats.attendanceToday || 0} présence(s) aujourd'hui
                      </p>
                    </div>
                  </>
                )}

                {/* Actions pour tous les rôles (y compris CASHIER) */}
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <CreditCard className="h-8 w-8 text-red-600 mb-2" />
                  <h3 className="font-medium mb-1">
                    {user?.role === "CASHIER" ? "Mes paiements" : "Paiements"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {user?.role === "CASHIER" 
                      ? "Consulter vos paiements de salaires"
                      : "Effectuer et gérer les paiements de salaires"
                    }
                  </p>
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {user?.role === "CASHIER" ? "Consultation uniquement" : "Gestion complète"}
                  </p>
                </div>

                {/* Action spécifique pour les caissiers */}
                {user?.role === "CASHIER" && (
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <Clock className="h-8 w-8 text-[#212121] mb-2" />
                    <h3 className="font-medium mb-1">Mon pointage</h3>
                    <p className="text-sm text-gray-600">
                      Pointer vos heures d'arrivée et de départ
                    </p>
                    <p className="text-xs text-[#212121] mt-1 font-medium">
                      Taux de présence: {monthlyStats.attendanceRate ? monthlyStats.attendanceRate.toFixed(1) : '0'}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
