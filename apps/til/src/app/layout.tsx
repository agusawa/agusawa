import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TIL',
  description: 'Today I Learned',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="max-w-2xl mx-auto px-4 py-8">{children}</body>
    </html>
  )
}
