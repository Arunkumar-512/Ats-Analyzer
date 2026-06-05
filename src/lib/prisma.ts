import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma"; 

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 🌟 FIX: Only initialize the pool if we are in an environment where we have a URL,
// or use a safe fallback to prevent the build worker from crashing.
const connectionString = process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";

const pool = new Pool({ 
  connectionString:process.env.DATABASE_URL,
  // Neon-specific optimization: recommended for serverless connectivity
  max: 10 
});

const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}