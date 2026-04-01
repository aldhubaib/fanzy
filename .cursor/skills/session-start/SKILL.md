---
name: session-start
description: >-
  Orient at the start of a coding session. Use when the user opens a new
  conversation, says "what should I work on", "where did I leave off",
  "let's get started", or begins a session without a specific task.
---

# Session Start

Run this workflow at the beginning of every coding session to get oriented.

## Step 1: Check Git State
Run these commands and summarize the results:
```bash
git branch --show-current
git status --short
git log --oneline -5
```

Report:
- Which branch you're on
- How many uncommitted changes exist
- What the last few commits were about

## Step 2: Check the Roadmap
- Read `ROADMAP.md`
- Report what's "In Progress" and what's "Up Next"

## Step 3: Summarize for the User
Present a brief status report:

```
Session Status:
- Branch: <current branch>
- Uncommitted changes: <count> files
- In progress: <task from roadmap>
- Up next: <next task from roadmap>
```

## Step 4: Ask What to Focus On
Ask the user:
- "Continue with <in-progress task>?"
- "Start something new from the roadmap?"
- "Something else?"

Wait for the user's answer before doing anything.

## If No ROADMAP.md Exists
- Note that it's missing
- Run `git status` and `git log --oneline -10` to infer recent work
- Ask the user what they'd like to focus on
- Offer to create a `ROADMAP.md` based on their answer
