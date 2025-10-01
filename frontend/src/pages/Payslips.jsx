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

export default function Payslips() {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  // Données mockées pour le moment
  const mockPayslips = [
    {
      id: "1",
      employeeName: "Jean Dupont",
      employeeId: "EMP001",
      period: "2025-01",
      periodLabel: "Janvier 2025",
      grossSalary: 450000,
      netSalary: 360000,
      status: "SENT",
      generatedAt: "2025-02-01",
      sentAt: "2025-02-01",
    },
    {
      id: "2",
      employeeName: "Marie Martin",
      employeeId: "EMP002",
      period: "2025-01",
      periodLabel: "Janvier 2025",
      grossSalary: 350000,
      netSalary: 280000,
      status: "GENERATED",
      generatedAt: "2025-02-01",
      sentAt: null,
    },
    {
      id: "3",
      employeeName: "Paul Bernard",
      employeeId: "EMP003",
      period: "2025-01",
      periodLabel: "Janvier 2025",
      grossSalary: 275000,
      netSalary: 220000,
      status: "SENT",
      generatedAt: "2025-02-01",
      sentAt: "2025-02-02",
    },
    {
      id: "4",
      employeeName: "Sophie Dubois",
      employeeId: "EMP004",
      period: "2025-02",
      periodLabel: "Février 2025",
      grossSalary: 380000,
      netSalary: 304000,
      status: "DRAFT",
      generatedAt: "2025-03-01",
      sentAt: null,
    },
  ];

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setPayslips(mockPayslips);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      DRAFT: "secondary",
      GENERATED: "default",
      SENT: "success",
      ERROR: "destructive",
    };

    const labels = {
      DRAFT: "Brouillon",
      GENERATED: "Généré",
      SENT: "Envoyé",
      ERROR: "Erreur",
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
      payslip.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payslip.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payslip.status === statusFilter;
    const matchesPeriod =
      periodFilter === "all" || payslip.period === periodFilter;

    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const totalGenerated = payslips.length;
  const totalSent = payslips.filter((p) => p.status === "SENT").length;
  const totalAmount = payslips.reduce((sum, p) => sum + p.netSalary, 0);

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
                <p className="text-2xl font-bold">{totalGenerated}</p>
                <p className="text-sm text-muted-foreground">Total générés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalSent}</p>
                <p className="text-sm text-muted-foreground">Envoyés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {[...new Set(payslips.map((p) => p.period))].length}
                </p>
                <p className="text-sm text-muted-foreground">Périodes</p>
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
                  {formatCurrency(totalAmount)}
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
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="GENERATED">Généré</SelectItem>
                <SelectItem value="SENT">Envoyé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="2025-02">Février 2025</SelectItem>
                <SelectItem value="2025-01">Janvier 2025</SelectItem>
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
                {filteredPayslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{payslip.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {payslip.employeeId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {payslip.periodLabel}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-blue-500" />
                        <span className="font-medium">
                          {formatCurrency(payslip.grossSalary)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-500" />
                        <span className="font-medium">
                          {formatCurrency(payslip.netSalary)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                    <TableCell>
                      {formatDate(payslip.generatedAt)}
                      {payslip.sentAt && (
                        <p className="text-xs text-muted-foreground">
                          Envoyé le {formatDate(payslip.sentAt)}
                        </p>
                      )}
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
                        {payslip.status === "GENERATED" && (
                          <Button size="sm">
                            <Send className="w-3 h-3 mr-1" />
                            Envoyer
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPayslips.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun bulletin trouvé
              </h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== "all" || periodFilter !== "all"
                  ? "Aucun bulletin ne correspond à vos critères de recherche."
                  : "Aucun bulletin de paie n'a encore été généré."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
