import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type Language = 'ID' | 'EN'

export interface TILFrontmatter {
  title: string
  date: string
  language: Language
  tags: string[]
  summary?: string
}

export interface TILArticle extends TILFrontmatter {
  slug: string
  content: string
}

const CONTENT_DIR =
  process.env.TIL_CONTENT_DIR ?? path.join(process.cwd(), 'content', 'til')

function deriveSlug(filename: string): string {
  return filename.replace(/^\d{2}-/, '').replace(/\.md$/, '')
}

function findArticleFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return findArticleFiles(entryPath)
    return entry.name.endsWith('.md') ? [entryPath] : []
  })
}

function parseArticle(filePath: string): TILArticle | null {
  const filename = path.basename(filePath)
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)

    if (!data.title || !data.date || !data.language || !data.tags) {
      console.warn(`[til] Missing required frontmatter in ${filename}, skipping`)
      return null
    }

    return {
      slug: deriveSlug(filename),
      title: data.title as string,
      date: data.date as string,
      language: data.language as Language,
      tags: data.tags as string[],
      summary: data.summary as string | undefined,
      content,
    }
  } catch (err) {
    console.warn(`[til] Failed to parse ${filename}:`, err)
    return null
  }
}

export function getAllArticles(): TILArticle[] {
  const files = findArticleFiles(CONTENT_DIR)
  return files
    .map(parseArticle)
    .filter((a): a is TILArticle => a !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getArticleBySlug(slug: string): TILArticle | null {
  return getAllArticles().find((a) => a.slug === slug) ?? null
}

export function getAllTags(): string[] {
  const tags = getAllArticles().flatMap((a) => a.tags)
  return [...new Set(tags)].sort()
}

export function getAllSlugs(): string[] {
  return getAllArticles().map((a) => a.slug)
}
