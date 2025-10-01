import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { payRunService } from "../services/payRunService";
import { employeeService } from "../services/employeeService";
import {
  Calendar,
  Plus,
  Users,
  DollarSign,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function CreatePayRunModal({
  companyId,
  isOpen,
  onClose,
  onPayRunCreated,
  trigger,
}) {
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Charger les employés quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && companyId) {
      loadEmployees();
    }
  }, [isOpen, companyId]);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await employeeService.getByCompany(companyId);
      if (response.success) {
        // Le backend retourne { employees, pagination }
        const employeesList = response.data.employees || response.data;
        const activeEmployees = employeesList.filter((emp) => emp.isActive);
        setEmployees(employeesList);
        // Présélectionner les employés actifs
        setSelectedEmployees(activeEmployees.map((emp) => emp.id));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      toast.error("Erreur lors du chargement des employés");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleAllEmployees = () => {
    const activeEmployees = employees.filter((emp) => emp.isActive);
    if (selectedEmployees.length === activeEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(activeEmployees.map((emp) => emp.id));
    }
  };

  const getEmployeeSalary = (employee) => {
    switch (employee.contractType) {
      case "DAILY":
        return employee.dailyRate || 0;
      case "FIXED":
        return employee.fixedSalary || 0;
      case "HONORARIUM":
        return employee.hourlyRate || 0;
      default:
        return (
          employee.fixedSalary || employee.dailyRate || employee.hourlyRate || 0
        );
    }
  };

  const calculateTotalAmount = () => {
    return employees
      .filter((emp) => selectedEmployees.includes(emp.id))
      .reduce((total, emp) => {
        return total + Number(getEmployeeSalary(emp));
      }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateForApi = (dateString) => {
    if (!dateString) return null;

    // Convertir la date en format ISO avec l'heure UTC pour éviter les problèmes de timezone
    const date = new Date(dateString + "T00:00:00.000Z");
    return date.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error("Le titre et les dates de début et de fin sont obligatoires");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("La date de fin doit être postérieure à la date de début");
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error("Veuillez sélectionner au moins un employé");
      return;
    }

    setLoading(true);
    try {
      const payRunData = {
        title: formData.title,
        periodStart: formatDateForApi(formData.startDate),
        periodEnd: formatDateForApi(formData.endDate),
        description: formData.description || undefined,
        employeeIds: selectedEmployees,
      };

      await payRunService.create(companyId, payRunData);
      toast.success("Cycle de paie créé avec succès");

      // Réinitialiser le formulaire
      setFormData({
        title: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      setSelectedEmployees([]);

      onPayRunCreated?.();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la création du cycle de paie"
      );
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Nouveau Cycle de Paie
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations générales</h3>

            <div className="space-y-2">
              <Label htmlFor="title">Titre du cycle *</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ex: Paie Janvier 2025"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Description du cycle de paie..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Sélection des employés */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Users className="w-5 h-5" />
                Employés concernés
              </h3>
              {employees.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleAllEmployees}
                >
                  {selectedEmployees.length ===
                  employees.filter((emp) => emp.isActive).length
                    ? "Désélectionner tout"
                    : "Sélectionner tous les actifs"}
                </Button>
              )}
            </div>

            {loadingEmployees ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <span>Chargement des employés...</span>
                </div>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-muted-foreground">Aucun employé trouvé</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedEmployees.includes(employee.id)
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() =>
                          handleEmployeeToggle(employee.id)
                        }
                      />
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                employee.isActive ? "success" : "secondary"
                              }
                            >
                              {employee.isActive ? "Actif" : "Inactif"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {employee.contractType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(getEmployeeSalary(employee))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Résumé */}
            {selectedEmployees.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">
                      {selectedEmployees.length} employé
                      {selectedEmployees.length > 1 ? "s" : ""} sélectionné
                      {selectedEmployees.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="font-bold text-lg">
                      {formatCurrency(calculateTotalAmount())}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedEmployees.length === 0}
            >
              {loading ? "Création..." : "Créer le cycle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Si un trigger est fourni, on l'encapsule dans le DialogTrigger
  if (trigger) {
    return (
      <>
        <div onClick={() => !isOpen && onClose()}>{trigger}</div>
        {modalContent}
      </>
    );
  }

  return modalContent;
}
