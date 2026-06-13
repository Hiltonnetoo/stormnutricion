import { test, expect } from "@playwright/test";

/**
 * Public, unauthenticated smoke tests. These run without a Firebase session and
 * cover the landing page, the i18n language switcher and the registration form
 * validation — the deterministic parts a reviewer can exercise instantly.
 */
test.describe("Public site (smoke)", () => {
  test("landing page renders the brand and language switcher", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText("Storm").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "EN", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "PT", exact: true }),
    ).toBeVisible();
  });

  test("language switcher toggles between English and Portuguese", async ({
    page,
  }) => {
    await page.goto("/");

    // Force English -> the hero CTA shows the English label
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByText("Try it for Free")).toBeVisible();

    // Switch to Portuguese -> the hero CTA shows the Portuguese label
    await page.getByRole("button", { name: "PT", exact: true }).click();
    await expect(page.getByText("Experimentar Gratuitamente")).toBeVisible();
  });

  test("registration form rejects a weak password", async ({ page }) => {
    await page.goto("/#/register");

    await page.fill("#displayName", "Test User");
    await page.fill("#email", "reviewer@example.com");
    await page.fill("#password", "123"); // shorter than the 6-char minimum

    await page.locator('button[type="submit"]').click();

    // It must NOT navigate to the dashboard — stays on the register screen
    await expect(page).toHaveURL(/register/);
  });
});
