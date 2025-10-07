import { PrismaClient, PayRunStatus } from '@prisma/client';
const prisma = new PrismaClient();

// Test manuel de génération de bulletins pour le cycle d'août
async function testPayslipGeneration() {
  try {
    console.log('🚀 Test de génération des bulletins pour le cycle d\'août...');
    
    // Trouver le cycle d'août approuvé
    const payRun = await prisma.payRun.findFirst({
      where: {
        title: 'Paie Août 2025',
        status: 'APPROVED'
      },
      include: {
        company: true
      }
    });
    
    if (!payRun) {
      console.log('❌ Cycle d\'août non trouvé');
      return;
    }
    
    console.log(`✅ Cycle trouvé: ${payRun.title} (${payRun.id})`);
    
    // Récupérer les employés actifs
    const employees = await prisma.employee.findMany({
      where: {
        companyId: payRun.companyId,
        isActive: true
      }
    });
    
    console.log(`👥 Employés actifs trouvés: ${employees.length}`);
    employees.forEach(emp => {
      console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.contractType})`);
      console.log(`    Salaire: ${emp.dailyRate ? 'Journalier: ' + emp.dailyRate : ''}${emp.fixedSalary ? 'Fixe: ' + emp.fixedSalary : ''}${emp.hourlyRate ? 'Horaire: ' + emp.hourlyRate : ''}`);
    });
    
    // Calculer les jours ouvrés pour la période
    function calculateWorkingDays(startDate, endDate) {
      let count = 0;
      const current = new Date(startDate);
      
      while (current <= endDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
      
      return count;
    }
    
    // Fonction de calcul des bulletins
    function calculatePayslip(employee, payRun) {
      let grossAmount = 0;
      let daysWorked = null;
      let hoursWorked = null;
      
      console.log(`📊 Calcul pour ${employee.firstName} ${employee.lastName}:`);
      
      if (employee.contractType === 'DAILY' && employee.dailyRate) {
        const periodDays = calculateWorkingDays(payRun.periodStart, payRun.periodEnd);
        daysWorked = periodDays;
        grossAmount = Number(employee.dailyRate) * periodDays;
        console.log(`  Type: Journalier - ${periodDays} jours × ${employee.dailyRate} = ${grossAmount}`);
      } else if (employee.contractType === 'FIXED' && employee.fixedSalary) {
        grossAmount = Number(employee.fixedSalary);
        console.log(`  Type: Fixe - ${grossAmount}`);
      } else if (employee.contractType === 'HONORARIUM' && employee.hourlyRate) {
        hoursWorked = 160;
        grossAmount = Number(employee.hourlyRate) * hoursWorked;
        console.log(`  Type: Honoraire - ${hoursWorked}h × ${employee.hourlyRate} = ${grossAmount}`);
      } else {
        console.log(`  ❌ Configuration manquante pour ${employee.employeeCode}`);
        throw new Error(`Configuration de salaire manquante pour l'employé ${employee.employeeCode}`);
      }
      
      // Déductions
      const deductions = [
        {
          type: 'TAX',
          description: 'Impôt sur le revenu',
          amount: grossAmount * 0.1
        },
        {
          type: 'SOCIAL', 
          description: 'Cotisations sociales',
          amount: grossAmount * 0.055
        }
      ];
      
      const totalDeductions = deductions.reduce((sum, ded) => sum + ded.amount, 0);
      const netAmount = grossAmount - totalDeductions;
      
      console.log(`  Brut: ${grossAmount}, Déductions: ${totalDeductions}, Net: ${netAmount}`);
      
      return {
        grossAmount,
        totalDeductions,
        netAmount,
        daysWorked,
        hoursWorked,
        deductions
      };
    }
    
    // Génération des bulletins
    console.log('\n🔄 Génération des bulletins...');
    
    let bulletinsCreated = 0;
    
    for (const employee of employees) {
      try {
        const payslipData = calculatePayslip(employee, payRun);
        
        // Générer le numéro de bulletin
        const timestamp = Date.now().toString().slice(-6);
        const payslipNumber = `PAY-${employee.employeeCode}-${timestamp}`;
        
        // Créer le bulletin
        const payslip = await prisma.payslip.create({
          data: {
            payslipNumber,
            employeeId: employee.id,
            payRunId: payRun.id,
            grossAmount: payslipData.grossAmount,
            totalDeductions: payslipData.totalDeductions,
            netAmount: payslipData.netAmount,
            daysWorked: payslipData.daysWorked,
            hoursWorked: payslipData.hoursWorked,
            status: 'PENDING'
          }
        });
        
        // Créer les déductions
        if (payslipData.deductions.length > 0) {
          await prisma.payslipDeduction.createMany({
            data: payslipData.deductions.map(ded => ({
              ...ded,
              payslipId: payslip.id
            }))
          });
        }
        
        console.log(`✅ Bulletin créé pour ${employee.firstName} ${employee.lastName} - ${payslipNumber}`);
        bulletinsCreated++;
        
      } catch (error) {
        console.log(`❌ Erreur pour ${employee.firstName} ${employee.lastName}:`, error.message);
      }
    }
    
    console.log(`\n🎉 ${bulletinsCreated} bulletins générés avec succès !`);
    
    // Mettre à jour les totaux du cycle
    const totalStats = await prisma.payslip.aggregate({
      where: { payRunId: payRun.id },
      _sum: {
        grossAmount: true,
        netAmount: true
      }
    });
    
    await prisma.payRun.update({
      where: { id: payRun.id },
      data: {
        totalGross: Number(totalStats._sum.grossAmount) || 0,
        totalNet: Number(totalStats._sum.netAmount) || 0
      }
    });
    
    console.log('✅ Totaux du cycle mis à jour');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPayslipGeneration();