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
│   │   └── auth.ts            # Clerk auth middleware (clerkAuth + requireSignIn)
│   ├── agents/
│   │   └── researcher.ts      # Researcher agent — Claude prompt + FactSheet extraction
│   ├── services/
│   │   └── researcher.ts      # Researcher orchestration — pipeline tracking + persistence
│   ├── routes/
│   │   ├── health.ts              # Health check endpoint
│   │   ├── researcher.ts          # POST /api/projects/:id/research
│   │   └── creator-profiles.ts    # CRUD /api/creator-profiles
│   ├── types/
│   │   ├── fact-sheet.ts          # Zod schemas for FactSheet, NameRegistry, Timeline, Locations
│   │   ├── creator-profile.ts     # Creator Profile schemas (dialect, format, flow, QA rules)
│   │   └── researcher.ts          # Researcher input/output contracts
│   └── workers/               # BullMQ job workers (agent steps)
├── client/
│   ├── index.html             # HTML shell (RTL, Arabic fonts)
│   ├── vite.config.ts         # Vite config with API proxy
│   └── src/
│       ├── main.tsx           # React entry (ClerkProvider wraps app)
│       ├── App.tsx            # Root component (sign-in / signed-in views)
│       └── index.css          # Tailwind + design tokens
├── package.json               # Backend deps + scripts
├── tsconfig.json              # Backend TypeScript config
├── .env.example               # Required environment variables
├── ARCHITECTURE.md            # This file
└── ROADMAP.md                 # Task tracking
```

## Data Models

- **User** — synced from Clerk via webhook, owns projects and creator profiles
- **CreatorProfile** — per-creator style definition: dialect, tone, narrator role, script format template, dialogue rules, narrative flow, QA rules. Linked to User. Projects optionally reference a profile. Read-only during pipeline runs (like the Fact Sheet).
- **Project** — title, source text, genre, dialect, status (tracks pipeline stage), optional `creatorProfileId`
- **FactSheet** — immutable facts, name registry, timeline, locations (locked after Researcher)
- **Script** — structured acts/beats with fact references, narration, timing
- **Storyboard** — scenes with shot types, camera direction, B-roll, transitions
- **PipelineRun** — tracks each agent's input, output, status, errors

## Agent Pipeline

```
Raw Story Input
    ↓
┌──────────┐
│ Researcher│ → Produces LOCKED Fact Sheet + Name Registry
└────┬─────┘
     ↓  (Fact Sheet passed read-only to all below)
┌──────────────┐
│ Scriptwriter  │ → Structured script with fact references
└──────┬───────┘
       ↓
┌──────────┐
│ Editor    │ → Polished script (can't change facts)
└────┬─────┘
     ↓
┌──────────┐
│ Director  │ → Visual storyboard (shot types, B-roll, camera)
└────┬─────┘
     ↓
┌──────────┐
│ QA        │ → Cross-references ALL output against Fact Sheet
└────┬─────┘
     ↓
Production-Ready Storyboard
```

Each agent step is a BullMQ job. Pipeline state is persisted in PipelineRun records.

## Agent Implementation Pattern

Each agent follows a three-layer architecture:

| Layer | File | Responsibility |
|-------|------|----------------|
| Types | `src/types/<agent>.ts` | Zod input/output schemas |
| Agent | `src/agents/<agent>.ts` | LLM call + response parsing (pure function, no DB) |
| Service | `src/services/<agent>.ts` | Orchestration: PipelineRun tracking, DB persistence, status updates |

**Researcher agent** (implemented):
- **Input:** Project's `sourceText`, optional `genre` and `dialect`
- **Output:** Validated `FactSheet` (facts, nameRegistry, timeline, locations)
- **LLM:** Claude (claude-sonnet-4-20250514) with structured JSON output
- **Endpoint:** `POST /api/projects/:id/research`
- **Immutability:** Once a FactSheet is created, the service rejects re-research (HTTP 409)
- **Error handling:** Retries up to 3 attempts with exponential backoff; failures update PipelineRun and project status

## Key Decisions

1. **Fact Sheet is immutable** — once the Researcher signs off, no code path may modify it
2. **Name Registry uses programmatic validation** — string matching, not LLM inference
3. **Every agent has Zod input/output contracts** — structured JSON, not free text
4. **Express 5 (not Next.js)** — server-rendered pages aren't needed; clean API + SPA separation
5. **Railway for everything** — PostgreSQL, Redis, and app container in one place
6. **IBM Plex Sans Arabic** — primary font, designed for Arabic readability
7. **RTL-first frontend** — HTML lang="ar" dir="rtl" from the start
8. **Google-only auth via Clerk** — `@clerk/react` on frontend, `@clerk/express` middleware on backend

## Authentication

- **Frontend:** `@clerk/react` — `<ClerkProvider>` in `main.tsx`, `<Show>`, `<SignInButton>`, `<UserButton>` in `App.tsx`
- **Backend:** `@clerk/express` — `clerkAuth` middleware globally, `requireSignIn` on protected routes
- **Public routes:** `GET /api/health`, `GET /`
- **Protected routes:** `POST /api/projects/:id/research` (and all future agent/project routes)
- **Environment:** `VITE_CLERK_PUBLISHABLE_KEY` in `client/.env`, `CLERK_SECRET_KEY` in root `.env`

## Environment Variables

See `.env.example` for the full list. Required: `DATABASE_URL`, `REDIS_URL`, `ANTHROPIC_API_KEY`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`. Optional during dev: `OPENAI_API_KEY`.
