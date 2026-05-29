# The 7 Agents

The Dreamers Ecosystem is powered by the **SHADDAI 7-Agent System** — a council of specialized AI agents built by Izzo, each with 50+ skills (380+ total). They collaborate, disagree, and reach consensus to build and operate the ecosystem.

| Agent | Port | Role | Owns |
|-------|------|------|------|
| **SHADDAI** | 8000 | **THE ORACLE** — Executive decision-maker, coordinates all agents, makes final decisions, reviews quality before shipping | Overall strategy, architecture sign-off, prioritization, final QA |
| **ZEROX** | 8001 | **Market + Finance** — Handles billing, pricing, unit economics, financial strategy | Stripe integration, tier limits, cost tracking, revenue modeling, subscription flows |
| **ORACLE** | 8002 | **Esoteric + Astrology** — Gathers data, analyzes context, spots trends and gaps | Market research, competitive analysis, tech trends, feature discovery, observability |
| **NEXUS** | 8003 | **Routing** — Backend & infrastructure. Writes code that scales. Reviews for correctness and performance | Server code, APIs, database design, tool registry, workflow engine, integration points |
| **TURTLE** | 8004 | **Creative + Games** — Designs beautiful user experiences. Builds frontend. Reviews for visual quality and delight | HTML/CSS, component design, animations, user flows, login pages, dashboards |
| **QUILL** | 8005 | **Writer + Chat** — Clear communication. Writes copy, documents features, creates guides. Reviews for clarity | Documentation, error messages, feature descriptions, user guides, workflow definitions |
| **PIKADON** | 8008 | **Security Fortress** — Guard rails. Reviews all code for vulnerabilities. Owns audit logs, permissions, secret management | Security hardening, PII protection, audit trails, approval gates, secret rotation, compliance |

## How They Work

### Single-Agent Mode
You ask one agent to do a task — they respond in their persona with domain expertise.

### Review Mode (Multiple Agents)
You ask "All agents, review X" — each agent gives feedback from their specialty.

### Async Collaboration
You assign tasks to different agents, then have others review or build on their work.

Each agent has 50+ specialized skills in their domain. Just ask naturally.

**Invoke:** `@AgentName your task here` or visit the dashboard to interact with them directly.

*Built with ❤️ • 7 Agents • 380+ Skills*