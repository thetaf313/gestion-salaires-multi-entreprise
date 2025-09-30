import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  MoreVertical,
} from "lucide-react";
import CreateUserModal from "../components/CreateUserModal";
import { authService } from "../services/auth.service";

const CompanyUsers = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);

  // Charger les utilisateurs de l'entreprise
  const loadUsers = async () => {
    try {
      setLoading(true);
      // TODO: Implémenter l'endpoint pour récupérer les utilisateurs d'une entreprise
      // Pour l'instant, on simule
      const mockUsers = [
        {
          id: 1,
          firstName: "Marie",
          lastName: "Dubois",
          email: "marie.dubois@example.com",
          role: "ADMIN",
          createdAt: "2024-01-15",
          isActive: true,
        },
        {
          id: 2,
          firstName: "Pierre",
          lastName: "Martin",
          email: "pierre.martin@example.com",
          role: "CASHIER",
          createdAt: "2024-01-10",
          isActive: true,
        },
        {
          id: 3,
          firstName: "Sophie",
          lastName: "Bernard",
          email: "sophie.bernard@example.com",
          role: "CASHIER",
          createdAt: "2024-01-05",
          isActive: false,
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // TODO: Charger aussi les infos de l'entreprise
    setCompanyInfo({ name: "Entreprise Test" });
  }, [companyId]);

  // Filtrer les utilisateurs par terme de recherche
  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques
  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    cashiers: users.filter((u) => u.role === "CASHIER").length,
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      ADMIN: { label: "Administrateur", color: "bg-blue-100 text-blue-800" },
      CASHIER: { label: "Caissier", color: "bg-green-100 text-green-800" },
      SUPER_ADMIN: {
        label: "Super Admin",
        color: "bg-purple-100 text-purple-800",
      },
    };

    const config = roleConfig[role] || {
      label: role,
      color: "bg-gray-100 text-gray-800",
    };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleUserCreated = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
    loadUsers(); // Recharger pour être sûr
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/company/${companyId}/dashboard`)}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
            <p className="text-gray-600">
              {companyInfo?.name} • {stats.total} utilisateur
              {stats.total > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={16} className="mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-gray-600">Actifs</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <UserX className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{stats.inactive}</p>
              <p className="text-sm text-gray-600">Inactifs</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">A</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">C</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.cashiers}</p>
              <p className="text-sm text-gray-600">Caissiers</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Liste des utilisateurs */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Liste des utilisateurs</h3>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "Aucun utilisateur trouvé"
                  : "Aucun utilisateur dans cette entreprise"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Mail size={14} />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>
                            Créé le{" "}
                            {new Date(user.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getRoleBadge(user.role)}
                    <Badge
                      className={
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {user.isActive ? "Actif" : "Inactif"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de création */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleUserCreated}
        companyId={companyId}
      />
    </div>
  );
};

export default CompanyUsers;
