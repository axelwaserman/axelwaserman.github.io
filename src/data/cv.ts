export interface WorkEntry {
  role: string
  company: string
  dates: string       // e.g. "2022 — Present"
  description: string
}

export interface EducationEntry {
  degree: string
  institution: string
  years: string       // e.g. "2018 — 2022"
}

export const bio = 'Building thoughtful software. Open to new opportunities.'

export const title = 'Software Engineer'

export const workEntries: WorkEntry[] = [
  {
    role: 'Placeholder Role',
    company: 'Placeholder Company',
    dates: '2023 — Present',
    description: 'Placeholder description — Axel fills this in before launch.',
  },
  {
    role: 'Placeholder Role',
    company: 'Placeholder Company',
    dates: '2021 — 2023',
    description: 'Placeholder description — Axel fills this in before launch.',
  },
  {
    role: 'Placeholder Role',
    company: 'Placeholder Company',
    dates: '2019 — 2021',
    description: 'Placeholder description — Axel fills this in before launch.',
  },
  {
    role: 'Placeholder Role',
    company: 'Placeholder Company',
    dates: '2017 — 2019',
    description: 'Placeholder description — Axel fills this in before launch.',
  },
]

export const educationEntries: EducationEntry[] = [
  {
    degree: 'Placeholder Degree',
    institution: 'Placeholder University',
    years: '2019 — 2023',
  },
]

export const skills: string[] = [
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'PostgreSQL',
  'Git',
  'Docker',
]
