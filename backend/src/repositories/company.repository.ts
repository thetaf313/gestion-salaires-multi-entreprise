import { $Enums, Company, PrismaClient } from "@prisma/client";
import BaseRepository from "./base.repository.js";
import { CompanyResponse } from "../types/company.type.js";
import { PaginationParams } from "../types/api.type.js";

class CompanyRepository implements BaseRepository<Company> {
  private prisma = new PrismaClient();

  async findAll(
    paginationParams?: PaginationParams
  ): Promise<{ items: Company[]; total: number }> {
    const {
      page = 1,
      pageSize = 5,
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

    // Filtre de recherche textuelle (MySQL ne supporte pas mode: "insensitive")
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
      }),
      this.prisma.company.count({ where: whereClause }),
    ]);

    return {
      items: companies,
      total,
    };
  }

  async findById(id: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });
    return company || null;
  }

  async create(data: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company> {
    const company = await this.prisma.company.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return company;
  }

  async update(data: Partial<Company> & { id: string }): Promise<Company | null> {
    const company = await this.prisma.company.update({
      where: { id: data.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return company || null;
  }

  async update(
    id: string,
    item: Partial<{
      name: string;
      id: string;
      address: string | null;
      phone: string | null;
      email: string | null;
      logo: string | null;
      currency: string;
      payPeriodType: $Enums.PayPeriodType;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>
  ): Promise<{
    name: string;
    id: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    logo: string | null;
    currency: string;
    payPeriodType: $Enums.PayPeriodType;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
