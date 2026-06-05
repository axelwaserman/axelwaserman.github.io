import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Next.js App Router favicon convention:
// - `size` and `contentType` configure the emitted asset metadata.
// - The default-exported async function generates the icon at build time.
// - Next auto-injects `<link rel="icon" ...>` into every page's HTML head.
// Static-export compatible (Next.js 15+) — runs at `next build`, not at request time.
export const size = { width: 32, height: 32 } as const
export const contentType = 'image/png' as const

// Required under `output: 'export'` (Next.js static export) — without this, the
// `/icon` route is treated as dynamic and the build fails with:
//   "export const dynamic = 'force-static' not configured on route '/icon'"
export const dynamic = 'force-static'

// D-18: AW monogram in Instrument Serif on parchment surface.
// D-19: Single source of truth — no `public/favicon.ico` legacy fallback.
// D-20: Color tokens sourced from src/styles/tokens.css.
//   --color-surface = oklch(97% 0.01 75) → sRGB rgb(249, 244, 238)
//   --color-text    = oklch(18% 0.01 75) → sRGB rgb(20, 17, 13)
// Satori (the Vercel/og renderer behind ImageResponse) does not yet support
// `oklch()` color values, so the inline styles use precomputed sRGB equivalents
// while the oklch source-of-truth values remain documented above.
// Path B (revision 2026-06-04): Load TTF from disk via readFile for deterministic, offline-safe builds.
const SURFACE_OKLCH = 'oklch(97% 0.01 75)' // D-20 source token (--color-surface)
const TEXT_OKLCH = 'oklch(18% 0.01 75)' // D-20 source token (--color-text)
const SURFACE_SRGB = 'rgb(249, 244, 238)' // sRGB equivalent of SURFACE_OKLCH for Satori
const TEXT_SRGB = 'rgb(20, 17, 13)' // sRGB equivalent of TEXT_OKLCH for Satori

export default async function Icon(): Promise<ImageResponse> {
  const fontPath = join(process.cwd(), 'src/app/instrument-serif-400.ttf')
  const fontData = await readFile(fontPath)

  // Reference oklch literals so they appear in the bundle/source for D-20 traceability.
  void SURFACE_OKLCH
  void TEXT_OKLCH

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: SURFACE_SRGB,
        color: TEXT_SRGB,
        fontSize: 22,
        letterSpacing: '-0.02em',
        fontFamily: 'Instrument Serif',
      }}
    >
      AW
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'Instrument Serif',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  )
}
