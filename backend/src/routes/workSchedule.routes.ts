import { Router } from "express";
import { workScheduleController } from "../controllers/workSchedule.controller.js";

const router = Router();

// Routes pour les horaires de travail
router.get("/", workScheduleController.getWorkSchedules);
router.post("/", workScheduleController.setWorkSchedules);
router.post("/check-work-time", workScheduleController.checkWorkTime);

export default router;
