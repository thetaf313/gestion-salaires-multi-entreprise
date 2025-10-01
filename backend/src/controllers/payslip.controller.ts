import { Request, Response } from "express";
import { payslipService } from "../services/payslip.service.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/response.js";
import { PayslipStatus } from "@prisma/client";

class PayslipController {
  // Obtenir les bulletins de paie d'une entreprise
  async getByCompany(req: Request, res: Response) {
    try {
      const companyId = req.params.companyId as string;
      const { page = 1, limit = 10, status, payRunId } = req.query;

      const result = await payslipService.getByCompany(
        companyId,
        {
          page: Number(page),
          limit: Number(limit),
          status: status as string,
          payRunId: payRunId as string,
        }
      );

      sendResponse(res, HttpStatus.OK, "Bulletins de paie récupérés avec succès", result);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des bulletins:", error);
      sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, error.message || "Erreur lors de la récupération des bulletins");
    }
  }

  // Obtenir un bulletin de paie par ID
  async getById(req: Request, res: Response) {
    try {
      const { id, companyId } = req.params;
      
      const payslip = await payslipService.getById(id as string, companyId as string);
      
      if (!payslip) {
        return sendResponse(res, HttpStatus.NOT_FOUND, "Bulletin de paie non trouvé");
      }

      sendResponse(res, HttpStatus.OK, "Bulletin de paie récupéré avec succès", payslip);
    } catch (error: any) {
      console.error("Erreur lors de la récupération du bulletin:", error);
      sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, error.message || "Erreur lors de la récupération du bulletin");
    }
  }

  // Mettre à jour le statut d'un bulletin
  async updateStatus(req: Request, res: Response) {
    try {
      const { id, companyId } = req.params;
      const { status } = req.body;

      if (!Object.values(PayslipStatus).includes(status)) {
        return sendResponse(res, HttpStatus.BAD_REQUEST, "Statut invalide");
      }

      const payslip = await payslipService.updateStatus(id as string, companyId as string, status);
      
      if (!payslip) {
        return sendResponse(res, HttpStatus.NOT_FOUND, "Bulletin de paie non trouvé");
      }

      sendResponse(res, HttpStatus.OK, "Statut mis à jour avec succès", payslip);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      sendResponse(res, HttpStatus.BAD_REQUEST, error.message || "Erreur lors de la mise à jour du statut");
    }
  }

  // Obtenir les statistiques des bulletins
  async getStats(req: Request, res: Response) {
    try {
      const companyId = req.params.companyId as string;
      
      const stats = await payslipService.getStats(companyId);
      sendResponse(res, HttpStatus.OK, "Statistiques récupérées avec succès", stats);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, error.message || "Erreur lors de la récupération des statistiques");
    }
  }
}

export const payslipController = new PayslipController();