import { payrollService } from "../services/payroll.service.js";
import { PayRunRepository } from "../repositories/payrun.repository.js";
import { messages } from "../constants/messages.js";
import { httpStatus } from "../constants/httpStatus.js";
import { successResponse, errorResponse } from "../utils/response.js";

const payRunRepository = new PayRunRepository();

/**
 * Génère les bulletins de paie pour un cycle de paie
 */
export const generatePayslips = async (req, res) => {
  try {
    const { companyId, payRunId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(
        res,
        httpStatus.UNAUTHORIZED,
        messages.auth.unauthorized
      );
    }

    // Vérifier que l'utilisateur appartient à cette entreprise
    if (req.user.companyId !== companyId) {
      return errorResponse(
        res,
        httpStatus.FORBIDDEN,
        messages.auth.accessDenied
      );
    }

    const result = await payrollService.generatePayslips(companyId, payRunId);

    return successResponse(res, httpStatus.OK, result.message, result.data);
  } catch (error) {
    console.error("Erreur lors de la génération des bulletins:", error);

    let message = "Erreur lors de la génération des bulletins de paie";
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    if (error.message.includes("non trouvé")) {
      statusCode = httpStatus.NOT_FOUND;
      message = error.message;
    } else if (error.message.includes("brouillon")) {
      statusCode = httpStatus.BAD_REQUEST;
      message = error.message;
    } else if (error.message.includes("Aucun employé")) {
      statusCode = httpStatus.BAD_REQUEST;
      message = error.message;
    }

    return errorResponse(res, statusCode, message);
  }
};

/**
 * Récupère les bulletins de paie d'un cycle
 */
export const getPayslipsByPayRun = async (req, res) => {
  try {
    const { companyId, payRunId } = req.params;
    const { page = 1, limit = 10, status, employeeId } = req.query;

    // Vérifier que l'utilisateur appartient à cette entreprise
    if (req.user.companyId !== companyId) {
      return errorResponse(
        res,
        httpStatus.FORBIDDEN,
        messages.auth.accessDenied
      );
    }

    const payRun = await payRunRepository.findWithDetails(payRunId);

    if (!payRun || payRun.companyId !== companyId) {
      return errorResponse(
        res,
        httpStatus.NOT_FOUND,
        "Cycle de paie non trouvé"
      );
    }

    // Filtrer les bulletins selon les critères
    let payslips = payRun.payslips;

    if (status) {
      payslips = payslips.filter((p) => p.status === status);
    }

    if (employeeId) {
      payslips = payslips.filter((p) => p.employeeId === employeeId);
    }

    // Pagination manuelle
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPayslips = payslips.slice(startIndex, endIndex);

    const response = {
      payslips: paginatedPayslips,
      payRun: {
        id: payRun.id,
        title: payRun.title,
        description: payRun.description,
        periodStart: payRun.periodStart,
        periodEnd: payRun.periodEnd,
        status: payRun.status,
        totalGross: payRun.totalGross,
        totalNet: payRun.totalNet,
        createdAt: payRun.createdAt,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: payslips.length,
        pages: Math.ceil(payslips.length / limit),
      },
    };

    return successResponse(
      res,
      httpStatus.OK,
      "Bulletins récupérés avec succès",
      response
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des bulletins:", error);
    return errorResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      "Erreur lors de la récupération des bulletins"
    );
  }
};

/**
 * Récupère les détails d'un bulletin de paie
 */
export const getPayslipDetails = async (req, res) => {
  try {
    const { companyId, payslipId } = req.params;

    // Vérifier que l'utilisateur appartient à cette entreprise
    if (req.user.companyId !== companyId) {
      return errorResponse(
        res,
        httpStatus.FORBIDDEN,
        messages.auth.accessDenied
      );
    }

    const payslip = await payrollService.payslipRepository.findWithDetails(
      payslipId
    );

    if (!payslip || payslip.payRun.companyId !== companyId) {
      return errorResponse(
        res,
        httpStatus.NOT_FOUND,
        "Bulletin de paie non trouvé"
      );
    }

    return successResponse(
      res,
      httpStatus.OK,
      "Détails du bulletin récupérés avec succès",
      payslip
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du bulletin:", error);
    return errorResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      "Erreur lors de la récupération du bulletin"
    );
  }
};

/**
 * Met à jour le statut d'un bulletin de paie
 */
export const updatePayslipStatus = async (req, res) => {
  try {
    const { companyId, payslipId } = req.params;
    const { status, amountPaid } = req.body;

    // Vérifier que l'utilisateur appartient à cette entreprise
    if (req.user.companyId !== companyId) {
      return errorResponse(
        res,
        httpStatus.FORBIDDEN,
        messages.auth.accessDenied
      );
    }

    // Vérifier que le statut est valide
    const validStatuses = ["PENDING", "PARTIAL", "PAID"];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, httpStatus.BAD_REQUEST, "Statut invalide");
    }

    const payslip = await payrollService.payslipRepository.updateStatus(
      payslipId,
      status,
      {
        amountPaid: status === "PAID" ? amountPaid : undefined,
      }
    );

    if (!payslip) {
      return errorResponse(
        res,
        httpStatus.NOT_FOUND,
        "Bulletin de paie non trouvé"
      );
    }

    return successResponse(
      res,
      httpStatus.OK,
      "Statut du bulletin mis à jour avec succès",
      payslip
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du bulletin:", error);
    return errorResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      "Erreur lors de la mise à jour du bulletin"
    );
  }
};

/**
 * Récupère les statistiques de paie pour une entreprise
 */
export const getPayrollStats = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Vérifier que l'utilisateur appartient à cette entreprise
    if (req.user.companyId !== companyId) {
      return errorResponse(
        res,
        httpStatus.FORBIDDEN,
        messages.auth.accessDenied
      );
    }

    const result = await payrollService.getPayrollStats(companyId);

    return successResponse(
      res,
      httpStatus.OK,
      "Statistiques récupérées avec succès",
      result.data
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return errorResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      "Erreur lors de la récupération des statistiques"
    );
  }
};

/**
 * Recherche des bulletins de paie
 */
export const searchPayslips = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { search = "", page = 1, limit = 10 } = req.query;

    // Vérifier que l'utilisateur appartient à cette entreprise
    if (req.user.companyId !== companyId) {
      return errorResponse(
        res,
        httpStatus.FORBIDDEN,
        messages.auth.accessDenied
      );
    }

    const result = await payrollService.payslipRepository.search(
      companyId,
      search,
      {
        page: parseInt(page),
        limit: parseInt(limit),
      }
    );

    return successResponse(
      res,
      httpStatus.OK,
      "Recherche effectuée avec succès",
      result
    );
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return errorResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      "Erreur lors de la recherche"
    );
  }
};

/**
 * Récupère les bulletins de paie d'un employé
 */
export const getEmployeePayslips = async (req, res) => {
  try {
    const { companyId, employeeId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Vérifier que l'utilisateur appartient à cette entreprise
    if (req.user.companyId !== companyId) {
      return errorResponse(
        res,
        httpStatus.FORBIDDEN,
        messages.auth.accessDenied
      );
    }

    const result = await payrollService.payslipRepository.findByEmployee(
      employeeId,
      {
        page: parseInt(page),
        limit: parseInt(limit),
      }
    );

    return successResponse(
      res,
      httpStatus.OK,
      "Bulletins de l'employé récupérés avec succès",
      result
    );
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des bulletins de l'employé:",
      error
    );
    return errorResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      "Erreur lors de la récupération des bulletins"
    );
  }
};
