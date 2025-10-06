import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import NewAttendanceModal from "../components/NewAttendanceModal";
import attendanceService from "../services/attendanceService";

const AttendancePage = () => {
  const { companyId } = useParams();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employeeSearch: "", // Changé de employeeId à employeeSearch
    startDate: "",
    endDate: "",
    status: "",
    isValidated: "",
  });
  const [showNewAttendanceModal, setShowNewAttendanceModal] = useState(false);

  // Récupérer les pointages
  const fetchAttendances = async () => {
    try {
      setLoading(true);

      // Transformer les valeurs "all" en chaînes vides pour l'API
      const apiFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          apiFilters[key] = value;
        }
      });

      console.log("🔍 Frontend - Fetch attendances avec filtres:", apiFilters);
      const response = await attendanceService.getAttendances(apiFilters);
      console.log("📋 Frontend - Réponse reçue:", response);

      if (response.success) {
        // Vérifier la structure des données
        console.log("✅ Frontend - Structure des données:", response.data);

        // Le backend retourne { data: { attendances: [], pagination: {} } }
        const attendancesData =
          response.data.data?.attendances || response.data.attendances || [];
        console.log("📊 Frontend - Attendances extraites:", attendancesData);

        setAttendances(Array.isArray(attendancesData) ? attendancesData : []);
      } else {
        console.error(
          "Erreur lors de la récupération des pointages:",
          response.error
        );
        setAttendances([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des pointages:", error);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  // Valider un pointage
  const validateAttendance = async (attendanceId) => {
    try {
      const response = await attendanceService.validate(
        companyId,
        attendanceId,
        {
          status: "VALIDATED",
        }
      );

      if (response.success) {
        fetchAttendances(); // Recharger la liste
      } else {
        console.error("Erreur lors de la validation:", response.error);
      }
    } catch (error) {
      console.error("Erreur lors de la validation du pointage:", error);
    }
  };

  // Supprimer un pointage
  const deleteAttendance = async (attendanceId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce pointage ?"))
      return;

    try {
      const response = await attendanceService.delete(companyId, attendanceId);

      if (response.success) {
        fetchAttendances(); // Recharger les données
      } else {
        console.error("Erreur lors de la suppression:", response.error);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, []);

  useEffect(() => {
    fetchAttendances();
  }, [filters]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PRESENT: { label: "Présent", className: "bg-green-100 text-green-800" },
      ABSENT: { label: "Absent", className: "bg-red-100 text-red-800" },
      LATE: { label: "Retard", className: "bg-yellow-100 text-yellow-800" },
      HALF_DAY: {
        label: "Demi-journée",
        className: "bg-blue-100 text-blue-800",
      },
      SICK_LEAVE: {
        label: "Congé maladie",
        className: "bg-purple-100 text-purple-800",
      },
      VACATION: {
        label: "Congé payé",
        className: "bg-orange-100 text-orange-800",
      },
      UNPAID_LEAVE: {
        label: "Congé sans solde",
        className: "bg-gray-100 text-gray-800",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Pointages
          </h1>
          <p className="text-gray-600">
            Suivez et gérez les présences de vos employés
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowNewAttendanceModal(true)}
            className="text-white bg-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            size="lg"
            variant="default"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Nouveau Pointage Intelligent
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Présences
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendances.filter((a) => a.status === "PRESENT").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Validés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendances.filter((a) => a.isValidated).length}
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
                  {attendances.filter((a) => a.status === "LATE").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absences</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendances.filter((a) => a.status === "ABSENT").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Rechercher par code ou email d'employé..."
              value={filters.employeeSearch}
              onChange={(e) =>
                setFilters({ ...filters, employeeSearch: e.target.value })
              }
            />

            <Input
              type="date"
              placeholder="Date début"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />

            <Input
              type="date"
              placeholder="Date fin"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PRESENT">Présent</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="LATE">Retard</SelectItem>
                <SelectItem value="HALF_DAY">Demi-journée</SelectItem>
                <SelectItem value="SICK_LEAVE">Congé maladie</SelectItem>
                <SelectItem value="VACATION">Congé payé</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isValidated}
              onValueChange={(value) =>
                setFilters({ ...filters, isValidated: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Validation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="true">Validés</SelectItem>
                <SelectItem value="false">Non validés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des pointages */}
      <Card>
        <CardHeader>
          <CardTitle>Pointages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : attendances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun pointage trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Employé</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Arrivée</th>
                    <th className="text-left p-3">Départ</th>
                    <th className="text-left p-3">Heures</th>
                    <th className="text-left p-3">Statut</th>
                    <th className="text-left p-3">Retard</th>
                    <th className="text-left p-3">Validation</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((attendance) => (
                    <tr
                      key={attendance.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <div>
                          <div className="font-medium">
                            {attendance.employee.firstName}{" "}
                            {attendance.employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attendance.employee.employeeCode}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{formatDate(attendance.date)}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-green-600" />
                          {formatTime(attendance.checkIn)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-red-600" />
                          {formatTime(attendance.checkOut)}
                        </div>
                      </td>
                      <td className="p-3">
                        {attendance.hoursWorked
                          ? `${Number(attendance.hoursWorked).toFixed(2)}h`
                          : "-"}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(attendance.status)}
                      </td>
                      <td className="p-3">
                        {attendance.lateMinutes > 0 ? (
                          <span className="text-red-600">
                            {attendance.lateMinutes} min
                          </span>
                        ) : (
                          <span className="text-green-600">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {attendance.isValidated ? (
                          <Badge className="bg-green-100 text-green-800">
                            Validé
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            En attente
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          {!attendance.isValidated && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => validateAttendance(attendance.id)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteAttendance(attendance.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de nouveau pointage intelligent */}
      <NewAttendanceModal
        isOpen={showNewAttendanceModal}
        onClose={() => setShowNewAttendanceModal(false)}
        companyId={companyId}
        onSuccess={() => {
          fetchAttendances();
        }}
      />
    </div>
  );
};

export default AttendancePage;
