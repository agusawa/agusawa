import { Suspense } from 'react'
import { getAllArticles, getAllTags } from '@/lib/til'
import ArticleListClient from '@/components/ArticleListClient'

export default function Home() {
  const articles = getAllArticles()
  const tags = getAllTags()
  return (
    <Suspense>
      <ArticleListClient articles={articles} tags={tags} />
    </Suspense>
  )
}
