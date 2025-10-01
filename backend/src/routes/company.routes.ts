import { Router } from "express";
import { companyController } from "../controllers/company.controller.js";
import { uploadCompanyLogo } from "../services/upload.service.js";
import { validateToken } from "../middlewares/auth.js";

const router = Router();

// GET /api/companies - Récupérer toutes les entreprises avec pagination
router.get("/", companyController.getAllCompanies);

// Routes protégées par authentification pour la gestion de sa propre entreprise
// GET /api/companies/me - Récupérer les informations de mon entreprise
router.get("/me", validateToken, companyController.getMyCompany);

// PUT /api/companies/me - Mettre à jour les informations de mon entreprise
router.put("/me", validateToken, companyController.updateMyCompany);

// POST /api/companies/me/logo - Upload du logo d'entreprise
router.post("/me/logo", validateToken, uploadCompanyLogo.single('logo'), companyController.uploadLogo);

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
