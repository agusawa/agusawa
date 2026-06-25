import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr'

export default function Writing() {
  return (
    <section id="writing" className="max-w-5xl mx-auto px-6 py-16 md:py-20 border-t border-zinc-200 dark:border-zinc-800">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Writing
      </h2>
      <a
        href="https://til.agus.stiawan.site"
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-5 flex items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors duration-150"
      >
        <div>
          <p className="text-zinc-900 dark:text-zinc-100 font-medium">Today I Learned</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[50ch]">
            A public log of things I pick up while building: small notes, discoveries, and
            lessons learned along the way.
          </p>
        </div>
        <ArrowUpRight
          size={20}
          className="shrink-0 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150"
        />
      </a>
    </section>
  )
}
