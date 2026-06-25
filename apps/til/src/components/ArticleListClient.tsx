'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import type { TILArticle } from '@/lib/til'
import ArticleCard from './ArticleCard'
import ArticleFilters from './ArticleFilters'
import ThemeToggle from './ThemeToggle'

interface Props {
  articles: TILArticle[]
  tags: string[]
}

export default function ArticleListClient({ articles, tags }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const lang = searchParams.get('lang') as 'ID' | 'EN' | null
  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) ?? []

  const filtered = articles.filter((article) => {
    if (lang && article.language !== lang) return false
    if (selectedTags.length > 0 && !selectedTags.every((t) => article.tags.includes(t)))
      return false
    return true
  })

  function updateParams(newLang: string | null, newTags: string[]) {
    const params = new URLSearchParams()
    if (newLang) params.set('lang', newLang)
    if (newTags.length > 0) params.set('tags', newTags.join(','))
    const qs = params.toString()
    router.push(qs ? `/?${qs}` : '/')
  }

  return (
    <div>
      <header className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <p className="font-mono text-xs text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">
            agusawa
          </p>
          <ThemeToggle />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Today I Learned</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm leading-relaxed">
          Things picked up while building, reading, and breaking stuff.
        </p>
      </header>

      <ArticleFilters
        tags={tags}
        selectedLang={lang}
        selectedTags={selectedTags}
        onChange={updateParams}
      />

      <div className="border-t border-zinc-200 dark:border-zinc-800">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
              no entries match the selected filters
            </p>
          </div>
        ) : (
          filtered.map((article) => <ArticleCard key={article.slug} article={article} />)
        )}
      </div>

      <footer className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <p className="font-mono text-xs text-zinc-400 dark:text-zinc-700">
          {articles.length} {articles.length === 1 ? 'entry' : 'entries'} total
        </p>
      </footer>
    </div>
  )
}
