import 'server-only'
// This file is consumed only by Server Components at build time — never shipped to the client.

import type { Project } from '@/data/projects'
import projectsFallback from '@/data/projects.json'

const GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? 'axelwaserman'
const PER_PAGE = 100
const MAX_PAGES = 5

interface GitHubRepo {
  name: string
  description: string | null
  language: string | null
  pushed_at: string | null
  html_url: string
  homepage: string | null
  archived: boolean
  fork: boolean
  disabled: boolean
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    function isHttpUrl(raw: unknown): raw is string {
      if (typeof raw !== 'string' || raw.length === 0) return false
      try {
        const u = new URL(raw)
        return u.protocol === 'http:' || u.protocol === 'https:'
      } catch {
        return false
      }
    }

    function parseLinkNext(linkHeader: string | null): string | null {
      if (!linkHeader) return null
      for (const part of linkHeader.split(',')) {
        const m = part.match(/<([^>]+)>;\s*rel="next"/)
        if (m) return m[1]
      }
      return null
    }

    const headers = new Headers({
      Accept: 'application/vnd.github+json',
      'User-Agent': `${GITHUB_USERNAME}-website-build`,
      'X-GitHub-Api-Version': '2022-11-28',
    })

    if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.length > 0) {
      headers.set('Authorization', `Bearer ${process.env.GITHUB_TOKEN}`)
    }

    let nextUrl: string | null = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=${PER_PAGE}&type=owner&sort=pushed&direction=desc`

    const rawList: GitHubRepo[] = []
    let pageCount = 0

    while (nextUrl) {
      if (pageCount >= MAX_PAGES) {
        throw new Error(
          `fetchProjects: exceeded MAX_PAGES (${MAX_PAGES}) — implement deeper pagination if ${GITHUB_USERNAME} exceeds 500 repos`
        )
      }
      const res = await fetch(nextUrl, { headers })
      if (!res.ok) throw new Error(`GitHub API ${res.status}`)
      const body: unknown = await res.json()
      if (!Array.isArray(body)) throw new Error('GitHub API: expected array body')
      for (const entry of body) {
        if (entry === null || typeof entry !== 'object') continue
        const e = entry as Record<string, unknown>
        if (
          typeof e.name !== 'string' ||
          typeof e.html_url !== 'string' ||
          typeof e.archived !== 'boolean'
        )
          continue
        rawList.push(entry as GitHubRepo)
      }
      nextUrl = parseLinkNext(res.headers.get('link'))
      pageCount++
    }

    // Filter: keep only non-archived, non-disabled, non-fork repos (REVIEW L-14: fork filter is intentional)
    const filtered = rawList.filter(
      (r) => r.archived === false && r.disabled === false && r.fork === false
    )

    // Sort by pushed_at descending; treat null as smallest value (sorts to end)
    const sorted = filtered
      .slice()
      .sort((a, b) => (b.pushed_at ?? '').localeCompare(a.pushed_at ?? ''))

    return sorted.map((raw) => ({
      name: raw.name,
      description:
        typeof raw.description === 'string' && raw.description.length > 0
          ? raw.description
          : null,
      language:
        typeof raw.language === 'string' && raw.language.length > 0 ? raw.language : null,
      pushedAt:
        typeof raw.pushed_at === 'string' && raw.pushed_at.length > 0 ? raw.pushed_at : null,
      repoUrl: raw.html_url,
      homepage: isHttpUrl(raw.homepage) ? raw.homepage : null,
    }))
  } catch (error: unknown) {
    // eslint-disable-next-line no-console -- intentional build-time warning per CTX D-06; this code only runs during `next build`, never in the client bundle
    console.warn(
      '::warning::[projects] GitHub fetch failed, using src/data/projects.json fallback. Reason:',
      error instanceof Error ? error.name : 'unknown'
    )
    return projectsFallback as unknown as Project[]
  }
}
