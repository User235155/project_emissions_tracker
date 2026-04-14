export function DashboardCard({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm">
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      <p className="mt-2 text-4xl font-bold text-slate-900">{value}</p>
    </div>
  )
}