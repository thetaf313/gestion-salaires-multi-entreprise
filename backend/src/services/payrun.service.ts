import { PrismaClient, PayRunStatus } from "@prisma/client";

const prisma = new PrismaClient();

interface CreatePayRunData {
  title: string;
  periodStart: string | Date;
  periodEnd: string | Date;
  description?: string;
  companyId: string;
  createdById: string;
  employeeIds?: string[]; // IDs des employés à inclure dans ce cycle
}

interface PayRunFilters {
  page: number;
  limit: number;
  status?: string;
}

class PayRunService {
  // Créer un nouveau cycle de paie
  async create(data: CreatePayRunData) {
    const { employeeIds, ...payRunData } = data;

    // Validation des dates
    const startDate = new Date(payRunData.periodStart);
    const endDate = new Date(payRunData.periodEnd);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Dates invalides pour le cycle de paie");
    }

    if (startDate >= endDate) {
      throw new Error(
        "La date de fin doit être postérieure à la date de début"
      );
    }

    const payRun = await prisma.payRun.create({
      data: {
        title: payRunData.title,
        periodStart: startDate,
        periodEnd: endDate,
        description: payRunData.description || null,
        companyId: payRunData.companyId,
        createdById: payRunData.createdById,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return payRun;
  }

  // Obtenir les cycles de paie par entreprise
  async getByCompany(companyId: string, filters: PayRunFilters) {
    const { page, limit, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    const [payRuns, total] = await Promise.all([
      prisma.payRun.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
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
          _count: {
            select: {
              payslips: true,
            },
          },
        },
      }),
      prisma.payRun.count({ where }),
    ]);

    // Convertir les valeurs Decimal en nombres pour le frontend
    const formattedPayRuns = payRuns.map((payRun) => ({
      ...payRun,
      totalGross: Number(payRun.totalGross),
      totalNet: Number(payRun.totalNet),
    }));

    return {
      data: formattedPayRuns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtenir un cycle de paie par ID
  async getById(id: string, companyId: string) {
    return await prisma.payRun.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
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
                dailyRate: true,
                fixedSalary: true,
                hourlyRate: true,
              },
            },
            _count: {
              select: {
                payments: true,
              },
            },
          },
        },
      },
    });
  }

  // Mettre à jour un cycle de paie
  async update(id: string, companyId: string, data: Partial<CreatePayRunData>) {
    // Vérifier que le cycle existe et appartient à l'entreprise
    const existingPayRun = await prisma.payRun.findFirst({
      where: { id, companyId },
    });

    if (!existingPayRun) {
      return null;
    }

    // Ne pas permettre la modification si déjà approuvé
    if (existingPayRun.status === PayRunStatus.APPROVED) {
      throw new Error("Impossible de modifier un cycle de paie déjà approuvé");
    }

    const updateData: any = { ...data };
    if (data.periodStart) {
      updateData.periodStart = new Date(data.periodStart);
    }
    if (data.periodEnd) {
      updateData.periodEnd = new Date(data.periodEnd);
    }

    return await prisma.payRun.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // Supprimer un cycle de paie
  async delete(id: string, companyId: string) {
    // Vérifier que le cycle existe et appartient à l'entreprise
    const existingPayRun = await prisma.payRun.findFirst({
      where: { id, companyId },
    });

    if (!existingPayRun) {
      return false;
    }

    // Ne pas permettre la suppression si déjà approuvé
    if (existingPayRun.status === PayRunStatus.APPROVED) {
      throw new Error("Impossible de supprimer un cycle de paie déjà approuvé");
    }

    await prisma.payRun.delete({
      where: { id },
    });

    return true;
  }

  // Approuver un cycle de paie et générer les bulletins
  async approve(id: string, companyId: string, approvedById: string) {
    // Vérifier que le cycle existe et appartient à l'entreprise
    const existingPayRun = await prisma.payRun.findFirst({
      where: { id, companyId },
      include: {
        company: true,
      },
    });

    if (!existingPayRun) {
      return null;
    }

    if (existingPayRun.status === PayRunStatus.APPROVED) {
      throw new Error("Ce cycle de paie est déjà approuvé");
    }

    // Obtenir tous les employés actifs de l'entreprise
    const employees = await prisma.employee.findMany({
      where: {
        companyId,
        isActive: true,
      },
    });

    if (employees.length === 0) {
      throw new Error("Aucun employé actif trouvé pour cette entreprise");
    }

    // Utiliser une transaction pour garantir la cohérence
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour le statut du cycle de paie
      const updatedPayRun = await tx.payRun.update({
        where: { id },
        data: {
          status: PayRunStatus.APPROVED,
          approvedById,
          approvedAt: new Date(),
        },
      });

      // Générer les bulletins de paie pour tous les employés
      const payslips = [];
      let totalGross = 0;
      let totalNet = 0;

      for (const employee of employees) {
        const payslipData = await this.calculatePayslip(
          employee,
          existingPayRun
        );

        const payslip = await tx.payslip.create({
          data: {
            payslipNumber: await this.generatePayslipNumber(
              employee.employeeCode,
              existingPayRun.id
            ),
            employeeId: employee.id,
            payRunId: id,
            grossAmount: payslipData.grossAmount,
            totalDeductions: payslipData.totalDeductions,
            netAmount: payslipData.netAmount,
            daysWorked: payslipData.daysWorked,
            hoursWorked: payslipData.hoursWorked,
          },
        });

        // Créer les déductions si nécessaire
        if (payslipData.deductions.length > 0) {
          await tx.payslipDeduction.createMany({
            data: payslipData.deductions.map((deduction) => ({
              ...deduction,
              payslipId: payslip.id,
            })),
          });
        }

        payslips.push(payslip);
        totalGross += Number(payslipData.grossAmount);
        totalNet += Number(payslipData.netAmount);
      }

      // Mettre à jour les totaux du cycle de paie
      await tx.payRun.update({
        where: { id },
        data: {
          totalGross,
          totalNet,
        },
      });

      return {
        payRun: updatedPayRun,
        payslips,
        summary: {
          totalEmployees: employees.length,
          totalGross,
          totalNet,
        },
      };
    });

    return result;
  }

  // Calculer le bulletin de paie d'un employé
  private async calculatePayslip(employee: any, payRun: any) {
    let grossAmount = 0;
    let daysWorked = null;
    let hoursWorked = null;

    // Calculer le salaire selon le type de contrat
    if (employee.contractType === "DAILY" && employee.dailyRate) {
      // Pour les journaliers, calculer sur la base des jours travaillés
      const periodDays = this.calculateWorkingDays(
        payRun.periodStart,
        payRun.periodEnd
      );
      daysWorked = periodDays;
      grossAmount = Number(employee.dailyRate) * periodDays;
    } else if (employee.contractType === "FIXED" && employee.fixedSalary) {
      // Pour les salaires fixes, utiliser le montant fixe
      grossAmount = Number(employee.fixedSalary);
    } else if (employee.contractType === "HONORARIUM" && employee.hourlyRate) {
      // Pour les honoraires, utiliser les heures (valeur par défaut: 160h/mois)
      hoursWorked = 160;
      grossAmount = Number(employee.hourlyRate) * hoursWorked;
    } else {
      throw new Error(
        `Configuration de salaire manquante pour l'employé ${employee.employeeCode}`
      );
    }

    // Calculer les déductions (exemple simplifié)
    const deductions = [
      {
        type: "TAX" as any,
        description: "Impôt sur le revenu",
        amount: grossAmount * 0.1, // 10% d'impôt
      },
      {
        type: "SOCIAL" as any,
        description: "Cotisations sociales",
        amount: grossAmount * 0.055, // 5.5% de cotisations
      },
    ];

    const totalDeductions = deductions.reduce(
      (sum, ded) => sum + ded.amount,
      0
    );
    const netAmount = grossAmount - totalDeductions;

    return {
      grossAmount,
      totalDeductions,
      netAmount,
      daysWorked,
      hoursWorked,
      deductions,
    };
  }

  // Calculer les jours ouvrés entre deux dates
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Exclure dimanche (0) et samedi (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  // Générer un numéro de bulletin unique
  private async generatePayslipNumber(
    employeeCode: string,
    payRunId: string
  ): Promise<string> {
    const timestamp = Date.now().toString().slice(-6);
    return `PAY-${employeeCode}-${timestamp}`;
  }

  // Obtenir les statistiques des cycles de paie
  async getStats(companyId: string) {
    const [
      totalPayRuns,
      draftPayRuns,
      approvedPayRuns,
      closedPayRuns,
      totalAmount,
      currentYearPayRuns,
    ] = await Promise.all([
      prisma.payRun.count({ where: { companyId } }),
      prisma.payRun.count({ where: { companyId, status: PayRunStatus.DRAFT } }),
      prisma.payRun.count({
        where: { companyId, status: PayRunStatus.APPROVED },
      }),
      prisma.payRun.count({
        where: { companyId, status: PayRunStatus.CLOSED },
      }),
      prisma.payRun.aggregate({
        where: { companyId, status: PayRunStatus.APPROVED },
        _sum: { totalNet: true },
      }),
      prisma.payRun.count({
        where: {
          companyId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      }),
    ]);

    return {
      totalPayRuns,
      draftPayRuns,
      approvedPayRuns,
      closedPayRuns,
      totalAmount: totalAmount._sum.totalNet || 0,
      currentYearPayRuns,
    };
  }

  // Mettre à jour uniquement le statut d'un cycle de paie
  async updateStatus(id: string, companyId: string, status: PayRunStatus) {
    // Vérifier que le cycle existe et appartient à l'entreprise
    const existingPayRun = await prisma.payRun.findFirst({
      where: { id, companyId },
    });

    if (!existingPayRun) {
      return null;
    }

    // Mettre à jour uniquement le statut
    return await prisma.payRun.update({
      where: { id },
      data: { status },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            payslips: true,
          },
        },
      },
    });
  }
}

export const payRunService = new PayRunService();
