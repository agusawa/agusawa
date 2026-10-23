export default function ImproveNote({ text }: { text: string | undefined }) {
  if (!text?.trim()) return null
  return (
    <div className="my-4 border-l-4 border-amber-500 bg-amber-500/10 px-3 py-2 text-sm rounded-r-md">
      <span className="font-semibold">From last week:</span> <span className="whitespace-pre-wrap">&ldquo;{text.trim()}&rdquo;</span>
    </div>
  )
}
