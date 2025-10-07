import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testPayslipGeneration() {
  try {
    console.log("🔍 TEST DE GÉNÉRATION DE BULLETINS");
    console.log("=====================================\n");

    // 1. Trouver un cycle de paie approuvé récent
    const payRun = await prisma.payRun.findFirst({
      where: { status: "APPROVED" },
      orderBy: { approvedAt: "desc" },
      include: { company: true },
    });

    if (!payRun) {
      console.log("❌ Aucun cycle de paie approuvé trouvé");
      return;
    }

    console.log(`✅ Cycle trouvé: ${payRun.title}`);
    console.log(
      `📅 Période: ${payRun.periodStart.toLocaleDateString()} - ${payRun.periodEnd.toLocaleDateString()}`
    );
    console.log(`🏢 Entreprise: ${payRun.company.name}\n`);

    // 2. Vérifier les employés de cette entreprise
    const employees = await prisma.employee.findMany({
      where: {
        companyId: payRun.companyId,
        isActive: true,
      },
    });

    console.log(`👥 Employés actifs: ${employees.length}`);
    employees.forEach((emp) => {
      console.log(`- ${emp.firstName} ${emp.lastName} (${emp.contractType})`);
      console.log(
        `  Taux: daily=${emp.dailyRate}, fixed=${emp.fixedSalary}, hourly=${emp.hourlyRate}`
      );
    });

    // 3. Vérifier les bulletins existants
    const existingPayslips = await prisma.payslip.findMany({
      where: { payRunId: payRun.id },
      include: { employee: true },
    });

    console.log(`\n📄 Bulletins existants: ${existingPayslips.length}`);
    existingPayslips.forEach((ps) => {
      console.log(
        `- ${ps.employee.firstName} ${ps.employee.lastName}: ${ps.payslipNumber} (${ps.grossAmount} XOF)`
      );
    });

    // 4. Si pas de bulletins, en générer manuellement pour test
    if (existingPayslips.length === 0) {
      console.log("\n🔄 GÉNÉRATION MANUELLE DE TEST...");

      for (const employee of employees.slice(0, 2)) {
        // Test sur 2 employés seulement
        console.log(
          `\n🔍 Test pour ${employee.firstName} ${employee.lastName}`
        );

        // Calcul simple du salaire
        let grossAmount = 0;
        switch (employee.contractType) {
          case "DAILY":
            grossAmount = Number(employee.dailyRate || 0) * 22; // 22 jours ouvrables
            break;
          case "FIXED":
            grossAmount = Number(employee.fixedSalary || 0);
            break;
          case "HONORARIUM":
            grossAmount = Number(employee.hourlyRate || 0) * 160; // 160 heures
            break;
        }

        console.log(`💰 Salaire brut calculé: ${grossAmount}`);

        if (grossAmount > 0) {
          // Charges sociales simplifiées
          const socialCharges = grossAmount * 0.15; // 15% de charges
          const netAmount = grossAmount - socialCharges;

          const payslipNumber = `TEST-${Date.now()}-${employee.employeeCode}`;

          try {
            const payslip = await prisma.payslip.create({
              data: {
                payslipNumber,
                employeeId: employee.id,
                payRunId: payRun.id,
                grossAmount,
                totalDeductions: socialCharges,
                netAmount,
                daysWorked: 22,
                status: "PENDING",
              },
            });

            console.log(`✅ Bulletin test créé: ${payslip.payslipNumber}`);

            // Créer une déduction de test
            await prisma.payslipDeduction.create({
              data: {
                type: "SOCIAL",
                description: "Charges sociales (15%)",
                amount: socialCharges,
                payslipId: payslip.id,
              },
            });

            console.log(`📝 Déduction créée: ${socialCharges} XOF`);
          } catch (error) {
            console.error(`❌ Erreur création bulletin:`, error.message);
          }
        } else {
          console.log(`⚠️ Salaire brut = 0, pas de bulletin créé`);
        }
      }

      // Recalculer les totaux du cycle
      const totalGross = await prisma.payslip.aggregate({
        where: { payRunId: payRun.id },
        _sum: { grossAmount: true, netAmount: true },
      });

      await prisma.payRun.update({
        where: { id: payRun.id },
        data: {
          totalGross: Number(totalGross._sum.grossAmount) || 0,
          totalNet: Number(totalGross._sum.netAmount) || 0,
        },
      });

      console.log(
        `\n💰 Totaux mis à jour: ${totalGross._sum.grossAmount} / ${totalGross._sum.netAmount}`
      );
    }

    // 5. Vérification finale
    const finalPayslips = await prisma.payslip.count({
      where: { payRunId: payRun.id },
    });

    console.log(
      `\n🎉 RÉSULTAT FINAL: ${finalPayslips} bulletins dans le cycle`
    );
  } catch (error) {
    console.error("❌ ERREUR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPayslipGeneration();
