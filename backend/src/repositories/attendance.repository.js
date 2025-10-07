import { BaseRepository } from "./base.repository.js";

export class AttendanceRepository extends BaseRepository {
  constructor() {
    super("attendance");
  }

  /**
   * Trouve les pointages par employé et période
   */
  async findByEmployeeAndPeriod(employeeId, startDate, endDate) {
    return await this.prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: "asc" },
    });
  }

  /**
   * Trouve les pointages par entreprise et période
   */
  async findByCompanyAndPeriod(companyId, startDate, endDate, options = {}) {
    const { page = 1, limit = 50, employeeId, status } = options;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    const include = {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
          contractType: true,
        },
      },
    };

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: [{ date: "desc" }, { employee: { lastName: "asc" } }],
      }),
      this.prisma.attendance.count({ where }),
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

  /**
   * Récupère les statistiques de pointage pour une entreprise
   */
  async getCompanyStats(companyId, startDate, endDate) {
    const where = {
      companyId,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const stats = await this.prisma.attendance.groupBy({
      by: ["status"],
      where,
      _count: {
        status: true,
      },
      _sum: {
        hoursWorked: true,
        lateMinutes: true,
      },
    });

    const totalAttendances = await this.prisma.attendance.count({ where });

    const result = {
      totalAttendances,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      halfDayCount: 0,
      vacationCount: 0,
      totalHoursWorked: 0,
      totalLateMinutes: 0,
    };

    stats.forEach((stat) => {
      switch (stat.status) {
        case "PRESENT":
          result.presentCount = stat._count.status;
          break;
        case "ABSENT":
          result.absentCount = stat._count.status;
          break;
        case "LATE":
          result.lateCount = stat._count.status;
          break;
        case "HALF_DAY":
          result.halfDayCount = stat._count.status;
          break;
        case "VACATION":
          result.vacationCount = stat._count.status;
          break;
      }

      result.totalHoursWorked += Number(stat._sum.hoursWorked) || 0;
      result.totalLateMinutes += Number(stat._sum.lateMinutes) || 0;
    });

    // Calculs des taux
    if (totalAttendances > 0) {
      result.attendanceRate = (
        ((result.presentCount + result.lateCount) / totalAttendances) *
        100
      ).toFixed(1);
      result.punctualityRate = (
        (result.presentCount / totalAttendances) *
        100
      ).toFixed(1);
    } else {
      result.attendanceRate = 0;
      result.punctualityRate = 0;
    }

    return result;
  }

  /**
   * Trouve les pointages par employé avec pagination
   */
  async findByEmployee(employeeId, options = {}) {
    const { page = 1, limit = 30, startDate, endDate, status } = options;
    const skip = (page - 1) * limit;

    const where = { employeeId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status) {
      where.status = status;
    }

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
      }),
      this.prisma.attendance.count({ where }),
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

  /**
   * Valide un pointage
   */
  async validate(attendanceId, validatedBy) {
    return await this.update(attendanceId, {
      isValidated: true,
      validatedAt: new Date(),
      validatedBy,
    });
  }

  /**
   * Annule la validation d'un pointage
   */
  async unvalidate(attendanceId) {
    return await this.update(attendanceId, {
      isValidated: false,
      validatedAt: null,
      validatedBy: null,
    });
  }

  /**
   * Enregistre un pointage d'entrée
   */
  async checkIn(employeeId, companyId, date = new Date()) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Vérifier s'il y a déjà un pointage pour aujourd'hui
    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingAttendance) {
      if (existingAttendance.checkIn) {
        throw new Error("Pointage d'entrée déjà enregistré pour aujourd'hui");
      }

      // Mettre à jour le pointage existant
      return await this.update(existingAttendance.id, {
        checkIn: new Date(),
        status: "PRESENT",
      });
    }

    // Créer un nouveau pointage
    return await this.create({
      employeeId,
      companyId,
      date: today,
      checkIn: new Date(),
      status: "PRESENT",
    });
  }

  /**
   * Enregistre un pointage de sortie
   */
  async checkOut(employeeId, companyId, date = new Date()) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Trouver le pointage du jour
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!attendance) {
      throw new Error("Aucun pointage d'entrée trouvé pour aujourd'hui");
    }

    if (attendance.checkOut) {
      throw new Error("Pointage de sortie déjà enregistré pour aujourd'hui");
    }

    const checkOut = new Date();
    let hoursWorked = 0;

    if (attendance.checkIn) {
      const diffMs =
        checkOut.getTime() - new Date(attendance.checkIn).getTime();
      hoursWorked = Math.max(0, diffMs / (1000 * 60 * 60) - 1); // -1 heure pour la pause déjeuner
    }

    return await this.update(attendance.id, {
      checkOut,
      hoursWorked: parseFloat(hoursWorked.toFixed(2)),
    });
  }

  /**
   * Recherche les pointages
   */
  async search(companyId, searchQuery, options = {}) {
    const { page = 1, limit = 50, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      employee: {
        OR: [
          {
            firstName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            employeeCode: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        ],
      },
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const include = {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
          contractType: true,
        },
      },
    };

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: [{ date: "desc" }, { employee: { lastName: "asc" } }],
      }),
      this.prisma.attendance.count({ where }),
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
}

export const attendanceRepository = new AttendanceRepository();
