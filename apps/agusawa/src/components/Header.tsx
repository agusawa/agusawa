import ThemeToggle from '@/components/ThemeToggle'

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4">
      <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100">Agus Stiawan</span>
      <ThemeToggle />
    </header>
  )
}
