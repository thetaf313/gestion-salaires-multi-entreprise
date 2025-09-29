import {
  PrismaClient,
  UserRole,
  PayRunStatus,
  PayslipStatus,
  PaymentMethod,
} from "@prisma/client";

interface SuperAdminStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalEmployees: number;
  totalPayrollAmount: number;
  monthlyGrowth: {
    companies: number;
    employees: number;
    payrollAmount: number;
  };
  recentActivity: {
    newCompanies: number;
    newEmployees: number;
    completedPayRuns: number;
  };
  topCompanies: Array<{
    id: string;
    name: string;
    employeeCount: number;
    monthlyPayroll: number;
  }>;
}

interface AdminStats {
  companyId: string;
  employees: {
    total: number;
    active: number;
    newThisMonth: number;
    byContractType: Array<{
      type: string;
      count: number;
    }>;
  };
  payroll: {
    currentMonthBudget: number;
    lastMonthBudget: number;
    yearToDateBudget: number;
    averageSalary: number;
  };
  payRuns: {
    draft: number;
    approved: number;
    closed: number;
    currentMonth: number;
  };
  upcomingPayments: {
    thisWeek: number;
    nextWeek: number;
    overdue: number;
  };
}

interface CashierStats {
  companyId: string;
  paymentsToday: {
    count: number;
    totalAmount: number;
    completed: number;
    pending: number;
  };
  paymentsThisWeek: {
    count: number;
    totalAmount: number;
  };
  paymentsThisMonth: {
    count: number;
    totalAmount: number;
  };
  payslipStatus: {
    pending: number;
    partial: number;
    paid: number;
  };
  paymentMethods: Array<{
    method: PaymentMethod;
    count: number;
    amount: number;
  }>;
  urgentPayments: Array<{
    employeeName: string;
    amount: number;
    daysOverdue: number;
  }>;
}

class StatsRepository {
  private prisma = new PrismaClient();

  /**
   * Statistiques pour SUPER_ADMIN - Vue globale de la plateforme
   */
  async getSuperAdminStats(): Promise<SuperAdminStats> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setDate(0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalEmployees,
      newCompaniesThisMonth,
      newEmployeesThisMonth,
      completedPayRunsThisMonth,
      currentMonthPayroll,
      lastMonthPayroll,
      topCompaniesData,
    ] = await Promise.all([
      // Stats générales
      this.prisma.company.count(),
      this.prisma.company.count({ where: { isActive: true } }),
      this.prisma.user.count(),
      this.prisma.employee.count(),

      // Activité récente
      this.prisma.company.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.employee.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.payRun.count({
        where: {
          status: PayRunStatus.CLOSED,
          updatedAt: { gte: startOfMonth },
        },
      }),

      // Comparaisons mensuelles
      this.prisma.payRun.aggregate({
        where: {
          status: PayRunStatus.CLOSED,
          periodStart: { gte: startOfMonth },
        },
        _sum: { totalNet: true },
      }),
      this.prisma.payRun.aggregate({
        where: {
          status: PayRunStatus.CLOSED,
          periodStart: { gte: startOfLastMonth, lt: startOfMonth },
        },
        _sum: { totalNet: true },
      }),

      // Top entreprises
      this.prisma.company.findMany({
        include: {
          employees: { where: { isActive: true } },
          payRuns: {
            where: {
              status: PayRunStatus.CLOSED,
              periodStart: { gte: startOfMonth },
            },
          },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const currentPayroll = currentMonthPayroll._sum.totalNet || 0;
    const lastPayroll = lastMonthPayroll._sum.totalNet || 0;

    return {
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalEmployees,
      totalPayrollAmount: Number(currentPayroll),
      monthlyGrowth: {
        companies: newCompaniesThisMonth,
        employees: newEmployeesThisMonth,
        payrollAmount: Number(currentPayroll) - Number(lastPayroll),
      },
      recentActivity: {
        newCompanies: newCompaniesThisMonth,
        newEmployees: newEmployeesThisMonth,
        completedPayRuns: completedPayRunsThisMonth,
      },
      topCompanies: topCompaniesData.map((company) => ({
        id: company.id,
        name: company.name,
        employeeCount: company.employees.length,
        monthlyPayroll: company.payRuns.reduce(
          (sum, pr) => sum + Number(pr.totalNet),
          0
        ),
      })),
    };
  }

  /**
   * Statistiques pour ADMIN - Vue entreprise
   */
  async getAdminStats(companyId: string): Promise<AdminStats> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);

    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    const [
      totalEmployees,
      activeEmployees,
      newEmployeesThisMonth,
      contractTypes,
      currentMonthBudget,
      lastMonthBudget,
      yearToDateBudget,
      payRunStats,
      upcomingPayments,
      overduePayments,
    ] = await Promise.all([
      // Statistiques employés
      this.prisma.employee.count({ where: { companyId } }),
      this.prisma.employee.count({ where: { companyId, isActive: true } }),
      this.prisma.employee.count({
        where: {
          companyId,
          createdAt: { gte: startOfMonth },
        },
      }),

      // Répartition par type de contrat
      this.prisma.employee.groupBy({
        by: ["contractType"],
        where: { companyId, isActive: true },
        _count: true,
      }),

      // Budget masse salariale
      this.prisma.payRun.aggregate({
        where: {
          companyId,
          status: PayRunStatus.CLOSED,
          periodStart: { gte: startOfMonth },
        },
        _sum: { totalNet: true },
        _avg: { totalNet: true },
      }),
      this.prisma.payRun.aggregate({
        where: {
          companyId,
          status: PayRunStatus.CLOSED,
          periodStart: { gte: startOfLastMonth, lt: startOfMonth },
        },
        _sum: { totalNet: true },
      }),
      this.prisma.payRun.aggregate({
        where: {
          companyId,
          status: PayRunStatus.CLOSED,
          periodStart: { gte: new Date(new Date().getFullYear(), 0, 1) },
        },
        _sum: { totalNet: true },
      }),

      // Statistiques PayRuns
      this.prisma.payRun.groupBy({
        by: ["status"],
        where: { companyId },
        _count: true,
      }),

      // Paiements à venir
      this.prisma.payslip.count({
        where: {
          employee: { companyId },
          status: { in: [PayslipStatus.PENDING, PayslipStatus.PARTIAL] },
          payRun: { periodEnd: { lte: oneWeekFromNow } },
        },
      }),

      // Paiements en retard
      this.prisma.payslip.count({
        where: {
          employee: { companyId },
          status: { in: [PayslipStatus.PENDING, PayslipStatus.PARTIAL] },
          payRun: { periodEnd: { lt: new Date() } },
        },
      }),
    ]);

    const payRunStatusMap = payRunStats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      companyId,
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        newThisMonth: newEmployeesThisMonth,
        byContractType: contractTypes.map((ct) => ({
          type: ct.contractType,
          count: ct._count,
        })),
      },
      payroll: {
        currentMonthBudget: Number(currentMonthBudget._sum.totalNet || 0),
        lastMonthBudget: Number(lastMonthBudget._sum.totalNet || 0),
        yearToDateBudget: Number(yearToDateBudget._sum.totalNet || 0),
        averageSalary: Number(currentMonthBudget._avg.totalNet || 0),
      },
      payRuns: {
        draft: payRunStatusMap["draft"] || 0,
        approved: payRunStatusMap["approved"] || 0,
        closed: payRunStatusMap["closed"] || 0,
        currentMonth: await this.prisma.payRun.count({
          where: {
            companyId,
            periodStart: { gte: startOfMonth },
          },
        }),
      },
      upcomingPayments: {
        thisWeek: upcomingPayments,
        nextWeek: await this.prisma.payslip.count({
          where: {
            employee: { companyId },
            status: { in: [PayslipStatus.PENDING, PayslipStatus.PARTIAL] },
            payRun: {
              periodEnd: {
                gte: oneWeekFromNow,
                lte: twoWeeksFromNow,
              },
            },
          },
        }),
        overdue: overduePayments,
      },
    };
  }

  /**
   * Statistiques pour CASHIER - Vue opérationnelle
   */
  async getCashierStats(companyId: string): Promise<CashierStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      paymentsTodayData,
      paymentsThisWeekData,
      paymentsThisMonthData,
      payslipStatusData,
      paymentMethodsData,
      urgentPaymentsData,
    ] = await Promise.all([
      // Paiements aujourd'hui
      Promise.all([
        this.prisma.payment.count({
          where: {
            createdAt: { gte: today, lt: tomorrow },
            payslip: { employee: { companyId } },
          },
        }),
        this.prisma.payment.aggregate({
          where: {
            createdAt: { gte: today, lt: tomorrow },
            payslip: { employee: { companyId } },
          },
          _sum: { amount: true },
        }),
        this.prisma.payslip.count({
          where: {
            employee: { companyId },
            status: PayslipStatus.PENDING,
            payRun: { periodEnd: { lte: today } },
          },
        }),
      ]),

      // Paiements cette semaine
      this.prisma.payment.aggregate({
        where: {
          createdAt: { gte: startOfWeek, lt: endOfWeek },
          payslip: { employee: { companyId } },
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Paiements ce mois
      this.prisma.payment.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          payslip: { employee: { companyId } },
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Statut des bulletins
      this.prisma.payslip.groupBy({
        by: ["status"],
        where: { employee: { companyId } },
        _count: true,
      }),

      // Méthodes de paiement
      this.prisma.payment.groupBy({
        by: ["method"],
        where: {
          createdAt: { gte: startOfMonth },
          payslip: { employee: { companyId } },
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Paiements urgents (en retard)
      this.prisma.payslip.findMany({
        where: {
          employee: { companyId },
          status: { in: [PayslipStatus.PENDING, PayslipStatus.PARTIAL] },
          payRun: { periodEnd: { lt: today } },
        },
        include: {
          employee: { select: { firstName: true, lastName: true } },
          payRun: { select: { periodEnd: true } },
        },
        orderBy: { payRun: { periodEnd: "asc" } },
        take: 10,
      }),
    ]);

    const [todayCount, todayAmount, pendingToday] = paymentsTodayData;

    const payslipStatusMap = payslipStatusData.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      companyId,
      paymentsToday: {
        count: todayCount,
        totalAmount: Number(todayAmount._sum.amount || 0),
        completed: todayCount,
        pending: pendingToday,
      },
      paymentsThisWeek: {
        count: paymentsThisWeekData._count,
        totalAmount: Number(paymentsThisWeekData._sum.amount || 0),
      },
      paymentsThisMonth: {
        count: paymentsThisMonthData._count,
        totalAmount: Number(paymentsThisMonthData._sum.amount || 0),
      },
      payslipStatus: {
        pending: payslipStatusMap["pending"] || 0,
        partial: payslipStatusMap["partial"] || 0,
        paid: payslipStatusMap["paid"] || 0,
      },
      paymentMethods: paymentMethodsData.map((pm) => ({
        method: pm.method,
        count: pm._count,
        amount: Number(pm._sum.amount || 0),
      })),
      urgentPayments: urgentPaymentsData.map((payslip) => {
        const daysOverdue = Math.floor(
          (today.getTime() - payslip.payRun.periodEnd.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return {
          employeeName: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
          amount: Number(payslip.netAmount),
          daysOverdue,
        };
      }),
    };
  }

  /**
   * Méthode générique pour obtenir les stats selon le rôle
   */
  async getStatsByRole(
    userRole: UserRole,
    companyId?: string
  ): Promise<SuperAdminStats | AdminStats | CashierStats> {
    switch (userRole) {
      case UserRole.SUPER_ADMIN:
        return this.getSuperAdminStats();

      case UserRole.ADMIN:
        if (!companyId) throw new Error("Company ID required for ADMIN stats");
        return this.getAdminStats(companyId);

      case UserRole.CASHIER:
        if (!companyId)
          throw new Error("Company ID required for CASHIER stats");
        return this.getCashierStats(companyId);

      default:
        throw new Error(`Unsupported role: ${userRole}`);
    }
  }
}

export const statsRepository = new StatsRepository();
export default StatsRepository;
