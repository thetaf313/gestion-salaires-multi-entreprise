import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  Calendar,
  DollarSign,
  User,
  Building,
  MapPin,
  Hash,
} from "lucide-react";

export function EmployeeDetailsModal({ employee, isOpen, onClose }) {
  if (!employee) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Détails de l'employé
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">
                  {employee.firstName} {employee.lastName}
                </p>
              </div>

              {employee.email && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {employee.email}
                  </p>
                </div>
              )}

              {employee.phone && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {employee.phone}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Code employé</p>
                <p className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  {employee.employeeCode || employee.id.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Informations professionnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Poste</p>
                <p className="font-medium">{employee.position}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Type de contrat</p>
                <div>{getContractTypeBadge(employee.contractType)}</div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Date d'embauche</p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {formatDate(employee.hireDate)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Rémunération</p>
                <p className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-medium">
                    {getSalaryDisplay(employee)}
                  </span>
                </p>
              </div>

              {employee.address && (
                <div className="space-y-2 col-span-2">
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {employee.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informations système */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations système</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Statut</p>
                <Badge variant={employee.isActive ? "success" : "destructive"}>
                  {employee.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Date de création
                </p>
                <p className="text-sm">{formatDate(employee.createdAt)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Dernière modification
                </p>
                <p className="text-sm">{formatDate(employee.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
