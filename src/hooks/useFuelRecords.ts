import { useEffect, useState } from 'react'
import { STORAGE_KEY } from '@/data/constants'
import { ASSET_CONFIG } from '@/data/assetConfig'
import { loadFromStorage, saveToStorage } from '@/lib/utils'
import type { FuelRecord } from '@/types/fuelEntry'

const ASSETS_STORAGE_KEY = 'managed-assets'

type ManagedAsset = (typeof ASSET_CONFIG)[number]

export function useFuelRecords() {
  const [records, setRecords] = useState<FuelRecord[]>(() =>
    loadFromStorage<FuelRecord[]>(STORAGE_KEY, [])
  )

  const [assets, setAssets] = useState<ManagedAsset[]>(() =>
    loadFromStorage<ManagedAsset[]>(ASSETS_STORAGE_KEY, ASSET_CONFIG)
  )

  useEffect(() => {
    saveToStorage(STORAGE_KEY, records)
  }, [records])

  useEffect(() => {
    saveToStorage(ASSETS_STORAGE_KEY, assets)
  }, [assets])

  const handleAddRecord = (record: FuelRecord) => {
    setRecords((prev) => [record, ...prev])
  }

  const handleImportRecords = (newRecords: FuelRecord[]) => {
    setRecords((prev) => [...newRecords, ...prev])
  }

  const handleDeleteRecord = (recordId: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== recordId))
  }

  const handleAddAsset = (asset: ManagedAsset) => {
    setAssets((prev) => [...prev, asset])
  }

  const handleDeleteAsset = (assetName: string) => {
    setAssets((prev) => prev.filter((asset) => asset.asset !== assetName))
  }

  return {
    records,
    assets,
    handleAddRecord,
    handleImportRecords,
    handleDeleteRecord,
    handleAddAsset,
    handleDeleteAsset,
  }
}