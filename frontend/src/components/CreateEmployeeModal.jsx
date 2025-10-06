import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  User,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  DollarSign,
} from "lucide-react";
import { employeeService } from "../services/employeeService";

export function CreateEmployeeModal({ companyId, onEmployeeCreated, trigger }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    contractType: "",
    dailyRate: "",
    fixedSalary: "",
    hourlyRate: "",
    hireDate: "",
  });

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      contractType: "",
      dailyRate: "",
      fixedSalary: "",
      hourlyRate: "",
      hireDate: "",
    });
  };

  const validateForm = () => {
    const { firstName, lastName, position, contractType, hireDate } = formData;

    if (!firstName.trim()) {
      toast.error("Le prénom est requis");
      return false;
    }

    if (!lastName.trim()) {
      toast.error("Le nom est requis");
      return false;
    }

    if (!position.trim()) {
      toast.error("Le poste est requis");
      return false;
    }

    if (!contractType) {
      toast.error("Le type de contrat est requis");
      return false;
    }

    if (!hireDate) {
      toast.error("La date d'embauche est requise");
      return false;
    }

    // Validation des salaires selon le type de contrat
    if (contractType === "DAILY" && !formData.dailyRate) {
      toast.error("Le taux journalier est requis pour un contrat journalier");
      return false;
    }

    if (contractType === "FIXED" && !formData.fixedSalary) {
      toast.error("Le salaire fixe est requis pour un contrat fixe");
      return false;
    }

    if (contractType === "HONORARIUM" && !formData.hourlyRate) {
      toast.error("Le taux horaire est requis pour un honoraire");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const employeeData = {
        ...formData,
        companyId,
        // Garder les montants comme des strings pour préserver la précision
        dailyRate: formData.dailyRate || undefined,
        fixedSalary: formData.fixedSalary || undefined,
        hourlyRate: formData.hourlyRate || undefined,
      };

      await employeeService.createEmployee(employeeData);

      toast.success("Employé créé avec succès");
      resetForm();
      setOpen(false);

      if (onEmployeeCreated) {
        onEmployeeCreated();
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la création de l'employé"
      );
    } finally {
      setLoading(false);
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
        return "";
    }
  };

  const getSalaryField = () => {
    switch (formData.contractType) {
      case "DAILY":
        return (
          <div className="space-y-2">
            <Label htmlFor="dailyRate" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Taux journalier (FCFA) *
            </Label>
            <Input
              id="dailyRate"
              type="number"
              placeholder="Ex: 15000"
              value={formData.dailyRate}
              onChange={(e) => handleInputChange("dailyRate", e.target.value)}
              min="0"
              step="100"
            />
          </div>
        );
      case "FIXED":
        return (
          <div className="space-y-2">
            <Label htmlFor="fixedSalary" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Salaire fixe mensuel (FCFA) *
            </Label>
            <Input
              id="fixedSalary"
              type="number"
              placeholder="Ex: 450000"
              value={formData.fixedSalary}
              onChange={(e) => handleInputChange("fixedSalary", e.target.value)}
              min="0"
              step="1000"
            />
          </div>
        );
      case "HONORARIUM":
        return (
          <div className="space-y-2">
            <Label htmlFor="hourlyRate" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Taux horaire (FCFA) *
            </Label>
            <Input
              id="hourlyRate"
              type="number"
              placeholder="Ex: 5000"
              value={formData.hourlyRate}
              onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
              min="0"
              step="100"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un employé
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Créer un nouvel employé
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="w-4 h-4" />
                Informations personnelles
              </h3>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    placeholder="Ex: Jean"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    placeholder="Ex: Dupont"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean.dupont@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Ex: +225 01 02 03 04 05"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Informations professionnelles
              </h3>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Poste *</Label>
                  <Input
                    id="position"
                    placeholder="Ex: Développeur, Manager, etc."
                    value={formData.position}
                    onChange={(e) =>
                      handleInputChange("position", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hireDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date d'embauche *
                  </Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) =>
                      handleInputChange("hireDate", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractType">Type de contrat *</Label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value) =>
                    handleInputChange("contractType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Journalier</SelectItem>
                    <SelectItem value="FIXED">Fixe</SelectItem>
                    <SelectItem value="HONORARIUM">Honoraire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {getSalaryField()}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer l'employé"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateEmployeeModal;
