# Fanzy — Roadmap

## In Progress

## Review
- [ ] Dashboard UI + Pipeline View — project dashboard, pipeline visualization with demo data — branch: `feat/dashboard-ui`

## Known Bugs

## Up Next
- [ ] BullMQ pipeline orchestrator — queues, job flow, sequential + parallel execution, revision loop
- [ ] Director Brief agent — Visual Direction Brief from Fact Sheet
- [ ] Scriptwriter agent (dual) — Narrator + Storyteller personas, best-of-2
- [ ] Editor merge agent — select best elements from two scripts, merge + polish
- [ ] Director agent (dual) — Cinematic Eye + News Eye, visual storyboard
- [ ] Continuity Checker — merge storyboards, validate spatial/temporal logic
- [ ] QA agents (dual) — The Lawyer (accuracy) + The Viewer (audience), deterministic pre-checks
- [ ] Revision loop — QA → targeted corrections → re-run → QA (max 3 rounds)
- [ ] Final Editor polish — last pass after QA approval
- [ ] Wire pipeline to UI — replace demo data with real-time data via SSE
- [ ] PDF export — production-ready storyboard document via Puppeteer

## Backlog
- [ ] Persona system — agent identity, example portfolio, genre specialization
- [ ] Arabic Unicode normalization — consistent handling across all text processing
- [ ] Prompt caching — Claude cache_control breakpoints for system prompts + Fact Sheet

## Done (recent)
- [x] Auth integration — Google sign-in via Clerk, protected API routes
- [x] Researcher agent — Fact Sheet + Name Registry generation from raw story input
- [x] Project scaffold — Express + React + Prisma + TypeScript monorepo setup
