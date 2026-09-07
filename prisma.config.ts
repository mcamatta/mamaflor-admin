import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // O CLI usa uma conexão de sessão/direta. A aplicação usa DATABASE_URL.
    url: env("DIRECT_URL"),
  },
});
