import express from "express";
import { employeeUserController } from "../controllers/employeeUser.controller.js";
import { validateToken } from "../middlewares/auth.js";

const router = express.Router();

// Routes pour la gestion des comptes employés
// Toutes les routes nécessitent une authentification

// Rechercher un employé par email ou matricule (pour admin/superadmin)
router.get("/search", 
  validateToken, 
  employeeUserController.searchEmployee
);

// Obtenir la liste des employés sans compte utilisateur (pour admin/superadmin)
router.get("/without-user", 
  validateToken, 
  employeeUserController.getEmployeesWithoutUser
);

// Créer un compte utilisateur pour un employé (pour admin/superadmin)
router.post("/:employeeId/create-user", 
  validateToken, 
  employeeUserController.createUserForEmployee
);

// Obtenir le profil complet de l'employé-utilisateur connecté
router.get("/profile", 
  validateToken, 
  employeeUserController.getEmployeeUserProfile
);

// Obtenir le QR code de l'employé connecté
router.get("/my-qr-code", 
  validateToken, 
  employeeUserController.getMyQRCode
);

export default router;