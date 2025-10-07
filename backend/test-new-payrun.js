import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Test de création d'un cycle avec génération automatique des bulletins
async function testNewPayRunCreation() {
  try {
    console.log('🚀 Test de création d\'un nouveau cycle de paie...');
    
    // Récupérer une entreprise
    const company = await prisma.company.findFirst({
      where: { name: 'Tech Solutions SARL' }
    });
    
    if (!company) {
      console.log('❌ Entreprise non trouvée');
      return;
    }
    
    // Récupérer un utilisateur admin
    const admin = await prisma.user.findFirst({
      where: { 
        companyId: company.id,
        role: 'ADMIN'
      }
    });
    
    if (!admin) {
      console.log('❌ Admin non trouvé');
      return;
    }
    
    console.log(`✅ Entreprise: ${company.name}`);
    console.log(`✅ Admin: ${admin.firstName} ${admin.lastName}`);
    
    // Créer un nouveau cycle de paie (septembre 2025)
    const payRunData = {
      title: 'Paie Septembre 2025',
      description: 'Cycle de paie pour le mois de septembre 2025',
      periodStart: new Date('2025-09-01'),
      periodEnd: new Date('2025-09-30'),
      companyId: company.id,
      createdById: admin.id
    };
    
    // Simuler l'appel au service PayRun
    console.log('📝 Création du cycle avec génération automatique des bulletins...');
    
    // Utiliser le même code que le service (simplifié pour le test)
    const result = await prisma.$transaction(async (tx) => {
      // Créer le cycle de paie
      const payRun = await tx.payRun.create({
        data: payRunData,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      
      console.log(`✅ Cycle créé: ${payRun.id}`);
      
      // Récupérer tous les employés actifs
      const employees = await tx.employee.findMany({
        where: {
          companyId: company.id,
          isActive: true,
        },
      });
      
      console.log(`👥 ${employees.length} employés actifs trouvés`);
      
      // Fonction de calcul simplifiée
      function calculatePayslip(employee, payRun) {
        let grossAmount = 0;
        let daysWorked = null;
        let hoursWorked = null;
        
        if (employee.contractType === 'DAILY' && employee.dailyRate) {
          const periodDays = 22; // Jours ouvrés en septembre
          daysWorked = periodDays;
          grossAmount = Number(employee.dailyRate) * periodDays;
        } else if (employee.contractType === 'FIXED' && employee.fixedSalary) {
          grossAmount = Number(employee.fixedSalary);
        } else if (employee.contractType === 'HONORARIUM' && employee.hourlyRate) {
          hoursWorked = 160;
          grossAmount = Number(employee.hourlyRate) * hoursWorked;
        }
        
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
        
        return {
          grossAmount,
          totalDeductions,
          netAmount,
          daysWorked,
          hoursWorked,
          deductions
        };
      }
      
      // Générer les bulletins archivés
      let totalGross = 0;
      let totalNet = 0;
      let bulletinsCreated = 0;
      
      for (const employee of employees) {
        const payslipData = calculatePayslip(employee, payRun);
        
        const timestamp = Date.now().toString().slice(-6);
        const payslipNumber = `PAY-${employee.employeeCode}-${timestamp}`;
        
        const payslip = await tx.payslip.create({
          data: {
            payslipNumber,
            employeeId: employee.id,
            payRunId: payRun.id,
            grossAmount: payslipData.grossAmount,
            totalDeductions: payslipData.totalDeductions,
            netAmount: payslipData.netAmount,
            daysWorked: payslipData.daysWorked,
            hoursWorked: payslipData.hoursWorked,
            status: 'ARCHIVED', // Statut archivé
          },
        });
        
        // Créer les déductions
        if (payslipData.deductions.length > 0) {
          await tx.payslipDeduction.createMany({
            data: payslipData.deductions.map(ded => ({
              ...ded,
              payslipId: payslip.id
            }))
          });
        }
        
        totalGross += Number(payslipData.grossAmount);
        totalNet += Number(payslipData.netAmount);
        bulletinsCreated++;
        
        console.log(`✅ Bulletin ARCHIVÉ créé pour ${employee.firstName} ${employee.lastName}`);
      }
      
      // Mettre à jour les totaux
      await tx.payRun.update({
        where: { id: payRun.id },
        data: {
          totalGross,
          totalNet,
        },
      });
      
      return {
        payRun,
        bulletinsCreated,
        totalGross,
        totalNet
      };
    });
    
    console.log(`🎉 Cycle créé avec succès !`);
    console.log(`📊 ${result.bulletinsCreated} bulletins ARCHIVÉS générés`);
    console.log(`💰 Total brut: ${result.totalGross} XOF`);
    console.log(`💵 Total net: ${result.totalNet} XOF`);
    
    // Vérifier les bulletins archivés
    const archivedPayslips = await prisma.payslip.findMany({
      where: { 
        payRunId: result.payRun.id,
        status: 'ARCHIVED'
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true }
        }
      }
    });
    
    console.log(`\n📋 Bulletins archivés (${archivedPayslips.length}):`);
    archivedPayslips.forEach(p => {
      console.log(`- ${p.employee.firstName} ${p.employee.lastName}: ${p.grossAmount} XOF (ARCHIVÉ)`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewPayRunCreation();