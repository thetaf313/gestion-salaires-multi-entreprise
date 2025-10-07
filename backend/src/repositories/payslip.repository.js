import { BaseRepository } from "./base.repository.js";

export class PayslipRepository extends BaseRepository {
  constructor() {
    super("payslip");
  }

  /**
   * Trouve les bulletins de paie par cycle de paie
   */
  async findByPayRun(payRunId, options = {}) {
    const include = {
      employee: true,
      deductions: true,
      payments: true,
      ...options.include,
    };

    return await this.prisma.payslip.findMany({
      where: { payRunId },
      include,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Trouve les bulletins de paie par employé
   */
  async findByEmployee(employeeId, options = {}) {
    const include = {
      payRun: true,
      deductions: true,
      payments: true,
      ...options.include,
    };

    return await this.prisma.payslip.findMany({
      where: { employeeId },
      include,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Compte les bulletins par cycle de paie
   */
  async countByPayRun(payRunId) {
    return await this.prisma.payslip.count({
      where: { payRunId },
    });
  }

  /**
   * Trouve les bulletins de paie par entreprise
   */
  async findByCompany(companyId, options = {}) {
    const { page = 1, limit = 10, status, employeeId } = options;
    const skip = (page - 1) * limit;

    const where = {
      payRun: {
        companyId,
      },
    };

    if (status) {
      where.status = status;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    const include = {
      employee: true,
      payRun: true,
      deductions: true,
      payments: true,
    };

    const [payslips, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.payslip.count({ where }),
    ]);

    return {
      payslips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Crée une déduction pour un bulletin de paie
   */
  async createDeduction(payslipId, deductionData) {
    return await this.prisma.payslipDeduction.create({
      data: {
        ...deductionData,
        payslipId,
      },
    });
  }

  /**
   * Met à jour le statut d'un bulletin de paie
   */
  async updateStatus(payslipId, status, options = {}) {
    const data = { status };

    if (status === "PAID") {
      data.amountPaid = options.amountPaid || 0;
    }

    return await this.update(payslipId, data);
  }

  /**
   * Récupère les statistiques des bulletins de paie pour une entreprise
   */
  async getCompanyStats(companyId) {
    const stats = await this.prisma.payslip.groupBy({
      by: ["status"],
      where: {
        payRun: {
          companyId,
        },
      },
      _count: {
        status: true,
      },
      _sum: {
        grossAmount: true,
        netAmount: true,
        totalDeductions: true,
      },
    });

    const totalPayslips = await this.prisma.payslip.count({
      where: {
        payRun: {
          companyId,
        },
      },
    });

    const result = {
      totalPayslips,
      pendingPayslips: 0,
      partialPayslips: 0,
      paidPayslips: 0,
      totalGross: 0,
      totalNet: 0,
      totalDeductions: 0,
    };

    stats.forEach((stat) => {
      switch (stat.status) {
        case "PENDING":
          result.pendingPayslips = stat._count.status;
          break;
        case "PARTIAL":
          result.partialPayslips = stat._count.status;
          break;
        case "PAID":
          result.paidPayslips = stat._count.status;
          break;
      }

      result.totalGross += Number(stat._sum.grossAmount) || 0;
      result.totalNet += Number(stat._sum.netAmount) || 0;
      result.totalDeductions += Number(stat._sum.totalDeductions) || 0;
    });

    return result;
  }

  /**
   * Récupère les bulletins avec détails complets
   */
  async findWithDetails(payslipId) {
    return await this.prisma.payslip.findUnique({
      where: { id: payslipId },
      include: {
        employee: {
          include: {
            company: true,
          },
        },
        payRun: true,
        deductions: true,
        payments: {
          include: {
            processedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Recherche les bulletins de paie
   */
  async search(companyId, searchQuery, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where = {
      payRun: {
        companyId,
      },
      OR: [
        {
          payslipNumber: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          employee: {
            firstName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          employee: {
            lastName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          employee: {
            employeeCode: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
      ],
    };

    const include = {
      employee: true,
      payRun: true,
      deductions: true,
    };

    const [payslips, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.payslip.count({ where }),
    ]);

    return {
      payslips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export const payslipRepository = new PayslipRepository();
