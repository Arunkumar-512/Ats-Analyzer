import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Using the built-in env() helper is the recommended practice in Prisma 7
    // It automatically handles the resolution of the environment variable
    url: env("DATABASE_URL") || "postgresql://mock_user:mock_pass@localhost:5432/mock_db",
  },
});