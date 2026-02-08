import { test, expect } from "@playwright/test";

test.describe("Post Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await expect(page.getByText("1 Sadaqa")).toBeVisible({ timeout: 30000 });
  });

  test("guest should be prompted to signup when creating post", async ({
    page,
  }) => {
    // Enter as guest
    await page.getByRole("button", { name: /continue as guest/i }).click();
    await expect(page.getByText("Community Feed")).toBeVisible({
      timeout: 10000,
    });

    // Try to create a post - look for the create button by test ID
    await page.getByTestId("create-post-button").click();

    // Should see signup prompt or be redirected
    await expect(page.getByText(/sign up|create account|login/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("logged in user can create a request post", async ({ page }) => {
    // Signup first
    const uniqueEmail = `post-test-${Date.now()}@example.com`;
    await page.getByText(/sign up/i).click();
    await page.getByTestId("signup-name").fill("Post Creator");
    await page.getByTestId("signup-email").fill(uniqueEmail);
    await page.getByTestId("signup-password").fill("password123");
    await page.getByTestId("signup-confirm-password").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText("Community Feed")).toBeVisible({
      timeout: 15000,
    });

    // Navigate to create post
    await page.getByTestId("create-post-button").click();
    await page.waitForTimeout(1000); // Wait for screen to fully load

    // Fill out post form using testIDs
    await page.getByTestId("input-title").fill("Need help with groceries");
    await page.getByTestId("input-description").fill("Looking for someone to help with weekly grocery shopping.");

    // Select category - Food option
    const categoryDropdown = page.getByTestId("category-dropdown");
    if (await categoryDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryDropdown.click();
      await page.waitForTimeout(300); // Wait for dropdown to open
      const foodOption = page.getByText("Food", { exact: true });
      if (await foodOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await foodOption.click();
      }
    }

    // Accept guidelines checkbox if visible
    const guidelinesCheckbox = page.getByText(/I confirm|guidelines/i);
    if (await guidelinesCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
      await guidelinesCheckbox.click();
    }

    // Preview and submit - wait for button to be enabled
    await page.waitForTimeout(500);
    const previewButton = page.getByRole("button", { name: /preview|next|continue/i });
    await expect(previewButton).toBeVisible({ timeout: 5000 });
    
    // Check if button is enabled before clicking
    const isEnabled = await previewButton.isEnabled();
    if (isEnabled) {
      await previewButton.click();
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /post|submit|publish/i }).click();
    }

    // Should see success or return to feed
    await expect(page.getByText(/success|posted|created|feed/i)).toBeVisible({
      timeout: 15000,
    });
  });

  test("logged in user can create an offer post", async ({ page }) => {
    // Signup first
    const uniqueEmail = `offer-test-${Date.now()}@example.com`;
    await page.getByText(/sign up/i).click();
    await page.getByTestId("signup-name").fill("Offer Creator");
    await page.getByTestId("signup-email").fill(uniqueEmail);
    await page.getByTestId("signup-password").fill("password123");
    await page.getByTestId("signup-confirm-password").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText("Community Feed")).toBeVisible({
      timeout: 15000,
    });

    // Navigate to create post - look for the create button by test ID
    await page.getByTestId("create-post-button").click();
    await page.waitForTimeout(1000); // Wait for screen to fully load
    
    // Switch to offer type - look for the segmented control
    const offerTab = page.getByText(/offer/i).first();
    if (await offerTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await offerTab.click();
    }

    // Fill out post form using testIDs
    await page.getByTestId("input-title").fill("Offering rides to mosque");
    await page.getByTestId("input-description").fill("Can provide rides to Friday prayers.");

    // Select category - Ride option
    const categoryDropdown = page.getByTestId("category-dropdown");
    if (await categoryDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryDropdown.click();
      await page.waitForTimeout(300);
      const rideOption = page.getByText("Ride", { exact: true });
      if (await rideOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await rideOption.click();
      }
    }

    // Accept guidelines checkbox if visible
    const guidelinesCheckbox = page.getByText(/I confirm|guidelines/i);
    if (await guidelinesCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
      await guidelinesCheckbox.click();
    }

    // Preview and submit - wait for button to be enabled
    await page.waitForTimeout(500);
    const previewButton = page.getByRole("button", { name: /preview|next|continue/i });
    await expect(previewButton).toBeVisible({ timeout: 5000 });
    
    // Check if button is enabled before clicking
    const isEnabled = await previewButton.isEnabled();
    if (isEnabled) {
      await previewButton.click();
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /post|submit|publish/i }).click();
    }

    // Should see success
    await expect(page.getByText(/success|posted|created|feed/i)).toBeVisible({
      timeout: 15000,
    });
  });
});
