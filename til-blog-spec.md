# TIL Blog — `apps/til`

> Part of the **agusawa** monorepo.

## Overview

A personal **Today I Learned (TIL)** blog — a fully static website hosted under `apps/til` inside the `agusawa` monorepo. Visitors can only read articles. Content is managed by adding Markdown files directly into the project, then running a rebuild to publish.

**Phase 1:** Functionality only — UI polish is deferred to Phase 2.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Output | Static export (`output: 'export'`) |
| Monorepo tooling | pnpm workspaces |

---

## Monorepo Context

This project lives inside the `agusawa` monorepo. The full monorepo structure is:

```
agusawa/                          # Monorepo root
├── apps/
│   ├── til/                      # ← This project
│   ├── desktop-mac/              # Tauri menu bar app for macOS (future)
│   ├── api/                      # Express + Prisma + Swagger API (future)
│   └── web/                      # Vite + React dashboard for client/freelancer (future)
├── packages/
│   ├── contracts/                # Shared API DTOs, Zod schemas, types
│   ├── sdk/                      # Typed API client
│   ├── config/                   # Shared tsconfig / ESLint / env helpers
│   └── ui/                       # Optional shared UI primitives
├── package.json                  # Root workspace config
└── pnpm-workspace.yaml
```

The `til` app is self-contained and does not depend on any internal packages in Phase 1. It can reference `packages/config` for shared `tsconfig` and ESLint rules if already available.

---

## Project Structure

```
apps/til/
├── content/
│   └── til/
│       └── YYYY-MM-DD-slug.md        # Article Markdown files live here
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home — article list page (Server Component)
│   │   └── til/
│   │       └── [slug]/
│   │           └── page.tsx          # Article detail page
│   ├── components/
│   │   ├── ArticleCard.tsx           # Card for list view
│   │   ├── ArticleFilters.tsx        # Language + tag filter UI (Client Component)
│   │   ├── ArticleListClient.tsx     # Client wrapper — handles filter state + rendering
│   │   └── ArticleContent.tsx        # Renders Markdown body as HTML
│   └── lib/
│       └── til.ts                    # Build-time content parsing utilities
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Content Management

### File Location

```
apps/til/content/til/
```

### Naming Convention

```
YYYY-MM-DD-slug-title.md
```

Example: `2025-06-25-docker-multi-stage-build.md`

### Frontmatter Schema

Every article **must** include a frontmatter block at the top.

```markdown
---
title: "Your article title"
date: "2025-06-25"
language: "ID"
tags: ["docker", "devops"]
summary: "Optional short description shown on the article card."
---

Article body starts here...
```

#### Field Reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | `string` | Yes | Article title |
| `date` | `string` | Yes | Format: `YYYY-MM-DD` |
| `language` | `"ID"` \| `"EN"` | Yes | Indonesian or English |
| `tags` | `string[]` | Yes | One or more tags; lowercase, hyphenated preferred |
| `summary` | `string` | No | Short description shown on the article card |

### Publishing Workflow

```bash
# 1. Add a new .md file to apps/til/content/til/
# 2. Rebuild
pnpm --filter til build
# 3. Deploy the generated apps/til/out/ directory to your static host
```

---

## Pages & Routing

### `/` — Article List

- Displays all articles as cards, sorted by **date descending** (newest first)
- Filter by **language**: All | ID | EN
- Filter by **tags**: multi-select; shows all unique tags from all articles
- Filters combine with **AND logic** — articles must match both selected language and all selected tags
- Selecting no language filter = show all languages; selecting no tags = show all tags
- Filter state is persisted in **URL query params** (e.g., `/?lang=ID&tags=docker,nextjs`)
- Each article card shows: title, date, language badge, tags, summary (if provided)

### `/til/[slug]` — Article Detail

- Renders the full Markdown body as HTML
- Displays: title, date, language badge, tags
- Supports Markdown: headings, paragraphs, bold/italic, inline code, code blocks (with syntax highlighting), blockquotes, ordered/unordered lists, links, images, horizontal rules
- Includes a **"← Back"** link to return to the article list

---

## Data Layer — `lib/til.ts`

All content is parsed **at build time** only. No runtime content fetching.

### Types

```ts
export type Language = 'ID' | 'EN'

export interface TILFrontmatter {
  title: string
  date: string
  language: Language
  tags: string[]
  summary?: string
}

export interface TILArticle extends TILFrontmatter {
  slug: string      // Derived from filename — strip date prefix and .md extension
  content: string   // Raw Markdown body (after frontmatter)
}
```

### Functions

| Function | Returns | Description |
|---|---|---|
| `getAllArticles()` | `TILArticle[]` | All articles, sorted by date descending |
| `getArticleBySlug(slug)` | `TILArticle \| null` | Single article by slug |
| `getAllTags()` | `string[]` | All unique tags, sorted alphabetically |
| `getAllSlugs()` | `string[]` | All slugs (used in `generateStaticParams`) |

### Slug Derivation

Filename → slug:
```
2025-06-25-docker-multi-stage-build.md  →  docker-multi-stage-build
```
Strip the leading date prefix (`YYYY-MM-DD-`) and the `.md` extension.

### Implementation Notes

- Read files using Node.js `fs` and `path` APIs — **server-side / build-time only**, never in client components
- Resolve the `content/til/` directory using `process.cwd()` for reliability inside the monorepo
- If a file has missing or malformed frontmatter fields, **log a warning and skip it** — do not crash the build
- Parse frontmatter with `gray-matter`
- Render Markdown with `remark` + `remark-html`, or use `react-markdown` in `ArticleContent`
- Apply syntax highlighting with `rehype-highlight` (highlight.js) or `rehype-pretty-code` (shiki)

---

## Client-Side Filter Architecture

Because the site uses `output: 'export'`, filtering cannot happen server-side per request. The correct architecture is:

```
page.tsx                      (Server Component)
  ↓ getAllArticles() at build time
  ↓ passes full article list + all tags as props
ArticleListClient.tsx         ('use client')
  ↓ reads URL params via useSearchParams()
  ↓ filters articles client-side
  ↓ renders ArticleFilters + ArticleCard list
```

### URL Query Params

| Param | Values | Example |
|---|---|---|
| `lang` | `ID`, `EN`, or omit for all | `?lang=EN` |
| `tags` | Comma-separated list | `?tags=docker,nextjs` |

Use `useSearchParams` to read current filter state. Use `useRouter` to push updated params when filters change — no full page reload.

---

## Static Export Config

### `next.config.ts`

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,     // generates /til/slug/index.html for clean static URLs
  images: {
    unoptimized: true,     // required for static export — no Next.js image optimization
  },
}

export default nextConfig
```

### `generateStaticParams` (Article Detail Page)

```ts
export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}
```

---

## `package.json` (apps/til)

```json
{
  "name": "til",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint"
  }
}
```

Run from monorepo root:
```bash
pnpm --filter til dev
pnpm --filter til build
```

---

## Dependencies

```bash
# From apps/til
pnpm add gray-matter remark remark-html

# Optional: better syntax highlighting
pnpm add rehype-highlight highlight.js
# or
pnpm add rehype-pretty-code shiki
```

---

## Scope

### Phase 1 — Current

- [x] Markdown-based content management in `content/til/`
- [x] Article list page with language + tag multi-select filters
- [x] URL-based filter state (shareable, browser-back-friendly)
- [x] Article detail page with full Markdown rendering + syntax highlighting
- [x] Fully static export (`out/` directory, no server required)

### Phase 2 — Deferred

- [ ] UI design polish
- [ ] Reading time estimate
- [ ] Full-text search
- [ ] Pagination or infinite scroll
- [ ] RSS feed
- [ ] SEO metadata (Open Graph, Twitter Card)
- [ ] Related articles section
