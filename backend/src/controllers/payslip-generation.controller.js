import { PrismaClient } from "@prisma/client";
import { httpStatus } from "../constants/httpStatus.js";
import { successResponse, errorResponse } from "../utils/response.js";

const prisma = new PrismaClient();

/**
 * Génère les bulletins de paie pour un cycle donné
 */
export const generatePayslipsForPayRun = async (req, res) => {
  try {
    const { companyId, payRunId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(
        res,
        httpStatus.UNAUTHORIZED,
        "Utilisateur non authentifié"
      );
    }

    // Vérifier que l'utilisateur appartient à cette entreprise
    if (req.user.companyId !== companyId) {
      return errorResponse(res, httpStatus.FORBIDDEN, "Accès refusé");
    }

    console.log("🚀 Début de la génération des bulletins");
    console.log(`📋 Cycle: ${payRunId}, Entreprise: ${companyId}`);

    // Vérifier que le cycle de paie existe
    const payRun = await prisma.payRun.findFirst({
      where: { id: payRunId, companyId },
      include: { company: true },
    });

    if (!payRun) {
      return errorResponse(
        res,
        httpStatus.NOT_FOUND,
        "Cycle de paie non trouvé"
      );
    }

    console.log(`✅ Cycle trouvé: ${payRun.title}`);

    // Récupérer tous les employés actifs
    const employees = await prisma.employee.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: { lastName: "asc" },
    });

    if (employees.length === 0) {
      return errorResponse(
        res,
        httpStatus.BAD_REQUEST,
        "Aucun employé actif trouvé pour cette entreprise"
      );
    }

    console.log(`👥 Employés à traiter: ${employees.length}`);

    // Supprimer les anciens bulletins s'ils existent
    const existingCount = await prisma.payslip.count({
      where: { payRunId },
    });

    if (existingCount > 0) {
      await prisma.payslip.deleteMany({
        where: { payRunId },
      });
      console.log(`🗑️ Suppression de ${existingCount} anciens bulletins`);
    }

    const results = {
      generated: [],
      errors: [],
      totals: {
        gross: 0,
        net: 0,
        deductions: 0,
      },
    };

    let processed = 0;
    const total = employees.length;

    console.log("\n🔄 GÉNÉRATION DES BULLETINS:");
    console.log("================================");

    // Utiliser une transaction pour garantir la cohérence
    await prisma.$transaction(async (tx) => {
      for (const employee of employees) {
        try {
          processed++;
          const progress = Math.round((processed / total) * 100);

          console.log(
            `\n[${processed}/${total} - ${progress}%] ${employee.firstName} ${employee.lastName}`
          );

          // Calculer le salaire selon le type de contrat
          let grossAmount = 0;
          let daysWorked = 22; // Jours ouvrables par défaut
          let hoursWorked = null;

          switch (employee.contractType) {
            case "DAILY":
              if (!employee.dailyRate || employee.dailyRate <= 0) {
                throw new Error(
                  `Taux journalier manquant pour ${employee.firstName} ${employee.lastName}`
                );
              }
              grossAmount = Number(employee.dailyRate) * daysWorked;
              console.log(
                `💵 Journalier: ${employee.dailyRate} × ${daysWorked} jours = ${grossAmount}`
              );
              break;

            case "FIXED":
              if (!employee.fixedSalary || employee.fixedSalary <= 0) {
                throw new Error(
                  `Salaire fixe manquant pour ${employee.firstName} ${employee.lastName}`
                );
              }
              grossAmount = Number(employee.fixedSalary);
              console.log(`💵 Fixe: ${grossAmount}`);
              break;

            case "HONORARIUM":
              if (!employee.hourlyRate || employee.hourlyRate <= 0) {
                throw new Error(
                  `Taux horaire manquant pour ${employee.firstName} ${employee.lastName}`
                );
              }
              hoursWorked = 160; // 160h par défaut
              grossAmount = Number(employee.hourlyRate) * hoursWorked;
              console.log(
                `💵 Honoraire: ${employee.hourlyRate} × ${hoursWorked} heures = ${grossAmount}`
              );
              break;

            default:
              throw new Error(
                `Type de contrat non supporté: ${employee.contractType}`
              );
          }

          // Calculer les charges sociales
          const socialCharges = calculateSocialCharges(
            grossAmount,
            employee.contractType
          );
          const totalDeductions = socialCharges.reduce(
            (sum, charge) => sum + Number(charge.amount),
            0
          );
          const netAmount = grossAmount - totalDeductions;

          console.log(
            `💰 Montants: Brut=${grossAmount}, Charges=${totalDeductions}, Net=${netAmount}`
          );

          // Générer le numéro de bulletin
          const payslipNumber = generatePayslipNumber(
            employee.employeeCode,
            payRun
          );

          // Créer le bulletin
          const payslip = await tx.payslip.create({
            data: {
              payslipNumber,
              employeeId: employee.id,
              payRunId: payRunId,
              grossAmount,
              totalDeductions,
              netAmount,
              daysWorked,
              hoursWorked,
              status: "PENDING",
            },
          });

          // Créer les déductions
          if (socialCharges.length > 0) {
            await tx.payslipDeduction.createMany({
              data: socialCharges.map((charge) => ({
                type: charge.type,
                description: charge.description,
                amount: charge.amount,
                payslipId: payslip.id,
              })),
            });
            console.log(`📝 ${socialCharges.length} déductions ajoutées`);
          }

          results.generated.push({
            employee: `${employee.firstName} ${employee.lastName}`,
            payslipNumber,
            grossAmount,
            netAmount,
          });

          results.totals.gross += Number(grossAmount);
          results.totals.net += Number(netAmount);
          results.totals.deductions += Number(totalDeductions);

          console.log(`✅ Bulletin généré: ${payslipNumber}`);
        } catch (error) {
          console.error(
            `❌ Erreur pour ${employee.firstName} ${employee.lastName}:`,
            error.message
          );
          results.errors.push({
            employee: `${employee.firstName} ${employee.lastName}`,
            error: error.message,
          });
        }
      }

      // Mettre à jour les totaux du cycle de paie
      await tx.payRun.update({
        where: { id: payRunId },
        data: {
          totalGross: results.totals.gross,
          totalNet: results.totals.net,
        },
      });
    });

    console.log("\n🎉 GÉNÉRATION TERMINÉE:");
    console.log("========================");
    console.log(`✅ Bulletins générés: ${results.generated.length}`);
    console.log(`❌ Erreurs: ${results.errors.length}`);
    console.log(`💰 Total brut: ${results.totals.gross.toLocaleString()} XOF`);
    console.log(`💵 Total net: ${results.totals.net.toLocaleString()} XOF`);

    return successResponse(
      res,
      httpStatus.OK,
      `${results.generated.length} bulletins générés avec succès`,
      {
        summary: {
          generated: results.generated.length,
          errors: results.errors.length,
          totalGross: results.totals.gross,
          totalNet: results.totals.net,
        },
        results,
      }
    );
  } catch (error) {
    console.error("❌ Erreur lors de la génération des bulletins:", error);
    return errorResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Erreur lors de la génération des bulletins"
    );
  }
};

/**
 * Calcule les charges sociales pour un montant donné
 */
function calculateSocialCharges(grossAmount, contractType) {
  const charges = [];

  if (contractType === "FIXED" || contractType === "DAILY") {
    // CNSS (Caisse Nationale de Sécurité Sociale) - 8.4% employé
    charges.push({
      type: "SOCIAL",
      description: "Cotisation CNSS (8.4%)",
      amount: Math.round(grossAmount * 0.084),
    });

    // IPRES (Institution de Prévoyance Retraite du Sénégal) - 5.6% employé
    charges.push({
      type: "SOCIAL",
      description: "Cotisation IPRES (5.6%)",
      amount: Math.round(grossAmount * 0.056),
    });

    // CSS (Caisse de Sécurité Sociale) - 1% employé
    charges.push({
      type: "SOCIAL",
      description: "Cotisation CSS (1%)",
      amount: Math.round(grossAmount * 0.01),
    });
  }

  // Impôt sur le revenu (progressif)
  const tax = calculateIncomeTax(grossAmount);
  if (tax > 0) {
    charges.push({
      type: "TAX",
      description: "Impôt sur le revenu",
      amount: tax,
    });
  }

  return charges;
}

/**
 * Calcule l'impôt sur le revenu (barème progressif sénégalais simplifié)
 */
function calculateIncomeTax(grossAmount) {
  const monthlyGross = grossAmount;

  // Abattement forfaitaire de 30% avec un minimum de 200 000 XOF
  const abattement = Math.max(monthlyGross * 0.3, 200000);
  const taxableIncome = Math.max(0, monthlyGross - abattement);

  let tax = 0;

  // Barème progressif simplifié
  if (taxableIncome <= 500000) {
    tax = 0; // Exonéré
  } else if (taxableIncome <= 1000000) {
    tax = (taxableIncome - 500000) * 0.15; // 15%
  } else if (taxableIncome <= 2000000) {
    tax = 75000 + (taxableIncome - 1000000) * 0.2; // 20%
  } else {
    tax = 275000 + (taxableIncome - 2000000) * 0.25; // 25%
  }

  return Math.round(tax);
}

/**
 * Génère un numéro de bulletin unique
 */
function generatePayslipNumber(employeeCode, payRun) {
  const year = payRun.periodStart.getFullYear();
  const month = String(payRun.periodStart.getMonth() + 1).padStart(2, "0");

  // Format: BULL-YYYY-MM-CODECMP-TIMESTAMP
  const timestamp = Date.now().toString().slice(-6); // 6 derniers chiffres du timestamp
  return `BULL-${year}-${month}-${employeeCode}-${timestamp}`;
}

/**
 * Récupère les bulletins d'un cycle avec pagination
 */
export const getPayslipsByPayRun = async (req, res) => {
  try {
    const { companyId, payRunId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Vérifier que l'utilisateur appartient à cette entreprise
    if (req.user.companyId !== companyId) {
      return errorResponse(res, httpStatus.FORBIDDEN, "Accès refusé");
    }

    const skip = (page - 1) * limit;

    const [payslips, total, payRun] = await Promise.all([
      prisma.payslip.findMany({
        where: { payRunId },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              contractType: true,
              position: true,
            },
          },
          deductions: true,
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.payslip.count({ where: { payRunId } }),
      prisma.payRun.findUnique({
        where: { id: payRunId },
        select: {
          id: true,
          title: true,
          status: true,
          periodStart: true,
          periodEnd: true,
          totalGross: true,
          totalNet: true,
        },
      }),
    ]);

    return successResponse(
      res,
      httpStatus.OK,
      "Bulletins récupérés avec succès",
      {
        payslips,
        payRun,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      }
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
