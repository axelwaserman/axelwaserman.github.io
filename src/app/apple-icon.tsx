import { ImageResponse } from 'next/og'
import { generateMandala, seedFromCommit } from '@/lib/mandala'

// BRAND-01: 180x180 apple-touch icon — same seeded mandala generator as
// src/app/icon.tsx, scaled up. Same commit SHA → same mandala family across
// favicon and apple-touch icon, so iOS home-screen and browser tab share a
// consistent visual identity per build.
//
// Static-export compatible: `dynamic = 'force-static'` runs at build time only.

export const size = { width: 180, height: 180 } as const
export const contentType = 'image/png' as const
export const dynamic = 'force-static'

// D-20 traceability — see src/app/icon.tsx for the full token mapping.
const SURFACE_OKLCH = 'oklch(97% 0.01 75)'
const SURFACE_SRGB = 'rgb(249, 244, 238)'

export default async function AppleIcon(): Promise<ImageResponse> {
  void SURFACE_OKLCH

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
