import express from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { validateToken } from "../middlewares/auth.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(validateToken);

// Routes pour les paiements
router.post("/company/:companyId/payments", paymentController.create);
router.get("/company/:companyId/payments", paymentController.getByCompany);
router.get("/company/:companyId/payments/stats", paymentController.getStats);
router.get("/company/:companyId/payments/:id", paymentController.getById);
router.get(
  "/company/:companyId/payslips/:payslipId/payments",
  paymentController.getByPayslip
);

export default router;
