// PHIL-02 verbatim copy — pending user approval at phase verification

export interface Pillar {
  id: string
  title: string
  body: string
}

export const PILLARS: readonly Pillar[] = [
  {
    id: 'documentation-first',
    title: 'Documentation First',
    body: 'Async-first engineering is built on writing. Before code, before standups, before status updates, the decision lives in a document — context, options, trade-offs, and the call you actually made. Documents persist; meetings evaporate. A team that writes can scale across time zones, hand work over without re-explaining it, and onboard new engineers without burning a senior to do it. I default to drafting before discussing.',
  },
  {
    id: 'high-agency-iteration',
    title: 'High Agency & Iteration',
    body: 'High agency means engineers move work forward without waiting for permission, escalation, or perfect information. They ship a small slice, watch what breaks, and iterate from real signal rather than imagined risk. The job of the manager is to make that safe — to set the boundary clearly enough that experimentation inside it is encouraged. Slow, consensus-heavy organisations look prudent and are not; they pay for caution in cycle time.',
  },
  {
    id: 'metrics-over-activity',
    title: 'Metrics over Activity',
    body: 'A busy team is not a productive team. Hours logged, tickets closed, and standups attended measure motion, not outcome. I anchor teams to a small number of metrics that actually reflect customer or system value — latency, retention, error budget, time-to-recover — and treat everything else as instrumentation. When activity diverges from outcome, the activity is wrong, not the metric.',
  },
] as const
