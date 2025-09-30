import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Building2,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des statistiques
    setTimeout(() => {
      setStats({
        totalCompanies: 12,
        totalEmployees: 245,
        totalPayslips: 1567,
        monthlyPayroll: 125000,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Bonsoir";
    if (hour < 12) greeting = "Bonjour";
    else if (hour < 18) greeting = "Bon après-midi";

    return `${greeting}, ${user?.firstName} !`;
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getWelcomeMessage()}
          </h1>
          <p className="text-gray-600 mt-1">
            Voici un aperçu de votre plateforme de gestion des salaires
          </p>
        </div>
        <Badge variant={roleInfo.color} className="mt-2 sm:mt-0">
          {roleInfo.label}
        </Badge>
      </div>

      {/* Statistiques principales - Affichage conditionnel selon le rôle */}
      {user?.role === "SUPER_ADMIN" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Entreprises
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalCompanies || 0}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+2.5%</span>
              <span className="text-gray-500 ml-1">ce mois</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Employés
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalEmployees || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+5.2%</span>
              <span className="text-gray-500 ml-1">ce mois</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Masse Salariale
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(stats?.monthlyPayroll || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+3.1%</span>
              <span className="text-gray-500 ml-1">ce mois</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Fiches de Paie
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalPayslips || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.7%</span>
              <span className="text-gray-500 ml-1">ce mois</span>
            </div>
          </Card>
        </div>
      )}

      {/* Vue simplifiée pour les autres rôles */}
      {user?.role !== "SUPER_ADMIN" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Employés Actifs
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === "ADMIN" ? "35" : "12"}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Fiches ce Mois
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === "ADMIN" ? "35" : "12"}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Actions rapides */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actions Rapides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.role === "SUPER_ADMIN" && (
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Building2 className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Nouvelle Entreprise</h4>
              <p className="text-sm text-gray-600">
                Ajouter une nouvelle entreprise
              </p>
            </div>
          )}

          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <Users className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Nouvel Employé</h4>
            <p className="text-sm text-gray-600">Ajouter un nouvel employé</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <FileText className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Générer Paie</h4>
            <p className="text-sm text-gray-600">
              Lancer la génération des fiches
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
