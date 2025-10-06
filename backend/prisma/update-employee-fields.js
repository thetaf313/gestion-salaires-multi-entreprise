import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateEmployeeFields() {
  try {
    console.log("🔍 Vérification des employés avec email ou phone NULL...");

    // Récupérer tous les employés avec email ou phone NULL
    const employeesWithNullFields = await prisma.employee.findMany({
      where: {
        OR: [{ email: null }, { phone: null }],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        employeeCode: true,
      },
    });

    console.log(
      `📊 Trouvé ${employeesWithNullFields.length} employés avec des champs NULL`
    );

    if (employeesWithNullFields.length === 0) {
      console.log("✅ Aucun employé à mettre à jour");
      return;
    }

    // Mettre à jour chaque employé
    for (const employee of employeesWithNullFields) {
      const updates = {};

      if (!employee.email) {
        // Générer un email basé sur le prénom, nom et code employé
        const emailBase = `${employee.firstName.toLowerCase()}.${employee.lastName.toLowerCase()}`;
        updates.email = `${emailBase}@company.com`;
      }

      if (!employee.phone) {
        // Générer un numéro de téléphone générique
        const phoneNumber = `+221 78 ${
          Math.floor(Math.random() * 1000000) + 9000000
        }`;
        updates.phone = phoneNumber;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.employee.update({
          where: { id: employee.id },
          data: updates,
        });

        console.log(
          `✅ Mis à jour ${employee.firstName} ${employee.lastName} (${employee.employeeCode}):`,
          updates
        );
      }
    }

    console.log("🎉 Mise à jour terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour :", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEmployeeFields();
