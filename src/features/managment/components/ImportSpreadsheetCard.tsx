import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getMonthLabel, getQuarterLabel, getWeekLabel } from '@/utils/date'
import type { FuelRecord } from '@/types/fuelEntry'

type ManagedAsset = {
  asset: string
  label: string
  assetType: string
  fuelType: string
  location: string
}

type SpreadsheetRow = Record<string, unknown>

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

function normaliseKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function getRowValue(row: SpreadsheetRow, keys: string[]) {
  const entries = Object.entries(row)

  for (const key of keys) {
    const match = entries.find(([entryKey]) => normaliseKey(entryKey) === normaliseKey(key))
    if (match) return match[1]
  }

  return ''
}

function getMonthIndexFromSheetName(sheetName: string): number | null {
  const cleaned = sheetName.trim().toLowerCase()

  for (let i = 0; i < MONTHS.length; i += 1) {
    const full = MONTHS[i]
    const short = full.slice(0, 3)

    if (cleaned.includes(full) || cleaned.includes(short)) {
      return i
    }
  }

  return null
}

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function makeRepresentativeDate(year: number, monthIndex: number, weekNumber: number) {
  const day = 1 + (weekNumber - 1) * 7
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`
}

export function ImportSpreadsheetCard({
  assets,
  onImportRecords,
}: {
  assets: ManagedAsset[]
  onImportRecords: (records: FuelRecord[]) => void
}) {
  const [message, setMessage] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer)

      const assetMap = new Map<string, ManagedAsset>()

      for (const asset of assets) {
        assetMap.set(asset.asset.trim().toLowerCase(), asset)
        assetMap.set(asset.label.trim().toLowerCase(), asset)
      }

      const imported: FuelRecord[] = []
      const skipped: string[] = []

      for (const sheetName of workbook.SheetNames) {
        const monthIndex = getMonthIndexFromSheetName(sheetName)

        if (monthIndex === null) {
          skipped.push(`Skipped sheet "${sheetName}" because it is not a month sheet`)
          continue
        }

        const worksheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json<SpreadsheetRow>(worksheet, { defval: '' })

        for (const [rowIndex, row] of rows.entries()) {
          const weekRaw = getRowValue(row, ['Week', 'week of the month'])
          const assetRaw = getRowValue(row, ['Asset'])
          const fuelRaw = getRowValue(row, ['fuel Burn (L)'])
          const runtimeRaw = getRowValue(row, ['Runtime (hrs)'])
          const notesRaw = getRowValue(row, ['Notes'])

          const weekNumber = Number(weekRaw)
          const assetLookup = String(assetRaw ?? '').trim().toLowerCase()
          const fuel = Number(fuelRaw)
          const runtime = Number(runtimeRaw)
          const notes = String(notesRaw ?? '').trim()

          const assetConfig = assetMap.get(assetLookup)

          if (!assetConfig) {
            skipped.push(`${sheetName} row ${rowIndex + 2}: unknown asset "${assetRaw}"`)
            continue
          }

          if (![1, 2, 3, 4].includes(weekNumber)) {
            skipped.push(`${sheetName} row ${rowIndex + 2}: week must be 1, 2, 3, or 4`)
            continue
          }

          if (Number.isNaN(fuel) || Number.isNaN(runtime)) {
            skipped.push(`${sheetName} row ${rowIndex + 2}: invalid fuel burn or runtime`)
            continue
          }

          const date = makeRepresentativeDate(2025, monthIndex, weekNumber)

          imported.push({
            id: crypto.randomUUID(),
            asset: assetConfig.asset,
            assetType: assetConfig.assetType,
            fuelType: assetConfig.fuelType,
            location: assetConfig.location,
            fuel,
            fuelUnit: 'litres',
            runtime,
            runtimeUnit: 'hours',
            date,
            month: getMonthLabel(date),
            week: getWeekLabel(date),
            quarter: getQuarterLabel(date),
            notes,
          })
        }
      }

      if (imported.length > 0) {
        onImportRecords(imported)
      }

      setMessage(
        `Imported ${imported.length} record(s)` +
          (skipped.length ? `. Skipped ${skipped.length} row/sheet item(s).` : '.')
      )
    } catch (error) {
      console.error(error)
      setMessage('Could not read spreadsheet.')
    }

    e.target.value = ''
  }

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Import 2025 Spreadsheet</CardTitle>
        <CardDescription>
          Upload a workbook with one sheet per month and columns: Week, Asset, fuel Burn (L), Runtime (hrs), Notes.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="spreadsheetImport">Spreadsheet file</Label>
          <Input
            id="spreadsheetImport"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />
        </div>

        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  )
}