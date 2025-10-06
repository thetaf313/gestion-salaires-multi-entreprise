import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import userService from "../services/user.service.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/response.js";

export class UserController {
  // Créer un nouvel utilisateur
  async createUser(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password, role, companyId } =
        req.body;

      // Validation basique
      if (!firstName || !lastName || !email || !password) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Tous les champs obligatoires doivent être remplis"
        );
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Format d'email invalide"
        );
      }

      // Validation du mot de passe
      if (password.length < 6) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Le mot de passe doit faire au moins 6 caractères"
        );
      }

      // Vérification des permissions
      const currentUser = req.user;
      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      // Seuls les SUPER_ADMIN et ADMIN peuvent créer des utilisateurs
      if (!["SUPER_ADMIN", "ADMIN"].includes(currentUser.role)) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Permission insuffisante"
        );
      }

      // Un ADMIN ne peut créer que des CASHIER dans sa propre entreprise
      if (currentUser.role === "ADMIN") {
        if (role !== "CASHIER") {
          return sendResponse(
            res,
            HttpStatus.FORBIDDEN,
            "Un administrateur ne peut créer que des caissiers"
          );
        }
        if (companyId && companyId !== currentUser.companyId) {
          return sendResponse(
            res,
            HttpStatus.FORBIDDEN,
            "Vous ne pouvez créer des utilisateurs que pour votre entreprise"
          );
        }
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      const userData = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || "CASHIER",
        companyId: companyId || currentUser.companyId,
      };

      const user = await userService.createUser(userData);

      // Retirer le mot de passe de la réponse
      const { password: _, ...userWithoutPassword } = user;

      return sendResponse(
        res,
        HttpStatus.CREATED,
        "Utilisateur créé avec succès",
        userWithoutPassword
      );
    } catch (error: any) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la création de l'utilisateur"
      );
    }
  }

  // Obtenir les utilisateurs d'une entreprise
  async getUsersByCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const currentUser = req.user;
      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      // Vérifier les permissions
      if (currentUser.role === "CASHIER") {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Permission insuffisante"
        );
      }

      // Un ADMIN ne peut voir que les utilisateurs de sa propre entreprise
      if (currentUser.role === "ADMIN" && currentUser.companyId !== companyId) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Vous ne pouvez voir que les utilisateurs de votre entreprise"
        );
      }

      const result = await userService.getUsersByCompany(
        companyId!,
        parseInt(page as string),
        parseInt(limit as string)
      );

      // Retirer les mots de passe des réponses
      const usersWithoutPasswords = result.users.map((user: any) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return sendResponse(
        res,
        HttpStatus.OK,
        "Utilisateurs récupérés avec succès",
        {
          ...result,
          users: usersWithoutPasswords,
        }
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération des utilisateurs"
      );
    }
  }

  // Obtenir les statistiques des utilisateurs
  async getUserStats(req: Request, res: Response) {
    try {
      const { companyId } = req.query;

      const currentUser = req.user;
      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      // Déterminer l'ID de l'entreprise selon les permissions
      let targetCompanyId: string | undefined;

      if (currentUser.role === "SUPER_ADMIN") {
        targetCompanyId = companyId as string; // Peut voir toutes les entreprises
      } else {
        targetCompanyId = currentUser.companyId || undefined; // Seulement sa propre entreprise
      }

      const stats = await userService.getUserStats(targetCompanyId);

      return sendResponse(
        res,
        HttpStatus.OK,
        "Statistiques récupérées avec succès",
        stats
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération des statistiques"
      );
    }
  }

  // Désactiver un utilisateur
  async deactivateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const currentUser = req.user;

      if (!userId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID utilisateur manquant"
        );
      }

      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      // Vérifier les permissions (seuls SUPER_ADMIN et ADMIN peuvent désactiver)
      if (currentUser.role === "CASHIER" || currentUser.role === "USER") {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Permission insuffisante"
        );
      }

      const result = await userService.updateUserStatus(userId, false);

      return sendResponse(
        res,
        HttpStatus.OK,
        "Utilisateur désactivé avec succès",
        result
      );
    } catch (error: any) {
      console.error("Erreur lors de la désactivation de l'utilisateur:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la désactivation de l'utilisateur"
      );
    }
  }

  // Réactiver un utilisateur
  async activateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const currentUser = req.user;

      if (!userId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID utilisateur manquant"
        );
      }

      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      // Vérifier les permissions (seuls SUPER_ADMIN et ADMIN peuvent réactiver)
      if (currentUser.role === "CASHIER" || currentUser.role === "USER") {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Permission insuffisante"
        );
      }

      const result = await userService.updateUserStatus(userId, true);

      return sendResponse(
        res,
        HttpStatus.OK,
        "Utilisateur réactivé avec succès",
        result
      );
    } catch (error: any) {
      console.error("Erreur lors de la réactivation de l'utilisateur:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la réactivation de l'utilisateur"
      );
    }
  }

  // Réinitialiser le mot de passe d'un utilisateur
  async resetPassword(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const currentUser = req.user;

      if (!userId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID utilisateur manquant"
        );
      }

      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      // Vérifier les permissions (seuls SUPER_ADMIN et ADMIN peuvent réinitialiser)
      if (currentUser.role === "CASHIER" || currentUser.role === "USER") {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Permission insuffisante"
        );
      }

      const result = await userService.resetUserPassword(userId);

      return sendResponse(
        res,
        HttpStatus.OK,
        "Mot de passe réinitialisé avec succès",
        result
      );
    } catch (error: any) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la réinitialisation du mot de passe"
      );
    }
  }
}

export default new UserController();
