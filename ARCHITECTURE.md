# Fanzy — Architecture

Fanzy is a multi-AI-agent storyboard system for Arabic video production. It takes raw stories and produces production-ready storyboards through an immutable Fact Sheet pipeline.

## Tech Stack

| Layer | Choice | Purpose |
|-------|--------|---------|
| Runtime | Node.js + TypeScript | Backend API + agent orchestration |
| API | Express 5 | HTTP routes, webhooks |
| Database | PostgreSQL + Prisma | Projects, scripts, storyboards, fact sheets |
| Auth | Clerk | User authentication, sessions |
| Queue | BullMQ + Redis | Agent pipeline job orchestration |
| LLM | Claude API + OpenAI API | Arabic script parsing, generation, QA |
| Frontend | React 19 + Vite + Tailwind CSS 4 | Dashboard, pipeline viewer, storyboard editor |
| PDF Export | Puppeteer | Production-ready storyboard documents |
| Deployment | Railway | PostgreSQL, Redis, app container |

## Folder Structure

```
fanzy/
├── prisma/
│   └── schema.prisma         # Database schema (all models)
├── src/
│   ├── server.ts              # Express entry point
│   ├── lib/
│   │   ├── anthropic.ts       # Anthropic (Claude) client singleton
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── env.ts             # Zod-validated environment config
│   │   └── redis.ts           # Redis connection for BullMQ
│   ├── middleware/
│   │   ├── auth.ts            # Clerk auth middleware (clerkAuth + requireSignIn)
│   │   └── resolve-user.ts   # Resolves Clerk session → DB user (auto-creates on first call)
│   ├── agents/
│   │   ├── researcher.ts      # Researcher — Fact Sheet + Name Registry from raw text
│   │   ├── director-brief.ts  # Director Brief — visual tone, palette, camera style
│   │   ├── scriptwriter.ts    # Scriptwriter — narrator & storyteller personas
│   │   ├── editor.ts          # Editor — merge (best-of-2 scripts) & final polish
│   │   ├── director.ts        # Director — cinematic & news eye storyboards
│   │   ├── continuity.ts      # Continuity Checker — spatial/temporal validation
│   │   └── qa.ts              # QA — lawyer (accuracy) & viewer (audience) review
│   ├── pipeline/
│   │   ├── queues.ts          # BullMQ queue definitions (11 queues, one per agent)
│   │   ├── orchestrator.ts    # Pipeline state machine — flow control, parallel fan-out/fan-in, QA loop
│   │   ├── events.ts          # SSE event bus for real-time pipeline updates
│   │   ├── worker-utils.ts    # Shared worker lifecycle (mark running → execute → save → next)
│   │   └── workers/
│   │       ├── index.ts       # Worker registry — starts all 11 workers
│   │       ├── researcher.ts
│   │       ├── director-brief.ts
│   │       ├── scriptwriter.ts
│   │       ├── editor.ts
│   │       ├── director.ts
│   │       ├── continuity.ts
│   │       └── qa.ts
│   ├── services/
│   │   └── researcher.ts      # Legacy sync researcher (pre-pipeline)
│   ├── routes/
│   │   ├── health.ts          # GET /api/health
│   │   ├── projects.ts        # GET/POST /api/projects, GET /api/projects/:id
│   │   ├── researcher.ts      # POST /api/projects/:id/research (legacy)
│   │   └── pipeline.ts        # POST start, GET status, GET SSE events
│   ├── types/
│   │   ├── pipeline.ts        # Agent roles, parallel groups, pipeline events
│   │   ├── fact-sheet.ts      # FactSheet, NameRegistry, Timeline, Locations
│   │   ├── researcher.ts      # Researcher I/O contracts
│   │   ├── visual-brief.ts    # VisualBrief — Director Brief output
│   │   ├── script.ts          # Script — acts, scenes, dialogue, narration
│   │   ├── scene.ts           # SceneCard, Storyboard — visual direction
│   │   ├── qa-report.ts       # QAReport — issues, severity, target agent
│   │   ├── director-brief.ts  # Director Brief I/O
│   │   ├── scriptwriter.ts    # Scriptwriter I/O
│   │   ├── editor.ts          # Editor I/O (merge + final)
│   │   ├── director.ts        # Director I/O
│   │   ├── continuity.ts      # Continuity Checker I/O
│   │   └── qa.ts              # QA I/O
├── client/
│   ├── index.html             # HTML shell (RTL, Arabic fonts)
│   ├── vite.config.ts         # Vite config with API proxy
│   └── src/
│       ├── main.tsx           # React entry (ClerkProvider wraps app)
│       ├── App.tsx            # Router + auth gating (landing vs dashboard)
│       ├── index.css          # Tailwind + design tokens
│       ├── lib/
│       │   └── api.ts         # Typed fetch wrapper for API calls
│       ├── pages/
│       │   ├── ProjectsPage.tsx   # Project list + empty state
│       │   └── ProjectPage.tsx    # Project detail + researcher trigger + fact sheet
│       └── components/
│           ├── Layout.tsx         # Shared header with nav + UserButton
│           ├── StatusBadge.tsx    # Pipeline status badge (Arabic labels)
│           ├── NewProjectDialog.tsx # Modal form for creating projects
│           └── FactSheetView.tsx  # Renders facts, names, timeline, locations
├── package.json               # Backend deps + scripts
├── tsconfig.json              # Backend TypeScript config
├── .env.example               # Required environment variables
├── ARCHITECTURE.md            # This file
└── ROADMAP.md                 # Task tracking
```

## Data Models

- **User** — synced from Clerk via webhook, owns projects
- **Project** — title, source text, genre, dialect, status (tracks pipeline stage)
- **FactSheet** — immutable facts, name registry, timeline, locations (locked after Researcher)
- **VisualBrief** — Director's vision: visual style, shot preferences, location notes, pacing
- **Script** — structured acts/beats with fact references, narration, timing, visual hooks
- **Storyboard** — scenes with shot types, camera direction, B-roll, graphics, transitions
- **QAReport** — reviewer ID (lawyer/viewer), status, issues with target agent + location
- **PipelineRun** — tracks each agent's input, output, status, errors, revision round

## Agent Pipeline

**Max quality architecture — 11 agents, parallel pairs, dual QA, revision loop.**

```
Raw Story Input
    ↓
┌────────────┐
│ Researcher  │ → LOCKED Fact Sheet + Name Registry 🔒
└──────┬─────┘
       ↓
┌────────────┐
│ Director    │ → Visual Direction Brief
│ (brief)     │
└──────┬─────┘
       ↓ (Fact Sheet + Brief shared read-only to all below)
┌────────────────┐  ┌─────────────────┐
│ Scriptwriter A  │  │ Scriptwriter B   │  ← parallel, different personas
│ (Narrator)      │  │ (Storyteller)    │
└───────┬────────┘  └────────┬────────┘
        └──────┬─────────────┘
               ↓
        ┌────────────┐
        │ Editor      │ → Selects best elements, merges, polishes
        │ (merge)     │
        └──────┬─────┘
               ↓
┌────────────────┐  ┌─────────────────┐
│ Director A      │  │ Director B       │  ← parallel, different perspectives
│ (Cinematic Eye) │  │ (News Eye)       │
└───────┬────────┘  └────────┬────────┘
        └──────┬─────────────┘
               ↓
        ┌────────────────┐
        │ Continuity      │ → Merges storyboards, validates spatial/temporal logic
        │ Checker         │
        └──────┬─────────┘
               ↓
┌────────────────┐  ┌─────────────────┐
│ QA: The Lawyer  │  │ QA: The Viewer   │  ← parallel, different criteria
│ (accuracy)      │  │ (audience)       │
└───────┬────────┘  └────────┬────────┘
        └──────┬─────────────┘
               ↓
        Issues found? ──→ Yes: route corrections to specific agents
               │                    ↓
               No            Agents revise → QA re-checks (max 3 rounds)
               ↓
        ┌────────────┐
        │ Editor      │ → Final polish — unify tone, smooth revision seams
        │ (final)     │
        └──────┬─────┘
               ↓
    Production-Ready Storyboard
```

11 agents, 6 run in parallel pairs. Wall-clock time: ~65-85 seconds. Cost: ~$2 per script.

Each agent step is a BullMQ job. Pipeline state is persisted in PipelineRun records. Full research and rationale in `docs/research/multi-agent-pipeline-architecture.md`.

## Agent Implementation Pattern

Each agent follows a three-layer architecture:

| Layer | File | Responsibility |
|-------|------|----------------|
| Types | `src/types/<agent>.ts` | Zod input/output schemas |
| Agent | `src/agents/<agent>.ts` | LLM call + response parsing (pure function, no DB) |
| Worker | `src/pipeline/workers/<agent>.ts` | BullMQ job handler — gathers inputs, calls agent, saves output, triggers next step |

All agents use **Claude Sonnet 4** with structured JSON output, up to 3 retry attempts with exponential backoff.

## Pipeline API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/:id/pipeline/start` | POST | Starts the full 11-agent pipeline |
| `/api/projects/:id/pipeline/status` | GET | Returns execution status + all agent runs |
| `/api/projects/:id/pipeline/events` | GET (SSE) | Real-time event stream for pipeline progress |

## Pipeline Orchestration

The orchestrator (`src/pipeline/orchestrator.ts`) is an event-driven state machine:

1. **Sequential flow:** Each agent completion triggers the next step
2. **Parallel fan-out:** Scriptwriters, Directors, and QA agents run in pairs simultaneously
3. **Fan-in sync:** The orchestrator waits for both parallel agents to complete before proceeding
4. **QA revision loop:** If QA finds critical/major issues (up to 3 rounds), corrections route back to the earliest affected agent
5. **Persistence:** Every agent's input, output, duration, and errors are stored in `AgentRun` records

## Key Decisions

1. **Quality over cost** — the quality gap between Fanzy and a single ChatGPT prompt is the product. No compromises on agent capability.
2. **Fact Sheet is immutable** — once the Researcher signs off, no code path may modify it
3. **Name Registry uses programmatic validation** — string matching, not LLM inference
4. **Every agent has Zod input/output contracts** — structured JSON, not free text
5. **Dual agents at creative stages** — two scriptwriters, two directors, best-of-2 selection
6. **Dual QA reviewers (MARS pattern)** — The Lawyer (accuracy) + The Viewer (audience). Academically validated: independent reviewers catch more than one reviewer or open debate.
7. **All agents use Claude Sonnet 4** — no model downgrade for cost savings
8. **Custom orchestration on BullMQ** — no framework overhead (LangGraph, CrewAI rejected). Full auditability.
9. **Express 5 (not Next.js)** — server-rendered pages aren't needed; clean API + SPA separation
10. **Railway for everything** — PostgreSQL, Redis, and app container in one place
11. **Google-only auth via Clerk** — `@clerk/react` on frontend, `@clerk/express` middleware on backend

## Authentication

- **Frontend:** `@clerk/react` — `<ClerkProvider>` in `main.tsx`, `<Show>`, `<SignInButton>`, `<UserButton>` in `App.tsx`
- **Backend:** `@clerk/express` — `clerkAuth` middleware globally, `requireSignIn` on protected routes
- **Public routes:** `GET /api/health`, `GET /`
- **Protected routes:** `POST /api/projects/:id/research` (and all future agent/project routes)
- **Environment:** `VITE_CLERK_PUBLISHABLE_KEY` in `client/.env`, `CLERK_SECRET_KEY` in root `.env`

## Environment Variables

See `.env.example` for the full list. Required: `DATABASE_URL`, `REDIS_URL`, `ANTHROPIC_API_KEY`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`. Optional during dev: `OPENAI_API_KEY`.
