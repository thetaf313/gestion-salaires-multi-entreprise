import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Play,
  AlertTriangle,
  Info,
} from "lucide-react";
import { payRunService } from "../services/payRunService";

export function PayRunStatusModal({
  payRun,
  companyId,
  isOpen,
  onClose,
  onUpdate,
}) {
  const [isLoading, setIsLoading] = useState(false);

  if (!payRun) return null;

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
        return <CheckCircle className="w-4 h-4" />;
      case "APPROVED":
        return <Play className="w-4 h-4" />;
      case "DRAFT":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getNextStatus = () => {
    switch (payRun.status) {
      case "DRAFT":
        return "APPROVED";
      case "APPROVED":
        return "CLOSED";
      default:
        return null;
    }
  };

  const getStatusActions = () => {
    switch (payRun.status) {
      case "DRAFT":
        return {
          action: "approve",
          label: "Approuver le cycle",
          description:
            "Le cycle sera approuvé et les bulletins de paie seront générés",
          icon: <Play className="w-4 h-4" />,
          color: "blue",
        };
      case "APPROVED":
        return {
          action: "close",
          label: "Clôturer le cycle",
          description: "Le cycle sera clôturé définitivement",
          icon: <CheckCircle className="w-4 h-4" />,
          color: "green",
        };
      default:
        return null;
    }
  };

  const handleStatusChange = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) return;

    setIsLoading(true);
    try {
      await payRunService.updateStatus(companyId, payRun.id, nextStatus);
      toast.success(
        nextStatus === "APPROVED"
          ? "Cycle de paie approuvé avec succès"
          : "Cycle de paie clôturé avec succès"
      );
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast.error("Erreur lors du changement de statut");
    } finally {
      setIsLoading(false);
    }
  };

  const statusAction = getStatusActions();
  const nextStatus = getNextStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Changer le statut
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut actuel */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">
                Statut actuel :
              </span>
              <div className="flex items-center gap-2">
                {getStatusIcon(payRun.status)}
                {getStatusBadge(payRun.status)}
              </div>
            </div>

            {nextStatus && (
              <>
                <ArrowRight className="w-5 h-5 mx-auto text-muted-foreground" />
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Nouveau statut :
                  </span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(nextStatus)}
                    {getStatusBadge(nextStatus)}
                  </div>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Actions disponibles */}
          {statusAction ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">
                      {statusAction.label}
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {statusAction.description}
                    </p>
                  </div>
                </div>
              </div>

              {payRun.status === "APPROVED" && (
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900">Attention</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Une fois clôturé, le cycle ne pourra plus être modifié.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
              <h3 className="font-medium text-gray-900">Cycle terminé</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ce cycle de paie est déjà clôturé et ne peut plus être modifié.
              </p>
            </div>
          )}
        </div>

        {statusAction && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                statusAction.icon
              )}
              {statusAction.label}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
