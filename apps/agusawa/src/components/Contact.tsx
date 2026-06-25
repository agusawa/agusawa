import { Briefcase, Github, Linkedin, Mail } from 'lucide-react'

const LINKS = [
  {
    icon: Mail,
    label: 'agus.stiawan2211@gmail.com',
    href: 'mailto:agus.stiawan2211@gmail.com',
  },
  {
    icon: Github,
    label: 'github.com/agusawa',
    href: 'https://github.com/agusawa',
  },
  {
    icon: Linkedin,
    label: 'linkedin.com/in/agus-stiawan',
    href: 'https://www.linkedin.com/in/agus-stiawan/',
  },
  {
    icon: Briefcase,
    label: 'upwork.com/freelancers/~01d0b8f3ba3b6eb392',
    href: 'https://www.upwork.com/freelancers/~01d0b8f3ba3b6eb392',
  },
] as const

export default function Contact() {
  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Contact</p>
      <ul className="mt-4 space-y-3">
        {LINKS.map(({ icon: Icon, label, href }) => (
          <li key={href}>
            <a
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150"
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
