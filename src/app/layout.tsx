import type { Metadata } from 'next'
import { Sora, Instrument_Serif } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Axel Waserman — Senior Engineering Manager',
  description: 'Software engineer — portfolio and CV',
  metadataBase: new URL('https://axelwaserman.github.io'),
  openGraph: {
    title: 'Axel Waserman — Senior Engineering Manager',
    description: 'Software engineer — portfolio and CV',
    url: 'https://axelwaserman.github.io',
    siteName: 'Axel Waserman',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Axel Waserman — Senior Engineering Manager',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axel Waserman — Senior Engineering Manager',
    description: 'Software engineer — portfolio and CV',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
