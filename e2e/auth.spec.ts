import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto("/");
  });

  test("should display login screen with guest option", async ({ page }) => {
    // Wait for the app to load
    await expect(page.getByText("One Ummah")).toBeVisible({ timeout: 30000 });

    // Check login form elements
    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();

    // Check guest option is available
    await expect(
      page.getByRole("button", { name: /continue as guest/i }),
    ).toBeVisible();
  });

  test("should allow guest mode access to feed", async ({ page }) => {
    await expect(page.getByText("One Ummah")).toBeVisible({ timeout: 30000 });

    // Click continue as guest
    await page.getByRole("button", { name: /continue as guest/i }).click();

    // Should navigate to feed
    await expect(page.getByText("Community Feed")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should signup new user successfully", async ({ page }) => {
    await expect(page.getByText("One Ummah")).toBeVisible({ timeout: 30000 });

    // Navigate to signup
    await page.getByText(/sign up/i).click();
    await expect(page.getByText("Create Account")).toBeVisible({
      timeout: 10000,
    });

    // Generate unique email
    const uniqueEmail = `test-${Date.now()}@example.com`;

    // Fill signup form
    await page.getByTestId("signup-name").fill("Test User");
    await page.getByTestId("signup-email").fill(uniqueEmail);
    await page.getByTestId("signup-password").fill("password123");
    await page.getByTestId("signup-confirm-password").fill("password123");

    // Submit signup
    await page.getByRole("button", { name: /create account/i }).click();

    // Should navigate to main app
    await expect(page.getByText("Community Feed")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should login existing user", async ({ page }) => {
    // First create a user
    const uniqueEmail = `login-test-${Date.now()}@example.com`;

    await page.getByText(/sign up/i).click();
    await page.getByTestId("signup-name").fill("Login Test User");
    await page.getByTestId("signup-email").fill(uniqueEmail);
    await page.getByTestId("signup-password").fill("password123");
    await page.getByTestId("signup-confirm-password").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText("Community Feed")).toBeVisible({
      timeout: 15000,
    });

    // Logout (go to profile and logout)
    await page.getByRole("tab", { name: /profile/i }).click();
    
    // Click sign out button - this triggers an alert
    await page.getByRole("button", { name: /sign out/i }).click();
    
    // Handle the confirmation dialog - click "Sign Out" to confirm
    page.on('dialog', dialog => dialog.accept());
    await page.getByText("Sign Out", { exact: true }).click();

    // Wait for redirect to login page
    await expect(page.getByTestId("login-email")).toBeVisible({ timeout: 10000 });

    // Now login with same credentials
    await page.getByTestId("login-email").fill(uniqueEmail);
    await page.getByTestId("login-password").fill("password123");
    await page.getByRole("button", { name: /log in|sign in/i }).click();

    // Should be logged in
    await expect(page.getByText("Community Feed")).toBeVisible({
      timeout: 15000,
    });
  });
});
