import { getAssetLabel } from '@/utils/asset'
import type { FuelRecord } from '@/types/fuelEntry'

export function RecordsTable({ records }: { records: FuelRecord[] }) {
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-slate-900">Records</h3>
        <p className="text-sm text-muted-foreground">
          Filtered entries shown in table form
        </p>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          No matching records
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="border-b px-3 py-3 text-left font-semibold">Date</th>
                <th className="border-b px-3 py-3 text-left font-semibold">Asset ID</th>
                <th className="border-b px-3 py-3 text-left font-semibold">Asset Name</th>
                <th className="border-b px-3 py-3 text-left font-semibold">Asset Type</th>
                <th className="border-b px-3 py-3 text-left font-semibold">Fuel Type</th>
                <th className="border-b px-3 py-3 text-left font-semibold">Location</th>
                <th className="border-b px-3 py-3 text-left font-semibold">Month</th>
                <th className="border-b px-3 py-3 text-left font-semibold">Week</th>
                <th className="border-b px-3 py-3 text-left font-semibold">Fuel</th>
                <th className="border-b px-3 py-3 text-left font-semibold">Runtime</th>
                <th className="border-b px-3 py-3 text-left font-semibold">L/h</th>
                <th className="border-b px-3 py-3 text-left font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record) => {
                const litresPerHour =
                  record.runtime > 0 ? (record.fuel / record.runtime).toFixed(2) : '0.00'

                return (
                  <tr key={record.id}>
                    <td className="border-b px-3 py-3">{record.date}</td>
                    <td className="border-b px-3 py-3 font-medium">{record.asset}</td>
                    <td className="border-b px-3 py-3">{getAssetLabel(record.asset)}</td>
                    <td className="border-b px-3 py-3">{record.assetType}</td>
                    <td className="border-b px-3 py-3">{record.fuelType}</td>
                    <td className="border-b px-3 py-3">{record.location}</td>
                    <td className="border-b px-3 py-3">{record.month}</td>
                    <td className="border-b px-3 py-3">{record.week}</td>
                    <td className="border-b px-3 py-3">{record.fuel.toFixed(1)} L</td>
                    <td className="border-b px-3 py-3">{record.runtime.toFixed(1)} h</td>
                    <td className="border-b px-3 py-3">{litresPerHour}</td>
                    <td className="border-b px-3 py-3">{record.notes || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}