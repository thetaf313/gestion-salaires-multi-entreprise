import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import userController from "../controllers/user.controller.js";

const router = Router();

// Route existante pour le profil
router.get("/me", authController.getProfile);

// Nouvelles routes pour la gestion des utilisateurs (déjà protégées par le middleware global)
router.post("/", userController.createUser.bind(userController));
router.get(
  "/company/:companyId",
  userController.getUsersByCompany.bind(userController)
);
router.patch("/:userId/deactivate", userController.deactivateUser.bind(userController));
router.patch("/:userId/activate", userController.activateUser.bind(userController));
router.patch("/:userId/reset-password", userController.resetPassword.bind(userController));
router.get("/stats", userController.getUserStats.bind(userController));

export default router;
