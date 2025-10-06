import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import userService from "../services/userService";

export default function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
  companyId,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rechercher un employé
  const searchEmployee = async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      toast.error("Veuillez saisir au moins 2 caractères");
      return;
    }

    setSearchLoading(true);
    try {
      const response = await userService.searchEmployeeForUser(
        companyId,
        searchTerm.trim()
      );
      console.log("Réponse de la recherche d'employé:", response);
      if (response.success && response.data) {
        console.log("Données de l'employé trouvé:", response.data);
        setSelectedEmployee(response.data);
        toast.success("Employé trouvé");
      } else {
        setSelectedEmployee(null);
        toast.error(
          "Aucun employé trouvé ou l'employé a déjà un compte utilisateur"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      setSelectedEmployee(null);
      if (error.response?.status === 404) {
        toast.error(
          "Aucun employé trouvé ou l'employé a déjà un compte utilisateur"
        );
      } else {
        toast.error("Erreur lors de la recherche de l'employé");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // Créer le compte utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmployee) {
      toast.error("Veuillez d'abord rechercher et sélectionner un employé");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await userService.createUserForEmployee(
        selectedEmployee.id,
        {
          password: password,
        }
      );

      if (response.success) {
        toast.success("Compte utilisateur créé avec succès");
        onUserCreated?.();
        handleClose();
      } else {
        toast.error(response.message || "Erreur lors de la création du compte");
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la création du compte utilisateur"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fermer le modal et réinitialiser
  const handleClose = () => {
    setSearchTerm("");
    setSelectedEmployee(null);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un compte utilisateur</DialogTitle>
          <DialogDescription>
            Recherchez un employé par email ou matricule, puis créez son compte
            utilisateur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Étape 1: Recherche d'employé */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="searchTerm">
                Email ou matricule de l'employé
              </Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="searchTerm"
                  type="text"
                  placeholder="Tapez l'email ou le matricule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), searchEmployee())
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={searchEmployee}
                  disabled={searchLoading || !searchTerm.trim()}
                  className="px-3"
                >
                  {searchLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Informations de l'employé trouvé */}
            {selectedEmployee && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h4>
                    <div className="mt-2 space-y-1 text-sm text-green-700">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{selectedEmployee.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedEmployee.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{selectedEmployee.position}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>Code: {selectedEmployee.employeeCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Étape 2: Saisie du mot de passe */}
          {selectedEmployee && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Saisissez le mot de passe (min. 6 caractères)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-600">
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                !selectedEmployee ||
                !password ||
                !confirmPassword ||
                password !== confirmPassword ||
                isSubmitting
              }
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                "Créer le compte"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
