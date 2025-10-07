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
import { Calendar, Clock, User, AlertCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import attendanceService from "../services/attendanceService";

export function EditAttendanceModal({
  isOpen,
  onClose,
  attendance,
  companyId,
  onAttendanceUpdated,
}) {
  const [formData, setFormData] = useState({
    date: "",
    status: "PRESENT",
    checkIn: "",
    checkOut: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialiser le formulaire avec les données du pointage
  useEffect(() => {
    if (attendance && isOpen) {
      setFormData({
        date: attendance.date
          ? new Date(attendance.date).toISOString().split("T")[0]
          : "",
        status: attendance.status || "PRESENT",
        checkIn: attendance.checkIn || "",
        checkOut: attendance.checkOut || "",
        notes: attendance.notes || "",
      });
      setError("");
    }
  }, [attendance, isOpen]);

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

    if (!attendance?.id) {
      setError("Aucun pointage sélectionné");
      return;
    }

    // Validation
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
      const result = await attendanceService.update(attendance.id, {
        date: formData.date,
        status: formData.status,
        checkIn: formData.checkIn || null,
        checkOut: formData.checkOut || null,
        notes: formData.notes || null,
      });

      if (result.success) {
        toast.success("Pointage modifié avec succès");
        onAttendanceUpdated?.();
        handleClose();
      } else {
        toast.error(result.error || "Erreur lors de la modification du pointage");
      }
    } catch (error) {
      console.error("Erreur lors de la modification du pointage:", error);
      setError(
        error.response?.data?.message ||
          "Une erreur est survenue lors de la modification du pointage"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
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

  if (!attendance) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Modifier le Pointage
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {attendance.employee?.firstName} {attendance.employee?.lastName}
            {attendance.employee?.employeeCode && (
              <span className="ml-1">({attendance.employee.employeeCode})</span>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Employé (lecture seule) */}
          <div className="space-y-2">
            <Label>Employé</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>
                {attendance.employee?.firstName} {attendance.employee?.lastName}
                {attendance.employee?.employeeCode && (
                  <span className="text-muted-foreground ml-1">
                    ({attendance.employee.employeeCode})
                  </span>
                )}
              </span>
            </div>
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

          {/* Informations sur les heures calculées */}
          {formData.checkIn && formData.checkOut && (
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="text-sm">
                <span className="font-medium">Heures calculées :</span>
                <span className="ml-2">
                  {(() => {
                    const checkInTime = new Date(
                      `${formData.date}T${formData.checkIn}`
                    );
                    const checkOutTime = new Date(
                      `${formData.date}T${formData.checkOut}`
                    );
                    const diffMs = checkOutTime - checkInTime;
                    const diffHours = diffMs / (1000 * 60 * 60);
                    return diffHours > 0
                      ? `${diffHours.toFixed(1)}h`
                      : "Invalide";
                  })()}
                </span>
              </div>
            </div>
          )}
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
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "Modification..." : "Modifier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
