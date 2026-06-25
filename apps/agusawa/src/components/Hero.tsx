import { ArrowRight, EnvelopeSimple } from '@phosphor-icons/react/dist/ssr'

export default function Hero() {
  return (
    <section id="hero" className="max-w-5xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1]">
            <span className="text-emerald-600 dark:text-emerald-400">Agus Stiawan</span> &nbsp;builds backend systems that don&apos;t fall over.
          </h1>
          <p className="mt-5 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[44ch]">
            Software engineer in Indonesia. APIs, services, and the occasional
            frontend, written to be read and maintained by someone else.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium px-4 py-2.5 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors duration-150"
            >
              <EnvelopeSimple size={16} weight="bold" />
              Get in touch
            </a>
            <a
              href="#work"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium px-4 py-2.5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors duration-150"
            >
              See what I do
              <ArrowRight size={15} />
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>
          <pre className="font-mono text-[13px] leading-relaxed p-5 overflow-x-auto">
            <code>
              <span className="text-zinc-500 dark:text-zinc-500">const</span> engineer ={'{'}{'\n'}
              {'  '}role: <span className="text-emerald-600 dark:text-emerald-400">&apos;Software Engineer&apos;</span>,{'\n'}
              {'  '}base: <span className="text-emerald-600 dark:text-emerald-400">&apos;Indonesia&apos;</span>,{'\n'}
              {'  '}focus: [<span className="text-emerald-600 dark:text-emerald-400">&apos;APIs&apos;</span>, <span className="text-emerald-600 dark:text-emerald-400">&apos;backend&apos;</span>, <span className="text-emerald-600 dark:text-emerald-400">&apos;frontend&apos;</span>],{'\n'}
              {'  '}principle: <span className="text-emerald-600 dark:text-emerald-400">&apos;keep it boring&apos;</span>,{'\n'}
              {'}'}
            </code>
          </pre>
        </div>
      </div>
    </section>
  )
}
