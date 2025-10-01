import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Building,
  DollarSign,
  Bell,
  Shield,
  Upload,
  Save,
  Eye,
  EyeOff,
  Users,
  Calendar,
  Mail,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function CompanySettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // États pour les différentes sections
  const [companyInfo, setCompanyInfo] = useState({
    name: "Tech Solutions SARL",
    email: "contact@techsolutions.com",
    phone: "+225 07 12 34 56 78",
    address: "Abidjan, Cocody",
    website: "www.techsolutions.com",
    logo: null,
  });

  const [payrollSettings, setPayrollSettings] = useState({
    currency: "XOF",
    paymentDay: "30",
    workingDaysPerWeek: "5",
    workingHoursPerDay: "8",
    overtimeRate: "1.5",
    socialCharges: "15.5",
    incomeTax: "progressive",
  });

  const [notifications, setNotifications] = useState({
    emailPayslips: true,
    smsReminders: false,
    paymentAlerts: true,
    reportDigest: true,
    systemUpdates: false,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordPolicy: "medium",
    apiKey: "sk_live_abc123def456ghi789...",
  });

  const handleSave = async (section) => {
    setLoading(true);
    try {
      // Simuler la sauvegarde
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`Paramètres ${section} sauvegardés avec succès !`);
    } catch (error) {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyInfo((prev) => ({
          ...prev,
          logo: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Paramètres de l'Entreprise
          </h1>
          <p className="text-muted-foreground">
            Configurez les paramètres de votre entreprise
          </p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Entreprise
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Paie
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        {/* Informations de l'entreprise */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informations de l'Entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  {companyInfo.logo ? (
                    <img
                      src={companyInfo.logo}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <Label htmlFor="logo">Logo de l'entreprise</Label>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => document.getElementById("logo").click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Changer le logo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    PNG, JPG jusqu'à 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nom de l'entreprise</Label>
                  <Input
                    id="company-name"
                    value={companyInfo.name}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-phone">Téléphone</Label>
                  <Input
                    id="company-phone"
                    value={companyInfo.phone}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-website">Site web</Label>
                  <Input
                    id="company-website"
                    value={companyInfo.website}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-address">Adresse</Label>
                <Textarea
                  id="company-address"
                  value={companyInfo.address}
                  onChange={(e) =>
                    setCompanyInfo((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <Button
                onClick={() => handleSave("entreprise")}
                disabled={loading}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de paie */}
        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Paramètres de Paie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={payrollSettings.currency}
                    onValueChange={(value) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        currency: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar US (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-day">Jour de paiement</Label>
                  <Select
                    value={payrollSettings.paymentDay}
                    onValueChange={(value) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        paymentDay: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Fin du mois (30)</SelectItem>
                      <SelectItem value="15">Mi-mois (15)</SelectItem>
                      <SelectItem value="1">Début de mois (1er)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="working-days">
                    Jours travaillés par semaine
                  </Label>
                  <Input
                    id="working-days"
                    type="number"
                    min="1"
                    max="7"
                    value={payrollSettings.workingDaysPerWeek}
                    onChange={(e) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        workingDaysPerWeek: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="working-hours">Heures par jour</Label>
                  <Input
                    id="working-hours"
                    type="number"
                    min="1"
                    max="24"
                    value={payrollSettings.workingHoursPerDay}
                    onChange={(e) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        workingHoursPerDay: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overtime-rate">
                    Taux heures supplémentaires
                  </Label>
                  <Input
                    id="overtime-rate"
                    type="number"
                    step="0.1"
                    value={payrollSettings.overtimeRate}
                    onChange={(e) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        overtimeRate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social-charges">Charges sociales (%)</Label>
                  <Input
                    id="social-charges"
                    type="number"
                    step="0.1"
                    value={payrollSettings.socialCharges}
                    onChange={(e) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        socialCharges: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="income-tax">Système d'imposition</Label>
                <Select
                  value={payrollSettings.incomeTax}
                  onValueChange={(value) =>
                    setPayrollSettings((prev) => ({
                      ...prev,
                      incomeTax: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progressive">Progressif</SelectItem>
                    <SelectItem value="flat">Taux fixe</SelectItem>
                    <SelectItem value="none">Aucun</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => handleSave("paie")}
                disabled={loading}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Préférences de Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Bulletins par email</p>
                      <p className="text-sm text-muted-foreground">
                        Envoyer automatiquement les bulletins par email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.emailPayslips}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        emailPayslips: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Rappels SMS</p>
                      <p className="text-sm text-muted-foreground">
                        Rappels de paiement par SMS
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.smsReminders}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        smsReminders: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Alertes de paiement</p>
                      <p className="text-sm text-muted-foreground">
                        Notifications pour les paiements traités
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.paymentAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        paymentAlerts: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Résumé hebdomadaire</p>
                      <p className="text-sm text-muted-foreground">
                        Rapport hebdomadaire par email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.reportDigest}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        reportDigest: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Mises à jour système</p>
                      <p className="text-sm text-muted-foreground">
                        Notifications de nouvelles fonctionnalités
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        systemUpdates: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave("notifications")}
                disabled={loading}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Paramètres de Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">
                        Authentification à deux facteurs
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sécurité renforcée pour votre compte
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSecurity((prev) => ({
                        ...prev,
                        twoFactorAuth: checked,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">
                    Délai d'expiration session (minutes)
                  </Label>
                  <Select
                    value={security.sessionTimeout}
                    onValueChange={(value) =>
                      setSecurity((prev) => ({
                        ...prev,
                        sessionTimeout: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                      <SelectItem value="120">2 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-policy">
                    Politique de mot de passe
                  </Label>
                  <Select
                    value={security.passwordPolicy}
                    onValueChange={(value) =>
                      setSecurity((prev) => ({
                        ...prev,
                        passwordPolicy: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        Faible (6 caractères min)
                      </SelectItem>
                      <SelectItem value="medium">
                        Moyen (8 caractères, majuscules)
                      </SelectItem>
                      <SelectItem value="high">
                        Élevé (12 caractères, symboles)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">Clé API</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={security.apiKey}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="outline">Régénérer</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Utilisée pour l'intégration avec des services externes
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleSave("sécurité")}
                disabled={loading}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
