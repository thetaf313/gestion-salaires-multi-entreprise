import { Router } from "express";
import { companyController } from "../controllers/company.controller.js";

const router = Router();

// GET /api/companies - Récupérer toutes les entreprises avec pagination
router.get("/", companyController.getAllCompanies);

// GET /api/companies/:id - Récupérer une entreprise par ID
router.get("/:id", companyController.getCompanyById);

// POST /api/companies - Créer une nouvelle entreprise
router.post("/", companyController.createCompany);

// PUT /api/companies/:id - Mettre à jour une entreprise
router.put("/:id", companyController.updateCompany);

// DELETE /api/companies/:id - Supprimer une entreprise
router.delete("/:id", companyController.deleteCompany);

// GET /api/companies/:id/stats - Récupérer les statistiques d'une entreprise
router.get("/:id/stats", companyController.getCompanyStats);

export default router;
