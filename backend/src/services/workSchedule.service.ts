import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export interface WorkScheduleData {
  dayOfWeek: number; // 0=Dimanche, 1=Lundi, ..., 6=Samedi
  startTime: string; // Format "HH:MM"
  endTime: string; // Format "HH:MM"
  isWorkingDay: boolean;
}

export class WorkScheduleService {
  // ⭐ Créer ou mettre à jour les horaires de travail pour une entreprise
  async setCompanyWorkSchedules(
    companyId: string,
    schedules: WorkScheduleData[]
  ) {
    // Validation des horaires
    for (const schedule of schedules) {
      if (schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6) {
        throw new Error("dayOfWeek doit être entre 0 (dimanche) et 6 (samedi)");
      }

      if (schedule.isWorkingDay) {
        if (
          !this.isValidTime(schedule.startTime) ||
          !this.isValidTime(schedule.endTime)
        ) {
          throw new Error("Format d'heure invalide. Utilisez HH:MM");
        }

        if (schedule.startTime >= schedule.endTime) {
          throw new Error(
            "L'heure de début doit être antérieure à l'heure de fin"
          );
        }
      }
    }

    // Supprimer les anciens horaires
    await prisma.workSchedule.deleteMany({
      where: { companyId },
    });

    // Créer les nouveaux horaires
    const createData = schedules.map((schedule) => ({
      companyId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isWorkingDay: schedule.isWorkingDay,
    }));

    await prisma.workSchedule.createMany({
      data: createData,
    });

    return await this.getCompanyWorkSchedules(companyId);
  }

  // ⭐ Obtenir les horaires de travail d'une entreprise
  async getCompanyWorkSchedules(companyId: string) {
    const schedules = await prisma.workSchedule.findMany({
      where: { companyId },
      orderBy: { dayOfWeek: "asc" },
    });

    // Retourner les 7 jours de la semaine avec des valeurs par défaut si nécessaire
    const defaultSchedules = Array.from({ length: 7 }, (_, index) => ({
      id: "",
      companyId,
      dayOfWeek: index,
      startTime: "08:00",
      endTime: "17:00",
      isWorkingDay: index >= 1 && index <= 5, // Lundi à vendredi par défaut
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Fusionner avec les horaires existants
    schedules.forEach((schedule) => {
      defaultSchedules[schedule.dayOfWeek] = schedule;
    });

    return defaultSchedules;
  }

  // ⭐ Obtenir l'horaire pour un jour spécifique
  async getWorkScheduleForDay(companyId: string, dayOfWeek: number) {
    return await prisma.workSchedule.findUnique({
      where: {
        companyId_dayOfWeek: {
          companyId,
          dayOfWeek,
        },
      },
    });
  }

  // ⭐ Mettre à jour un horaire spécifique
  async updateWorkSchedule(
    companyId: string,
    dayOfWeek: number,
    data: Omit<WorkScheduleData, "dayOfWeek">
  ) {
    if (data.isWorkingDay) {
      if (
        !this.isValidTime(data.startTime) ||
        !this.isValidTime(data.endTime)
      ) {
        throw new Error("Format d'heure invalide. Utilisez HH:MM");
      }

      if (data.startTime >= data.endTime) {
        throw new Error(
          "L'heure de début doit être antérieure à l'heure de fin"
        );
      }
    }

    return await prisma.workSchedule.upsert({
      where: {
        companyId_dayOfWeek: {
          companyId,
          dayOfWeek,
        },
      },
      create: {
        companyId,
        dayOfWeek,
        ...data,
      },
      update: data,
    });
  }

  // ⭐ Supprimer un horaire (revient à un jour non travaillé)
  async deleteWorkSchedule(companyId: string, dayOfWeek: number) {
    return await prisma.workSchedule.delete({
      where: {
        companyId_dayOfWeek: {
          companyId,
          dayOfWeek,
        },
      },
    });
  }

  // ⭐ Obtenir les jours de travail de la semaine
  async getWorkingDays(companyId: string) {
    const workingDays = await prisma.workSchedule.findMany({
      where: {
        companyId,
        isWorkingDay: true,
      },
      orderBy: { dayOfWeek: "asc" },
    });

    return workingDays.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      dayName: this.getDayName(day.dayOfWeek),
      startTime: day.startTime,
      endTime: day.endTime,
    }));
  }

  // ⭐ Calculer les heures de travail prévues pour une période
  async calculateExpectedWorkingHours(
    companyId: string,
    startDate: Date,
    endDate: Date
  ) {
    const workingDays = await this.getWorkingDays(companyId);

    if (workingDays.length === 0) {
      return 0;
    }

    let totalHours = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const workingDay = workingDays.find((day) => day.dayOfWeek === dayOfWeek);

      if (workingDay) {
        const [startHour, startMinute] = workingDay.startTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = workingDay.endTime.split(":").map(Number);

        const startMinutes = (startHour || 0) * 60 + (startMinute || 0);
        const endMinutes = (endHour || 0) * 60 + (endMinute || 0);

        totalHours += (endMinutes - startMinutes) / 60;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return Number(totalHours.toFixed(2));
  }

  // ⭐ Vérifier si une date est un jour ouvrable
  async isWorkingDay(companyId: string, date: Date) {
    const dayOfWeek = date.getDay();
    const schedule = await this.getWorkScheduleForDay(companyId, dayOfWeek);
    return schedule?.isWorkingDay || false;
  }

  // Utilitaires privées
  private isValidTime(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private getDayName(dayOfWeek: number): string {
    const days = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    return days[dayOfWeek] || "Inconnu";
  }
}

export const workScheduleService = new WorkScheduleService();
