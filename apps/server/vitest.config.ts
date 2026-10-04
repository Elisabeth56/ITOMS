import { defineConfig } from "vitest/config"

// set on process.env as well so global setup (which runs outside the test env) sees it
process.env.DATABASE_URL ??= "postgres://postgres:postgres@localhost:5432/itoms_test"

export default defineConfig({
  test: {
    globalSetup: "./tests/global-setup.ts",
    fileParallelism: false, // test files share one database
    env: {
      NODE_ENV: "test",
      DATABASE_URL: process.env.DATABASE_URL,
      SUPABASE_URL: "http://localhost:54321",
      WEB_ORIGIN: "http://localhost:3000",
    },
  },
})
