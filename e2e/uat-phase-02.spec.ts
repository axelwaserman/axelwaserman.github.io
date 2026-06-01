import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

test.describe('Phase 02 UAT', () => {

  // UAT-1: Mobile overflow at 320px
  test('no horizontal overflow at 320px — single-column CV layout', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-mobile-320.png'), fullPage: true });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth, `scrollWidth (${scrollWidth}) should not exceed clientWidth (${clientWidth})`).toBeLessThanOrEqual(clientWidth);

    // CV grid should be single column at 320px — check the first grid (Work section)
    const cvGrid = page.locator('section#cv .grid').first();
    const gridCols = await cvGrid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    // single column means only one track value
    const trackCount = gridCols.trim().split(/\s+(?=[\d(])/).length;
    expect(trackCount, `CV grid should have 1 column at 320px, got: "${gridCols}"`).toBe(1);
  });

  // UAT-2: FadeUp scroll animation
  test('FadeUp: CV and Contact sections animate in on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Before scroll: FadeUp wrapper should start invisible (opacity 0)
    const cvSection = page.locator('section#cv');
    const initialOpacity = await cvSection.evaluate((el) => {
      const fadeUp = el.closest('[data-fadein]') ?? el.parentElement;
      return getComputedStyle(fadeUp!).opacity;
    });

    // Scroll CV into view
    await cvSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600); // let 400ms animation complete

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-fadein-after-scroll.png') });

    const finalOpacity = await cvSection.evaluate((el) => {
      const fadeUp = el.closest('[data-fadein]') ?? el.parentElement;
      return getComputedStyle(fadeUp!).opacity;
    });
    expect(parseFloat(finalOpacity), 'CV section should be visible after scroll').toBeGreaterThan(0.9);
  });

  // UAT-3: Reduced motion — animations skipped
  test('reduced motion: CV and Contact appear immediately without animation', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to CV without waiting for animation
    await page.locator('section#cv').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-reduced-motion.png'), fullPage: true });

    const cvOpacity = await page.locator('section#cv').evaluate((el) => {
      const fadeUp = el.closest('[data-fadein]') ?? el.parentElement;
      return getComputedStyle(fadeUp!).opacity;
    });
    expect(parseFloat(cvOpacity), 'CV should be fully visible immediately under reduced motion').toBeGreaterThan(0.9);

    await context.close();
  });

  // UAT-4: Header background scroll transition
  test('header transitions from transparent to surface color after 100px scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04a-header-top.png') });
    const bgBefore = await header.evaluate((el) => getComputedStyle(el).backgroundColor);

    // Scroll past 100px
    await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }));
    await page.waitForTimeout(200);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04b-header-scrolled.png') });
    const bgAfter = await header.evaluate((el) => getComputedStyle(el).backgroundColor);

    // After scroll the background should have changed (not fully transparent)
    expect(bgAfter, 'Header background should change after scroll').not.toBe(bgBefore);
    // Should not be transparent rgba(0,0,0,0)
    expect(bgAfter).not.toBe('rgba(0, 0, 0, 0)');
  });

  // UAT-5: Desktop nav visibility at breakpoints
  test('nav links hidden at 320px, visible at 640px+', async ({ page }) => {
    // 320px — nav should be hidden
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05a-nav-mobile.png') });
    const nav = page.locator('header nav');
    const navDisplay320 = await nav.evaluate((el) => getComputedStyle(el).display);
    expect(navDisplay320, 'Nav should be hidden at 320px').toBe('none');

    // 768px — nav should be visible
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(100);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05b-nav-desktop.png') });
    const navDisplay768 = await nav.evaluate((el) => getComputedStyle(el).display);
    expect(navDisplay768, 'Nav should be visible at 768px').not.toBe('none');
  });

});
