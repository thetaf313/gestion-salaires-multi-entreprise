import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seeding...");

  try {
    // Supprimer les données existantes dans l'ordre correct
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
    console.log(`✅ Super Admin créé: ${superAdmin.email}`);

    // Créer des utilisateurs ADMIN pour chaque entreprise
    const adminUsers = await Promise.all([
      prisma.user.create({
        data: {
          firstName: "Admin",
          lastName: "TechSolutions",
          email: "admin@techsolutions.com",
          password: await bcrypt.hash("admin123", 10),
          role: "ADMIN",
          isActive: true,
          companyId: companies[0].id,
        },
      }),
      prisma.user.create({
        data: {
          firstName: "Admin",
          lastName: "DigitalMarketing",
          email: "admin@digitalmarketing.sn",
          password: await bcrypt.hash("admin123", 10),
          role: "ADMIN",
          isActive: true,
          companyId: companies[1].id,
        },
      }),
    ]);

    // Créer des utilisateurs CASHIER pour chaque entreprise
    const cashierUsers = await Promise.all([
      prisma.user.create({
        data: {
          firstName: "Cashier",
          lastName: "TechSolutions",
          email: "cashier@techsolutions.com",
          password: await bcrypt.hash("cashier123", 10),
          role: "CASHIER",
          isActive: true,
          companyId: companies[0].id,
        },
      }),
      prisma.user.create({
        data: {
          firstName: "Cashier",
          lastName: "DigitalMarketing",
          email: "cashier@digitalmarketing.sn",
          password: await bcrypt.hash("cashier123", 10),
          role: "CASHIER",
          isActive: true,
          companyId: companies[1].id,
        },
      }),
    ]);

    console.log(`✅ ${adminUsers.length} utilisateurs ADMIN créés`);
    console.log(`✅ ${cashierUsers.length} utilisateurs CASHIER créés`);

    // Créer des employés de test pour chaque entreprise
    console.log("👥 Création des employés de test...");
    const employees = [];

    // Employés pour Tech Solutions SARL
    const techSolutionsEmployees = await Promise.all([
      prisma.employee.create({
        data: {
          employeeCode: "EMP001",
          firstName: "Mamadou",
          lastName: "Diallo",
          email: "mamadou.diallo@techsolutions.sn",
          phone: "+221 77 123 45 67",
          position: "Développeur Senior",
          contractType: "FIXED",
          fixedSalary: 450000,
          hireDate: new Date("2024-01-15"),
          companyId: companies[0].id,
          isActive: true,
        },
      }),
      prisma.employee.create({
        data: {
          employeeCode: "EMP002",
          firstName: "Fatou",
          lastName: "Seck",
          email: "fatou.seck@techsolutions.sn",
          phone: "+221 70 987 65 43",
          position: "Designer UI/UX",
          contractType: "FIXED",
          fixedSalary: 350000,
          hireDate: new Date("2024-03-10"),
          companyId: companies[0].id,
          isActive: true,
        },
      }),
      prisma.employee.create({
        data: {
          employeeCode: "EMP003",
          firstName: "Ousmane",
          lastName: "Ba",
          email: "ousmane.ba@techsolutions.sn",
          phone: "+221 76 456 78 90",
          position: "Consultant IT",
          contractType: "DAILY",
          dailyRate: 15000,
          hireDate: new Date("2024-06-01"),
          companyId: companies[0].id,
          isActive: true,
        },
      }),
    ]);

    // Employés pour Digital Marketing Pro
    const digitalMarketingEmployees = await Promise.all([
      prisma.employee.create({
        data: {
          employeeCode: "DMP001",
          firstName: "Aminata",
          lastName: "Ndiaye",
          email: "aminata.ndiaye@digitalmarketing.sn",
          phone: "+221 78 234 56 78",
          position: "Chef de Projet Marketing",
          contractType: "FIXED",
          fixedSalary: 400000,
          hireDate: new Date("2023-11-20"),
          companyId: companies[1].id,
          isActive: true,
        },
      }),
      prisma.employee.create({
        data: {
          employeeCode: "DMP002",
          firstName: "Ibrahima",
          lastName: "Fall",
          email: "ibrahima.fall@digitalmarketing.sn",
          phone: "+221 77 345 67 89",
          position: "Spécialiste SEO",
          contractType: "FIXED",
          fixedSalary: 320000,
          hireDate: new Date("2024-02-14"),
          companyId: companies[1].id,
          isActive: true,
        },
      }),
      prisma.employee.create({
        data: {
          employeeCode: "DMP003",
          firstName: "Mariama",
          lastName: "Touré",
          email: "mariama.toure@digitalmarketing.sn",
          phone: "+221 70 567 89 01",
          position: "Community Manager",
          contractType: "HONORARIUM",
          fixedSalary: 150000,
          hireDate: new Date("2024-04-05"),
          companyId: companies[1].id,
          isActive: true,
        },
      }),
    ]);

    employees.push(...techSolutionsEmployees, ...digitalMarketingEmployees);
    console.log(`✅ ${employees.length} employés créés`);

    console.log("🎉 Seeding terminé avec succès!");
    console.log("\n📋 Données créées:");
    console.log(
      "┌─────────────────────────────────────────────────────────────────────┐"
    );
    console.log(
      "│                           ENTREPRISES                              │"
    );
    console.log(
      "├─────────────────────────────────────────────────────────────────────│"
    );
    console.log(
      "│ Tech Solutions SARL                                                │"
    );
    console.log(
      "│ Digital Marketing Pro                                              │"
    );
    console.log(
      "└─────────────────────────────────────────────────────────────────────┘"
    );
    console.log(
      "\n┌─────────────────────────────────────────────────────────────────────┐"
    );
    console.log(
      "│                           UTILISATEURS                             │"
    );
    console.log(
      "├─────────────────────────────────────────────────────────────────────│"
    );
    console.log(
      "│ Email                              │ Rôle         │ Mot de passe    │"
    );
    console.log(
      "├─────────────────────────────────────────────────────────────────────│"
    );
    console.log(
      "│ superadmin@gestion-salaires.com    │ SUPER_ADMIN  │ superadmin123  │"
    );
    console.log(
      "│ admin@techsolutions.com            │ ADMIN        │ admin123       │"
    );
    console.log(
      "│ admin@digitalmarketing.sn          │ ADMIN        │ admin123       │"
    );
    console.log(
      "│ cashier@techsolutions.com          │ CASHIER      │ cashier123     │"
    );
    console.log(
      "│ cashier@digitalmarketing.sn        │ CASHIER      │ cashier123     │"
    );
    console.log(
      "└─────────────────────────────────────────────────────────────────────┘"
    );
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("💥 Erreur fatale:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Connexion Prisma fermée");
  });
