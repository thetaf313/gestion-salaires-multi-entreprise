import { PrismaClient, PayslipStatus } from "@prisma/client";

const prisma = new PrismaClient();

interface PayslipFilters {
  page: number;
  limit: number;
  status?: string;
  payRunId?: string;
}

class PayslipService {
  // Obtenir les bulletins de paie par entreprise
  async getByCompany(companyId: string, filters: PayslipFilters) {
    const { page, limit, status, payRunId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      payRun: {
        companyId,
      },
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (payRunId) {
      where.payRunId = payRunId;
    }

    const [payslips, total] = await Promise.all([
      prisma.payslip.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              contractType: true,
              dailyRate: true,
              fixedSalary: true,
              hourlyRate: true,
            },
          },
          payRun: {
            select: {
              id: true,
              title: true,
              periodStart: true,
              periodEnd: true,
              status: true,
            },
          },
          deductions: true,
          _count: {
            select: {
              payments: true,
            },
          },
        },
      }),
      prisma.payslip.count({ where }),
    ]);

    return {
      data: payslips,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtenir un bulletin de paie par ID
  async getById(id: string, companyId: string) {
    return await prisma.payslip.findFirst({
      where: {
        id,
        payRun: {
          companyId,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            contractType: true,
            dailyRate: true,
            fixedSalary: true,
            hourlyRate: true,
            email: true,
            phone: true,
            position: true,
          },
        },
        payRun: {
          select: {
            id: true,
            title: true,
            periodStart: true,
            periodEnd: true,
            status: true,
          },
        },
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

  // Mettre à jour le statut d'un bulletin
  async updateStatus(id: string, companyId: string, status: PayslipStatus) {
    // Vérifier que le bulletin existe et appartient à l'entreprise
    const existingPayslip = await prisma.payslip.findFirst({
      where: {
        id,
        payRun: {
          companyId,
        },
      },
    });

    if (!existingPayslip) {
      return null;
    }

    return await prisma.payslip.update({
      where: { id },
      data: { status },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        payRun: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  // Obtenir les statistiques des bulletins
  async getStats(companyId: string) {
    const [
      totalPayslips,
      pendingPayslips,
      partialPayslips,
      paidPayslips,
      totalAmount,
      totalPaid,
    ] = await Promise.all([
      prisma.payslip.count({
        where: {
          payRun: {
            companyId,
          },
        },
      }),
      prisma.payslip.count({
        where: {
          payRun: {
            companyId,
          },
          status: PayslipStatus.PENDING,
        },
      }),
      prisma.payslip.count({
        where: {
          payRun: {
            companyId,
          },
          status: PayslipStatus.PARTIAL,
        },
      }),
      prisma.payslip.count({
        where: {
          payRun: {
            companyId,
          },
          status: PayslipStatus.PAID,
        },
      }),
      prisma.payslip.aggregate({
        where: {
          payRun: {
            companyId,
          },
        },
        _sum: { netAmount: true },
      }),
      prisma.payslip.aggregate({
        where: {
          payRun: {
            companyId,
          },
        },
        _sum: { amountPaid: true },
      }),
    ]);

    return {
      totalPayslips,
      pendingPayslips,
      partialPayslips,
      paidPayslips,
      totalAmount: totalAmount._sum.netAmount || 0,
      totalPaid: totalPaid._sum.amountPaid || 0,
      remainingToPay:
        Number(totalAmount._sum.netAmount || 0) -
        Number(totalPaid._sum.amountPaid || 0),
    };
  }

  // Calculer le montant restant à payer pour un bulletin
  async getRemainingAmount(payslipId: string): Promise<number> {
    const payslip = await prisma.payslip.findUnique({
      where: { id: payslipId },
      select: {
        netAmount: true,
        amountPaid: true,
      },
    });

    if (!payslip) {
      throw new Error("Bulletin de paie non trouvé");
    }

    return Number(payslip.netAmount) - Number(payslip.amountPaid);
  }

  // Mettre à jour le montant payé d'un bulletin
  async updateAmountPaid(payslipId: string, amountPaid: number) {
    const payslip = await prisma.payslip.findUnique({
      where: { id: payslipId },
      select: {
        netAmount: true,
        amountPaid: true,
      },
    });

    if (!payslip) {
      throw new Error("Bulletin de paie non trouvé");
    }

    const newTotalPaid = Number(payslip.amountPaid) + amountPaid;
    const netAmount = Number(payslip.netAmount);

    let newStatus: PayslipStatus = PayslipStatus.PENDING;
    if (newTotalPaid >= netAmount) {
      newStatus = PayslipStatus.PAID;
    } else if (newTotalPaid > 0) {
      newStatus = PayslipStatus.PARTIAL;
    }

    return await prisma.payslip.update({
      where: { id: payslipId },
      data: {
        amountPaid: newTotalPaid,
        status: newStatus,
      },
    });
  }
}

export const payslipService = new PayslipService();
