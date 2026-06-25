import ThemeToggle from '@/components/ThemeToggle'

const NAV = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#writing', label: 'Writing' },
  { href: '#contact', label: 'Contact' },
] as const

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <a href="#hero" className="font-mono text-sm text-zinc-900 dark:text-zinc-100 shrink-0">
          agus<span className="text-emerald-600 dark:text-emerald-400">.</span>stiawan
        </a>
        <nav className="hidden sm:flex items-center gap-6">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-150"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
