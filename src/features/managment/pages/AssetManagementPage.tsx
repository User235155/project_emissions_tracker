import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageLayout } from '@/components/layout/PageLayout'
import { ImportSpreadsheetCard } from '@/features/managment/components/ImportSpreadsheetCard'
import type { FuelRecord } from '@/types/fuelEntry'

export type ManagedAsset = {
  asset: string
  label: string
  assetType: string
  fuelType: string
  location: string
}

const ALL_ASSET_TYPES_VALUE = '__all_asset_types__'
const ALL_ASSETS_VALUE = '__all_assets__'

export function AssetManagementPage({
  records,
  assets,
  onAddAsset,
  onDeleteAsset,
  onDeleteRecord,
  onImportRecords,
}: {
  records: FuelRecord[]
  assets: ManagedAsset[]
  onAddAsset: (asset: ManagedAsset) => void
  onDeleteAsset: (assetName: string) => void
  onDeleteRecord: (recordId: string) => void
  onImportRecords: (records: FuelRecord[]) => void
}) {
  const [recordAssetTypeFilter, setRecordAssetTypeFilter] = useState(ALL_ASSET_TYPES_VALUE)
  const [recordAssetFilter, setRecordAssetFilter] = useState(ALL_ASSETS_VALUE)
  const [assetName, setAssetName] = useState('')
  const [assetLabel, setAssetLabel] = useState('')
  const [assetType, setAssetType] = useState('')
  const [fuelType, setFuelType] = useState('')
  const [location, setLocation] = useState('')

  const assetRecordCounts = useMemo(() => {
    return records.reduce<Record<string, number>>((acc, record) => {
      acc[record.asset] = (acc[record.asset] ?? 0) + 1
      return acc
    }, {})
  }, [records])

  const recordAssetTypeOptions = useMemo(
    () =>
      Array.from(new Set(assets.map((asset) => asset.assetType))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [assets]
  )

  const recordAssetOptions = useMemo(() => {
    const filtered =
      recordAssetTypeFilter === ALL_ASSET_TYPES_VALUE
        ? assets
        : assets.filter((asset) => asset.assetType === recordAssetTypeFilter)

    return [...filtered].sort((a, b) => a.label.localeCompare(b.label))
  }, [assets, recordAssetTypeFilter])

  useEffect(() => {
    if (recordAssetFilter === ALL_ASSETS_VALUE) return

    const isStillValid = recordAssetOptions.some(
      (asset) => asset.asset === recordAssetFilter
    )

    if (!isStillValid) {
      setRecordAssetFilter(ALL_ASSETS_VALUE)
    }
  }, [recordAssetFilter, recordAssetOptions])

  const visibleRecords = useMemo(() => {
    let next = [...records]

    if (recordAssetTypeFilter !== ALL_ASSET_TYPES_VALUE) {
      next = next.filter((record) => record.assetType === recordAssetTypeFilter)
    }

    if (recordAssetFilter !== ALL_ASSETS_VALUE) {
      next = next.filter((record) => record.asset === recordAssetFilter)
    }

    return next.sort((a, b) => b.date.localeCompare(a.date))
  }, [records, recordAssetTypeFilter, recordAssetFilter])

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedAsset = assetName.trim()
    const trimmedLabel = assetLabel.trim()
    const trimmedAssetType = assetType.trim()
    const trimmedFuelType = fuelType.trim()
    const trimmedLocation = location.trim()

    if (!trimmedAsset || !trimmedAssetType || !trimmedFuelType || !trimmedLocation) {
      window.alert('Please complete all required asset fields.')
      return
    }

    const assetAlreadyExists = assets.some(
      (item) => item.asset.toLowerCase() === trimmedAsset.toLowerCase()
    )

    if (assetAlreadyExists) {
      window.alert('An asset with that saved name already exists.')
      return
    }

    onAddAsset({
      asset: trimmedAsset,
      label: trimmedLabel || trimmedAsset,
      assetType: trimmedAssetType,
      fuelType: trimmedFuelType,
      location: trimmedLocation,
    })

    setAssetName('')
    setAssetLabel('')
    setAssetType('')
    setFuelType('')
    setLocation('')
  }

  const handleDeleteAsset = (asset: ManagedAsset) => {
    const linkedRecordCount = assetRecordCounts[asset.asset] ?? 0

    if (linkedRecordCount > 0) {
      window.alert(
        `You cannot remove "${asset.label}" yet because it still has ${linkedRecordCount} record(s). Delete those records first.`
      )
      return
    }

    const confirmed = window.confirm(
      `Remove asset "${asset.label}"? This cannot be undone.`
    )

    if (!confirmed) return

    onDeleteAsset(asset.asset)
  }

  const handleDeleteRecord = (record: FuelRecord) => {
    const confirmed = window.confirm(
      `Delete the record for "${record.asset}" on ${record.date}?`
    )

    if (!confirmed) return

    onDeleteRecord(record.id)
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-screen-2xl space-y-6 px-4">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Manage Assets & Records
          </h1>
          <p className="mt-2 text-slate-600">
            Add new assets, import spreadsheet records, remove unused assets, and delete incorrect fuel log records.
          </p>
        </div>

        <ImportSpreadsheetCard
          assets={assets}
          onImportRecords={onImportRecords}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{assets.length}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{records.length}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Filtered Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{visibleRecords.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Add Asset</CardTitle>
              <CardDescription>
                Create a new asset that will appear in the fuel log form.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAddAsset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="asset">Saved name</Label>
                  <Input
                    id="asset"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="e.g. excavator-01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Display label</Label>
                  <Input
                    id="label"
                    value={assetLabel}
                    onChange={(e) => setAssetLabel(e.target.value)}
                    placeholder="e.g. Excavator 01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetType">Asset type</Label>
                  <Input
                    id="assetType"
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    placeholder="e.g. Excavator"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel type</Label>
                  <Input
                    id="fuelType"
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    placeholder="e.g. Diesel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Yard A"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Assets</CardTitle>
              <CardDescription>
                Assets can only be removed when they have no linked records.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {assets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No assets found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="px-3 py-3 font-medium">Label</th>
                        <th className="px-3 py-3 font-medium">Saved name</th>
                        <th className="px-3 py-3 font-medium">Asset type</th>
                        <th className="px-3 py-3 font-medium">Fuel type</th>
                        <th className="px-3 py-3 font-medium">Location</th>
                        <th className="px-3 py-3 font-medium">Records</th>
                        <th className="px-3 py-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {assets.map((asset) => {
                        const linkedRecordCount = assetRecordCounts[asset.asset] ?? 0

                        return (
                          <tr key={asset.asset} className="border-b align-top">
                            <td className="px-3 py-3">{asset.label}</td>
                            <td className="px-3 py-3">{asset.asset}</td>
                            <td className="px-3 py-3">{asset.assetType}</td>
                            <td className="px-3 py-3">{asset.fuelType}</td>
                            <td className="px-3 py-3">{asset.location}</td>
                            <td className="px-3 py-3">{linkedRecordCount}</td>
                            <td className="px-3 py-3 text-right">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={linkedRecordCount > 0}
                                onClick={() => handleDeleteAsset(asset)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Records</CardTitle>
            <CardDescription>
              Remove incorrect or unwanted fuel log entries.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recordAssetTypeFilter">Filter records by asset type</Label>
                <Select
                  value={recordAssetTypeFilter}
                  onValueChange={setRecordAssetTypeFilter}
                >
                  <SelectTrigger id="recordAssetTypeFilter" className="h-11 bg-background">
                    <SelectValue placeholder="All asset types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_ASSET_TYPES_VALUE}>All asset types</SelectItem>
                    {recordAssetTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordAssetFilter">Filter records by asset</Label>
                <Select
                  value={recordAssetFilter}
                  onValueChange={setRecordAssetFilter}
                >
                  <SelectTrigger id="recordAssetFilter" className="h-11 bg-background">
                    <SelectValue placeholder="All assets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_ASSETS_VALUE}>All assets</SelectItem>
                    {recordAssetOptions.map((asset) => (
                      <SelectItem key={asset.asset} value={asset.asset}>
                        {asset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {visibleRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-3 py-3 font-medium">Date</th>
                      <th className="px-3 py-3 font-medium">Asset</th>
                      <th className="px-3 py-3 font-medium">Asset type</th>
                      <th className="px-3 py-3 font-medium">Fuel type</th>
                      <th className="px-3 py-3 font-medium">Location</th>
                      <th className="px-3 py-3 font-medium">Fuel</th>
                      <th className="px-3 py-3 font-medium">Runtime</th>
                      <th className="px-3 py-3 font-medium">Notes</th>
                      <th className="px-3 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleRecords.map((record) => (
                      <tr key={record.id} className="border-b align-top">
                        <td className="px-3 py-3">{record.date}</td>
                        <td className="px-3 py-3">{record.asset}</td>
                        <td className="px-3 py-3">{record.assetType}</td>
                        <td className="px-3 py-3">{record.fuelType}</td>
                        <td className="px-3 py-3">{record.location}</td>
                        <td className="px-3 py-3">
                          {record.fuel} {record.fuelUnit}
                        </td>
                        <td className="px-3 py-3">
                          {record.runtime} {record.runtimeUnit}
                        </td>
                        <td className="px-3 py-3 max-w-[260px]">
                          {record.notes?.trim() ? record.notes : '—'}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRecord(record)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}