import { test, expect } from "@playwright/test";

test.describe("Post Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await expect(page.getByText("One Ummah")).toBeVisible({ timeout: 30000 });
  });

  test("guest should be prompted to signup when creating post", async ({
    page,
  }) => {
    // Enter as guest
    await page.getByRole("button", { name: /continue as guest/i }).click();
    await expect(page.getByText(/feed|community/i)).toBeVisible({
      timeout: 10000,
    });

    // Try to create a post
    await page.getByRole("tab", { name: /create|post|add/i }).click();

    // Should see signup prompt or be redirected
    await expect(page.getByText(/sign up|create account|login/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("logged in user can create a request post", async ({ page }) => {
    // Signup first
    const uniqueEmail = `post-test-${Date.now()}@example.com`;
    await page.getByText(/sign up/i).click();
    await page.getByPlaceholder(/name/i).fill("Post Creator");
    await page.getByPlaceholder(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password/i).fill("password123");
    await page.getByPlaceholder(/confirm/i).fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/feed|community/i)).toBeVisible({
      timeout: 15000,
    });

    // Navigate to create post
    await page.getByRole("tab", { name: /create|post|add/i }).click();

    // Fill out post form
    await page.getByPlaceholder(/title/i).fill("Need help with groceries");
    await page
      .getByPlaceholder(/description|details/i)
      .fill("Looking for someone to help with weekly grocery shopping.");

    // Select category if dropdown exists
    const categoryDropdown = page.locator('[data-testid="category-dropdown"]');
    if (await categoryDropdown.isVisible()) {
      await categoryDropdown.click();
      await page
        .getByText(/food|groceries/i)
        .first()
        .click();
    }

    // Set contact preference to phone
    const phoneOption = page.getByText(/phone|text|sms/i);
    if (await phoneOption.isVisible()) {
      await phoneOption.click();
    }

    // Fill phone number if visible
    const phoneInput = page.getByPlaceholder(/phone/i);
    if (await phoneInput.isVisible()) {
      await phoneInput.fill("5551234567");
    }

    // Preview and submit
    const previewButton = page.getByRole("button", {
      name: /preview|next|continue/i,
    });
    if (await previewButton.isVisible()) {
      await previewButton.click();
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
    await page.getByPlaceholder(/name/i).fill("Offer Creator");
    await page.getByPlaceholder(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password/i).fill("password123");
    await page.getByPlaceholder(/confirm/i).fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/feed|community/i)).toBeVisible({
      timeout: 15000,
    });

    // Navigate to create post
    await page.getByRole("tab", { name: /create|post|add/i }).click();

    // Switch to offer type
    const offerTab = page.getByText(/offer/i).first();
    if (await offerTab.isVisible()) {
      await offerTab.click();
    }

    // Fill out post form
    await page.getByPlaceholder(/title/i).fill("Offering rides to mosque");
    await page
      .getByPlaceholder(/description|details/i)
      .fill("Can provide rides to Friday prayers.");

    // Set contact preference to email
    const emailOption = page.getByText(/email/i).first();
    if (await emailOption.isVisible()) {
      await emailOption.click();
    }

    // Fill email if visible
    const emailInput = page.getByPlaceholder(/email/i).last();
    if (await emailInput.isVisible()) {
      await emailInput.fill("helper@example.com");
    }

    // Preview and submit
    const previewButton = page.getByRole("button", {
      name: /preview|next|continue/i,
    });
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await page.getByRole("button", { name: /post|submit|publish/i }).click();
    }

    // Should see success
    await expect(page.getByText(/success|posted|created|feed/i)).toBeVisible({
      timeout: 15000,
    });
  });
});
