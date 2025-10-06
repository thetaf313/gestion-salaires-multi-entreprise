import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { CreateEmployeeSchema } from "../schemas/employee.schemas.ts";

const prisma = new PrismaClient();

class EmployeeUserService {
  // Rechercher un employé par email ou matricule
  async searchEmployee(companyId, searchTerm) {
    const employee = await prisma.employee.findFirst({
      where: {
        companyId,
        isActive: true,
        AND: [
          {
            user: null, // L'employé ne doit pas avoir déjà un compte utilisateur
          },
          {
            OR: [
              { email: { contains: searchTerm } },
              { employeeCode: { contains: searchTerm } },
            ],
          },
        ],
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    return employee;
  }

  // Créer un compte utilisateur pour un employé
  async createUserForEmployee(employeeId, userData) {
    const { password } = userData;

    // Vérifier que l'employé existe et n'a pas déjà un compte
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: true,
        company: true,
      },
    });

    if (!employee) {
      throw new Error("Employé non trouvé");
    }

    if (employee.user) {
      throw new Error("Cet employé a déjà un compte utilisateur");
    }

    if (!employee.email) {
      throw new Error("L'employé doit avoir un email pour créer un compte");
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le compte utilisateur
    const user = await prisma.user.create({
      data: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        password: hashedPassword,
        role: "USER", // Employé simple
        isActive: true,
        companyId: employee.companyId,
        employeeId: employee.id,
      },
      include: {
        employee: {
          select: {
            employeeCode: true,
            position: true,
            qrCode: true,
          },
        },
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    // Générer les tokens pour la connexion automatique
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      employeeId: user.employeeId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  // Obtenir la liste des employés sans compte utilisateur
  async getEmployeesWithoutUser(companyId) {
    const employees = await prisma.employee.findMany({
      where: {
        companyId,
        isActive: true,
        user: null, // Sans compte utilisateur
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        hireDate: true,
        qrCode: true,
      },
      orderBy: {
        employeeCode: "asc",
      },
    });

    return employees;
  }

  // Obtenir le profil complet d'un employé-utilisateur
  async getEmployeeUserProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          include: {
            company: {
              select: {
                name: true,
                email: true,
                phone: true,
                address: true,
              },
            },
          },
        },
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    return user;
  }

  // Créer un nouvel employé avec un compte utilisateur
  async createEmployee(companyId, employeeData) {
    // Générer un matricule automatique si non fourni
    if (!employeeData.employeeCode) {
      const existingCount = await prisma.employee.count({
        where: { companyId },
      });
      employeeData.employeeCode = `EMP${String(existingCount + 1).padStart(
        4,
        "0"
      )}`;
    }

    // Vérifier l'unicité du matricule
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        companyId,
        employeeCode: employeeData.employeeCode,
      },
    });

    if (existingEmployee) {
      throw new Error("Un employé avec ce matricule existe déjà");
    }

    // Vérifier l'unicité de l'email
    const existingUser = await prisma.user.findUnique({
      where: { email: employeeData.email },
    });

    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Déterminer le rôle (par défaut USER si non spécifié)
    const role = employeeData.role || "USER";

    // Générer le QR Code avec le matricule
    const QRCode = await import("qrcode");
    const qrCodeData = await QRCode.toDataURL(employeeData.employeeCode);

    // Créer l'employé et l'utilisateur en transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email: employeeData.email,
          password: hashedPassword,
          role,
          companyId,
        },
      });

      // Créer l'employé
      const employee = await prisma.employee.create({
        data: {
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: employeeData.email,
          phone: employeeData.phone || null,
          address: employeeData.address || null,
          employeeCode: employeeData.employeeCode,
          position: employeeData.position,
          contractType: employeeData.contractType,
          hireDate: new Date(employeeData.hireDate),
          dailyRate: employeeData.dailyRate || null,
          fixedSalary: employeeData.fixedSalary || null,
          hourlyRate: employeeData.hourlyRate || null,
          bankName: employeeData.bankName || null,
          accountNumber: employeeData.accountNumber || null,
          qrCode: qrCodeData,
          companyId,
          userId: user.id,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { employee, tempPassword };
    });

    return result;
  }

  // Créer un nouvel employé avec validation et QR code
  async createEmployee(companyId, employeeData) {
    try {
      // Préparer les données avec les conversions de types nécessaires
      const dataToValidate = {
        ...employeeData,
        companyId,
        hireDate: employeeData.hireDate
          ? new Date(employeeData.hireDate)
          : new Date(),
        // Garder les montants comme string pour préserver la précision avec Decimal
        dailyRate: employeeData.dailyRate
          ? employeeData.dailyRate.toString()
          : null,
        fixedSalary: employeeData.fixedSalary
          ? employeeData.fixedSalary.toString()
          : null,
        hourlyRate: employeeData.hourlyRate
          ? employeeData.hourlyRate.toString()
          : null,
      };

      // Validation des données avec le schéma Zod
      const validatedData = CreateEmployeeSchema.parse(dataToValidate);

      // Vérifier que l'entreprise existe
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new Error("Entreprise non trouvée");
      }

      // Vérifier l'unicité de l'email dans l'entreprise
      if (validatedData.email) {
        const existingEmployee = await prisma.employee.findFirst({
          where: {
            companyId,
            email: validatedData.email,
            isActive: true,
          },
        });

        if (existingEmployee) {
          throw new Error(
            "Un employé avec cet email existe déjà dans cette entreprise"
          );
        }
      }

      // Générer un code employé unique s'il n'est pas fourni
      let employeeCode = validatedData.employeeCode;
      if (!employeeCode) {
        // Générer un code basé sur l'entreprise et un compteur GLOBAL pour garantir l'unicité
        const companyPrefix = company.name.substring(0, 3).toUpperCase();
        const companyIdSuffix = companyId.slice(-4).toUpperCase(); // 4 derniers caractères de l'ID entreprise

        // Compter tous les employés de cette entreprise
        const employeeCount = await prisma.employee.count({
          where: { companyId },
        });

        employeeCode = `${companyPrefix}${companyIdSuffix}${(employeeCount + 1)
          .toString()
          .padStart(3, "0")}`;
      }

      // Vérifier l'unicité GLOBALE du code employé
      const existingCode = await prisma.employee.findFirst({
        where: {
          employeeCode,
          isActive: true,
        },
      });

      if (existingCode) {
        // Si le code existe déjà, générer un code avec timestamp pour garantir l'unicité
        const timestamp = Date.now().toString().slice(-4);
        const companyPrefix = company.name.substring(0, 3).toUpperCase();
        employeeCode = `${companyPrefix}${timestamp}`;

        // Vérifier encore une fois
        const finalCheck = await prisma.employee.findFirst({
          where: {
            employeeCode,
            isActive: true,
          },
        });

        if (finalCheck) {
          throw new Error(
            "Impossible de générer un code employé unique. Veuillez réessayer."
          );
        }
      }

      // Générer le QR code
      const qrCodeData = employeeCode;
      const qrCodeImage = await QRCode.toDataURL(qrCodeData);

      // Créer l'employé
      const employee = await prisma.employee.create({
        data: {
          ...validatedData,
          employeeCode,
          qrCode: qrCodeImage,
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
      console.error("🔥 Erreur dans createEmployee:", error);
      if (error.name === "ZodError") {
        console.error("🔥 Erreurs de validation Zod:", error.errors);
        const errorMessages = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw new Error(`Erreurs de validation: ${errorMessages}`);
      }
      throw error;
    }
  }
}

export const employeeUserService = new EmployeeUserService();
