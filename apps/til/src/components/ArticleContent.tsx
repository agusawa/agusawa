export default function ArticleContent({ html }: { html: string }) {
  return (
    <div
      className="prose mt-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
