import {
  ALL_FUEL_TYPES,
  ALL_LOCATIONS,
} from '@/data/constants'
import { monthSortValue, weekSortValue } from '@/utils/date'
import type { AssetLocation, FuelRecord, FuelType } from '@/types/fuelEntry'

export type DashboardFilters = {
  assetTypes: string[]
  fuelTypes: string[]
  locations: string[]
  months: string[]
  weeks: string[]
}

export function getMonthOptions(records: FuelRecord[]) {
  const unique = Array.from(new Set(records.map((record) => record.month)))
  return unique.sort((a, b) => monthSortValue(a) - monthSortValue(b))
}

export function getWeekOptions(records: FuelRecord[]) {
  const unique = Array.from(new Set(records.map((record) => record.week)))
  return unique.sort((a, b) => weekSortValue(a) - weekSortValue(b))
}

export function filterRecords(records: FuelRecord[], filters: DashboardFilters) {
  return records.filter((record) => {
    const assetTypeMatch =
      filters.assetTypes.length === 0 || filters.assetTypes.includes(record.assetType)

    const fuelTypeMatch =
      filters.fuelTypes.length === 0 || filters.fuelTypes.includes(record.fuelType)

    const locationMatch =
      filters.locations.length === 0 || filters.locations.includes(record.location)

    const monthMatch =
      filters.months.length === 0 || filters.months.includes(record.month)

    const weekMatch =
      filters.weeks.length === 0 || filters.weeks.includes(record.week)

    return (
      assetTypeMatch &&
      fuelTypeMatch &&
      locationMatch &&
      monthMatch &&
      weekMatch
    )
  })
}

export function getDashboardTotals(records: FuelRecord[]) {
  const totalFuel = records.reduce((sum, item) => sum + item.fuel, 0)
  const totalRuntime = records.reduce((sum, item) => sum + item.runtime, 0)
  const averageLitresPerHour = totalRuntime === 0 ? 0 : totalFuel / totalRuntime

  return {
    totalFuel,
    totalRuntime,
    averageLitresPerHour,
  }
}

export function getFuelPerAsset(records: FuelRecord[]) {
  const grouped = new Map<string, number>()

  records.forEach((item) => {
    grouped.set(item.asset, (grouped.get(item.asset) || 0) + item.fuel)
  })

  return Array.from(grouped.entries())
    .map(([asset, fuel]) => ({
      asset,
      fuel: Number(fuel.toFixed(1)),
    }))
    .sort((a, b) => a.asset.localeCompare(b.asset))
}

export function getRuntimePerAsset(records: FuelRecord[]) {
  const grouped = new Map<string, number>()

  records.forEach((item) => {
    grouped.set(item.asset, (grouped.get(item.asset) || 0) + item.runtime)
  })

  return Array.from(grouped.entries())
    .map(([asset, runtime]) => ({
      asset,
      runtime: Number(runtime.toFixed(1)),
    }))
    .sort((a, b) => a.asset.localeCompare(b.asset))
}

export function getAverageLitresPerHourByAsset(records: FuelRecord[]) {
  const grouped = new Map<string, { fuel: number; runtime: number }>()

  records.forEach((item) => {
    const current = grouped.get(item.asset) || { fuel: 0, runtime: 0 }

    grouped.set(item.asset, {
      fuel: current.fuel + item.fuel,
      runtime: current.runtime + item.runtime,
    })
  })

  return Array.from(grouped.entries())
    .map(([asset, values]) => ({
      asset,
      litresPerHour:
        values.runtime > 0 ? Number((values.fuel / values.runtime).toFixed(2)) : 0,
    }))
    .sort((a, b) => a.asset.localeCompare(b.asset))
}

export function getFuelByMonth(records: FuelRecord[]) {
  const grouped = new Map<string, number>()

  records.forEach((item) => {
    grouped.set(item.month, (grouped.get(item.month) || 0) + item.fuel)
  })

  return Array.from(grouped.entries())
    .map(([month, fuel]) => ({
      month,
      fuel: Number(fuel.toFixed(1)),
    }))
    .sort((a, b) => monthSortValue(a.month) - monthSortValue(b.month))
}

export function getFuelByLocation(records: FuelRecord[]) {
  const grouped = new Map<string, number>()

  records.forEach((item) => {
    grouped.set(item.location, (grouped.get(item.location) || 0) + item.fuel)
  })

  return Array.from(grouped.entries())
    .map(([location, fuel]) => ({
      location,
      fuel: Number(fuel.toFixed(1)),
    }))
    .sort(
      (a, b) =>
        ALL_LOCATIONS.indexOf(a.location as AssetLocation) -
        ALL_LOCATIONS.indexOf(b.location as AssetLocation)
    )
}

export function getFuelByFuelType(records: FuelRecord[]) {
  const grouped = new Map<string, number>()

  records.forEach((item) => {
    grouped.set(item.fuelType, (grouped.get(item.fuelType) || 0) + item.fuel)
  })

  return Array.from(grouped.entries())
    .map(([fuelType, fuel]) => ({
      fuelType,
      fuel: Number(fuel.toFixed(1)),
    }))
    .sort(
      (a, b) =>
        ALL_FUEL_TYPES.indexOf(a.fuelType as FuelType) -
        ALL_FUEL_TYPES.indexOf(b.fuelType as FuelType)
    )
}
