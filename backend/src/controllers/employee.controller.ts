import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
// @ts-ignore
import { employeeUserService } from "../services/employeeUser.service.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/response.js";

const prisma = new PrismaClient();

class EmployeeController {
  // Créer un nouvel employé (utilise le nouveau système employeeUser)
  async createEmployee(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const employeeData = req.body;

      // Validation du companyId
      if (!companyId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "L'ID de l'entreprise est requis"
        );
      }

      // Vérifier que l'entreprise existe
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return sendResponse(
          res,
          HttpStatus.NOT_FOUND,
          "Entreprise non trouvée"
        );
      }

      // Utiliser le service employeeUser pour créer l'employé
      const newEmployee = await employeeUserService.createEmployee(
        companyId,
        employeeData
      );

      return sendResponse(
        res,
        HttpStatus.CREATED,
        "Employé créé avec succès",
        newEmployee
      );
    } catch (error: any) {
      console.error("Erreur lors de la création de l'employé:", error);
      if (error.message) {
        return sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
      }

      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Erreur interne du serveur"
      );
    }
  }

  // Obtenir les employés d'une entreprise avec pagination
  async getEmployeesByCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { page = 1, limit = 10, search = "" } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const whereClause: any = {
        companyId,
        isActive: true,
      };

      if (search) {
        whereClause.OR = [
          { firstName: { contains: search as string } },
          { lastName: { contains: search as string } },
          { email: { contains: search as string } },
          { employeeCode: { contains: search as string } },
        ];
      }

      const [employees, total] = await Promise.all([
        prisma.employee.findMany({
          where: whereClause,
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limitNum,
        }),
        prisma.employee.count({ where: whereClause }),
      ]);

      return sendResponse(
        res,
        HttpStatus.OK,
        "Employés récupérés avec succès",
        {
          employees,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            itemsPerPage: limitNum,
          },
        }
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération des employés:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Erreur interne du serveur"
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
          "L'ID de l'employé est requis"
        );
      }

      const employee = await prisma.employee.findFirst({
        where: { id: employeeId },
        include: {
          company: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!employee) {
        return sendResponse(res, HttpStatus.NOT_FOUND, "Employé non trouvé");
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
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Erreur interne du serveur"
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
          "L'ID de l'employé est requis"
        );
      }

      // Vérifier que l'employé existe
      const existingEmployee = await prisma.employee.findFirst({
        where: { id: employeeId },
      });

      if (!existingEmployee) {
        return sendResponse(res, HttpStatus.NOT_FOUND, "Employé non trouvé");
      }

      // Convertir la date d'embauche si présente
      if (updateData.hireDate && typeof updateData.hireDate === 'string') {
        updateData.hireDate = new Date(updateData.hireDate + 'T00:00:00.000Z');
      }

      // Mettre à jour l'employé
      const employee = await prisma.employee.update({
        where: { id: employeeId },
        data: updateData,
        include: {
          company: {
            select: {
              name: true,
            },
          },
        },
      });

      return sendResponse(
        res,
        HttpStatus.OK,
        "Employé mis à jour avec succès",
        employee
      );
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Erreur interne du serveur"
      );
    }
  }

  // Supprimer un employé (désactivation)
  async deleteEmployee(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "L'ID de l'employé est requis"
        );
      }

      // Vérifier que l'employé existe
      const existingEmployee = await prisma.employee.findFirst({
        where: { id: employeeId },
      });

      if (!existingEmployee) {
        return sendResponse(res, HttpStatus.NOT_FOUND, "Employé non trouvé");
      }

      // Désactiver l'employé au lieu de le supprimer
      await prisma.employee.updateMany({
        where: { id: employeeId },
        data: { isActive: false },
      });

      // Récupérer l'employé mis à jour
      const deletedEmployee = await prisma.employee.findFirst({
        where: { id: employeeId },
      });

      return sendResponse(
        res,
        HttpStatus.OK,
        "Employé supprimé avec succès",
        deletedEmployee
      );
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'employé:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Erreur interne du serveur"
      );
    }
  }

  // Rechercher des employés
  async searchEmployees(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { search = "" } = req.query;

      if (!companyId) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "L'ID de l'entreprise est requis"
        );
      }

      if (!search) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Le terme de recherche est requis"
        );
      }

      const employees = await prisma.employee.findMany({
        where: {
          companyId,
          isActive: true,
          OR: [
            { firstName: { contains: search as string } },
            { lastName: { contains: search as string } },
            { email: { contains: search as string } },
            { employeeCode: { contains: search as string } },
          ],
        },
        include: {
          company: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50, // Limiter à 50 résultats
      });

      return sendResponse(
        res,
        HttpStatus.OK,
        "Recherche terminée avec succès",
        employees
      );
    } catch (error: any) {
      console.error("Erreur lors de la recherche d'employés:", error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Erreur interne du serveur"
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
          "L'ID de l'entreprise est requis"
        );
      }

      // Statistiques complètes comme attendues par le frontend
      const [total, active, inactive, dailyCount, fixedCount, honorariumCount] =
        await Promise.all([
          prisma.employee.count({ where: { companyId } }),
          prisma.employee.count({ where: { companyId, isActive: true } }),
          prisma.employee.count({ where: { companyId, isActive: false } }),
          prisma.employee.count({
            where: { companyId, contractType: "DAILY", isActive: true },
          }),
          prisma.employee.count({
            where: { companyId, contractType: "FIXED", isActive: true },
          }),
          prisma.employee.count({
            where: { companyId, contractType: "HONORARIUM", isActive: true },
          }),
        ]);

      // Calcul du salaire total (seulement pour les employés actifs avec salaire fixe)
      const totalSalary = await prisma.employee.aggregate({
        where: { companyId, isActive: true, fixedSalary: { not: null } },
        _sum: {
          fixedSalary: true,
        },
      });

      const stats = {
        total,
        active,
        inactive,
        contractTypes: {
          daily: dailyCount,
          fixed: fixedCount,
          honorarium: honorariumCount,
        },
        totalMonthlySalary: Number(totalSalary._sum?.fixedSalary || 0),
      };

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
        "Erreur interne du serveur"
      );
    }
  }
}

export default new EmployeeController();
