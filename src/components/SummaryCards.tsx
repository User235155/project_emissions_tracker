import { Building2, Cog, Car, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FuelEntry } from '@/types/fuelEntry';

interface SummaryCardsProps {
  entries: FuelEntry[];
}

export function SummaryCards({ entries }: SummaryCardsProps) {
  const buildingEntries = entries.filter(e => e.assetCategory === 'building');
  const machineryEntries = entries.filter(e => e.assetCategory === 'machinery');
  const vehicleEntries = entries.filter(e => e.assetCategory === 'vehicle');

  const totalUsage = Math.round(entries.reduce((sum, e) => sum + e.amount, 0));

  const stats = [
    {
      label: 'Total Entries',
      value: entries.length,
      sub: `${totalUsage.toLocaleString()} units total`,
      icon: TrendingUp,
      iconBg: 'bg-indigo-50 text-indigo-600',
      border: 'border-l-indigo-500',
    },
    {
      label: 'Buildings',
      value: buildingEntries.length,
      sub: `${Math.round(buildingEntries.reduce((s, e) => s + e.amount, 0)).toLocaleString()} units`,
      icon: Building2,
      iconBg: 'bg-amber-50 text-amber-600',
      border: 'border-l-amber-500',
    },
    {
      label: 'Machinery',
      value: machineryEntries.length,
      sub: `${Math.round(machineryEntries.reduce((s, e) => s + e.amount, 0)).toLocaleString()} units`,
      icon: Cog,
      iconBg: 'bg-orange-50 text-orange-600',
      border: 'border-l-orange-500',
    },
    {
      label: 'Vehicles',
      value: vehicleEntries.length,
      sub: `${Math.round(vehicleEntries.reduce((s, e) => s + e.amount, 0)).toLocaleString()} units`,
      icon: Car,
      iconBg: 'bg-violet-50 text-violet-600',
      border: 'border-l-violet-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`border border-border border-l-4 ${stat.border} shadow-sm hover:shadow-md transition-shadow`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <div className={`rounded-lg p-1.5 ${stat.iconBg}`}>
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground leading-none">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-2 truncate">{stat.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
