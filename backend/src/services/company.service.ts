import { PrismaClient } from "@prisma/client";
import { CompanyCreateData, CompanyUpdateData } from "../types/company.type.js";
import { PaginationParams } from "../types/api.type.js";

class CompanyService {
  private prisma = new PrismaClient();

  async getAllCompanies(paginationParams?: PaginationParams) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
      status = "all",
    } = paginationParams || {};

    const skip = (page - 1) * pageSize;

    // Construction du where clause
    const whereClause: any = {};

    // Filtre par statut
    if (status === "active") {
      whereClause.isActive = true;
    } else if (status === "inactive") {
      whereClause.isActive = false;
    }

    // Filtre de recherche textuelle
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Construction de l'orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: pageSize,
        include: {
          _count: {
            select: {
              employees: true,
              payRuns: true,
            },
          },
        },
      }),
      this.prisma.company.count({ where: whereClause }),
    ]);

    return {
      items: companies,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getCompanyById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            employees: true,
            payRuns: true,
          },
        },
      },
    });

    if (!company) {
      throw new Error("Entreprise non trouvée");
    }
    return company;
  }

  async createCompany(data: CompanyCreateData) {
    // Validation des données
    if (!data.name || data.name.trim() === "") {
      throw new Error("Le nom de l'entreprise est obligatoire");
    }

    if (!data.address || data.address.trim() === "") {
      throw new Error("L'adresse de l'entreprise est obligatoire");
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error("Email invalide");
    }

    return await this.prisma.company.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone || null,
        email: data.email || null,
        currency: data.currency || "EUR",
        logo: data.logo || null,
        payPeriodType: data.payPeriodType || "MONTHLY",
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        _count: {
          select: {
            employees: true,
            payRuns: true,
          },
        },
      },
    });
  }

  async updateCompany(id: string, data: CompanyUpdateData) {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      throw new Error("Entreprise non trouvée");
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error("Email invalide");
    }

    return await this.prisma.company.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            employees: true,
            payRuns: true,
          },
        },
      },
    });
  }

  async deleteCompany(id: string) {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!existingCompany) {
      throw new Error("Entreprise non trouvée");
    }

    // Vérifier s'il y a des employés
    if (existingCompany._count.employees > 0) {
      throw new Error(
        "Impossible de supprimer une entreprise avec des employés actifs"
      );
    }

    await this.prisma.company.delete({
      where: { id },
    });

    return true;
  }

  async getCompanyStats(id: string) {
    return await this.getCompanyById(id);
  }

  async updateCompanyLogo(id: string, logoUrl: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new Error("Entreprise non trouvée");
    }

    return await this.prisma.company.update({
      where: { id },
      data: { logo: logoUrl },
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const companyService = new CompanyService();
