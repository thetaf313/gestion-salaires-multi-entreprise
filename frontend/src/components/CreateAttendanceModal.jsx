import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { Calendar, Clock, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import attendanceService from "../services/attendanceService";
import { employeeService } from "../services/employeeService";

export function CreateAttendanceModal({
  isOpen,
  onClose,
  companyId,
  onAttendanceCreated,
}) {
  const [formData, setFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    status: "PRESENT",
    checkIn: "",
    checkOut: "",
    notes: "",
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Charger la liste des employés
  useEffect(() => {
    if (isOpen && companyId) {
      loadEmployees();
    }
  }, [isOpen, companyId]);

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await employeeService.getEmployeesByCompany(companyId, {
        limit: 100,
        status: "active",
      });
      setEmployees(response.employees || []);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      setError("Impossible de charger la liste des employés");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Effacer l'erreur si l'utilisateur commence à taper
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.employeeId) {
      setError("Veuillez sélectionner un employé");
      return;
    }

    if (!formData.date) {
      setError("Veuillez sélectionner une date");
      return;
    }

    // Validation des heures selon le statut
    if (formData.status === "PRESENT" || formData.status === "LATE") {
      if (!formData.checkIn) {
        setError("L'heure d'arrivée est requise pour ce statut");
        return;
      }
    }

    if (formData.checkIn && formData.checkOut) {
      const checkInTime = new Date(`${formData.date}T${formData.checkIn}`);
      const checkOutTime = new Date(`${formData.date}T${formData.checkOut}`);

      if (checkOutTime <= checkInTime) {
        setError("L'heure de départ doit être postérieure à l'heure d'arrivée");
        return;
      }
    }

    setLoading(true);

    try {
      const result = await attendanceService.createManual({
        employeeId: formData.employeeId,
        date: formData.date,
        status: formData.status,
        checkIn: formData.checkIn || null,
        checkOut: formData.checkOut || null,
        notes: formData.notes || null,
      });

      if (result.success) {
        toast.success("Pointage créé avec succès");
        onAttendanceCreated?.();
        handleClose();
      } else {
        toast.error(result.error || "Erreur lors de la création du pointage");
      }
    } catch (error) {
      console.error("Erreur lors de la création du pointage:", error);
      setError(
        error.response?.data?.message ||
          "Une erreur est survenue lors de la création du pointage"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      status: "PRESENT",
      checkIn: "",
      checkOut: "",
      notes: "",
    });
    setError("");
    onClose();
  };

  const statusOptions = [
    { value: "PRESENT", label: "Présent", color: "text-green-600" },
    { value: "LATE", label: "En retard", color: "text-orange-600" },
    { value: "ABSENT", label: "Absent", color: "text-red-600" },
    { value: "HALF_DAY", label: "Demi-journée", color: "text-blue-600" },
    { value: "VACATION", label: "Congé", color: "text-purple-600" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Nouveau Pointage
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Sélection de l'employé */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employé *</Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) => handleInputChange("employeeId", value)}
              disabled={loadingEmployees}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingEmployees
                      ? "Chargement..."
                      : "Sélectionner un employé"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        {employee.firstName} {employee.lastName}
                        <span className="text-muted-foreground ml-1">
                          ({employee.employeeCode})
                        </span>
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="pl-10"
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Heures - Conditionnel selon le statut */}
          {(formData.status === "PRESENT" ||
            formData.status === "LATE" ||
            formData.status === "HALF_DAY") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">
                  Heure d'arrivée
                  {(formData.status === "PRESENT" ||
                    formData.status === "LATE") &&
                    " *"}
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="checkIn"
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) =>
                      handleInputChange("checkIn", e.target.value)
                    }
                    className="pl-10"
                    required={
                      formData.status === "PRESENT" ||
                      formData.status === "LATE"
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">Heure de départ</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="checkOut"
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) =>
                      handleInputChange("checkOut", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Ajouter des notes sur ce pointage..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || loadingEmployees}
          >
            {loading ? "Création..." : "Créer le pointage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
