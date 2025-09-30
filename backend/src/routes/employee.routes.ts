import { Router } from "express";
import employeeController from "../controllers/employee.controller.js";
import { validateToken } from "../middlewares/auth.js";

const router = Router();

// Toutes les routes des employés nécessitent une authentification
router.use(validateToken);

// Créer un nouvel employé
router.post("/", employeeController.createEmployee);

// Obtenir les employés d'une entreprise avec pagination
router.get("/company/:companyId", employeeController.getEmployeesByCompany);

// Obtenir les statistiques des employés d'une entreprise
router.get("/company/:companyId/stats", employeeController.getEmployeeStats);

// Rechercher des employés dans une entreprise
router.get("/company/:companyId/search", employeeController.searchEmployees);

// Obtenir un employé par ID
router.get("/:employeeId", employeeController.getEmployeeById);

// Mettre à jour un employé
router.put("/:employeeId", employeeController.updateEmployee);

// Supprimer un employé
router.delete("/:employeeId", employeeController.deleteEmployee);

export default router;
