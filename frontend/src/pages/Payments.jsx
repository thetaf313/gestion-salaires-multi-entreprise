import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  DollarSign,
  Search,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Download,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { paymentService } from "../services/paymentService.js";

export default function Payments() {
  const { user } = useAuth();
  const { companyId } = useParams();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  useEffect(() => {
    loadPayments();
    loadStats();
  }, [companyId, methodFilter]); // Ajouter methodFilter comme dépendance

  // Debug: Logger l'état des paiements
  useEffect(() => {
    console.log("🔄 État des paiements mis à jour:", payments);
    console.log("📏 Longueur du tableau:", payments.length);
  }, [payments]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      console.log("🔍 Chargement des paiements pour companyId:", companyId);
      
      // Ajouter les paramètres de pagination et filtres
      const params = {
        page: 1,
        limit: 100, // Charger beaucoup de paiements pour la vue d'ensemble
        method: methodFilter !== "all" ? methodFilter : undefined,
      };
      
      console.log("📋 Paramètres de la requête:", params);
      
      const response = await paymentService.getByCompany(companyId, params);
      console.log("🌐 Response complète des paiements:", response);
      console.log("✅ Success:", response.success);
      console.log("📊 Data structure:", response.data);
      console.log("💰 Payments array:", response.data?.data);
      console.log("📄 Pagination:", response.data?.pagination);
      
      if (response.success) {
        // La structure est response.data.data pour accéder aux paiements
        const paymentsArray = response.data?.data || [];
        console.log("🎯 Paiements extraits:", paymentsArray);
        console.log("🔢 Nombre de paiements:", paymentsArray.length);
        setPayments(paymentsArray);
      } else {
        console.error("❌ Erreur dans la réponse:", response);
        setPayments([]);
      }
    } catch (error) {
      console.error("💥 Erreur lors du chargement des paiements:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await paymentService.getStats(companyId);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "secondary",
      COMPLETED: "success",
      FAILED: "destructive",
    };

    const labels = {
      PENDING: "En attente",
      COMPLETED: "Effectué",
      FAILED: "Échoué",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getMethodBadge = (method) => {
    const labels = {
      BANK_TRANSFER: "Virement",
      CASH: "Espèces",
      MOBILE_MONEY: "Mobile Money",
      CHECK: "Chèque",
    };

    const colors = {
      BANK_TRANSFER: "bg-blue-100 text-blue-800",
      CASH: "bg-green-100 text-green-800",
      MOBILE_MONEY: "bg-purple-100 text-purple-800",
      CHECK: "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          colors[method] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[method] || method}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.payslip?.employee?.firstName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.payslip?.employee?.lastName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.id.toString().includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" || payment.method === methodFilter;

    const result = matchesSearch && matchesStatus && matchesMethod;
    
    // Debug chaque paiement
    console.log("🔍 Filtrage paiement:", {
      paymentId: payment.id,
      searchQuery,
      statusFilter,
      methodFilter,
      matchesSearch,
      matchesStatus,
      matchesMethod,
      result,
      payment: payment
    });

    return result;
  });

  // Debug filteredPayments
  console.log("🎯 Paiements filtrés:", filteredPayments);
  console.log("📊 Nombre de paiements filtrés:", filteredPayments.length);

  // Statistics are now from backend stats
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Paiements
          </h1>
          <p className="text-muted-foreground">
            Gérer les paiements de salaires
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Paiement
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats?.totalPayments || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total paiements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats?.completedPayments || 0}
                </p>
                <p className="text-sm text-muted-foreground">Terminés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats?.pendingPayments || 0}
                </p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-lg font-bold">
                  {stats?.totalAmount
                    ? formatCurrency(stats.totalAmount)
                    : formatCurrency(0)}
                </p>
                <p className="text-sm text-muted-foreground">Montant total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-lg font-bold">
                  {stats?.completedAmount
                    ? formatCurrency(stats.completedAmount)
                    : formatCurrency(0)}
                </p>
                <p className="text-sm text-muted-foreground">Montant payé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="COMPLETED">Effectué</SelectItem>
                <SelectItem value="FAILED">Échoué</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les méthodes</SelectItem>
                <SelectItem value="BANK_TRANSFER">Virement</SelectItem>
                <SelectItem value="CASH">Espèces</SelectItem>
                {/* <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem> */}
                <SelectItem value="CHECK">Chèque</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setMethodFilter("all");
              }}
            >
              Réinitialiser
            </Button>

            <Button>Traiter les paiements</Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Paiements ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Aucun paiement trouvé
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium">
                              {payment.payslip?.employee?.firstName}{" "}
                              {payment.payslip?.employee?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {payment.payslip?.employeeId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {payment.payslip?.payRun
                            ? `${formatDate(
                                payment.payslip.payRun.startDate
                              )} - ${formatDate(
                                payment.payslip.payRun.endDate
                              )}`
                            : "Période non définie"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          <span className="font-medium">
                            {formatCurrency(payment.amount || 0)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getMethodBadge(payment.method || "BANK_TRANSFER")}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          ID: {payment.id}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Créé: {formatDate(payment.createdAt)}</p>
                          {payment.updatedAt !== payment.createdAt && (
                            <p className="text-muted-foreground">
                              Modifié: {formatDate(payment.updatedAt)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {payment.status === "PENDING" && (
                            <Button size="sm">Traiter</Button>
                          )}
                          {payment.status === "FAILED" && (
                            <Button size="sm" variant="outline">
                              Réessayer
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Détails
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
