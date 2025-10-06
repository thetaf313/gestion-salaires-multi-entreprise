import { PrismaClient } from "@prisma/client";
import { employeeUserService } from "../services/employeeUser.service.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { Messages } from "../constants/messages.js";
import { sendResponse } from "../utils/response.js";

const prisma = new PrismaClient();

class EmployeeUserController {
  // Rechercher un employé par email ou matricule
  async searchEmployee(req, res) {
    try {
      const { companyId } = req.user;
      const { searchTerm } = req.query;

      if (!searchTerm || searchTerm.trim().length < 2) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Le terme de recherche doit contenir au moins 2 caractères"
        );
      }

      const employee = await employeeUserService.searchEmployee(
        companyId,
        searchTerm.trim()
      );

      if (!employee) {
        return sendResponse(
          res,
          HttpStatus.NOT_FOUND,
          "Aucun employé trouvé ou l'employé a déjà un compte utilisateur"
        );
      }

      return sendResponse(res, HttpStatus.OK, "Employé trouvé", employee);
    } catch (error) {
      console.error("Erreur lors de la recherche de l'employé:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        Messages.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Créer un compte utilisateur pour un employé
  async createUserForEmployee(req, res) {
    try {
      const { employeeId } = req.params;
      const { password } = req.body;
      const { companyId } = req.user;

      if (!password || password.length < 6) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          false,
          "Le mot de passe doit contenir au moins 6 caractères"
        );
      }

      // Vérifier que l'employé appartient à la même entreprise
      const employee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          companyId: companyId,
        },
      });

      if (!employee) {
        return sendResponse(
          res,
          HttpStatus.NOT_FOUND,
          "Employé non trouvé ou non autorisé"
        );
      }

      const result = await employeeUserService.createUserForEmployee(
        employeeId,
        { password }
      );

      return sendResponse(
        res,
        HttpStatus.CREATED,
        true,
        "Compte utilisateur créé avec succès",
        result
      );
    } catch (error) {
      console.error("Erreur lors de la création du compte utilisateur:", error);

      if (
        error.message.includes("déjà un compte") ||
        error.message.includes("non trouvé") ||
        error.message.includes("email")
      ) {
        return sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
      }

      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        Messages.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Obtenir la liste des employés sans compte utilisateur
  async getEmployeesWithoutUser(req, res) {
    try {
      const { companyId } = req.user;

      const employees = await employeeUserService.getEmployeesWithoutUser(
        companyId
      );

      return sendResponse(
        res,
        HttpStatus.OK,
        true,
        "Liste des employés sans compte utilisateur",
        employees
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        false,
        Messages.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Obtenir le profil complet d'un employé-utilisateur
  async getEmployeeUserProfile(req, res) {
    try {
      const { id: userId } = req.user;

      const profile = await employeeUserService.getEmployeeUserProfile(userId);

      if (!profile) {
        return sendResponse(
          res,
          HttpStatus.NOT_FOUND,
          false,
          "Profil utilisateur non trouvé"
        );
      }

      return sendResponse(
        res,
        HttpStatus.OK,
        true,
        "Profil utilisateur récupéré",
        profile
      );
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        false,
        Messages.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Obtenir le QR code de l'employé connecté
  async getMyQRCode(req, res) {
    try {
      const { employeeId } = req.user;

      if (!employeeId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          false,
          "Utilisateur non associé à un employé"
        );
      }

      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
          employeeCode: true,
          firstName: true,
          lastName: true,
          qrCode: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!employee) {
        return sendResponse(
          res,
          HttpStatus.NOT_FOUND,
          false,
          "Employé non trouvé"
        );
      }

      return sendResponse(
        res,
        HttpStatus.OK,
        true,
        "QR Code récupéré",
        employee
      );
    } catch (error) {
      console.error("Erreur lors de la récupération du QR code:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        false,
        Messages.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const employeeUserController = new EmployeeUserController();
