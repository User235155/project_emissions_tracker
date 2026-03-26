export type AssetCategory = 'building' | 'machinery' | 'vehicle';

export type FuelType = 
  | 'diesel' 
  | 'petrol' 
  | 'electricity' 
  | 'natural_gas' 
  | 'lpg' 
  | 'heating_oil'
  | 'other';

export type WeatherCondition = 
  | 'normal' 
  | 'very_cold' 
  | 'very_hot' 
  | 'very_windy' 
  | 'scaled_up' 
  | 'scaled_down';

export interface FuelEntry {
  id: string;
  assetCategory: AssetCategory;
  assetName: string;
  fuelType: FuelType;
  amount: number;
  unit: string;
  periodStart: Date;
  periodEnd: Date;
  weatherCondition?: WeatherCondition;
  notes?: string;
  createdAt: Date;
  createdBy?: string;
}

export const ASSET_CATEGORIES: { value: AssetCategory; label: string; icon: string }[] = [
  { value: 'building', label: 'Building', icon: '🏢' },
  { value: 'machinery', label: 'Plant/Machinery', icon: '⚙️' },
  { value: 'vehicle', label: 'Vehicle', icon: '🚗' },
];

export const FUEL_TYPES: { value: FuelType; label: string; defaultUnit: string }[] = [
  { value: 'diesel', label: 'Diesel', defaultUnit: 'litres' },
  { value: 'petrol', label: 'Petrol', defaultUnit: 'litres' },
  { value: 'electricity', label: 'Electricity', defaultUnit: 'kWh' },
  { value: 'natural_gas', label: 'Natural Gas', defaultUnit: 'kWh' },
  { value: 'lpg', label: 'LPG', defaultUnit: 'litres' },
  { value: 'heating_oil', label: 'Heating Oil', defaultUnit: 'litres' },
  { value: 'other', label: 'Other', defaultUnit: 'units' },
];

export const WEATHER_CONDITIONS: { value: WeatherCondition; label: string; description: string }[] = [
  { value: 'normal', label: 'Normal', description: 'Typical operating conditions' },
  { value: 'very_cold', label: 'Very Cold', description: 'Below normal temperatures' },
  { value: 'very_hot', label: 'Very Hot', description: 'Above normal temperatures' },
  { value: 'very_windy', label: 'Very Windy', description: 'High wind conditions' },
  { value: 'scaled_up', label: 'Scaled Up', description: 'Increased operations' },
  { value: 'scaled_down', label: 'Scaled Down', description: 'Reduced operations' },
];
