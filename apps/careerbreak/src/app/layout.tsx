import type { Metadata, Viewport } from 'next'
import { Schibsted_Grotesk } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'
import './globals.css'

const schibsted = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-schibsted' })

export const metadata: Metadata = {
  title: 'Career Break',
  description: 'Daily to-dos, weekly goals and a Sunday review.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f4f1' },
    { media: '(prefers-color-scheme: dark)', color: '#151b18' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={schibsted.variable} suppressHydrationWarning>
      <body className="bg-paper text-ink font-sans antialiased min-h-screen text-[16px] leading-normal">
        <ThemeProvider>
          <div className="max-w-[40rem] mx-auto px-4 sm:px-8 pt-5 sm:pt-10 pb-28 sm:pb-16">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
