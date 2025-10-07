import { PrismaClient } from "@prisma/client";

// Configuration globale de Prisma avec une seule instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ["query", "error", "warn"],
  transactionOptions: {
    maxWait: 5000, // Temps maximum d'attente pour une transaction
    timeout: 10000, // Timeout de la transaction
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;