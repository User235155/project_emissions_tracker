import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { ChartCard } from '@/components/charts/ChartCard'
import { EmptyChart } from '@/components/charts/EmptyChart'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { MultiSelectFilter } from '@/components/dashboard/MultiSelectFilter'
import { RecordsTable } from '@/components/dashboard/RecordsTable'
import { PageLayout } from '@/components/layout/PageLayout'
import {
  filterRecords,
  getAverageLitresPerHourByAsset,
  getDashboardTotals,
  getFuelByFuelType,
  getFuelByLocation,
  getFuelByMonth,
  getFuelPerAsset,
  getMonthOptions,
  getRuntimePerAsset,
  getWeekOptions,
} from '@/features/dashboard/utils/dashboardSelectors'
import type { FuelRecord } from '@/types/fuelEntry'

const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))

const pruneSelectedValues = (selected: string[], validOptions: string[]) => {
  const next = selected.filter((value) => validOptions.includes(value))
  return next.length === selected.length ? selected : next
}

export function AssetDashboardPage({ records }: { records: FuelRecord[] }) {
  const [assetTypes, setAssetTypes] = useState<string[]>([])
  const [fuelTypes, setFuelTypes] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [months, setMonths] = useState<string[]>([])
  const [weeks, setWeeks] = useState<string[]>([])

  const assetTypeOptions = useMemo(
    () => uniqueSorted(records.map((record) => record.assetType)),
    [records]
  )

  const recordsForFuelType = useMemo(
    () =>
      filterRecords(records, {
        assetTypes,
        fuelTypes: [],
        locations: [],
        months: [],
        weeks: [],
      }),
    [records, assetTypes]
  )

  const fuelTypeOptions = useMemo(
    () => uniqueSorted(recordsForFuelType.map((record) => record.fuelType)),
    [recordsForFuelType]
  )

  const recordsForLocation = useMemo(
    () =>
      filterRecords(records, {
        assetTypes,
        fuelTypes,
        locations: [],
        months: [],
        weeks: [],
      }),
    [records, assetTypes, fuelTypes]
  )

  const locationOptions = useMemo(
    () => uniqueSorted(recordsForLocation.map((record) => record.location)),
    [recordsForLocation]
  )

  const recordsForMonth = useMemo(
    () =>
      filterRecords(records, {
        assetTypes,
        fuelTypes,
        locations,
        months: [],
        weeks: [],
      }),
    [records, assetTypes, fuelTypes, locations]
  )

  const monthOptions = useMemo(() => getMonthOptions(recordsForMonth), [recordsForMonth])

  const recordsForWeek = useMemo(
    () =>
      filterRecords(records, {
        assetTypes,
        fuelTypes,
        locations,
        months,
        weeks: [],
      }),
    [records, assetTypes, fuelTypes, locations, months]
  )

  const weekOptions = useMemo(() => getWeekOptions(recordsForWeek), [recordsForWeek])

  useEffect(() => {
    setAssetTypes((prev) => pruneSelectedValues(prev, assetTypeOptions))
  }, [assetTypeOptions])

  useEffect(() => {
    setFuelTypes((prev) => pruneSelectedValues(prev, fuelTypeOptions))
  }, [fuelTypeOptions])

  useEffect(() => {
    setLocations((prev) => pruneSelectedValues(prev, locationOptions))
  }, [locationOptions])

  useEffect(() => {
    setMonths((prev) => pruneSelectedValues(prev, monthOptions))
  }, [monthOptions])

  useEffect(() => {
    setWeeks((prev) => pruneSelectedValues(prev, weekOptions))
  }, [weekOptions])

  const filteredRecords = useMemo(
    () =>
      filterRecords(records, {
        assetTypes,
        fuelTypes,
        locations,
        months,
        weeks,
      }),
    [records, assetTypes, fuelTypes, locations, months, weeks]
  )

  const { totalFuel, totalRuntime, averageLitresPerHour } = useMemo(
    () => getDashboardTotals(filteredRecords),
    [filteredRecords]
  )

  const fuelPerAsset = useMemo(() => getFuelPerAsset(filteredRecords), [filteredRecords])
  const runtimePerAsset = useMemo(
    () => getRuntimePerAsset(filteredRecords),
    [filteredRecords]
  )
  const averageLitresPerHourByAsset = useMemo(
    () => getAverageLitresPerHourByAsset(filteredRecords),
    [filteredRecords]
  )
  const fuelByMonth = useMemo(() => getFuelByMonth(filteredRecords), [filteredRecords])
  const fuelByLocation = useMemo(
    () => getFuelByLocation(filteredRecords),
    [filteredRecords]
  )
  const fuelByFuelType = useMemo(
    () => getFuelByFuelType(filteredRecords),
    [filteredRecords]
  )

  const resetFilters = () => {
    setAssetTypes([])
    setFuelTypes([])
    setLocations([])
    setMonths([])
    setWeeks([])
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-screen-2xl space-y-6 px-4">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            Asset Dashboard
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            View stored records as charts and filter them by asset type, fuel type,
            location, month, or week.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {assetTypeOptions.length > 0 && (
              <MultiSelectFilter
                label="Asset Type"
                options={assetTypeOptions}
                selected={assetTypes}
                onChange={setAssetTypes}
                placeholder="All asset types"
              />
            )}

            {fuelTypeOptions.length > 0 && (
              <MultiSelectFilter
                label="Fuel Type"
                options={fuelTypeOptions}
                selected={fuelTypes}
                onChange={setFuelTypes}
                placeholder="All fuel types"
              />
            )}

            {locationOptions.length > 0 && (
              <MultiSelectFilter
                label="Location"
                options={locationOptions}
                selected={locations}
                onChange={setLocations}
                placeholder="All locations"
              />
            )}

            {monthOptions.length > 0 && (
              <MultiSelectFilter
                label="Month"
                options={monthOptions}
                selected={months}
                onChange={setMonths}
                placeholder="All months"
              />
            )}

            {weekOptions.length > 0 && (
              <MultiSelectFilter
                label="Week"
                options={weekOptions}
                selected={weeks}
                onChange={setWeeks}
                placeholder="All weeks"
              />
            )}

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-xl"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard title="Records Shown" value={filteredRecords.length} />
          <DashboardCard title="Total Fuel" value={`${totalFuel.toFixed(1)} L`} />
          <DashboardCard title="Total Runtime" value={`${totalRuntime.toFixed(1)} h`} />
          <DashboardCard
            title="Average Litres/Hour"
            value={`${averageLitresPerHour.toFixed(2)} L/h`}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <ChartCard title="Total Fuel per Asset">
            {fuelPerAsset.length === 0 ? (
              <EmptyChart message="No matching asset records" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelPerAsset}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="asset" angle={-30} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="fuel" fill="#78b6e3" name="Fuel (litres)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Total Runtime per Asset">
            {runtimePerAsset.length === 0 ? (
              <EmptyChart message="No matching asset records" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={runtimePerAsset}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="asset" angle={-30} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="runtime" fill="#86cfd0" name="Runtime (hours)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Average Litres per Hour by Asset">
            {averageLitresPerHourByAsset.length === 0 ? (
              <EmptyChart message="No matching asset records" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={averageLitresPerHourByAsset}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="asset" angle={-30} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="litresPerHour" fill="#b193f5" name="Litres per hour" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Fuel by Month">
            {fuelByMonth.length === 0 ? (
              <EmptyChart message="No matching month records" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="fuel"
                    stroke="#ff6f8d"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    name="Fuel (litres)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Fuel by Location">
            {fuelByLocation.length === 0 ? (
              <EmptyChart message="No matching location records" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelByLocation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="fuel" fill="#f3b26b" name="Fuel (litres)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Fuel by Fuel Type">
            {fuelByFuelType.length === 0 ? (
              <EmptyChart message="No matching fuel type records" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelByFuelType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fuelType" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="fuel" fill="#7dc6f3" name="Fuel (litres)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        
      </div>
    </PageLayout>
  )
}