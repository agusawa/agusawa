import Link from 'next/link'
import type { TILArticle } from '@/lib/til'

export default function ArticleCard({ article }: { article: TILArticle }) {
  return (
    <div className="border-b py-4">
      <Link href={`/til/${article.slug}/`} className="text-lg font-semibold hover:underline">
        {article.title}
      </Link>
      <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500">
        <span>{article.date}</span>
        <span className="border px-1 rounded">{article.language}</span>
        {article.tags.map((tag) => (
          <span key={tag} className="bg-gray-100 px-1 rounded">
            {tag}
          </span>
        ))}
      </div>
      {article.summary && <p className="mt-1 text-sm text-gray-600">{article.summary}</p>}
    </div>
  )
}
