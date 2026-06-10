// ==========================================
// GLOBAL CONFIGURATION & BUILD FLAGS
// ==========================================

// TARGET SWITCH: Set to "pdf" for the 1-page resume, or "web" for your personal site.
// Alternatively, compile from CLI using: typst compile file.typ --input target=pdf
#let target = sys.inputs.at("target", default: "pdf")
#let is-pdf = target == "pdf"

#set page(
  paper: "a4",
  margin: (x: 0.5in, top: 0.4in, bottom: 0.4in) // Slightly optimized for 1-pagers
)

#set text(
  font: "Liberation Sans",
  size: 10.5pt,
  fill: rgb("#111111"),
  lang: "en"
)

#set par(justify: false, leading: 0.45em)

// Heading Styling
#show heading.where(level: 1): it => block(width: 100%)[
  #v(0.3em)
  #set text(size: 11.5pt, weight: "bold", fill: rgb("#1a365d"))
  #it.body
  #v(-0.60em)
  #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
  #v(0.1em)
]

#show heading.where(level: 2): it => block(width: 100%)[
  #v(-0.3em)
  #set text(size: 11pt, weight: "bold")
  #it.body
  #v(0.1em)
]
#show link: it => underline(text(blue, it))
#set list(marker: ([•],), spacing: 0.4em)

// Custom reusable style for position-level tech stacks
#let tech-stack(stack) = {
  v(-0.2em)
  text(size: 9pt, style: "italic", fill: rgb("#4a5568"))[*Tech Stack:* #stack]
  v(0.2em)
}

// ==========================================
// CV CONTENT
// ==========================================

// --- CONTACT HEADER ---
#grid(
  columns: (1fr, auto),
  align: (left + horizon, right + horizon),
  [
    #text(size: 18pt, weight: "bold")[Axel Waserman] \
    #v(0.1em)
    #text(size: 10.5pt, weight: "medium", fill: rgb("#4a5568"))[
      Senior Engineering Manager | Backend & Data
    ]
  ],
  [
    #set text(size: 9pt)
    Paris, France | Remote \
    #link("mailto:axel.waserman@gmail.com")[axel.waserman\@gmail.com] | #link("https://axelwaserman.github.io")[Website] \
    #link("https://www.linkedin.com/in/axel-waserman-9753221a6/")[LinkedIn] | #link("https://www.github.com/axelwaserman")[Github]
  ]
)
#v(0.1em)

// --- SUMMARY (Hidden in PDF) ---
#if not is-pdf [
  = Professional Summary
  Hands-on Senior Engineering Manager working at the intersection of product engineering, high-availability data architecture, and distributed team operations. Expert in building resilient, async-first engineering cultures where I stay off the critical path to eliminate cross-border friction and optimize delivery velocity. Proven track record of scaling critical backend systems, integrating platforms post-acquisition (Hotjar), and cultivating high-trust, high-retention teams across multiple time zones.
]

// --- COMPETENCIES (Hidden in PDF) ---
#if not is-pdf [
  = Core Competencies & Technologies
  *Engineering Leadership:* Remote & Async Team Management, Empathetic Leadership & Mentorship, High-Bar Technical Hiring, Cross-Border Team Integration, Agile Delivery, Product-Engineering Alignment. \
  *Backend & Systems Architecture:* Distributed Systems, Microservices, Internal Developer Platforms, High-Availability Data Pipelines, Cloud Architecture, Self-Serve Data Systems. \
  *Hands-on Tech Stack:* Python, FastAPI, PydanticAI (AI Agents/Data Validation), SQL, Cloud Data Warehouses (Snowflake, BigQuery, Redshift), ELT (dbt, Airflow), CI/CD Tooling, Git, REST & GraphQL APIs.
]

// --- EXPERIENCE ---
= Professional Experience

== Contentsquare

*Senior Engineering Manager* #h(1fr) *May 2025 – Present* \
*Engineering Manager* #h(1fr) *Jan 2024 – Apr 2025* \
#tech-stack("Python, FastAPI, Dagster, PostgreSQL, Snowflake, dbt, AWS, Terraform, Docker, GitHub Actions")

- Spearheaded a newly formed, geographically distributed department of 5 Engineers post-Hotjar acquisition — merging distinct engineering cultures, modernizing the data backend, and shipping high-leverage data products.
- *Post-Acquisition Integration:* Consolidated Hotjar’s remote-first practices into Contentsquare by standardizing async documentation frameworks across 4 time zones, eliminating synchronous dependencies and cultural friction.
- *Scaled Business-Critical Backend & Data Platform:* Architected and scaled a zero-downtime system orchestrating ~10,000 data assets across a ~20TB estate — powering global reporting, sales commission payouts, PQL computation, and automated retention orchestrators.
- *Built Self-Serve Systems:* Shipped a secure internal API and data access layer enabling non-technical stakeholders to safely self-serve the main data warehouse, eliminating engineering bottlenecks.
- *Drove Engineering Velocity:* Overhauled CI/CD practices, automated testing frameworks, and deployment workflows — increasing deployment frequency by 40% and Q-o-Q initiative delivery by 20%.
- *Cultivated High-Performing, Resilient Teams:* Hired with a 100% probation pass rate; maintained 100% retention across a fully distributed team through documentation-first operations, blameless post-mortems, and psychological safety.

#v(0.2em)
*Data Engineer II* #h(1fr) *Jan 2023 – Dec 2023* \
*Data Engineer I* #h(1fr) *May 2022 – Dec 2022* \

- Built the reliable data backend underpinning internal system unification — designed and shipped scalable ELT pipelines in Python and FastAPI that enabled product-led growth across the organization.
- Established a product-oriented engineering operating model, delivering internal tooling that eliminated data scientist and analyst dependencies on the engineering team.
- Migrated legacy infrastructure (Redshift, scripted ETLs, cron) to modern, cost-efficient cloud architectures, reducing operational overhead and improving pipeline reliability.
- Instituted engineering standards from scratch: comprehensive unit/integration test suites and CI/CD pipelines across all backend services.

== PwC France
*Data Engineer* #h(1fr) *Feb 2021 – Apr 2022* \
#tech-stack("Python, SQL, Azure, PostgreSQL, React")

- Consultant within the Data Assurance team, architecting technical solutions for enterprise clients.
- Built an end-to-end data platform from scratch (ingestion, backend transformations, cloud logic) for a global cement association.
- Acted as Co-Product Owner and full-stack engineer for internal ESG and risk assessment web applications for major banking and enterprise clients.

== Panodyssey
*Software Engineer* #h(1fr) *Mar 2020 – Aug 2020* \
#tech-stack("Python, Beautiful Soup, Scrapy, Node.js, Linux")

- Designed and implemented the core content ranking backend algorithm and built automated web-scraping pipelines, resulting in a 30% increase in user acquisition.

// --- EDUCATION ---
= Education

*ESILV (Ecole Supérieure d'Ingénieurs Léonard de Vinci)* #h(1fr) *2017 – 2021* \
Master of Engineering – Mathematics and Computer Science

*Griffith College Dublin* #h(1fr) *2020 – 2021* \
Computer Science (Study Abroad Semester)