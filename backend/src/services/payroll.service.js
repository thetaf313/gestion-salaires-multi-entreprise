import { PayRunRepository } from "../repositories/payrun.repository.js";
import { PayslipRepository } from "../repositories/payslip.repository.js";
import { AttendanceRepository } from "../repositories/attendance.repository.js";
import { EmployeeRepository } from "../repositories/employee.repository.js";
import { messages } from "../constants/messages.js";

export class PayrollService {
  constructor() {
    this.payRunRepository = new PayRunRepository();
    this.payslipRepository = new PayslipRepository();
    this.attendanceRepository = new AttendanceRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  /**
   * Calcule les charges sociales sur le salaire brut
   */
  calculateSocialCharges(grossAmount, isFixed = false) {
    const charges = {
      // Cotisations salariales (retenues sur le salaire)
      employee: {
        pension: grossAmount * 0.06, // 6% - Retraite
        familyAllowance: grossAmount * 0.045, // 4.5% - Allocations familiales
        health: grossAmount * 0.0225, // 2.25% - Assurance maladie
        unemployment: grossAmount * 0.01, // 1% - Chômage
        total: 0,
      },
      // Cotisations patronales (charges de l'employeur)
      employer: {
        pension: grossAmount * 0.065, // 6.5% - Retraite employeur
        familyAllowance: grossAmount * 0.075, // 7.5% - Allocations familiales employeur
        health: grossAmount * 0.0375, // 3.75% - Assurance maladie employeur
        accident: grossAmount * 0.02, // 2% - Accidents du travail
        training: grossAmount * 0.012, // 1.2% - Formation professionnelle
        total: 0,
      },
    };

    // Calcul des totaux
    charges.employee.total = Object.values(charges.employee)
      .filter((_, index, arr) => index < arr.length - 1)
      .reduce((sum, charge) => sum + charge, 0);

    charges.employer.total = Object.values(charges.employer)
      .filter((_, index, arr) => index < arr.length - 1)
      .reduce((sum, charge) => sum + charge, 0);

    return charges;
  }

  /**
   * Calcule les heures supplémentaires (> 40h/semaine ou > 8h/jour)
   */
  calculateOvertimeHours(attendances, workingHoursPerDay = 8) {
    let totalOvertime = 0;
    let weeklyHours = {};

    attendances.forEach((attendance) => {
      if (attendance.hoursWorked && attendance.hoursWorked > 0) {
        const date = new Date(attendance.date);
        const weekKey = this.getWeekKey(date);

        if (!weeklyHours[weekKey]) {
          weeklyHours[weekKey] = 0;
        }

        // Heures supplémentaires journalières (> 8h/jour)
        if (attendance.hoursWorked > workingHoursPerDay) {
          totalOvertime += attendance.hoursWorked - workingHoursPerDay;
        }

        weeklyHours[weekKey] += attendance.hoursWorked;
      }
    });

    // Heures supplémentaires hebdomadaires (> 40h/semaine)
    Object.values(weeklyHours).forEach((weekHours) => {
      if (weekHours > 40) {
        totalOvertime += weekHours - 40;
      }
    });

    return Math.max(0, totalOvertime);
  }

  /**
   * Obtient la clé de la semaine pour grouper les heures
   */
  getWeekKey(date) {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week}`;
  }

  /**
   * Calcule le numéro de la semaine dans l'année
   */
  getWeekNumber(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  /**
   * Calcule le salaire pour un employé en fonction de son type de contrat
   */
  async calculateEmployeePayroll(employee, attendances, payrunPeriod) {
    const { periodStart, periodEnd } = payrunPeriod;

    // Filtrer les pointages pour la période
    const periodAttendances = attendances.filter((att) => {
      const attDate = new Date(att.date);
      return attDate >= new Date(periodStart) && attDate <= new Date(periodEnd);
    });

    let grossAmount = 0;
    let overtimeHours = 0;
    let overtimeAmount = 0;
    let bonuses = 0;

    const daysWorked = periodAttendances.filter(
      (att) => att.status === "PRESENT" || att.status === "LATE"
    ).length;

    const daysPresent = periodAttendances.filter(
      (att) => att.status === "PRESENT"
    ).length;

    const daysAbsent = periodAttendances.filter(
      (att) => att.status === "ABSENT"
    ).length;

    const daysLate = periodAttendances.filter(
      (att) => att.status === "LATE"
    ).length;

    const hoursWorked = periodAttendances.reduce(
      (sum, att) => sum + (parseFloat(att.hoursWorked) || 0),
      0
    );

    const totalLateMinutes = periodAttendances.reduce(
      (sum, att) => sum + (att.lateMinutes || 0),
      0
    );

    // Calcul selon le type de contrat
    switch (employee.contractType) {
      case "FIXED":
        // Salaire fixe mensuel
        grossAmount = parseFloat(employee.fixedSalary) || 0;

        // Déduction pour absences (proportionnelle)
        const workingDaysInPeriod = this.getWorkingDaysInPeriod(
          periodStart,
          periodEnd
        );
        if (daysAbsent > 0) {
          const absenceDeduction =
            (grossAmount / workingDaysInPeriod) * daysAbsent;
          grossAmount -= absenceDeduction;
        }

        // Heures supplémentaires pour les salariés fixes
        overtimeHours = this.calculateOvertimeHours(periodAttendances);
        if (overtimeHours > 0 && employee.hourlyRate) {
          overtimeAmount =
            overtimeHours * parseFloat(employee.hourlyRate) * 1.5; // 150% pour heures sup
        }
        break;

      case "DAILY":
        // Taux journalier
        const dailyRate = parseFloat(employee.dailyRate) || 0;
        grossAmount = daysWorked * dailyRate;
        break;

      case "HONORARIUM":
        // Taux horaire
        const hourlyRate = parseFloat(employee.hourlyRate) || 0;
        grossAmount = hoursWorked * hourlyRate;

        // Heures supplémentaires pour les honoraires (> 8h/jour)
        overtimeHours = this.calculateOvertimeHours(periodAttendances);
        if (overtimeHours > 0) {
          overtimeAmount = overtimeHours * hourlyRate * 1.5;
        }
        break;
    }

    // Primes de ponctualité (si moins de 30 minutes de retard total)
    if (totalLateMinutes < 30 && daysWorked > 0) {
      bonuses += grossAmount * 0.05; // 5% de prime de ponctualité
    }

    // Primes d'assiduité (si pas d'absence injustifiée)
    if (daysAbsent === 0 && daysWorked > 15) {
      bonuses += grossAmount * 0.03; // 3% de prime d'assiduité
    }

    // Calcul du brut total avec primes et heures sup
    const totalGross = grossAmount + overtimeAmount + bonuses;

    // Calcul des charges sociales
    const socialCharges = this.calculateSocialCharges(
      totalGross,
      employee.contractType === "FIXED"
    );

    // Calcul du net (brut - charges salariales)
    const netAmount = totalGross - socialCharges.employee.total;

    return {
      employee,
      grossAmount: parseFloat(grossAmount.toFixed(2)),
      overtimeHours: parseFloat(overtimeHours.toFixed(2)),
      overtimeAmount: parseFloat(overtimeAmount.toFixed(2)),
      bonuses: parseFloat(bonuses.toFixed(2)),
      totalGross: parseFloat(totalGross.toFixed(2)),
      socialCharges,
      netAmount: parseFloat(netAmount.toFixed(2)),
      daysWorked,
      daysPresent,
      daysAbsent,
      daysLate,
      hoursWorked: parseFloat(hoursWorked.toFixed(2)),
      totalLateMinutes,
      deductions: [
        {
          type: "SOCIAL",
          description: "Cotisations sociales",
          amount: socialCharges.employee.total,
        },
      ],
    };
  }

  /**
   * Calcule le nombre de jours ouvrables dans une période
   */
  getWorkingDaysInPeriod(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Exclure dimanche (0) et samedi (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /**
   * Génère les bulletins de paie pour un cycle de paie
   */
  async generatePayslips(companyId, payRunId) {
    try {
      // Récupérer le cycle de paie
      const payRun = await this.payRunRepository.findById(payRunId);
      if (!payRun || payRun.companyId !== companyId) {
        throw new Error("Cycle de paie non trouvé");
      }

      if (payRun.status !== "DRAFT") {
        throw new Error(
          "Les bulletins peuvent seulement être générés pour un cycle en brouillon"
        );
      }

      // Récupérer tous les employés actifs de l'entreprise
      const employees = await this.employeeRepository.findByCompany(companyId, {
        isActive: true,
      });

      if (employees.length === 0) {
        throw new Error("Aucun employé actif trouvé pour cette entreprise");
      }

      const payslips = [];
      let totalGross = 0;
      let totalNet = 0;

      // Générer un bulletin pour chaque employé
      for (const employee of employees) {
        // Récupérer les pointages de l'employé pour la période
        const attendances =
          await this.attendanceRepository.findByEmployeeAndPeriod(
            employee.id,
            payRun.periodStart,
            payRun.periodEnd
          );

        // Calculer la paie de l'employé
        const payrollData = await this.calculateEmployeePayroll(
          employee,
          attendances,
          {
            periodStart: payRun.periodStart,
            periodEnd: payRun.periodEnd,
          }
        );

        // Générer le numéro de bulletin
        const payslipNumber = await this.generatePayslipNumber(
          companyId,
          payRun.id
        );

        // Créer le bulletin
        const payslip = await this.payslipRepository.create({
          payslipNumber,
          employeeId: employee.id,
          payRunId: payRun.id,
          grossAmount: payrollData.totalGross,
          netAmount: payrollData.netAmount,
          totalDeductions: payrollData.socialCharges.employee.total,
          daysWorked: payrollData.daysWorked,
          daysPresent: payrollData.daysPresent,
          daysAbsent: payrollData.daysAbsent,
          daysLate: payrollData.daysLate,
          hoursWorked: payrollData.hoursWorked,
          totalLateMinutes: payrollData.totalLateMinutes,
          status: "PENDING",
        });

        // Créer les déductions
        for (const deduction of payrollData.deductions) {
          await this.payslipRepository.createDeduction(payslip.id, {
            type: deduction.type,
            description: deduction.description,
            amount: deduction.amount,
          });
        }

        payslips.push({
          ...payslip,
          employee: payrollData.employee,
          deductions: payrollData.deductions,
          socialCharges: payrollData.socialCharges,
          overtimeHours: payrollData.overtimeHours,
          overtimeAmount: payrollData.overtimeAmount,
          bonuses: payrollData.bonuses,
        });

        totalGross += payrollData.totalGross;
        totalNet += payrollData.netAmount;
      }

      // Mettre à jour le cycle de paie avec les totaux
      await this.payRunRepository.update(payRunId, {
        totalGross: parseFloat(totalGross.toFixed(2)),
        totalNet: parseFloat(totalNet.toFixed(2)),
        status: "APPROVED",
      });

      return {
        success: true,
        message: `${payslips.length} bulletins de paie générés avec succès`,
        data: {
          payRun: { ...payRun, totalGross, totalNet, status: "APPROVED" },
          payslips,
        },
      };
    } catch (error) {
      console.error("Erreur lors de la génération des bulletins:", error);
      throw error;
    }
  }

  /**
   * Génère un numéro unique pour le bulletin de paie
   */
  async generatePayslipNumber(companyId, payRunId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    // Compter les bulletins existants pour ce cycle
    const existingCount = await this.payslipRepository.countByPayRun(payRunId);
    const sequence = (existingCount + 1).toString().padStart(3, "0");

    return `PAY${year}${month}${companyId.slice(-4).toUpperCase()}${sequence}`;
  }

  /**
   * Récupère les statistiques de paie pour une entreprise
   */
  async getPayrollStats(companyId) {
    try {
      const stats = await this.payRunRepository.getCompanyStats(companyId);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  }
}

export const payrollService = new PayrollService();
