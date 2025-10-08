import express from "express";
import { payslipController } from "../controllers/payslip.controller.js";
import { validateToken } from "../middlewares/auth.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(validateToken);

// Routes pour les bulletins de paie
router.get("/company/:companyId/payslips", payslipController.getByCompany);
router.get("/company/:companyId/payslips/stats", payslipController.getStats);
router.get("/company/:companyId/payslips/:id", payslipController.getById);
router.get("/company/:companyId/payslips/:id/download", payslipController.download);
router.patch(
  "/company/:companyId/payslips/:id/status",
  payslipController.updateStatus
);

export default router;
