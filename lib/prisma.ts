import { PrismaClient } from "@src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;
const configuredPoolSize = Number(process.env.DATABASE_POOL_SIZE ?? "1");

if (!connectionString) {
  throw new Error("DATABASE_URL não foi configurada.");
}

const adapter = new PrismaPg({
  connectionString,
  max:
    Number.isInteger(configuredPoolSize) && configuredPoolSize > 0
      ? configuredPoolSize
      : 1,
});
const prisma = global.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
