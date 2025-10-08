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
  Users,
  DollarSign,
  User,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
} from "lucide-react";

export function EditPayRunModal({
  payRun,
  companyId,
  isOpen,
  onClose,
  onPayRunUpdated,
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

  // Charger les employés et initialiser les données quand le modal s'ouvre
  useEffect(() => {
    console.log("EditPayRunModal useEffect:", { isOpen, companyId, payRun });
    if (isOpen && companyId && payRun) {
      loadEmployees();
      initializeFormData();
    }
  }, [isOpen, companyId, payRun]);

  const initializeFormData = () => {
    console.log("Initializing form data with payRun:", payRun);
    if (payRun) {
      setFormData({
        title: payRun.title || "",
        startDate: payRun.periodStart ? payRun.periodStart.split('T')[0] : "",
        endDate: payRun.periodEnd ? payRun.periodEnd.split('T')[0] : "",
        description: payRun.description || "",
      });
      // Initialiser les employés sélectionnés si disponibles
      if (payRun.employees) {
        setSelectedEmployees(payRun.employees.map(emp => emp.id));
      }
      console.log("Form data initialized:", formData);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await employeeService.getEmployeesByCompany(companyId);
      setEmployees(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      toast.error("Erreur lors du chargement des employés");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map((emp) => emp.id));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setSelectedEmployees([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error("Veuillez sélectionner au moins un employé");
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        title: formData.title,
        periodStart: new Date(formData.startDate).toISOString(),
        periodEnd: new Date(formData.endDate).toISOString(),
        description: formData.description,
        employeeIds: selectedEmployees,
        companyId: companyId, // Ajouter le companyId aux données
      };

      await payRunService.updatePayRun(payRun.id, updateData);

      toast.success("Cycle de paie modifié avec succès");
      onPayRunUpdated();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast.error("Erreur lors de la modification du cycle de paie");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const selectedEmployeesData = employees.filter((emp) =>
    selectedEmployees.includes(emp.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit className="h-5 w-5 text-blue-600" />
            Modifier le cycle de paie
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Formulaire principal */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Titre du cycle *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="ex: Paie Janvier 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description optionnelle"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Section employés */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-base font-medium">
                    <Users className="h-4 w-4" />
                    Employés concernés
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllEmployees}
                    disabled={loadingEmployees}
                  >
                    {selectedEmployees.length === employees.length
                      ? "Tout désélectionner"
                      : "Tout sélectionner"}
                  </Button>
                </div>

                {loadingEmployees ? (
                  <div className="text-center py-8 text-gray-500">
                    Chargement des employés...
                  </div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun employé trouvé
                  </div>
                ) : (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={() =>
                            handleEmployeeToggle(employee.id)
                          }
                        />
                        <User className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.position} - {employee.email}
                          </div>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          {employee.salary?.toLocaleString()} €
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Résumé */}
            <div className="lg:col-span-1 border-l pl-6">
              <div className="sticky top-0 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Résumé
                </h3>

                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">
                      Employés sélectionnés
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {selectedEmployees.length}
                    </div>
                  </div>

                  {selectedEmployees.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600 font-medium">
                        Total estimé
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        {selectedEmployeesData
                          .reduce((sum, emp) => sum + (emp.salary || 0), 0)
                          .toLocaleString()}{" "}
                        €
                      </div>
                    </div>
                  )}
                </div>

                {selectedEmployees.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">
                        Employés sélectionnés :
                      </h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {selectedEmployeesData.map((employee) => (
                          <Badge
                            key={employee.id}
                            variant="secondary"
                            className="w-full justify-start text-xs"
                          >
                            {employee.firstName} {employee.lastName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedEmployees.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Modification...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Modifier le cycle
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}