import { EnvelopeSimple, GithubLogo, LinkedinLogo, BriefcaseMetal } from '@phosphor-icons/react/dist/ssr'

const SOCIALS = [
  {
    icon: GithubLogo,
    label: 'GitHub',
    href: 'https://github.com/agusawa',
  },
  {
    icon: LinkedinLogo,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/agus-stiawan/',
  },
  {
    icon: BriefcaseMetal,
    label: 'Upwork',
    href: 'https://www.upwork.com/freelancers/~01d0b8f3ba3b6eb392',
  },
] as const

export default function Contact() {
  return (
    <section id="contact" className="max-w-5xl mx-auto px-6 py-16 md:py-20 border-t border-zinc-200 dark:border-zinc-800">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-emerald-50/60 dark:bg-emerald-500/6 px-6 py-12 md:px-12 md:py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Got something worth building?
        </h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-[48ch] mx-auto">
          I&apos;m open to new projects and collaborations. Drop a line and I&apos;ll get back to you.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:agus.stiawan2211@gmail.com"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium px-4 py-2.5 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors duration-150"
          >
            <EnvelopeSimple size={16} weight="bold" />
            agus.stiawan2211@gmail.com
          </a>
        </div>
        <div className="mt-8 flex items-center justify-center gap-5">
          {SOCIALS.map(({ icon: Icon, label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150"
            >
              <Icon size={20} weight="fill" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
