import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/header/Header'

export const metadata: Metadata = {
  title: 'Thanks — Axel Waserman',
  robots: { index: false, follow: false },
}

export default function ThanksPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-[var(--space-section)] text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-[length:var(--text-heading)] text-[var(--color-text)]">
          Thanks — message received.
        </h1>
        <p className="mt-6 text-[length:var(--text-body)] text-[var(--color-text)]">
          I read every message and will reply soon.
        </p>
        <p className="mt-10">
          <Link
            href="/"
            className="text-[length:var(--text-body)] text-[var(--color-accent)] underline-offset-4 hover:underline focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2"
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </>
  )
}
