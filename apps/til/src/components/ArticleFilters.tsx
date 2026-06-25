'use client'

interface Props {
  tags: string[]
  selectedLang: 'ID' | 'EN' | null
  selectedTags: string[]
  onChange: (lang: string | null, tags: string[]) => void
}

export default function ArticleFilters({ tags, selectedLang, selectedTags, onChange }: Props) {
  return (
    <div className="mb-8 space-y-2.5">
      <div className="flex gap-1.5">
        {(['All', 'ID', 'EN'] as const).map((l) => {
          const active = l === 'All' ? selectedLang === null : selectedLang === l
          return (
            <button
              key={l}
              onClick={() => onChange(l === 'All' ? null : l, selectedTags)}
              className={`font-mono text-[11px] px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                active
                  ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-400 dark:text-zinc-950 dark:border-emerald-400'
                  : 'text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              {l}
            </button>
          )
        })}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => {
                  const next = active
                    ? selectedTags.filter((t) => t !== tag)
                    : [...selectedTags, tag]
                  onChange(selectedLang, next)
                }}
                className={`font-mono text-[11px] px-2.5 py-1 rounded-sm border transition-colors duration-150 ${
                  active
                    ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-400 dark:text-zinc-950 dark:border-emerald-400'
                    : 'text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
