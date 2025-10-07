import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Edit,
  Trash2,
  UserCheck,
  FileText,
  Clock,
} from "lucide-react";
import { employeeService } from "../services/employeeService";
import { useAuth } from "../contexts/AuthContext";
import { EditEmployeeModal } from "../components/EditEmployeeModal";

const EmployeeDetails = () => {
  const { employeeId, companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Vérifier les permissions
  const canManageEmployees =
    user?.role === "SUPER_ADMIN" ||
    (user?.role === "ADMIN" && user?.companyId === companyId);

  useEffect(() => {
    loadEmployeeDetails();
  }, [employeeId]);

  const loadEmployeeDetails = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployeeById(employeeId);
      setEmployee(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      toast.error("Erreur lors du chargement des détails de l'employé");
      // Rediriger vers la liste si l'employé n'existe pas
      navigate(`/company/${companyId}/employees`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      await employeeService.deleteEmployee(employeeId);
      toast.success("Employé supprimé avec succès");
      navigate(`/company/${companyId}/employees`);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'employé");
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
    const variants = {
      DAILY: "default",
      FIXED: "secondary",
      HONORARIUM: "outline",
    };

    return (
      <Badge variant={variants[type] || "default"}>
        {getContractTypeLabel(type)}
      </Badge>
    );
  };

  const getSalaryDisplay = (employee) => {
    if (employee.contractType === "DAILY" && employee.dailyRate) {
      return `${employee.dailyRate.toLocaleString()} F CFA/jour`;
    } else if (employee.contractType === "HONORARIUM" && employee.hourlyRate) {
      return `${employee.hourlyRate.toLocaleString()} F CFA/heure`;
    } else if (employee.fixedSalary) {
      return `${employee.fixedSalary.toLocaleString()} F CFA/mois`;
    }
    return "Non défini";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/company/${companyId}/employees`)}>
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

  if (!employee) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/company/${companyId}/employees`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">Employé non trouvé</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/company/${companyId}/employees`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2">
              <Building className="w-3 h-3 sm:w-4 sm:h-4" />
              {employee.company?.name}
            </p>
          </div>
        </div>

        {canManageEmployees && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        )}
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Prénom
                </label>
                <p className="text-gray-900">{employee.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Nom</label>
                <p className="text-gray-900">{employee.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <p className="text-gray-900">
                    {employee.email || "Non défini"}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Téléphone
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  <p className="text-gray-900">
                    {employee.phone || "Non défini"}
                  </p>
                </div>
              </div>
            </div>

            {employee.address && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Adresse
                </label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-900">{employee.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statut et informations rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Statut
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Type de contrat
              </label>
              <div className="mt-1">
                {getContractTypeBadge(employee.contractType)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Code employé
              </label>
              <p className="text-gray-900 font-mono text-sm">
                {employee.employeeCode || employee.id.slice(0, 8)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Statut
              </label>
              <div className="mt-1">
                <Badge variant={employee.isActive ? "default" : "secondary"}>
                  {employee.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>

            {employee.user && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Compte utilisateur
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <UserCheck className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-900">
                    {employee.user.role} - {employee.user.email}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informations professionnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Informations professionnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Poste</label>
              <p className="text-gray-900 font-medium">{employee.position}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Date d'embauche
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <p className="text-gray-900">{formatDate(employee.hireDate)}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Rémunération
              </label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <p className="text-gray-900 font-medium">
                  {getSalaryDisplay(employee)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Créé le
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-gray-900">
                  {formatDate(employee.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Voir les fiches de paie
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Historique de présence
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Créer un compte utilisateur
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <EditEmployeeModal
        employee={employee}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onEmployeeUpdated={loadEmployeeDetails}
      />

      {/* Modal de confirmation de suppression */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirmer la suppression</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir supprimer l'employé{" "}
                <strong>
                  {employee.firstName} {employee.lastName}
                </strong>{" "}
                ? Cette action désactivera le compte de l'employé.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteEmployee}>
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
