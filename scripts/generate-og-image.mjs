// BRAND-02 + BRAND-03: build-time OG screenshot generator. Boots out/ via a
// tiny http server, screenshots the homepage at 1200x630 with Playwright
// Chromium, writes public/og-image.png and out/og-image.png. Runs in CI
// between `next build` and `actions/upload-pages-artifact`.
//
// Import path note: @playwright/test re-exports `chromium`, and that package
// is already in devDependencies — so we import from '@playwright/test' rather
// than 'playwright' (which is not directly installed). This adds zero new
// dependencies.

import http from 'node:http'
import { promises as fs, existsSync } from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const OUT_DIR = path.resolve(process.cwd(), 'out')
const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
const PORT = 4173
const HOST = '127.0.0.1'
const VIEWPORT = { width: 1200, height: 630 }

const MIME_BY_EXT = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return MIME_BY_EXT[ext] ?? 'application/octet-stream'
}

async function safeJoin(root, requestUrl) {
  // Strip query string, normalize, resolve against root, then assert containment.
  // Use fs.realpath for both root and the joined path so symlinks cannot escape
  // the directory; fall back to the lexical check if the resolved path does not
  // exist yet (404 path), which path.normalize already protects.
  const urlPath = requestUrl.split('?')[0].split('#')[0]
  const decoded = decodeURIComponent(urlPath)
  const joined = path.normalize(path.join(root, decoded))
  const realRoot = await fs.realpath(root)
  let realJoined
  try {
    realJoined = await fs.realpath(joined)
  } catch {
    // File may not exist yet — fall back to lexical containment check.
    realJoined = joined
  }
  if (realJoined !== realRoot && !realJoined.startsWith(realRoot + path.sep)) {
    return null
  }
  return joined
}

function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        let filePath = await safeJoin(rootDir, req.url ?? '/')
        if (filePath === null) {
          res.writeHead(403)
          res.end('Forbidden')
          return
        }

        // Directory or extension-less request → serve <path>/index.html
        const stat = await fs.stat(filePath).catch(() => null)
        if (stat && stat.isDirectory()) {
          filePath = path.join(filePath, 'index.html')
        } else if (!path.extname(filePath)) {
          // Try .html fallback (e.g. /thanks → /thanks.html)
          const htmlCandidate = `${filePath}.html`
          if (existsSync(htmlCandidate)) {
            filePath = htmlCandidate
          } else {
            filePath = path.join(filePath, 'index.html')
          }
        }

        const data = await fs.readFile(filePath)
        res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) })
        res.end(data)
      } catch (err) {
        if (err && typeof err === 'object' && err.code === 'ENOENT') {
          res.writeHead(404)
          res.end('Not Found')
          return
        }
        res.writeHead(500)
        res.end('Server Error')
      }
    })

    server.once('error', reject)
    server.listen(PORT, HOST, () => resolve(server))
  })
}

async function waitForReady(url, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const ok = await new Promise((resolve) => {
        const req = http.get(url, (res) => {
          res.resume()
          resolve((res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 500)
        })
        req.on('error', () => resolve(false))
      })
      if (ok) return
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`Static server at ${url} did not respond within ${timeoutMs}ms`)
}

async function main() {
  // Pre-flight: confirm out/ has been built.
  const indexHtml = path.join(OUT_DIR, 'index.html')
  if (!existsSync(indexHtml)) {
    throw new Error(
      `out/index.html not found — run \`npm run build\` before \`npm run og:generate\`.`,
    )
  }

  const server = await startStaticServer(OUT_DIR)
  let browser
  try {
    await waitForReady(`http://${HOST}:${PORT}/`)

    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()

    await page.goto(`http://${HOST}:${PORT}/`, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    })

    const buffer = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    })

    await fs.mkdir(PUBLIC_DIR, { recursive: true })
    await fs.mkdir(OUT_DIR, { recursive: true })

    const publicPath = path.join(PUBLIC_DIR, 'og-image.png')
    const outPath = path.join(OUT_DIR, 'og-image.png')
    await fs.writeFile(publicPath, buffer)
    await fs.writeFile(outPath, buffer)

    const stat = await fs.stat(outPath)
    if (stat.size < 10_000 || stat.size > 500_000) {
      throw new Error(
        `OG image size out of bounds: ${stat.size} bytes (expected 10_000..500_000).`,
      )
    }

    process.stdout.write(
      `OG image written: ${VIEWPORT.width}x${VIEWPORT.height}, ${stat.size} bytes\n`,
    )
  } finally {
    if (browser) await browser.close()
    await new Promise((resolve) => server.close(() => resolve(undefined)))
  }
}

main().catch((err) => {
  process.stderr.write(`OG generation failed: ${err?.message ?? err}\n`)
  process.exit(1)
})
