import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  RotateCcw
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

export default function CompanyUsers() {
  const { companyId } = useParams();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [alertDialog, setAlertDialog] = useState({ open: false, type: '', user: null });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getCompanyUsers(companyId);
      if (response.success) {
        setUsers(response.data);
      } else {
        toast.error("Erreur lors du chargement des utilisateurs");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadUsers();
    }
  }, [companyId]);

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.employee?.employeeCode && user.employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <ShieldCheck className="h-4 w-4" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      case 'CASHIER':
        return <User className="h-4 w-4" />;
      case 'USER':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'destructive';
      case 'ADMIN':
        return 'default';
      case 'CASHIER':
        return 'secondary';
      case 'USER':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    setActionLoading(userId);
    try {
      const response = isActive 
        ? await userService.deactivateUser(userId)
        : await userService.activateUser(userId);
      
      if (response.success) {
        toast.success(`Utilisateur ${isActive ? 'désactivé' : 'réactivé'} avec succès`);
        loadUsers();
      } else {
        toast.error(`Erreur lors de la ${isActive ? 'désactivation' : 'réactivation'}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(`Erreur lors de la ${isActive ? 'désactivation' : 'réactivation'}`);
    } finally {
      setActionLoading(null);
      setAlertDialog({ open: false, type: '', user: null });
    }
  };

  const handleResetPassword = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await userService.resetUserPassword(userId);
      if (response.success) {
        toast.success(`Mot de passe réinitialisé: ${response.newPassword}`, {
          duration: 10000
        });
      } else {
        toast.error(response.message || "Erreur lors de la réinitialisation du mot de passe");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la réinitialisation du mot de passe");
    } finally {
      setActionLoading(null);
      setAlertDialog({ open: false, type: '', user: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-600 mt-1">
              Gérez les comptes utilisateurs de votre entreprise
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Créer un compte
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-gray-600">Total Utilisateurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
                  <p className="text-sm text-gray-600">Actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <EyeOff className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{users.filter(u => !u.isActive).length}</p>
                  <p className="text-sm text-gray-600">Inactifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
                  <p className="text-sm text-gray-600">Administrateurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, email ou matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Utilisateurs ({filteredUsers.length})</span>
            </CardTitle>
            <CardDescription>
              Liste des comptes utilisateurs de l'entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? "Aucun utilisateur trouvé pour cette recherche." : "Aucun utilisateur trouvé."}
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((userItem) => (
                  <div key={userItem.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          userItem.isActive ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {getRoleIcon(userItem.role)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">
                              {userItem.firstName} {userItem.lastName}
                            </h3>
                            <Badge variant={getRoleBadgeVariant(userItem.role)}>
                              {userItem.role}
                            </Badge>
                            {!userItem.isActive && (
                              <Badge variant="outline" className="text-red-600">
                                Inactif
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{userItem.email}</span>
                            </div>
                            {userItem.employee && (
                              <>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Building className="h-4 w-4" />
                                  <span>Code: {userItem.employee.employeeCode}</span>
                                  <span>• {userItem.employee.position}</span>
                                </div>
                                {userItem.employee.phone && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Phone className="h-4 w-4" />
                                    <span>{userItem.employee.phone}</span>
                                  </div>
                                )}
                              </>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Créé le {new Date(userItem.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setAlertDialog({
                            open: true,
                            type: userItem.isActive ? 'deactivate' : 'activate',
                            user: userItem
                          })}
                          disabled={actionLoading === userItem.id}
                        >
                          {actionLoading === userItem.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          ) : userItem.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Réactiver
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setAlertDialog({
                            open: true,
                            type: 'resetPassword',
                            user: userItem
                          })}
                          disabled={actionLoading === userItem.id}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={loadUsers}
        companyId={companyId}
      />

      <Dialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {alertDialog.type === 'deactivate' && "Désactiver l'utilisateur"}
              {alertDialog.type === 'activate' && "Réactiver l'utilisateur"}
              {alertDialog.type === 'resetPassword' && "Réinitialiser le mot de passe"}
            </DialogTitle>
            <DialogDescription>
              {alertDialog.type === 'deactivate' && `Êtes-vous sûr de vouloir désactiver le compte de ${alertDialog.user?.firstName} ${alertDialog.user?.lastName} ? L'utilisateur ne pourra plus se connecter.`}
              {alertDialog.type === 'activate' && `Êtes-vous sûr de vouloir réactiver le compte de ${alertDialog.user?.firstName} ${alertDialog.user?.lastName} ?`}
              {alertDialog.type === 'resetPassword' && `Êtes-vous sûr de vouloir réinitialiser le mot de passe de ${alertDialog.user?.firstName} ${alertDialog.user?.lastName} ? Un nouveau mot de passe sera généré automatiquement.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setAlertDialog({ open: false, type: '', user: null })}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (alertDialog.type === 'deactivate') {
                  handleToggleUserStatus(alertDialog.user.id, true);
                } else if (alertDialog.type === 'activate') {
                  handleToggleUserStatus(alertDialog.user.id, false);
                } else if (alertDialog.type === 'resetPassword') {
                  handleResetPassword(alertDialog.user.id);
                }
              }}
              className={alertDialog.type === 'deactivate' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {alertDialog.type === 'deactivate' && 'Désactiver'}
              {alertDialog.type === 'activate' && 'Réactiver'}
              {alertDialog.type === 'resetPassword' && 'Réinitialiser'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
