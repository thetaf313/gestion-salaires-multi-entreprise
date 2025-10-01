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
  Calendar,
  Plus,
  Search,
  Play,
  Pause,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function PayrollCycles() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Données mockées pour le moment
  const mockCycles = [
    {
      id: "1",
      name: "Paie Janvier 2025",
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      payDate: "2025-02-01",
      status: "COMPLETED",
      employeeCount: 25,
      totalAmount: 1250000,
      createdAt: "2025-01-15",
    },
    {
      id: "2",
      name: "Paie Février 2025",
      startDate: "2025-02-01",
      endDate: "2025-02-28",
      payDate: "2025-03-01",
      status: "IN_PROGRESS",
      employeeCount: 27,
      totalAmount: 0,
      createdAt: "2025-02-15",
    },
    {
      id: "3",
      name: "Paie Mars 2025",
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      payDate: "2025-04-01",
      status: "DRAFT",
      employeeCount: 28,
      totalAmount: 0,
      createdAt: "2025-03-01",
    },
  ];

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setCycles(mockCycles);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      DRAFT: "secondary",
      IN_PROGRESS: "default",
      COMPLETED: "success",
      CANCELLED: "destructive",
    };

    const labels = {
      DRAFT: "Brouillon",
      IN_PROGRESS: "En cours",
      COMPLETED: "Terminé",
      CANCELLED: "Annulé",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "IN_PROGRESS":
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
                <p className="text-2xl font-bold">{cycles.length}</p>
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
                <p className="text-2xl font-bold">
                  {cycles.filter((c) => c.status === "IN_PROGRESS").length}
                </p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {cycles.filter((c) => c.status === "COMPLETED").length}
                </p>
                <p className="text-sm text-muted-foreground">Terminés</p>
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
                  <TableHead>Date de Paie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Employés</TableHead>
                  <TableHead>Montant Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle) => (
                  <TableRow key={cycle.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(cycle.status)}
                        <div>
                          <p className="font-medium">{cycle.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Créé le {formatDate(cycle.createdAt)}
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
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(cycle.payDate)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(cycle.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {cycle.employeeCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-500" />
                        <span className="font-medium">
                          {cycle.totalAmount > 0
                            ? formatCurrency(cycle.totalAmount)
                            : "En attente"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Voir
                        </Button>
                        {cycle.status === "DRAFT" && (
                          <Button size="sm">
                            <Play className="w-3 h-3 mr-1" />
                            Lancer
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
