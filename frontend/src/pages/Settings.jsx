import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Shield,
  Save,
} from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Simuler une sauvegarde
    setTimeout(() => {
      setSaving(false);
      alert("Profil mis à jour avec succès !");
    }, 1000);
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const getRoleDisplay = (role) => {
    const roleConfig = {
      SUPER_ADMIN: { label: "Super Administrateur", color: "destructive" },
      ADMIN: { label: "Administrateur", color: "default" },
      CASHIER: { label: "Caissier", color: "secondary" },
    };
    return roleConfig[role] || { label: role, color: "default" };
  };

  const roleInfo = getRoleDisplay(user?.role);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">
          Gérez vos préférences et informations de profil
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profil utilisateur */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Informations du profil
                </h2>
                <p className="text-sm text-gray-600">
                  Mettez à jour vos informations personnelles
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="votre.email@example.com"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Informations du rôle */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Rôle & Permissions
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Rôle actuel</p>
                <Badge variant={roleInfo.color} className="mt-1">
                  {roleInfo.label}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600">Permissions</p>
                <div className="mt-2 space-y-1">
                  {user?.role === "SUPER_ADMIN" && (
                    <>
                      <div className="text-xs text-green-600">
                        ✓ Gestion des entreprises
                      </div>
                      <div className="text-xs text-green-600">
                        ✓ Gestion des utilisateurs
                      </div>
                      <div className="text-xs text-green-600">
                        ✓ Statistiques globales
                      </div>
                      <div className="text-xs text-green-600">
                        ✓ Administration système
                      </div>
                    </>
                  )}

                  {user?.role === "ADMIN" && (
                    <>
                      <div className="text-xs text-green-600">
                        ✓ Gestion des employés
                      </div>
                      <div className="text-xs text-green-600">
                        ✓ Gestion des paies
                      </div>
                      <div className="text-xs text-green-600">
                        ✓ Rapports d'entreprise
                      </div>
                    </>
                  )}

                  {user?.role === "CASHIER" && (
                    <>
                      <div className="text-xs text-green-600">
                        ✓ Saisie des paies
                      </div>
                      <div className="text-xs text-green-600">
                        ✓ Génération de fiches
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <SettingsIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Préférences</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Notifications email
                </span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mode sombre</span>
                <input type="checkbox" className="rounded" />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Rapports automatiques
                </span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Section sécurité */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
            <p className="text-sm text-gray-600">
              Gérez la sécurité de votre compte
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Changer le mot de passe
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Mettez à jour votre mot de passe régulièrement pour maintenir la
              sécurité
            </p>
            <Button variant="outline">Changer le mot de passe</Button>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Sessions actives</h3>
            <p className="text-sm text-gray-600 mb-4">
              Gérez les appareils connectés à votre compte
            </p>
            <Button variant="outline">Voir les sessions</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
