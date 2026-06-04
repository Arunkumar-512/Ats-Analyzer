// src/lib/prisma.ts
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma"; 

// 1. Establish a standard native Node-Postgres connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Wrap that pool securely into a Prisma 7 compatible Driver Adapter
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 3. Instantiate your Prisma client using the native driver adapter
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;