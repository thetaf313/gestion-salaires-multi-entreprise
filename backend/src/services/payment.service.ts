import { PrismaClient, PaymentMethod } from "@prisma/client";
import { payslipService } from "./payslip.service.js";

const prisma = new PrismaClient();

interface CreatePaymentData {
  payslipId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  processedById: string;
}

interface PaymentFilters {
  page: number;
  limit: number;
  method?: string;
  payRunId?: string;
}

class PaymentService {
  // Créer un nouveau paiement
  async create(data: CreatePaymentData) {
    // Vérifier que le bulletin existe et calculer le montant restant
    const remainingAmount = await payslipService.getRemainingAmount(data.payslipId);
    
    if (remainingAmount <= 0) {
      throw new Error("Ce bulletin de paie est déjà entièrement payé");
    }

    if (data.amount > remainingAmount) {
      throw new Error(`Le montant ne peut pas dépasser le montant restant (${remainingAmount})`);
    }

    // Utiliser une transaction pour garantir la cohérence
    const result = await prisma.$transaction(async (tx) => {
      // Créer le paiement
      const payment = await tx.payment.create({
        data: {
          payslipId: data.payslipId,
          amount: data.amount,
          method: data.method,
          reference: data.reference || null,
          notes: data.notes || null,
          processedById: data.processedById,
        },
        include: {
          payslip: {
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
          },
          processedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Mettre à jour le montant payé dans le bulletin
      await payslipService.updateAmountPaid(data.payslipId, data.amount);

      return payment;
    });

    return result;
  }

  // Obtenir les paiements par entreprise
  async getByCompany(companyId: string, filters: PaymentFilters) {
    const { page, limit, method, payRunId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      payslip: {
        payRun: {
          companyId,
        },
      },
    };

    if (method && method !== 'all') {
      where.method = method;
    }

    if (payRunId) {
      where.payslip = {
        ...where.payslip,
        payRunId,
      };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          payslip: {
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
                  periodStart: true,
                  periodEnd: true,
                },
              },
            },
          },
          processedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtenir un paiement par ID
  async getById(id: string, companyId: string) {
    return await prisma.payment.findFirst({
      where: {
        id,
        payslip: {
          payRun: {
            companyId,
          },
        },
      },
      include: {
        payslip: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeCode: true,
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
              },
            },
            deductions: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // Obtenir les statistiques des paiements
  async getStats(companyId: string) {
    const [
      totalPayments,
      totalAmount,
      cashPayments,
      bankTransferPayments,
      mobileMoneyPayments,
      currentMonthPayments,
    ] = await Promise.all([
      prisma.payment.count({
        where: {
          payslip: {
            payRun: {
              companyId,
            },
          },
        },
      }),
      prisma.payment.aggregate({
        where: {
          payslip: {
            payRun: {
              companyId,
            },
          },
        },
        _sum: { amount: true },
      }),
      prisma.payment.count({
        where: {
          payslip: {
            payRun: {
              companyId,
            },
          },
          method: PaymentMethod.CASH,
        },
      }),
      prisma.payment.count({
        where: {
          payslip: {
            payRun: {
              companyId,
            },
          },
          method: PaymentMethod.BANK_TRANSFER,
        },
      }),
      prisma.payment.aggregate({
        where: {
          payslip: {
            payRun: {
              companyId,
            },
          },
          method: {
            in: [PaymentMethod.ORANGE_MONEY, PaymentMethod.WAVE, PaymentMethod.MOBILE_MONEY],
          },
        },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: {
          payslip: {
            payRun: {
              companyId,
            },
          },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      cashPayments,
      bankTransferPayments,
      mobileMoneyPayments: mobileMoneyPayments._count,
      currentMonthPayments: currentMonthPayments._count,
      currentMonthAmount: currentMonthPayments._sum.amount || 0,
    };
  }

  // Obtenir les paiements par bulletin de paie
  async getByPayslip(payslipId: string, companyId: string) {
    return await prisma.payment.findMany({
      where: {
        payslipId,
        payslip: {
          payRun: {
            companyId,
          },
        },
      },
      include: {
        processedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export const paymentService = new PaymentService();