import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Search, User, Clock, AlertCircle, CheckCircle } from "lucide-react";
import attendanceService from "../services/attendanceService";

const SmartAttendanceForm = ({ onSuccess, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employee, setEmployee] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    checkInTime: new Date().toISOString().slice(0, 16), // Format datetime-local
    checkOutTime: "",
    notes: "",
  });

  // Rechercher un employé
  const handleSearchEmployee = async () => {
    if (!searchTerm.trim()) {
      setSearchError("Veuillez saisir un code employé ou email");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setEmployee(null);

    try {
      const response = await attendanceService.searchEmployee(
        searchTerm.trim()
      );

      if (response.success) {
        setEmployee(response.data.data);
        setSearchError("");
      } else {
        setSearchError(response.error);
      }
    } catch (error) {
      setSearchError("Erreur lors de la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  // Gérer l'appui sur Entrée dans le champ de recherche
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchEmployee();
    }
  };

  // Réinitialiser la recherche
  const handleResetSearch = () => {
    setSearchTerm("");
    setEmployee(null);
    setSearchError("");
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employee) {
      setSearchError("Veuillez d'abord rechercher et sélectionner un employé");
      return;
    }

    if (!formData.checkInTime) {
      setSearchError("L'heure d'arrivée est requise");
      return;
    }

    setIsSubmitting(true);

    try {
      const attendanceData = {
        employeeId: employee.id,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime || null,
        notes: formData.notes || null,
      };

      const response = await attendanceService.createWithAutoStatus(
        attendanceData
      );

      if (response.success) {
        onSuccess && onSuccess(response.data);
      } else {
        setSearchError(response.error);
      }
    } catch (error) {
      setSearchError("Erreur lors de la création du pointage");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mettre à jour les données du formulaire
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Nouveau Pointage Intelligent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section de recherche d'employé */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Rechercher un employé</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="search"
                type="text"
                placeholder="Code employé ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                disabled={isSearching}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleSearchEmployee}
                disabled={isSearching || !searchTerm.trim()}
                size="sm"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Affichage des erreurs de recherche */}
          {searchError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}

          {/* Affichage de l'employé trouvé */}
          {employee && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </span>
                      <Badge variant="outline">{employee.employeeCode}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {employee.email} • {employee.position}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetSearch}
                  >
                    Modifier
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Formulaire de pointage (visible seulement si employé trouvé) */}
        {employee && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInTime">Heure d'arrivée *</Label>
                <Input
                  id="checkInTime"
                  type="datetime-local"
                  value={formData.checkInTime}
                  onChange={(e) =>
                    handleInputChange("checkInTime", e.target.value)
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le statut sera calculé automatiquement selon les horaires de
                  travail
                </p>
              </div>

              <div>
                <Label htmlFor="checkOutTime">Heure de sortie</Label>
                <Input
                  id="checkOutTime"
                  type="datetime-local"
                  value={formData.checkOutTime}
                  onChange={(e) =>
                    handleInputChange("checkOutTime", e.target.value)
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optionnel - peut être ajouté plus tard
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Commentaires sur le pointage..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </>
                ) : (
                  "Créer le pointage"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Message d'aide si aucun employé trouvé */}
        {!employee && !searchError && (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Recherchez un employé par son code ou son email pour commencer
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartAttendanceForm;
