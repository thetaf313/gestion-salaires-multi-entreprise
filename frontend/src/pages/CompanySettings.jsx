import React, { useState, useEffect, useRef } from "react";
import { companyService } from "../services/companyService";
import userService from "../services/userService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Building2,
  Camera,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Check,
  X,
  User,
  Settings,
  Palette,
} from "lucide-react";

const CompanySettings = () => {
  const { user } = useAuth();
  const { companyTheme, predefinedThemes, saveCompanyTheme, loading: themeLoading } = useTheme();
  const [activeTab, setActiveTab] = useState("company");
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    currency: "XOF",
    payPeriodType: "MONTHLY",
    themeType: "default",
    themePreset: "",
    primaryColor: "",
    secondaryColor: "",
  });
  const [userFormData, setUserFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCompanyData();
    fetchUserData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await companyService.getMyCompany();
      
      // Les vraies données sont dans response.data
      const data = response.data;
      setCompany(data);
      setFormData({
        name: data.name || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        currency: data.currency || "XOF",
        payPeriodType: data.payPeriodType || "MONTHLY",
        themeType: data.themeType || "default",
        themePreset: data.themePreset || "",
        primaryColor: data.primaryColor || "",
        secondaryColor: data.secondaryColor || "",
      });
    } catch (error) {
      toast.error("Erreur lors du chargement des données de l'entreprise");
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      if (user) {
        setUserFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données utilisateur:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUserInputChange = (field, value) => {
    setUserFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await companyService.updateMyCompany(formData);
      // Les données mises à jour sont dans response.data
      const updatedCompany = response.data;
      setCompany(updatedCompany);
      toast.success("Informations de l'entreprise mises à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour des informations");
      console.error("Erreur:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUserSave = async () => {
    try {
      setSaving(true);
      
      // Validation du mot de passe si fourni
      if (userFormData.newPassword) {
        if (!userFormData.currentPassword) {
          toast.error("Veuillez saisir votre mot de passe actuel");
          return;
        }
        if (userFormData.newPassword !== userFormData.confirmPassword) {
          toast.error("Les nouveaux mots de passe ne correspondent pas");
          return;
        }
        if (userFormData.newPassword.length < 6) {
          toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères");
          return;
        }
      }

      // Préparer les données à envoyer
      const updateData = {
        firstName: userFormData.firstName,
        lastName: userFormData.lastName,
        email: userFormData.email,
      };

      // Ajouter les mots de passe si fournis
      if (userFormData.newPassword) {
        updateData.currentPassword = userFormData.currentPassword;
        updateData.newPassword = userFormData.newPassword;
      }

      await userService.updateProfile(updateData);
      
      // Réinitialiser les champs de mot de passe
      setUserFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      
      toast.success("Profil utilisateur mis à jour avec succès");
    } catch (error) {
      toast.error(error.message || "Erreur lors de la mise à jour du profil");
      console.error("Erreur:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner un fichier image");
      return;
    }

    // Vérification de la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (5MB maximum)");
      return;
    }

    try {
      setUploading(true);
      const response = await companyService.uploadLogo(file);
      // Les données sont dans response.data
      setCompany((prev) => ({
        ...prev,
        logo: response.data.logoUrl,
      }));
      toast.success("Logo mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'upload du logo");
      console.error("Erreur:", error);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name) => {
    if (!name) return "E";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non défini";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Paramètres
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez les paramètres de votre entreprise et de votre profil utilisateur
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Entreprise
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Thème
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil utilisateur
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <div className="grid gap-6">
        {/* Section Logo et informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Profil de l'entreprise
            </CardTitle>
            <CardDescription>
              Logo et informations principales de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={company?.logo} alt={company?.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(company?.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={triggerFileUpload}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{company?.name}</h3>
                <p className="text-gray-600 text-sm">
                  {uploading
                    ? "Upload en cours..."
                    : "Cliquez sur l'icône pour modifier le logo"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={company?.isActive ? "default" : "secondary"}>
                    {company?.isActive ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Actif
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Inactif
                      </>
                    )}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Créé le {formatDate(company?.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nom de votre entreprise"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@entreprise.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+221 XX XXX XXXX"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger>
                    <CreditCard className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XOF">XOF (Franc CFA)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="USD">USD (Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Adresse complète de l'entreprise"
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Paramètres de paie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Paramètres de paie
            </CardTitle>
            <CardDescription>
              Configuration des cycles de paie et paramètres financiers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payPeriodType">Périodicité de paie</Label>
                <Select
                  value={formData.payPeriodType}
                  onValueChange={(value) =>
                    handleInputChange("payPeriodType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Journalier</SelectItem>
                    <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                    <SelectItem value="MONTHLY">Mensuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Devise d'affichage</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {formData.currency}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {formData.currency === "XOF"
                      ? "Franc CFA"
                      : formData.currency === "EUR"
                      ? "Euro"
                      : "Dollar américain"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={fetchCompanyData}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="min-w-[100px]"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
          </div>
        </TabsContent>

        <TabsContent value="theme" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Thème et apparence
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de votre interface avec des thèmes prédéfinis ou créez votre propre style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type de thème */}
              <div className="space-y-4">
                <Label>Type de thème</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange("themeType", "default")}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.themeType === "default"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">Défaut</div>
                    <div className="text-sm text-gray-600">Thème standard de l'application</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleInputChange("themeType", "preset")}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.themeType === "preset"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">Thème prédéfini</div>
                    <div className="text-sm text-gray-600">Choisissez parmi nos thèmes</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleInputChange("themeType", "custom")}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.themeType === "custom"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">Personnalisé</div>
                    <div className="text-sm text-gray-600">Créez votre propre thème</div>
                  </button>
                </div>
              </div>

              {/* Thèmes prédéfinis */}
              {formData.themeType === "preset" && (
                <div className="space-y-4">
                  <Label>Thèmes prédéfinis</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(predefinedThemes).map(([key, theme]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleInputChange("themePreset", key)}
                        className={`p-4 border rounded-lg text-center transition-all hover:scale-105 ${
                          formData.themePreset === key
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div 
                          className="w-full h-6 rounded-md mb-2 flex"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                          }}
                        />
                        <div className="text-sm font-medium">{theme.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Couleurs personnalisées */}
              {formData.themeType === "custom" && (
                <div className="space-y-4">
                  <Label>Couleurs personnalisées</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Couleur primaire</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="primaryColor"
                          value={formData.primaryColor || "#3b82f6"}
                          onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                          className="w-12 h-10 rounded border border-gray-300"
                        />
                        <Input
                          value={formData.primaryColor || "#3b82f6"}
                          onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="secondaryColor"
                          value={formData.secondaryColor || "#1e40af"}
                          onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                          className="w-12 h-10 rounded border border-gray-300"
                        />
                        <Input
                          value={formData.secondaryColor || "#1e40af"}
                          onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                          placeholder="#1e40af"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Aperçu du thème personnalisé */}
                  <div className="space-y-2">
                    <Label>Aperçu</Label>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg shadow-md"
                          style={{ backgroundColor: formData.primaryColor || "#3b82f6" }}
                        />
                        <div 
                          className="w-16 h-16 rounded-lg shadow-md"
                          style={{ backgroundColor: formData.secondaryColor || "#1e40af" }}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Aperçu du thème</div>
                          <div className="text-xs text-gray-600">
                            Primaire: {formData.primaryColor || "#3b82f6"} • 
                            Secondaire: {formData.secondaryColor || "#1e40af"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons d'action pour le thème */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset du thème aux valeurs de l'entreprise
                    setFormData(prev => ({
                      ...prev,
                      themeType: company?.themeType || "default",
                      themePreset: company?.themePreset || "",
                      primaryColor: company?.primaryColor || "",
                      secondaryColor: company?.secondaryColor || "",
                    }));
                  }}
                  disabled={saving || themeLoading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={async () => {
                    const themeData = {
                      themeType: formData.themeType,
                      themePreset: formData.themePreset,
                      primaryColor: formData.primaryColor,
                      secondaryColor: formData.secondaryColor,
                    };
                    
                    const result = await saveCompanyTheme(themeData);
                    if (result?.success) {
                      toast.success("Thème mis à jour avec succès");
                      // Mettre à jour les données de l'entreprise
                      setCompany(prev => ({ ...prev, ...themeData }));
                    } else {
                      toast.error("Erreur lors de la mise à jour du thème");
                    }
                  }}
                  disabled={saving || themeLoading}
                  className="min-w-[140px]"
                >
                  {saving || themeLoading ? "Application..." : "Appliquer le thème"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Modifiez vos informations personnelles et votre mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={userFormData.firstName}
                    onChange={(e) => handleUserInputChange("firstName", e.target.value)}
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={userFormData.lastName}
                    onChange={(e) => handleUserInputChange("lastName", e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => handleUserInputChange("email", e.target.value)}
                  placeholder="votre.email@exemple.com"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Changer le mot de passe</h3>
                <p className="text-sm text-gray-600">
                  Laissez vide si vous ne souhaitez pas changer votre mot de passe
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={userFormData.currentPassword}
                    onChange={(e) => handleUserInputChange("currentPassword", e.target.value)}
                    placeholder="Votre mot de passe actuel"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={userFormData.newPassword}
                      onChange={(e) => handleUserInputChange("newPassword", e.target.value)}
                      placeholder="Nouveau mot de passe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={userFormData.confirmPassword}
                      onChange={(e) => handleUserInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirmer le nouveau mot de passe"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUserFormData({
                      firstName: user?.firstName || "",
                      lastName: user?.lastName || "",
                      email: user?.email || "",
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUserSave}
                  disabled={saving}
                  className="min-w-[100px]"
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanySettings;
