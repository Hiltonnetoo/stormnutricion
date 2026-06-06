import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests-e2e",
  fullyParallel: false, // Run sequentially for predictable DB state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Use single worker for DB state consistency
  reporter: "list",
  use: {
    baseURL: "http://localhost:5005",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx vite --port 5005",
    url: "http://localhost:5005",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
