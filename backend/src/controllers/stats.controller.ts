import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { statsService } from "../services/stats.service.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/response.js";
import { Messages } from "../constants/messages.js";

class StatsController {
  /**
   * GET /api/stats/dashboard
   * Récupère les statistiques du tableau de bord selon le rôle
   */
  async getDashboardStats(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      const { companyId } = req.query;
      const requestedCompanyId = companyId as string;

      // Validation des autorisations
      const hasAccess = statsService.validateStatsAccess(
        user.role,
        requestedCompanyId,
        user.companyId
      );

      if (!hasAccess) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Accès refusé aux statistiques demandées"
        );
      }

      // Récupération des stats selon le rôle
      const stats = await statsService.getStatsByRole(
        user.role,
        requestedCompanyId || user.companyId
      );

      // Génération du résumé KPI
      const kpiSummary = statsService.generateKPISummary(stats, user.role);

      sendResponse(res, HttpStatus.OK, "Statistiques récupérées avec succès", {
        role: user.role,
        stats,
        kpiSummary,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération des statistiques"
      );
    }
  }

  /**
   * GET /api/stats/super-admin
   * Statistiques globales pour SUPER_ADMIN uniquement
   */
  async getSuperAdminStats(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user || user.role !== UserRole.SUPER_ADMIN) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Accès réservé aux SUPER_ADMIN"
        );
      }

      const stats = await statsService.getSuperAdminStats();
      const kpiSummary = statsService.generateKPISummary(
        stats,
        UserRole.SUPER_ADMIN
      );

      sendResponse(res, HttpStatus.OK, "Statistiques SUPER_ADMIN récupérées", {
        stats,
        kpiSummary,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Erreur stats SUPER_ADMIN:", error);
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message ||
          "Erreur lors de la récupération des statistiques SUPER_ADMIN"
      );
    }
  }

  /**
   * GET /api/stats/admin/:companyId
   * Statistiques d'entreprise pour ADMIN
   */
  async getAdminStats(req: Request, res: Response) {
    try {
      const user = req.user;
      if (
        !user ||
        (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)
      ) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Accès réservé aux ADMIN et SUPER_ADMIN"
        );
      }

      const { companyId } = req.params;
      if (!companyId) {
        return sendResponse(res, HttpStatus.BAD_REQUEST, "Company ID requis");
      }

      // Validation : ADMIN ne peut voir que sa propre entreprise
      if (user.role === UserRole.ADMIN && user.companyId !== companyId) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Accès refusé à cette entreprise"
        );
      }

      const stats = await statsService.getAdminStats(companyId);
      const kpiSummary = statsService.generateKPISummary(stats, UserRole.ADMIN);

      sendResponse(res, HttpStatus.OK, "Statistiques ADMIN récupérées", {
        stats,
        kpiSummary,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Erreur stats ADMIN:", error);
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération des statistiques ADMIN"
      );
    }
  }

  /**
   * GET /api/stats/cashier/:companyId
   * Statistiques opérationnelles pour CASHIER
   */
  async getCashierStats(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user || user.role === UserRole.USER) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Accès réservé aux CASHIER, ADMIN et SUPER_ADMIN"
        );
      }

      const { companyId } = req.params;
      if (!companyId) {
        return sendResponse(res, HttpStatus.BAD_REQUEST, "Company ID requis");
      }

      // Validation : CASHIER ne peut voir que sa propre entreprise
      if (user.role === UserRole.CASHIER && user.companyId !== companyId) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Accès refusé à cette entreprise"
        );
      }

      const stats = await statsService.getCashierStats(companyId);
      const kpiSummary = statsService.generateKPISummary(
        stats,
        UserRole.CASHIER
      );

      sendResponse(res, HttpStatus.OK, "Statistiques CASHIER récupérées", {
        stats,
        kpiSummary,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Erreur stats CASHIER:", error);
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message ||
          "Erreur lors de la récupération des statistiques CASHIER"
      );
    }
  }

  /**
   * GET /api/stats/kpi-summary
   * Résumé des KPIs principaux selon le rôle
   */
  async getKPISummary(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      const { companyId } = req.query;
      const requestedCompanyId = companyId as string;

      // Récupération des stats complètes
      const stats = await statsService.getStatsByRole(
        user.role,
        requestedCompanyId || user.companyId
      );

      // Génération du résumé KPI uniquement
      const kpiSummary = statsService.generateKPISummary(stats, user.role);

      sendResponse(res, HttpStatus.OK, "Résumé KPI récupéré", {
        role: user.role,
        kpiSummary,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Erreur KPI summary:", error);
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération du résumé KPI"
      );
    }
  }
}

export const statsController = new StatsController();
export default StatsController;
