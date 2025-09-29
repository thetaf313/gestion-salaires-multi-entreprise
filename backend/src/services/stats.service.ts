import { UserRole } from "@prisma/client";
import { statsRepository } from "../repositories/stats.repository.js";
import {
  StatsResponse,
  SuperAdminStats,
  AdminStats,
  CashierStats,
} from "../types/stats.type.js";

class StatsService {
  /**
   * Récupère les statistiques selon le rôle de l'utilisateur
   */
  async getStatsByRole(
    userRole: UserRole,
    companyId?: string
  ): Promise<StatsResponse> {
    try {
      return await statsRepository.getStatsByRole(userRole, companyId);
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des statistiques: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    }
  }

  /**
   * Statistiques pour SUPER_ADMIN
   */
  async getSuperAdminStats(): Promise<SuperAdminStats> {
    try {
      return await statsRepository.getSuperAdminStats();
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des statistiques SUPER_ADMIN: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    }
  }

  /**
   * Statistiques pour ADMIN
   */
  async getAdminStats(companyId: string): Promise<AdminStats> {
    if (!companyId) {
      throw new Error("Company ID is required for ADMIN stats");
    }

    try {
      return await statsRepository.getAdminStats(companyId);
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des statistiques ADMIN: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    }
  }

  /**
   * Statistiques pour CASHIER
   */
  async getCashierStats(companyId: string): Promise<CashierStats> {
    if (!companyId) {
      throw new Error("Company ID is required for CASHIER stats");
    }

    try {
      return await statsRepository.getCashierStats(companyId);
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des statistiques CASHIER: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    }
  }

  /**
   * Valide si l'utilisateur a accès aux statistiques demandées
   */
  validateStatsAccess(
    userRole: UserRole,
    requestedCompanyId?: string,
    userCompanyId?: string
  ): boolean {
    switch (userRole) {
      case UserRole.SUPER_ADMIN:
        // SUPER_ADMIN peut accéder à toutes les stats
        return true;

      case UserRole.ADMIN:
      case UserRole.CASHIER:
        // ADMIN et CASHIER ne peuvent accéder qu'aux stats de leur entreprise
        if (!requestedCompanyId || !userCompanyId) {
          return false;
        }
        return requestedCompanyId === userCompanyId;

      default:
        return false;
    }
  }

  /**
   * Génère un résumé des KPIs principaux selon le rôle
   */
  generateKPISummary(
    stats: StatsResponse,
    userRole: UserRole
  ): Array<{
    label: string;
    value: number | string;
    trend?: "up" | "down" | "stable";
  }> {
    switch (userRole) {
      case UserRole.SUPER_ADMIN:
        const superAdminStats = stats as SuperAdminStats;
        return [
          {
            label: "Entreprises Actives",
            value: superAdminStats.activeCompanies,
          },
          { label: "Total Employés", value: superAdminStats.totalEmployees },
          {
            label: "Masse Salariale",
            value: `${superAdminStats.totalPayrollAmount.toLocaleString()} FCFA`,
          },
          {
            label: "Croissance Mensuelle",
            value: superAdminStats.monthlyGrowth.companies,
            trend:
              superAdminStats.monthlyGrowth.companies > 0 ? "up" : "stable",
          },
        ];

      case UserRole.ADMIN:
        const adminStats = stats as AdminStats;
        const budgetTrend =
          adminStats.payroll.currentMonthBudget >
          adminStats.payroll.lastMonthBudget
            ? "up"
            : adminStats.payroll.currentMonthBudget <
              adminStats.payroll.lastMonthBudget
            ? "down"
            : "stable";
        return [
          { label: "Employés Actifs", value: adminStats.employees.active },
          {
            label: "Budget Mensuel",
            value: `${adminStats.payroll.currentMonthBudget.toLocaleString()} FCFA`,
            trend: budgetTrend,
          },
          {
            label: "Nouveaux Employés",
            value: adminStats.employees.newThisMonth,
          },
          {
            label: "Paiements en Retard",
            value: adminStats.upcomingPayments.overdue,
            trend: adminStats.upcomingPayments.overdue > 0 ? "down" : "stable",
          },
        ];

      case UserRole.CASHIER:
        const cashierStats = stats as CashierStats;
        return [
          {
            label: "Paiements Aujourd'hui",
            value: `${cashierStats.paymentsToday.totalAmount.toLocaleString()} FCFA`,
          },
          {
            label: "Bulletins en Attente",
            value: cashierStats.payslipStatus.pending,
          },
          {
            label: "Paiements Urgents",
            value: cashierStats.urgentPayments.length,
            trend: cashierStats.urgentPayments.length > 0 ? "down" : "stable",
          },
          {
            label: "Paiements ce Mois",
            value: cashierStats.paymentsThisMonth.count,
          },
        ];

      default:
        return [];
    }
  }
}

export const statsService = new StatsService();
export default StatsService;
