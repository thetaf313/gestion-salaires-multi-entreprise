import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useApiPagination } from "../hooks/useApiPagination";
import { FilterControls } from "../components/ui/FilterControls";
import { PaginationControls } from "../components/ui/PaginationControls";
import {
  Plus,
  FileText,
  Users,
  DollarSign,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  ArrowLeft,
  Archive,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { payslipService } from "../services/payslipService";
import {
  adaptPaginationResponse,
  logPaginationResponse,
} from "../utils/paginationAdapter";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { formatPeriod } from "../utils/dateUtils";

export function PayslipsWithPagination() {
  const { companyId, payrunId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // États locaux
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Configuration de l'API avec pagination
  const apiFunction = useCallback(
    async (params) => {
      if (!companyId) {
        return { data: [], total: 0, totalPages: 0 };
      }

      try {
        const result = payrunId
          ? await payslipService.getPayslipsByPayrun(
              companyId,
              payrunId,
              params
            )
          : await payslipService.getPayslipsByCompany(companyId, params);

        logPaginationResponse(result, "PayslipService");
        return adaptPaginationResponse(result, params);
      } catch (error) {
        console.error("Erreur lors de la récupération des bulletins:", error);
        throw error;
      }
    },
    [companyId, payrunId]
  );

  const pagination = useApiPagination({
    apiFunction,
    dependencies: [], // Pas besoin de companyId et payrunId car apiFunction est mémorisé
    defaultFilters: {
      search: "",
      status: "",
      month: "",
      year: new Date().getFullYear().toString(),
    },
    defaultLimit: 20,
    onError: (error) => {
      toast.error("Erreur lors du chargement des bulletins de paie");
    },
  });

  // Configuration des filtres
  const statusOptions = [
    { value: "PENDING", label: "En attente" },
    { value: "APPROVED", label: "Approuvé" },
    { value: "PAID", label: "Payé" },
    { value: "CANCELLED", label: "Annulé" },
    { value: "ARCHIVED", label: "Archivé" },
  ];

  const yearOptions = Array.from({ length: 3 }, (_, i) => {
    const year = new Date().getFullYear() - 1 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const monthOptions = [
    { value: "1", label: "Janvier" },
    { value: "2", label: "Février" },
    { value: "3", label: "Mars" },
    { value: "4", label: "Avril" },
    { value: "5", label: "Mai" },
    { value: "6", label: "Juin" },
    { value: "7", label: "Juillet" },
    { value: "8", label: "Août" },
    { value: "9", label: "Septembre" },
    { value: "10", label: "Octobre" },
    { value: "11", label: "Novembre" },
    { value: "12", label: "Décembre" },
  ];

  const filterConfig = {
    searchConfig: {
      placeholder: "Rechercher par nom d'employé...",
      searchField: "search",
    },
    selectFilters: [
      {
        key: "status",
        label: "Statut",
        placeholder: "Statut",
        options: statusOptions,
        allLabel: "Tous les statuts",
      },
      {
        key: "year",
        label: "Année",
        placeholder: "Année",
        options: yearOptions,
        allLabel: "Toutes les années",
      },
      {
        key: "month",
        label: "Mois",
        placeholder: "Mois",
        options: monthOptions,
        allLabel: "Tous les mois",
      },
    ],
  };

  // Gestionnaires d'événements
  const handleViewPayslip = (payslip) => {
    navigate(`/company/${companyId}/payslips/${payslip.id}`);
  };

  const handleCreatePayment = (payslip) => {
    navigate(`/company/${companyId}/payslips/${payslip.id}/payment`);
  };

  const handlePaymentCreated = () => {
    // Actualiser la liste des bulletins
    pagination.reload();
    toast.success("Paiement effectué avec succès");
  };

  const handleDownloadPayslip = async (payslip) => {
    setDownloadLoading(true);
    try {
      const blob = await payslipService.downloadPayslip(companyId, payslip.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bulletin-${payslip.employee.firstName}-${payslip.employee.lastName}-${payslip.periodStart}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Bulletin téléchargé avec succès");
    } catch (error) {
      toast.error("Erreur lors du téléchargement du bulletin");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDeletePayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedPayslip) return;

    try {
      await payslipService.deletePayslip(companyId, selectedPayslip.id);
      toast.success("Bulletin de paie supprimé avec succès");
      pagination.reload();
      setShowDeleteDialog(false);
      setSelectedPayslip(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression du bulletin");
    }
  };

  // Fonction pour obtenir le badge du statut
  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "secondary",
      APPROVED: "default",
      PAID: "outline",
      CANCELLED: "destructive",
      ARCHIVED: "secondary",
    };

    const labels = {
      PENDING: "En attente",
      APPROVED: "Approuvé",
      PAID: "Payé",
      CANCELLED: "Annulé",
      ARCHIVED: "Archivé",
    };

    const icons = {
      PENDING: Clock,
      APPROVED: CheckCircle,
      PAID: CreditCard,
      CANCELLED: XCircle,
      ARCHIVED: Archive,
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
  const formatPayslipPeriod = (payslip) => {
    // Les dates sont dans payslip.payRun, pas directement dans payslip
    return formatPeriod(payslip.payRun?.periodStart, payslip.payRun?.periodEnd);
  };

  // Calculs des statistiques
  const stats = {
    total: pagination.totalItems,
    approved: pagination.data.filter((p) => p.status === "APPROVED").length,
    paid: pagination.data.filter((p) => p.status === "PAID").length,
    archived: pagination.data.filter((p) => p.status === "ARCHIVED").length,
    totalAmount: pagination.data.reduce(
      (sum, p) => sum + (parseFloat(p.netAmount) || 0),
      0
    ),
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (payrunId) {
                navigate(`/company/${companyId}/payroll-cycles`);
              } else {
                navigate(`/company/${companyId}/dashboard`);
              }
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bulletins de Paie</h1>
            <p className="text-muted-foreground">
              {payrunId
                ? "Bulletins du cycle de paie"
                : "Tous les bulletins de paie"}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
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
              <CreditCard className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-sm text-muted-foreground">Payés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.archived}</p>
                <p className="text-sm text-muted-foreground">Archivés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-lg font-bold">
                  {new Intl.NumberFormat("fr-FR").format(stats.totalAmount)}
                </p>
                <p className="text-sm text-muted-foreground">XOF Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <FilterControls pagination={pagination} {...filterConfig} />

      {/* Liste des bulletins */}
      {pagination.loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : pagination.isEmpty ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Aucun bulletin de paie trouvé
            </h3>
            <p className="text-muted-foreground mb-4">
              {Object.values(pagination.filters).some((v) => v)
                ? "Aucun bulletin ne correspond aux critères de recherche."
                : "Aucun bulletin de paie n'a encore été généré."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Employé</th>
                    <th className="p-4 font-medium">Période</th>
                    <th className="p-4 font-medium">Statut</th>
                    <th className="p-4 font-medium">Salaire Brut</th>
                    <th className="p-4 font-medium">Déductions</th>
                    <th className="p-4 font-medium">Salaire Net</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.data.map((payslip) => (
                    <tr key={payslip.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {payslip.employee.firstName[0]}
                              {payslip.employee.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {payslip.employee.firstName}{" "}
                              {payslip.employee.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {payslip.employee.employeeCode}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatPayslipPeriod(payslip)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(payslip.status)}</td>
                      <td className="p-4">
                        <span className="font-medium">
                          {new Intl.NumberFormat("fr-FR").format(
                            parseFloat(payslip.grossAmount) || 0
                          )}{" "}
                          XOF
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-red-600">
                          -
                          {new Intl.NumberFormat("fr-FR").format(
                            parseFloat(payslip.totalDeductions) || 0
                          )}{" "}
                          XOF
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-green-600">
                          {new Intl.NumberFormat("fr-FR").format(
                            parseFloat(payslip.netAmount) || 0
                          )}{" "}
                          XOF
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPayslip(payslip)}
                            title="Voir les détails et paiements"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(payslip.status === "UNPAID" ||
                            payslip.status === "PARTIALLY_PAID") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreatePayment(payslip)}
                              className="text-green-600 hover:text-green-700"
                              title="Effectuer un paiement"
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPayslip(payslip)}
                            disabled={downloadLoading}
                            title="Télécharger le bulletin"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {(payslip.status === "PENDING" ||
                            payslip.status === "ARCHIVED") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePayslip(payslip)}
                              title="Supprimer le bulletin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <PaginationControls
        pagination={pagination}
        limitOptions={[10, 20, 50, 100]}
      />

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Supprimer le bulletin de paie"
        description={`Êtes-vous sûr de vouloir supprimer le bulletin de paie de ${selectedPayslip?.employee?.firstName} ${selectedPayslip?.employee?.lastName} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
}

export default PayslipsWithPagination;
