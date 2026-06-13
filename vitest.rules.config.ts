import { defineConfig } from "vitest/config";

// Dedicated config for the Firestore security-rules tests. These run against
// the Firestore emulator (via `npm run test:rules`), NOT in the normal unit
// test run — that's why the main vite.config excludes `tests-rules/`.
export default defineConfig({
  test: {
    include: ["tests-rules/**/*.test.ts"],
    environment: "node",
    globals: true,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
