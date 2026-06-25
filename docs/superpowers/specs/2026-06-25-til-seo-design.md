# TIL SEO — Design Spec

**Date:** 2026-06-25  
**Scope:** `apps/til`  
**Approach:** Centralized `lib/seo.ts` utility (Option B)

---

## Problem

The `apps/til` Next.js app has minimal SEO coverage:

- Root layout metadata has no Open Graph, Twitter card, or canonical URL
- Article pages have no `generateMetadata` — every article serves the same `<title>TIL</title>`
- The `summary` frontmatter field is never used for meta descriptions
- No `sitemap.xml` or `robots.txt`
- `html[lang]` is always `"en"` regardless of the article's `language` field (ID/EN)
- No structured data (JSON-LD)

---

## Goals

- Per-article `<title>`, `<meta description>`, Open Graph, and Twitter card tags
- Canonical URLs for all pages
- `sitemap.xml` listing all articles with last-modified dates
- `robots.txt` pointing crawlers to the sitemap
- JSON-LD `Article` structured data on each article page
- Correct `html[lang]` per article (ID/EN)

---

## Out of Scope

- Analytics or tracking
- Search Console integration
- Social sharing images (og:image)

---

## Environment

A single required env variable drives all absolute URLs:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Documented in `.env.example`. The build fails fast (throws) if this variable is missing, preventing silent broken canonical/OG URLs in production.

---

## Architecture

### `src/lib/seo.ts` (new)

Central SEO utility. Three exports:

**`siteUrl(): string`**  
Reads `NEXT_PUBLIC_SITE_URL`. Throws at build time if not set.

**`buildMetadata(article: TILArticle): Metadata`**  
Returns a Next.js `Metadata` object:
- `title`: `"${article.title} — TIL"`
- `description`: `article.summary` (falls back to a generic description if absent)
- `alternates.canonical`: `${siteUrl()}/${article.slug}/`
- `openGraph.type`: `"article"`
- `openGraph.title`, `openGraph.description`, `openGraph.url`: from article
- `openGraph.publishedTime`: `article.date`
- `twitter.card`: `"summary"`
- `twitter.title`, `twitter.description`: from article

**`buildArticleJsonLd(article: TILArticle): object`**  
Returns a JSON-LD `Article` schema:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "<article.title>",
  "datePublished": "<article.date>",
  "inLanguage": "<id|en>",
  "url": "<siteUrl>/<slug>/"
}
```

---

### `src/app/layout.tsx` (update)

Update the static `metadata` export:
- Add `metadataBase: new URL(siteUrl())`
- Add `openGraph: { type: 'website', siteName: 'TIL' }`
- Add `twitter: { card: 'summary' }`
- Keep existing `title` and `description` as site-wide defaults/fallbacks

---

### `src/app/[slug]/page.tsx` (update)

- Export `generateMetadata({ params })` — resolves article by slug, calls `buildMetadata(article)`, returns result. Returns empty metadata if article not found (404 handles the page).
- Inject JSON-LD inside the `<article>` element:
  ```tsx
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(article)) }}
  />
  ```

---

### `src/app/[slug]/layout.tsx` (new)

A minimal nested layout that sets `html[lang]` per article. Reads the article by slug from params and returns:
```tsx
<html lang={article.language === 'ID' ? 'id' : 'en'}>
  <body>{children}</body>
</html>
```
This overrides the root layout's `lang="en"` for bilingual correctness.

---

### `src/app/sitemap.ts` (new)

Next.js App Router convention file. Calls `getAllArticles()` and maps each article to:
```ts
{
  url: `${siteUrl()}/${article.slug}/`,
  lastModified: new Date(article.date),
}
```
Also includes the root URL `${siteUrl()}/`. Next.js serializes this to `/sitemap.xml` at build time.

---

### `src/app/robots.ts` (new)

Next.js App Router convention file. Returns:
```ts
{
  rules: { userAgent: '*', allow: '/' },
  sitemap: `${siteUrl()}/sitemap.xml`,
}
```

---

### `.env.example` (new)

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## Data Flow

```
content/til/*.md
      ↓ getAllArticles()
  TILArticle[]
      ↓ buildMetadata()       → Next.js <head> tags (title, og:*, twitter:*)
      ↓ buildArticleJsonLd()  → <script type="application/ld+json">
      ↓ sitemap.ts            → /sitemap.xml
      ↓ robots.ts             → /robots.txt
```

---

## Files Changed / Created

| File | Action |
|------|--------|
| `src/lib/seo.ts` | Create |
| `src/app/layout.tsx` | Update |
| `src/app/[slug]/page.tsx` | Update |
| `src/app/[slug]/layout.tsx` | Create |
| `src/app/sitemap.ts` | Create |
| `src/app/robots.ts` | Create |
| `.env.example` | Create |

---

## Testing

- Build (`next build`) must succeed with `NEXT_PUBLIC_SITE_URL` set
- `out/sitemap.xml` must list all articles
- `out/robots.txt` must reference the sitemap URL
- Article HTML must contain correct `<title>`, `og:title`, `og:description`, and `<script type="application/ld+json">`
- Article HTML `html[lang]` must be `"id"` for ID articles and `"en"` for EN articles
