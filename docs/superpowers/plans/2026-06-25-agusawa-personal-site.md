# Agusawa Personal Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `apps/agusawa`, a single-page static personal site for Agus Stiawan, matching the visual identity of `apps/til`.

**Architecture:** A new Next.js 16 app (static export) in the `apps/*` pnpm workspace. `page.tsx` composes seven section components (Header, Hero, About, WhatIDo, Now, Writing, Contact) that render hardcoded content. `next-themes` handles light/dark via a `.dark` class toggled by a client `ThemeProvider`, mirroring `apps/til`'s setup exactly.

**Tech Stack:** Next.js 16 (`output: 'export'`), TypeScript strict, Tailwind CSS v4 (`@tailwindcss/postcss`), `next-themes`, `lucide-react`, Geist font via `next/font/google`.

## Global Constraints

- No projects, portfolio items, or case studies.
- Static export only (`output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`) — no server-side features.
- All content hardcoded — no CMS, no MDX.
- Must visually match `apps/til`: same layout (`max-w-2xl mx-auto px-6`), same Geist font setup, same light/dark color tokens (`bg-white text-zinc-900` / `bg-zinc-950 text-zinc-100`), same emerald-600 accent, same `.dark`-class theme strategy (not `prefers-color-scheme`).
- No avatar/hero image, no sticky nav, no animations.
- Out of scope: analytics, contact form, RSS feed, sitemap.

---

### Task 1: Scaffold the app (package.json, configs, tooling)

**Files:**
- Create: `apps/agusawa/package.json`
- Create: `apps/agusawa/next.config.ts`
- Create: `apps/agusawa/tsconfig.json`
- Create: `apps/agusawa/postcss.config.mjs`
- Create: `apps/agusawa/eslint.config.mjs`
- Create: `apps/agusawa/.gitignore`
- Create: `apps/agusawa/next-env.d.ts`

**Interfaces:**
- Produces: a workspace package named `agusawa` with `dev`/`build`/`start`/`lint` scripts, resolvable via pnpm workspace at `apps/agusawa`. Later tasks assume `src/app/*` and `src/components/*` resolve via the `@/*` path alias.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "agusawa",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "lucide-react": "^1.21.0",
    "next": "16.2.9",
    "next-themes": "^0.4.6",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `next.config.ts`**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 5: Create `eslint.config.mjs`**

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

- [ ] **Step 6: Create `.gitignore`**

```text
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 7: Create placeholder `next-env.d.ts`**

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

- [ ] **Step 8: Install dependencies from repo root**

Run: `cd /Users/agusstiawan/Projects/Personal/agusawa && pnpm install`
Expected: lockfile updates, `apps/agusawa/node_modules` populated (hoisted via workspace), no errors.

- [ ] **Step 9: Commit**

```bash
git add apps/agusawa/package.json apps/agusawa/next.config.ts apps/agusawa/tsconfig.json apps/agusawa/postcss.config.mjs apps/agusawa/eslint.config.mjs apps/agusawa/.gitignore apps/agusawa/next-env.d.ts pnpm-lock.yaml
git commit -m "chore(agusawa): scaffold app package and tooling config"
```

---

### Task 2: Global styles, fonts, and root layout

**Files:**
- Create: `apps/agusawa/src/app/globals.css`
- Create: `apps/agusawa/src/app/layout.tsx`
- Create: `apps/agusawa/src/components/ThemeProvider.tsx`

**Interfaces:**
- Consumes: nothing from Task 1 beyond the configs.
- Produces: `ThemeProvider` (default export, wraps children, `attribute="class"` `defaultTheme="system"` `enableSystem`) used by `layout.tsx`. `layout.tsx` exports default `RootLayout({ children })` and a `metadata` object. Geist font CSS variables `--font-geist`/`--font-geist-mono` and Tailwind theme tokens are available globally for all later components.

- [ ] **Step 1: Create `src/app/globals.css`**

```css
@import "tailwindcss";

/* Use .dark class instead of prefers-color-scheme.
   next-themes handles system detection in JS and applies/removes .dark on <html>. */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}
```

- [ ] **Step 2: Create `src/components/ThemeProvider.tsx`**

```tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
```

- [ ] **Step 3: Create `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: 'Agus Stiawan',
  description: 'Software Engineer — I build web applications and tools that are simple to use and easy to maintain.',
  openGraph: {
    type: 'website',
    siteName: 'Agus Stiawan',
  },
  twitter: {
    card: 'summary',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans antialiased min-h-screen transition-colors duration-200">
        <ThemeProvider>
          <div className="max-w-2xl mx-auto px-6 pt-8 pb-12">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Create a temporary placeholder `src/app/page.tsx` so the app builds**

```tsx
export default function Home() {
  return <main>Placeholder</main>
}
```

(This file is overwritten in Task 8.)

- [ ] **Step 5: Verify dev server boots**

Run: `cd apps/agusawa && pnpm dev`
Expected: server starts on localhost (e.g. port 3000/3001), visiting it shows "Placeholder" with no console errors. Stop the server after confirming (Ctrl-C).

- [ ] **Step 6: Commit**

```bash
git add apps/agusawa/src/app/globals.css apps/agusawa/src/app/layout.tsx apps/agusawa/src/components/ThemeProvider.tsx apps/agusawa/src/app/page.tsx
git commit -m "feat(agusawa): add root layout, theme provider, and global styles"
```

---

### Task 3: ThemeToggle component

**Files:**
- Create: `apps/agusawa/src/components/ThemeToggle.tsx`

**Interfaces:**
- Consumes: `useTheme` from `next-themes` (available globally via `ThemeProvider` from Task 2).
- Produces: `ThemeToggle` default export, a self-contained client component with no props. Used by `Header` in Task 4.

- [ ] **Step 1: Create `src/components/ThemeToggle.tsx`**

```tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'

const OPTIONS = [
  { value: 'system', label: 'Auto', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!mounted) return null

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0]
  const CurrentIcon = current.icon

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1.5 rounded-sm border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors duration-150"
      >
        <CurrentIcon size={12} strokeWidth={1.75} />
        <span>{current.label}</span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="M1 2.5l3 3 3-3" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Color theme"
          className="absolute right-0 top-full mt-1 min-w-30 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg shadow-black/5 dark:shadow-black/40 py-1 z-50"
        >
          {OPTIONS.map((opt) => {
            const Icon = opt.icon
            const active = theme === opt.value
            return (
              <li key={opt.value} role="option" aria-selected={active}>
                <button
                  onClick={() => { setTheme(opt.value); setOpen(false) }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 font-mono text-[11px] transition-colors duration-100 ${
                    active
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon size={12} strokeWidth={active ? 2 : 1.75} />
                  <span>{opt.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/agusawa/src/components/ThemeToggle.tsx
git commit -m "feat(agusawa): add ThemeToggle component"
```

---

### Task 4: Header component

**Files:**
- Create: `apps/agusawa/src/components/Header.tsx`

**Interfaces:**
- Consumes: `ThemeToggle` default export from Task 3 (`@/components/ThemeToggle`).
- Produces: `Header` default export, no props. Used by `page.tsx` in Task 8.

- [ ] **Step 1: Create `src/components/Header.tsx`**

```tsx
import ThemeToggle from '@/components/ThemeToggle'

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4">
      <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100">Agus Stiawan</span>
      <ThemeToggle />
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/agusawa/src/components/Header.tsx
git commit -m "feat(agusawa): add Header component"
```

---

### Task 5: Hero component

**Files:**
- Create: `apps/agusawa/src/components/Hero.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `Hero` default export, no props. Used by `page.tsx` in Task 8.

- [ ] **Step 1: Create `src/components/Hero.tsx`**

```tsx
export default function Hero() {
  return (
    <section className="py-12">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Agus Stiawan</h1>
      <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">Software Engineer</p>
      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        I build web applications and tools that are simple to use and easy to maintain.
      </p>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/agusawa/src/components/Hero.tsx
git commit -m "feat(agusawa): add Hero component"
```

---

### Task 6: About, WhatIDo, and Now components

**Files:**
- Create: `apps/agusawa/src/components/About.tsx`
- Create: `apps/agusawa/src/components/WhatIDo.tsx`
- Create: `apps/agusawa/src/components/Now.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `About`, `WhatIDo`, `Now` default exports, no props. Used by `page.tsx` in Task 8. Each shares the same section-divider/label pattern, established here for `Writing` (Task 7) to follow.

- [ ] **Step 1: Create `src/components/About.tsx`**

```tsx
export default function About() {
  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800">
      <p className="text-xs uppercase tracking-widest text-zinc-500">About</p>
      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        I&apos;m a software engineer based in Indonesia. I enjoy working on backend systems, APIs, and the
        occasional frontend challenge. I like keeping things straightforward — readable code, clear structure,
        no unnecessary complexity.
      </p>
    </section>
  )
}
```

- [ ] **Step 2: Create `src/components/WhatIDo.tsx`**

```tsx
export default function WhatIDo() {
  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800">
      <p className="text-xs uppercase tracking-widest text-zinc-500">What I Do</p>
      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        I work on web application development — from designing APIs and backend services to building user
        interfaces. I care about writing clean, maintainable code and delivering work that is reliable and easy
        to hand off.
      </p>
    </section>
  )
}
```

- [ ] **Step 3: Create `src/components/Now.tsx`**

```tsx
export default function Now() {
  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Now</p>
      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        Lately I&apos;ve been focused on improving my system design thinking and deepening my understanding of
        frontend performance. I&apos;m also exploring TypeScript patterns and writing more consistently.
      </p>
    </section>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/agusawa/src/components/About.tsx apps/agusawa/src/components/WhatIDo.tsx apps/agusawa/src/components/Now.tsx
git commit -m "feat(agusawa): add About, WhatIDo, and Now components"
```

---

### Task 7: Writing and Contact components

**Files:**
- Create: `apps/agusawa/src/components/Writing.tsx`
- Create: `apps/agusawa/src/components/Contact.tsx`

**Interfaces:**
- Consumes: `Mail`, `Github`, `Linkedin`, `Briefcase` icons from `lucide-react`.
- Produces: `Writing`, `Contact` default exports, no props. Used by `page.tsx` in Task 8.

- [ ] **Step 1: Create `src/components/Writing.tsx`**

```tsx
export default function Writing() {
  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Writing</p>
      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        I keep a public log of things I pick up while building — small notes, discoveries, and lessons learned
        along the way.
      </p>
      <a
        href="https://til.agus.stiawan.site"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-emerald-600 hover:underline"
      >
        til.agus.stiawan.site
      </a>
    </section>
  )
}
```

- [ ] **Step 2: Create `src/components/Contact.tsx`**

```tsx
import { Briefcase, Github, Linkedin, Mail } from 'lucide-react'

const LINKS = [
  {
    icon: Mail,
    label: 'agus.stiawan2211@gmail.com',
    href: 'mailto:agus.stiawan2211@gmail.com',
  },
  {
    icon: Github,
    label: 'github.com/agusawa',
    href: 'https://github.com/agusawa',
  },
  {
    icon: Linkedin,
    label: 'linkedin.com/in/agus-stiawan',
    href: 'https://www.linkedin.com/in/agus-stiawan/',
  },
  {
    icon: Briefcase,
    label: 'upwork.com/freelancers/~01d0b8f3ba3b6eb392',
    href: 'https://www.upwork.com/freelancers/~01d0b8f3ba3b6eb392',
  },
] as const

export default function Contact() {
  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Contact</p>
      <ul className="mt-4 space-y-3">
        {LINKS.map(({ icon: Icon, label, href }) => (
          <li key={href}>
            <a
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150"
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/agusawa/src/components/Writing.tsx apps/agusawa/src/components/Contact.tsx
git commit -m "feat(agusawa): add Writing and Contact components"
```

---

### Task 8: Compose the page and verify build/export

**Files:**
- Modify: `apps/agusawa/src/app/page.tsx` (replace Task 2's placeholder)

**Interfaces:**
- Consumes: `Header` (Task 4), `Hero` (Task 5), `About`/`WhatIDo`/`Now` (Task 6), `Writing`/`Contact` (Task 7) — all default exports from `@/components/*`.
- Produces: the final composed home page. Nothing downstream depends on this.

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import WhatIDo from '@/components/WhatIDo'
import Now from '@/components/Now'
import Writing from '@/components/Writing'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <About />
      <WhatIDo />
      <Now />
      <Writing />
      <Contact />
    </>
  )
}
```

- [ ] **Step 2: Run lint**

Run: `cd apps/agusawa && pnpm lint`
Expected: no errors.

- [ ] **Step 3: Run static export build**

Run: `cd apps/agusawa && pnpm build`
Expected: build succeeds, `apps/agusawa/out/index.html` is generated, no type errors.

- [ ] **Step 4: Visual smoke test in dev server**

Run: `cd apps/agusawa && pnpm dev`
Open the printed localhost URL in a browser. Confirm:
- All seven sections render in order with the spec's content.
- Theme toggle cycles Auto/Light/Dark and colors update (emerald-600 accent, zinc backgrounds).
- Contact links have correct hrefs (hover to check status bar) and external links open in new tabs.
- Writing section links to `til.agus.stiawan.site`.
Stop the server after confirming (Ctrl-C).

- [ ] **Step 5: Commit**

```bash
git add apps/agusawa/src/app/page.tsx
git commit -m "feat(agusawa): compose home page from section components"
```

---

## Self-Review Notes

- **Spec coverage:** Header/ThemeToggle (Tasks 3-4), Hero (Task 5), About/WhatIDo/Now (Task 6), Writing/Contact (Task 7), page composition (Task 8), stack/config/visual rules (Tasks 1-2) — all spec sections covered. Out-of-scope items (analytics, contact form, RSS, sitemap) intentionally omitted.
- No TDD/unit tests included — this app is static hardcoded JSX content with no business logic to unit test, consistent with the spec's "no CMS, no MDX" simplicity goal. Verification is via lint, static build, and manual visual smoke test (Task 8).
