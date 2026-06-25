'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import type { TILArticle } from '@/lib/til'
import ArticleCard from './ArticleCard'
import ArticleFilters from './ArticleFilters'

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
      <h1 className="text-2xl font-bold mb-4">TIL</h1>
      <ArticleFilters
        tags={tags}
        selectedLang={lang}
        selectedTags={selectedTags}
        onChange={updateParams}
      />
      <div>
        {filtered.length === 0 ? (
          <p className="text-gray-500 mt-4">No articles match the selected filters.</p>
        ) : (
          filtered.map((article) => <ArticleCard key={article.slug} article={article} />)
        )}
      </div>
    </div>
  )
}
