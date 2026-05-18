---
phase: 01-foundation
reviewed: 2026-05-18T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - .gitignore
  - .prettierrc
  - eslint.config.mjs
  - next.config.ts
  - package.json
  - postcss.config.mjs
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/styles/tokens.css
  - tsconfig.json
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-05-18T00:00:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Foundation scaffolding for a Next.js 16 static-export personal website. The configuration is clean and minimal overall. One critical defect exists: the `start` script in `package.json` is incompatible with the chosen `output: 'export'` mode and will throw a runtime error. Two warnings address a `.gitignore` gap (non-`*.local` env files slip through) and missing build tools classification in dependencies. Two additional warnings address missing GitHub Pages routing config and incomplete ESLint setup. Info items cover missing Open Graph metadata and spacing/animation design tokens.

---

## Critical Issues

### CR-01: `next start` is incompatible with `output: 'export'`

**File:** `package.json:9`
**Issue:** The `"start": "next start"` script is present but Next.js explicitly errors when `next start` is invoked on a project configured with `output: 'export'`. The static export produces files in `out/`, which must be served by a static file server — not by `next start`. Any developer or CI step that runs `npm start` will get a hard error, which is confusing and misleading.

Next.js docs state: _"You cannot use `next start` if you use `output: 'export'`."_

**Fix:**
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "serve": "npx serve out",
  "lint": "next lint",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

Remove the `start` script entirely, or replace it with a command that actually works (e.g., `serve`, `http-server`, or `python3 -m http.server 3000 -d out`). The `serve` package requires no install if used with `npx`.

---

## Warnings

### WR-01: `.gitignore` does not cover `.env.production` and other non-local env files

**File:** `.gitignore:24-25`
**Issue:** The current patterns are `.env*.local` and `.env`. The pattern `.env*.local` only matches files that end in `.local` (e.g., `.env.local`, `.env.development.local`). Files such as `.env.production`, `.env.staging`, and `.env.test` do NOT match either pattern and would be committed to the repository if they existed. For a GitHub Pages project that may store a `GITHUB_TOKEN` in an env file during local development, this is a meaningful exposure risk.

**Fix:**
```gitignore
# Local env files
.env
.env.*
```

The pattern `.env.*` covers all variants (`.env.production`, `.env.staging`, `.env.local`, `.env.development.local`, etc.). The bare `.env` covers the root file.

---

### WR-02: Build tools classified as runtime dependencies

**File:** `package.json:15-21`
**Issue:** `tailwindcss` and `@tailwindcss/postcss` are listed under `dependencies` rather than `devDependencies`. These are build-time tools — they are not needed at runtime. While this has no effect for a GitHub Pages static deploy (the deployment ships pre-built files, not a Node.js runtime), it incorrectly signals that these packages are runtime requirements, misleads `npm audit` severity scoping, and inflates the install footprint for any environment that does `npm install --omit=dev`.

**Fix:**
Move `tailwindcss` and `@tailwindcss/postcss` to `devDependencies`:
```json
"dependencies": {
  "clsx": "^2.1.1",
  "next": "^16.2.6",
  "react": "^19.2.6",
  "react-dom": "^19.2.6",
  "tailwind-merge": "^3.6.0"
},
"devDependencies": {
  "@eslint/eslintrc": "^3.3.5",
  "@tailwindcss/postcss": "^4.3.0",
  "@types/node": "^25.9.0",
  "@types/react": "^19.2.14",
  "@types/react-dom": "^19.2.3",
  "eslint": "^9.39.4",
  "eslint-config-next": "^16.2.6",
  "prettier": "^3.8.3",
  "tailwindcss": "^4.3.0",
  "typescript": "^6.0.3"
}
```

---

### WR-03: Missing `trailingSlash: true` in Next.js config for GitHub Pages routing

**File:** `next.config.ts:3-8`
**Issue:** GitHub Pages serves files from a flat directory. When `output: 'export'` generates a page like `/about`, it creates `out/about.html`. Without `trailingSlash: true`, Next.js generates `out/about.html` and internal `<Link>` components use `/about`. GitHub Pages will 404 on `/about` because there is no directory-based `index.html` at that path — it only serves `/about.html` if accessed directly. With `trailingSlash: true`, Next.js generates `out/about/index.html` and links use `/about/`, which GitHub Pages resolves correctly.

For a single-page site with no sub-routes this is currently benign, but the project plan includes multiple sections (CV, projects, contact). Once any navigation or anchor routing is added, this gap will surface.

**Fix:**
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}
```

---

## Info

### IN-01: ESLint config does not include TypeScript-aware rules

**File:** `eslint.config.mjs:12-14`
**Issue:** The ESLint config extends only `next/core-web-vitals`. This omits `@typescript-eslint/recommended` or equivalent strict TypeScript rules. Without these, ESLint will not catch `any` usage, unsafe type assertions, missing return types on exported functions, or unhandled promise values — all patterns the project's TypeScript coding style rules explicitly prohibit.

**Fix:**
Add TypeScript ESLint rules:
```javascript
const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
]
```

`eslint-config-next` ships with a bundled `next/typescript` config that enables `@typescript-eslint/recommended` without additional dependencies.

---

### IN-02: Metadata lacks Open Graph and Twitter card tags

**File:** `src/app/layout.tsx:19-22`
**Issue:** The `metadata` export defines only `title` and `description`. For a portfolio/CV site shared on LinkedIn, Twitter, or via direct links, the absence of Open Graph (`og:image`, `og:type`, `og:url`) and Twitter card metadata means link previews will be unstyled or absent. This undermines the "recruiter lands on this" core value stated in `CLAUDE.md`.

**Fix:**
```typescript
export const metadata: Metadata = {
  title: 'Axel W — Software Engineer',
  description: 'Software engineer — portfolio and CV',
  openGraph: {
    title: 'Axel W — Software Engineer',
    description: 'Software engineer — portfolio and CV',
    type: 'website',
    url: 'https://<your-username>.github.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axel W — Software Engineer',
    description: 'Software engineer — portfolio and CV',
  },
}
```

---

_Reviewed: 2026-05-18T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
