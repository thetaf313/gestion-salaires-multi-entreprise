import { BaseRepository } from "./base.repository.js";

export class PayRunRepository extends BaseRepository {
  constructor() {
    super("payRun");
  }

  /**
   * Trouve les cycles de paie par entreprise
   */
  async findByCompany(companyId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;

    const where = { companyId };

    if (status) {
      where.status = status;
    }

    const include = {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      payslips: {
        select: {
          id: true,
          status: true,
          grossAmount: true,
          netAmount: true,
        },
      },
      _count: {
        select: {
          payslips: true,
        },
      },
    };

    const [payRuns, total] = await Promise.all([
      this.prisma.payRun.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.payRun.count({ where }),
    ]);

    // Ajouter le compte des bulletins dans les résultats
    const payRunsWithCounts = payRuns.map((payRun) => ({
      ...payRun,
      payslipsCount: payRun._count.payslips,
    }));

    return {
      payRuns: payRunsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Trouve un cycle de paie avec tous ses détails
   */
  async findWithDetails(payRunId) {
    return await this.prisma.payRun.findUnique({
      where: { id: payRunId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        payslips: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeCode: true,
                contractType: true,
                position: true,
              },
            },
            deductions: true,
            payments: true,
          },
        },
      },
    });
  }

  /**
   * Met à jour le statut d'un cycle de paie
   */
  async updateStatus(payRunId, status, options = {}) {
    const data = { status };

    if (status === "APPROVED") {
      data.approvedAt = new Date();
      if (options.approvedById) {
        data.approvedById = options.approvedById;
      }
    }

    return await this.update(payRunId, data);
  }

  /**
   * Récupère les statistiques des cycles de paie pour une entreprise
   */
  async getCompanyStats(companyId) {
    const stats = await this.prisma.payRun.groupBy({
      by: ["status"],
      where: { companyId },
      _count: {
        status: true,
      },
      _sum: {
        totalGross: true,
        totalNet: true,
        totalPaid: true,
      },
    });

    const totalPayRuns = await this.prisma.payRun.count({
      where: { companyId },
    });

    const result = {
      totalPayRuns,
      draftPayRuns: 0,
      approvedPayRuns: 0,
      closedPayRuns: 0,
      totalGross: 0,
      totalNet: 0,
      totalPaid: 0,
    };

    stats.forEach((stat) => {
      switch (stat.status) {
        case "DRAFT":
          result.draftPayRuns = stat._count.status;
          break;
        case "APPROVED":
          result.approvedPayRuns = stat._count.status;
          break;
        case "CLOSED":
          result.closedPayRuns = stat._count.status;
          break;
      }

      result.totalGross += Number(stat._sum.totalGross) || 0;
      result.totalNet += Number(stat._sum.totalNet) || 0;
      result.totalPaid += Number(stat._sum.totalPaid) || 0;
    });

    return result;
  }

  /**
   * Vérifie s'il y a des cycles de paie qui se chevauchent
   */
  async checkOverlapping(companyId, startDate, endDate, excludeId = null) {
    const where = {
      companyId,
      OR: [
        {
          periodStart: {
            lte: new Date(endDate),
          },
          periodEnd: {
            gte: new Date(startDate),
          },
        },
      ],
    };

    if (excludeId) {
      where.id = {
        not: excludeId,
      };
    }

    const overlapping = await this.prisma.payRun.findMany({
      where,
      select: {
        id: true,
        title: true,
        periodStart: true,
        periodEnd: true,
        status: true,
      },
    });

    return overlapping;
  }

  /**
   * Recherche les cycles de paie
   */
  async search(companyId, searchQuery, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      OR: [
        {
          title: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
      ],
    };

    const include = {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          payslips: true,
        },
      },
    };

    const [payRuns, total] = await Promise.all([
      this.prisma.payRun.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.payRun.count({ where }),
    ]);

    const payRunsWithCounts = payRuns.map((payRun) => ({
      ...payRun,
      payslipsCount: payRun._count.payslips,
    }));

    return {
      payRuns: payRunsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère le dernier cycle de paie d'une entreprise
   */
  async getLatest(companyId) {
    return await this.prisma.payRun.findFirst({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            payslips: true,
          },
        },
      },
    });
  }

  /**
   * Clôture un cycle de paie
   */
  async close(payRunId, options = {}) {
    const payRun = await this.findById(payRunId);

    if (!payRun) {
      throw new Error("Cycle de paie non trouvé");
    }

    if (payRun.status !== "APPROVED") {
      throw new Error("Seuls les cycles approuvés peuvent être clôturés");
    }

    // Vérifier que tous les bulletins sont payés (optionnel)
    if (options.requireAllPaid) {
      const unpaidPayslips = await this.prisma.payslip.count({
        where: {
          payRunId,
          status: {
            not: "PAID",
          },
        },
      });

      if (unpaidPayslips > 0) {
        throw new Error(
          `${unpaidPayslips} bulletin(s) ne sont pas encore payés`
        );
      }
    }

    return await this.updateStatus(payRunId, "CLOSED");
  }

  /**
   * Calcule les totaux d'un cycle de paie à partir de ses bulletins
   */
  async recalculateTotals(payRunId) {
    const totals = await this.prisma.payslip.aggregate({
      where: { payRunId },
      _sum: {
        grossAmount: true,
        netAmount: true,
        amountPaid: true,
      },
    });

    const data = {
      totalGross: Number(totals._sum.grossAmount) || 0,
      totalNet: Number(totals._sum.netAmount) || 0,
      totalPaid: Number(totals._sum.amountPaid) || 0,
    };

    return await this.update(payRunId, data);
  }
}

export const payRunRepository = new PayRunRepository();
