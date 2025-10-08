import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";

const prisma = new PrismaClient();

// Fonction pour générer un QR code basé sur le matricule
async function generateQRCode(employeeCode) {
  try {
    // Le QR code contient le matricule de l'employé
    const qrCodeData = await QRCode.toDataURL(employeeCode, {
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrCodeData;
  } catch (error) {
    console.error("Erreur lors de la génération du QR code:", error);
    return null;
  }
}

async function main() {
  console.log("🌱 Démarrage du seeding avec utilisateurs employés...");

  try {
    // Supprimer les données existantes dans l'ordre correct
    await prisma.attendance.deleteMany({});
    await prisma.payslip.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.payRun.deleteMany({});
    await prisma.workSchedule.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.company.deleteMany({});
    console.log("🗑️  Données existantes supprimées");

    // Créer des entreprises de test
    console.log("🏢 Création des entreprises...");
    const companies = await Promise.all([
      prisma.company.create({
        data: {
          name: "Tech Solutions SARL",
          email: "contact@techsolutions.com",
          phone: "+221 33 812 00 01",
          address: "Dakar, Almadies",
          isActive: true,
        },
      }),
      prisma.company.create({
        data: {
          name: "Digital Marketing Pro",
          email: "info@digitalmarketing.sn",
          phone: "+221 33 812 00 00",
          address: "Dakar, Plateau",
          isActive: true,
        },
      }),
    ]);

    console.log(`✅ ${companies.length} entreprises créées`);

    // Créer le Super Admin (sans entreprise)
    const superAdmin = await prisma.user.create({
      data: {
        firstName: "Super",
        lastName: "Administrator",
        email: "superadmin@synergypay.com",
        password: await bcrypt.hash("superadmin123", 10),
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
    console.log(`✅ Super Admin créé: ${superAdmin.email}`);

    // ===== NOUVEAUTÉ: Créer des employés avec QR codes puis leurs comptes utilisateurs =====

    // Employés pour Tech Solutions
    console.log("👥 Création des employés Tech Solutions avec QR codes...");

    // 1. Admin employé
    const adminEmployeeTech = await prisma.employee.create({
      data: {
        employeeCode: "TECH001",
        firstName: "Admin",
        lastName: "TechSolutions",
        email: "admin@techsolutions.com",
        phone: "+221 77 123 45 67",
        address: "Dakar, Almadies",
        contractType: "FIXED",
        position: "Directeur Général",
        fixedSalary: 500000,
        hireDate: new Date("2023-01-15"),
        qrCode: await generateQRCode("TECH001"),
        companyId: companies[0].id,
      },
    });

    // Créer le compte utilisateur pour l'admin
    const adminUserTech = await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "TechSolutions",
        email: "admin@techsolutions.com",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        isActive: true,
        companyId: companies[0].id,
        employeeId: adminEmployeeTech.id,
      },
    });

    // 2. Caissier employé
    const cashierEmployeeTech = await prisma.employee.create({
      data: {
        employeeCode: "TECH002",
        firstName: "Cashier",
        lastName: "TechSolutions",
        email: "cashier@techsolutions.com",
        phone: "+221 77 234 56 78",
        address: "Dakar, Plateau",
        contractType: "FIXED",
        position: "Caissier",
        fixedSalary: 250000,
        hireDate: new Date("2023-03-01"),
        qrCode: await generateQRCode("TECH002"),
        companyId: companies[0].id,
      },
    });

    // Créer le compte utilisateur pour le caissier
    const cashierUserTech = await prisma.user.create({
      data: {
        firstName: "Cashier",
        lastName: "TechSolutions",
        email: "cashier@techsolutions.com",
        password: await bcrypt.hash("cashier123", 10),
        role: "CASHIER",
        isActive: true,
        companyId: companies[0].id,
        employeeId: cashierEmployeeTech.id,
      },
    });

    // 3. Employés simples (sans compte utilisateur pour le moment)
    const simpleEmployeesTech = await Promise.all([
      prisma.employee.create({
        data: {
          employeeCode: "TECH003",
          firstName: "Mamadou",
          lastName: "Diallo",
          email: "mamadou.diallo@techsolutions.sn",
          phone: "+221 77 345 67 89",
          address: "Guédiawaye",
          contractType: "DAILY",
          position: "Développeur Junior",
          dailyRate: 15000,
          hireDate: new Date("2023-06-01"),
          qrCode: await generateQRCode("TECH003"),
          companyId: companies[0].id,
        },
      }),
      prisma.employee.create({
        data: {
          employeeCode: "TECH004",
          firstName: "Fatou",
          lastName: "Seck",
          email: "fatou.seck@techsolutions.sn",
          phone: "+221 77 456 78 90",
          address: "Pikine",
          contractType: "FIXED",
          position: "Designer UX/UI",
          fixedSalary: 300000,
          hireDate: new Date("2023-05-15"),
          qrCode: await generateQRCode("TECH004"),
          companyId: companies[0].id,
        },
      }),
      prisma.employee.create({
        data: {
          employeeCode: "TECH005",
          firstName: "Ousmane",
          lastName: "Ba",
          email: "ousmane.ba@techsolutions.sn",
          phone: "+221 77 567 89 01",
          address: "Rufisque",
          contractType: "HONORARIUM",
          position: "Consultant IT",
          hourlyRate: 8000,
          hireDate: new Date("2023-04-10"),
          qrCode: await generateQRCode("TECH005"),
          companyId: companies[0].id,
        },
      }),
    ]);

    // Employés pour Digital Marketing
    console.log("👥 Création des employés Digital Marketing avec QR codes...");

    // 1. Admin employé
    const adminEmployeeMarketing = await prisma.employee.create({
      data: {
        employeeCode: "DM001",
        firstName: "Admin",
        lastName: "DigitalMarketing",
        email: "admin@digitalmarketing.sn",
        phone: "+221 77 678 90 12",
        address: "Dakar, Plateau",
        contractType: "FIXED",
        position: "Directeur Marketing",
        fixedSalary: 450000,
        hireDate: new Date("2023-02-01"),
        qrCode: await generateQRCode("DM001"),
        companyId: companies[1].id,
      },
    });

    // Créer le compte utilisateur pour l'admin
    const adminUserMarketing = await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "DigitalMarketing",
        email: "admin@digitalmarketing.sn",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        isActive: true,
        companyId: companies[1].id,
        employeeId: adminEmployeeMarketing.id,
      },
    });

    // 2. Caissier employé
    const cashierEmployeeMarketing = await prisma.employee.create({
      data: {
        employeeCode: "DM002",
        firstName: "Cashier",
        lastName: "DigitalMarketing",
        email: "cashier@digitalmarketing.sn",
        phone: "+221 77 789 01 23",
        address: "Dakar, Medina",
        contractType: "FIXED",
        position: "Caissier",
        fixedSalary: 200000,
        hireDate: new Date("2023-03-15"),
        qrCode: await generateQRCode("DM002"),
        companyId: companies[1].id,
      },
    });

    // Créer le compte utilisateur pour le caissier
    const cashierUserMarketing = await prisma.user.create({
      data: {
        firstName: "Cashier",
        lastName: "DigitalMarketing",
        email: "cashier@digitalmarketing.sn",
        password: await bcrypt.hash("cashier123", 10),
        role: "CASHIER",
        isActive: true,
        companyId: companies[1].id,
        employeeId: cashierEmployeeMarketing.id,
      },
    });

    // 3. Employés simples (sans compte utilisateur pour le moment)
    const simpleEmployeesMarketing = await Promise.all([
      prisma.employee.create({
        data: {
          employeeCode: "DM003",
          firstName: "Aminata",
          lastName: "Ndiaye",
          email: "aminata.ndiaye@digitalmarketing.sn",
          phone: "+221 77 890 12 34",
          address: "Dakar, Parcelles Assainies",
          contractType: "FIXED",
          position: "Community Manager",
          fixedSalary: 280000,
          hireDate: new Date("2023-07-01"),
          qrCode: await generateQRCode("DM003"),
          companyId: companies[1].id,
        },
      }),
      prisma.employee.create({
        data: {
          employeeCode: "DM004",
          firstName: "Ibrahima",
          lastName: "Fall",
          email: "ibrahima.fall@digitalmarketing.sn",
          phone: "+221 77 901 23 45",
          address: "Thiaroye",
          contractType: "DAILY",
          position: "Graphiste",
          dailyRate: 12000,
          hireDate: new Date("2023-08-15"),
          qrCode: await generateQRCode("DM004"),
          companyId: companies[1].id,
        },
      }),
      prisma.employee.create({
        data: {
          employeeCode: "DM005",
          firstName: "Mariama",
          lastName: "Touré",
          email: "mariama.toure@digitalmarketing.sn",
          phone: "+221 77 012 34 56",
          address: "Mbao",
          contractType: "HONORARIUM",
          position: "Consultante Marketing",
          hourlyRate: 10000,
          hireDate: new Date("2023-09-01"),
          qrCode: await generateQRCode("DM005"),
          companyId: companies[1].id,
        },
      }),
    ]);

    console.log(
      `✅ ${
        simpleEmployesTech.length + simpleEmployeesMarketing.length + 4
      } employés créés avec QR codes`
    );
    console.log(
      `✅ 4 comptes utilisateurs créés (Admin + Caissier pour chaque entreprise)`
    );

    // Créer des horaires de travail pour les entreprises
    console.log("🕐 Création des horaires de travail...");

    const workSchedules = [];
    for (const company of companies) {
      // Lundi à Vendredi : 8h00 - 17h00
      for (let day = 1; day <= 5; day++) {
        workSchedules.push(
          prisma.workSchedule.create({
            data: {
              dayOfWeek: day,
              startTime: "08:00",
              endTime: "17:00",
              isWorkingDay: true,
              companyId: company.id,
            },
          })
        );
      }

      // Samedi : 8h00 - 12h00 (demi-journée)
      workSchedules.push(
        prisma.workSchedule.create({
          data: {
            dayOfWeek: 6,
            startTime: "08:00",
            endTime: "12:00",
            isWorkingDay: true,
            companyId: company.id,
          },
        })
      );

      // Dimanche : jour de repos
      workSchedules.push(
        prisma.workSchedule.create({
          data: {
            dayOfWeek: 0,
            startTime: "00:00",
            endTime: "00:00",
            isWorkingDay: false,
            companyId: company.id,
          },
        })
      );
    }

    await Promise.all(workSchedules);
    console.log(
      `✅ Horaires de travail créés pour ${companies.length} entreprises`
    );

    console.log("\n🎉 Seeding terminé avec succès !");
    console.log("\n📋 COMPTES CRÉÉS :");
    console.log("===================");
    console.log("🔧 Super Admin:");
    console.log("   Email: superadmin@synergypay.com");
    console.log("   Mot de passe: superadmin123");
    console.log("\n🏢 Tech Solutions:");
    console.log("   👨‍💼 Admin: admin@techsolutions.com / admin123");
    console.log("   💰 Caissier: cashier@techsolutions.com / cashier123");
    console.log("\n🏢 Digital Marketing:");
    console.log("   👨‍💼 Admin: admin@digitalmarketing.sn / admin123");
    console.log("   💰 Caissier: cashier@digitalmarketing.sn / cashier123");
    console.log(
      "\n📱 Tous les employés ont un QR code généré pour le pointage"
    );
    console.log(
      "🔗 Les admins et caissiers sont liés à leurs profils employés"
    );
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
