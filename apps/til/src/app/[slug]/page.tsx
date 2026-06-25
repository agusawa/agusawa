import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { remark } from 'remark'
import html from 'remark-html'
import { getAllSlugs, getArticleBySlug } from '@/lib/til'
import { buildMetadata, buildArticleJsonLd } from '@/lib/seo'
import ArticleContent from '@/components/ArticleContent'
import ThemeToggle from '@/components/ThemeToggle'

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  return buildMetadata(article)
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const processed = await remark().use(html).process(article.content)
  const contentHtml = processed.toString()
  const jsonLd = buildArticleJsonLd(article)

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\//g, '<\\/') }}
      />
      <div className="flex items-center justify-between mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors duration-150"
        >
          <span aria-hidden>←</span>
          <span>back</span>
        </Link>
        <ThemeToggle />
      </div>

      <header className="mb-10 pb-8 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4">
          <time className="font-mono text-xs text-zinc-400 dark:text-zinc-500">{article.date}</time>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded-sm">
            {article.language}
          </span>
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <ArticleContent html={contentHtml} />
    </article>
  )
}
