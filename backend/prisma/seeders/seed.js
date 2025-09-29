import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seeding...");

  try {
    // Supprimer les utilisateurs existants (optionnel, pour éviter les doublons)
    await prisma.user.deleteMany({});
    console.log("🗑️  Utilisateurs existants supprimés");

    // Données des utilisateurs avec mots de passe hachés
    const usersData = [
      {
        firstName: "Super",
        lastName: "Administrator",
        email: "superadmin@gestion-salaires.com",
        password: await bcrypt.hash("superadmin123", 10),
        role: "SUPER_ADMIN",
        isActive: true,
      },
      {
        firstName: "Admin",
        lastName: "Manager",
        email: "admin@gestion-salaires.com",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        isActive: true,
      },
      {
        firstName: "Cashier",
        lastName: "User",
        email: "cashier@gestion-salaires.com",
        password: await bcrypt.hash("cashier123", 10),
        role: "CASHIER",
        isActive: true,
      },
    ];

    // Créer les utilisateurs
    console.log("👤 Création des utilisateurs...");

    for (const userData of usersData) {
      const user = await prisma.user.create({
        data: userData,
      });
      console.log(`✅ Utilisateur créé: ${user.email} (${user.role})`);
    }

    console.log("🎉 Seeding terminé avec succès!");
    console.log("\n📋 Utilisateurs créés:");
    console.log("┌─────────────────────────────────────────────────────────┐");
    console.log(
      "│ Email                              │ Rôle         │ MDP    │"
    );
    console.log("├─────────────────────────────────────────────────────────│");
    console.log(
      "│ superadmin@gestion-salaires.com    │ SUPER_ADMIN  │ superadmin123 │"
    );
    console.log(
      "│ admin@gestion-salaires.com         │ ADMIN        │ admin123      │"
    );
    console.log(
      "│ cashier@gestion-salaires.com       │ CASHIER      │ cashier123    │"
    );
    console.log("└─────────────────────────────────────────────────────────┘");
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
