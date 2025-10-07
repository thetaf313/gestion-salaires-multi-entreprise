import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Configuration pour la génération des pointages
const ATTENDANCE_CONFIG = {
  // Périodes de pointage (2 derniers mois)
  startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Il y a 60 jours
  endDate: new Date(),

  // Horaires de travail par défaut
  workingHours: {
    startTime: "08:00",
    endTime: "17:00",
    lunchBreak: 1, // 1 heure de pause déjeuner
  },

  // Probabilités de génération réaliste
  probabilities: {
    present: 0.85, // 85% de présence
    late: 0.1, // 10% de retard
    absent: 0.05, // 5% d'absence
    halfDay: 0.03, // 3% de demi-journée
    vacation: 0.02, // 2% de congé
  },

  // Variabilité des horaires
  timeVariability: {
    arrivalVarianceMinutes: 30, // ±30 minutes d'arrivée
    departureVarianceMinutes: 45, // ±45 minutes de départ
    lateThresholdMinutes: 15, // Retard si > 15 minutes
  },
};

/**
 * Génère une heure aléatoire avec variance
 */
function generateTimeWithVariance(baseTime, varianceMinutes) {
  const [hours, minutes] = baseTime.split(":").map(Number);
  const baseMinutes = hours * 60 + minutes;

  const variance =
    Math.floor(Math.random() * varianceMinutes * 2) - varianceMinutes;
  const finalMinutes = Math.max(0, Math.min(1439, baseMinutes + variance)); // 0-1439 minutes dans une journée

  const finalHours = Math.floor(finalMinutes / 60);
  const finalMins = finalMinutes % 60;

  return `${finalHours.toString().padStart(2, "0")}:${finalMins
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Crée un DateTime à partir d'une date et d'une heure
 */
function createDateTime(date, timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const dateTime = new Date(date);
  dateTime.setHours(hours, minutes, 0, 0);
  return dateTime;
}

/**
 * Calcule les heures travaillées entre checkIn et checkOut
 */
function calculateHoursWorked(checkIn, checkOut, lunchBreakHours = 1) {
  if (!checkIn || !checkOut) return 0;

  const diffMs = checkOut.getTime() - checkIn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Soustrait la pause déjeuner si la journée est complète (> 6h)
  return Math.max(0, diffHours > 6 ? diffHours - lunchBreakHours : diffHours);
}

/**
 * Détermine le statut d'attendance basé sur les probabilités
 */
function generateAttendanceStatus() {
  const rand = Math.random();
  const probs = ATTENDANCE_CONFIG.probabilities;

  if (rand < probs.absent) return "ABSENT";
  if (rand < probs.absent + probs.vacation) return "VACATION";
  if (rand < probs.absent + probs.vacation + probs.halfDay) return "HALF_DAY";
  if (rand < probs.absent + probs.vacation + probs.halfDay + probs.late)
    return "LATE";

  return "PRESENT";
}

/**
 * Vérifie si c'est un jour de weekend (samedi/dimanche)
 */
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Dimanche = 0, Samedi = 6
}

/**
 * Génère les pointages pour un employé sur une période donnée
 */
async function generateAttendanceForEmployee(
  employee,
  company,
  startDate,
  endDate
) {
  const attendances = [];
  const currentDate = new Date(startDate);

  console.log(
    `🔄 Génération des pointages pour ${employee.firstName} ${employee.lastName}...`
  );

  while (currentDate <= endDate) {
    // Ignorer les weekends (à moins que l'entreprise ne travaille 7j/7)
    if (!isWeekend(currentDate)) {
      let status = generateAttendanceStatus();
      let checkIn = null;
      let checkOut = null;
      let hoursWorked = null;
      let lateMinutes = 0;

      const config = ATTENDANCE_CONFIG;

      switch (status) {
        case "PRESENT":
        case "LATE":
          const arrivalTime = generateTimeWithVariance(
            config.workingHours.startTime,
            config.timeVariability.arrivalVarianceMinutes
          );
          const departureTime = generateTimeWithVariance(
            config.workingHours.endTime,
            config.timeVariability.departureVarianceMinutes
          );

          checkIn = createDateTime(currentDate, arrivalTime);
          checkOut = createDateTime(currentDate, departureTime);
          hoursWorked = calculateHoursWorked(
            checkIn,
            checkOut,
            config.workingHours.lunchBreak
          );

          // Calcul du retard
          const scheduledStart = createDateTime(
            currentDate,
            config.workingHours.startTime
          );
          const lateDiff = checkIn.getTime() - scheduledStart.getTime();
          lateMinutes = Math.max(0, Math.floor(lateDiff / (1000 * 60)));

          // Ajuster le statut si retard significatif
          if (
            lateMinutes > config.timeVariability.lateThresholdMinutes &&
            status === "PRESENT"
          ) {
            status = "LATE";
          }
          break;

        case "HALF_DAY":
          const halfDayArrival = generateTimeWithVariance(
            config.workingHours.startTime,
            15
          );
          const halfDayDeparture = "13:00"; // Demi-journée jusqu'à 13h

          checkIn = createDateTime(currentDate, halfDayArrival);
          checkOut = createDateTime(currentDate, halfDayDeparture);
          hoursWorked = calculateHoursWorked(checkIn, checkOut, 0); // Pas de pause déjeuner en demi-journée
          break;

        case "ABSENT":
        case "VACATION":
          // Pas de pointage pour les absences et congés
          break;
      }

      const attendance = {
        date: new Date(currentDate),
        checkIn,
        checkOut,
        status,
        hoursWorked: hoursWorked ? parseFloat(hoursWorked.toFixed(2)) : null,
        lateMinutes,
        isValidated: Math.random() > 0.2, // 80% des pointages sont validés
        validatedAt: Math.random() > 0.2 ? new Date() : null,
        employeeId: employee.id,
        companyId: company.id,
        notes:
          status === "VACATION"
            ? "Congé payé"
            : status === "ABSENT"
            ? "Absence non justifiée"
            : lateMinutes > 30
            ? "Retard important"
            : null,
      };

      attendances.push(attendance);
    }

    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return attendances;
}

/**
 * Fonction principale de génération des pointages
 */
async function seedAttendances() {
  try {
    console.log("🚀 Début de la génération des pointages...");

    // Récupérer toutes les entreprises et leurs employés
    const companies = await prisma.company.findMany({
      include: {
        employees: {
          where: { isActive: true },
        },
      },
    });

    if (companies.length === 0) {
      console.log(
        "❌ Aucune entreprise trouvée. Veuillez d'abord créer des entreprises et des employés."
      );
      return;
    }

    let totalAttendances = 0;

    for (const company of companies) {
      console.log(`\n🏢 Traitement de l'entreprise: ${company.name}`);
      console.log(`👥 Nombre d'employés actifs: ${company.employees.length}`);

      if (company.employees.length === 0) {
        console.log("⚠️ Aucun employé actif trouvé pour cette entreprise.");
        continue;
      }

      // Supprimer les anciens pointages pour cette période (optionnel)
      const deleteResult = await prisma.attendance.deleteMany({
        where: {
          companyId: company.id,
          date: {
            gte: ATTENDANCE_CONFIG.startDate,
            lte: ATTENDANCE_CONFIG.endDate,
          },
        },
      });

      if (deleteResult.count > 0) {
        console.log(
          `🗑️ Suppression de ${deleteResult.count} anciens pointages`
        );
      }

      // Générer les pointages pour chaque employé
      for (const employee of company.employees) {
        const attendances = await generateAttendanceForEmployee(
          employee,
          company,
          ATTENDANCE_CONFIG.startDate,
          ATTENDANCE_CONFIG.endDate
        );

        // Insérer les pointages en batch
        if (attendances.length > 0) {
          await prisma.attendance.createMany({
            data: attendances,
            skipDuplicates: true,
          });

          totalAttendances += attendances.length;
          console.log(
            `  ✅ ${attendances.length} pointages générés pour ${employee.firstName} ${employee.lastName}`
          );
        }
      }
    }

    console.log(`\n🎉 Génération terminée !`);
    console.log(`📊 Total des pointages générés: ${totalAttendances}`);
    console.log(
      `📅 Période: ${ATTENDANCE_CONFIG.startDate.toLocaleDateString()} - ${ATTENDANCE_CONFIG.endDate.toLocaleDateString()}`
    );

    // Statistiques de génération
    const stats = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        date: {
          gte: ATTENDANCE_CONFIG.startDate,
          lte: ATTENDANCE_CONFIG.endDate,
        },
      },
      _count: {
        status: true,
      },
    });

    console.log("\n📈 Répartition des statuts:");
    stats.forEach((stat) => {
      console.log(
        `  ${stat.status}: ${stat._count.status} (${(
          (stat._count.status / totalAttendances) *
          100
        ).toFixed(1)}%)`
      );
    });
  } catch (error) {
    console.error("❌ Erreur lors de la génération des pointages:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAttendances()
    .then(() => {
      console.log("✅ Script terminé avec succès");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur fatale:", error);
      process.exit(1);
    });
}

export { seedAttendances, ATTENDANCE_CONFIG };
