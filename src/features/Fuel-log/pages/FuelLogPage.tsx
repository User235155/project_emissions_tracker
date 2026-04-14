import { PageLayout } from '@/components/layout/PageLayout'
import { FuelLogForm } from '@/features/fuel-log/components/FuelLogForm'
import type { FuelRecord } from '@/types/fuelEntry'

export function FuelLogPage({
  onAddRecord,
}: {
  onAddRecord: (record: FuelRecord) => void
}) {
  return (
    <PageLayout>
      <div className="mx-auto max-w-xl">
        <FuelLogForm onAddRecord={onAddRecord} />
      </div>
    </PageLayout>
  )
}