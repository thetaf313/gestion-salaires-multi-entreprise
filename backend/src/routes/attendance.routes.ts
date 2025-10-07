import { Router } from "express";
import { attendanceController } from "../controllers/attendance.controller.js";
import { validateToken } from "../middlewares/auth.js";

const router = Router();

// ⭐ Routes protégées par authentification
router.use(validateToken);

// Routes de recherche et création intelligente
router.get("/search-employee", attendanceController.searchEmployee);
router.post(
  "/create-with-auto-status",
  attendanceController.createAttendanceWithAutoStatus
);

// ⭐ NOUVEAU : Route de pointage intelligent
router.post("/smart-clock", attendanceController.smartClockIn);

// Routes principales pour les pointages
router.get("/", attendanceController.getAttendances);
router.post("/manual", attendanceController.createManualAttendance);
router.patch("/:attendanceId", attendanceController.updateAttendance);
router.delete("/:attendanceId", attendanceController.deleteAttendance);

// Routes de check-in/out pour employés
router.post("/employee/:employeeId/check-in", attendanceController.checkIn);
router.post("/employee/:employeeId/check-out", attendanceController.checkOut);

export default router;
