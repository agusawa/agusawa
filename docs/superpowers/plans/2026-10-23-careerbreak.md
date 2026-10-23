# Career Break Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `apps/careerbreak`, a private one-user app for daily to-dos, weekly goals, custom tags and a Sunday review, deployed to `careerbreak.stiawan.site`.

**Architecture:** A Next.js app with a Node server (not a static export). Pages are thin client components. They load one week of data through a single server action, `getWeek(weekStart)`, and change data through small server actions. Every action checks the Firebase session cookie first. The browser computes "today", so dates follow the user's local day. All counting and grouping lives in pure functions in `src/lib/` and is unit-tested. Postgres is reached with the `postgres` package. Migrations live in a TS array and run once when the server starts, via `instrumentation.ts`.

**Tech Stack:** Next.js 16.2.9, React 19.2.4, TypeScript 5, Tailwind 4, next-themes, lucide-react, `postgres` (porsager), `firebase` (web SDK), `firebase-admin`, Jest 30 + ts-jest (same setup as `apps/til`).

**Spec:** `docs/superpowers/specs/2026-10-23-careerbreak-design.md`

## Global Constraints

- App lives at `apps/careerbreak`, package name `careerbreak`, in the existing pnpm workspace (`pnpm@11.7.0`, Node ≥ 20).
- `next` `16.2.9`, `react`/`react-dom` `19.2.4`, `eslint-config-next` `16.2.9`. These match `apps/til`.
- Day 1 is **2026-10-26** (Monday). A week runs Monday–Sunday. Week 1 = 26 Oct – 1 Nov 2026.
- Dates are `'YYYY-MM-DD'` strings everywhere: DB `DATE` columns, types and props. Never a JS `Date` crossing a boundary. Date math uses UTC only, so the server's timezone can't shift a day.
- Google sign-in only, through a **new** Firebase project. Access is limited to `ALLOWED_EMAIL`. Every server action and route checks the session on the server.
- Plain Postgres connection string (`DATABASE_URL`, Supabase-hosted). No `@supabase/*` packages.
- An unfinished to-do is never moved automatically. A moved to-do stays visible on its original day as "moved → <Day>".
- Must work well at phone width (375px). It follows the system light/dark setting through next-themes, like `apps/til`.
- No new dependencies beyond those listed in Tech Stack.

## Review Focus

1. **Empty or misconfigured `ALLOWED_EMAIL`** must reject everyone (fail closed). Email matching ignores case and surrounding spaces, and unverified emails are rejected. Pinned in Task 4.
2. **A moved to-do** counts once in week totals (on its current date), shows as "moved" on its original day, and is never counted as done on the original day. Pinned in Task 2.
3. **A Sunday or month-end date** resolves to the right Monday. `weekStart('2026-11-01')` is `'2026-10-26'`, not the next Monday, whatever the server timezone. Pinned in Task 1.
4. **A week with zero to-dos, or a tag with zero to-dos,** shows 0/0 with an empty bar, never `NaN%`. Pinned in Task 2.
5. **Linking a to-do to a goal from a different week,** or saving a blank or whitespace-only title, is rejected on the server. Pinned in Task 2.

---

## File Structure

```
apps/careerbreak/
  package.json, tsconfig.json, next.config.ts, postcss.config.mjs,
  eslint.config.mjs, jest.config.ts, .gitignore, .env.example, Dockerfile
  __tests__/dates.test.ts, week.test.ts, validate.test.ts, auth.test.ts
  src/
    instrumentation.ts            runs migrations on server start
    lib/
      dates.ts                    pure date math
      week.ts                     pure grouping + review stats
      validate.ts                 pure input checks (throw on bad input)
      types.ts                    shared types
      tagColors.ts                palette + pick
      auth.ts                     isAllowedEmail (pure) + getUser/requireUser (server)
      firebaseAdmin.ts            admin app singleton
      firebaseClient.ts           web app + Google sign-in
      db/client.ts                postgres client singleton
      db/migrations.ts            ordered SQL strings
      db/migrate.ts               applies pending migrations
    app/
      layout.tsx, globals.css
      actions.ts                  all server actions ('use server')
      api/session/route.ts        POST sign in, DELETE sign out
      login/page.tsx
      (app)/layout.tsx            server guard + Header
      (app)/page.tsx              Today
      (app)/week/page.tsx
      (app)/review/page.tsx
      (app)/settings/page.tsx
    components/
      ThemeProvider.tsx, Header.tsx, WeekNav.tsx, useWeek.ts,
      TodoItem.tsx, AddTodo.tsx, TagPicker.tsx, GoalList.tsx, ImproveNote.tsx
```

---

### Task 1: Scaffold the app and date math

**Files:**
- Create: `apps/careerbreak/` config files (package.json, tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs, jest.config.ts, .gitignore). Copy `apps/til`'s versions and drop `@tailwindcss/typography`, `gray-matter` and `remark*`.
- Create: `apps/careerbreak/src/app/layout.tsx`, `globals.css`, `src/components/ThemeProvider.tsx` (copy from til and drop the typography/prose CSS). Add a placeholder `src/app/(app)/page.tsx` so the build works.
- Create: `apps/careerbreak/src/lib/dates.ts`
- Modify: root `.gitignore`. Add `.env*` and `!.env.example`.
- Test: `apps/careerbreak/__tests__/dates.test.ts`

**Interfaces:**
- Produces (`src/lib/dates.ts`):
  - `BREAK_START = '2026-10-26'`
  - `addDays(date: string, n: number): string`
  - `weekStart(date: string): string`, the Monday on or before `date`
  - `weekDays(weekStart: string): string[]`, 7 dates Mon..Sun
  - `weekNumber(weekStart: string): number`, `1` for `BREAK_START`. It can be ≤ 0 for earlier weeks.
  - `breakDay(today: string): number | null`, `null` before `BREAK_START`
  - `todayLocal(): string`, browser local date (client only)
  - `formatDay(date: string): string` → `'Thursday, 29 Oct'`; `shortDay(date: string): string` → `'Thu'`; `formatRange(weekStart: string): string` → `'26 Oct – 1 Nov'`

- [ ] **Step 1:** Scaffold the config. `package.json` scripts: `dev` (`next dev -p 3002`), `build`, `start`, `lint`, `test` (`jest`). `next.config.ts`: `output: 'standalone'` and `outputFileTracingRoot: path.join(__dirname, '../../')`. Then run `pnpm install` from the repo root, and `pnpm add firebase firebase-admin postgres lucide-react next-themes --filter careerbreak`.
- [ ] **Step 2: Write the failing tests** in `__tests__/dates.test.ts`:

```ts
expect(weekStart('2026-10-26')).toBe('2026-10-26')
expect(weekStart('2026-11-01')).toBe('2026-10-26')   // Sunday → previous Monday
expect(weekStart('2026-11-02')).toBe('2026-11-02')
expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
expect(weekDays('2026-10-26')).toEqual(['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31','2026-11-01'])
expect(weekNumber('2026-10-26')).toBe(1)
expect(weekNumber('2026-11-02')).toBe(2)
expect(breakDay('2026-10-25')).toBeNull()
expect(breakDay('2026-10-26')).toBe(1)
expect(breakDay('2026-11-02')).toBe(8)
expect(formatDay('2026-10-29')).toBe('Thursday, 29 Oct')
expect(shortDay('2026-10-29')).toBe('Thu')
expect(formatRange('2026-10-26')).toBe('26 Oct – 1 Nov')
```

Also add one test that sets `process.env.TZ = 'America/Los_Angeles'` before importing (use `jest.isolateModules`) and checks `weekStart('2026-11-01') === '2026-10-26'`.
- [ ] **Step 3:** Run `pnpm --filter careerbreak test`. Expected: FAIL, module not found.
- [ ] **Step 4:** Implement `dates.ts` by parsing with `Date.UTC(y, m-1, d)` and formatting with `getUTC*`. `todayLocal` uses local `getFullYear/getMonth/getDate`. Use fixed English month and day names, not `toLocaleDateString`, so output doesn't depend on the runtime locale.
- [ ] **Step 5:** Run the tests. Expected: PASS. Run `pnpm --filter careerbreak build`. Expected: build succeeds.
- [ ] **Step 6:** Commit: `feat(careerbreak): scaffold app and date helpers`.

---

### Task 2: Types, validation and week math

**Files:**
- Create: `src/lib/types.ts`, `src/lib/validate.ts`, `src/lib/week.ts`, `src/lib/tagColors.ts`
- Test: `__tests__/validate.test.ts`, `__tests__/week.test.ts`

**Interfaces:**
- Consumes: `dates.ts` (Task 1).
- Produces (`types.ts`):

```ts
export type Tag = { id: number; name: string; color: string }
export type Goal = { id: number; weekStart: string; title: string; tagId: number; hit: boolean }
export type Todo = { id: number; date: string; plannedDate: string; title: string; tagId: number; goalId: number | null; done: boolean }
export type WeekNotes = { weekStart: string; wentWell: string; improve: string }
export type WeekData = { weekStart: string; tags: Tag[]; goals: Goal[]; todos: Todo[]; notes: WeekNotes | null; prevNotes: WeekNotes | null }
export type DayEntry = { todo: Todo; moved: boolean }   // moved = shown on its original day after moving
export type TagStat = { tag: Tag; done: number; total: number; pct: number }
export type ReviewStats = { done: number; total: number; moved: number; byTag: TagStat[]; perDay: number[]; goals: { goal: Goal; linkedDone: number }[] }
```

- Produces (`validate.ts`). Each function throws `Error` with a user-readable message:
  - `cleanTitle(s: unknown): string` trims, rejects empty, max 200 chars
  - `cleanTagName(s: unknown): string` trims, rejects empty, max 30 chars
  - `assertDate(s: unknown): string` requires `/^\d{4}-\d{2}-\d{2}$/` and a real calendar date
  - `assertGoalWeek(goalWeekStart: string, todoDate: string): void` throws unless `weekStart(todoDate) === goalWeekStart`
  - `cleanNote(s: unknown): string` turns a non-string into `''`, max 5000 chars
- Produces (`week.ts`):
  - `dayEntries(todos: Todo[], day: string): DayEntry[]`: to-dos with `date === day` (`moved: false`), then those with `plannedDate === day && date !== day` (`moved: true`). Keeps input order.
  - `stillOpen(todos: Todo[], today: string): Todo[]`: `!done && date < today && weekStart(date) === weekStart(today)`
  - `linkedDone(todos: Todo[], goalId: number): number`
  - `reviewStats(data: WeekData): ReviewStats`: totals count each to-do once by `date` within the week. `moved` = to-dos with `plannedDate !== date`. `perDay[i]` = done to-dos whose `date` is day i. `byTag` only includes tags with total > 0, sorted by total descending. `pct` = 0 when total is 0.
- Produces (`tagColors.ts`): `TAG_COLORS: string[]` (8 hex colors readable in both themes), `pickTagColor(existingCount: number): string` = `TAG_COLORS[existingCount % 8]`

- [ ] **Step 1: Write failing tests.** `validate.test.ts`:
  - `cleanTitle('  Pitch  ')` → `'Pitch'`; `cleanTitle('   ')`, `cleanTitle(42)` and a 201-char string all throw.
  - `assertDate('2026-02-30')` and `assertDate('2026-1-5')` throw; `assertDate('2026-10-26')` returns it.
  - `assertGoalWeek('2026-10-26', '2026-11-01')` passes; `assertGoalWeek('2026-10-26', '2026-11-02')` throws.

  `week.test.ts`, using a fixture week `2026-10-26` with a to-do moved Mon→Thu (`plannedDate '2026-10-26'`, `date '2026-10-29'`, `done: true`), an undone Tuesday to-do, and a done Wednesday to-do:
  - `dayEntries(todos,'2026-10-26')` has the moved to-do with `moved: true`; `dayEntries(todos,'2026-10-29')` has it with `moved: false`.
  - `reviewStats(...)`: `total 3`, `done 2`, `moved 1`, `perDay` = `[0,0,1,1,0,0,0]` (the moved to-do counts on Thu, not Mon).
  - `stillOpen(todos,'2026-10-29')` returns only the Tuesday to-do; `stillOpen(todos,'2026-11-02')` returns `[]` (a new week starts clean).
  - Empty week: `reviewStats` → `done 0, total 0, moved 0, byTag [], perDay [0×7]`. No `NaN` anywhere (`expect(JSON.stringify(stats)).not.toContain('null')`).
  - A tag with 0 to-dos is absent from `byTag`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the four files.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(careerbreak): add types, validation and week stats`.

---

### Task 3: Database and migrations

**Files:**
- Create: `src/lib/db/client.ts`, `src/lib/db/migrations.ts`, `src/lib/db/migrate.ts`, `src/instrumentation.ts`, `.env.example`

**Interfaces:**
- Produces: `sql` (default export of `client.ts`), a `postgres` instance created with `{ prepare: false, transform: postgres.camel, types: { date: { to: 1082, from: [1082], serialize: (x: string) => x, parse: (x: string) => x } } }`. `prepare: false` is required for Supabase's transaction pooler. The date type keeps `DATE` as `'YYYY-MM-DD'` strings. Keep it as a module-level singleton on `globalThis` so dev hot reloads don't open new pools.
- Produces: `migrate(): Promise<void>`. It creates `schema_migrations(id int primary key, applied_at timestamptz default now())` and applies each `MIGRATIONS[i]` whose index isn't recorded yet, one transaction per migration.
- `MIGRATIONS[0]`, the exact schema:

```sql
create table tags (
  id serial primary key,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);
create unique index tags_name_lower on tags (lower(name));
create table goals (
  id serial primary key,
  week_start date not null,
  title text not null,
  tag_id int not null references tags(id) on delete restrict,
  hit boolean not null default false,
  created_at timestamptz not null default now()
);
create index goals_week on goals (week_start);
create table todos (
  id serial primary key,
  date date not null,
  planned_date date not null,
  title text not null,
  tag_id int not null references tags(id) on delete restrict,
  goal_id int references goals(id) on delete set null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index todos_date on todos (date);
create index todos_planned on todos (planned_date);
create table week_notes (
  week_start date primary key,
  went_well text not null default '',
  improve text not null default ''
);
```

- `instrumentation.ts`: `export async function register() { if (process.env.NEXT_RUNTIME === 'nodejs') await (await import('./lib/db/migrate')).migrate() }`
- `.env.example` (names only): `DATABASE_URL=`, `ALLOWED_EMAIL=`, `FIREBASE_PROJECT_ID=`, `FIREBASE_CLIENT_EMAIL=`, `FIREBASE_PRIVATE_KEY=`, `NEXT_PUBLIC_FIREBASE_API_KEY=`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID=`, `NEXT_PUBLIC_FIREBASE_APP_ID=`

- [ ] **Step 1:** Start a local database: `docker run -d --name careerbreak-pg -e POSTGRES_PASSWORD=dev -p 5433:5432 postgres:16`. Put `DATABASE_URL=postgres://postgres:dev@localhost:5433/postgres` in `apps/careerbreak/.env.local`.
- [ ] **Step 2:** Implement the four files.
- [ ] **Step 3:** Run `pnpm --filter careerbreak dev`, load `http://localhost:3002`, then run `docker exec careerbreak-pg psql -U postgres -c '\dt'`. Expected: `goals`, `schema_migrations`, `tags`, `todos`, `week_notes`. Restart dev and check the server log shows no error (migrations are idempotent).
- [ ] **Step 4:** Commit: `feat(careerbreak): add postgres client and migrations`.

---

### Task 4: Google sign-in and the session guard

**Files:**
- Create: `src/lib/auth.ts`, `src/lib/firebaseAdmin.ts`, `src/lib/firebaseClient.ts`, `src/app/api/session/route.ts`, `src/app/login/page.tsx`, `src/app/(app)/layout.tsx`
- Test: `__tests__/auth.test.ts`

**Interfaces:**
- Produces (`auth.ts`):
  - `isAllowedEmail(email: string | undefined, verified: boolean | undefined, allowed: string | undefined): boolean`. This is a pure function.
  - `getUser(): Promise<{ email: string } | null>`. It reads cookie `session` from `next/headers` and returns `null` straight away if the cookie is missing, so Firebase Admin is never touched for signed-out visitors. Otherwise it calls `verifySessionCookie(cookie, true)` and returns `null` on any error or if the email isn't allowed.
  - `requireUser(): Promise<{ email: string }>`. It throws `Error('Unauthorized')` when `getUser()` is null.
- Produces (`firebaseAdmin.ts`): `adminAuth(): Auth`. It initialises once from `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` (replace literal `\n` with newlines).
- Produces (`firebaseClient.ts`): `signInWithGoogle(): Promise<string>` returns an ID token through `signInWithPopup(GoogleAuthProvider)`. `signOutClient(): Promise<void>`.
- `POST /api/session` takes `{ idToken }`. It calls `verifyIdToken(idToken, true)`, requires `isAllowedEmail(...)` and `auth_time` within the last 5 minutes, then `createSessionCookie(idToken, { expiresIn: 14 days })`. It sets cookie `session` with httpOnly, `secure` in production, `sameSite: 'lax'`, `path: '/'`, maxAge 14 days. It returns 204, or 403 `{ error: 'This account is not allowed.' }`. `DELETE /api/session` clears the cookie and returns 204.
- `(app)/layout.tsx` (server): `if (!(await getUser())) redirect('/login')`. It renders `<Header/>` (Task 6) above `children`. Until Task 6 exists, render children only.
- `/login` shows the app name "Career Break", a short line, and a "Sign in with Google" button. On success it goes to `router.replace('/')`; on 403 it shows the error and calls `signOutClient()`.

- [ ] **Step 1: Write failing tests** (`auth.test.ts`, which imports only `isAllowedEmail`):

```ts
expect(isAllowedEmail('agus@x.com', true, 'agus@x.com')).toBe(true)
expect(isAllowedEmail(' Agus@X.com ', true, 'agus@x.com ')).toBe(true)
expect(isAllowedEmail('agus@x.com', false, 'agus@x.com')).toBe(false)
expect(isAllowedEmail('other@x.com', true, 'agus@x.com')).toBe(false)
expect(isAllowedEmail('agus@x.com', true, '')).toBe(false)          // fail closed
expect(isAllowedEmail('agus@x.com', true, undefined)).toBe(false)
expect(isAllowedEmail(undefined, true, 'agus@x.com')).toBe(false)
```

Keep `isAllowedEmail` free of server imports, or move the server functions so the test file doesn't load `next/headers` or `firebase-admin`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the files.
- [ ] **Step 4:** Run the tests. Expected: PASS. Run `pnpm --filter careerbreak build`. Expected: success.
- [ ] **Step 5:** Manual check (needs the user's Firebase project, so skip and note it if the env vars aren't set): open `/` and confirm it redirects to `/login`. Signing in with the allowed account lands on `/`. Signing in with any other Google account shows the error. `curl -X POST localhost:3002/api/session -d '{"idToken":"x"}'` returns 403.
- [ ] **Step 6:** Commit: `feat(careerbreak): add google sign-in with email allowlist`.

---

### Task 5: Server actions

**Files:**
- Create: `src/app/actions.ts` (`'use server'`)

**Interfaces:**
- Consumes: `sql`, `requireUser`, `validate.ts`, `pickTagColor`, `weekStart`/`addDays` and the types.
- Produces. Every function's first line is `await requireUser()`, and every input passes through `validate.ts`:
  - `getWeek(weekStart: string): Promise<WeekData>`. Returns all tags (ordered by name); goals with `week_start = weekStart`; todos where `date` or `planned_date` is between `weekStart` and `weekStart+6`, ordered by `created_at`; `notes` for this week; `prevNotes` for `weekStart-7`. Use `assertDate`, and also reject a `weekStart` that isn't a Monday.
  - `createTag(name: string): Promise<Tag>` returns the existing tag on a case-insensitive name match. Otherwise it inserts with `pickTagColor(count)`.
  - `renameTag(id: number, name: string): Promise<void>` throws `'A tag with that name already exists.'` on a unique violation.
  - `deleteTag(id: number): Promise<{ ok: true } | { ok: false; usedBy: number }>` counts todos and goals first, and only deletes when the count is 0.
  - `createGoal(input: { weekStart: string; title: string; tagId: number }): Promise<void>`
  - `updateGoal(id: number, patch: { title?: string; tagId?: number; hit?: boolean }): Promise<void>`
  - `deleteGoal(id: number): Promise<void>`. Linked to-dos keep existing because of `on delete set null`.
  - `createTodo(input: { date: string; title: string; tagId: number; goalId: number | null }): Promise<void>` sets `planned_date = date`. If `goalId` is set, it loads the goal and calls `assertGoalWeek`.
  - `updateTodo(id: number, patch: { title?: string; tagId?: number; goalId?: number | null; done?: boolean }): Promise<void>` runs the same goal-week check against the to-do's current `date`.
  - `moveTodo(id: number, toDate: string): Promise<void>` updates `date` only, never `planned_date`. It rejects a `toDate` in a different week from the to-do's `date`.
  - `deleteTodo(id: number): Promise<void>`
  - `saveNotes(weekStart: string, notes: { wentWell: string; improve: string }): Promise<void>` upserts on `week_start`.

- [ ] **Step 1:** Implement `actions.ts`. Keep each action to one or two SQL statements. Don't call `revalidatePath`, because clients reload through `useWeek().reload()`.
- [ ] **Step 2:** Run `pnpm --filter careerbreak build` and `pnpm --filter careerbreak lint`. Expected: both pass.
- [ ] **Step 3:** Smoke test against the local DB with a dev-only temporary script, or after Task 7 through the UI: create a tag, a goal and a to-do linked to it; move the to-do; confirm `getWeek` returns it once with `plannedDate !== date`. Delete the temporary script before committing.
- [ ] **Step 4:** Commit: `feat(careerbreak): add server actions`.

---

### Task 6: App shell: header, tabs, week loading

**Files:**
- Create: `src/components/Header.tsx`, `src/components/WeekNav.tsx`, `src/components/useWeek.ts`
- Modify: `src/app/(app)/layout.tsx` to render `<Header/>`

**Interfaces:**
- Produces: `useWeek(weekStart: string): { data: WeekData | null; error: string | null; reload: () => Promise<void> }`. It calls `getWeek` on mount and whenever `weekStart` changes.
- Produces: `useSelectedWeek(): string`, which reads `?w=` from `useSearchParams` (it must be a valid Monday, else `weekStart(todayLocal())`), and `<WeekNav weekStart={string} />`, which renders `‹ prev`, `Week N · 26 Oct – 1 Nov` and `next ›`, and changes `?w=`.
- `Header` (client): the counter reads `Day {breakDay(todayLocal())} of your career break`, or `Starts Monday` when null. Tabs are **Today** (`/`), **Week** (`/week`) and **Review** (`/review`), with the active tab underlined. A small menu holds Settings (`/settings`), a theme toggle (copy til's `ThemeToggle`) and Sign out. Sign out calls `DELETE /api/session`, then `signOutClient()`, then goes to `/login`. Everything must fit on one row at 375px, so move the menu behind an icon on narrow screens.

- [ ] **Step 1:** Implement the files.
- [ ] **Step 2:** Run `pnpm --filter careerbreak build && pnpm --filter careerbreak lint`. Expected: pass. Then on the dev server (signed in), check that the counter shows `Starts Monday` before 26 Oct, the tabs switch routes, and the layout holds at 375px wide.
- [ ] **Step 3:** Commit: `feat(careerbreak): add header, tabs and week loading`.

---

### Task 7: Today screen

**Files:**
- Create: `src/components/TodoItem.tsx`, `src/components/AddTodo.tsx`, `src/components/TagPicker.tsx`, `src/components/GoalList.tsx`, `src/components/ImproveNote.tsx`
- Modify: `src/app/(app)/page.tsx`

**Interfaces:**
- Consumes: `useWeek`, the actions from Task 5, and `dayEntries`, `stillOpen` and `linkedDone`.
- Produces (reused in Tasks 8 and 9):
  - `<TodoItem entry={DayEntry} tags={Tag[]} goals={Goal[]} onChange={() => void} showMove?: boolean />` has a checkbox, the title, a tag chip (tag color) and an edit/delete menu. Edit changes the title, tag and goal inline. When `entry.moved`, it renders greyed out with `moved → {shortDay(todo.date)}` and has no checkbox. When `showMove`, it shows a "move to today" button that calls `moveTodo(id, todayLocal())`.
  - `<AddTodo date={string} tags={Tag[]} goals={Goal[]} onAdded={() => void} />` has a title input, a `TagPicker` and an optional goal select (only the goals passed in). Enter submits. The tag is required.
  - `<TagPicker tags={Tag[]} value={number | null} onChange={(id: number) => void} onCreated={() => void} />` is a select of tags plus a "New tag…" option. That option shows an input that calls `createTag`.
  - `<GoalList weekStart={string} data={WeekData} onChange={() => void} />` shows each goal's tag chip, title, a hit checkbox (`updateGoal`) and `{linkedDone} to-dos done`, with edit/delete and an add-goal form. When there are no goals, it shows the prompt "No goals for this week yet. What do you want to get done?" above the form.
  - `<ImproveNote text={string | undefined} />` renders the amber callout `From last week: "…"`, or nothing when the text is empty.
- Today page order (spec): ImproveNote(`prevNotes?.improve`), GoalList (this week), heading `formatDay(today)` with `dayEntries` and `AddTodo`, then a "Still open from earlier this week" section with `stillOpen` items (`showMove`). Hide that section when it's empty.

- [ ] **Step 1:** Implement the components and the page.
- [ ] **Step 2:** Build and lint pass. In the browser (signed in, local DB): create a tag from the picker, add a goal, add a to-do linked to it, and tick it; the goal shows `1 to-dos done`. Make a to-do dated yesterday with `createTodo` and confirm it appears under "Still open". Move it, then confirm it appears in today's list and the earlier day (check in Task 8) shows it as moved. Check the page at 375px.
- [ ] **Step 3:** Commit: `feat(careerbreak): add today screen`.

---

### Task 8: Week screen

**Files:**
- Modify: `src/app/(app)/week/page.tsx`

**Interfaces:**
- Consumes: `useSelectedWeek`, `WeekNav`, `useWeek`, `ImproveNote`, `GoalList`, `TodoItem`, `AddTodo`, `dayEntries` and `weekDays`.
- Layout (spec): WeekNav, ImproveNote(`prevNotes?.improve`), GoalList for the selected week, then seven day sections. Each section has a heading `formatDay(day)` (today highlighted), its `dayEntries`, and an `AddTodo date={day}` collapsed behind a "+ Add" button. The goal picker gets that week's goals.

- [ ] **Step 1:** Implement the page.
- [ ] **Step 2:** Build and lint pass. In the browser: go to the next week and confirm the "From last week" note shows this week's improve text (after Task 9 saves one). Add a goal and a to-do there. The to-do moved in Task 7 shows on its original day as `moved → <Day>`.
- [ ] **Step 3:** Commit: `feat(careerbreak): add week screen`.

---

### Task 9: Review screen

**Files:**
- Modify: `src/app/(app)/review/page.tsx`

**Interfaces:**
- Consumes: `useSelectedWeek`, `WeekNav`, `useWeek`, `reviewStats`, `saveNotes` and `shortDay`/`weekDays`.
- Sections in this order (spec, and the `review-page.html` mockup):
  1. WeekNav
  2. **To-dos done**: big `done / total`
  3. **Moved**: `{moved} moved to a later day`, hidden when 0
  4. **By tag**: one row per `byTag` item with a chip, a bar at `pct`% in the tag color, and `done/total`
  5. **Done per day**: 7 bars from `perDay`, height relative to the max (all flat when the max is 0), labelled M T W T F S S
  6. **Goals**: ✓ (hit) or ✗, the title and `({linkedDone} to-dos done)`
  7. **What went well** and **What to improve next week**: textareas that save on blur through `saveNotes`, with "Saved" shown briefly. Under the improve box: "This shows at the top of next week's Today screen."
- Charts are plain divs, with no chart library.

- [ ] **Step 1:** Implement the page.
- [ ] **Step 2:** Build and lint pass. In the browser: the numbers match the Today and Week screens for the same week. An empty future week shows `0 / 0` and no NaN. Notes stay after a reload, and the improve note appears on the next week's Week tab.
- [ ] **Step 3:** Commit: `feat(careerbreak): add review screen`.

---

### Task 10: Settings: manage tags

**Files:**
- Modify: `src/app/(app)/settings/page.tsx`

**Interfaces:**
- Consumes: `useWeek` (for `tags`; use the current week, since tags are global), `renameTag`, `deleteTag` and `createTag`.
- Shows a list of tags, each with a color dot, the name (click to rename inline) and a delete button. When `deleteTag` returns `{ ok: false, usedBy }`, show `Used by {usedBy} items. Remove it from them first.` There's also an "Add tag" input.

- [ ] **Step 1:** Implement the page.
- [ ] **Step 2:** Build and lint pass. In the browser: renaming to an existing name shows the error; deleting a used tag is blocked with its count; deleting an unused tag works.
- [ ] **Step 3:** Commit: `feat(careerbreak): add tag settings`.

---

### Task 11: Docker image for Dokploy

**Files:**
- Create: `apps/careerbreak/Dockerfile`
- Modify: `apps/careerbreak/.env.example` if anything changed

**Interfaces:**
- Base it on `apps/til/Dockerfile` (same `base`/`builder` stages, `--filter careerbreak`). The differences:
  - In `builder`, before `pnpm --filter careerbreak build`: `ARG` and `ENV` for `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` and `NEXT_PUBLIC_FIREBASE_APP_ID`, because they are baked in at build time.
  - The runner is `node:22-alpine` instead of nginx. Copy `/app/apps/careerbreak/.next/standalone` to `./`, `.next/static` to `./apps/careerbreak/.next/static`, and `public` to `./apps/careerbreak/public` if it exists. Set `ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0`, `EXPOSE 3000`, and `CMD ["node", "apps/careerbreak/server.js"]`.
  - Runtime env vars (set in Dokploy, not baked in): `DATABASE_URL`, `ALLOWED_EMAIL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.

- [ ] **Step 1:** Write the Dockerfile.
- [ ] **Step 2:** From the repo root, run `docker build -f apps/careerbreak/Dockerfile -t careerbreak .`. Expected: the build succeeds. Then run `docker run --rm -p 3000:3000 -e DATABASE_URL=postgres://postgres:dev@host.docker.internal:5433/postgres -e ALLOWED_EMAIL=x@y.z careerbreak`. Expected: the server starts, migrations run without error, and `curl -I localhost:3000/` returns a redirect to `/login`.
- [ ] **Step 3:** Commit: `feat(careerbreak): add docker image for dokploy`.

---

## After the plan (for Agus, not the implementer)

1. Create the Firebase project, enable the Google provider, and add `localhost` and `careerbreak.stiawan.site` to the authorized domains. Create a service account key for the `FIREBASE_*` admin vars.
2. Create the Supabase project and copy the **transaction pooler** connection string into `DATABASE_URL`.
3. In Dokploy: create an app from this repo with Dockerfile `apps/careerbreak/Dockerfile` and build context the repo root. Set the 4 `NEXT_PUBLIC_*` values as build args and the 5 runtime vars as env. Point `careerbreak.stiawan.site` to it on port 3000.
