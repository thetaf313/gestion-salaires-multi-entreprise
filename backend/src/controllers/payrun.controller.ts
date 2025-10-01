import { Request, Response } from "express";
import { payRunService } from "../services/payrun.service.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/response.js";
import { Messages } from "../constants/messages.js";

class PayRunController {
  // Créer un nouveau cycle de paie
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const companyId = req.params.companyId;
      
      if (!userId) {
        return sendResponse(res, HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié");
      }

      const payRunData = {
        ...req.body,
        companyId,
        createdById: userId
      };

      const payRun = await payRunService.create(payRunData);
      sendResponse(res, HttpStatus.CREATED, "Cycle de paie créé avec succès", payRun);
    } catch (error: any) {
      console.error("Erreur lors de la création du cycle de paie:", error);
      sendResponse(res, HttpStatus.BAD_REQUEST, error.message || "Erreur lors de la création du cycle de paie");
    }
  }

  // Obtenir tous les cycles de paie d'une entreprise
  async getByCompany(req: Request, res: Response) {
    try {
      const companyId = req.params.companyId;
      const { page = 1, limit = 10, status } = req.query;

      const result = await payRunService.getByCompany(
        companyId,
        {
          page: Number(page),
          limit: Number(limit),
          status: status as string
        }
      );

      sendResponse(res, HttpStatus.OK, "Cycles de paie récupérés avec succès", result);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des cycles de paie:", error);
      sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, error.message || "Erreur lors de la récupération des cycles de paie");
    }
  }

  // Obtenir un cycle de paie par ID
  async getById(req: Request, res: Response) {
    try {
      const { id, companyId } = req.params;
      
      const payRun = await payRunService.getById(id, companyId);
      
      if (!payRun) {
        return sendResponse(res, HttpStatus.NOT_FOUND, "Cycle de paie non trouvé");
      }

      sendResponse(res, HttpStatus.OK, "Cycle de paie récupéré avec succès", payRun);
    } catch (error: any) {
      console.error("Erreur lors de la récupération du cycle de paie:", error);
      sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, error.message || "Erreur lors de la récupération du cycle de paie");
    }
  }

  // Mettre à jour un cycle de paie
  async update(req: Request, res: Response) {
    try {
      const { id, companyId } = req.params;
      const updateData = req.body;

      const payRun = await payRunService.update(id, companyId, updateData);
      
      if (!payRun) {
        return sendResponse(res, HttpStatus.NOT_FOUND, "Cycle de paie non trouvé");
      }

      sendResponse(res, HttpStatus.OK, "Cycle de paie mis à jour avec succès", payRun);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du cycle de paie:", error);
      sendResponse(res, HttpStatus.BAD_REQUEST, error.message || "Erreur lors de la mise à jour du cycle de paie");
    }
  }

  // Supprimer un cycle de paie
  async delete(req: Request, res: Response) {
    try {
      const { id, companyId } = req.params;

      const deleted = await payRunService.delete(id, companyId);
      
      if (!deleted) {
        return sendResponse(res, HttpStatus.NOT_FOUND, "Cycle de paie non trouvé");
      }

      sendResponse(res, HttpStatus.OK, "Cycle de paie supprimé avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la suppression du cycle de paie:", error);
      sendResponse(res, HttpStatus.BAD_REQUEST, error.message || "Erreur lors de la suppression du cycle de paie");
    }
  }

  // Approuver un cycle de paie et générer les bulletins
  async approve(req: Request, res: Response) {
    try {
      const { id, companyId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié");
      }

      const result = await payRunService.approve(id, companyId, userId);
      
      if (!result) {
        return sendResponse(res, HttpStatus.NOT_FOUND, "Cycle de paie non trouvé");
      }

      sendResponse(res, HttpStatus.OK, "Cycle de paie approuvé et bulletins générés avec succès", result);
    } catch (error: any) {
      console.error("Erreur lors de l'approbation du cycle de paie:", error);
      sendResponse(res, HttpStatus.BAD_REQUEST, error.message || "Erreur lors de l'approbation du cycle de paie");
    }
  }

  // Obtenir les statistiques des cycles de paie
  async getStats(req: Request, res: Response) {
    try {
      const companyId = req.params.companyId;
      
      const stats = await payRunService.getStats(companyId);
      sendResponse(res, HttpStatus.OK, "Statistiques récupérées avec succès", stats);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, error.message || "Erreur lors de la récupération des statistiques");
    }
  }
}

export const payRunController = new PayRunController();