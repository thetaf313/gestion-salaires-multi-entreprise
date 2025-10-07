import { Router } from "express";
import {
  generatePayslipsForPayRun,
  getPayslipsByPayRun,
} from "../controllers/payslip-generation.controller.js";

const router = Router();

// Route pour générer les bulletins d'un cycle de paie
router.post(
  "/companies/:companyId/payruns/:payRunId/generate-payslips",
  generatePayslipsForPayRun
);

// Route pour récupérer les bulletins d'un cycle
router.get(
  "/companies/:companyId/payruns/:payRunId/payslips",
  getPayslipsByPayRun
);

export default router;
