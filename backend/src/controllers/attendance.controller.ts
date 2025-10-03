import { Request, Response } from "express";
import { attendanceService } from "../services/attendance.service.js";
import { workScheduleService } from "../services/workSchedule.service.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { AttendanceStatus } from "@prisma/client";

export class AttendanceController {
  // ⭐ Rechercher un employé par code ou email
  async searchEmployee(req: Request, res: Response) {
    try {
      const { searchTerm } = req.query;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      if (!searchTerm || typeof searchTerm !== "string") {
        return errorResponse(res, "Terme de recherche requis", 400);
      }

      const employee = await attendanceService.findEmployeeByCodeOrEmail(
        companyId,
        searchTerm
      );

      return successResponse(res, employee, "Employé trouvé");
    } catch (error: any) {
      console.error("Erreur recherche employé:", error);
      return errorResponse(res, error.message || "Employé non trouvé");
    }
  }

  // ⭐ Créer un pointage avec calcul automatique du statut
  async createAttendanceWithAutoStatus(req: Request, res: Response) {
    try {
      const { employeeId, checkInTime, checkOutTime, notes } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      if (!employeeId || !checkInTime) {
        return errorResponse(res, "ID employé et heure d'arrivée requis", 400);
      }

      const attendance = await attendanceService.createAttendanceWithAutoStatus(
        employeeId,
        companyId,
        new Date(checkInTime),
        checkOutTime ? new Date(checkOutTime) : null,
        notes
      );

      return successResponse(res, attendance, "Pointage créé avec succès");
    } catch (error: any) {
      console.error("Erreur création pointage:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la création du pointage"
      );
    }
  }

  // ⭐ Check-in d'un employé
  async checkIn(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const { notes } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      if (!employeeId) {
        return errorResponse(res, "ID employé requis", 400);
      }

      const attendance = await attendanceService.checkIn(
        employeeId,
        companyId,
        notes
      );

      return successResponse(res, attendance, "Check-in effectué avec succès");
    } catch (error: any) {
      console.error("Erreur check-in:", error);
      return errorResponse(res, error.message || "Erreur lors du check-in");
    }
  }

  // ⭐ Check-out d'un employé
  async checkOut(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const { notes } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      if (!employeeId) {
        return errorResponse(res, "ID employé requis", 400);
      }

      const attendance = await attendanceService.checkOut(
        employeeId,
        companyId,
        notes
      );

      return successResponse(res, attendance, "Check-out effectué avec succès");
    } catch (error: any) {
      console.error("Erreur check-out:", error);
      return errorResponse(res, error.message || "Erreur lors du check-out");
    }
  }

  // ⭐ Créer un pointage manuel (admin uniquement)
  async createManualAttendance(req: Request, res: Response) {
    try {
      const { employeeId, date, checkIn, checkOut, status, notes } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      // Vérifier les permissions (admin ou super_admin)
      if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPER_ADMIN") {
        return errorResponse(res, "Permissions insuffisantes", 403);
      }

      const attendanceData = {
        employeeId,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status: status as AttendanceStatus,
        notes,
      };

      const attendance = await attendanceService.createManualAttendance(
        attendanceData,
        companyId
      );

      return successResponse(
        res,
        attendance,
        "Pointage manuel créé avec succès"
      );
    } catch (error: any) {
      console.error("Erreur création pointage manuel:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la création du pointage manuel"
      );
    }
  }

  // ⭐ Mettre à jour un pointage
  async updateAttendance(req: Request, res: Response) {
    try {
      const { attendanceId } = req.params;
      const { checkIn, checkOut, status, notes, isValidated } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      if (!attendanceId) {
        return errorResponse(res, "ID pointage requis", 400);
      }

      // Vérifier les permissions pour la validation
      if (
        isValidated &&
        req.user?.role !== "ADMIN" &&
        req.user?.role !== "SUPER_ADMIN"
      ) {
        return errorResponse(
          res,
          "Permissions insuffisantes pour valider",
          403
        );
      }

      const updateData = {
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status: status as AttendanceStatus,
        notes,
        isValidated,
        validatedBy: isValidated ? req.user?.id || null : null,
      };

      const attendance = await attendanceService.updateAttendance(
        attendanceId,
        updateData,
        companyId
      );

      return successResponse(
        res,
        attendance,
        "Pointage mis à jour avec succès"
      );
    } catch (error: any) {
      console.error("Erreur mise à jour pointage:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la mise à jour du pointage"
      );
    }
  }

  // ⭐ Obtenir la liste des pointages avec filtres
  async getAttendances(req: Request, res: Response) {
    try {
      console.log("=== DEBUG getAttendances ===");
      console.log("req.user:", req.user);
      console.log("req.query:", req.query);

      const companyId = req.user?.companyId;
      if (!companyId) {
        console.log("❌ CompanyId manquant dans req.user");
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      console.log("✅ CompanyId trouvé:", companyId);

      const {
        employeeId,
        startDate,
        endDate,
        status,
        isValidated,
        page = "1",
        limit = "20",
      } = req.query;

      const filters: any = {
        companyId,
      };

      if (employeeId) filters.employeeId = employeeId;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (status) filters.status = status as AttendanceStatus;
      if (isValidated !== undefined) {
        filters.isValidated =
          isValidated === "true"
            ? true
            : isValidated === "false"
            ? false
            : undefined;
      }

      const result = await attendanceService.getAttendances(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      return successResponse(res, result, "Pointages récupérés avec succès");
    } catch (error: any) {
      console.error("Erreur récupération pointages:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la récupération des pointages"
      );
    }
  }

  // ⭐ Obtenir le pointage du jour pour un employé
  async getTodayAttendance(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      if (!employeeId) {
        return errorResponse(res, "ID employé requis", 400);
      }

      const attendance = await attendanceService.getTodayAttendance(
        employeeId,
        companyId
      );

      return successResponse(
        res,
        attendance,
        "Pointage du jour récupéré avec succès"
      );
    } catch (error: any) {
      console.error("Erreur récupération pointage du jour:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la récupération du pointage du jour"
      );
    }
  }

  // ⭐ Obtenir les statistiques de présence d'un employé
  async getEmployeeStats(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate } = req.query;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      if (!employeeId) {
        return errorResponse(res, "ID employé requis", 400);
      }

      const stats = await attendanceService.getEmployeeAttendanceStats(
        employeeId,
        companyId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      return successResponse(res, stats, "Statistiques récupérées avec succès");
    } catch (error: any) {
      console.error("Erreur récupération statistiques:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la récupération des statistiques"
      );
    }
  }

  // ⭐ Supprimer un pointage (admin uniquement)
  async deleteAttendance(req: Request, res: Response) {
    try {
      const { attendanceId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      if (!attendanceId) {
        return errorResponse(res, "ID pointage requis", 400);
      }

      // Vérifier les permissions
      if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPER_ADMIN") {
        return errorResponse(res, "Permissions insuffisantes", 403);
      }

      await attendanceService.deleteAttendance(attendanceId, companyId);

      return successResponse(res, null, "Pointage supprimé avec succès");
    } catch (error: any) {
      console.error("Erreur suppression pointage:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la suppression du pointage"
      );
    }
  }

  // ⭐ Obtenir les horaires de travail de l'entreprise
  async getWorkSchedules(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      const schedules = await workScheduleService.getCompanyWorkSchedules(
        companyId
      );

      return successResponse(
        res,
        schedules,
        "Horaires de travail récupérés avec succès"
      );
    } catch (error: any) {
      console.error("Erreur récupération horaires:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la récupération des horaires"
      );
    }
  }

  // ⭐ Mettre à jour les horaires de travail (admin uniquement)
  async updateWorkSchedules(req: Request, res: Response) {
    try {
      const { schedules } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      // Vérifier les permissions
      if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPER_ADMIN") {
        return errorResponse(res, "Permissions insuffisantes", 403);
      }

      const updatedSchedules =
        await workScheduleService.setCompanyWorkSchedules(companyId, schedules);

      return successResponse(
        res,
        updatedSchedules,
        "Horaires de travail mis à jour avec succès"
      );
    } catch (error: any) {
      console.error("Erreur mise à jour horaires:", error);
      return errorResponse(
        res,
        error.message || "Erreur lors de la mise à jour des horaires"
      );
    }
  }

  // ⭐ Check-in/out rapide (pour l'employé connecté)
  async quickCheckInOut(req: Request, res: Response) {
    try {
      const { action, notes } = req.body; // action: 'checkin' | 'checkout'
      const companyId = req.user?.companyId;
      const employeeId = req.user?.employeeId;

      if (!companyId) {
        return errorResponse(res, "Entreprise non trouvée", 400);
      }

      if (!employeeId) {
        return errorResponse(res, "Employé non trouvé", 400);
      }

      let attendance;
      if (action === "checkin") {
        attendance = await attendanceService.checkIn(
          employeeId,
          companyId,
          notes
        );
      } else if (action === "checkout") {
        attendance = await attendanceService.checkOut(
          employeeId,
          companyId,
          notes
        );
      } else {
        return errorResponse(
          res,
          'Action invalide. Utilisez "checkin" ou "checkout"',
          400
        );
      }

      return successResponse(
        res,
        attendance,
        `${
          action === "checkin" ? "Check-in" : "Check-out"
        } effectué avec succès`
      );
    } catch (error: any) {
      console.error("Erreur check-in/out rapide:", error);
      return errorResponse(res, error.message || "Erreur lors du pointage");
    }
  }
}

export const attendanceController = new AttendanceController();
