import { Request, Response } from "express";
import { paymentService } from "../services/payment.service.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/response.js";
import { PaymentMethod } from "@prisma/client";

class PaymentController {
  // Créer un nouveau paiement
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const companyId = req.params.companyId as string;

      if (!userId) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      const paymentData = {
        ...req.body,
        processedById: userId,
      };

      const payment = await paymentService.create(paymentData);
      sendResponse(
        res,
        HttpStatus.CREATED,
        "Paiement créé avec succès",
        payment
      );
    } catch (error: any) {
      console.error("Erreur lors de la création du paiement:", error);
      sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        error.message || "Erreur lors de la création du paiement"
      );
    }
  }

  // Obtenir les paiements d'une entreprise
  async getByCompany(req: Request, res: Response) {
    try {
      const companyId = req.params.companyId as string;
      const { page = 1, limit = 10, method, payRunId } = req.query;

      const result = await paymentService.getByCompany(companyId, {
        page: Number(page),
        limit: Number(limit),
        method: method as string,
        payRunId: payRunId as string,
      });

      sendResponse(
        res,
        HttpStatus.OK,
        "Paiements récupérés avec succès",
        result
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération des paiements:", error);
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération des paiements"
      );
    }
  }

  // Obtenir un paiement par ID
  async getById(req: Request, res: Response) {
    try {
      const { id, companyId } = req.params;

      const payment = await paymentService.getById(
        id as string,
        companyId as string
      );

      if (!payment) {
        return sendResponse(res, HttpStatus.NOT_FOUND, "Paiement non trouvé");
      }

      sendResponse(
        res,
        HttpStatus.OK,
        "Paiement récupéré avec succès",
        payment
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération du paiement:", error);
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération du paiement"
      );
    }
  }

  // Obtenir les statistiques des paiements
  async getStats(req: Request, res: Response) {
    try {
      const companyId = req.params.companyId as string;

      const stats = await paymentService.getStats(companyId);
      sendResponse(
        res,
        HttpStatus.OK,
        "Statistiques récupérées avec succès",
        stats
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération des statistiques"
      );
    }
  }

  // Obtenir les paiements par bulletin de paie
  async getByPayslip(req: Request, res: Response) {
    try {
      const { payslipId, companyId } = req.params;

      const payments = await paymentService.getByPayslip(
        payslipId as string,
        companyId as string
      );
      sendResponse(
        res,
        HttpStatus.OK,
        "Paiements du bulletin récupérés avec succès",
        payments
      );
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des paiements du bulletin:",
        error
      );
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message ||
          "Erreur lors de la récupération des paiements du bulletin"
      );
    }
  }
}

export const paymentController = new PaymentController();
