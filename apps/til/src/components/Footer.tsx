import { ExternalLink } from 'lucide-react'

interface Props {
  note?: string
}

export default function Footer({ note }: Props) {
  return (
    <footer className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
      <p className="font-mono text-xs text-zinc-400 dark:text-zinc-600">
        {note ?? `© ${new Date().getFullYear()} Agus Stiawan`}
      </p>
      <a
        href="https://agus.stiawan.site"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1.5 rounded-sm border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150"
      >
        <span>agus.stiawan.site</span>
        <ExternalLink size={12} strokeWidth={1.75} />
      </a>
    </footer>
  )
}
