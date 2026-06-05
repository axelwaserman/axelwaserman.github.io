// Contact form validation schema — single source of truth for both client-side
// runtime validation (via react-hook-form's zodResolver) and the TypeScript
// form-values type (via z.infer). Keep this file pure data: no React imports,
// no fetch, no side effects, so it can be imported by both ContactForm and tests.
//
// Field set per Phase 6 D-05 / D-08 / D-09 (06-CONTEXT.md):
//   - name      required, ≤ 100
//   - email     required, valid email, ≤ 254 (RFC 5321 max)
//   - company   optional, ≤ 200
//   - message   required, ≤ 5000
//
// `.trim()` runs before `.min()` / `.max()` so leading/trailing whitespace
// cannot bypass length caps or sneak past required-field checks.

import { z } from 'zod'

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Please enter your name' })
    .max(100, { message: 'Name can be at most 100 characters' }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Please enter a valid email' })
    .max(254, { message: 'Email can be at most 254 characters' }),
  company: z
    .string()
    .trim()
    .max(200, { message: 'Company can be at most 200 characters' })
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(1, { message: 'Please enter a message' })
    .max(5000, { message: 'Message can be at most 5000 characters' }),
})

export type ContactFormValues = z.infer<typeof contactSchema>
