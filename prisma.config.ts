// @ts-nocheck
import { defineConfig } from "prisma/config";
import { readFileSync } from "fs";
import { resolve } from "path";

// Charge .env et .env.local, ne garde que les valeurs non-vides
for (const file of [".env", ".env.local"]) {
  try {
    const content = readFileSync(resolve(process.cwd(), file), "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, "");
        if (val && !process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch {}
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://placeholder@localhost/placeholder",
  },
});
