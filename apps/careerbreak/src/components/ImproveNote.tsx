export default function ImproveNote({ text }: { text: string | undefined }) {
  if (!text?.trim()) return null
  return (
    <aside className="my-6 rounded-xl bg-note px-4 py-3 text-[15px]">
      <p className="text-graphite text-[13px] mb-0.5">From last week&apos;s review</p>
      <p className="whitespace-pre-wrap">{text.trim()}</p>
    </aside>
  )
}
