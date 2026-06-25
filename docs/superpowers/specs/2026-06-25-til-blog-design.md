# TIL Blog — Design Spec

**Date:** 2026-06-25
**Project:** `agusawa` monorepo → `apps/til`

---

## Overview

A personal Today I Learned (TIL) blog — a fully static website. Visitors read articles. Content is managed by dropping Markdown files into the project and rebuilding.

Phase 1 covers core functionality. UI polish is deferred to Phase 2.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Output | Static export (`output: 'export'`) |
| Monorepo tooling | pnpm workspaces |
| Frontmatter parsing | gray-matter |
| Markdown rendering | remark + remark-html |

No syntax highlighting in Phase 1.

---

## Deployment

Self-hosted Dokploy server. The static `out/` directory is served directly. No base path needed — app sits at the root of a custom domain. `trailingSlash: true` ensures clean URLs work without server-side rewrites.

---

## Monorepo Shell

```
agusawa/
├── apps/
│   └── til/
├── package.json          # root — name: agusawa, private: true, engines only
└── pnpm-workspace.yaml   # packages: ['apps/*']
```

No root dependencies. `apps/til` is fully self-contained. Future apps drop into `apps/`.

---

## Scaffold Approach

`pnpm create next-app` inside `apps/til` — provides Next.js + TypeScript + Tailwind wired correctly out of the box. Boilerplate is stripped; custom structure applied on top.

---

## `apps/til` Structure

```
apps/til/
├── content/
│   └── til/
│       └── YYYY-MM-DD-slug.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Article list (Server Component)
│   │   └── til/
│   │       └── [slug]/
│   │           └── page.tsx            # Article detail (Server Component)
│   ├── components/
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleFilters.tsx
│   │   ├── ArticleListClient.tsx
│   │   └── ArticleContent.tsx
│   └── lib/
│       └── til.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## `next.config.ts`

```ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}
export default nextConfig
```

---

## Content Management

### Location
```
apps/til/content/til/
```

### File naming
```
YYYY-MM-DD-slug-title.md
```
Example: `2025-06-25-docker-multi-stage-build.md`

### Frontmatter schema

```markdown
---
title: "Your article title"
date: "2025-06-25"
language: "ID"
tags: ["docker", "devops"]
summary: "Optional short description shown on the article card."
---
```

| Field | Type | Required |
|---|---|---|
| `title` | `string` | Yes |
| `date` | `string` (YYYY-MM-DD) | Yes |
| `language` | `"ID"` \| `"EN"` | Yes |
| `tags` | `string[]` | Yes |
| `summary` | `string` | No |

---

## Data Layer — `lib/til.ts`

Build-time only. Never imported in client components.

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
  slug: string    // derived from filename
  content: string // raw Markdown body
}
```

### Functions

| Function | Returns | Notes |
|---|---|---|
| `getAllArticles()` | `TILArticle[]` | Sorted by date descending |
| `getArticleBySlug(slug)` | `TILArticle \| null` | Single article lookup |
| `getAllTags()` | `string[]` | Unique tags, alphabetically sorted |
| `getAllSlugs()` | `string[]` | Used in `generateStaticParams` |

### Slug derivation

```
2025-06-25-docker-multi-stage-build.md  →  docker-multi-stage-build
```

Strip leading `YYYY-MM-DD-` prefix and `.md` extension.

### Error handling

Malformed or missing frontmatter → log a warning, skip the file. Build never crashes on bad content.

---

## Pages

### `/` — Article List

- Server Component fetches all articles at build time
- Passes full article list + all tags as props to `ArticleListClient`
- Articles sorted newest first

### `/til/[slug]/` — Article Detail

- Server Component fetches article by slug at build time
- `generateStaticParams` returns all slugs
- Renders full Markdown as HTML
- Shows: title, date, language badge, tags
- "← Back" link to article list

---

## Components

| Component | Type | Responsibility |
|---|---|---|
| `ArticleListClient` | Client (`'use client'`) | Reads URL params, filters articles, renders list |
| `ArticleFilters` | Client | Language toggle (All / ID / EN) + tag multi-select |
| `ArticleCard` | Client | Title, date, language badge, tags, summary |
| `ArticleContent` | Client | Renders Markdown HTML via `dangerouslySetInnerHTML` |

---

## Client-Side Filter Architecture

```
page.tsx (Server Component)
  ↓ getAllArticles() at build time
  ↓ passes articles + tags as props
ArticleListClient ('use client')
  ↓ useSearchParams() → reads current filter state
  ↓ filters client-side
  ↓ renders ArticleFilters + ArticleCard list
```

### URL params

| Param | Values | Example |
|---|---|---|
| `lang` | `ID`, `EN`, or omit | `?lang=EN` |
| `tags` | comma-separated | `?tags=docker,nextjs` |

### Filter logic

- AND logic: article must match selected language AND all selected tags
- No language selected = show all languages
- No tags selected = show all tags
- `useRouter` to push updated params on filter change — no full page reload

---

## Dependencies

```json
{
  "dependencies": {
    "gray-matter": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "remark": "latest",
    "remark-html": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "tailwindcss": "latest",
    "typescript": "latest"
  }
}
```

---

## Phase 1 Scope

- Monorepo root shell (pnpm workspaces)
- `apps/til` scaffolded via `create-next-app`
- Markdown content management in `content/til/`
- Article list page with language + tag filters
- URL-based filter state
- Article detail page with Markdown rendering (no syntax highlighting)
- Fully static export to `out/`

## Phase 2 — Deferred

- UI design polish
- Syntax highlighting
- Reading time estimate
- Full-text search
- Pagination or infinite scroll
- RSS feed
- SEO metadata (Open Graph, Twitter Card)
- Related articles section
