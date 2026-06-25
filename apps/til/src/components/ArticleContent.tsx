export default function ArticleContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-zinc dark:prose-invert prose-sm max-w-none prose-headings:tracking-tight prose-pre:rounded-md prose-pre:border"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
