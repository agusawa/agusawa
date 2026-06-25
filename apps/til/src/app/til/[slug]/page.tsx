import { notFound } from 'next/navigation'
import Link from 'next/link'
import { remark } from 'remark'
import html from 'remark-html'
import { getAllSlugs, getArticleBySlug } from '@/lib/til'
import ArticleContent from '@/components/ArticleContent'

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const processed = await remark().use(html).process(article.content)
  const contentHtml = processed.toString()

  return (
    <div>
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold mt-4">{article.title}</h1>
      <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
        <span>{article.date}</span>
        <span className="border px-1 rounded">{article.language}</span>
        {article.tags.map((tag) => (
          <span key={tag} className="bg-gray-100 px-1 rounded">
            {tag}
          </span>
        ))}
      </div>
      <ArticleContent html={contentHtml} />
    </div>
  )
}
