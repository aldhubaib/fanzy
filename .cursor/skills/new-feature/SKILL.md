---
name: new-feature
description: >-
  Step-by-step workflow for building a new feature in Fanzy.
  Use when the user says "let's add", "I want to build", "new feature",
  or describes functionality that doesn't exist yet.
---

# New Feature Workflow

Follow these steps in order when building a new feature.

## Step 1: Understand the Goal
- Ask the user to describe the feature in one sentence
- Clarify: what should it do? What should it NOT do?

## Step 2: Read the Architecture
- Read `ARCHITECTURE.md` to understand the current system
- Check if something similar already exists (don't duplicate)
- Identify which layers are affected:

| Layer | Location | Example |
|-------|----------|---------|
| Schema | `prisma/schema.prisma` | New model or field |
| Services | `src/services/` | Business logic (agent orchestration, fact sheet) |
| Agents | `src/agents/` | New agent or agent modification |
| Prompts | `prompts/` | Persona prompt files |
| API | `src/routes/` | New or modified Express endpoint |
| Jobs | `src/jobs/` | BullMQ worker/queue changes |
| Frontend | `frontend/src/` | React UI components |
| Types | `src/types/` | New types or modifications |

## Step 3: Create a Branch
```bash
git checkout -b feat/<feature-name>
```

## Step 4: Plan the Work
List every file that will be created or modified. Group them by layer. Present the plan to the user and get confirmation before writing code.

## Step 5: Build Layer by Layer
Work through the layers in dependency order (types → schema → services → components → API):
1. Complete one layer
2. Commit it: `git commit -m "feat(<scope>): <what this layer adds>"`
3. Move to the next layer

## Step 6: Verify
- Run the dev server (`pnpm dev`) and confirm no errors
- Test the feature manually if possible
- Check that existing features still work

## Step 7: Wrap Up
- Update `ARCHITECTURE.md` with new files, patterns, or data flows
- Update `ROADMAP.md` — move to "Review" or note progress
- Summarize what was built and any known follow-ups

## Checklist
Copy this and track progress:
```
- [ ] Goal is clear
- [ ] Architecture reviewed
- [ ] Branch created
- [ ] Plan confirmed by user
- [ ] Code complete (layer by layer)
- [ ] App runs without errors
- [ ] ARCHITECTURE.md updated
- [ ] ROADMAP.md updated
```
