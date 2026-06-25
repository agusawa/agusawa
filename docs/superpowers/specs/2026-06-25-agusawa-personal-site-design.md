# Personal Website — agusawa — Design Spec

**Date:** 2026-06-25
**App:** `apps/agusawa`

## Overview

A simple personal website for Agus Stiawan. Single page, static output. Not a portfolio — no projects, no case studies. The goal is to show who Agus is, what he does, and where to find his writing.

## Stack

- Next.js 16 (`output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`)
- TypeScript (strict mode)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- `next-themes` for light/dark mode
- `lucide-react` for icons
- Geist font (same as `apps/til`)

## Architecture

```text
apps/agusawa/
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── src/
│   ├── app/
│   │   ├── globals.css       # Tailwind v4 + theme tokens
│   │   ├── layout.tsx        # Root layout with ThemeProvider + metadata
│   │   └── page.tsx          # Composes all section components
│   └── components/
│       ├── ThemeProvider.tsx
│       ├── ThemeToggle.tsx
│       ├── Header.tsx
│       ├── Hero.tsx
│       ├── About.tsx
│       ├── WhatIDo.tsx
│       ├── Now.tsx
│       ├── Writing.tsx
│       └── Contact.tsx
```

## Approach

Section components (Option B): `page.tsx` composes named section components. Each component is a standalone file. No shared primitives beyond what Tailwind provides.

## Visual Design

- **Layout**: `max-w-2xl mx-auto px-6` — same narrow centered column as `apps/til`
- **Font**: Geist (`--font-geist` variable, same setup as til)
- **Colors (light)**: `bg-white text-zinc-900`
- **Colors (dark)**: `bg-zinc-950 text-zinc-100`
- **Section dividers**: `border-t border-zinc-200 dark:border-zinc-800` with `py-12` vertical spacing
- **Section labels**: small uppercase `text-xs tracking-widest text-zinc-500` above each heading
- **Accent/links**: `text-emerald-600` (matches til)
- **Theme toggle**: lucide-react sun/moon icon button, top-right of header
- **No avatar, no hero image** — pure text
- **No sticky nav, no animations**

## Page Sections & Content

### Header

- Left: `Agus Stiawan` (site name/logo, text)
- Right: theme toggle (sun/moon)

### Hero

- Name: **Agus Stiawan**
- Role: Software Engineer
- Intro: "I build web applications and tools that are simple to use and easy to maintain."

### About

> I'm a software engineer based in Indonesia. I enjoy working on backend systems, APIs, and the occasional frontend challenge. I like keeping things straightforward — readable code, clear structure, no unnecessary complexity.

### What I Do

> I work on web application development — from designing APIs and backend services to building user interfaces. I care about writing clean, maintainable code and delivering work that is reliable and easy to hand off.

### Now

> Lately I've been focused on improving my system design thinking and deepening my understanding of frontend performance. I'm also exploring TypeScript patterns and writing more consistently.

### Writing

> I keep a public log of things I pick up while building — small notes, discoveries, and lessons learned along the way.
>
> Link: [til.agus.stiawan.site](https://til.agus.stiawan.site)

### Contact

- Email: [agus.stiawan2211@gmail.com](mailto:agus.stiawan2211@gmail.com)
- GitHub: [github.com/agusawa](https://github.com/agusawa)
- LinkedIn: [linkedin.com/in/agus-stiawan](https://www.linkedin.com/in/agus-stiawan/)
- Upwork: [upwork.com/freelancers/~01d0b8f3ba3b6eb392](https://www.upwork.com/freelancers/~01d0b8f3ba3b6eb392)

Contact rendered as a clean list of icon + label + link rows using lucide-react icons.

## Constraints

- No projects, portfolio items, or case studies
- Static export only — no server-side features
- All content is hardcoded (no CMS, no MDX)
- Must match visual identity of `apps/til`

## Out of Scope

- Analytics
- Contact form (email link only)
- RSS feed
- Sitemap (can add later)
