import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import { getUser } from '@/lib/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!(await getUser())) redirect('/login')
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
