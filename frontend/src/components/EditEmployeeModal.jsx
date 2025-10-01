import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { employeeService } from "../services/employeeService";
import { User } from "lucide-react";

export function EditEmployeeModal({ employee, isOpen, onClose, onEmployeeUpdated }) {
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
    address: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position: employee.position || "",
        contractType: employee.contractType || "",
        dailyRate: employee.dailyRate || "",
        fixedSalary: employee.fixedSalary || "",
        hourlyRate: employee.hourlyRate || "",
        hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : "",
        address: employee.address || "",
        isActive: employee.isActive ?? true,
      });
    }
  }, [employee]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.position || !formData.contractType) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation du salaire selon le type de contrat
    if (formData.contractType === "DAILY" && !formData.dailyRate) {
      toast.error("Le taux journalier est requis pour un contrat journalier");
      return;
    }
    if (formData.contractType === "FIXED" && !formData.fixedSalary) {
      toast.error("Le salaire fixe est requis pour un contrat fixe");
      return;
    }
    if (formData.contractType === "HONORARIUM" && !formData.hourlyRate) {
      toast.error("Le taux horaire est requis pour un honoraire");
      return;
    }

    setLoading(true);
    try {
      const updateData = { ...formData };
      
      // Convertir les valeurs numériques
      if (updateData.dailyRate) updateData.dailyRate = parseFloat(updateData.dailyRate);
      if (updateData.fixedSalary) updateData.fixedSalary = parseFloat(updateData.fixedSalary);
      if (updateData.hourlyRate) updateData.hourlyRate = parseFloat(updateData.hourlyRate);
      
      // Nettoyer les champs vides
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === "") {
          delete updateData[key];
        }
      });

      await employeeService.updateEmployee(employee.id, updateData);
      toast.success("Employé modifié avec succès");
      onEmployeeUpdated();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Modifier l'employé
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Prénom"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Nom"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+225 01 02 03 04 05"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Adresse complète"
                />
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations professionnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Poste *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  placeholder="Développeur, Comptable, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractType">Type de contrat *</Label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value) => handleInputChange("contractType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Journalier</SelectItem>
                    <SelectItem value="FIXED">Fixe</SelectItem>
                    <SelectItem value="HONORARIUM">Honoraire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Date d'embauche *</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange("hireDate", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Statut</Label>
                <Select
                  value={formData.isActive.toString()}
                  onValueChange={(value) => handleInputChange("isActive", value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Statut de l'employé" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rémunération selon le type de contrat */}
              {formData.contractType === "DAILY" && (
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Taux journalier (FCFA) *</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    value={formData.dailyRate}
                    onChange={(e) => handleInputChange("dailyRate", e.target.value)}
                    placeholder="25000"
                    min="0"
                    required
                  />
                </div>
              )}

              {formData.contractType === "FIXED" && (
                <div className="space-y-2">
                  <Label htmlFor="fixedSalary">Salaire fixe (FCFA) *</Label>
                  <Input
                    id="fixedSalary"
                    type="number"
                    value={formData.fixedSalary}
                    onChange={(e) => handleInputChange("fixedSalary", e.target.value)}
                    placeholder="500000"
                    min="0"
                    required
                  />
                </div>
              )}

              {formData.contractType === "HONORARIUM" && (
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Taux horaire (FCFA) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                    placeholder="5000"
                    min="0"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Modification..." : "Modifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}