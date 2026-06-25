import Link from 'next/link'
import type { TILArticle } from '@/lib/til'

export default function ArticleCard({ article }: { article: TILArticle }) {
  return (
    <article className="border-b border-zinc-200 dark:border-zinc-800 group">
      <Link href={`/${article.slug}/`} className="flex gap-5 py-5">
        <time className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600 shrink-0 pt-0.75 w-24 leading-tight">
          {article.date}
        </time>
        <div className="flex-1 min-w-0">
          <h2 className="text-zinc-900 dark:text-zinc-100 font-medium text-sm leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-150">
            {article.title}
          </h2>
          {article.summary && (
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed line-clamp-2">
              {article.summary}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
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
        </div>
      </Link>
    </article>
  )
}
