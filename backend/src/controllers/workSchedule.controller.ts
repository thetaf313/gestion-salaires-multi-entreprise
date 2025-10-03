import { Request, Response } from "express";
import { workScheduleService } from "../services/workSchedule.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export class WorkScheduleController {
  // Obtenir les horaires de travail d'une entreprise
  async getWorkSchedules(req: Request, res: Response) {
    try {
      console.log("🔍 WorkSchedule - req.user:", req.user);

      // Pour SUPER_ADMIN, permettre de spécifier companyId en query param
      let companyId = req.user?.companyId;
      if (req.user?.role === "SUPER_ADMIN" && req.query.companyId) {
        companyId = req.query.companyId as string;
      }

      console.log("🏢 WorkSchedule - companyId:", companyId);

      if (!companyId) {
        return errorResponse(
          res,
          "Entreprise non trouvée - veuillez spécifier un companyId",
          400
        );
      }

      const schedules = await workScheduleService.getCompanyWorkSchedules(
        companyId
      );

      return successResponse(res, schedules, "Horaires récupérés avec succès");
    } catch (error: any) {
      console.error("Erreur récupération horaires:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la récupération des horaires"
      );
    }
  }

  // Créer ou mettre à jour les horaires de travail
  async setWorkSchedules(req: Request, res: Response) {
    try {
      console.log("📝 SetWorkSchedules - req.user:", req.user);
      const { schedules } = req.body;

      // Pour SUPER_ADMIN, permettre de spécifier companyId en query param
      let companyId = req.user?.companyId;
      if (req.user?.role === "SUPER_ADMIN" && req.query.companyId) {
        companyId = req.query.companyId as string;
      }

      console.log("🏢 SetWorkSchedules - companyId:", companyId);

      if (!companyId) {
        return errorResponse(
          res,
          "Entreprise non trouvée - veuillez spécifier un companyId",
          400
        );
      }

      if (!schedules || !Array.isArray(schedules)) {
        return errorResponse(res, "Données d'horaires invalides", 400);
      }

      const result = await workScheduleService.setCompanyWorkSchedules(
        companyId,
        schedules
      );

      return successResponse(res, result, "Horaires mis à jour avec succès");
    } catch (error: any) {
      console.error("Erreur mise à jour horaires:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la mise à jour des horaires"
      );
    }
  }

  // Vérifier si c'est l'heure de travail
  async checkWorkTime(req: Request, res: Response) {
    try {
      const { datetime } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      const checkDate = datetime ? new Date(datetime) : new Date();
      // Pour l'instant, on retourne toujours true - la logique sera implémentée plus tard
      const isWorkTime = true;

      return successResponse(
        res,
        { isWorkTime, datetime: checkDate },
        "Vérification effectuée"
      );
    } catch (error: any) {
      console.error("Erreur vérification heure de travail:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la vérification"
      );
    }
  }
}

export const workScheduleController = new WorkScheduleController();
