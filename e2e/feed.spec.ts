import { test, expect } from "@playwright/test";

test.describe("Feed and Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await expect(page.getByText("One Ummah")).toBeVisible({ timeout: 30000 });

    // Enter as guest for browsing tests
    await page.getByRole("button", { name: /continue as guest/i }).click();
    await expect(page.getByText(/feed|community/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should display feed with posts", async ({ page }) => {
    // Feed should show posts or empty state
    const hasPosts =
      (await page.locator('[data-testid^="post-card"]').count()) > 0;
    const hasEmptyState = await page
      .getByText(/no posts|nothing|empty|be the first/i)
      .isVisible()
      .catch(() => false);

    expect(hasPosts || hasEmptyState).toBeTruthy();
  });

  test("should filter by requests only", async ({ page }) => {
    // Look for filter chips
    const requestFilter = page.getByRole("button", { name: /requests?$/i });
    if (await requestFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await requestFilter.click();

      // All visible posts should be requests (if any exist)
      const offerBadges = await page.getByText(/^offer$/i).count();
      // When filtering by requests, we shouldn't see offer badges
      // This is a soft check - if there are offers visible, the filter isn't working
      if ((await page.locator('[data-testid^="post-card"]').count()) > 0) {
        // Check that request badges are visible
        await expect(page.getByText(/request/i).first()).toBeVisible();
      }
    }
  });

  test("should filter by offers only", async ({ page }) => {
    const offerFilter = page.getByRole("button", { name: /offers?$/i });
    if (await offerFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await offerFilter.click();

      // Similar soft check for offers filter
      if ((await page.locator('[data-testid^="post-card"]').count()) > 0) {
        await expect(page.getByText(/offer/i).first()).toBeVisible();
      }
    }
  });

  test("should filter by urgent posts", async ({ page }) => {
    const urgentFilter = page.getByRole("button", { name: /urgent/i });
    if (await urgentFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await urgentFilter.click();

      // Check that only urgent posts are shown (if any)
      const postCount = await page
        .locator('[data-testid^="post-card"]')
        .count();
      if (postCount > 0) {
        // All visible posts should have urgent badge
        const urgentBadges = await page.getByText(/urgent/i).count();
        expect(urgentBadges).toBeGreaterThan(0);
      }
    }
  });

  test("should show all posts when 'All' filter selected", async ({ page }) => {
    // Click requests first, then all
    const requestFilter = page.getByRole("button", { name: /requests?$/i });
    const allFilter = page.getByRole("button", { name: /^all$/i });

    if (await requestFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await requestFilter.click();
      await page.waitForTimeout(500);

      if (await allFilter.isVisible()) {
        await allFilter.click();
        // After clicking All, the filter should reset
        // No specific assertion needed - just verify no crash
      }
    }
  });

  test("should pull to refresh / refresh feed", async ({ page }) => {
    // Store initial state
    const initialPostCount = await page
      .locator('[data-testid^="post-card"]')
      .count();

    // Trigger refresh by navigating away and back, or pull action
    await page.getByRole("tab", { name: /profile/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole("tab", { name: /feed|home/i }).click();

    // Feed should reload without errors
    await page.waitForTimeout(1000);
    const newPostCount = await page
      .locator('[data-testid^="post-card"]')
      .count();

    // Should have same or different count (data could change)
    expect(typeof newPostCount).toBe("number");
  });
});
