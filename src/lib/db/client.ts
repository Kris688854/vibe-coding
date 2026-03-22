import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const databasePath = process.env.DATABASE_URL ?? "file:./drizzle/local.db";

declare global {
  // eslint-disable-next-line no-var
  var __fitnessDb__: ReturnType<typeof createClient> | undefined;
}

const client =
  global.__fitnessDb__ ??
  createClient({
    url: databasePath,
  });

if (process.env.NODE_ENV !== "production") {
  global.__fitnessDb__ = client;
}

export const db = drizzle(client, { schema });
