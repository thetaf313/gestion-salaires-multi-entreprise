import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export class UserService {
  // Créer un nouvel utilisateur
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "SUPER_ADMIN" | "ADMIN" | "CASHIER";
    companyId?: string;
  }) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }

      const user = await prisma.user.create({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password, // Le mot de passe sera hashé dans le controller
          role: userData.role,
          companyId: userData.companyId || null,
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

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir tous les utilisateurs d'une entreprise
  async getUsersByCompany(
    companyId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
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
            employee: {
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                position: true,
                phone: true,
                email: true,
              },
            },
          },
        }),
        prisma.user.count({
          where: { companyId },
        }),
      ]);

      return {
        users,
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

  // Obtenir tous les utilisateurs (pour super admin)
  async getAllUsers(page: number = 1, limit: number = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;

      const whereClause = search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" as const } },
              { lastName: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
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
        prisma.user.count({
          where: whereClause,
        }),
      ]);

      return {
        users,
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

  // Obtenir un utilisateur par ID
  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
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

      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(
    id: string,
    updateData: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      role: "SUPER_ADMIN" | "ADMIN" | "CASHIER";
      companyId: string;
      isActive: boolean;
    }>
  ) {
    try {
      const user = await prisma.user.update({
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

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un utilisateur
  async deleteUser(id: string) {
    try {
      await prisma.user.delete({
        where: { id },
      });

      return { message: "Utilisateur supprimé avec succès" };
    } catch (error) {
      throw error;
    }
  }

  // Désactiver/Activer un utilisateur
  async toggleUserStatus(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Statistiques des utilisateurs pour une entreprise
  async getUserStats(companyId?: string) {
    try {
      const whereClause = companyId ? { companyId } : {};

      const [total, active, inactive, admins, cashiers, superAdmins] =
        await Promise.all([
          prisma.user.count({ where: whereClause }),
          prisma.user.count({ where: { ...whereClause, isActive: true } }),
          prisma.user.count({ where: { ...whereClause, isActive: false } }),
          prisma.user.count({ where: { ...whereClause, role: "ADMIN" } }),
          prisma.user.count({ where: { ...whereClause, role: "CASHIER" } }),
          prisma.user.count({ where: { ...whereClause, role: "SUPER_ADMIN" } }),
        ]);

      return {
        total,
        active,
        inactive,
        admins,
        cashiers,
        superAdmins,
      };
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour le statut d'un utilisateur (actif/inactif)
  async updateUserStatus(userId: string, isActive: boolean) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Réinitialiser le mot de passe d'un utilisateur
  async resetUserPassword(userId: string) {
    try {
      // Générer un nouveau mot de passe temporaire
      const newPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const user = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        user,
        newPassword, // Retourner le mot de passe en clair pour l'afficher à l'admin
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
