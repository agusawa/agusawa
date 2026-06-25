const STACK = [
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'Next.js',
  'Docker',
  'Redis',
  'REST APIs',
  'GraphQL',
] as const

export default function WhatIDo() {
  return (
    <section id="work" className="max-w-5xl mx-auto px-6 py-16 md:py-20 border-t border-zinc-200 dark:border-zinc-800">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        What I do
      </h2>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[60ch]">
        I work on web application development, from designing APIs and backend services to
        building the interfaces on top of them. I care about writing clean, maintainable code
        and delivering work that&apos;s reliable and easy to hand off.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {STACK.map((tech) => (
          <li
            key={tech}
            className="font-mono text-xs px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            {tech}
          </li>
        ))}
      </ul>
    </section>
  )
}
