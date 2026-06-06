import { ImageResponse } from 'next/og'
import { generateMandala, seedFromCommit } from '@/lib/mandala'

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

// BRAND-01: seeded mandala from commit SHA (replaces the AW monogram, D-18).
// D-19: Single source of truth — no `public/favicon.ico` legacy fallback.
// D-20: Color tokens sourced from src/styles/tokens.css.
//   --color-surface = oklch(97% 0.01 75) → sRGB rgb(249, 244, 238)
//   --color-text    = oklch(18% 0.01 75) → sRGB rgb(20, 17, 13)
//   --color-accent  = oklch(62% 0.19 55) → sRGB rgb(214, 99, 47)
// Satori (the Vercel/og renderer behind ImageResponse) does not yet support
// `oklch()` color values, so the mandala generator emits precomputed sRGB
// equivalents while the oklch source-of-truth values remain documented above.
const SURFACE_OKLCH = 'oklch(97% 0.01 75)' // D-20 source token (--color-surface)
const TEXT_OKLCH = 'oklch(18% 0.01 75)' // D-20 source token (--color-text)
const ACCENT_OKLCH = 'oklch(62% 0.19 55)' // D-20 source token (--color-accent)
const SURFACE_SRGB = 'rgb(249, 244, 238)' // sRGB equivalent of SURFACE_OKLCH for Satori

export default async function Icon(): Promise<ImageResponse> {
  // Reference oklch literals so they appear in the bundle/source for D-20 traceability.
  void SURFACE_OKLCH
  void TEXT_OKLCH
  void ACCENT_OKLCH

  const seed = seedFromCommit()
  const { children: mandala } = generateMandala(seed, size.width)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: SURFACE_SRGB,
        }}
      >
        {mandala}
      </div>
    ),
    {
      ...size,
    },
  )
}
