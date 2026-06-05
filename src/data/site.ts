// Centralised site-level constants. Mirrors src/data/cv.ts: named exports only,
// no default export, no runtime computation — values are plain literals.

// PLACEHOLDER: replace `PLACEHOLDER_FORM_ID` with the real Formspree form ID
// (Axel provisions this on Formspree; see plan 06-06's user-action checkpoint, D-04).
// The endpoint is a public URL, not a secret — safe to commit (D-01).
export const FORMSPREE_ENDPOINT: string = 'https://formspree.io/f/PLACEHOLDER_FORM_ID'
