export default function About() {
  return (
    <section id="about" className="max-w-5xl mx-auto px-6 py-16 md:py-20 border-t border-zinc-200 dark:border-zinc-800">
      <div className="grid md:grid-cols-[3fr_2fr] gap-10 md:gap-16">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            About
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[58ch]">
            I&apos;m a software engineer based in Indonesia. I enjoy working on backend systems,
            APIs, and the occasional frontend challenge. I like keeping things straightforward:
            readable code, clear structure, no unnecessary complexity.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 self-start">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Now</p>
          </div>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Sharpening system design thinking and digging into frontend performance.
            Also exploring TypeScript patterns and writing more consistently.
          </p>
        </div>
      </div>
    </section>
  )
}
