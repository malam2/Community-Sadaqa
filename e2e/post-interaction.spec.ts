import { test, expect } from "@playwright/test";

test.describe("Post Interaction Flow", () => {
  let testEmail: string;
  let postTitle: string;

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await expect(page.getByText("One Ummah")).toBeVisible({ timeout: 30000 });

    // Create a unique user and post for each test
    testEmail = `interaction-${Date.now()}@example.com`;
    postTitle = `Test Post ${Date.now()}`;

    // Signup
    await page.getByText(/sign up/i).click();
    await page.getByTestId("signup-name").fill("Interaction Tester");
    await page.getByTestId("signup-email").fill(testEmail);
    await page.getByTestId("signup-password").fill("password123");
    await page.getByTestId("signup-confirm-password").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText("Community Feed")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should view post details", async ({ page }) => {
    // Create a post first
    await page.getByRole("tab", { name: /create|post|add/i }).click();
    await page.getByPlaceholder(/title/i).fill(postTitle);
    await page
      .getByPlaceholder(/description|details/i)
      .fill("Test description for viewing");

    const phoneInput = page.getByPlaceholder(/phone/i);
    if (await phoneInput.isVisible()) {
      await phoneInput.fill("5551234567");
    }

    const previewButton = page.getByRole("button", {
      name: /preview|next|continue/i,
    });
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await page.getByRole("button", { name: /post|submit|publish/i }).click();
    }

    // Wait for success and go to feed
    await expect(page.getByText(/success|feed/i)).toBeVisible({
      timeout: 15000,
    });

    // Navigate to feed
    await page.getByRole("tab", { name: /feed|home/i }).click();
    await expect(page.getByText(postTitle)).toBeVisible({ timeout: 10000 });

    // Click on the post to view details
    await page.getByText(postTitle).click();

    // Should see post detail screen with full description
    await expect(page.getByText("Test description for viewing")).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("button", { name: /offer help|contact|help/i }),
    ).toBeVisible();
  });

  test("should mark post as fulfilled", async ({ page }) => {
    // Create a post first
    await page.getByRole("tab", { name: /create|post|add/i }).click();
    await page.getByPlaceholder(/title/i).fill(postTitle);
    await page
      .getByPlaceholder(/description|details/i)
      .fill("Test post to be fulfilled");

    const phoneInput = page.getByPlaceholder(/phone/i);
    if (await phoneInput.isVisible()) {
      await phoneInput.fill("5551234567");
    }

    const previewButton = page.getByRole("button", {
      name: /preview|next|continue/i,
    });
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await page.getByRole("button", { name: /post|submit|publish/i }).click();
    }

    await expect(page.getByText(/success|feed/i)).toBeVisible({
      timeout: 15000,
    });

    // Navigate to feed and find our post
    await page.getByRole("tab", { name: /feed|home/i }).click();
    await page.getByText(postTitle).click();

    // Mark as fulfilled
    const fulfillButton = page.getByRole("button", {
      name: /fulfilled|complete/i,
    });
    await expect(fulfillButton).toBeVisible({ timeout: 10000 });
    await fulfillButton.click();

    // Confirm if dialog appears
    const confirmButton = page.getByRole("button", { name: /yes|confirm|ok/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // Should see fulfilled status
    await expect(page.getByText(/fulfilled/i)).toBeVisible({ timeout: 10000 });
  });

  test("should delete own post", async ({ page }) => {
    // Create a post first
    await page.getByRole("tab", { name: /create|post|add/i }).click();
    await page.getByPlaceholder(/title/i).fill(postTitle);
    await page
      .getByPlaceholder(/description|details/i)
      .fill("Test post to be deleted");

    const phoneInput = page.getByPlaceholder(/phone/i);
    if (await phoneInput.isVisible()) {
      await phoneInput.fill("5551234567");
    }

    const previewButton = page.getByRole("button", {
      name: /preview|next|continue/i,
    });
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await page.getByRole("button", { name: /post|submit|publish/i }).click();
    }

    await expect(page.getByText(/success|feed/i)).toBeVisible({
      timeout: 15000,
    });

    // Navigate to feed and find our post
    await page.getByRole("tab", { name: /feed|home/i }).click();
    await page.getByText(postTitle).click();

    // Delete post
    const deleteButton = page.getByRole("button", { name: /delete/i });
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    await deleteButton.click();

    // Confirm deletion
    const confirmButton = page
      .getByRole("button", { name: /yes|confirm|delete/i })
      .last();
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // Should return to feed and post should be gone
    await page.waitForTimeout(1000);
    await page.getByRole("tab", { name: /feed|home/i }).click();
    await expect(page.getByText(postTitle)).not.toBeVisible({ timeout: 10000 });
  });
});
