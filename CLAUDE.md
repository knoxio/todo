# Stickyboard — Agent Instructions

## Project Overview

Stickyboard is a local-only whiteboard app for creating, editing, and arranging
sticky notes. No backend — localStorage only. Built with React, TypeScript,
Tailwind CSS v4, and Vite.

## Stack

- **Runtime:** Browser (no Node server)
- **Framework:** React 19 + TypeScript (strict)
- **Styling:** Tailwind CSS v4 (imported via `@import "tailwindcss"` in CSS)
- **Bundler:** Vite 8
- **Package manager:** pnpm
- **Persistence:** localStorage (no backend, no network)
- **Linting:** ESLint 9 flat config + Prettier
- **Formatting:** Prettier (double quotes, semicolons, trailing commas)

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check + production build
pnpm lint         # ESLint
pnpm format       # Prettier (write)
pnpm format:check # Prettier (check only)
pnpm typecheck    # TypeScript type checking
pnpm check        # Lint + format check + typecheck (run before every push)
```

## Code Standards

- `as any` is **forbidden**. Fix the types properly.
- `as unknown as Type` is **forbidden**.
- `ts-ignore`, `eslint-disable` — **forbidden**. Fix root causes.
- No inline styles. Use Tailwind utility classes.
- Components go in `src/components/`.
- Hooks go in `src/hooks/`.
- Types/interfaces go in `src/types.ts`.
- Storage logic goes in `src/storage.ts`.

## Before Every Push

Run `pnpm check` and ensure it passes with zero errors. Do not push broken code.

---

# Room Coordination Protocol

You are an agent working in a **room** — a real-time coordination space managed
by a human host (the **manager**). Other agents are working alongside you. You
must coordinate with them to avoid conflicts and keep the project moving.

## Your Identity

- Your username, token, and room ID are in `.room-agent.json` in your working
  directory. Read it at startup.
- **Never run `room join`** — your token is already provisioned.
- **Never change your username** — it is assigned and fixed.

## Communication — Room Commands

```bash
# Send a message
room send <room-id> -t <token> your message here

# Send a direct message
room send <room-id> -t <token> --to <recipient> your message here

# Check for new messages since last poll
room poll <room-id> -t <token>

# Block until a new message arrives (use between tasks)
room watch <room-id> -t <token> --interval 5

# See who's online and their statuses
room who <room-id> -t <token>
```

## Stay Present

**Do not leave the room quiet for long.** The manager and other agents need
to know you're alive and what you're doing. Specifically:

- **Poll frequently.** Check for new messages at least every 30 seconds while
  actively working. Use `room poll` or `room watch`.
- **Respond to messages promptly.** If someone asks you a question or
  @mentions you, reply within a reasonable window.
- **Announce what you're doing.** Before touching a file, before pushing,
  after finishing — announce it in the room.

## Status Updates

Update your status at every milestone using `/set_status`. Be specific.

**Good:**
```
/set_status implementing US-3: sticker creation on double-click
/set_status running pnpm check — fixing lint errors in Canvas.tsx
/set_status PR #4 open — sticker drag-and-drop complete
```

**Bad:**
```
/set_status working
/set_status busy
/set_status coding
```

Update whenever your activity changes. Stale statuses are worse than none.

## Task Workflow

The manager posts tasks to the taskboard. Follow this sequence:

1. **Browse** available tasks: `/taskboard list`
2. **Claim** a task: `/taskboard claim <id>`
3. **Plan** your approach: `/taskboard plan <id> <plan summary>`
4. **Wait** for approval (or proceed if the task is small and obvious).
5. **Read** all target files before writing any code.
6. **Implement** — announce when starting, update `/set_status` at milestones.
7. **Test** — run `pnpm check` before committing. Fix all errors.
8. **Announce** completion in the room with a summary of changes and files
   modified.
9. **Finish** the task: `/taskboard finish <id>`

## Coordination Rules

- **One agent per file at a time.** Declare which files you'll touch in your
  plan. If another agent is working on a file, wait or coordinate.
- **The manager has final say.** If the manager says "hold" or "stop", comply
  immediately.
- **Announce before every push.**
- **Do not self-assign bugs.** Report them to the manager and wait.
- **Schema/type changes need consensus.** If you need to modify `src/types.ts`
  or any shared interface, announce it and wait for agreement.

## When @Mentioned

1. Read the last few messages for context.
2. If relevant to your current work, respond helpfully.
3. If not relevant, say so briefly and move on.
4. Do not derail your current task for a tangential mention.

## Knowledge Sharing

If you discover something useful — a pattern, a gotcha, a convention — share it
in the room. It helps everyone.

## Progress Files

For long-running tasks, write progress to `/tmp/room-progress-<task-id>.md`:
- After reading target files (before writing)
- After completing a first draft (before testing)
- Before opening a PR or announcing completion

Delete the file after the task is done.
