import { Request, Response } from 'express';
import { StatisticsService } from '../services/statistics.service.js';
import { HttpStatus } from '../constants/httpStatus.js';
import { sendResponse } from '../utils/response.js';

export class StatisticsController {
  // Obtenir les statistiques générales
  static async getGeneralStats(req: Request, res: Response) {
    try {
      const { user } = req as any;
      const { companyId: queryCompanyId } = req.query;
      
      console.log('📊 StatisticsController.getGeneralStats - User:', {
        id: user.id,
        role: user.role,
        companyId: user.companyId,
        employeeId: user.employeeId
      });
      console.log('📊 Query params:', { queryCompanyId });
      
      // Déterminer l'ID de l'entreprise selon le rôle
      let companyId: string | undefined;
      
      if (user.role === 'SUPER_ADMIN') {
        // Les SUPER_ADMIN peuvent spécifier une entreprise ou voir global
        companyId = queryCompanyId as string | undefined;
      } else if (user.role === 'ADMIN') {
        // Les ADMIN voient seulement leur entreprise
        companyId = user.companyId;
      } else if (user.role === 'CASHIER') {
        // Les caissiers voient seulement les stats de leur entreprise
        companyId = user.companyId;
      }

      console.log('📊 Appel StatisticsService.getGeneralStats avec companyId:', companyId);
      const stats = await StatisticsService.getGeneralStats(companyId);
      console.log('📊 Résultat StatisticsService.getGeneralStats:', stats);

      return sendResponse(
        res,
        HttpStatus.OK,
        'Statistiques générales récupérées avec succès',
        stats
      );
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des statistiques générales:', error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Erreur lors de la récupération des statistiques générales',
        null,
        [error.message]
      );
    }
  }

  // Obtenir les statistiques par type de contrat
  static async getContractTypeStats(req: Request, res: Response) {
    try {
      const { user } = req as any;
      
      // Déterminer l'ID de l'entreprise selon le rôle
      let companyId: string | undefined;
      
      if (user.role === 'ADMIN' || user.role === 'CASHIER') {
        companyId = user.companyId;
      }
      // Les SUPER_ADMIN voient toutes les stats (companyId reste undefined)

      const contractStats = await StatisticsService.getContractTypeStats(companyId);

      return sendResponse(
        res,
        HttpStatus.OK,
        'Statistiques par type de contrat récupérées avec succès',
        contractStats
      );
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques par type de contrat:', error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Erreur lors de la récupération des statistiques par type de contrat',
        null,
        [error.message]
      );
    }
  }

  // Obtenir les statistiques mensuelles
  static async getMonthlyStats(req: Request, res: Response) {
    try {
      const { user } = req as any;
      const { year, month, companyId: queryCompanyId } = req.query;
      
      console.log('📊 StatisticsController.getMonthlyStats - User:', {
        id: user.id,
        role: user.role,
        companyId: user.companyId,
        employeeId: user.employeeId
      });
      console.log('📊 Query params:', { year, month, queryCompanyId });
      
      // Déterminer l'ID de l'entreprise selon le rôle
      let companyId: string | undefined;
      
      if (user.role === 'SUPER_ADMIN') {
        // Les SUPER_ADMIN peuvent spécifier une entreprise ou voir global
        companyId = queryCompanyId as string | undefined;
      } else if (user.role === 'ADMIN' || user.role === 'CASHIER') {
        companyId = user.companyId;
      }

      console.log('📊 Appel StatisticsService.getMonthlyStats avec companyId:', companyId);
      const monthlyStats = await StatisticsService.getMonthlyStats(
        companyId,
        year ? parseInt(year as string) : undefined,
        month ? parseInt(month as string) : undefined
      );
      console.log('📊 Résultat StatisticsService.getMonthlyStats:', monthlyStats);

      return sendResponse(
        res,
        HttpStatus.OK,
        'Statistiques mensuelles récupérées avec succès',
        monthlyStats
      );
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des statistiques mensuelles:', error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Erreur lors de la récupération des statistiques mensuelles',
        null,
        [error.message]
      );
    }
  }

  // Obtenir les statistiques de paie (masse salariale, bulletins, etc.)
  static async getPayrollStats(req: Request, res: Response) {
    try {
      const { user } = req as any;
      const { year, month, companyId: queryCompanyId } = req.query;
      
      console.log('📊 StatisticsController.getPayrollStats - User:', {
        id: user.id,
        role: user.role,
        companyId: user.companyId
      });
      console.log('📊 Query params:', { year, month, queryCompanyId });
      
      // Déterminer l'ID de l'entreprise selon le rôle
      let companyId: string | undefined;
      
      if (user.role === 'SUPER_ADMIN') {
        companyId = queryCompanyId as string | undefined;
      } else if (user.role === 'ADMIN' || user.role === 'CASHIER') {
        companyId = user.companyId;
      }

      console.log('📊 Appel StatisticsService.getPayrollStats avec companyId:', companyId);
      const payrollStats = await StatisticsService.getPayrollStats(
        companyId,
        year ? parseInt(year as string) : undefined,
        month ? parseInt(month as string) : undefined
      );
      console.log('📊 Résultat StatisticsService.getPayrollStats:', payrollStats);

      return sendResponse(
        res,
        HttpStatus.OK,
        'Statistiques de paie récupérées avec succès',
        payrollStats
      );
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des statistiques de paie:', error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Erreur lors de la récupération des statistiques de paie',
        null,
        [error.message]
      );
    }
  }

  // Obtenir les statistiques des employés
  static async getEmployeeStats(req: Request, res: Response) {
    try {
      const { user } = req as any;
      const { companyId: queryCompanyId } = req.query;
      
      console.log('📊 StatisticsController.getEmployeeStats - User:', {
        id: user.id,
        role: user.role,
        companyId: user.companyId
      });
      console.log('📊 Query params:', { queryCompanyId });
      
      // Déterminer l'ID de l'entreprise selon le rôle
      let companyId: string | undefined;
      
      if (user.role === 'SUPER_ADMIN') {
        companyId = queryCompanyId as string | undefined;
      } else if (user.role === 'ADMIN' || user.role === 'CASHIER') {
        companyId = user.companyId;
      }

      console.log('📊 Appel StatisticsService.getEmployeeStats avec companyId:', companyId);
      const employeeStats = await StatisticsService.getEmployeeStats(companyId);
      console.log('📊 Résultat StatisticsService.getEmployeeStats:', employeeStats);

      return sendResponse(
        res,
        HttpStatus.OK,
        'Statistiques des employés récupérées avec succès',
        employeeStats
      );
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des statistiques des employés:', error);
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Erreur lors de la récupération des statistiques des employés',
        null,
        [error.message]
      );
    }
  }
}