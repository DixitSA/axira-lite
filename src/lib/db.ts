import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Enable WAL mode for SQLite to prevent SQLITE_BUSY errors
void db.$executeRawUnsafe("PRAGMA journal_mode=WAL;").catch(() => {
  // WAL mode pragma may fail silently on some environments — not critical
});

export { db };
