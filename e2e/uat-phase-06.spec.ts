import { test, expect, type Page } from '@playwright/test'
import path from 'path'

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots')

const FORMSPREE_GLOB = '**/formspree.io/**'
const EMAIL = 'axel.waserman@gmail.com'

// Mock Formspree endpoint with the requested status. Must be installed BEFORE
// any navigation so the route is in place when the form posts.
async function mockFormspree(page: Page, status = 200): Promise<void> {
  await page.route(FORMSPREE_GLOB, (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(status >= 200 && status < 300 ? { ok: true } : { error: 'mock error' }),
    }),
  )
}

async function fillValidForm(page: Page): Promise<void> {
  await page.getByLabel('Name').fill('Test User')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Company (optional)').fill('Acme Inc.')
  await page.getByLabel('Message').fill('Hello — this is a test message from the UAT spec.')
}

test.describe('Phase 6 — Contact form', () => {
  // UAT-1: Validation errors on empty submit (D-10 / D-11)
  test('validation errors render under each required field on empty submit', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const contactSection = page.locator('section#contact')
    await contactSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)

    await contactSection.getByRole('button', { name: /send message/i }).click()

    await expect(contactSection.getByText('Please enter your name')).toBeVisible()
    await expect(contactSection.getByText('Please enter your email')).toBeVisible()
    await expect(contactSection.getByText('Please enter a message')).toBeVisible()
  })

  // UAT-2: Happy path — valid submit POSTs to mocked Formspree, navigates to /thanks
  test('valid submit POSTs to Formspree (mocked) and navigates to /thanks', async ({ page }) => {
    await mockFormspree(page, 200)

    let formspreeRequested = false
    page.on('request', (request) => {
      if (/formspree\.io/.test(request.url())) {
        formspreeRequested = true
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('section#contact').scrollIntoViewIfNeeded()

    await fillValidForm(page)
    await page.getByRole('button', { name: /send message/i }).click()

    await expect(page).toHaveURL(/\/thanks\/?$/)
    expect(formspreeRequested, 'form must POST to formspree.io').toBe(true)

    // /thanks rendered content (no email caption — email only surfaces in
    // the form's error fallback now, not on success)
    await expect(page.getByRole('heading', { name: /thanks — message received\.?/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible()
    expect(
      await page.locator(`text=${EMAIL}`).count(),
      '/thanks must not surface the plain email',
    ).toBe(0)
  })

  // UAT-3: Error path — non-2xx response renders inline fallback block with the email address
  test('non-2xx Formspree response renders fallback error block referencing the email', async ({
    page,
  }) => {
    await mockFormspree(page, 500)

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('section#contact').scrollIntoViewIfNeeded()

    await fillValidForm(page)
    await page.getByRole('button', { name: /send message/i }).click()

    const errorBlock = page.locator('#contact-submit-error')
    await expect(errorBlock).toBeVisible()
    await expect(errorBlock).toContainText(EMAIL)

    // Page must NOT have navigated away on failure — still on /
    expect(new URL(page.url()).pathname).toBe('/')
  })

  // UAT-4: Honeypot present + hidden (D-02)
  test('honeypot _gotcha input is attached but not visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const honeypot = page.locator('input[name="_gotcha"]')
    await expect(honeypot).toBeAttached()
    await expect(honeypot).not.toBeVisible()
  })

  // UAT-5: JSON-LD Person is injected post-hydration with the decoded email
  // (anti-harvest: the static HTML must NOT contain the address)
  test('JSON-LD Person schema is injected client-side with decoded email', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // After hydration, the script tag exists and parses to a Person with the email.
    const jsonLdRaw = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent()
    expect(jsonLdRaw, 'JSON-LD <script> must exist after hydration').not.toBeNull()

    const parsed = JSON.parse(jsonLdRaw!) as Record<string, unknown>
    expect(parsed['@type']).toBe('Person')
    expect(parsed.email).toBe(EMAIL)
  })

  // UAT-6: Plain email must NOT appear in the SSR/static HTML — anti-harvest gate.
  // We fetch the raw HTML directly (no JS execution) and assert the address is absent.
  test('static HTML never serialises the plain email (anti-harvest)', async ({ request }) => {
    const response = await request.get('/')
    expect(response.ok()).toBe(true)
    const html = await response.text()
    expect(
      html.includes(EMAIL),
      'static HTML must not contain the plain email — must be base64 + decoded client-side',
    ).toBe(false)
  })

  // UAT-6b: Contact section never shows the plain email at rest — only the form is visible.
  test('contact section does not surface the plain email in the resting state', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const contactSection = page.locator('section#contact')
    expect(
      await contactSection.locator(`text=${EMAIL}`).count(),
      'plain email must not be visible in the contact section at rest',
    ).toBe(0)
  })

  // UAT-7: Hero CTA cluster (SC-3) — no mailto: anywhere, Hero anchors as expected
  test('Hero CTA cluster: no mailto: anchors anywhere, #contact + GitHub + LinkedIn + CV present', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const mailtoAnchors = page.locator('a[href^="mailto:"]')
    expect(
      await mailtoAnchors.count(),
      'no mailto: anchors should remain anywhere in the rendered DOM',
    ).toBe(0)

    const hero = page.locator('section#hero')
    await expect(hero.locator('a[href="#contact"]')).toHaveText(/get in touch/i)
    await expect(hero.locator('a[href*="github.com/axelwaserman"]').first()).toBeVisible()
    await expect(hero.locator('a[href*="linkedin.com"]').first()).toBeVisible()
    await expect(hero.locator('a[href="/cv.pdf"][download]').first()).toBeVisible()
  })

  // UAT-8: Visual screenshots at 320 / 768 / 1440 for both contact section and /thanks
  test('visual screenshots: contact + /thanks at 320 / 768 / 1440', async ({ page }) => {
    const widths = [320, 768, 1440] as const
    const heights: Record<(typeof widths)[number], number> = {
      320: 800,
      768: 1024,
      1440: 900,
    }

    // Mock Formspree once for the /thanks captures so a stray submit can't escape.
    await mockFormspree(page, 200)

    for (const width of widths) {
      // Contact section screenshot
      await page.setViewportSize({ width, height: heights[width] })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.locator('section#contact').scrollIntoViewIfNeeded()
      await page.waitForTimeout(600)
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `phase-06-contact-${width}.png`),
        fullPage: true,
      })

      // /thanks screenshot — visit the route directly
      await page.goto('/thanks')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(200)
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `phase-06-thanks-${width}.png`),
        fullPage: true,
      })
    }
  })

  // UAT-9: Reduced-motion smoke test (SC-4) — page renders without exception under prefers-reduced-motion
  test('reduced-motion: contact section renders without exception and screenshots cleanly', async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator('section#contact').scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)

    // Page should still render the form heading + fields
    await expect(page.locator('section#contact h2#contact-heading')).toBeVisible()
    await expect(page.getByLabel('Name')).toBeVisible()
    await expect(page.getByLabel('Message')).toBeVisible()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'phase-06-contact-reduced-motion.png'),
      fullPage: true,
    })

    await context.close()
  })
})
