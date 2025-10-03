import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Clock,
  Calendar,
  Target,
  Award,
  AlertTriangle,
} from "lucide-react";

const AttendanceStatsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [stats, setStats] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);

  // Récupérer la liste des employés
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:3003/api/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
    }
  };

  // Récupérer les statistiques d'un employé
  const fetchEmployeeStats = async (employeeId) => {
    if (!employeeId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await fetch(
        `http://localhost:3003/api/attendances/employee/${employeeId}/stats?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les pointages détaillés
  const fetchAttendanceDetails = async (employeeId) => {
    if (!employeeId) return;

    try {
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        employeeId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await fetch(
        `http://localhost:3003/api/attendances?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAttendances(data.data.attendances || []);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des pointages:", error);
    }
  };

  // Charger les données quand la sélection change
  useEffect(() => {
    if (selectedEmployeeId) {
      fetchEmployeeStats(selectedEmployeeId);
      fetchAttendanceDetails(selectedEmployeeId);
    }
  }, [selectedEmployeeId, dateRange]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Préparer les données pour les graphiques
  const prepareChartData = () => {
    if (!stats) return { weeklyData: [], statusData: [] };

    // Données par semaine
    const weeklyData = [];
    const groupedByWeek = attendances.reduce((acc, attendance) => {
      const date = new Date(attendance.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!acc[weekKey]) {
        acc[weekKey] = { week: weekKey, hours: 0, days: 0 };
      }

      if (attendance.hoursWorked) {
        acc[weekKey].hours += Number(attendance.hoursWorked);
      }
      acc[weekKey].days += 1;

      return acc;
    }, {});

    Object.values(groupedByWeek).forEach((week) => {
      weeklyData.push({
        week: new Date(week.week).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        }),
        heures: Number(week.hours.toFixed(1)),
        jours: week.days,
      });
    });

    // Données par statut
    const statusData = [
      { name: "Présent", value: stats.present, color: "#10B981" },
      { name: "Retard", value: stats.late, color: "#F59E0B" },
      { name: "Absent", value: stats.absent, color: "#EF4444" },
      { name: "Congé maladie", value: stats.sickLeave, color: "#8B5CF6" },
      { name: "Congé payé", value: stats.vacation, color: "#06B6D4" },
    ].filter((item) => item.value > 0);

    return { weeklyData, statusData };
  };

  const { weeklyData, statusData } = prepareChartData();

  const selectedEmployee = employees.find(
    (emp) => emp.id === selectedEmployeeId
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Statistiques de Présence
          </h1>
          <p className="text-gray-600">
            Analysez les données de pointage par employé
          </p>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employé</label>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} (
                      {employee.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date début
              </label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date fin</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques générales */}
      {stats && selectedEmployee && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Jours totaux
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Taux de présence
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.attendanceRate}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Heures totales
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalHours}h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Retards</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.late}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Détails par statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Présent:</span>
                    <span className="font-medium text-green-600">
                      {stats.present} jours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Absent:</span>
                    <span className="font-medium text-red-600">
                      {stats.absent} jours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retard:</span>
                    <span className="font-medium text-yellow-600">
                      {stats.late} jours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Demi-journée:</span>
                    <span className="font-medium text-blue-600">
                      {stats.halfDay} jours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Congé maladie:</span>
                    <span className="font-medium text-purple-600">
                      {stats.sickLeave} jours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Congé payé:</span>
                    <span className="font-medium text-orange-600">
                      {stats.vacation} jours
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations employé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom complet:</span>
                    <span className="font-medium">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Code employé:</span>
                    <span className="font-medium">
                      {selectedEmployee.employeeCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Poste:</span>
                    <span className="font-medium">
                      {selectedEmployee.position}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type de contrat:</span>
                    <span className="font-medium">
                      {selectedEmployee.contractType === "FIXED"
                        ? "Salaire fixe"
                        : selectedEmployee.contractType === "DAILY"
                        ? "Journalier"
                        : "Honoraire"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          {weeklyData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Heures par semaine</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="heures" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {statusData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par statut</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {!selectedEmployeeId && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sélectionnez un employé
            </h3>
            <p className="text-gray-600">
              Choisissez un employé dans la liste pour voir ses statistiques de
              présence
            </p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des statistiques...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceStatsPage;
