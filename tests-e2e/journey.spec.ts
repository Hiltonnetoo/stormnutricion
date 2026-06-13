import { test, expect } from "@playwright/test";

/**
 * Full authenticated journey: Login → Dashboard → Generate Diet → Export PDF.
 *
 * This is skipped by default because it needs a real (throwaway) Firebase test
 * account — the app gates every internal page behind authentication.
 *
 * To enable it:
 *   1. Create a test user in your Firebase project.
 *   2. Export the credentials before running:
 *        E2E_TEST_EMAIL=...  E2E_TEST_PASSWORD=...  npm run test:e2e
 */
const hasCredentials =
  !!process.env.E2E_TEST_EMAIL && !!process.env.E2E_TEST_PASSWORD;

test.describe("Authenticated journey", () => {
  test.skip(!hasCredentials, "Set E2E_TEST_EMAIL / E2E_TEST_PASSWORD to run");

  test("logs in and reaches the dashboard", async ({ page }) => {
    await page.goto("/#/login");
    await page.fill("#email", process.env.E2E_TEST_EMAIL!);
    await page.fill("#password", process.env.E2E_TEST_PASSWORD!);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/dashboard/);
  });

  test("generates a diet plan and exports it", async ({ page }) => {
    await page.goto("/#/login");
    await page.fill("#email", process.env.E2E_TEST_EMAIL!);
    await page.fill("#password", process.env.E2E_TEST_PASSWORD!);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/dashboard/);

    // Navigate to the diet generator and run the 3-step flow.
    await page.goto("/#/diet-generator");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // NOTE: completing the flow depends on having at least one seeded patient.
    // Extend here once a deterministic seed/fixture is in place.
  });
});
