'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 h-16 px-6 flex items-center justify-between',
        'transition-colors duration-300',
        scrolled ? 'bg-[var(--color-surface)] shadow-sm' : 'bg-transparent',
      )}
    >
      <a
        href="#hero"
        className="font-[var(--font-heading)] text-[length:var(--text-body)] font-semibold text-[var(--color-text)] no-underline"
      >
        Axel W
      </a>
      <nav aria-label="Main navigation" className="hidden sm:flex gap-8">
        <a
          href="#hero"
          className="text-[var(--color-text)] no-underline hover:text-[var(--color-accent)] hover:underline focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2"
        >
          About
        </a>
        <a
          href="#cv"
          className="text-[var(--color-text)] no-underline hover:text-[var(--color-accent)] hover:underline focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2"
        >
          CV
        </a>
        <a
          href="#philosophy"
          className="text-[var(--color-text)] no-underline hover:text-[var(--color-accent)] hover:underline focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2"
        >
          Philosophy
        </a>
        <a
          href="#projects"
          className="text-[var(--color-text)] no-underline hover:text-[var(--color-accent)] hover:underline focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2"
        >
          Projects
        </a>
        <a
          href="#contact"
          className="text-[var(--color-text)] no-underline hover:text-[var(--color-accent)] hover:underline focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2"
        >
          Contact
        </a>
      </nav>
    </header>
  )
}
