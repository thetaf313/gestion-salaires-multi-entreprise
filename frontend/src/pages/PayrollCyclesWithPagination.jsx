import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useApiPagination } from "../hooks/useApiPagination";
import { FilterControls } from "../components/ui/FilterControls";
import { PaginationControls } from "../components/ui/PaginationControls";
import {
  Plus,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { payRunService } from "../services/payRunService";
import { adaptPaginationResponse, logPaginationResponse } from "../utils/paginationAdapter";
import { CreatePayRunModal } from "../components/CreatePayRunModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { formatPeriod } from "../utils/dateUtils";

export function PayrollCyclesWithPagination() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // États des modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPayrun, setSelectedPayrun] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Configuration de l'API avec pagination
  const apiFunction = useCallback(async (params) => {
    if (!companyId) {
      return { data: [], total: 0, totalPages: 0 };
    }

    try {
      const result = await payRunService.getByCompany(companyId, params);
      logPaginationResponse(result, 'PayRunService');
      return adaptPaginationResponse(result, params);
    } catch (error) {
      console.error('Erreur lors de la récupération des cycles de paie:', error);
      throw error;
    }
  }, [companyId]);

  const pagination = useApiPagination({
    apiFunction,
    dependencies: [], // Pas besoin de companyId car apiFunction est mémorisé
    defaultFilters: {
      search: '',
      status: '',
      year: new Date().getFullYear().toString(),
      month: ''
    },
    defaultLimit: 10,
    onError: (error) => {
      toast.error("Erreur lors du chargement des cycles de paie");
    }
  });

  // Configuration des filtres
  const statusOptions = [
    { value: 'PENDING', label: 'En attente' },
    { value: 'APPROVED', label: 'Approuvé' },
    { value: 'PAID', label: 'Payé' },
    { value: 'CANCELLED', label: 'Annulé' }
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const monthOptions = [
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  const filterConfig = {
    searchConfig: {
      placeholder: "Rechercher par nom du cycle...",
      searchField: "search"
    },
    selectFilters: [
      {
        key: 'status',
        label: 'Statut',
        placeholder: 'Statut',
        options: statusOptions,
        allLabel: 'Tous les statuts'
      },
      {
        key: 'year',
        label: 'Année',
        placeholder: 'Année',
        options: yearOptions,
        allLabel: 'Toutes les années'
      },
      {
        key: 'month',
        label: 'Mois',
        placeholder: 'Mois',
        options: monthOptions,
        allLabel: 'Tous les mois'
      }
    ]
  };

  // Gestionnaires d'événements
  const handleCreatePayrun = () => {
    setShowCreateModal(true);
  };

  const handleViewPayrun = (payrun) => {
    navigate(`/company/${companyId}/payroll/${payrun.id}/payslips`);
  };

  const handleDeletePayrun = (payrun) => {
    setSelectedPayrun(payrun);
    setShowDeleteDialog(true);
  };

  const handleApprovePayrun = async (payrun) => {
    if (payrun.status !== 'PENDING') {
      toast.error("Seuls les cycles en attente peuvent être approuvés");
      return;
    }

    setApprovalLoading(true);
    try {
      await payRunService.approve(companyId, payrun.id);
      toast.success("Cycle de paie approuvé avec succès");
      pagination.reload();
    } catch (error) {
      toast.error("Erreur lors de l'approbation du cycle");
    } finally {
      setApprovalLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPayrun) return;

    try {
      await payRunService.delete(companyId, selectedPayrun.id);
      toast.success("Cycle de paie supprimé avec succès");
      pagination.reload();
      setShowDeleteDialog(false);
      setSelectedPayrun(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression du cycle");
    }
  };

  const onPayrunCreated = () => {
    setShowCreateModal(false);
    pagination.reload();
    toast.success("Cycle de paie créé avec succès");
  };

  // Fonction pour obtenir le badge du statut
  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "secondary",
      APPROVED: "default",
      PAID: "outline",
      CANCELLED: "destructive"
    };

    const labels = {
      PENDING: "En attente",
      APPROVED: "Approuvé",
      PAID: "Payé",
      CANCELLED: "Annulé"
    };

    const icons = {
      PENDING: Clock,
      APPROVED: CheckCircle,
      PAID: DollarSign,
      CANCELLED: XCircle
    };

    const Icon = icons[status] || AlertCircle;

    return (
      <Badge variant={variants[status] || "secondary"} className="gap-1">
        <Icon className="w-3 h-3" />
        {labels[status] || status}
      </Badge>
    );
  };

  // Fonction pour formater la période (maintenant importée depuis utils)
  const formatPayrunPeriod = (payrun) => {
    return formatPeriod(payrun.periodStart, payrun.periodEnd);
  };

  // Calculs des statistiques
  const stats = {
    total: pagination.totalItems,
    pending: pagination.data.filter(p => p.status === 'PENDING').length,
    approved: pagination.data.filter(p => p.status === 'APPROVED').length,
    paid: pagination.data.filter(p => p.status === 'PAID').length
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
            <h1 className="text-2xl font-bold">Cycles de Paie</h1>
            <p className="text-muted-foreground">
              Gérez les cycles de paie de votre entreprise
            </p>
          </div>
        </div>

        <Button onClick={handleCreatePayrun}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Cycle
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approuvés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-sm text-muted-foreground">Payés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <FilterControls
        pagination={pagination}
        {...filterConfig}
      />

      {/* Liste des cycles de paie */}
      {pagination.loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : pagination.isEmpty ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun cycle de paie trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {Object.values(pagination.filters).some(v => v) 
                ? "Aucun cycle ne correspond aux critères de recherche."
                : "Commencez par créer votre premier cycle de paie."
              }
            </p>
            {!Object.values(pagination.filters).some(v => v) && (
              <Button onClick={handleCreatePayrun}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un cycle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pagination.data.map((payrun) => (
            <Card key={payrun.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{payrun.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatPayrunPeriod(payrun)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {payrun._count?.payslips || 0} employés
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {new Intl.NumberFormat('fr-FR').format(payrun.totalAmount || 0)} XOF
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(payrun.status)}
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPayrun(payrun)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      
                      {payrun.status === 'PENDING' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprovePayrun(payrun)}
                          disabled={approvalLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approuver
                        </Button>
                      )}
                      
                      {payrun.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePayrun(payrun)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <PaginationControls 
        pagination={pagination}
        limitOptions={[5, 10, 20, 50]}
      />

      {/* Modals */}
      <CreatePayRunModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        companyId={companyId}
        onPayrunCreated={onPayrunCreated}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Supprimer le cycle de paie"
        description={`Êtes-vous sûr de vouloir supprimer le cycle "${selectedPayrun?.name}" ? Cette action supprimera également tous les bulletins de paie associés et est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
}

export default PayrollCyclesWithPagination;