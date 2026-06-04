export interface WorkEntry {
  role: string
  company: string
  dates: string       // e.g. "May 2025 — Present"
  description: string
  bullets: string[]
}

export interface EducationEntry {
  degree: string
  institution: string
  years: string       // e.g. "2017 — 2021"
}

export interface SkillGroup {
  category: string
  items: string[]
}

export interface Contact {
  github: string
  linkedin: string
  email: string
}

export const bio: string =
  'Senior Engineering Manager working at the intersection of product engineering, high-availability data architecture, and distributed operations — building resilient, async-first engineering cultures across time zones.'

export const title: string = 'Senior Engineering Manager | Backend & Data'

export const contact: Contact = {
  github: 'https://github.com/axelwaserman',
  linkedin: 'https://www.linkedin.com/in/axel-waserman-9753221a6/',
  email: 'axel.waserman@gmail.com',
}

export const workEntries: WorkEntry[] = [
  {
    role: 'Senior Engineering Manager',
    company: 'Contentsquare',
    dates: 'May 2025 — Present',
    description:
      'Promoted to lead a newly formed, geographically distributed department of 5 Engineers following the acquisition of Hotjar. Tasked with merging distinct engineering cultures, modernizing the data backend, and delivering high-leverage data products.',
    bullets: [
      'Post-Acquisition Integration: Successfully integrated Hotjar’s remote-first team culture into Contentsquare, standardizing async documentation frameworks and workflows across 4 time zones to eliminate cultural friction and synchronous dependencies.',
      'Scaled Business-Critical Backend & Data Platform: Architected and scaled a highly reliable system orchestrating ~10,000 data assets across a ~20TB data estate. Powering global company reporting, sales commission payouts, Product Qualified Leads (PQL) computation, and automated retention orchestrators with a zero data downtime record.',
      'Built Self-Serve Systems: Directed the hands-on development of a secure, internal API and data access system, enabling non-technical stakeholders to safely query the main data warehouse. Eliminated engineering bottlenecks and fostered an autonomous engineering environment.',
      'Drove Engineering Velocity: Revamped the team\'s CI/CD practices, automated testing frameworks, and deployment workflows, increasing deployment frequency by 40% and Q-o-Q initiative delivery by 20%.',
      'Cultivated High-Performing, Resilient Teams: Led full-cycle engineering hiring with a 100% probation pass rate. Maintained 100% team retention across a fully distributed team by anchoring operations in documentation, running blameless post-mortems, and fostering psychological safety.',
    ],
  },
  {
    role: 'Engineering Manager',
    company: 'Contentsquare',
    dates: 'Jan 2024 — Apr 2025',
    description:
      'Promoted to lead a newly formed, geographically distributed department of 5 Engineers following the acquisition of Hotjar. Tasked with merging distinct engineering cultures, modernizing the data backend, and delivering high-leverage data products.',
    bullets: [],
  },
  {
    role: 'Data Engineer II',
    company: 'Contentsquare',
    dates: 'Jan 2023 — Dec 2023',
    description:
      'Operated as a core IC building a reliable data backend to unify internal systems across the organization.',
    bullets: [
      'Designed and implemented scalable backend ELT pipelines using Python, FastAPI, and modern orchestration tooling, enabling product-led growth.',
      'Transitioned the engineering function to a "product-oriented" operating model, building internal tools that minimized operational dependencies for data scientists and analysts.',
      'Optimized legacy infrastructure (Redshift, scripted Python ETLs, cron) while actively migrating them to modern, cost-efficient cloud architectures.',
      'Established robust backend engineering standards by writing comprehensive unit/integration tests and implementing CI/CD pipelines from scratch.',
    ],
  },
  {
    role: 'Data Engineer I',
    company: 'Contentsquare',
    dates: 'May 2022 — Dec 2022',
    description:
      'Operated as a core IC building a reliable data backend to unify internal systems across the organization.',
    bullets: [],
  },
  {
    role: 'Data Engineer',
    company: 'PwC France',
    dates: 'Feb 2021 — Apr 2022',
    description:
      'Consultant within the Data Assurance team, architecting technical solutions for enterprise clients.',
    bullets: [
      'Built an end-to-end data platform from scratch (ingestion, backend transformations, cloud logic) for a global cement association.',
      'Acted as Co-Product Owner and full-stack engineer for internal ESG and risk assessment web applications for major banking and enterprise clients.',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'Panodyssey',
    dates: 'Mar 2020 — Aug 2020',
    description: '',
    bullets: [
      'Designed and implemented the core content ranking backend algorithm and built automated web-scraping pipelines, resulting in a 30% increase in user acquisition.',
    ],
  },
]

export const educationEntries: EducationEntry[] = [
  {
    degree: 'Master of Engineering — Mathematics and Computer Science',
    institution: 'ESILV (Ecole Supérieure d\'Ingénieurs Léonard de Vinci)',
    years: '2017 — 2021',
  },
  {
    degree: 'Computer Science (Study Abroad Semester)',
    institution: 'Griffith College Dublin',
    years: '2020 — 2021',
  },
]

export const skillGroups: SkillGroup[] = [
  {
    category: 'Engineering Leadership',
    items: [
      'Remote & Async Team Management',
      'Empathetic Leadership & Mentorship',
      'High-Bar Technical Hiring',
      'Cross-Border Team Integration',
      'Agile Delivery',
      'Product-Engineering Alignment',
    ],
  },
  {
    category: 'Backend & Systems Architecture',
    items: [
      'Distributed Systems',
      'Microservices',
      'Internal Developer Platforms',
      'High-Availability Data Pipelines',
      'Cloud Architecture',
      'Self-Serve Data Systems',
    ],
  },
  {
    category: 'Hands-on Tech Stack',
    items: [
      'Python',
      'FastAPI',
      'PydanticAI (AI Agents/Data Validation)',
      'SQL',
      'Cloud Data Warehouses (Snowflake, BigQuery, Redshift)',
      'ELT (dbt, Airflow)',
      'CI/CD Tooling',
      'Git',
      'REST & GraphQL APIs',
    ],
  },
]
