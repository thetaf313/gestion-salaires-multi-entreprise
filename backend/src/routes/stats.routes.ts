import { Router } from "express";
import { statsController } from "../controllers/stats.controller.js";

const router = Router();

/**
 * @route GET /api/stats/dashboard
 * @desc Récupère les statistiques du tableau de bord selon le rôle utilisateur
 * @access Private (tous les rôles authentifiés)
 */
router.get("/dashboard", statsController.getDashboardStats);

/**
 * @route GET /api/stats/super-admin
 * @desc Statistiques globales de la plateforme
 * @access Private (SUPER_ADMIN uniquement)
 */
router.get("/super-admin", statsController.getSuperAdminStats);

/**
 * @route GET /api/stats/admin/:companyId
 * @desc Statistiques d'une entreprise spécifique
 * @access Private (ADMIN de l'entreprise ou SUPER_ADMIN)
 */
router.get("/admin/:companyId", statsController.getAdminStats);

/**
 * @route GET /api/stats/cashier/:companyId
 * @desc Statistiques opérationnelles pour les paiements
 * @access Private (CASHIER de l'entreprise, ADMIN ou SUPER_ADMIN)
 */
router.get("/cashier/:companyId", statsController.getCashierStats);

/**
 * @route GET /api/stats/kpi-summary
 * @desc Résumé des KPIs principaux selon le rôle
 * @access Private (tous les rôles authentifiés)
 */
router.get("/kpi-summary", statsController.getKPISummary);

export default router;
