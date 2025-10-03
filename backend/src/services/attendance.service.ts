import { PrismaClient, AttendanceStatus, Prisma } from "@prisma/client";
import {
  differenceInMinutes,
  format,
  startOfDay,
  endOfDay,
  getDay,
  parseISO,
  setHours,
  setMinutes,
} from "date-fns";

const prisma = new PrismaClient();

export interface CreateAttendanceData {
  employeeId: string;
  date: Date;
  checkIn?: Date | null;
  checkOut?: Date | null;
  status: AttendanceStatus;
  notes?: string | null;
}

export interface UpdateAttendanceData {
  checkIn?: Date | null;
  checkOut?: Date | null;
  status?: AttendanceStatus;
  notes?: string | null;
  isValidated?: boolean;
  validatedBy?: string | null;
}

export interface AttendanceFilters {
  employeeId?: string;
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
  isValidated?: boolean;
}

export class AttendanceService {
  // ⭐ Calculer le statut automatiquement basé sur les horaires de travail
  private async calculateAttendanceStatus(
    companyId: string,
    checkInTime: Date,
    checkOutTime?: Date | null
  ): Promise<AttendanceStatus> {
    const dayOfWeek = getDay(checkInTime); // 0 = dimanche, 1 = lundi, etc.

    // Récupérer les horaires de travail de l'entreprise pour ce jour
    const workSchedule = await prisma.workSchedule.findFirst({
      where: {
        companyId,
        dayOfWeek,
      },
    });

    if (!workSchedule || !workSchedule.isWorkingDay) {
      // Si pas d'horaires définis ou jour non travaillé, considérer comme absent
      return AttendanceStatus.ABSENT;
    }

    // Créer les heures de début et fin pour ce jour
    const startTimeParts = workSchedule.startTime.split(":");
    const endTimeParts = workSchedule.endTime.split(":");

    if (startTimeParts.length < 2 || endTimeParts.length < 2) {
      throw new Error("Format d'heure invalide dans les horaires de travail");
    }

    const startHour = parseInt(startTimeParts[0]!, 10);
    const startMinute = parseInt(startTimeParts[1]!, 10);
    const endHour = parseInt(endTimeParts[0]!, 10);
    const endMinute = parseInt(endTimeParts[1]!, 10);

    const workStartTime = setMinutes(
      setHours(startOfDay(checkInTime), startHour),
      startMinute
    );
    const workEndTime = setMinutes(
      setHours(startOfDay(checkInTime), endHour),
      endMinute
    );

    // Calculer le retard (15 minutes de tolérance)
    const lateThresholdMinutes = 15;
    const minutesLate = differenceInMinutes(checkInTime, workStartTime);

    // Si l'heure de fin de travail est dépassée et pas de check-out, considérer comme absent
    const now = new Date();
    if (now > workEndTime && !checkOutTime) {
      return AttendanceStatus.ABSENT;
    }

    // Si en retard de plus de 15 minutes
    if (minutesLate > lateThresholdMinutes) {
      return AttendanceStatus.LATE;
    }

    // Si check-out existe, vérifier si c'est une demi-journée
    if (checkOutTime) {
      const workDuration = differenceInMinutes(checkOutTime, checkInTime);
      const expectedDuration = differenceInMinutes(workEndTime, workStartTime);

      // Si moins de 50% du temps de travail, considérer comme demi-journée
      if (workDuration < expectedDuration * 0.5) {
        return AttendanceStatus.HALF_DAY;
      }
    }

    return AttendanceStatus.PRESENT;
  }

  // ⭐ Rechercher un employé par code ou email
  async findEmployeeByCodeOrEmail(companyId: string, searchTerm: string) {
    const employee = await prisma.employee.findFirst({
      where: {
        companyId,
        isActive: true,
        OR: [
          { employeeCode: { contains: searchTerm } },
          { email: { contains: searchTerm } },
        ],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!employee) {
      throw new Error("Employé non trouvé avec ce code ou email");
    }

    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      position: employee.position,
    };
  }

  // ⭐ Check-in d'un employé
  async checkIn(employeeId: string, companyId: string, notes?: string) {
    const today = startOfDay(new Date());
    const now = new Date();

    // Vérifier si l'employé existe et est actif
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        companyId: companyId,
        isActive: true,
      },
    });

    if (!employee) {
      throw new Error("Employé non trouvé ou inactif");
    }

    // Vérifier s'il n'y a pas déjà un pointage aujourd'hui
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employeeId,
          date: today,
        },
      },
    });

    if (existingAttendance && existingAttendance.checkIn) {
      throw new Error("Check-in déjà effectué aujourd'hui");
    }

    // Récupérer les horaires de travail pour calculer le retard
    const dayOfWeek = now.getDay();
    const workSchedule = await prisma.workSchedule.findUnique({
      where: {
        companyId_dayOfWeek: {
          companyId: companyId,
          dayOfWeek: dayOfWeek,
        },
      },
    });

    let lateMinutes = 0;
    let status: AttendanceStatus = AttendanceStatus.PRESENT;

    if (workSchedule && workSchedule.isWorkingDay) {
      const [startHour, startMinute] = workSchedule.startTime
        .split(":")
        .map(Number);
      const expectedStartTime = new Date(today);
      expectedStartTime.setHours(startHour || 0, startMinute || 0, 0, 0);

      if (now > expectedStartTime) {
        lateMinutes = differenceInMinutes(now, expectedStartTime);
        status = AttendanceStatus.LATE;
      }
    }

    // Créer ou mettre à jour le pointage
    const attendanceData = {
      employeeId,
      companyId,
      date: today,
      checkIn: now,
      status,
      lateMinutes,
      notes: notes || null,
    };

    if (existingAttendance) {
      return await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkIn: now,
          status,
          lateMinutes,
          notes: notes || existingAttendance.notes,
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      });
    } else {
      return await prisma.attendance.create({
        data: attendanceData,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      });
    }
  }

  // ⭐ Check-out d'un employé
  async checkOut(employeeId: string, companyId: string, notes?: string) {
    const today = startOfDay(new Date());
    const now = new Date();

    // Trouver le pointage du jour
    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employeeId,
          date: today,
        },
      },
    });

    if (!attendance) {
      throw new Error("Aucun check-in trouvé pour aujourd'hui");
    }

    if (attendance.checkOut) {
      throw new Error("Check-out déjà effectué aujourd'hui");
    }

    if (!attendance.checkIn) {
      throw new Error("Check-in requis avant le check-out");
    }

    // Calculer les heures travaillées
    const hoursWorked = differenceInMinutes(now, attendance.checkIn) / 60;

    return await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        hoursWorked: new Prisma.Decimal(hoursWorked.toFixed(2)),
        notes: notes || attendance.notes,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });
  }

  // ⭐ Créer un pointage manuel (par un admin)
  // ⭐ Créer un pointage avec calcul automatique du statut
  async createAttendanceWithAutoStatus(
    employeeId: string,
    companyId: string,
    checkInTime: Date,
    checkOutTime?: Date | null,
    notes?: string
  ) {
    const attendanceDate = startOfDay(checkInTime);

    // Vérifier si l'employé appartient à cette entreprise
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        companyId: companyId,
        isActive: true,
      },
    });

    if (!employee) {
      throw new Error("Employé non trouvé ou inactif");
    }

    // Vérifier s'il n'y a pas déjà un pointage pour cette date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employeeId,
          date: attendanceDate,
        },
      },
    });

    if (existingAttendance) {
      throw new Error("Un pointage existe déjà pour cette date");
    }

    // Calculer automatiquement le statut
    const status = await this.calculateAttendanceStatus(
      companyId,
      checkInTime,
      checkOutTime
    );

    // Calculer les heures travaillées si check-out est fourni
    let hoursWorked: number | null = null;
    if (checkOutTime) {
      hoursWorked = differenceInMinutes(checkOutTime, checkInTime) / 60;
    }

    // Créer le pointage
    const attendanceData: any = {
      employeeId,
      companyId,
      date: attendanceDate,
      checkIn: checkInTime,
      status,
      hoursWorked,
      isValidated: false,
    };

    if (checkOutTime !== undefined) {
      attendanceData.checkOut = checkOutTime;
    }

    if (notes !== undefined) {
      attendanceData.notes = notes;
    }

    const attendance = await prisma.attendance.create({
      data: attendanceData,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            position: true,
          },
        },
      },
    });

    return attendance;
  }

  // ⭐ Créer un pointage manuel (méthode existante)
  async createManualAttendance(data: CreateAttendanceData, companyId: string) {
    const attendanceDate = startOfDay(data.date);

    // Vérifier si l'employé appartient à cette entreprise
    const employee = await prisma.employee.findFirst({
      where: {
        id: data.employeeId,
        companyId: companyId,
        isActive: true,
      },
    });

    if (!employee) {
      throw new Error("Employé non trouvé ou inactif");
    }

    // Vérifier s'il n'y a pas déjà un pointage pour cette date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: data.employeeId,
          date: attendanceDate,
        },
      },
    });

    if (existingAttendance) {
      throw new Error("Un pointage existe déjà pour cette date");
    }

    // Calculer les heures travaillées si check-in et check-out sont fournis
    let hoursWorked = null;
    if (data.checkIn && data.checkOut) {
      const hours = differenceInMinutes(data.checkOut, data.checkIn) / 60;
      hoursWorked = new Prisma.Decimal(hours.toFixed(2));
    }

    return await prisma.attendance.create({
      data: {
        employeeId: data.employeeId,
        companyId: companyId,
        date: attendanceDate,
        checkIn: data.checkIn || null,
        checkOut: data.checkOut || null,
        status: data.status,
        hoursWorked: hoursWorked,
        notes: data.notes || null,
        lateMinutes: 0, // À calculer manuellement si nécessaire
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });
  }

  // ⭐ Mettre à jour un pointage
  async updateAttendance(
    attendanceId: string,
    data: UpdateAttendanceData,
    companyId: string
  ) {
    // Vérifier que le pointage appartient à cette entreprise
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        companyId: companyId,
      },
    });

    if (!existingAttendance) {
      throw new Error("Pointage non trouvé");
    }

    // Calculer les heures travaillées si nécessaire
    let hoursWorked = existingAttendance.hoursWorked;
    if (data.checkIn || data.checkOut) {
      const checkIn = data.checkIn || existingAttendance.checkIn;
      const checkOut = data.checkOut || existingAttendance.checkOut;

      if (checkIn && checkOut) {
        const hours = differenceInMinutes(checkOut, checkIn) / 60;
        hoursWorked = new Prisma.Decimal(hours.toFixed(2));
      }
    }

    return await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        ...data,
        hoursWorked,
        validatedAt: data.isValidated
          ? new Date()
          : existingAttendance.validatedAt,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });
  }

  // ⭐ Obtenir les pointages avec filtres
  async getAttendances(filters: AttendanceFilters, page = 1, limit = 20) {
    const where: Prisma.AttendanceWhereInput = {};

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = startOfDay(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = endOfDay(filters.endDate);
      }
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.isValidated !== undefined) {
      where.isValidated = filters.isValidated;
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
              position: true,
            },
          },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      attendances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ⭐ Obtenir le pointage du jour pour un employé
  async getTodayAttendance(employeeId: string, companyId: string) {
    const today = startOfDay(new Date());

    return await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employeeId,
          date: today,
        },
        companyId: companyId,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });
  }

  // ⭐ Statistiques de présence pour un employé
  async getEmployeeAttendanceStats(
    employeeId: string,
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: Prisma.AttendanceWhereInput = {
      employeeId,
      companyId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startOfDay(startDate);
      if (endDate) where.date.lte = endOfDay(endDate);
    }

    const [total, present, absent, late, halfDay, sickLeave, vacation] =
      await Promise.all([
        prisma.attendance.count({ where }),
        prisma.attendance.count({
          where: { ...where, status: AttendanceStatus.PRESENT },
        }),
        prisma.attendance.count({
          where: { ...where, status: AttendanceStatus.ABSENT },
        }),
        prisma.attendance.count({
          where: { ...where, status: AttendanceStatus.LATE },
        }),
        prisma.attendance.count({
          where: { ...where, status: AttendanceStatus.HALF_DAY },
        }),
        prisma.attendance.count({
          where: { ...where, status: AttendanceStatus.SICK_LEAVE },
        }),
        prisma.attendance.count({
          where: { ...where, status: AttendanceStatus.VACATION },
        }),
      ]);

    // Calculer le total des heures travaillées
    const attendancesWithHours = await prisma.attendance.findMany({
      where: {
        ...where,
        hoursWorked: { not: null },
      },
      select: { hoursWorked: true },
    });

    const totalHours = attendancesWithHours.reduce(
      (sum, att) => sum + (att.hoursWorked ? Number(att.hoursWorked) : 0),
      0
    );

    return {
      total,
      present,
      absent,
      late,
      halfDay,
      sickLeave,
      vacation,
      totalHours: Number(totalHours.toFixed(2)),
      attendanceRate:
        total > 0
          ? Number((((present + late + halfDay) / total) * 100).toFixed(2))
          : 0,
    };
  }

  // ⭐ Supprimer un pointage
  async deleteAttendance(attendanceId: string, companyId: string) {
    // Vérifier que le pointage appartient à cette entreprise
    const attendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        companyId: companyId,
      },
    });

    if (!attendance) {
      throw new Error("Pointage non trouvé");
    }

    return await prisma.attendance.delete({
      where: { id: attendanceId },
    });
  }
}

export const attendanceService = new AttendanceService();
