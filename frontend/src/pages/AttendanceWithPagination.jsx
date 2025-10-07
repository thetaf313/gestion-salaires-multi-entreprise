import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useApiPagination } from "../hooks/useApiPagination";
import { FilterControls } from "../components/ui/FilterControls";
import { PaginationControls } from "../components/ui/PaginationControls";
import {
  Plus,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  ArrowLeft,
  ClockIcon,
  UserCheck,
  Coffee,
  Plane,
  QrCode
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import attendanceService from "../services/attendanceService";
import { adaptPaginationResponse, logPaginationResponse } from "../utils/paginationAdapter";
import { CreateAttendanceModal } from "../components/CreateAttendanceModal";
import { EditAttendanceModal } from "../components/EditAttendanceModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import NewAttendanceModal from "../components/NewAttendanceModal";
import { formatDate, formatTime } from "../utils/dateUtils";

export function AttendanceWithPagination() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // États des modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNewAttendanceModal, setShowNewAttendanceModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // Configuration de l'API avec pagination
  const apiFunction = useCallback(async (params) => {
    if (!companyId) {
      return { data: [], total: 0, totalPages: 0 };
    }

    try {
      const result = await attendanceService.getAttendanceByCompany(companyId, params);
      logPaginationResponse(result, 'AttendanceService');
      return adaptPaginationResponse(result, params);
    } catch (error) {
      console.error('Erreur lors de la récupération des présences:', error);
      throw error;
    }
  }, [companyId]);

  const pagination = useApiPagination({
    apiFunction,
    dependencies: [], // Pas besoin de companyId car apiFunction est mémorisé
    defaultFilters: {
      search: '',
      status: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      employeeId: ''
    },
    defaultLimit: 20,
    onError: (error) => {
      toast.error("Erreur lors du chargement des pointages");
    }
  });

  // Configuration des filtres
  const statusOptions = [
    { value: 'PRESENT', label: 'Présent' },
    { value: 'LATE', label: 'En retard' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'HALF_DAY', label: 'Demi-journée' },
    { value: 'VACATION', label: 'Congé' }
  ];

  const yearOptions = Array.from({ length: 3 }, (_, i) => {
    const year = new Date().getFullYear() - 1 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const monthOptions = [
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  const filterConfig = {
    searchConfig: {
      placeholder: "Rechercher par nom d'employé...",
      searchField: "search"
    },
    selectFilters: [
      {
        key: 'status',
        label: 'Statut',
        placeholder: 'Statut',
        options: statusOptions,
        allLabel: 'Tous les statuts'
      },
      {
        key: 'year',
        label: 'Année',
        placeholder: 'Année',
        options: yearOptions,
        allLabel: 'Toutes les années'
      },
      {
        key: 'month',
        label: 'Mois',
        placeholder: 'Mois',
        options: monthOptions,
        allLabel: 'Tous les mois'
      }
    ]
  };

  // Gestionnaires d'événements
  const handleCreateAttendance = () => {
    setShowCreateModal(true);
  };

  const handleNewAttendance = () => {
    setShowNewAttendanceModal(true);
  };

  const handleEditAttendance = (attendance) => {
    setSelectedAttendance(attendance);
    setShowEditModal(true);
  };

  const handleDeleteAttendance = (attendance) => {
    setSelectedAttendance(attendance);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedAttendance) return;

    try {
      await attendanceService.deleteAttendance(companyId, selectedAttendance.id);
      toast.success("Pointage supprimé avec succès");
      pagination.reload();
      setShowDeleteDialog(false);
      setSelectedAttendance(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression du pointage");
    }
  };

  const onAttendanceCreated = () => {
    setShowCreateModal(false);
    pagination.reload();
    toast.success("Pointage créé avec succès");
  };

  const onAttendanceUpdated = () => {
    setShowEditModal(false);
    setSelectedAttendance(null);
    pagination.reload();
    toast.success("Pointage modifié avec succès");
  };

  // Fonction pour obtenir le badge du statut
  const getStatusBadge = (status) => {
    const variants = {
      PRESENT: "default",
      LATE: "secondary",
      ABSENT: "destructive",
      HALF_DAY: "outline",
      VACATION: "secondary"
    };

    const labels = {
      PRESENT: "Présent",
      LATE: "En retard",
      ABSENT: "Absent",
      HALF_DAY: "Demi-journée",
      VACATION: "Congé"
    };

    const icons = {
      PRESENT: CheckCircle,
      LATE: Clock,
      ABSENT: XCircle,
      HALF_DAY: Coffee,
      VACATION: Plane
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge variant={variants[status] || "secondary"} className="gap-1">
        <Icon className="w-3 h-3" />
        {labels[status] || status}
      </Badge>
    );
  };

  // Les fonctions de formatage sont maintenant importées depuis utils/dateUtils

  // Calculs des statistiques
  const stats = {
    total: pagination.totalItems,
    present: pagination.data.filter(a => a.status === 'PRESENT').length,
    late: pagination.data.filter(a => a.status === 'LATE').length,
    absent: pagination.data.filter(a => a.status === 'ABSENT').length
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/company/${companyId}/dashboard`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Pointage des Employés</h1>
            <p className="text-muted-foreground">
              Gérez les pointages de votre entreprise
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleNewAttendance} variant="outline">
            <QrCode className="w-4 h-4 mr-2" />
            Pointage Intelligent
          </Button>
          {/* <Button onClick={handleCreateAttendance}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Pointage
          </Button> */}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.present}</p>
                <p className="text-sm text-muted-foreground">Présents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.late}</p>
                <p className="text-sm text-muted-foreground">En retard</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.absent}</p>
                <p className="text-sm text-muted-foreground">Absents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <FilterControls
        pagination={pagination}
        {...filterConfig}
      />

      {/* Liste des pointages */}
      {pagination.loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : pagination.isEmpty ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClockIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun pointage trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {Object.values(pagination.filters).some(v => v) 
                ? "Aucun pointage ne correspond aux critères de recherche."
                : "Commencez par ajouter votre premier pointage."
              }
            </p>
            {!Object.values(pagination.filters).some(v => v) && (
              <Button onClick={handleCreateAttendance}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un pointage
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Employé</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Statut</th>
                    <th className="p-4 font-medium">Arrivée</th>
                    <th className="p-4 font-medium">Départ</th>
                    <th className="p-4 font-medium">Heures</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.data.map((attendance) => (
                    <tr key={attendance.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {attendance.employee.firstName[0]}{attendance.employee.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {attendance.employee.firstName} {attendance.employee.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {attendance.employee.employeeCode}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(attendance.date)}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(attendance.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {formatTime(attendance.checkIn)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {formatTime(attendance.checkOut)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono">
                          {attendance.totalHours ? `${attendance.totalHours.toFixed(1)}h` : '--'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAttendance(attendance)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAttendance(attendance)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <PaginationControls 
        pagination={pagination}
        limitOptions={[10, 20, 50, 100]}
      />

      {/* Modals */}
      <CreateAttendanceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        companyId={companyId}
        onAttendanceCreated={onAttendanceCreated}
      />

      <EditAttendanceModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        attendance={selectedAttendance}
        companyId={companyId}
        onAttendanceUpdated={onAttendanceUpdated}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Supprimer le pointage"
        description={`Êtes-vous sûr de vouloir supprimer ce pointage ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />

      {/* Modal de pointage intelligent avec scanner QR */}
      <NewAttendanceModal
        isOpen={showNewAttendanceModal}
        onClose={() => setShowNewAttendanceModal(false)}
        companyId={companyId}
        onSuccess={() => {
          setShowNewAttendanceModal(false);
          pagination.reload();
          toast.success("Pointage enregistré avec succès");
        }}
      />
    </div>
  );
}

export default AttendanceWithPagination;