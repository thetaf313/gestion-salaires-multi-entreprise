import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "lucide-react";
import { employeeService } from "../services/employeeService";
import { companyService } from "../services/companyService";
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [companyId, page]);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const response = await employeeService.searchEmployees(
        companyId,
        searchQuery
      );
      setEmployees(response.data);
      setPage(1);
      setTotalPages(1);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error("Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      return;
    }

    try {
      await employeeService.deleteEmployee(employeeId);
      toast.success("Employé supprimé avec succès");
      loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    }
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
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Employés
            </h1>
            {company && (
              <p className="text-muted-foreground flex items-center gap-2">
                <Building className="w-4 h-4" />
                {company.name}
              </p>
            )}
          </div>
        </div>

        {canManageEmployees && (
          <CreateEmployeeModal
            companyId={companyId}
            onEmployeeCreated={loadData}
          />
        )}
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                  <p className="text-sm text-muted-foreground">
                    Total employés
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.contractTypeBreakdown?.DAILY || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Journaliers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.contractTypeBreakdown?.FIXED || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Fixes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.contractTypeBreakdown?.HONORARIUM || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Honoraires</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, email, poste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  loadData();
                }}
              >
                Effacer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des employés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Employés ({employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Contrat</TableHead>
                    <TableHead>Rémunération</TableHead>
                    <TableHead>Embauche</TableHead>
                    {canManageEmployees && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID:{" "}
                            {employee.employeeCode || employee.id.slice(0, 8)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {employee.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {employee.email}
                            </div>
                          )}
                          {employee.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {employee.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        {getContractTypeBadge(employee.contractType)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          <span className="text-sm font-medium">
                            {getSalaryDisplay(employee)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {formatDate(employee.hireDate)}
                        </div>
                      </TableCell>
                      {canManageEmployees && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteEmployee(employee.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}

export default CompanyEmployees;
