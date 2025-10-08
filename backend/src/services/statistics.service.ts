import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StatisticsService {
  // Obtenir les statistiques globales par type de contrat
  static async getContractTypeStats(companyId?: string) {
    try {
      console.log('🔍 StatisticsService.getContractTypeStats - companyId:', companyId);
      
      const whereClause = companyId ? { companyId } : {};
      console.log('🔍 whereClause:', whereClause);

      const contractStats = await prisma.employee.groupBy({
        by: ['contractType'],
        where: whereClause,
        _count: {
          _all: true
        }
      });

      console.log('🔍 contractStats résultat:', contractStats);

      // Transformer les données pour le graphique
      const contractTypeData = contractStats.map(stat => ({
        name: stat.contractType,
        value: stat._count._all,
        label: StatisticsService.getContractTypeLabel(stat.contractType)
      }));

      console.log('🔍 contractTypeData transformées:', contractTypeData);
      return contractTypeData;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats par type de contrat:', error);
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  // Obtenir les statistiques générales d'une entreprise ou globales
  static async getGeneralStats(companyId?: string) {
    try {
      console.log('🔍 StatisticsService.getGeneralStats - companyId:', companyId);
      const today = new Date().toISOString().split('T')[0] as string;
      console.log('🔍 today:', today);

      const [
        totalEmployees,
        totalCompanies,
        attendanceToday,
        contractTypeStats
      ] = await Promise.all([
        // Nombre total d'employés
        companyId 
          ? prisma.employee.count({ where: { companyId } })
          : prisma.employee.count(),
        
        // Nombre total d'entreprises (seulement pour SUPER_ADMIN)
        companyId ? Promise.resolve(1) : prisma.company.count(),
        
        // Présences aujourd'hui
        companyId
          ? prisma.attendance.count({
              where: {
                date: today,
                employee: { companyId }
              }
            })
          : prisma.attendance.count({
              where: {
                date: today
              }
            }),

        // Statistiques par type de contrat
        StatisticsService.getContractTypeStats(companyId)
      ]);

      console.log('🔍 Résultats individuels:', {
        totalEmployees,
        totalCompanies,
        attendanceToday,
        contractTypeStats
      });

      const result = {
        totalEmployees,
        totalCompanies: companyId ? null : totalCompanies,
        attendanceToday,
        contractTypeStats
      };

      console.log('🔍 Résultat final getGeneralStats:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques générales:', error);
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  // Obtenir les statistiques mensuelles
  static async getMonthlyStats(companyId?: string, year?: number, month?: number) {
    try {
      const currentYear = year || new Date().getFullYear();
      const currentMonth = month || new Date().getMonth() + 1;
      
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0] as string;
      const endDateStr = endDate.toISOString().split('T')[0] as string;

      const baseWhere = companyId 
        ? {
            date: { gte: startDateStr, lte: endDateStr },
            employee: { companyId }
          }
        : {
            date: { gte: startDateStr, lte: endDateStr }
          };

      const [
        totalAttendances,
        presentDays,
        lateDays,
        absentDays
      ] = await Promise.all([
        prisma.attendance.count({ where: baseWhere }),
        
        prisma.attendance.count({
          where: { ...baseWhere, status: 'PRESENT' }
        }),
        
        prisma.attendance.count({
          where: { ...baseWhere, status: 'LATE' }
        }),
        
        prisma.attendance.count({
          where: { ...baseWhere, status: 'ABSENT' }
        })
      ]);

      return {
        totalAttendances,
        presentDays,
        lateDays,
        absentDays,
        attendanceRate: totalAttendances > 0 ? (presentDays + lateDays) / totalAttendances * 100 : 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques mensuelles:', error);
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  // Obtenir les statistiques financières basées sur les bulletins de paie
  static async getPayrollStats(companyId?: string, year?: number, month?: number) {
    try {
      console.log('🔍 StatisticsService.getPayrollStats - companyId:', companyId, 'year:', year, 'month:', month);
      
      const currentYear = year || new Date().getFullYear();
      const currentMonth = month || new Date().getMonth() + 1;
      
      // Calculer les dates de début et fin du mois
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      console.log('🔍 Période:', { startDateStr, endDateStr });

      // Requête pour les bulletins de paie du mois
      const payslipQuery = companyId 
        ? {
            createdAt: { gte: startDate, lte: endDate },
            employee: { companyId }
          }
        : {
            createdAt: { gte: startDate, lte: endDate }
          };

      const [
        totalPayslips,
        payslipsWithAmount,
        totalPayruns,
        totalPayments
      ] = await Promise.all([
        // Nombre total de bulletins générés
        prisma.payslip.count({ where: payslipQuery }),
        
        // Bulletins avec montants pour calculer la masse salariale
        prisma.payslip.findMany({
          where: payslipQuery,
          select: {
            netAmount: true,
            grossAmount: true,
            totalDeductions: true
          }
        }),
        
        // Nombre de cycles de paie créés
        companyId
          ? prisma.payRun.count({
              where: {
                createdAt: { gte: startDate, lte: endDate },
                companyId
              }
            })
          : prisma.payRun.count({
              where: {
                createdAt: { gte: startDate, lte: endDate }
              }
            }),
        
        // Nombre de paiements effectués
        companyId
          ? prisma.payment.count({
              where: {
                createdAt: { gte: startDate, lte: endDate },
                payslip: { 
                  employee: { companyId }
                }
              }
            })
          : prisma.payment.count({
              where: {
                createdAt: { gte: startDate, lte: endDate }
              }
            })
      ]);

      // Calculer la masse salariale
      const totalGrossSalary = payslipsWithAmount.reduce((sum: number, payslip: any) => 
        sum + Number(payslip.grossAmount || 0), 0);
      const totalNetSalary = payslipsWithAmount.reduce((sum: number, payslip: any) => 
        sum + Number(payslip.netAmount || 0), 0);
      const totalDeductions = payslipsWithAmount.reduce((sum: number, payslip: any) => 
        sum + Number(payslip.totalDeductions || 0), 0);

      const result = {
        totalPayslips,
        totalPayruns,
        totalPayments,
        payrollMass: {
          grossSalary: totalGrossSalary,
          netSalary: totalNetSalary,
          totalDeductions
        },
        period: {
          year: currentYear,
          month: currentMonth,
          startDate: startDateStr,
          endDate: endDateStr
        }
      };

      console.log('🔍 Résultat getPayrollStats:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques de paie:', error);
      throw new Error('Erreur lors de la récupération des statistiques de paie');
    }
  }

  // Obtenir les statistiques des employés actifs
  static async getEmployeeStats(companyId?: string) {
    try {
      console.log('🔍 StatisticsService.getEmployeeStats - companyId:', companyId);
      
      const whereClause = companyId ? { companyId, isActive: true } : { isActive: true };

      const [
        totalActiveEmployees,
        employeesByContract,
        employeesByDepartment
      ] = await Promise.all([
        // Nombre total d'employés actifs
        prisma.employee.count({ where: whereClause }),
        
        // Répartition par type de contrat
        prisma.employee.groupBy({
          by: ['contractType'],
          where: whereClause,
          _count: { _all: true }
        }),
        
        // Répartition par poste/département
        prisma.employee.groupBy({
          by: ['position'],
          where: whereClause,
          _count: { _all: true }
        })
      ]);

      const result = {
        totalActiveEmployees,
        contractTypeDistribution: employeesByContract.map(item => ({
          type: item.contractType,
          count: item._count._all,
          label: StatisticsService.getContractTypeLabel(item.contractType)
        })),
        departmentDistribution: employeesByDepartment.map(item => ({
          department: item.position,
          count: item._count._all
        }))
      };

      console.log('🔍 Résultat getEmployeeStats:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques d\'employés:', error);
      throw new Error('Erreur lors de la récupération des statistiques d\'employés');
    }
  }

  // Helper pour les libellés des types de contrat
  static getContractTypeLabel(contractType: string): string {
    const contractTypeMap: { [key: string]: string } = {
      'DAILY': 'Journalier',
      'FIXED': 'Fixe',
      'HONORARIUM': 'Honoraire'
    };
    return contractTypeMap[contractType] || contractType;
  }
}