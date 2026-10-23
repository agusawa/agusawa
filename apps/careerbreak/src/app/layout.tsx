import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Career Break',
  description: 'Daily to-dos, weekly goals and a Sunday review.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans antialiased min-h-screen">
        <ThemeProvider>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-16">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
