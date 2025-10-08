import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
  CartesianGrid,
} from "recharts";
import {
  Users,
  Building2,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  Target,
  Briefcase
} from "lucide-react";

const DashboardStatsPage = () => {
  const { user } = useAuth();
  const [generalStats, setGeneralStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifications de rôle
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const canViewAllStats = user?.role === 'SUPER_ADMIN';
  const isCashier = user?.role === 'CASHIER';

  // Couleurs pour les graphiques
  const COLORS = {
    Fixe: '#22c55e',      // Vert pour les contrats fixes
    Journalier: '#3b82f6', // Bleu pour les contrats journaliers
    Honoraire: '#f59e0b'   // Orange pour les honoraires
  };

  // Récupérer les statistiques générales
  const fetchGeneralStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:3003/api/statistics/general", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGeneralStats(data.data);
      } else {
        setError("Erreur lors de la récupération des statistiques générales");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques générales:", error);
      setError("Erreur lors de la récupération des statistiques générales");
    }
  };

  // Récupérer les statistiques mensuelles
  const fetchMonthlyStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:3003/api/statistics/monthly", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMonthlyStats(data.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques mensuelles:", error);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      await Promise.all([fetchGeneralStats(), fetchMonthlyStats()]);
      setLoading(false);
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des statistiques...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500 mb-4">
              <Target className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de Bord
          </h1>
          <p className="text-gray-600">
            {canViewAllStats 
              ? "Vue d'ensemble de toutes les entreprises"
              : isAdmin 
              ? "Vue d'ensemble de votre entreprise"
              : "Aperçu de vos informations"
            }
          </p>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total employés */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {canViewAllStats ? "Total Employés" : "Employés"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {generalStats?.totalEmployees || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total entreprises (seulement pour SUPER_ADMIN) */}
        {canViewAllStats && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Entreprises</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {generalStats?.totalCompanies || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Présences aujourd'hui */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Présents aujourd'hui
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {generalStats?.attendanceToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taux de présence mensuel */}
        {monthlyStats && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Taux présence
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyStats.attendanceRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des types de contrat */}
        {generalStats?.contractTypeStats && generalStats.contractTypeStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Répartition par Type de Contrat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={generalStats.contractTypeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({label, value}) => `${label}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {generalStats.contractTypeStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.label] || '#8884d8'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.label]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Statistiques mensuelles */}
        {monthlyStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Statistiques du Mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Présents', value: monthlyStats.presentDays, color: '#22c55e' },
                    { name: 'En retard', value: monthlyStats.lateDays, color: '#f59e0b' },
                    { name: 'Absents', value: monthlyStats.absentDays, color: '#ef4444' }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={(entry) => entry.color} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Message d'information selon le rôle */}
      {isCashier && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Information pour les caissiers
                </p>
                <p className="text-sm text-blue-700">
                  Ces statistiques montrent un aperçu global de l'entreprise. 
                  Pour vos statistiques personnelles de présence, consultez la section "Statistiques de Présence".
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardStatsPage;