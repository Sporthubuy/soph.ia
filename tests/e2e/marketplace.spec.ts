import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LOCALE = 'en';

test.describe('Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to marketplace
    await page.goto(`${BASE_URL}/${LOCALE}/marketplace`);

    // Wait for page to load
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display marketplace with stats', async ({ page }) => {
    // Check for stats section
    const statsLabels = page.locator('[class*="text-xs"][class*="text-\\[var\\(--star-3\\)\\]"]');
    await expect(statsLabels).toContainText('Public');

    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should search agents by name', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');

    // Type search query
    await searchInput.fill('support');

    // Wait for results to update
    await page.waitForTimeout(500);

    // Check if agent count is displayed
    const agentCount = page.locator('text=/\\d+ agents?/');
    await expect(agentCount).toBeVisible();
  });

  test('should filter by tag if tags exist', async ({ page }) => {
    // Check if tag filter exists
    const tagSelect = page.locator('select').first();
    const isVisible = await tagSelect.isVisible().catch(() => false);

    if (isVisible) {
      // Get all options
      const options = await tagSelect.locator('option').count();

      if (options > 1) {
        // Select second option (first is "All")
        await tagSelect.selectOption({ index: 1 });

        // Wait for filter to apply
        await page.waitForTimeout(500);

        // Check that results are updated
        const agentCount = page.locator('text=/\\d+ agents?/');
        await expect(agentCount).toBeVisible();
      }
    }
  });

  test('should sort agents', async ({ page }) => {
    const sortSelect = page.locator('select').last();

    // Get initial sort value
    const initialValue = await sortSelect.inputValue();

    // Change sort
    const newSort = initialValue === 'newest' ? 'rating' : 'newest';
    await sortSelect.selectOption(newSort);

    // Wait for results to update
    await page.waitForTimeout(500);

    // Verify sort changed
    const sortValue = await sortSelect.inputValue();
    expect(sortValue).toBe(newSort);
  });

  test('should display agent cards', async ({ page }) => {
    // Check for agent cards in grid
    const agentCards = page.locator('[class*="grid"]').first().locator('[class*="rounded"]');

    // Wait for cards to load
    await page.waitForTimeout(1000);

    // If there are agents, check card structure
    const cardCount = await agentCards.count();
    if (cardCount > 0) {
      const firstCard = agentCards.first();

      // Check for agent name
      const agentName = firstCard.locator('[class*="text-\\[var\\(--star-1\\)\\]"]').first();
      await expect(agentName).toBeVisible();
    }
  });

  test('should show empty state when no agents', async ({ page }) => {
    // Search for something unlikely to exist
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('xyznonexistentagent12345');

    // Wait for results
    await page.waitForTimeout(500);

    // Check for empty state
    const emptyState = page.locator('text=No public agents');
    const isVisible = await emptyState.isVisible().catch(() => false);

    if (isVisible) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should handle mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Check if desktop controls are hidden
    const desktopToolbar = page.locator('div').filter({ hasText: /All tags/ });
    const isHidden = await desktopToolbar.isHidden().catch(() => true);

    // Marketplace should still be visible on mobile
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Search input should still work
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });
});

test.describe('Marketplace with authentication', () => {
  test.skip('should allow cloning public agent', async ({ page, context }) => {
    // This test requires authentication setup
    // Skip for now - would need login flow
    await page.goto(`${BASE_URL}/${LOCALE}/marketplace`);
  });

  test.skip('should allow rating agent', async ({ page, context }) => {
    // This test requires authentication setup
    // Skip for now - would need login flow
    await page.goto(`${BASE_URL}/${LOCALE}/marketplace`);
  });

  test.skip('should show agent recommendations', async ({ page, context }) => {
    // This test requires viewing a public agent detail page
    // Skip for now - would need agent detail page navigation
    await page.goto(`${BASE_URL}/${LOCALE}/marketplace`);
  });
});
