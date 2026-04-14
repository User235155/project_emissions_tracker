import type { ReactNode } from 'react'
import { TopNav } from '@/components/layout/TopNav'

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <TopNav />
      <main className="p-6">{children}</main>
    </div>
  )
}