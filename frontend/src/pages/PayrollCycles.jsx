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
  Calendar,
  Plus,
  Search,
  Play,
  Pause,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { payRunService } from "../services/payRunService.js";

export default function PayrollCycles() {
  const { user } = useAuth();
  const { companyId } = useParams();
  const [cycles, setCycles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCycles();
    loadStats();
  }, [companyId]);

  const loadCycles = async () => {
    try {
      setLoading(true);
      const response = await payRunService.getByCompany(companyId);
      if (response.success) {
        setCycles(response.data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await payRunService.getStats(companyId);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleApprove = async (cycleId) => {
    try {
      const response = await payRunService.approve(companyId, cycleId);
      if (response.success) {
        // Recharger les données
        loadCycles();
        loadStats();
        toast.success('Cycle de paie approuvé et bulletins générés avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      toast.error('Erreur lors de l\'approbation du cycle de paie');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      DRAFT: "secondary",
      APPROVED: "default",
      CLOSED: "success",
    };

    const labels = {
      DRAFT: "Brouillon",
      APPROVED: "Approuvé",
      CLOSED: "Clôturé",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CLOSED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "APPROVED":
        return <Play className="w-4 h-4 text-blue-500" />;
      case "DRAFT":
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
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
            <Calendar className="w-6 h-6" />
            Cycles de Paie
          </h1>
          <p className="text-muted-foreground">
            Gérer les cycles de paie de votre entreprise
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Cycle
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalPayRuns || 0}</p>
                <p className="text-sm text-muted-foreground">Total cycles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.approvedPayRuns || 0}</p>
                <p className="text-sm text-muted-foreground">Approuvés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.closedPayRuns || 0}</p>
                <p className="text-sm text-muted-foreground">Clôturés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    cycles.reduce((sum, c) => sum + c.totalAmount, 0)
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total versé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un cycle de paie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des cycles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Cycles de Paie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Aucun cycle de paie trouvé</p>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Créer le premier cycle
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  cycles.map((cycle) => (
                    <TableRow key={cycle.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(cycle.status)}
                          <div>
                            <p className="font-medium">
                              Cycle du {formatDate(cycle.startDate)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {cycle.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {formatDate(cycle.startDate)} -{" "}
                            {formatDate(cycle.endDate)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(cycle.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(cycle.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            Voir
                          </Button>
                          {cycle.status === "DRAFT" && (
                            <Button 
                              size="sm"
                              onClick={() => handleApprove(cycle.id)}
                              disabled={loading}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Approuver
                            </Button>
                          )}
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
