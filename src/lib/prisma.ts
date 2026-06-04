// src/lib/prisma.ts
import { PrismaClient } from "../generated/prisma"; 

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reuse the global instance if it exists, or create a clean new one
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;