# Fanzy — Project Team

This project is supported by an AI development team powered by [Cursor Team](https://cursor-team-production.up.railway.app).

## Team Members

| Name | Role | Activate | What They Do |
|------|------|----------|--------------|
| **Nizek** | Team Builder | "hey nizek" | Set up team, manage cloud brain |
| **Alex** | PM / Roadmap | "hey alex" | Priorities, features, sprint planning |
| **Sam** | Architect | "hey sam" | System design, data models, agent pipeline |
| **Raya** | Reviewer | "hey raya" | Code review, Fact Sheet integrity checks |
| **Omar** | Debugger | "hey omar" | Bug investigation, pipeline failure tracing |
| **Dana** | Prompt Engineer | "hey dana" | Persona prompts, Arabic quality, LLM selection |
| **Kai** | DevOps | "hey kai" | Railway deployment, Docker, monitoring |

## Project Profile

- **Name**: Fanzy
- **Description**: Multi-AI-agent storyboard system for Arabic video production
- **Stack**: Node.js, TypeScript, Express, Prisma, PostgreSQL, Clerk, React, Vite, Tailwind, BullMQ, Claude, GPT-4o, Puppeteer
- **Repo**: github.com/aldhubaib/fanzy
- **Railway**: https://railway.com/project/e825358d-dc8c-4a4a-9c0c-3841d4ff18c3
- **Registered**: April 3, 2026

## Architecture Summary

```
Raw Story Input → Researcher (Fact Sheet + Name Registry)
                    → Scriptwriter (structured script)
                      → Editor (polished script)
                        → Director (visual storyboard)
                          → QA (validation)
                            → Production-Ready Storyboard (PDF/web)
```

Core innovation: **Fact Sheet is immutable**. Once the Researcher produces it, no agent can modify it. All downstream agents reference it read-only. Name validation is programmatic, not LLM-based.

## Brain Stats

- Cloud brain: https://cursor-team-production.up.railway.app/dashboard
- Memories from this project: 0 (fresh start)
- Memories from similar projects: 41 (falak, falak-ai, cursor-team, ai-node-studio)
