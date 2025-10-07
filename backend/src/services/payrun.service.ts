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
  // Créer un nouveau cycle de paie et générer les bulletins
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

    console.log(`🚀 Création du cycle de paie: ${payRunData.title}`);

    // Utiliser une transaction pour créer le cycle et les bulletins
    const result = await prisma.$transaction(async (tx) => {
      // Créer le cycle de paie
      const payRun = await tx.payRun.create({
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

      console.log(`✅ Cycle créé: ${payRun.id}`);

      // Récupérer tous les employés actifs de l'entreprise
      const employees = await tx.employee.findMany({
        where: {
          companyId: payRunData.companyId,
          isActive: true,
        },
      });

      console.log(`👥 ${employees.length} employés actifs trouvés`);

      if (employees.length === 0) {
        console.log("⚠️ Aucun employé actif, cycle créé sans bulletins");
        return payRun;
      }

      // Générer les bulletins de paie pour tous les employés (status ARCHIVED)
      let totalGross = 0;
      let totalNet = 0;
      let bulletinsCreated = 0;

      for (const employee of employees) {
        try {
          const payslipData = await this.calculatePayslip(employee, payRun);

          const payslip = await tx.payslip.create({
            data: {
              payslipNumber: await this.generatePayslipNumber(
                employee.employeeCode,
                payRun.id
              ),
              employeeId: employee.id,
              payRunId: payRun.id,
              grossAmount: payslipData.grossAmount,
              totalDeductions: payslipData.totalDeductions,
              netAmount: payslipData.netAmount,
              daysWorked: payslipData.daysWorked,
              hoursWorked: payslipData.hoursWorked,
              status: 'ARCHIVED', // Statut archivé jusqu'à approbation
            },
          });

          // Créer les déductions
          if (payslipData.deductions.length > 0) {
            await tx.payslipDeduction.createMany({
              data: payslipData.deductions.map((deduction) => ({
                ...deduction,
                payslipId: payslip.id,
              })),
            });
          }

          totalGross += Number(payslipData.grossAmount);
          totalNet += Number(payslipData.netAmount);
          bulletinsCreated++;

          console.log(`✅ Bulletin créé pour ${employee.firstName} ${employee.lastName}`);
        } catch (error: any) {
          console.error(`❌ Erreur pour ${employee.firstName} ${employee.lastName}:`, error.message);
        }
      }

      // Mettre à jour les totaux du cycle de paie
      const updatedPayRun = await tx.payRun.update({
        where: { id: payRun.id },
        data: {
          totalGross,
          totalNet,
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

      console.log(`🎉 ${bulletinsCreated} bulletins archivés générés pour le cycle ${payRun.title}`);

      return updatedPayRun;
    });

    return result;
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

  // Approuver un cycle de paie et désarchiver les bulletins
  async approve(id: string, companyId: string, approvedById: string) {
    console.log(`🔄 Approbation du cycle de paie: ${id}`);

    // Vérifier que le cycle existe et appartient à l'entreprise
    const existingPayRun = await prisma.payRun.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            payslips: true
          }
        }
      },
    });

    if (!existingPayRun) {
      console.log(`❌ Cycle de paie non trouvé: ${id}`);
      return null;
    }

    if (existingPayRun.status === PayRunStatus.APPROVED) {
      throw new Error("Ce cycle de paie est déjà approuvé");
    }

    console.log(`📋 ${existingPayRun._count.payslips} bulletins archivés trouvés`);

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

      // Désarchiver tous les bulletins du cycle (ARCHIVED → PENDING)
      const updatedPayslips = await tx.payslip.updateMany({
        where: {
          payRunId: id,
          status: 'ARCHIVED'
        },
        data: {
          status: 'PENDING'
        }
      });

      console.log(`✅ ${updatedPayslips.count} bulletins désarchivés`);

      return {
        payRun: updatedPayRun,
        payslipsCount: updatedPayslips.count
      };
    });

    console.log(`🎉 Cycle de paie approuvé avec succès: ${result.payslipsCount} bulletins disponibles pour paiement`);
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
