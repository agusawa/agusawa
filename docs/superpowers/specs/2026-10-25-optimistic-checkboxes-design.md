# Career Break — Optimistic Check/Uncheck Design

Date: 2026-10-25  
App: `apps/careerbreak`

## Intent

Checking and unchecking items in Career Break currently feels sluggish because the UI waits for the Next.js Server Action (`updateTodo` / `updateGoal`) to resolve, and then waits for TanStack Query to refetch the entire week dataset before re-rendering. The intent is to make checking and unchecking to-dos and weekly goals feel instantaneous with zero perceptible delay, maintaining fluid responsiveness.

## Goals

- **Instant Check/Uncheck**: Toggle checkbox and strike-through on to-dos and weekly goals immediately on click.
- **Synchronized UI Elements**: Synchronously update all derived UI states within the active week, including:
  - The to-do item checkbox tick and strikethrough.
  - The [WeekStrip](file:///Users/agusstiawan/Projects/Personal/agusawa/apps/careerbreak/src/components/WeekStrip.tsx) daily completion fill bar.
  - The linked to-do count in [GoalList](file:///Users/agusstiawan/Projects/Personal/agusawa/apps/careerbreak/src/components/GoalList.tsx) (`X to-dos done`).
  - The goal hit/unhit checkbox and styling.
- **Safe Rollback**: If the server action fails (e.g., offline or network drop), revert the cached state to the pre-mutation snapshot and notify the user.

## Non-goals

- Optimistic creation, editing (title, tag, goal), moving, or deleting to-dos/goals (those involve form submissions or confirmation prompts).
- Offline-first persistent queueing/sync when completely offline for extended periods.

## Anti-goals

- Disjointed UI states where the checkbox updates instantly but the `WeekStrip` progress bar or goal counters lag behind.
- Silent state drift where an un-persisted checkmark stays visible indefinitely despite network failure.

## Constraints

- Built upon the existing React 19 + TanStack Query v5 + Next.js Server Actions stack.
- Minimal disruption to existing component props and API contracts.

## Approaches Considered

1. **TanStack Query Cache Mutation (Chosen)**:
   - Use TanStack Query mutations (`useMutation`) with optimistic cache updates (`onMutate` updates `['week', ws]`, snapshots previous data; `onError` restores snapshot; `onSettled` invalidates `['week']`).
   - *Why chosen*: Directly updates the source of truth for the active week, ensuring [WeekStrip](file:///Users/agusstiawan/Projects/Personal/agusawa/apps/careerbreak/src/components/WeekStrip.tsx), [GoalList](file:///Users/agusstiawan/Projects/Personal/agusawa/apps/careerbreak/src/components/GoalList.tsx), and [TodoItem](file:///Users/agusstiawan/Projects/Personal/agusawa/apps/careerbreak/src/components/TodoItem.tsx) update in one atomic, synchronous render.
2. **Local Component State (Rejected)**:
   - Store local `useState` inside `TodoItem` and `GoalRow`.
   - *Why rejected*: Fails to update `WeekStrip` fill bars or linked goal progress counters until background network fetch resolves, creating a jarring, partially-updated UI.

## What's Left to the Builder

- Implement `useToggleTodo` and `useToggleGoal` mutation hooks in `src/components/useWeek.ts` (or `useOptimisticToggle.ts`).
- Integrate the hooks into `TodoItem.tsx` and `GoalList.tsx`.
- Ensure tests in `apps/careerbreak/__tests__` cover optimistic toggling and rollback on failure.
