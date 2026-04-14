import { Route, Routes } from 'react-router-dom'
import { AssetDashboardPage } from '@/features/dashboard/pages/AssetDashboardPage'
import { FuelLogPage } from '@/features/fuel-log/pages/FuelLogPage'
import type { FuelRecord } from '@/types/fuelEntry'

export function AppRoutes({
  records,
  onAddRecord,
}: {
  records: FuelRecord[]
  onAddRecord: (record: FuelRecord) => void
}) {
  return (
    <Routes>
      <Route path="/" element={<FuelLogPage onAddRecord={onAddRecord} />} />
      <Route path="/dashboard" element={<AssetDashboardPage records={records} />} />
    </Routes>
  )
}