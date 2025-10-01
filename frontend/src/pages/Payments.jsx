import { useState, useEffect } from "react";
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

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Données mockées pour le moment
  const mockPayments = [
    {
      id: "1",
      employeeName: "Jean Dupont",
      employeeId: "EMP001",
      amount: 360000,
      period: "2025-01",
      periodLabel: "Janvier 2025",
      method: "BANK_TRANSFER",
      status: "COMPLETED",
      createdAt: "2025-02-01",
      processedAt: "2025-02-01",
      reference: "TRF-202501-001",
    },
    {
      id: "2",
      employeeName: "Marie Martin",
      employeeId: "EMP002",
      amount: 280000,
      period: "2025-01",
      periodLabel: "Janvier 2025",
      method: "CASH",
      status: "PENDING",
      createdAt: "2025-02-01",
      processedAt: null,
      reference: "CSH-202501-002",
    },
    {
      id: "3",
      employeeName: "Paul Bernard",
      employeeId: "EMP003",
      amount: 220000,
      period: "2025-01",
      periodLabel: "Janvier 2025",
      method: "BANK_TRANSFER",
      status: "FAILED",
      createdAt: "2025-02-01",
      processedAt: "2025-02-01",
      reference: "TRF-202501-003",
      errorMessage: "Compte bancaire invalide",
    },
    {
      id: "4",
      employeeName: "Sophie Dubois",
      employeeId: "EMP004",
      amount: 304000,
      period: "2025-02",
      periodLabel: "Février 2025",
      method: "MOBILE_MONEY",
      status: "PROCESSING",
      createdAt: "2025-03-01",
      processedAt: null,
      reference: "MM-202502-004",
    },
  ];

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "secondary",
      PROCESSING: "default",
      COMPLETED: "success",
      FAILED: "destructive",
    };

    const labels = {
      PENDING: "En attente",
      PROCESSING: "En cours",
      COMPLETED: "Terminé",
      FAILED: "Échoué",
    };

    const icons = {
      PENDING: Clock,
      PROCESSING: AlertCircle,
      COMPLETED: CheckCircle,
      FAILED: XCircle,
    };

    const Icon = icons[status];

    return (
      <Badge
        variant={variants[status] || "secondary"}
        className="flex items-center gap-1"
      >
        <Icon className="w-3 h-3" />
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
      payment.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" || payment.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalPayments = payments.length;
  const completedPayments = payments.filter(
    (p) => p.status === "COMPLETED"
  ).length;
  const pendingPayments = payments.filter(
    (p) => p.status === "PENDING" || p.status === "PROCESSING"
  ).length;
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

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
                <p className="text-2xl font-bold">{totalPayments}</p>
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
                <p className="text-2xl font-bold">{completedPayments}</p>
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
                <p className="text-2xl font-bold">{pendingPayments}</p>
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
                  {formatCurrency(totalAmount)}
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
                  {formatCurrency(completedAmount)}
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
                <SelectItem value="PROCESSING">En cours</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
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
                <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
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
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{payment.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.employeeId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {payment.periodLabel}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-500" />
                        <span className="font-medium">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getMethodBadge(payment.method)}</TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                      {payment.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">
                          {payment.errorMessage}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {payment.reference}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Créé: {formatDate(payment.createdAt)}</p>
                        {payment.processedAt && (
                          <p className="text-muted-foreground">
                            Traité: {formatDate(payment.processedAt)}
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
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun paiement trouvé
              </h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== "all" || methodFilter !== "all"
                  ? "Aucun paiement ne correspond à vos critères de recherche."
                  : "Aucun paiement n'a encore été effectué."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
