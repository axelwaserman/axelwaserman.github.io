export interface ProjectPSI {
  problem: string
  solution: string
  impact: string
}

export interface Project {
  name: string
  description: string | null
  language: string | null
  pushedAt: string | null
  repoUrl: string
  homepage: string | null
  psi?: ProjectPSI
}
