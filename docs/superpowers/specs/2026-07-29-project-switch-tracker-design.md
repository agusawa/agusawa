# Project Switch Tracker — Design

## Purpose

A single-page personal tool for managing parallel AI-assisted coding projects. When juggling multiple projects that are each waiting on an AI agent to finish work, it's easy to lose track of what was asked, what "done" should look like, and what to double-check. This tool holds that state and gently nudges toward the next action (batch reviews together, take a break while waiting, or start new work), instead of letting mental context get overloaded across projects.

No backend, no accounts — this is a local personal tool. All data lives in the browser's `localStorage`.

## Scope

New standalone app: `apps/switch-tracker`, added to the existing pnpm workspace (`apps/*`). Built with Vite + React 19 + TypeScript + Tailwind CSS 4 — a lighter-weight setup than the Next.js apps already in the monorepo (`apps/agusawa`, `apps/til`), since this tool has no routing, no SSR, and no content pipeline.

Out of scope: multi-device sync, accounts, backend storage, browser push notifications (in-page toast only, per decision below), and a dedicated grid layout (single column at all viewport widths).

## Data Model

```ts
type Status = "waiting" | "review" | "idle" | "done";

interface Project {
  id: string;
  name: string;
  status: Status;
  lastAsked: string;   // what I told the AI to do
  expecting: string;   // what "done" looks like
  watchFor: string;    // specific thing to double check
  nextAction: string;  // review / re-prompt / nothing yet
  updatedAt: number;   // epoch ms, set on any create/edit
}
```

Status → display mapping:

| status  | emoji | label            | color (muted)   |
|---------|-------|------------------|------------------|
| waiting | 🟡    | Waiting on AI    | amber-500/600    |
| review  | 🔵    | Needs my review  | blue-500/600     |
| idle    | ⚪    | Idle             | stone-400/500    |
| done    | 🟢    | Done for now     | emerald-500/600  |

## Architecture

```
apps/switch-tracker/
  src/
    App.tsx                — root: owns `projects` state, localStorage sync, layout, toast state
    components/
      FocusBanner.tsx       — aggregate-state nudge banner
      CapWarning.tsx        — "3+ active projects" note
      AddProjectForm.tsx    — add-by-name form
      ProjectCard.tsx       — status dots, summary view, inline expand/edit, delete
      RestTimer.tsx         — "Step away — 5 min" countdown button
      Toast.tsx             — generic auto-dismissing toast
    types.ts                — Project, Status
    storage.ts              — loadProjects()/saveProjects() localStorage helpers
    statusConfig.ts         — Status → {label, emoji, colors} lookup, STATUS_RANK for sorting
  index.html, main.tsx, index.css (Tailwind entry), vite.config.ts, tsconfig.json
  package.json, Dockerfile, nginx.conf
```

Each component has one clear job and talks to `App.tsx` via props/callbacks — no separate state management library, since state is a single flat array with local UI state (expanded card, timer, toast) kept in the components that own it.

### State & persistence

- `App.tsx` initializes `projects` via `useState(() => loadProjects())`, where `loadProjects()` reads `localStorage`, JSON-parses defensively, and returns `[]` on missing/invalid data.
- A `useEffect` keyed on `projects` calls `saveProjects(projects)` on every change.
- Any mutation (add, edit field, change status, delete) goes through a single `updateProject(id, patch)` / `addProject(name)` / `deleteProject(id)` set of handlers in `App.tsx`, each of which stamps `updatedAt: Date.now()` on the changed record.

### Sorting/grouping

Derived via `useMemo`, not stored: projects sorted by `STATUS_RANK` (`review` > `waiting` > `idle` > `done`), stable on ties. This makes "needs review" surface to the top automatically without a separate grouping UI.

### Focus banner

Computed each render from the current `projects` array (no stored state):

1. If any project has `status === "review"` → *"You have N project(s) ready to review — batch these together."* (N = count).
2. Else if there is at least one non-`done` project and every non-`done` project is `waiting` → *"Everything's waiting on AI. Take a 5-minute break before you check back."*
3. Else if there are zero `waiting` and zero `review` projects → *"Nothing pending — good time to fire off next tasks."*
4. If `projects.length === 0`, the banner is hidden entirely and the empty state (see below) is shown instead.

### Cap warning

If `count(waiting) + count(review) > 2`, render a small, non-blocking note under the banner: *"3+ active projects — consider dropping to 2 for a bit."* Purely derived, no dismiss/persist state.

### Rest timer

`RestTimer.tsx` owns local countdown state (`useState<number>` seconds remaining) and a `useEffect` running `setInterval`, cleaned up on unmount or manual reset. Clicking "Step away — 5 min" starts a 300s countdown displayed inline on the button/badge. On reaching 0, it calls an `onDone` prop; `App.tsx` uses that to push a toast message ("Break's over — check back in.") into its toast state. No browser Notification API — in-page toast only, per your decision.

### Editing

- Clicking a card body toggles an `expanded` boolean in local `ProjectCard` state, revealing editable text inputs for `lastAsked`, `expecting`, `watchFor`, `nextAction`.
- Fields save on blur, calling `onUpdate(id, { field: value })`.
- Status is changed via 4 small clickable colored dots shown inline on every card (collapsed or expanded) — not a dropdown, since dots keep the card visually consistent with the status badge and avoid extra chrome.
- Delete is a small button on the card, no confirmation dialog (low-stakes local data, consistent with "reduce cognitive load" — a mis-delete just means re-adding a name).

### Add project

`AddProjectForm.tsx` is a single text input + submit; on submit, calls `onAdd(name)` which creates a `Project` with a generated `id` (via `crypto.randomUUID()`), empty text fields, `status: "idle"`, and `updatedAt: Date.now()`. Submitting an empty/whitespace-only name is a no-op.

### Empty state

When `projects.length === 0`: friendly centered message ("No projects yet — add one to start tracking.") plus the `AddProjectForm`, banner and cap warning hidden.

## Visual Design

- Palette: Tailwind `stone` neutrals for chrome/background/text, muted status colors from the table above (500/600 shades, not saturated 400s) used only for dots/badges, never as large fill areas.
- Layout: single column at all viewport widths, content capped at a comfortable reading `max-width` (e.g. `max-w-xl`) and centered — no responsive grid breakpoints, to keep the "reduce cognitive load" framing consistent on mobile and desktop alike.
- Spacing: generous vertical rhythm between cards and sections; no borders-within-borders — cards use a single subtle border or soft shadow, not both.
- No external icon library — emoji (🟡🔵⚪🟢) and CSS-drawn dots only, per spec.

## Deployment

Mirrors `apps/til`'s Docker pattern, adapted for a Vite static build instead of Next's `output: "export"`:

- **Dockerfile**: multi-stage — `node:22-alpine` builder runs `pnpm install --filter switch-tracker --frozen-lockfile` then `pnpm --filter switch-tracker build` (Vite outputs to `dist/`); final stage is `nginx:alpine` serving `dist/` on port 80.
- **nginx.conf**: same `try_files $uri $uri/ =404;` SPA-friendly config as `apps/til/nginx.conf` (this app has no routes to speak of, but the pattern is copied for consistency and to correctly serve `index.html` on any path).
- No CI/CD wiring beyond the Dockerfile itself — matches the existing apps, where deployment is presumably triggered externally.

## Testing

No test framework is set up for this app (unlike `apps/til`, which uses Jest for content-processing logic). Given this is UI + localStorage glue with no business logic worth unit-testing in isolation, verification is manual: run `pnpm --filter switch-tracker dev`, exercise add/edit/status-change/delete, reload the page to confirm persistence, and check the banner/cap-warning/timer against the scenarios above.

## Open Questions / Decisions Already Made

- Location: standalone Vite app in the monorepo (not Next.js, not a single static HTML file) — decided.
- Timer notification: in-page toast only, no browser Notification API — decided.
- Deployment: Dockerfile + nginx included, matching sibling apps — decided.

None outstanding.
