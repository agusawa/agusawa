import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import QueryProvider from '@/components/QueryProvider'
import { getUser } from '@/lib/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!(await getUser())) redirect('/login')
  return (
    <QueryProvider>
      <Header />
      <main>{children}</main>
    </QueryProvider>
  )
}
