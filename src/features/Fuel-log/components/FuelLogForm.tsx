import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageLayout } from '@/components/layout/PageLayout'
import { getMonthLabel, getQuarterLabel, getWeekLabel } from '@/utils/date'
import type { FuelRecord } from '@/types/fuelEntry'

type ManagedAsset = {
  asset: string
  label: string
  assetType: string
  fuelType: string
  location: string
}

const ALL_ASSET_TYPES_VALUE = '__all_asset_types__'

export function FuelLogForm({
  onAddRecord,
  assets = [],
}: {
  onAddRecord: (record: FuelRecord) => void
  assets?: ManagedAsset[]
}) {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [assetTypeFilter, setAssetTypeFilter] = useState('')
  const [assetName, setAssetName] = useState('')
  const [fuelAmount, setFuelAmount] = useState('')
  const [runtime, setRuntime] = useState('')
  const [fuelDate, setFuelDate] = useState('')
  const [notes, setNotes] = useState('')

  const safeAssets = assets ?? []

  const assetTypeOptions = useMemo(
    () =>
      Array.from(new Set(safeAssets.map((item) => item.assetType))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [safeAssets]
  )

  const filteredAssets = useMemo(
    () =>
      assetTypeFilter
        ? safeAssets.filter((item) => item.assetType === assetTypeFilter)
        : safeAssets,
    [safeAssets, assetTypeFilter]
  )

  useEffect(() => {
    if (!assetName) return

    const assetStillValid = filteredAssets.some((item) => item.asset === assetName)

    if (!assetStillValid) {
      setAssetName('')
    }
  }, [filteredAssets, assetName])

  const selectedAssetConfig =
    assetName ? safeAssets.find((item) => item.asset === assetName) ?? null : null

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAssetConfig) return

    const newRecord: FuelRecord = {
      id: crypto.randomUUID(),
      asset: selectedAssetConfig.asset,
      assetType: selectedAssetConfig.assetType,
      fuelType: selectedAssetConfig.fuelType,
      location: selectedAssetConfig.location,
      fuel: Number(fuelAmount),
      fuelUnit: 'litres',
      runtime: Number(runtime),
      runtimeUnit: 'hours',
      date: fuelDate,
      month: getMonthLabel(fuelDate),
      week: getWeekLabel(fuelDate),
      quarter: getQuarterLabel(fuelDate),
      notes: notes.trim(),
    }

    onAddRecord(newRecord)

    setStep(1)
    setAssetTypeFilter('')
    setAssetName('')
    setFuelAmount('')
    setRuntime('')
    setFuelDate('')
    setNotes('')

    navigate('/dashboard')
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border bg-card p-6 shadow-sm"
        >
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900">Fuel Log</h2>
            <p className="text-sm text-muted-foreground">Step {step} of 3</p>
          </div>

          <div className="flex gap-2">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="assetType" className="text-sm font-medium text-foreground">
                  Asset type
                </Label>

                <Select
                  value={assetTypeFilter || ALL_ASSET_TYPES_VALUE}
                  onValueChange={(value) =>
                    setAssetTypeFilter(value === ALL_ASSET_TYPES_VALUE ? '' : value)
                  }
                >
                  <SelectTrigger id="assetType" className="h-11 bg-background">
                    <SelectValue placeholder="All asset types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_ASSET_TYPES_VALUE}>All asset types</SelectItem>
                    {assetTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assetName" className="text-sm font-medium text-foreground">
                  Select asset
                </Label>

                <Select value={assetName} onValueChange={setAssetName}>
                  <SelectTrigger id="assetName" className="h-11 bg-background">
                    <SelectValue placeholder="Choose an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAssets.map((item) => (
                      <SelectItem key={item.asset} value={item.asset}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAssetConfig && (
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Asset type</Label>
                    <Input value={selectedAssetConfig.assetType} disabled className="h-11 bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Fuel type</Label>
                    <Input value={selectedAssetConfig.fuelType} disabled className="h-11 bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Location</Label>
                    <Input value={selectedAssetConfig.location} disabled className="h-11 bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Saved as</Label>
                    <Input value={selectedAssetConfig.asset} disabled className="h-11 bg-muted" />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fuelAmount" className="text-sm font-medium text-foreground">
                  Amount of fuel taken
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fuelAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 25"
                    value={fuelAmount}
                    onChange={(e) => setFuelAmount(e.target.value)}
                    className="h-11 bg-background"
                  />
                  <span className="whitespace-nowrap rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                    litres
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="runtime" className="text-sm font-medium text-foreground">
                  Runtime of asset
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="runtime"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 5.5"
                    value={runtime}
                    onChange={(e) => setRuntime(e.target.value)}
                    className="h-11 bg-background"
                  />
                  <span className="whitespace-nowrap rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                    hours
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fuelDate" className="text-sm font-medium text-foreground">
                  Date fuel was taken
                </Label>
                <Input
                  id="fuelDate"
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="h-11 bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes here"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px] bg-background"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
              Back
            </Button>

            {step < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={(step === 1 && !assetName) || (step === 2 && (!fuelAmount || !runtime))}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={!assetName || !fuelAmount || !runtime || !fuelDate}>
                Submit
              </Button>
            )}
          </div>
        </form>
      </div>
    </PageLayout>
  )
}