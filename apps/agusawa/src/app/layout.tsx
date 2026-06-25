import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: 'Agus Stiawan - Software Engineer',
  description: 'Agus Stiawan is a software engineer building backend systems, APIs, and web interfaces that stay simple to run and easy to hand off.',
  openGraph: {
    type: 'website',
    siteName: 'Agus Stiawan',
  },
  twitter: {
    card: 'summary',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans antialiased min-h-screen transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
