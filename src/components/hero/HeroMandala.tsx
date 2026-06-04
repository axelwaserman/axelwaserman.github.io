'use client'

import { useEffect, useRef, useState } from 'react'
import { pickRandomPair, type MandalaPair } from '@/lib/mandala'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import MandalaSVG from './MandalaSVG'
import HeroMandalaControls from './HeroMandalaControls'

const N_MIN = 3
const N_MAX = 500
const K_MIN = 1
const ROTATION_DEG_PER_PX = 0.125

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}

export default function HeroMandala() {
  const reduced = useReducedMotion()
  const [currentPair, setCurrentPair] = useState<MandalaPair>(() => pickRandomPair())
  const containerRef = useRef<HTMLDivElement>(null)
  const svgWrapperRef = useRef<HTMLDivElement>(null)

  // Effect 1: scroll-driven rotation (rAF + passive listener)
  useEffect(() => {
    const wrapper = svgWrapperRef.current
    if (!wrapper) return

    if (reduced) {
      wrapper.style.transform = 'rotate(0deg)'
      wrapper.style.willChange = ''
      return
    }

    let latestScrollY = window.scrollY
    let rafId = 0
    let stopped = false

    const onScroll = () => {
      latestScrollY = window.scrollY
    }

    const tick = () => {
      if (stopped) return
      const degrees = latestScrollY * ROTATION_DEG_PER_PX
      wrapper.style.transform = `rotate(${degrees}deg)`
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    rafId = requestAnimationFrame(tick)

    return () => {
      stopped = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
    }
  }, [reduced])

  // Effect 2: IntersectionObserver — toggle will-change while in view + reset pair on scroll-out
  useEffect(() => {
    const container = containerRef.current
    const wrapper = svgWrapperRef.current
    if (!container || !wrapper) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reduced) {
            wrapper.style.willChange = 'transform'
          }
        } else {
          wrapper.style.willChange = ''
          setCurrentPair((previous) => pickRandomPair(previous))
        }
      },
      { threshold: 0 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [reduced, currentPair])

  const { n, k } = currentPair

  const handleChangeN = (next: number) => {
    const clampedN = clamp(next, N_MIN, N_MAX)
    setCurrentPair((previous) => {
      const nextK = previous.k > clampedN - 1 ? clampedN - 1 : previous.k
      return { n: clampedN, k: clamp(nextK, K_MIN, clampedN - 1) }
    })
  }

  const handleChangeK = (next: number) => {
    setCurrentPair((previous) => ({
      ...previous,
      k: clamp(next, K_MIN, previous.n - 1),
    }))
  }

  const handleRefresh = () => {
    setCurrentPair((previous) => pickRandomPair(previous))
  }

  return (
    <div ref={containerRef} className="w-full">
      <div
        ref={svgWrapperRef}
        className="aspect-square mx-auto"
        style={{
          transformOrigin: '50% 50%',
          maxWidth: 'min(50vw, 600px)',
        }}
      >
        <MandalaSVG n={n} k={k} />
      </div>
      <HeroMandalaControls
        n={n}
        k={k}
        onChangeN={handleChangeN}
        onChangeK={handleChangeK}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
