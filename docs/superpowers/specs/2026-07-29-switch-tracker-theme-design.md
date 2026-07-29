# Switch Tracker: Auto/Light/Dark Theme

## Context

`apps/switch-tracker` is a React 19 + Tailwind v4 (Vite) single-page app with no
theming today — all components use a fixed light `stone-*` palette. This spec
adds a three-state theme (auto / light / dark) with a header toggle.

## Goals

- Default to the OS theme (`prefers-color-scheme`) on first load.
- Let the user override to explicit light or dark via a single toggle button.
- Persist the explicit override across reloads; "auto" tracks OS changes live.
- No flash of the wrong theme on page load.
- Cover every existing component's color classes with dark equivalents.

## Non-goals

- No per-project or multi-theme (e.g. custom accent colors) support.
- No settings page — the toggle is the only theme control.

## Approach

### 1. Tailwind class-based dark mode

Add to `src/index.css`, after the existing `@import "tailwindcss";`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

This opts Tailwind v4 into class-based dark mode (`dark:` variants apply when
an ancestor has the `dark` class) instead of the default `prefers-color-scheme`
media strategy, since we need JS to control the class for the manual override.

### 2. `useTheme` hook — `src/useTheme.ts`

```ts
type ThemeSetting = "auto" | "light" | "dark";
```

- Reads initial state from `localStorage.getItem("theme")`, defaulting to
  `"auto"` if absent or invalid.
- An effect computes the *resolved* mode:
  - `"auto"` → read `window.matchMedia("(prefers-color-scheme: dark)").matches`
  - `"light"` / `"dark"` → use directly
- Applies/removes the `dark` class on `document.documentElement` to match the
  resolved mode.
- While in `"auto"`, subscribes to the media query's `change` event so the
  resolved mode updates live without a reload; unsubscribes on cleanup or when
  leaving auto.
- `setTheme(next: ThemeSetting)`:
  - `"auto"` → `localStorage.removeItem("theme")`
  - otherwise → `localStorage.setItem("theme", next)`
- Exposes `cycleTheme()` which advances `auto → light → dark → auto`.
- Return value: `{ theme: ThemeSetting, cycleTheme: () => void }`.

### 3. `ThemeToggle` component — `src/components/ThemeToggle.tsx`

- Single `<button>` in the app header, next to `RestTimer`.
- Icon reflects current `theme` state: monitor icon (auto), sun icon (light),
  moon icon (dark) — inline SVGs, no new dependency.
- `aria-label` / `title` states the current mode and that clicking cycles it,
  e.g. `"Theme: auto (click to change)"`.
- Calls `cycleTheme()` on click.

### 4. Flash prevention — `index.html`

Add an inline `<script>` in `<head>`, before the stylesheet link, that
synchronously reads `localStorage.theme` and `matchMedia`, then sets the
`dark` class on `<html>` before first paint:

```html
<script>
  (function () {
    var stored = localStorage.getItem("theme");
    var dark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  })();
</script>
```

This mirrors the hook's resolution logic so the class the hook applies on
mount matches what's already there — no visible flip.

### 5. Dark variants across existing components

Add a `dark:` counterpart next to every existing color utility. Mapping used
throughout:

| Light class | Dark addition |
|---|---|
| `bg-white` (page/cards) | `dark:bg-stone-900` (page), `dark:bg-stone-800` (cards) |
| `bg-stone-50` (banner) | `dark:bg-stone-800/60` |
| `bg-stone-800` (primary button, toast) | `dark:bg-stone-700` |
| `bg-stone-700` (button hover) | `dark:bg-stone-600` |
| `text-stone-800` | `dark:text-stone-100` |
| `text-stone-700` | `dark:text-stone-300` |
| `text-stone-500` | `dark:text-stone-400` |
| `text-stone-400` | `dark:text-stone-500` |
| `border-stone-200` / `border-stone-300` | `dark:border-stone-700` |
| `border-stone-500` (focus) | `dark:border-stone-400` |
| `ring-stone-400` | `dark:ring-stone-500` |
| status dot/text colors (amber/blue/emerald, `bg-*-500`/`text-*-600`) | unchanged — already legible on dark surfaces |
| `text-red-500` (delete hover) | unchanged |

Files touched: `App.tsx` (root container gets `bg-white dark:bg-stone-900`,
header title text), `ProjectCard.tsx`, `AddProjectForm.tsx`,
`FocusBanner.tsx`, `CapWarning.tsx`, `RestTimer.tsx`, `Toast.tsx`.

## Testing

- Manual: toggle through all three states in the browser, verify OS-level
  theme change is picked up live while in "auto", verify no flash on reload
  after choosing an explicit theme, verify persistence across reload.
- `npm run typecheck` / `npm run build` in `apps/switch-tracker` must pass
  (build already runs `tsc --noEmit`).
