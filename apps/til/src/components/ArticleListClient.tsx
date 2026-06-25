'use client'

import { useEffect, useState } from 'react'
import type { TILArticle } from '@/lib/til'
import ArticleCard from './ArticleCard'
import ArticleFilters from './ArticleFilters'
import ThemeToggle from './ThemeToggle'
import Footer from './Footer'

interface Props {
  articles: TILArticle[]
  tags: string[]
}

export default function ArticleListClient({ articles, tags }: Props) {
  const [lang, setLang] = useState<'ID' | 'EN' | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Read initial filter state from the URL after mount so the server-rendered
  // (unfiltered) markup stays intact for static export / SEO.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialLang = params.get('lang') as 'ID' | 'EN' | null
    const initialTags = params.get('tags')?.split(',').filter(Boolean) ?? []
    if (initialLang) setLang(initialLang)
    if (initialTags.length > 0) setSelectedTags(initialTags)
  }, [])

  const filtered = articles.filter((article) => {
    if (lang && article.language !== lang) return false
    if (selectedTags.length > 0 && !selectedTags.every((t) => article.tags.includes(t)))
      return false
    return true
  })

  function updateParams(newLang: string | null, newTags: string[]) {
    setLang(newLang as 'ID' | 'EN' | null)
    setSelectedTags(newTags)

    const params = new URLSearchParams()
    if (newLang) params.set('lang', newLang)
    if (newTags.length > 0) params.set('tags', newTags.join(','))
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `/?${qs}` : '/')
  }

  return (
    <div>
      <header className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <p className="font-mono text-xs text-emerald-600 dark:text-emerald-400 uppercase">
            Agus Stiawan
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

      <Footer note={`${articles.length} ${articles.length === 1 ? 'entry' : 'entries'} total`} />
    </div>
  )
}
