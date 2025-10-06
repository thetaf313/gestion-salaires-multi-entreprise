import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { employeeService } from "../services/employeeService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",

    // Informations professionnelles
    position: "",
    contractType: "",
    hireDate: "",

    // Informations salariales (selon le type de contrat)
    dailyRate: "",
    fixedSalary: "",
    hourlyRate: "",

    // Informations bancaires (optionnelles)
    bankName: "",
    accountNumber: "",

    // Statut
    isActive: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation des champs requis
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }
    if (!formData.position.trim()) {
      newErrors.position = "Le poste est requis";
    }
    if (!formData.contractType) {
      newErrors.contractType = "Le type de contrat est requis";
    }
    if (!formData.hireDate) {
      newErrors.hireDate = "La date d'embauche est requise";
    }

    // Validation de l'email (obligatoire)
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation du téléphone (obligatoire)
    if (!formData.phone) {
      newErrors.phone = "Le numéro de téléphone est requis";
    } else if (formData.phone.length < 8) {
      newErrors.phone =
        "Le numéro de téléphone doit contenir au moins 8 caractères";
    }

    // Validation selon le type de contrat
    if (formData.contractType === "DAILY" && !formData.dailyRate) {
      newErrors.dailyRate =
        "Le taux journalier est requis pour un contrat journalier";
    }
    if (formData.contractType === "FIXED" && !formData.fixedSalary) {
      newErrors.fixedSalary = "Le salaire fixe est requis pour un contrat fixe";
    }
    if (formData.contractType === "HONORARIUM" && !formData.hourlyRate) {
      newErrors.hourlyRate =
        "Le taux horaire est requis pour un contrat honoraire";
    }

    // Validation des montants
    if (formData.dailyRate && isNaN(parseFloat(formData.dailyRate))) {
      newErrors.dailyRate = "Le taux journalier doit être un nombre valide";
    }
    if (formData.fixedSalary && isNaN(parseFloat(formData.fixedSalary))) {
      newErrors.fixedSalary = "Le salaire fixe doit être un nombre valide";
    }
    if (formData.hourlyRate && isNaN(parseFloat(formData.hourlyRate))) {
      newErrors.hourlyRate = "Le taux horaire doit être un nombre valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setIsLoading(true);

    try {
      // Préparer les données pour l'API
      const employeeData = {
        ...formData,
        hireDate: new Date(formData.hireDate).toISOString(),
        // Convertir les montants en nombres
        dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
        fixedSalary: formData.fixedSalary
          ? parseFloat(formData.fixedSalary)
          : null,
        hourlyRate: formData.hourlyRate
          ? parseFloat(formData.hourlyRate)
          : null,
      };

      // Nettoyer seulement les champs optionnels vides et exclure employeeCode (généré côté backend)
      const fieldsToExclude = [
        "address",
        "bankName",
        "accountNumber",
        "employeeCode",
      ];
      fieldsToExclude.forEach((field) => {
        if (
          employeeData[field] === "" ||
          employeeData[field] === null ||
          field === "employeeCode"
        ) {
          delete employeeData[field];
        }
      });

      // S'assurer que les montants null selon le type de contrat sont supprimés
      if (
        employeeData.contractType !== "DAILY" &&
        employeeData.dailyRate === null
      ) {
        delete employeeData.dailyRate;
      }
      if (
        employeeData.contractType !== "FIXED" &&
        employeeData.fixedSalary === null
      ) {
        delete employeeData.fixedSalary;
      }
      if (
        employeeData.contractType !== "HONORARIUM" &&
        employeeData.hourlyRate === null
      ) {
        delete employeeData.hourlyRate;
      }

      console.log("🔍 Données à envoyer:", employeeData);

      const response = await employeeService.createEmployee(
        employeeData,
        companyId
      );

      if (response.success) {
        toast.success("Employé créé avec succès !");
        navigate(`/company/${companyId}/employees`);
      } else {
        toast.error(
          response.message || "Erreur lors de la création de l'employé"
        );
      }
    } catch (error) {
      console.error("❌ Erreur lors de la création:", error);

      // Gestion des erreurs de validation du backend
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Erreurs de validation détectées");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erreur lors de la création de l'employé");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const contractTypes = [
    { value: "DAILY", label: "Journalier" },
    { value: "FIXED", label: "Salaire fixe" },
    { value: "HONORARIUM", label: "Honoraire" },
  ];

  const renderSalaryFields = () => {
    switch (formData.contractType) {
      case "DAILY":
        return (
          <div className="space-y-2">
            <Label htmlFor="dailyRate">Taux journalier (FCFA) *</Label>
            <Input
              id="dailyRate"
              name="dailyRate"
              type="number"
              step="0.01"
              placeholder="Ex: 15000"
              value={formData.dailyRate}
              onChange={handleInputChange}
              className={errors.dailyRate ? "border-red-500" : ""}
            />
            {errors.dailyRate && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.dailyRate}
              </p>
            )}
          </div>
        );
      case "FIXED":
        return (
          <div className="space-y-2">
            <Label htmlFor="fixedSalary">Salaire fixe mensuel (FCFA) *</Label>
            <Input
              id="fixedSalary"
              name="fixedSalary"
              type="number"
              step="0.01"
              placeholder="Ex: 850000"
              value={formData.fixedSalary}
              onChange={handleInputChange}
              className={errors.fixedSalary ? "border-red-500" : ""}
            />
            {errors.fixedSalary && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.fixedSalary}
              </p>
            )}
          </div>
        );
      case "HONORARIUM":
        return (
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Taux horaire (FCFA) *</Label>
            <Input
              id="hourlyRate"
              name="hourlyRate"
              type="number"
              step="0.01"
              placeholder="Ex: 3000"
              value={formData.hourlyRate}
              onChange={handleInputChange}
              className={errors.hourlyRate ? "border-red-500" : ""}
            />
            {errors.hourlyRate && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.hourlyRate}
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/company/${companyId}/employees`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Créer un nouvel employé
          </h1>
          <p className="text-muted-foreground">
            Ajoutez un nouvel employé à votre entreprise
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Informations de base de l'employé</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Prénom de l'employé"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Nom de l'employé"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+228 XX XXX XX XX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Adresse complète"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.address}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations professionnelles</CardTitle>
            <CardDescription>Détails du poste et du contrat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Poste *</Label>
                <Input
                  id="position"
                  name="position"
                  placeholder="Ex: Développeur Senior"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={errors.position ? "border-red-500" : ""}
                />
                {errors.position && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.position}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractType">Type de contrat *</Label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value) =>
                    handleSelectChange("contractType", value)
                  }
                >
                  <SelectTrigger
                    className={errors.contractType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Sélectionner un type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contractType && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.contractType}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Date d'embauche *</Label>
                <Input
                  id="hireDate"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  className={errors.hireDate ? "border-red-500" : ""}
                />
                {errors.hireDate && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.hireDate}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations salariales */}
        {formData.contractType && (
          <Card>
            <CardHeader>
              <CardTitle>Informations salariales</CardTitle>
              <CardDescription>
                Détails de rémunération selon le type de contrat
              </CardDescription>
            </CardHeader>
            <CardContent>{renderSalaryFields()}</CardContent>
          </Card>
        )}

        {/* Informations bancaires */}
        <Card>
          <CardHeader>
            <CardTitle>Informations bancaires</CardTitle>
            <CardDescription>
              Informations optionnelles pour les virements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Nom de la banque</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  placeholder="Ex: UBA Sénégal"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className={errors.bankName ? "border-red-500" : ""}
                />
                {errors.bankName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.bankName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Numéro de compte</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  placeholder="Numéro de compte bancaire"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className={errors.accountNumber ? "border-red-500" : ""}
                />
                {errors.accountNumber && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.accountNumber}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/company/${companyId}/employees`)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Création...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Créer l'employé
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
