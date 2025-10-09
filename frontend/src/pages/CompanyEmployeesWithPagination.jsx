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
  Users,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  QrCode,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import employeeService from "../services/employeeService";
import { adaptPaginationResponse, logPaginationResponse } from "../utils/paginationAdapter";
import { EditEmployeeModal } from "../components/EditEmployeeModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { formatDate } from "../utils/dateUtils";

export function CompanyEmployeesWithPagination() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Vérification de l'authentification
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  // États des modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Configuration de l'API avec pagination
  const apiFunction = useCallback(async (params) => {
    if (!companyId) {
      console.warn('companyId is missing, returning empty data');
      return { data: [], total: 0, totalPages: 0 };
    }

    try {
      const result = await employeeService.getEmployeesByCompany(companyId, params);
      logPaginationResponse(result, 'EmployeeService');
      return adaptPaginationResponse(result, params);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      throw error;
    }
  }, [companyId]);

  const pagination = useApiPagination({
    apiFunction,
    dependencies: [], // Pas besoin de companyId car apiFunction est mémorisé avec useCallback
    defaultFilters: {
      search: ''
      // Temporairement commenté car pas supporté par le backend
      // contractType: '',
      // status: 'active'
    },
    defaultLimit: 12,
    onError: (error) => {
      console.error('Error in pagination:', error);
      toast.error("Erreur lors du chargement des employés");
    }
  });

  // Configuration des filtres
  const contractTypeOptions = [
    { value: 'FIXED', label: 'Salaire fixe' },
    { value: 'DAILY', label: 'Journalier' },
    { value: 'HONORARIUM', label: 'Honoraire' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Actifs' },
    { value: 'inactive', label: 'Inactifs' }
  ];

  const filterConfig = {
    searchConfig: {
      placeholder: "Rechercher par nom, email ou code employé...",
      searchField: "search"
    },
    selectFilters: [
      // Temporairement commenté car pas supporté par le backend
      // {
      //   key: 'contractType',
      //   label: 'Type de contrat',
      //   placeholder: 'Type de contrat',
      //   options: contractTypeOptions,
      //   allLabel: 'Tous les contrats'
      // },
      // {
      //   key: 'status',
      //   label: 'Statut',
      //   placeholder: 'Statut',
      //   options: statusOptions,
      //   allLabel: 'Tous les statuts'
      // }
    ]
  };

  // Gestionnaires d'événements
  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteDialog(true);
  };

  const handleViewEmployee = (employee) => {
    navigate(`/company/${companyId}/employees/${employee.id}`);
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;

    try {
      await employeeService.deleteEmployee(companyId, selectedEmployee.id);
      toast.success("Employé supprimé avec succès");
      pagination.reload();
      setShowDeleteDialog(false);
      setSelectedEmployee(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'employé");
    }
  };

  const onEmployeeUpdated = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
    pagination.reload();
    toast.success("Employé modifié avec succès");
  };

  // Fonction pour obtenir le badge du type de contrat
  const getContractTypeBadge = (contractType) => {
    const variants = {
      FIXED: "default",
      DAILY: "secondary",
      HONORARIUM: "outline"
    };

    const labels = {
      FIXED: "Fixe",
      DAILY: "Journalier",
      HONORARIUM: "Honoraire"
    };

    return (
      <Badge variant={variants[contractType] || "secondary"}>
        {labels[contractType] || contractType}
      </Badge>
    );
  };

  // Fonction pour formater le salaire
  const formatSalary = (employee) => {
    if (employee.contractType === 'FIXED' && employee.fixedSalary) {
      return `${new Intl.NumberFormat('fr-FR').format(employee.fixedSalary)} XOF/mois`;
    } else if (employee.contractType === 'DAILY' && employee.dailyRate) {
      return `${new Intl.NumberFormat('fr-FR').format(employee.dailyRate)} XOF/jour`;
    } else if (employee.contractType === 'HONORARIUM' && employee.hourlyRate) {
      return `${new Intl.NumberFormat('fr-FR').format(employee.hourlyRate)} XOF/heure`;
    }
    return 'Non défini';
  };

  return (
    <div className="space-y-6 ">
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
            <h1 className="text-2xl font-bold">Gestion des Employés</h1>
            <p className="text-muted-foreground">
              Gérez les employés de votre entreprise
            </p>
          </div>
        </div>

        <Button onClick={() => navigate(`/company/${companyId}/employees/create`)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Employé
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{pagination.totalItems}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {pagination.data.filter(emp => emp.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {pagination.data.filter(emp => !emp.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Inactifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(pagination.data.map(emp => emp.contractType)).size}
                </p>
                <p className="text-sm text-muted-foreground">Types de contrats</p>
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

      {/* Liste des employés */}
      {pagination.loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : pagination.isEmpty ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun employé trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {Object.values(pagination.filters).some(v => v) 
                ? "Aucun employé ne correspond aux critères de recherche."
                : "Commencez par ajouter votre premier employé."
              }
            </p>
            {!Object.values(pagination.filters).some(v => v) && (
              <Button onClick={() => navigate(`/company/${companyId}/employees/create`)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un employé
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pagination.data.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* En-tête avec photo et statut */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {employee.employeeCode}
                        </p>
                      </div>
                    </div>
                    <Badge variant={employee.isActive ? "default" : "secondary"}>
                      {employee.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>

                  {/* Informations */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{employee.position}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{employee.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {formatDate(employee.hireDate)}
                      </span>
                    </div>
                  </div>

                  {/* Type de contrat et salaire */}
                  <div className="space-y-2">
                    {getContractTypeBadge(employee.contractType)}
                    <p className="text-sm font-medium text-green-600">
                      {formatSalary(employee)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewEmployee(employee)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEmployee(employee)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEmployee(employee)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <PaginationControls 
        pagination={pagination}
        limitOptions={[8, 12, 24, 48]}
      />

      {/* Modals */}
      <EditEmployeeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        employee={selectedEmployee}
        companyId={companyId}
        onEmployeeUpdated={onEmployeeUpdated}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Supprimer l'employé"
        description={`Êtes-vous sûr de vouloir supprimer ${selectedEmployee?.firstName} ${selectedEmployee?.lastName} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
}

export default CompanyEmployeesWithPagination;