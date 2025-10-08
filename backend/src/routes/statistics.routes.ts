import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics.controller.js';
import { validateToken } from '../middlewares/auth.js';

const router = Router();

// Routes pour les statistiques (nécessitent une authentification)
router.get('/general', validateToken, StatisticsController.getGeneralStats);
router.get('/contract-types', validateToken, StatisticsController.getContractTypeStats);
router.get('/monthly', validateToken, StatisticsController.getMonthlyStats);
router.get('/payroll', validateToken, StatisticsController.getPayrollStats);
router.get('/employees', validateToken, StatisticsController.getEmployeeStats);

export default router;