import { redirect } from 'next/navigation'
import { getUser } from '@/lib/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!(await getUser())) redirect('/login')
  return <>{children}</>
}
