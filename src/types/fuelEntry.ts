export type AssetType =
  | 'Generator'
  | 'Boat'
  | 'Plant'
  | 'Fuel store'
  | 'Energy store'
  

export type FuelType = 'Diesel' | 'Marine Diesel' | 'Solar'| 'Kerosene'
export type AssetLocation = 'Central services' | 'Northside' | 'Quarry 1' | 'Quarry 2' | 'Roslyn Pier' | 'Mobile' | 'Dornie Pier' | 'Old Stores' | 'Cookhouse' | 'Lochan' | 'Tigh na quay' | 'Southside' | 'Utility'

export type FuelRecord = {
  id: string
  asset: string
  assetType: AssetType
  fuelType: FuelType
  location: AssetLocation
  fuel: number
  fuelUnit: 'litres'
  runtime: number
  runtimeUnit: 'hours'
  date: string
  month: string
  week: string
  quarter: string
  notes: string
}

export type AssetConfig = {
  asset: string
  label: string
  assetType: AssetType
  fuelType: FuelType
  location: AssetLocation
}