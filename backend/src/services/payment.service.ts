import { PaymentMethod, PayslipStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";

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
    try {
      // Vérifications préliminaires sans transaction
      const payslip = await prisma.payslip.findUnique({
        where: { id: data.payslipId },
        select: {
          id: true,
          netAmount: true,
          amountPaid: true,
          status: true,
        },
      });

      if (!payslip) {
        throw new Error("Bulletin de paie non trouvé");
      }

      // Calculer le montant réellement payé en additionnant tous les paiements
      const existingPayments = await prisma.payment.findMany({
        where: { payslipId: data.payslipId },
        select: { amount: true }
      });

      const actualPaid = existingPayments.reduce((total, payment) => total + Number(payment.amount), 0);
      const netAmount = Number(payslip.netAmount) || 0;
      const remainingAmount = netAmount - actualPaid;

      console.log("💰 Vérification paiement:", {
        payslipId: data.payslipId,
        netAmount,
        amountPaidField: Number(payslip.amountPaid) || 0,
        actualPaid,
        remainingAmount,
        payslipStatus: payslip.status,
        existingPaymentsCount: existingPayments.length
      });

      if (remainingAmount <= 0) {
        throw new Error(`Ce bulletin de paie est déjà entièrement payé. Net: ${netAmount} FCFA, Déjà payé: ${actualPaid} FCFA`);
      }

      if (data.amount > remainingAmount) {
        throw new Error(
          `Le montant ne peut pas dépasser le montant restant (${remainingAmount} FCFA)`
        );
      }

      // Transaction simplifiée pour les opérations critiques
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
        });

        // Calculer le nouveau montant total payé
        const newTotalPaid = actualPaid + data.amount;

        // Déterminer le nouveau statut
        let newStatus: PayslipStatus;
        if (newTotalPaid >= netAmount) {
          newStatus = PayslipStatus.PAID;
        } else if (newTotalPaid > 0) {
          newStatus = PayslipStatus.PARTIAL;
        } else {
          newStatus = PayslipStatus.PENDING;
        }

        // Mettre à jour le bulletin de paie
        await tx.payslip.update({
          where: { id: data.payslipId },
          data: {
            amountPaid: newTotalPaid,
            status: newStatus,
          },
        });

        return payment;
      });

      // Récupérer le paiement complet après la transaction
      const completePayment = await prisma.payment.findUnique({
        where: { id: result.id },
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

      return completePayment;
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      throw error;
    }
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

    if (method && method !== "all") {
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
          createdAt: "desc",
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
            in: [
              PaymentMethod.ORANGE_MONEY,
              PaymentMethod.WAVE,
              PaymentMethod.MOBILE_MONEY,
            ],
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
        createdAt: "desc",
      },
    });
  }
}

export const paymentService = new PaymentService();
