import type { ProjectPSI } from './projects'

export const psiOverrides: Record<string, ProjectPSI> = {
  'axelwaserman.github.io': {
    problem:
      'Recruiters and collaborators had no single place to understand who Axel is, what he has built, or how to reach him — contact was fragmented across LinkedIn, GitHub, and a static CV PDF.',
    solution:
      'Built a statically-exported Next.js site with a structured CV section, a live GitHub projects feed rebuilt daily via GitHub Actions, and a Formspree-backed contact form — zero runtime servers required.',
    impact:
      'Ships in under 90 seconds end-to-end on every push; projects data stays fresh within 24 hours automatically; recruiter can read bio, scan work history, and send a message without leaving the page.',
  },
  trip_planner: {
    problem:
      'Planning a multi-stop trip requires juggling dozens of browser tabs, manually cross-referencing availability, and re-entering the same context every time a constraint changes.',
    solution:
      'Containerized AI agent system built on PydanticAI and FastAPI: a multi-step LLM tool-calling pipeline streams reasoning steps to a React frontend via SSE, with isolated Ollama/LM Studio integration and full conversation state persistence.',
    impact:
      'Reduces itinerary drafting from hours of manual research to a single streamed conversation; agent architecture handles 5+ concurrent tool calls per turn with no blocking UI.',
  },
  work_assistant: {
    problem:
      'Slack messages, emails, Jira tickets, GitHub notifications, and calendar events all demand action — but live in silos, forcing constant context-switching to triage and create follow-up tasks or documents.',
    solution:
      'Local-first agentic productivity system that connects to 6 input channels (Slack, email, Jira, GitHub, Todoist, calendar) and surfaces a single action queue — creating Todoist tasks, meeting invites, and documents autonomously from natural-language commands.',
    impact:
      'Consolidates 6 tools into 1 daily workflow; eliminates manual copy-paste between inboxes and task managers; designed to handle 100% of routine triage actions without opening a browser.',
  },
  iceberg_sandbox: {
    problem:
      'Experimenting with Apache Iceberg table format requires non-trivial local infrastructure setup, making it slow to validate schema evolution, time-travel queries, and partitioning strategies.',
    solution:
      'Dockerised sandbox environment with a pre-wired Iceberg + Spark stack provisioned via Make and Shell scripts — spin up a fully functional lakehouse in one command.',
    impact:
      'Cuts environment setup from hours to under 2 minutes; enables rapid iteration on Iceberg features (time travel, partition evolution, schema changes) without cloud costs.',
  },
}
