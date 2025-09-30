import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class EmployeeService {
  // Créer un nouvel employé
  async createEmployee(employeeData: {
    employeeCode?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    position: string;
    contractType: "DAILY" | "FIXED" | "HONORARIUM";
    dailyRate?: number;
    fixedSalary?: number;
    hourlyRate?: number;
    hireDate: Date;
    companyId: string;
  }) {
    try {
      // Générer un code employé unique si non fourni
      const employeeCode =
        employeeData.employeeCode ||
        `EMP${Date.now()}${Math.random()
          .toString(36)
          .substr(2, 3)
          .toUpperCase()}`;

      const employee = await prisma.employee.create({
        data: {
          employeeCode,
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: employeeData.email || null,
          phone: employeeData.phone || null,
          position: employeeData.position,
          contractType: employeeData.contractType,
          dailyRate: employeeData.dailyRate || null,
          fixedSalary: employeeData.fixedSalary || null,
          hourlyRate: employeeData.hourlyRate || null,
          hireDate: employeeData.hireDate,
          companyId: employeeData.companyId,
          isActive: true,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return employee;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir tous les employés d'une entreprise
  async getEmployeesByCompany(
    companyId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const skip = (page - 1) * limit;

      const [employees, total] = await Promise.all([
        prisma.employee.findMany({
          where: { companyId },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.employee.count({
          where: { companyId },
        }),
      ]);

      return {
        employees,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir un employé par ID
  async getEmployeeById(id: string) {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!employee) {
        throw new Error("Employé non trouvé");
      }

      return employee;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un employé
  async updateEmployee(
    id: string,
    updateData: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      position: string;
      contractType: "DAILY" | "FIXED" | "HONORARIUM";
      dailyRate: number;
      fixedSalary: number;
      hourlyRate: number;
      hireDate: Date;
      isActive: boolean;
    }>
  ) {
    try {
      const employee = await prisma.employee.update({
        where: { id },
        data: updateData,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return employee;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un employé
  async deleteEmployee(id: string) {
    try {
      await prisma.employee.delete({
        where: { id },
      });

      return { message: "Employé supprimé avec succès" };
    } catch (error) {
      throw error;
    }
  }

  // Statistiques des employés pour une entreprise
  async getEmployeeStats(companyId: string) {
    try {
      const [total, active, inactive, daily, fixed, honorarium] =
        await Promise.all([
          prisma.employee.count({ where: { companyId } }),
          prisma.employee.count({ where: { companyId, isActive: true } }),
          prisma.employee.count({ where: { companyId, isActive: false } }),
          prisma.employee.count({
            where: { companyId, contractType: "DAILY" },
          }),
          prisma.employee.count({
            where: { companyId, contractType: "FIXED" },
          }),
          prisma.employee.count({
            where: { companyId, contractType: "HONORARIUM" },
          }),
        ]);

      const totalSalary = await prisma.employee.aggregate({
        where: { companyId, isActive: true },
        _sum: {
          fixedSalary: true,
        },
      });

      return {
        total,
        active,
        inactive,
        contractTypes: {
          daily,
          fixed,
          honorarium,
        },
        totalMonthlySalary: totalSalary._sum?.fixedSalary || 0,
      };
    } catch (error) {
      throw error;
    }
  }

  // Rechercher des employés
  async searchEmployees(companyId: string, query: string) {
    try {
      const employees = await prisma.employee.findMany({
        where: {
          companyId,
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { email: { contains: query } },
            { position: { contains: query } },
          ],
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return employees;
    } catch (error) {
      throw error;
    }
  }
}

export default new EmployeeService();
