# Optimistic Checkboxes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide instantaneous, zero-delay feedback when checking or unchecking daily to-dos and weekly goals in Career Break using optimistic TanStack Query cache mutations.

**Architecture:** Implement pure cache transform functions that toggle items immutably within `WeekData`, and integrate them into TanStack Query mutation hooks (`useToggleTodo` and `useToggleGoal`) in `useWeek.ts`. Wire these mutation hooks directly into `TodoItem` and `GoalList` so that toggling synchronously updates the checkbox, strikethrough, `WeekStrip` progress fill, and goal counters, with automatic rollback and error notification on failure.

**Tech Stack:** Next.js 16 (App Router), React 19, @tanstack/react-query v5, TypeScript, Jest.

**Spec:** `docs/superpowers/specs/2026-10-25-optimistic-checkboxes-design.md`

## Global Constraints

- Keep using TanStack Query v5 and existing Next.js server actions (`updateTodo`, `updateGoal`).
- Error rollback must restore exact prior snapshot on failure and display an alert matching existing app copy (`That didn’t save. Check your connection and try again.`).
- Preserve reactivity across `WeekStrip` and linked goal counters (`linkedDone`).

## Review Focus

1. **Network failure rollback**: When server action throws, the query cache must roll back immediately to the pre-mutation snapshot without corrupting other items.
2. **Rapid toggle spam**: Consecutive toggles before earlier server actions resolve must cancel ongoing queries to prevent race conditions from overwriting optimistic state.
3. **Derived state sync**: Toggling a to-do must immediately change the `WeekStrip` completion percentage and linked goal's `X to-dos done` count on the same frame.
4. **Non-existent or moved to-dos**: Transforming cache for an item not in the active week data must return the state unmodified without throwing.
5. **Settled query invalidation**: Regardless of success or failure, mutations must invalidate `['week']` upon settling to ensure eventual consistency with MongoDB.

---

### Task 1: Pure Cache Transformation Functions & Unit Tests

**Files:**
- Create: `apps/careerbreak/src/lib/optimistic.ts`
- Test: `apps/careerbreak/__tests__/optimistic.test.ts`

**Interfaces:**
- Produces:
  - `toggleTodoInWeek(data: WeekData, id: string, done: boolean): WeekData`
  - `toggleGoalInWeek(data: WeekData, id: string, hit: boolean): WeekData`

- [ ] **Step 1: Write the failing tests**

Create `apps/careerbreak/__tests__/optimistic.test.ts`:
```ts
import { toggleGoalInWeek, toggleTodoInWeek } from '@/lib/optimistic'
import type { Goal, Tag, Todo, WeekData } from '@/lib/types'

const tag: Tag = { id: 't1', name: 'work', color: '#000' }
const goal: Goal = { id: 'g1', weekStart: '2026-10-26', title: 'Goal 1', tagId: 't1', hit: false }
const todo: Todo = { id: 'td1', date: '2026-10-26', plannedDate: '2026-10-26', title: 'Task 1', tagId: 't1', goalId: 'g1', done: false }

const mockWeek: WeekData = {
  weekStart: '2026-10-26',
  tags: [tag],
  goals: [goal],
  todos: [todo],
  notes: null,
  prevNotes: null,
}

describe('optimistic cache transformations', () => {
  it('toggles a todo done state immutably', () => {
    const next = toggleTodoInWeek(mockWeek, 'td1', true)
    expect(next.todos[0].done).toBe(true)
    expect(mockWeek.todos[0].done).toBe(false)
  })

  it('safely handles non-existent todo id', () => {
    const next = toggleTodoInWeek(mockWeek, 'unknown', true)
    expect(next).toEqual(mockWeek)
  })

  it('toggles a goal hit state immutably', () => {
    const next = toggleGoalInWeek(mockWeek, 'g1', true)
    expect(next.goals[0].hit).toBe(true)
    expect(mockWeek.goals[0].hit).toBe(false)
  })

  it('safely handles non-existent goal id', () => {
    const next = toggleGoalInWeek(mockWeek, 'unknown', true)
    expect(next).toEqual(mockWeek)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter careerbreak test __tests__/optimistic.test.ts`  
Expected: FAIL with module `@/lib/optimistic` not found.

- [ ] **Step 3: Implement `toggleTodoInWeek` and `toggleGoalInWeek` in `apps/careerbreak/src/lib/optimistic.ts`**

Implement pure immutable transformations:
```ts
import type { WeekData } from './types'

export function toggleTodoInWeek(data: WeekData, id: string, done: boolean): WeekData {
  if (!data.todos.some((t) => t.id === id)) return data
  return {
    ...data,
    todos: data.todos.map((t) => (t.id === id ? { ...t, done } : t)),
  }
}

export function toggleGoalInWeek(data: WeekData, id: string, hit: boolean): WeekData {
  if (!data.goals.some((g) => g.id === id)) return data
  return {
    ...data,
    goals: data.goals.map((g) => (g.id === id ? { ...g, hit } : g)),
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter careerbreak test __tests__/optimistic.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/careerbreak/src/lib/optimistic.ts apps/careerbreak/__tests__/optimistic.test.ts
git commit -m "feat(careerbreak): add optimistic week cache transformers and tests"
```

---

### Task 2: TanStack Query Mutation Hooks in `useWeek.ts`

**Files:**
- Modify: `apps/careerbreak/src/components/useWeek.ts`

**Interfaces:**
- Consumes:
  - `toggleTodoInWeek`, `toggleGoalInWeek` from `@/lib/optimistic`
  - `updateTodo`, `updateGoal` from `@/app/actions`
- Produces:
  - `useToggleTodo(): { toggleTodo: (args: { id: string; done: boolean }) => void }`
  - `useToggleGoal(): { toggleGoal: (args: { id: string; hit: boolean }) => void }`

- [ ] **Step 1: Implement `useToggleTodo` and `useToggleGoal`**

Add mutation hooks to `apps/careerbreak/src/components/useWeek.ts`:
- Cancel queries on `['week']`.
- Snapshot current `['week']` query data via `client.getQueriesData({ queryKey: ['week'] })`.
- Apply `toggleTodoInWeek` / `toggleGoalInWeek` across `['week']` queries via `client.setQueriesData`.
- On error: restore snapshots via `client.setQueryData` and call `alert('That didn’t save. Check your connection and try again.')`.
- On settled: `client.invalidateQueries({ queryKey: ['week'] })`.

- [ ] **Step 2: Run test suite to verify no regressions**

Run: `pnpm --filter careerbreak test`  
Expected: All suites PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/careerbreak/src/components/useWeek.ts
git commit -m "feat(careerbreak): add optimistic toggle mutation hooks in useWeek"
```

---

### Task 3: Integrate Optimistic Toggling into `TodoItem` and `GoalList`

**Files:**
- Modify: `apps/careerbreak/src/components/TodoItem.tsx:62-67`
- Modify: `apps/careerbreak/src/components/GoalList.tsx:53-61`

**Interfaces:**
- Consumes: `useToggleTodo`, `useToggleGoal` from `@/components/useWeek`

- [ ] **Step 1: Wire `useToggleTodo` in `TodoItem.tsx`**

Replace `onChange={(v) => run(() => updateTodo(todo.id, { done: v }), onChange)}` with `const { toggleTodo } = useToggleTodo()` and `onChange={(v) => toggleTodo({ id: todo.id, done: v })}`.

- [ ] **Step 2: Wire `useToggleGoal` in `GoalList.tsx`**

Replace `onChange={(v) => run(() => updateGoal(goal.id, { hit: v }), onChange)}` in `GoalRow` with `const { toggleGoal } = useToggleGoal()` and `onChange={(v) => toggleGoal({ id: goal.id, hit: v })}`.

- [ ] **Step 3: Verify build and tests**

Run: `pnpm --filter careerbreak test`  
Run: `pnpm --filter careerbreak build`  
Expected: Both commands succeed with code 0.

- [ ] **Step 4: Commit**

```bash
git add apps/careerbreak/src/components/TodoItem.tsx apps/careerbreak/src/components/GoalList.tsx
git commit -m "feat(careerbreak): connect optimistic toggle hooks to TodoItem and GoalList"
```

---

### Task 4: Functional Verification & Review

**Files:**
- Verify application runtime behavior.

- [ ] **Step 1: Run full test suite across workspace**

Run: `pnpm test`  
Expected: All test suites PASS.

- [ ] **Step 2: Start careerbreak dev server and verify interactive behavior**

Run dev server and verify check/uncheck instant visual feedback without delay or console errors.

- [ ] **Step 3: Commit any final adjustments**
