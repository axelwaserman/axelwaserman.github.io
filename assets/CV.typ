// ==========================================
// GLOBAL DOCUMENT CONFIGURATION & STYLES
// ==========================================

#set page(
  paper: "a4", // Standard for Europe/France
  margin: (x: 0.6in, top: 0.6in, bottom: 0.6in)
)

#set text(
  font: "Liberation Sans", // Highly readable, standard sans-serif font
  size: 10.5pt,
  fill: rgb("#111111"),
  lang: "en"
)

// Paragraph & Line spacing
#set par(justify: false, leading: 0.6em)

// Heading Styling (ATS-friendly, semantic tags)
#show heading.where(level: 1): it => block(width: 100%)[
  #v(0.6em)
  #set text(size: 13pt, weight: "bold", fill: rgb("#1a365d"))
  #it.body
  #v(-0.4em)
  #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
  #v(0.2em)
]

#show heading.where(level: 2): it => block(width: 100%)[
  #v(0.4em)
  #set text(size: 11pt, weight: "bold")
  #it.body
  #v(0.1em)
]
#show link: it => underline(text(blue, it))
// List item spacing adjustment
#set list(marker: ([•],), spacing: 0.5em)

// ==========================================
// CV CONTENT
// ==========================================

// --- CONTACT HEADER ---
#align(center)[
  #text(size: 20pt, weight: "bold")[Axel Waserman] \
  #v(0.2em)
  #text(size: 11pt, weight: "medium", fill: rgb("#4a5568"))[
    Senior Engineering Manager | Backend & Data
  ] \
  #v(0.1em)
  #text(size: 9.5pt)[
    Paris, France | Remote
    #link("mailto:axel.waserman@gmail.com")[axel.waserman\@gmail.com] | #link("https://axelwaserman.github.io")[Website] | #link("https://www.linkedin.com/in/axel-waserman-9753221a6/")[LinkedIn] | #link("https://www.github.com/axelwaserman")[Github]
  ]
]

// --- SUMMARY ---
= Professional Summary
Hands-on Senior Engineering Manager working at the intersection of product engineering, high-availability data architecture, and distributed team operations. Expert in building resilient, async-first engineering cultures where I stay off the critical path to eliminate cross-border friction and optimize delivery velocity. Proven track record of scaling critical backend systems, integrating platforms post-acquisition (Hotjar), and cultivating high-trust, high-retention teams across multiple time zones.

// --- COMPETENCIES ---
= Core Competencies & Technologies
*Engineering Leadership:* Remote & Async Team Management, Empathetic Leadership & Mentorship, High-Bar Technical Hiring, Cross-Border Team Integration, Agile Delivery, Product-Engineering Alignment. \
*Backend & Systems Architecture:* Distributed Systems, Microservices, Internal Developer Platforms, High-Availability Data Pipelines, Cloud Architecture, Self-Serve Data Systems. \
*Hands-on Tech Stack:* Python, FastAPI, PydanticAI (AI Agents/Data Validation), SQL, Cloud Data Warehouses (Snowflake, BigQuery, Redshift), ELT (dbt, Airflow), CI/CD Tooling, Git, REST & GraphQL APIs.

// --- EXPERIENCE ---
= Professional Experience

== Contentsquare (Global Digital Experience Analytics SaaS)

*Senior Engineering Manager* #h(1fr) *May 2025 – Present* \
*Engineering Manager* #h(1fr) *Jan 2024 – Apr 2025*
- Promoted to lead a newly formed, geographically distributed department of 5 Engineers following the acquisition of Hotjar. Tasked with merging distinct engineering cultures, modernizing the data backend, and delivering high-leverage data products.
- *Post-Acquisition Integration:* Successfully integrated Hotjar’s remote-first team culture into Contentsquare, standardizing async documentation frameworks and workflows across 4 time zones to eliminate cultural friction and synchronous dependencies.
- *Scaled Business-Critical Backend & Data Platform:* Architected and scaled a highly reliable system orchestrating ~10,000 data assets across a ~20TB data estate. Powering global company reporting, sales commission payouts, Product Qualified Leads (PQL) computation, and automated retention orchestrators with a zero data downtime record.
- *Built Self-Serve Systems:* Directed the hands-on development of a secure, internal API and data access system, enabling non-technical stakeholders to safely query the main data warehouse. Eliminated engineering bottlenecks and fostered an autonomous engineering environment.
- *Drove Engineering Velocity:* Revamped the team's CI/CD practices, automated testing frameworks, and deployment workflows, increasing deployment frequency by 40% and Q-o-Q initiative delivery by 20%.
- *Cultivated High-Performing, Resilient Teams:* Led full-cycle engineering hiring with a 100% probation pass rate. Maintained 100% team retention across a fully distributed team by anchoring operations in documentation, running blameless post-mortems, and fostering psychological safety.

#v(0.3em)
*Data Engineer II* #h(1fr) *Jan 2023 – Dec 2023* \
*Data Engineer I* #h(1fr) *May 2022 – Dec 2022*
- Operated as a core IC building a reliable data backend to unify internal systems across the organization.
- Designed and implemented scalable backend ELT pipelines using Python, FastAPI, and modern orchestration tooling, enabling product-led growth.
- Transitioned the engineering function to a "product-oriented" operating model, building internal tools that minimized operational dependencies for data scientists and analysts.
- Optimized legacy infrastructure (Redshift, scripted Python ETLs, cron) while actively migrating them to modern, cost-efficient cloud architectures.
- Established robust backend engineering standards by writing comprehensive unit/integration tests and implementing CI/CD pipelines from scratch.

== PwC France
*Data Engineer* #h(1fr) *Feb 2021 – Apr 2022*
- Consultant within the Data Assurance team, architecting technical solutions for enterprise clients.
- Built an end-to-end data platform from scratch (ingestion, backend transformations, cloud logic) for a global cement association.
- Acted as Co-Product Owner and full-stack engineer for internal ESG and risk assessment web applications for major banking and enterprise clients.

== Panodyssey
*Software Engineer* #h(1fr) *Mar 2020 – Aug 2020*
- Designed and implemented the core content ranking backend algorithm and built automated web-scraping pipelines, resulting in a 30% increase in user acquisition.

// --- EDUCATION ---
= Education

*ESILV (Ecole Supérieure d'Ingénieurs Léonard de Vinci)* #h(1fr) *2017 – 2021* \
Master of Engineering – Mathematics and Computer Science

*Griffith College Dublin* #h(1fr) *2020 – 2021* \
Computer Science (Study Abroad Semester)

