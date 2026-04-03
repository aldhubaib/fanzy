# Fanzy — Roadmap

## In Progress
- [ ] Creator Profile — data model + API — Prisma model, Zod schema, CRUD routes — branch: `feat/creator-profile`

## Review

## Known Bugs

## Up Next
- [ ] Creator Profile — UI — create/edit form, profile picker on project creation
- [ ] Script format system — flexible block schema that adapts per creator profile
- [ ] Pipeline — Creator Profile injection — every agent receives profile as read-only context alongside Fact Sheet
- [ ] Agent prompts — profile-aware writing — Scriptwriter, Editor, Director prompts adapt to format, flow, dialect, brevity, narrator role
- [ ] 3-way narrative fan-out — pipeline produces 3 final storyboards (linear, non-linear, end-first), user picks their favorite
- [ ] QA — profile-aware checks — source fidelity, name accuracy, format compliance, dialogue brevity, creator-specific rules
- [ ] BullMQ pipeline — job queue wiring for sequential agent orchestration
- [ ] Dashboard UI — create project, view pipeline status, browse storyboard output
- [ ] PDF export — production-ready storyboard document via Puppeteer
- [ ] Prompt caching — provider-specific caching (Claude cache_control, OpenAI equivalent)

## Backlog
- [ ] Scriptwriter agent — structured script generation from Fact Sheet
- [ ] Editor agent — script polishing pass
- [ ] Director agent — visual storyboard with shot types, camera, B-roll
- [ ] QA agent — cross-reference all output against Fact Sheet
- [ ] Arabic Unicode normalization — consistent handling across all text processing

## Done (recent)
- [x] Auth integration — Google sign-in via Clerk, protected API routes
- [x] Researcher agent — Fact Sheet + Name Registry generation from raw story input
- [x] Project scaffold — Express + React + Prisma + TypeScript monorepo setup
