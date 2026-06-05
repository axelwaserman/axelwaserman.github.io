// Email obfuscation utilities — anti-harvest layer.
//
// The literal email address must NOT appear anywhere in the static HTML or
// the bundled JS in plain form. Source modules store the base64-encoded
// representation and call decodeEmail() at the render boundary on the
// client, so naive scrapers (no JS execution) and JS-aware scrapers that
// don't run effects find nothing to harvest.

export const EMAIL_ENCODED = 'YXhlbC53YXNlcm1hbkBnbWFpbC5jb20='

export function decodeEmail(encoded: string): string {
  return atob(encoded)
}
