// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

// Force load dotenv from the root explicit workspace directory just in case paths shifted
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 🌟 THE FIX: Fallback string protects the configuration validation runner from throwing an error if env is briefly undefined during build loops
    url: process.env.DATABASE_URL || "postgresql://mock_user:mock_pass@localhost:5432/mock_db",
  },
});