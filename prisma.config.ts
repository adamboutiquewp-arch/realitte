// @ts-nocheck
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    // Fallback pour que prisma generate fonctionne sans DATABASE_URL (ex: au build Docker)
    url: process.env.DATABASE_URL ?? "postgresql://placeholder@localhost/placeholder",
  },
});
