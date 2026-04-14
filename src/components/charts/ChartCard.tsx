import type { ReactNode } from 'react'

export function ChartCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-2xl font-bold text-slate-900">{title}</h3>
      <div className="h-[360px] w-full">{children}</div>
    </div>
  )
}