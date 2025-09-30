import React from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { LogOut, User, Building, CreditCard } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Building className="h-5 w-5" />;
      case "ADMIN":
        return <User className="h-5 w-5" />;
      case "CASHIER":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Administrateur";
      case "ADMIN":
        return "Administrateur";
      case "CASHIER":
        return "Caissier";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Gestion Salaires
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getRoleIcon(user?.role)}
                <span>
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {getRoleName(user?.role)}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h2>
          <p className="text-gray-600">
            Bienvenue, {user?.firstName}! Voici votre vue d'ensemble.
          </p>
        </div>

        {/* Informations utilisateur */}
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getRoleIcon(user?.role)}
                Informations de votre compte
              </CardTitle>
              <CardDescription>
                Détails de votre profil utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nom complet
                  </label>
                  <p className="text-lg font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Rôle
                  </label>
                  <p className="text-lg font-medium">
                    {getRoleName(user?.role)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Statut
                  </label>
                  <p className="text-lg">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Actif
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides selon le rôle */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions disponibles</CardTitle>
              <CardDescription>
                Fonctionnalités accessibles avec votre rôle{" "}
                {getRoleName(user?.role)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Actions selon le rôle */}
                {user?.role === "SUPER_ADMIN" && (
                  <>
                    <div className="p-4 border rounded-lg hover:bg-gray-50">
                      <Building className="h-8 w-8 text-blue-600 mb-2" />
                      <h3 className="font-medium mb-1">
                        Gestion des entreprises
                      </h3>
                      <p className="text-sm text-gray-600">
                        Créer et gérer les entreprises
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50">
                      <User className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-medium mb-1">
                        Gestion des utilisateurs
                      </h3>
                      <p className="text-sm text-gray-600">
                        Administrer tous les utilisateurs
                      </p>
                    </div>
                  </>
                )}

                {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
                  <>
                    <div className="p-4 border rounded-lg hover:bg-gray-50">
                      <User className="h-8 w-8 text-purple-600 mb-2" />
                      <h3 className="font-medium mb-1">Gestion des employés</h3>
                      <p className="text-sm text-gray-600">
                        Ajouter et modifier les employés
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50">
                      <CreditCard className="h-8 w-8 text-orange-600 mb-2" />
                      <h3 className="font-medium mb-1">Cycles de paie</h3>
                      <p className="text-sm text-gray-600">
                        Créer et approuver les paies
                      </p>
                    </div>
                  </>
                )}

                {(user?.role === "CASHIER" ||
                  user?.role === "ADMIN" ||
                  user?.role === "SUPER_ADMIN") && (
                  <div className="p-4 border rounded-lg hover:bg-gray-50">
                    <CreditCard className="h-8 w-8 text-red-600 mb-2" />
                    <h3 className="font-medium mb-1">Paiements</h3>
                    <p className="text-sm text-gray-600">
                      Effectuer les paiements de salaires
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
