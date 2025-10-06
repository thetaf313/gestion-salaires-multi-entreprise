import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";

const prisma = new PrismaClient();

async function generateQRCodeDataURL(data) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error("Erreur lors de la génération du QR code:", error);
    return null;
  }
}

async function main() {
  console.log("🌱 Démarrage du seeding avec employés et QR codes...");

  try {
    // Supprimer les données existantes dans l'ordre correct
    await prisma.attendance.deleteMany({});
    await prisma.workSchedule.deleteMany({});
    await prisma.payslip.deleteMany({});
    await prisma.payRun.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.user.deleteMany({});
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
        email: "superadmin@gestion-salaires.com",
        password: await bcrypt.hash("superadmin123", 10),
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });

    console.log("✅ Super Admin créé");

    // Créer des admins pour chaque entreprise
    // Créer d'abord les employés admin et caissier
    console.log("👨‍💼 Création des employés admin et caissier...");

    // Employés Admin
    const adminEmployees = await Promise.all([
      prisma.employee.create({
        data: {
          firstName: "Admin",
          lastName: "TechSolutions",
          email: "admin@techsolutions.com",
          employeeCode: "ADM001",
          position: "Administrateur",
          contractType: "FIXED",
          fixedSalary: 1200000,
          hireDate: new Date("2020-01-01"),
          isActive: true,
          companyId: companies[0].id,
          qrCode: await generateQRCodeDataURL("ADM001"),
        },
      }),
      prisma.employee.create({
        data: {
          firstName: "Admin",
          lastName: "DigitalMarketing",
          email: "admin@digitalmarketing.sn",
          employeeCode: "ADM002",
          position: "Administrateur",
          contractType: "FIXED",
          fixedSalary: 1200000,
          hireDate: new Date("2020-01-01"),
          isActive: true,
          companyId: companies[1].id,
          qrCode: await generateQRCodeDataURL("ADM002"),
        },
      }),
    ]);

    // Employés Caissier
    const cashierEmployees = await Promise.all([
      prisma.employee.create({
        data: {
          firstName: "Caissier",
          lastName: "TechSolutions",
          email: "caissier@techsolutions.com",
          employeeCode: "CASH001",
          position: "Caissier",
          contractType: "FIXED",
          fixedSalary: 600000,
          hireDate: new Date("2021-01-01"),
          isActive: true,
          companyId: companies[0].id,
          qrCode: await generateQRCodeDataURL("CASH001"),
        },
      }),
      prisma.employee.create({
        data: {
          firstName: "Caissier",
          lastName: "DigitalMarketing",
          email: "caissier@digitalmarketing.sn",
          employeeCode: "CASH002",
          position: "Caissier",
          contractType: "FIXED",
          fixedSalary: 600000,
          hireDate: new Date("2021-01-01"),
          isActive: true,
          companyId: companies[1].id,
          qrCode: await generateQRCodeDataURL("CASH002"),
        },
      }),
    ]);

    // Créer les comptes utilisateurs pour les admins
    const adminUsers = await Promise.all([
      prisma.user.create({
        data: {
          firstName: adminEmployees[0].firstName,
          lastName: adminEmployees[0].lastName,
          email: adminEmployees[0].email,
          password: await bcrypt.hash("admin123", 10),
          role: "ADMIN",
          isActive: true,
          companyId: companies[0].id,
          employeeId: adminEmployees[0].id,
        },
      }),
      prisma.user.create({
        data: {
          firstName: adminEmployees[1].firstName,
          lastName: adminEmployees[1].lastName,
          email: adminEmployees[1].email,
          password: await bcrypt.hash("admin123", 10),
          role: "ADMIN",
          isActive: true,
          companyId: companies[1].id,
          employeeId: adminEmployees[1].id,
        },
      }),
    ]);

    // Créer les comptes utilisateurs pour les caissiers
    const cashierUsers = await Promise.all([
      prisma.user.create({
        data: {
          firstName: cashierEmployees[0].firstName,
          lastName: cashierEmployees[0].lastName,
          email: cashierEmployees[0].email,
          password: await bcrypt.hash("caissier123", 10),
          role: "CASHIER",
          isActive: true,
          companyId: companies[0].id,
          employeeId: cashierEmployees[0].id,
        },
      }),
      prisma.user.create({
        data: {
          firstName: cashierEmployees[1].firstName,
          lastName: cashierEmployees[1].lastName,
          email: cashierEmployees[1].email,
          password: await bcrypt.hash("caissier123", 10),
          role: "CASHIER",
          isActive: true,
          companyId: companies[1].id,
          employeeId: cashierEmployees[1].id,
        },
      }),
    ]);

    console.log(
      `✅ ${adminEmployees.length} employés admin créés avec QR codes et comptes utilisateurs`
    );
    console.log(
      `✅ ${cashierEmployees.length} employés caissier créés avec QR codes et comptes utilisateurs`
    );

    // Créer des employés avec QR codes pour Tech Solutions
    console.log("👥 Création des employés pour Tech Solutions...");
    const techEmployees = [];

    const techEmployeeData = [
      {
        firstName: "Mamadou",
        lastName: "Kane",
        email: "mamadou.kane@techsolutions.sn",
        employeeCode: "TS001",
        position: "Développeur Senior",
        contractType: "FIXED",
        fixedSalary: 850000,
        hireDate: new Date("2023-01-15"),
      },
      {
        firstName: "Fatou",
        lastName: "Seck",
        email: "fatou.seck@techsolutions.sn",
        employeeCode: "TS002",
        position: "Chef de Projet",
        contractType: "FIXED",
        fixedSalary: 950000,
        hireDate: new Date("2022-06-10"),
      },
      {
        firstName: "Ousmane",
        lastName: "Sow",
        email: "ousmane.sow@techsolutions.sn",
        employeeCode: "TS003",
        position: "Développeur Frontend",
        contractType: "FIXED",
        fixedSalary: 650000,
        hireDate: new Date("2023-03-20"),
      },
    ];

    for (const empData of techEmployeeData) {
      // Générer le QR code basé sur le matricule
      const qrCodeData = await generateQRCodeDataURL(empData.employeeCode);

      const employee = await prisma.employee.create({
        data: {
          firstName: empData.firstName,
          lastName: empData.lastName,
          email: empData.email,
          employeeCode: empData.employeeCode,
          position: empData.position,
          contractType: empData.contractType,
          fixedSalary: empData.fixedSalary,
          hireDate: empData.hireDate,
          isActive: true,
          companyId: companies[0].id,
          qrCode: qrCodeData,
        },
      });

      // Créer un compte utilisateur pour cet employé
      const userAccount = await prisma.user.create({
        data: {
          firstName: empData.firstName,
          lastName: empData.lastName,
          email: empData.email,
          password: await bcrypt.hash("employe123", 10), // Mot de passe par défaut
          role: "USER",
          isActive: true,
          companyId: companies[0].id,
          employeeId: employee.id,
        },
      });

      techEmployees.push({ employee, user: userAccount });
      console.log(
        `✅ Employé ${empData.firstName} ${empData.lastName} créé avec QR code et compte utilisateur`
      );
    }

    // Créer des employés avec QR codes pour Digital Marketing
    console.log("👥 Création des employés pour Digital Marketing...");
    const digitalEmployees = [];

    const digitalEmployeeData = [
      {
        firstName: "Aminata",
        lastName: "Ndiaye",
        email: "aminata.ndiaye@digitalmarketing.sn",
        employeeCode: "DM001",
        position: "Responsable Marketing",
        contractType: "FIXED",
        fixedSalary: 750000,
        hireDate: new Date("2022-09-01"),
      },
      {
        firstName: "Ibrahima",
        lastName: "Fall",
        email: "ibrahima.fall@digitalmarketing.sn",
        employeeCode: "DM002",
        position: "Graphiste",
        contractType: "HONORARIUM",
        hourlyRate: 5000,
        hireDate: new Date("2023-02-15"),
      },
      {
        firstName: "Mariama",
        lastName: "Touré",
        email: "mariama.toure@digitalmarketing.sn",
        employeeCode: "DM003",
        position: "Community Manager",
        contractType: "FIXED",
        fixedSalary: 450000,
        hireDate: new Date("2023-04-10"),
      },
    ];

    for (const empData of digitalEmployeeData) {
      // Générer le QR code basé sur le matricule
      const qrCodeData = await generateQRCodeDataURL(empData.employeeCode);

      const employee = await prisma.employee.create({
        data: {
          firstName: empData.firstName,
          lastName: empData.lastName,
          email: empData.email,
          employeeCode: empData.employeeCode,
          position: empData.position,
          contractType: empData.contractType,
          fixedSalary: empData.fixedSalary,
          hourlyRate: empData.hourlyRate,
          hireDate: empData.hireDate,
          isActive: true,
          companyId: companies[1].id,
          qrCode: qrCodeData,
        },
      });

      // Créer un compte utilisateur pour cet employé
      const userAccount = await prisma.user.create({
        data: {
          firstName: empData.firstName,
          lastName: empData.lastName,
          email: empData.email,
          password: await bcrypt.hash("employe123", 10), // Mot de passe par défaut
          role: "USER",
          isActive: true,
          companyId: companies[1].id,
          employeeId: employee.id,
        },
      });

      digitalEmployees.push({ employee, user: userAccount });
      console.log(
        `✅ Employé ${empData.firstName} ${empData.lastName} créé avec QR code et compte utilisateur`
      );
    }

    // Créer des employés supplémentaires avec comptes utilisateurs
    console.log("👤 Création d'employés supplémentaires...");

    const additionalEmployeeData = [
      {
        firstName: "Moussa",
        lastName: "Sarr",
        email: "moussa.sarr@techsolutions.sn",
        employeeCode: "TS004",
        position: "Technicien",
        contractType: "HONORARIUM",
        hourlyRate: 3000,
        hireDate: new Date("2023-06-01"),
        companyId: companies[0].id,
      },
      {
        firstName: "Aïda",
        lastName: "Gueye",
        email: "aida.gueye@digitalmarketing.sn",
        employeeCode: "DM004",
        position: "Assistante Marketing",
        contractType: "FIXED",
        fixedSalary: 350000,
        hireDate: new Date("2024-02-01"),
        companyId: companies[1].id,
      },
    ];

    const additionalEmployees = [];
    for (const empData of additionalEmployeeData) {
      // Générer le QR code basé sur le matricule
      const qrCodeData = await generateQRCodeDataURL(empData.employeeCode);

      const employee = await prisma.employee.create({
        data: {
          firstName: empData.firstName,
          lastName: empData.lastName,
          email: empData.email,
          employeeCode: empData.employeeCode,
          position: empData.position,
          contractType: empData.contractType,
          fixedSalary: empData.fixedSalary,
          hourlyRate: empData.hourlyRate,
          hireDate: empData.hireDate,
          isActive: true,
          companyId: empData.companyId,
          qrCode: qrCodeData,
        },
      });

      // Créer le compte utilisateur associé
      const userAccount = await prisma.user.create({
        data: {
          firstName: empData.firstName,
          lastName: empData.lastName,
          email: empData.email,
          password: await bcrypt.hash("employe123", 10),
          role: "USER",
          isActive: true,
          companyId: empData.companyId,
          employeeId: employee.id,
        },
      });

      additionalEmployees.push({ employee, user: userAccount });
      console.log(
        `✅ Employé ${empData.firstName} ${empData.lastName} créé avec QR code et compte utilisateur`
      );
    }

    console.log(
      `✅ ${additionalEmployees.length} employés supplémentaires créés avec comptes utilisateurs`
    );

    console.log("🎉 Seeding terminé avec succès !");
    console.log("\n📊 Résumé :");
    console.log(`- ${companies.length} entreprises`);
    console.log(`- 1 super admin (sans profil employé)`);
    console.log(
      `- ${adminEmployees.length} employés admin avec comptes utilisateur`
    );
    console.log(
      `- ${cashierEmployees.length} employés caissier avec comptes utilisateur`
    );
    console.log(
      `- ${
        techEmployees.length +
        digitalEmployees.length +
        additionalEmployees.length
      } employés standards avec comptes utilisateur`
    );
    console.log(
      `- Total employés: ${
        adminEmployees.length +
        cashierEmployees.length +
        techEmployees.length +
        digitalEmployees.length +
        additionalEmployees.length
      } (tous avec QR codes)`
    );

    console.log("\n🔑 Comptes de test :");
    console.log("Super Admin: superadmin@gestion-salaires.com / superadmin123");
    console.log("Admin Tech: admin@techsolutions.com / admin123");
    console.log("Admin Digital: admin@digitalmarketing.sn / admin123");
    console.log("Caissier Tech: caissier@techsolutions.com / caissier123");
    console.log("Caissier Digital: caissier@digitalmarketing.sn / caissier123");
    console.log("Employés: [email] / employe123");
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
