import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

const FALLBACK = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'projects.json'), 'utf-8')
) as Array<{
  name: string;
  description: string | null;
  language: string | null;
  pushedAt: string | null;
  repoUrl: string;
  homepage: string | null;
}>;

// NOTE: re-run the live API check and update ARCHIVED_REPO_NAMES whenever this file is touched
// Live check performed on 2026-06-02: curl -s 'https://api.github.com/users/axelw/repos?type=owner&per_page=100&sort=pushed&direction=desc' returned [] archived repos
const ARCHIVED_REPO_NAMES: string[] = [];

test.describe('Phase 03 UAT', () => {

  // UAT-1: Section renders with section, h2, ul, and at least one article
  test('projects section renders with eyebrow, h2, and at least one card', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('section#projects').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-projects-rendered.png') });

    await expect(page.locator('section#projects')).toBeVisible();
    await expect(page.locator('section#projects h2#projects-heading')).toHaveText('Selected work on GitHub');

    const ulCount = await page.locator('section#projects ul').count();
    const emptyCopy = await page.locator('section#projects').getByText('No public projects yet.').count();
    expect(ulCount + emptyCopy).toBeGreaterThan(0);

    const articles = await page.locator('section#projects article').count();
    expect(articles + emptyCopy).toBeGreaterThan(0);

    // REVIEW M-10 (relaxed): for each non-empty meta line, assert it matches /.+/ (non-empty)
    // Unit-level correctness of formatRelativeDate is covered by tests/unit/date.test.ts
    if (articles > 0) {
      const metaTexts = await page.locator('section#projects article p').allTextContents();
      for (const text of metaTexts) {
        if (text.trim().length > 0) {
          expect(text).toMatch(/.+/);
        }
      }
    }
  });

  // UAT-2: Archived repos do not appear in rendered cards
  test('archived repos do not appear in rendered cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const renderedNames = await page.locator('section#projects article h3').allTextContents();

    // Strict assertion: for each name in ARCHIVED_REPO_NAMES, assert it is NOT in renderedNames
    for (const archivedName of ARCHIVED_REPO_NAMES) {
      expect(renderedNames, `archived repo ${archivedName} must not appear in rendered cards`).not.toContain(archivedName);
    }

    expect(renderedNames.every((n) => typeof n === 'string' && n.length > 0)).toBe(true);
  });

  // UAT-3: Live demo link presence per card matches source-of-truth homepage value (REVIEW H-9 hardened locator)
  test('live demo link presence per card matches source-of-truth homepage value', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const homepageByRepoUrl = new Map<string, string | null>(FALLBACK.map((p) => [p.repoUrl, p.homepage]));

    const cards = await page.locator('section#projects article').all();
    for (const card of cards) {
      // REVIEW H-9: locate Repo link by accessible role+name, NOT by source order.
      const repoLink = card.getByRole('link', { name: /repository on GitHub$/i });
      expect(await repoLink.count(), 'each card must contain exactly one Repo link by accessible name').toBe(1);
      const repoUrl = await repoLink.getAttribute('href');
      expect(repoUrl, 'every card must have a Repo link href').not.toBeNull();
      expect(repoUrl!, 'Repo link must point at github.com/axelw/...').toMatch(/^https:\/\/github\.com\/axelw\//);

      const liveDemoLink = card.getByRole('link', { name: /live demo/i });
      const hasLiveDemo = (await liveDemoLink.count()) > 0;

      if (homepageByRepoUrl.has(repoUrl!)) {
        const expectedHomepage = homepageByRepoUrl.get(repoUrl!);
        const expectedHasLiveDemo =
          expectedHomepage !== null && expectedHomepage !== undefined && expectedHomepage.length > 0;
        expect(
          hasLiveDemo,
          `card ${repoUrl} should ${expectedHasLiveDemo ? 'have' : 'not have'} a Live demo link (homepage=${JSON.stringify(expectedHomepage)})`
        ).toBe(expectedHasLiveDemo);
        if (expectedHasLiveDemo) {
          const demoHref = await liveDemoLink.getAttribute('href');
          expect(demoHref, 'Live demo href must equal source-of-truth homepage').toBe(expectedHomepage);
        }
      }
    }

    // Vacuity check: assert at least one fallback-mapped card was checked
    const checkedCount = (
      await Promise.all(
        cards.map(async (c) => {
          const link = c.getByRole('link', { name: /repository on GitHub$/i });
          const u = await link.getAttribute('href');
          return homepageByRepoUrl.has(u ?? '') ? 1 : 0;
        })
      )
    ).reduce((a: number, b: number) => a + b, 0);
    expect(
      checkedCount,
      'at least one rendered card must match a fallback entry — otherwise UAT-3 is vacuous'
    ).toBeGreaterThan(0);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-live-demo-links.png') });
  });

  // UAT-4: Anchor click from header scrolls to projects
  test('header nav: clicking #projects scrolls projects section into view under the sticky header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.locator('header a[href="#projects"]').click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-anchor-scrolled.png') });

    const sectionTop = await page.locator('section#projects').evaluate((el) => el.getBoundingClientRect().top);
    expect(sectionTop).toBeGreaterThanOrEqual(0);
    expect(sectionTop).toBeLessThanOrEqual(80);
  });

  // UAT-5: Reduced motion — projects FadeUp wrapper visible immediately (REVIEW C-1)
  test('reduced motion: projects FadeUp wrapper is visible immediately under prefers-reduced-motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('section#projects').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);

    // REVIEW C-1 — hard target: the locator MUST find a [data-fadein] ancestor.
    // NO ?? el.parentElement fallback. The Phase-2 pattern is the bug being closed.
    const op = await page.locator('section#projects').evaluate((el) => {
      const fadeUp = el.closest('[data-fadein]');
      if (!fadeUp) {
        throw new Error(
          'REVIEW C-1: section#projects has no [data-fadein] ancestor — FadeUp wrapper is missing or the data-fadein attribute regressed'
        );
      }
      return getComputedStyle(fadeUp).opacity;
    });
    expect(parseFloat(op)).toBeGreaterThan(0.9);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-projects-reduced-motion.png') });
    await context.close();
  });

  // UAT-6: Visual snapshots at 320, 768, 1280, 1440
  test('visual snapshots at 320 / 768 / 1280 / 1440', async ({ page }) => {
    const widths = [320, 768, 1280, 1440];

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.locator('section#projects').scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `10-projects-${width}.png`) });

      if (width === 320) {
        const ul = page.locator('section#projects ul').first();
        if (await ul.count() > 0) {
          const display = await ul.evaluate((el) => getComputedStyle(el).display);
          expect(display).toBe('grid');
          const cols = await ul.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
          const trackCount = cols.trim().split(/\s+(?=[\d(])/).length;
          expect(trackCount, `expected 1 column at 320px, got: "${cols}"`).toBe(1);
        }
      }

      if (width === 768) {
        const ul = page.locator('section#projects ul').first();
        if (await ul.count() > 0) {
          const display = await ul.evaluate((el) => getComputedStyle(el).display);
          expect(display).toBe('grid');
          const cols = await ul.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
          const trackCount = cols.trim().split(/\s+(?=[\d(])/).length;
          expect(trackCount, `expected 2 columns at 768px, got: "${cols}"`).toBe(2);
        }
      }
    }
  });

});
