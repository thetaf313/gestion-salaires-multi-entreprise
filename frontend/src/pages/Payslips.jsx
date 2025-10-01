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
  FileText,
  Download,
  Search,
  Eye,
  Send,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { payslipService } from "../services/payslipService.js";

export default function Payslips() {
  const { user } = useAuth();
  const { companyId } = useParams();
  const [payslips, setPayslips] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  useEffect(() => {
    loadPayslips();
    loadStats();
  }, [companyId]);

  const loadPayslips = async () => {
    try {
      setLoading(true);
      const response = await payslipService.getByCompany(companyId);
      if (response.success) {
        setPayslips(response.data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des bulletins:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await payslipService.getStats(companyId);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "secondary",
      PARTIAL: "default",
      PAID: "success",
    };

    const labels = {
      PENDING: "En attente",
      PARTIAL: "Partiellement payé",
      PAID: "Payé",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
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

  const filteredPayslips = payslips.filter((payslip) => {
    const matchesSearch =
      payslip.employee?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payslip.employee?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payslip.id.toString().includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || payslip.status === statusFilter;
    const matchesPeriod =
      periodFilter === "all" || 
      new Date(payslip.payRun?.startDate).getFullYear().toString() === periodFilter;

    return matchesSearch && matchesStatus && matchesPeriod;
  });

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
            <FileText className="w-6 h-6" />
            Bulletins de Paie
          </h1>
          <p className="text-muted-foreground">
            Gérer et distribuer les bulletins de paie
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter Tout
          </Button>
          <Button>
            <Send className="w-4 h-4 mr-2" />
            Envoyer en Lot
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalPayslips || 0}</p>
                <p className="text-sm text-muted-foreground">Total bulletins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.paidPayslips || 0}</p>
                <p className="text-sm text-muted-foreground">Payés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.pendingPayslips || 0}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats?.totalAmount ? formatCurrency(stats.totalAmount) : formatCurrency(0)}
                </p>
                <p className="text-sm text-muted-foreground">Total net</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un employé..."
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
                <SelectItem value="PARTIAL">Partiellement payé</SelectItem>
                <SelectItem value="PAID">Payé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPeriodFilter("all");
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des bulletins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Bulletins de Paie ({filteredPayslips.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Salaire Brut</TableHead>
                  <TableHead>Salaire Net</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date Génération</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayslips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Aucun bulletin de paie trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium">
                              {payslip.employee?.firstName} {payslip.employee?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {payslip.employeeId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {payslip.payRun ? (
                            `${formatDate(payslip.payRun.startDate)} - ${formatDate(payslip.payRun.endDate)}`
                          ) : (
                            'Période non définie'
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-blue-500" />
                          <span className="font-medium">
                            {formatCurrency(payslip.grossSalary || 0)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          <span className="font-medium">
                            {formatCurrency(payslip.netSalary || 0)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                      <TableCell>
                        {formatDate(payslip.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Voir
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
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
