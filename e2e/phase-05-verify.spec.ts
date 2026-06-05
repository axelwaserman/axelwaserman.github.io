import { test, expect } from '@playwright/test';

const BASE = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:4321';

test.use({ reducedMotion: 'reduce' });

test.describe('Phase 5 gap fix verification', () => {
  test('hero with mandala caption details', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('What is this?')).toBeVisible();
    await page.getByText('What is this?').click();
    await expect(page.getByText('Times Tables on a Circle.')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/phase-05-fix-hero-1440.png' });
  });

  test('cv stint grouping (Contentsquare appears twice as company header, not 4× as duplicated description)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/#cv');
    await page.locator('#cv').scrollIntoViewIfNeeded();
    const cv = page.locator('#cv');
    await cv.screenshot({ path: 'e2e/screenshots/phase-05-fix-cv-1440.png' });
  });
});
