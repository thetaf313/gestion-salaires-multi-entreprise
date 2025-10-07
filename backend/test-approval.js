import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Test d'approbation d'un cycle pour désarchiver les bulletins
async function testPayRunApproval() {
  try {
    console.log('🚀 Test d\'approbation d\'un cycle de paie...');
    
    // Trouver le cycle de septembre (status DRAFT)
    const payRun = await prisma.payRun.findFirst({
      where: {
        title: 'Paie Septembre 2025',
        status: 'DRAFT'
      },
      include: {
        _count: {
          select: {
            payslips: true
          }
        }
      }
    });
    
    if (!payRun) {
      console.log('❌ Cycle de septembre non trouvé');
      return;
    }
    
    console.log(`✅ Cycle trouvé: ${payRun.title} (${payRun.id})`);
    console.log(`📋 ${payRun._count.payslips} bulletins dans le cycle`);
    
    // Vérifier les bulletins archivés avant approbation
    const archivedBefore = await prisma.payslip.count({
      where: { 
        payRunId: payRun.id,
        status: 'ARCHIVED'
      }
    });
    
    const pendingBefore = await prisma.payslip.count({
      where: { 
        payRunId: payRun.id,
        status: 'PENDING'
      }
    });
    
    console.log(`📊 Avant approbation: ${archivedBefore} archivés, ${pendingBefore} en attente`);
    
    // Récupérer un admin pour l'approbation
    const admin = await prisma.user.findFirst({
      where: { 
        companyId: payRun.companyId,
        role: 'ADMIN'
      }
    });
    
    if (!admin) {
      console.log('❌ Admin non trouvé');
      return;
    }
    
    console.log(`✅ Admin: ${admin.firstName} ${admin.lastName}`);
    
    // Simuler l'approbation (désarchivage)
    console.log('🔄 Approbation du cycle...');
    
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour le statut du cycle
      const updatedPayRun = await tx.payRun.update({
        where: { id: payRun.id },
        data: {
          status: 'APPROVED',
          approvedById: admin.id,
          approvedAt: new Date(),
        },
      });
      
      // Désarchiver tous les bulletins (ARCHIVED → PENDING)
      const updatedPayslips = await tx.payslip.updateMany({
        where: {
          payRunId: payRun.id,
          status: 'ARCHIVED'
        },
        data: {
          status: 'PENDING'
        }
      });
      
      return {
        payRun: updatedPayRun,
        payslipsCount: updatedPayslips.count
      };
    });
    
    console.log(`✅ Cycle approuvé !`);
    console.log(`🔓 ${result.payslipsCount} bulletins désarchivés`);
    
    // Vérifier les bulletins après approbation
    const archivedAfter = await prisma.payslip.count({
      where: { 
        payRunId: payRun.id,
        status: 'ARCHIVED'
      }
    });
    
    const pendingAfter = await prisma.payslip.count({
      where: { 
        payRunId: payRun.id,
        status: 'PENDING'
      }
    });
    
    console.log(`📊 Après approbation: ${archivedAfter} archivés, ${pendingAfter} en attente`);
    
    // Afficher les bulletins en attente de paiement
    const pendingPayslips = await prisma.payslip.findMany({
      where: { 
        payRunId: payRun.id,
        status: 'PENDING'
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true }
        }
      }
    });
    
    console.log(`\n💰 Bulletins en attente de paiement (${pendingPayslips.length}):`);
    pendingPayslips.forEach(p => {
      console.log(`- ${p.employee.firstName} ${p.employee.lastName}: ${p.netAmount} XOF (PRÊT POUR PAIEMENT)`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPayRunApproval();