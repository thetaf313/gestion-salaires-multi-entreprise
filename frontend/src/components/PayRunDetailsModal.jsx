import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  FileText,
  Hash,
  CheckCircle,
  Play,
} from "lucide-react";

export function PayRunDetailsModal({ payRun, isOpen, onClose }) {
  if (!payRun) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return date.toLocaleString("fr-FR");
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

  const calculateDuration = () => {
    const startDate = payRun.periodStart || payRun.startDate;
    const endDate = payRun.periodEnd || payRun.endDate;
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Détails du Cycle de Paie
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Informations générales</h3>
              <div className="flex items-center gap-2">
                {getStatusIcon(payRun.status)}
                {getStatusBadge(payRun.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Identifiant</p>
                <p className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  {payRun.id.slice(0, 8)}...
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Durée</p>
                <p className="font-medium">
                  {calculateDuration()} jour{calculateDuration() > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Période */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Période du cycle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Date de début</p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  {formatDate(payRun.periodStart || payRun.startDate)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Date de fin</p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  {formatDate(payRun.periodEnd || payRun.endDate)}
                </p>
              </div>
            </div>
          </div>

          {payRun.description && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Description</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">{payRun.description}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Informations système */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations système</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Date de création
                </p>
                <p className="text-sm">{formatDateTime(payRun.createdAt)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Dernière modification
                </p>
                <p className="text-sm">{formatDateTime(payRun.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Actions possibles selon le statut */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Actions disponibles
            </h4>
            <div className="text-sm text-blue-700">
              {payRun.status === "DRAFT" && (
                <p>• Ce cycle peut être modifié ou approuvé</p>
              )}
              {payRun.status === "APPROVED" && (
                <p>
                  • Ce cycle a été approuvé et les bulletins de paie ont été
                  générés
                </p>
              )}
              {payRun.status === "CLOSED" && (
                <p>• Ce cycle est clôturé et ne peut plus être modifié</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
