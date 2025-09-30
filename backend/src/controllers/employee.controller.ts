import { Request, Response } from "express";
import employeeService from "../services/employee.service.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/response.js";

export class EmployeeController {
  // Créer un nouvel employé
  async createEmployee(req: Request, res: Response) {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        position,
        contractType,
        dailyRate,
        fixedSalary,
        hourlyRate,
        hireDate,
        companyId,
      } = req.body;

      // Validation basique
      if (
        !firstName ||
        !lastName ||
        !position ||
        !contractType ||
        !hireDate ||
        !companyId
      ) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Tous les champs obligatoires doivent être remplis"
        );
      }

      // Validation du type de contrat et salaire correspondant
      if (contractType === "DAILY" && !dailyRate) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Le taux journalier est requis pour un contrat journalier"
        );
      }
      if (contractType === "FIXED" && !fixedSalary) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Le salaire fixe est requis pour un contrat fixe"
        );
      }
      if (contractType === "HONORARIUM" && !hourlyRate) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Le taux horaire est requis pour un honoraire"
        );
      }

      const currentUser = req.user;
      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      // Vérification des permissions
      if (currentUser.role === "CASHIER") {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Permission insuffisante"
        );
      }

      // Un ADMIN ne peut créer des employés que pour sa propre entreprise
      if (currentUser.role === "ADMIN" && currentUser.companyId !== companyId) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Vous ne pouvez créer des employés que pour votre entreprise"
        );
      }

      const employeeData: any = {
        firstName,
        lastName,
        position,
        contractType,
        hireDate: new Date(hireDate),
        companyId,
      };

      // Ajouter les champs optionnels seulement s'ils sont définis
      if (email) employeeData.email = email;
      if (phone) employeeData.phone = phone;

      // Ajouter le type de salaire correspondant au contrat
      if (contractType === "DAILY" && dailyRate) {
        employeeData.dailyRate = parseFloat(dailyRate);
      } else if (contractType === "FIXED" && fixedSalary) {
        employeeData.fixedSalary = parseFloat(fixedSalary);
      } else if (contractType === "HONORARIUM" && hourlyRate) {
        employeeData.hourlyRate = parseFloat(hourlyRate);
      }

      const employee = await employeeService.createEmployee(employeeData);

      return sendResponse(
        res,
        HttpStatus.CREATED,
        "Employé créé avec succès",
        employee
      );
    } catch (error: any) {
      console.error("Erreur lors de la création de l'employé:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la création de l'employé"
      );
    }
  }

  // Obtenir les employés d'une entreprise
  async getEmployeesByCompany(req: Request, res: Response) {
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

      // Un ADMIN ne peut voir que les employés de sa propre entreprise
      if (currentUser.role === "ADMIN" && currentUser.companyId !== companyId) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Vous ne pouvez voir que les employés de votre entreprise"
        );
      }

      if (!companyId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID de l'entreprise requis"
        );
      }

      const result = await employeeService.getEmployeesByCompany(
        companyId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      return sendResponse(
        res,
        HttpStatus.OK,
        "Employés récupérés avec succès",
        result
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération des employés:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération des employés"
      );
    }
  }

  // Obtenir un employé par ID
  async getEmployeeById(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID de l'employé requis"
        );
      }

      const currentUser = req.user;
      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      const employee = await employeeService.getEmployeeById(employeeId);

      // Vérifier les permissions
      if (
        currentUser.role === "ADMIN" &&
        employee.companyId !== currentUser.companyId
      ) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Permission insuffisante"
        );
      }

      return sendResponse(
        res,
        HttpStatus.OK,
        "Employé récupéré avec succès",
        employee
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération de l'employé:", error);
      return sendResponse(
        res,
        HttpStatus.NOT_FOUND,
        error.message || "Employé non trouvé"
      );
    }
  }

  // Mettre à jour un employé
  async updateEmployee(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const updateData = req.body;

      if (!employeeId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID de l'employé requis"
        );
      }

      const currentUser = req.user;
      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      // Récupérer l'employé à modifier
      const employeeToUpdate = await employeeService.getEmployeeById(
        employeeId
      );

      // Vérifier les permissions
      if (currentUser.role === "CASHIER") {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Permission insuffisante"
        );
      }

      if (
        currentUser.role === "ADMIN" &&
        employeeToUpdate.companyId !== currentUser.companyId
      ) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Vous ne pouvez modifier que les employés de votre entreprise"
        );
      }

      // Conversion des montants en nombres si fournis
      if (updateData.dailyRate)
        updateData.dailyRate = parseFloat(updateData.dailyRate);
      if (updateData.fixedSalary)
        updateData.fixedSalary = parseFloat(updateData.fixedSalary);
      if (updateData.hourlyRate)
        updateData.hourlyRate = parseFloat(updateData.hourlyRate);
      if (updateData.hireDate)
        updateData.hireDate = new Date(updateData.hireDate);

      const updatedEmployee = await employeeService.updateEmployee(
        employeeId,
        updateData
      );

      return sendResponse(
        res,
        HttpStatus.OK,
        "Employé mis à jour avec succès",
        updatedEmployee
      );
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la mise à jour de l'employé"
      );
    }
  }

  // Supprimer un employé
  async deleteEmployee(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID de l'employé requis"
        );
      }

      const currentUser = req.user;
      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      // Récupérer l'employé à supprimer
      const employeeToDelete = await employeeService.getEmployeeById(
        employeeId
      );

      // Vérifier les permissions
      if (currentUser.role === "CASHIER") {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Permission insuffisante"
        );
      }

      if (
        currentUser.role === "ADMIN" &&
        employeeToDelete.companyId !== currentUser.companyId
      ) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Vous ne pouvez supprimer que les employés de votre entreprise"
        );
      }

      await employeeService.deleteEmployee(employeeId);

      return sendResponse(res, HttpStatus.OK, "Employé supprimé avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'employé:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la suppression de l'employé"
      );
    }
  }

  // Obtenir les statistiques des employés
  async getEmployeeStats(req: Request, res: Response) {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID de l'entreprise requis"
        );
      }

      const currentUser = req.user;
      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      // Vérifier les permissions
      if (currentUser.role === "ADMIN" && currentUser.companyId !== companyId) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Vous ne pouvez voir que les statistiques de votre entreprise"
        );
      }

      const stats = await employeeService.getEmployeeStats(companyId);

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

  // Rechercher des employés
  async searchEmployees(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { query } = req.query;

      if (!companyId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID de l'entreprise requis"
        );
      }

      if (!query || typeof query !== "string") {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Paramètre de recherche requis"
        );
      }

      const currentUser = req.user;
      if (!currentUser) {
        return sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié"
        );
      }

      // Vérifier les permissions
      if (currentUser.role === "ADMIN" && currentUser.companyId !== companyId) {
        return sendResponse(
          res,
          HttpStatus.FORBIDDEN,
          "Vous ne pouvez rechercher que dans votre entreprise"
        );
      }

      const employees = await employeeService.searchEmployees(companyId, query);

      return sendResponse(
        res,
        HttpStatus.OK,
        "Recherche effectuée avec succès",
        employees
      );
    } catch (error: any) {
      console.error("Erreur lors de la recherche:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la recherche"
      );
    }
  }
}

export default new EmployeeController();
