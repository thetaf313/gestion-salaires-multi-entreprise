import { Router } from "express";
import {
  generatePayslips,
  getPayslipsByPayRun,
  getPayslipDetails,
  updatePayslipStatus,
  getPayrollStats,
  searchPayslips,
  getEmployeePayslips,
} from "../controllers/payroll.controller.js";
import { authenticateToken } from "../middlewares/auth.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import {
  generatePayslipsSchema,
  updatePayslipStatusSchema,
} from "../schemas/payroll.schemas.js";

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Routes pour la génération de bulletins
router.post(
  "/companies/:companyId/payruns/:payRunId/generate-payslips",
  validateSchema(generatePayslipsSchema),
  generatePayslips
);

// Routes pour les bulletins de paie
router.get(
  "/companies/:companyId/payruns/:payRunId/payslips",
  getPayslipsByPayRun
);
router.get("/companies/:companyId/payslips/search", searchPayslips);
router.get("/companies/:companyId/payslips/:payslipId", getPayslipDetails);
router.patch(
  "/companies/:companyId/payslips/:payslipId/status",
  validateSchema(updatePayslipStatusSchema),
  updatePayslipStatus
);

// Routes pour les bulletins par employé
router.get(
  "/companies/:companyId/employees/:employeeId/payslips",
  getEmployeePayslips
);

// Routes pour les statistiques
router.get("/companies/:companyId/payroll/stats", getPayrollStats);

export default router;
