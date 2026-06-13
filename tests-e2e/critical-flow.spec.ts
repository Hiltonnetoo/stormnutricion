import { test, expect } from "@playwright/test";

test.describe("Storm Nutrition V5 - E2E Critical Flow", () => {
  const randomEmail = `nutri.e2e.${Date.now()}.${Math.floor(Math.random() * 1000)}@stormnutrition.com`;
  const testPassword = "password123";

  test("should register a new nutritionist, access dashboard and toggle dark mode", async ({ page }) => {
    // 1. Navigate to Register page
    await page.goto("/#/register");

    // Check we are on the register page
    await expect(page.locator('h1:has-text("Create your account")')).toBeVisible();

    // 2. Fill registration details
    await page.fill("#displayName", "Playwright Test Nutri");
    await page.fill("#email", randomEmail);
    await page.fill("#password", testPassword);

    // 3. Click submit
    await page.click('button[type="submit"]');

    // 4. Confirm we are redirected to the Dashboard
    // The App redirects authenticated users to /dashboard or /paciente based on role.
    // Let's wait for Dashboard path or content.
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Check Dashboard elements are visible
    await expect(page.locator("text=Quick Actions")).toBeVisible();
    await expect(page.locator("text=Active Patients")).toBeVisible();

    // 5. Navigate to settings and toggle dark theme
    await page.goto("/#/settings");
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    await expect(page.locator("text=Appearance")).toBeVisible();

    // Toggle theme to dark mode
    // We search for the button or option that switches the theme.
    // Let's click the switch theme buttons (Claro / Escuro).
    const darkThemeButton = page.locator('button:has-text("Dark Mode")');
    if (await darkThemeButton.isVisible()) {
      await darkThemeButton.click();
      // Verify html tag has dark class
      const htmlClass = await page.evaluate(() => document.documentElement.className);
      expect(htmlClass).toContain("dark");
    }

    // Toggle back to light mode
    const lightThemeButton = page.locator('button:has-text("Light Mode")');
    if (await lightThemeButton.isVisible()) {
      await lightThemeButton.click();
      // Verify html tag does not have dark class anymore
      const htmlClass = await page.evaluate(() => document.documentElement.className);
      expect(htmlClass).not.toContain("dark");
    }
  });
});
