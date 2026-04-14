import type { AssetLocation, AssetType, FuelType } from '@/types/fuelEntry'

export const STORAGE_KEY = 'asset-fuel-records-v4'

export const ALL_LOCATIONS: AssetLocation[] = ['Central services' , 'Northside' , 'Quarry 1' , 'Quarry 2' , 'Roslyn Pier' , 'Mobile' , 'Dornie Pier' , 'Old Stores' , 'Cookhouse' , 'Lochan' , 'Tigh na quay' , 'Southside' , 'Utility']

export const ALL_ASSET_TYPES: AssetType[] = [
  'Generator',
  'Boat',
  'Plant',
  'Fuel store',
  'Energy store'
]

export const ALL_FUEL_TYPES: FuelType[] = ['Diesel', 'Marine Diesel', 'Solar', 'Kerosene']

export const ALL_MONTHS = [
  'Jan 2026',
  'Feb 2026',
  'Mar 2026',
  'Apr 2026',
  'May 2026',
  'Jun 2026',
  'Jul 2026',
  'Aug 2026',
  'Sep 2026',
  'Oct 2026',
  'Nov 2026',
  'Dec 2026',
]

export const SERIES_COLORS = [
  '#f38ba0',
  '#6faee0',
  '#f2d17b',
  '#78c5c3',
  '#a98af2',
  '#f3b26b',
  '#8fc2ea',
  '#9bcc9a',
  '#a2d2a2',
  '#c5a3ff',
  '#ffbe98',
  '#7dc6f3',
]