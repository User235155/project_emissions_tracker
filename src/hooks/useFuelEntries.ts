import { useState, useCallback } from 'react';
import { FuelEntry } from '@/types/fuelEntry';

// Extended sample data for demonstration
const SAMPLE_ENTRIES: FuelEntry[] = [
  // January 2024
  {
    id: '1',
    assetCategory: 'building',
    assetName: 'Main Office',
    fuelType: 'electricity',
    amount: 4500,
    unit: 'kWh',
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-01-31'),
    weatherCondition: 'very_cold',
    notes: 'Heating ran more due to cold snap',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '2',
    assetCategory: 'vehicle',
    assetName: 'Fleet Van #3',
    fuelType: 'diesel',
    amount: 320,
    unit: 'litres',
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-01-31'),
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    assetCategory: 'machinery',
    assetName: 'Generator A',
    fuelType: 'diesel',
    amount: 150,
    unit: 'litres',
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-01-31'),
    weatherCondition: 'scaled_up',
    notes: 'Extra usage during power outage',
    createdAt: new Date('2024-02-02'),
  },
  {
    id: '4',
    assetCategory: 'building',
    assetName: 'Warehouse B',
    fuelType: 'natural_gas',
    amount: 2800,
    unit: 'kWh',
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-01-31'),
    weatherCondition: 'very_cold',
    createdAt: new Date('2024-02-01'),
  },
  // February 2024
  {
    id: '5',
    assetCategory: 'building',
    assetName: 'Main Office',
    fuelType: 'electricity',
    amount: 4200,
    unit: 'kWh',
    periodStart: new Date('2024-02-01'),
    periodEnd: new Date('2024-02-29'),
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '6',
    assetCategory: 'vehicle',
    assetName: 'Fleet Van #3',
    fuelType: 'diesel',
    amount: 290,
    unit: 'litres',
    periodStart: new Date('2024-02-01'),
    periodEnd: new Date('2024-02-29'),
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '7',
    assetCategory: 'vehicle',
    assetName: 'Delivery Truck #1',
    fuelType: 'diesel',
    amount: 480,
    unit: 'litres',
    periodStart: new Date('2024-02-01'),
    periodEnd: new Date('2024-02-29'),
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '8',
    assetCategory: 'machinery',
    assetName: 'Forklift #2',
    fuelType: 'lpg',
    amount: 90,
    unit: 'litres',
    periodStart: new Date('2024-02-01'),
    periodEnd: new Date('2024-02-29'),
    createdAt: new Date('2024-03-01'),
  },
  // March 2024
  {
    id: '9',
    assetCategory: 'building',
    assetName: 'Main Office',
    fuelType: 'electricity',
    amount: 3800,
    unit: 'kWh',
    periodStart: new Date('2024-03-01'),
    periodEnd: new Date('2024-03-31'),
    createdAt: new Date('2024-04-01'),
  },
  {
    id: '10',
    assetCategory: 'building',
    assetName: 'Warehouse B',
    fuelType: 'natural_gas',
    amount: 2200,
    unit: 'kWh',
    periodStart: new Date('2024-03-01'),
    periodEnd: new Date('2024-03-31'),
    createdAt: new Date('2024-04-01'),
  },
  {
    id: '11',
    assetCategory: 'vehicle',
    assetName: 'Fleet Van #3',
    fuelType: 'diesel',
    amount: 340,
    unit: 'litres',
    periodStart: new Date('2024-03-01'),
    periodEnd: new Date('2024-03-31'),
    createdAt: new Date('2024-04-01'),
  },
  {
    id: '12',
    assetCategory: 'machinery',
    assetName: 'Generator A',
    fuelType: 'diesel',
    amount: 80,
    unit: 'litres',
    periodStart: new Date('2024-03-01'),
    periodEnd: new Date('2024-03-31'),
    createdAt: new Date('2024-04-01'),
  },
  // April 2024
  {
    id: '13',
    assetCategory: 'building',
    assetName: 'Main Office',
    fuelType: 'electricity',
    amount: 3200,
    unit: 'kWh',
    periodStart: new Date('2024-04-01'),
    periodEnd: new Date('2024-04-30'),
    createdAt: new Date('2024-05-01'),
  },
  {
    id: '14',
    assetCategory: 'vehicle',
    assetName: 'Delivery Truck #1',
    fuelType: 'diesel',
    amount: 520,
    unit: 'litres',
    periodStart: new Date('2024-04-01'),
    periodEnd: new Date('2024-04-30'),
    weatherCondition: 'scaled_up',
    notes: 'Busy delivery season',
    createdAt: new Date('2024-05-01'),
  },
  {
    id: '15',
    assetCategory: 'building',
    assetName: 'Workshop C',
    fuelType: 'electricity',
    amount: 1800,
    unit: 'kWh',
    periodStart: new Date('2024-04-01'),
    periodEnd: new Date('2024-04-30'),
    createdAt: new Date('2024-05-01'),
  },
  // May 2024
  {
    id: '16',
    assetCategory: 'building',
    assetName: 'Main Office',
    fuelType: 'electricity',
    amount: 2900,
    unit: 'kWh',
    periodStart: new Date('2024-05-01'),
    periodEnd: new Date('2024-05-31'),
    createdAt: new Date('2024-06-01'),
  },
  {
    id: '17',
    assetCategory: 'vehicle',
    assetName: 'Fleet Van #3',
    fuelType: 'diesel',
    amount: 310,
    unit: 'litres',
    periodStart: new Date('2024-05-01'),
    periodEnd: new Date('2024-05-31'),
    createdAt: new Date('2024-06-01'),
  },
  {
    id: '18',
    assetCategory: 'machinery',
    assetName: 'Compressor Unit',
    fuelType: 'electricity',
    amount: 650,
    unit: 'kWh',
    periodStart: new Date('2024-05-01'),
    periodEnd: new Date('2024-05-31'),
    createdAt: new Date('2024-06-01'),
  },
  // June 2024
  {
    id: '19',
    assetCategory: 'building',
    assetName: 'Main Office',
    fuelType: 'electricity',
    amount: 3100,
    unit: 'kWh',
    periodStart: new Date('2024-06-01'),
    periodEnd: new Date('2024-06-30'),
    weatherCondition: 'very_hot',
    notes: 'AC running more',
    createdAt: new Date('2024-07-01'),
  },
  {
    id: '20',
    assetCategory: 'vehicle',
    assetName: 'Company Car #1',
    fuelType: 'petrol',
    amount: 180,
    unit: 'litres',
    periodStart: new Date('2024-06-01'),
    periodEnd: new Date('2024-06-30'),
    createdAt: new Date('2024-07-01'),
  },
];

export function useFuelEntries() {
  const [entries, setEntries] = useState<FuelEntry[]>(SAMPLE_ENTRIES);
  const [isLoading, setIsLoading] = useState(false);

  const addEntry = useCallback((entry: Omit<FuelEntry, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    setTimeout(() => {
      const newEntry: FuelEntry = {
        ...entry,
        amount: Math.round(entry.amount), // Round the amount
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      setEntries(prev => [newEntry, ...prev]);
      setIsLoading(false);
    }, 300);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  return {
    entries,
    isLoading,
    addEntry,
    deleteEntry,
  };
}
