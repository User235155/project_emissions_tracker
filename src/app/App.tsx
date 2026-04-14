import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FuelLogForm } from '@/features/fuel-log/components/FuelLogForm'
import { AssetDashboardPage } from '@/features/dashboard/pages/AssetDashboardPage'
import { AssetManagementPage } from '@/features/managment/pages/AssetManagementPage'
import { useFuelRecords } from '../hooks/useFuelRecords'

export default function App() {
  const {
    records,
    assets,
    handleAddRecord,
    handleImportRecords,
    handleDeleteRecord,
    handleAddAsset,
    handleDeleteAsset,
  } = useFuelRecords()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <FuelLogForm
              onAddRecord={handleAddRecord}
              assets={assets}
            />
          }
        />
        <Route
          path="/dashboard"
          element={<AssetDashboardPage records={records} />}
        />
        <Route
          path="/manage"
          element={
            <AssetManagementPage
              records={records}
              assets={assets}
              onAddAsset={handleAddAsset}
              onDeleteAsset={handleDeleteAsset}
              onDeleteRecord={handleDeleteRecord}
              onImportRecords={handleImportRecords}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}