# Career Break — Design

Date: 2026-10-23
App: `apps/careerbreak` → `careerbreak.stiawan.site`

## Intent

Agus is between jobs starting Monday 19 October 2026. During that time he'll be learning many things and trying many ways to earn money at once. He wants one private place to:

- plan each day as a to-do list,
- set a few goals for each week,
- tag everything so he can see where his effort went,
- look back every Sunday at the past week and write what to improve, so the next week is better.

Success: every Sunday he can open the Review tab and honestly see what he did, what slipped, and which areas got his time, and his "improve" note greets him when he plans the next week.

## Goals

- Daily to-do lists, each item tagged.
- Weekly goals (Monday–Sunday weeks), each tagged.
- Custom tags he creates himself.
- A weekly review page with stats and two notes.
- A counter for how many days the career break has lasted.
- The same data on laptop and phone (real database).
- Only his Google account can get in.

## Non-goals

- Multiple users, sharing, or teams.
- Email/password or email-link sign-in (Google only).
- Shared login with `timetracker.stiawan.site` or other subdomains.
- Time tracking, reminders, notifications, recurring to-dos.
- Removing `apps/switch-tracker` (Agus will do that separately).

## Anti-goals

- Stats that hide what slipped. Unfinished to-dos must count as not done on the day they were planned. They are never silently moved forward.
- Anyone other than the allowed email seeing or changing data.
- A layout that only works on a laptop. It must work well at phone width.

## Decided by Agus

- Name and domain: Career Break, `careerbreak.stiawan.site`.
- Database: MongoDB, connected with a plain `MONGODB_URI` (official `mongodb` driver, no ODM). Changed from Postgres on 2026-10-23 because the Supabase quota was exceeded. MongoDB has no foreign keys, so the app enforces the reference rules in code (see Data).
- Auth: a **new, separate Firebase project** (not timetracker's), **Google sign-in only**, and access limited to one specific email.
- Day 1 of the career break is Monday 19 October 2026 (moved from 26 Oct on 2026-10-23).
- Main screen layout is "Today first" (option A in the mockups). The Review page is as shown below.

## Screens

The header on every screen shows the counter "Day N of your career break" and three tabs: **Today**, **Week**, **Review**.

### Today (default screen)

From top to bottom:

1. **Last week's improve note**, if the previous week has one (amber callout: "From last week: …").
2. **This week's goals**, each showing its tag, title, a hit/not-hit checkbox, and a count of linked to-dos done ("3 to-dos done"). If the current week has no goals, show a prompt to add some. Goals can be added at any time during the week.
3. **Today's to-do list** (heading like "Thursday, 29 Oct"): checkbox, title, tag chip, and an "+ Add a to-do" input. When adding a to-do, he picks a tag (or types a new tag name, which creates it) and can optionally link it to one of this week's goals.
4. **Still open from earlier this week**: unfinished to-dos from earlier days in the current week, each with a "move to today" button. Moving one puts it on today's list, **and its original day still shows it, greyed out as "moved → Thu"**, so the slip stays visible (Agus chose this). Leaving it there keeps it counted as not done on its original day.

### Week

The current week as a list of 7 days (Mon–Sun), each showing its to-dos with checkbox and tag. He can add to-dos to any day, including future days, to plan ahead. Arrows switch to other weeks.

Above the days, the Week tab also shows that week's goals (and lets him add them) and the previous week's improve note. That lets him plan next week on Sunday: flip forward one week, see the note he just wrote, then set goals and to-dos. When adding a to-do, the goal picker offers goals from that to-do's week.

### Review

For one week, with ‹ prev / next › to flip between weeks (default: the current week):

- Header: "Week N · 19 Oct – 25 Oct" (Week 1 starts 19 Oct 2026).
- **To-dos done**: done / total for the week. Each to-do counts once, on the day it ends up on.
- **Moved**: how many to-dos slipped to a later day this week ("3 moved to a later day").
- **By tag**: a bar per tag with done / total.
- **Done per day**: a small bar chart, Mon–Sun.
- **Goals**: each goal marked hit ✓ or missed ✗, plus its linked to-do count.
- **What went well** (free text) and **What to improve next week** (free text), saved for that week. The improve note shows on the following week's Today screen.

Mockups: `.superpowers/brainstorm/54649-1792747859/content/main-layout.html` (option A) and `review-page.html`.

### Settings (small)

A list of tags where he can rename or delete them. Tags get a color automatically when created.

## Rules

- A week is Monday–Sunday. Week number = weeks since Monday 19 Oct 2026, starting at 1.
- Counter: Day N = days since 19 Oct 2026, inclusive (19 Oct = Day 1). Before that date it shows "Starts Monday". There is no end date.
- A to-do belongs to exactly one current date and has exactly one tag. It also remembers the date it was first planned for, so a moved to-do still shows on its original day as "moved". It can optionally link to one goal from the same week.
- A goal belongs to one week and has one tag. He marks it hit himself. The linked to-do count is shown for information only.
- "Today" and dates use the browser's local date (Agus is in Indonesia). The server stores plain dates (`DATE`), not timestamps, for to-dos and weeks.

## Data (shape, not final schema)

- `tags`: name, nameLower (unique index), color
- `goals`: weekStart (date of the Monday), title, tagId, hit (bool)
- `todos`: date (current), plannedDate (first planned day; differs from date once moved), title, tagId, goalId (nullable), done (bool), createdAt
- `weekNotes`: _id = weekStart, wentWell, improve

Dates are stored as `'YYYY-MM-DD'` strings. Rules enforced in code: a tag can't be deleted while used; deleting a goal unlinks its to-dos; a to-do's tag and goal must exist, and the goal must be in the to-do's week.

No user column. The app has exactly one allowed user.

## Auth

- The client signs in with Google through the Firebase JS SDK (popup on desktop; a redirect is fine on mobile if the popup is unreliable).
- The server verifies the Firebase ID token with the Firebase Admin SDK and checks the email against `ALLOWED_EMAIL`. Anything else is rejected with 403. It is safest to then issue an httpOnly session cookie (Firebase session cookies) so server routes can check every request.
- Every data read and write is checked on the server. Hiding UI on the client is not enough.
- Agus will create the Firebase project and enable the Google provider. `careerbreak.stiawan.site` and `localhost` go in Firebase's authorized domains.

## Stack and deploy

- Hosted on **Dokploy**, same as the agusawa site.
- Next.js (same major version as `apps/til` / `apps/agusawa`), TypeScript, Tailwind 4, in the pnpm workspace as `apps/careerbreak`.
- Unlike `til`, this app needs a server (database plus auth checks), so it is **not** a static export. It ships as a Docker image running the Next.js Node server (`output: 'standalone'`), following the shape of `apps/til/Dockerfile`.
- `NEXT_PUBLIC_FIREBASE_*` values are baked in when the app is built, so in Dokploy they must be set as build arguments (and declared as `ARG` in the Dockerfile), not only as runtime env vars.
- No deadline: Agus will put it live when it's ready, so build all screens in one pass.
- Env vars: `MONGODB_URI`, `ALLOWED_EMAIL`, the Firebase web config (`NEXT_PUBLIC_FIREBASE_*`), and Firebase Admin credentials. Provide `.env.example` with names only.

## Left to the builder

- Indexes are created on server start (idempotent).
- Server Actions vs. route handlers.
- Exact visual styling, tag color palette, and whether to add a light/dark toggle. It should at least follow the system light/dark setting, like the other apps.
- Ordering of to-dos within a day.

## Calls made by Claude (not discussed with Agus)

- Unfinished to-dos stay on their day; "move to today" is manual (presented to Agus; he agreed).
- Deleting a tag: block it while to-dos or goals still use it, and show how many use it. (Not discussed.)
- Week tab as a simple 7-day list rather than a board.
- To-dos and goals can be edited (title, tag, goal link) and deleted. Deleting is meant for mistakes and duplicates; it is an explicit action, so it doesn't count as hiding a slip.
- The Week tab carries goals and the previous improve note, so planning next week on Sunday works.
- The app works before Day 1: he can add Monday's goals and to-dos over the weekend while the counter says "Starts Monday".
- Safety: the root `.env.dev` / `.env.prod` hold another project's secrets, are untracked, and are not gitignored. Add `.env*` (except `.env.example`) to `.gitignore` as part of this work.
