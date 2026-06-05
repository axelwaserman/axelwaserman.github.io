'use client'

import { useEffect, useState } from 'react'
import { decodeEmail } from '@/lib/email'
import { contact, title } from '@/data/cv'

const SITE_URL = 'https://axelwaserman.github.io'

// Client-side JSON-LD injector. The Person block is injected after hydration
// so the static HTML never contains the plain email — naive scrapers and
// JS-aware-but-non-executing harvesters find nothing. JS-executing
// Schema.org consumers (Googlebot, Bingbot) still pick it up.
export default function PersonSchema() {
  const [json, setJson] = useState<string | null>(null)

  useEffect(() => {
    // setState inside an effect is intentional: the JSON-LD payload contains
    // the decoded email, which must not appear in the static HTML or the
    // SSR pre-hydration markup. We delay injection until post-mount so the
    // server-rendered output never serialises the plain address.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    setJson(
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Axel Waserman',
        email: decodeEmail(contact.emailEncoded),
        url: SITE_URL,
        jobTitle: title.split(' | ')[0],
        sameAs: [contact.github, contact.linkedin],
      }),
    )
  }, [])

  if (!json) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
