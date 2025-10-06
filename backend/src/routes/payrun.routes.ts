import express from "express";
import { payRunController } from "../controllers/payrun.controller.js";
import { validateToken } from "../middlewares/auth.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(validateToken);

// Routes pour les cycles de paie
router.post("/company/:companyId/payruns", payRunController.create);
router.get("/company/:companyId/payruns", payRunController.getByCompany);
router.get("/company/:companyId/payruns/stats", payRunController.getStats);
router.get("/company/:companyId/payruns/:id", payRunController.getById);
router.put("/company/:companyId/payruns/:id", payRunController.update);
router.delete("/company/:companyId/payruns/:id", payRunController.delete);
router.patch(
  "/company/:companyId/payruns/:id/approve",
  payRunController.approve
);
router.patch(
  "/company/:companyId/payruns/:id/status",
  payRunController.updateStatus
);

export default router;
