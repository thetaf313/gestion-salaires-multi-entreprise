import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Users,
  Search,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Building,
  User,
  TrendingUp,
  Eye,
} from "lucide-react";
import { employeeService } from "../services/employeeService";
import { companyService } from "../services/companyService";
import { EditEmployeeModal } from "../components/EditEmployeeModal";
import { CreateEmployeeModal } from "../components/CreateEmployeeModal";
import { useAuth } from "../contexts/AuthContext";

export function CompanyEmployees() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [contractTypeFilter, setContractTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Fonction pour appliquer les filtres et recherche
  const applyFiltersAndSearch = useCallback(async () => {
    try {
      setLoading(true);

      let filteredEmployees = [];

      // Si on a une recherche textuelle (minimum 2 caractères)
      if (searchQuery.trim() && searchQuery.trim().length >= 2) {
        const response = await employeeService.searchEmployees(
          companyId,
          searchQuery
        );
        filteredEmployees = response.data || [];
      } else {
        // Sinon, charger tous les employés
        const response = await employeeService.getEmployeesByCompany(
          companyId,
          1,
          100
        );
        filteredEmployees = response.data?.employees || [];
      }

      // Appliquer le filtre de type de contrat côté client
      if (contractTypeFilter && contractTypeFilter !== "ALL") {
        filteredEmployees = filteredEmployees.filter(
          (emp) => emp.contractType === contractTypeFilter
        );
      }

      setEmployees(filteredEmployees);
      setPage(1);
      setTotalPages(1);
    } catch (error) {
      console.error("Erreur lors de la recherche/filtrage:", error);
      toast.error("Erreur lors de la recherche/filtrage");
    } finally {
      setLoading(false);
    }
  }, [companyId, searchQuery, contractTypeFilter]);

  useEffect(() => {
    loadData();
  }, [companyId, page]);

  // Appliquer les filtres quand contractTypeFilter change
  useEffect(() => {
    if (
      contractTypeFilter === "ALL" &&
      (!searchQuery.trim() || searchQuery.trim().length < 2)
    ) {
      loadData();
    } else {
      applyFiltersAndSearch();
    }
  }, [contractTypeFilter, applyFiltersAndSearch]);

  // Appliquer la recherche avec un délai quand searchQuery change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2 || contractTypeFilter !== "ALL") {
        applyFiltersAndSearch();
      } else if (
        searchQuery.trim().length === 0 &&
        contractTypeFilter === "ALL"
      ) {
        loadData();
      }
    }, 500); // Délai de 500ms pour éviter trop de requêtes

    return () => clearTimeout(timeoutId);
  }, [searchQuery, applyFiltersAndSearch, contractTypeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les données en parallèle
      const [employeesResponse, companyResponse, statsResponse] =
        await Promise.all([
          employeeService.getEmployeesByCompany(companyId, page, 10),
          companyService.getCompanyById(companyId),
          employeeService.getEmployeeStats(companyId),
        ]);

      setEmployees(employeesResponse.data.employees);
      setTotalPages(employeesResponse.data.totalPages);
      setCompany(companyResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setContractTypeFilter("ALL");
    loadData();
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await employeeService.deleteEmployee(employeeId);
      toast.success("Employé supprimé avec succès");
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
      loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    }
  };

  const confirmDelete = (employee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  const handleViewEmployee = (employee) => {
    // Naviguer vers la page de détails de l'employé
    navigate(`/company/${companyId}/employees/${employee.id}`);
  };

  const handleEditEmployee = (employee) => {
    // Ouvrir la modal d'édition
    setSelectedEmployee(employee);
    setEditModalOpen(true);
  };

  const getContractTypeLabel = (type) => {
    switch (type) {
      case "DAILY":
        return "Journalier";
      case "FIXED":
        return "Fixe";
      case "HONORARIUM":
        return "Honoraire";
      default:
        return type;
    }
  };

  const getContractTypeBadge = (type) => {
    const variant =
      {
        DAILY: "default",
        FIXED: "secondary",
        HONORARIUM: "outline",
      }[type] || "default";

    return <Badge variant={variant}>{getContractTypeLabel(type)}</Badge>;
  };

  const getSalaryDisplay = (employee) => {
    const { contractType, dailyRate, fixedSalary, hourlyRate } = employee;

    switch (contractType) {
      case "DAILY":
        return dailyRate
          ? `${dailyRate.toLocaleString()} FCFA/jour`
          : "Non défini";
      case "FIXED":
        return fixedSalary
          ? `${fixedSalary.toLocaleString()} FCFA/mois`
          : "Non défini";
      case "HONORARIUM":
        return hourlyRate
          ? `${hourlyRate.toLocaleString()} FCFA/heure`
          : "Non défini";
      default:
        return "Non défini";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Vérifier les permissions
  const canManageEmployees =
    user &&
    (user.role === "SUPER_ADMIN" ||
      (user.role === "ADMIN" && user.companyId === companyId));

  if (loading && !employees.length) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="h-6 sm:h-8 w-48 sm:w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              Employés
            </h1>
            {company && (
              <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2">
                <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                {company.name}
              </p>
            )}
          </div>
        </div>

        {canManageEmployees && (
          <Button
            onClick={() => navigate(`/company/${companyId}/employees/create`)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Nouvel employé
          </Button>
        )}
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold truncate">
                    {stats.total || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Total employés
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold truncate">
                    {stats.active || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Actifs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl font-bold truncate">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XOF",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats.totalMonthlySalary || 0)}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Masse salariale
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recherche et Filtres */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            {/* Ligne de recherche et filtre */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, email, poste... (min. 2 caractères)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="w-full sm:w-48">
                <Select
                  value={contractTypeFilter}
                  onValueChange={(value) => {
                    setContractTypeFilter(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les types</SelectItem>
                    <SelectItem value="FIXED">Fixe</SelectItem>
                    <SelectItem value="DAILY">Journalier</SelectItem>
                    <SelectItem value="HONORARIUM">Honoraire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Boutons d'action */}
            {(searchQuery || contractTypeFilter !== "ALL") && (
              <div className="flex justify-end">
                <Button variant="outline" onClick={clearFilters} size="sm">
                  <span className="hidden sm:inline">Effacer filtres</span>
                  <span className="sm:hidden">✕</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des employés */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Employés ({employees.length})
            </CardTitle>
            {canManageEmployees && (
              <Button
                size="sm"
                onClick={() =>
                  navigate(`/company/${companyId}/employees/create`)
                }
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {employees.length > 0 ? (
            <div className="space-y-4">
              {employees.map((employee) => (
                <Card
                  key={employee.id}
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    {/* En-tête avec nom, poste et actions */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 truncate">
                              {employee.firstName} {employee.lastName}
                            </h3>
                            <p className="text-gray-600 text-sm truncate">
                              {employee.position}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID:{" "}
                              {employee.employeeCode || employee.id.slice(0, 8)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getContractTypeBadge(employee.contractType)}
                          </div>
                        </div>
                      </div>

                      {/* Actions (toujours visibles mais compactes sur mobile) */}
                      {canManageEmployees && (
                        <div className="flex gap-2 sm:flex-col sm:gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewEmployee(employee)}
                            className="flex-1 sm:flex-initial"
                          >
                            <Eye className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline text-xs">
                              Voir
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditEmployee(employee)}
                            className="flex-1 sm:flex-initial"
                          >
                            <Edit className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline text-xs">
                              Modifier
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => confirmDelete(employee)}
                            className="flex-1 sm:flex-initial"
                          >
                            <Trash2 className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline text-xs">
                              Supprimer
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Informations de contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {employee.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate text-gray-700">
                            {employee.email}
                          </span>
                        </div>
                      )}
                      {employee.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">
                            {employee.phone}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Informations financières et de date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-900">
                            {getSalaryDisplay(employee)}
                          </span>
                          <p className="text-xs text-gray-500">Rémunération</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <div>
                          <span className="text-gray-900">
                            {formatDate(employee.hireDate)}
                          </span>
                          <p className="text-xs text-gray-500">
                            Date d'embauche
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun employé trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Aucun employé ne correspond à votre recherche."
                  : "Cette entreprise n'a pas encore d'employés."}
              </p>
              {canManageEmployees && !searchQuery && (
                <CreateEmployeeModal
                  companyId={companyId}
                  onEmployeeCreated={loadData}
                  trigger={
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter le premier employé
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            size="sm"
            className="w-full sm:w-auto"
          >
            Précédent
          </Button>
          <span className="flex items-center px-4 text-sm text-center">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            size="sm"
            className="w-full sm:w-auto"
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Modals */}
      <EditEmployeeModal
        employee={selectedEmployee}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        onEmployeeUpdated={loadData}
      />

      {/* Modal de confirmation de suppression */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'employé{" "}
              <strong>
                {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </strong>{" "}
              ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedEmployee(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteEmployee(selectedEmployee?.id)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CompanyEmployees;
