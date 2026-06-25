'use client'

interface Props {
  tags: string[]
  selectedLang: 'ID' | 'EN' | null
  selectedTags: string[]
  onChange: (lang: string | null, tags: string[]) => void
}

export default function ArticleFilters({ tags, selectedLang, selectedTags, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex gap-1">
        {(['All', 'ID', 'EN'] as const).map((l) => {
          const active = l === 'All' ? selectedLang === null : selectedLang === l
          return (
            <button
              key={l}
              onClick={() => onChange(l === 'All' ? null : l, selectedTags)}
              className={`px-2 py-1 rounded border text-sm ${
                active ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {l}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-1">
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
              className={`px-2 py-1 rounded border text-sm ${
                active ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}
