import { test, expect } from "@playwright/test";

test.describe("Post Interaction Flow", () => {
  let testEmail: string;
  let postTitle: string;

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await expect(page.getByText("1 Sadaqa")).toBeVisible({ timeout: 30000 });

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
    await page.getByTestId("create-post-button").click();
    await page.waitForTimeout(1000); // Wait for screen to fully load
    await page.getByTestId("input-title").fill(postTitle);
    await page.getByTestId("input-description").fill("Test description for viewing");

    // Select category - Food option
    const categoryDropdown = page.getByTestId("category-dropdown");
    if (await categoryDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryDropdown.click();
      await page.waitForTimeout(300);
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

    await page.waitForTimeout(500);
    const previewButton = page.getByRole("button", { name: /preview|next|continue/i });
    const isEnabled = await previewButton.isEnabled().catch(() => false);
    if (isEnabled) {
      await previewButton.click();
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /post|submit|publish/i }).click();
    }

    // Wait for success and go to feed
    await expect(page.getByText(/success|feed/i)).toBeVisible({
      timeout: 15000,
    });

    // Navigate to feed - use the home icon/feed button
    await page.locator('[aria-label="Feed"]').first().click();
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
    await page.getByTestId("create-post-button").click();
    await page.waitForTimeout(1000);
    await page.getByTestId("input-title").fill(postTitle);
    await page.getByTestId("input-description").fill("Test post to be fulfilled");

    // Select category - Food option
    const categoryDropdown = page.getByTestId("category-dropdown");
    if (await categoryDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryDropdown.click();
      await page.waitForTimeout(300);
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

    await page.waitForTimeout(500);
    const previewButton = page.getByRole("button", { name: /preview|next|continue/i });
    const isEnabled = await previewButton.isEnabled().catch(() => false);
    if (isEnabled) {
      await previewButton.click();
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /post|submit|publish/i }).click();
    }

    await expect(page.getByText(/success|feed/i)).toBeVisible({
      timeout: 15000,
    });

    // Navigate to feed and find our post
    await page.locator('[aria-label="Feed"]').first().click();
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
    await page.getByTestId("create-post-button").click();
    await page.waitForTimeout(1000);
    await page.getByTestId("input-title").fill(postTitle);
    await page.getByTestId("input-description").fill("Test post to be deleted");

    // Select category - Food option
    const categoryDropdown = page.getByTestId("category-dropdown");
    if (await categoryDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryDropdown.click();
      await page.waitForTimeout(300);
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

    await page.waitForTimeout(500);
    const previewButton = page.getByRole("button", { name: /preview|next|continue/i });
    const isEnabled = await previewButton.isEnabled().catch(() => false);
    if (isEnabled) {
      await previewButton.click();
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /post|submit|publish/i }).click();
    }

    await expect(page.getByText(/success|feed/i)).toBeVisible({
      timeout: 15000,
    });

    // Navigate to feed and find our post
    await page.locator('[aria-label="Feed"]').first().click();
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
    await page.locator('[aria-label="Feed"]').first().click();
    await expect(page.getByText(postTitle)).not.toBeVisible({ timeout: 10000 });
  });
});
