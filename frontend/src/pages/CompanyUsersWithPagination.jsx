import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApiPagination } from "../hooks/useApiPagination";
import { FilterControls } from "../components/ui/FilterControls";
import { PaginationControls } from "../components/ui/PaginationControls";
import { adaptPaginationResponse, logPaginationResponse } from "../utils/paginationAdapter";
import {
  UserPlus,
  Search,
  Users,
  Shield,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Eye,
  EyeOff,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import userService from "../services/userService";
import CreateUserModal from "../components/CreateUserModal";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/dateUtils";

export default function CompanyUsersWithPagination() {
  const { companyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // États des modals et actions
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    type: "",
    user: null,
  });

  // Configuration de l'API avec pagination
  const apiFunction = useCallback(async (params) => {
    if (!companyId) {
      return { data: [], total: 0, totalPages: 0 };
    }

    try {
      const result = await userService.getCompanyUsersPaginated(companyId, params);
      logPaginationResponse(result, 'UserService');
      return adaptPaginationResponse(result, params);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }, [companyId]);

  const pagination = useApiPagination({
    apiFunction,
    dependencies: [], // Pas besoin de companyId car apiFunction est mémorisé
    defaultFilters: {
      search: '',
      role: '',
      status: 'active'
    },
    defaultLimit: 12,
    onError: (error) => {
      toast.error("Erreur lors du chargement des utilisateurs");
    }
  });

  // Configuration des filtres
  const roleOptions = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'EMPLOYEE', label: 'Employé' },
    { value: 'MANAGER', label: 'Manager' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Actifs' },
    { value: 'inactive', label: 'Inactifs' }
  ];

  const filterConfig = {
    searchConfig: {
      placeholder: "Rechercher par nom, email...",
      searchField: "search"
    },
    selectFilters: [
      {
        key: 'role',
        label: 'Rôle',
        placeholder: 'Rôle',
        options: roleOptions,
        allLabel: 'Tous les rôles'
      },
      {
        key: 'status',
        label: 'Statut',
        placeholder: 'Statut',
        options: statusOptions,
        allLabel: 'Tous les statuts'
      }
    ]
  };

  // Gestionnaires d'événements
  const handleToggleStatus = async (userToUpdate) => {
    setActionLoading(userToUpdate.id);
    try {
      const action = userToUpdate.isActive ? 'deactivate' : 'activate';
      await userService[`${action}User`](userToUpdate.id);
      
      toast.success(
        `Utilisateur ${userToUpdate.isActive ? 'désactivé' : 'activé'} avec succès`
      );
      pagination.reload();
    } catch (error) {
      toast.error(`Erreur lors de la ${userToUpdate.isActive ? 'désactivation' : 'activation'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userToReset) => {
    setActionLoading(userToReset.id);
    try {
      await userService.resetUserPassword(userToReset.id);
      toast.success("Mot de passe réinitialisé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la réinitialisation du mot de passe");
    } finally {
      setActionLoading(null);
    }
  };

  const onUserCreated = () => {
    setIsCreateModalOpen(false);
    pagination.reload();
    toast.success("Utilisateur créé avec succès");
  };

  // Fonction pour obtenir le badge de rôle
  const getRoleBadge = (role) => {
    const roleConfig = {
      SUPER_ADMIN: { label: "Super Admin", variant: "destructive", icon: ShieldCheck },
      ADMIN: { label: "Admin", variant: "default", icon: Shield },
      EMPLOYEE: { label: "Employé", variant: "secondary", icon: User },
      MANAGER: { label: "Manager", variant: "outline", icon: Users },
    };

    const config = roleConfig[role] || roleConfig.EMPLOYEE;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/company/${companyId}/dashboard`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground">
              Gérez les comptes utilisateurs de votre entreprise
            </p>
          </div>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{pagination.totalItems}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {pagination.data.filter(u => u.role === 'ADMIN').length}
                </p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {pagination.data.filter(u => u.role === 'EMPLOYEE').length}
                </p>
                <p className="text-sm text-muted-foreground">Employés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {pagination.data.filter(u => u.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles de filtrage */}
      <FilterControls
        pagination={pagination}
        {...filterConfig}
      />

      {/* Liste des utilisateurs */}
      {pagination.loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : pagination.data.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {Object.values(pagination.filters).some(v => v) 
                ? "Aucun utilisateur ne correspond aux critères de recherche."
                : "Commencez par ajouter votre premier utilisateur."
              }
            </p>
            {!Object.values(pagination.filters).some(v => v) && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter un utilisateur
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagination.data.map((userData) => (
            <Card key={userData.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header avec nom et statut */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {userData.firstName} {userData.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleBadge(userData.role)}
                        <Badge variant={userData.isActive ? "default" : "secondary"}>
                          {userData.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Informations de contact */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{userData.email}</span>
                    </div>
                    {userData.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{userData.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Créé le {formatDate(userData.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(userData)}
                      disabled={actionLoading === userData.id}
                      className="flex-1"
                    >
                      {userData.isActive ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Activer
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetPassword(userData)}
                      disabled={actionLoading === userData.id}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contrôles de pagination */}
      <PaginationControls
        pagination={pagination}
        limitOptions={[8, 12, 24, 48]}
      />

      {/* Modal de création d'utilisateur */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        companyId={companyId}
        onUserCreated={onUserCreated}
      />

      {/* Dialog de confirmation (si nécessaire) */}
      <Dialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog({...alertDialog, open})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'action</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir effectuer cette action ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAlertDialog({...alertDialog, open: false})}
            >
              Annuler
            </Button>
            <Button onClick={() => setAlertDialog({...alertDialog, open: false})}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}