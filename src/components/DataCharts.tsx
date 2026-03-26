import { useMemo } from 'react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Fuel, Zap, Flame, Droplets } from 'lucide-react';
import { FuelEntry, ASSET_CATEGORIES, FUEL_TYPES } from '@/types/fuelEntry';

interface DataChartsProps {
  entries: FuelEntry[];
}

const CATEGORY_COLORS = {
  building: 'hsl(215, 80%, 55%)',
  machinery: 'hsl(38, 85%, 52%)',
  vehicle: 'hsl(270, 55%, 55%)',
};

const PIE_COLORS = [
  'hsl(215, 80%, 55%)',
  'hsl(152, 55%, 42%)',
  'hsl(38, 85%, 52%)',
  'hsl(270, 55%, 55%)',
  'hsl(0, 65%, 55%)',
  'hsl(180, 55%, 45%)',
  'hsl(320, 55%, 50%)',
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

export function DataCharts({ entries }: DataChartsProps) {
  const monthlyData = useMemo(() => {
    const grouped: Record<string, { month: string; sortKey: string; building: number; machinery: number; vehicle: number; total: number }> = {};
    entries.forEach(entry => {
      const monthKey = format(entry.periodStart, 'MMM yyyy');
      const sortKey = format(entry.periodStart, 'yyyy-MM');
      if (!grouped[monthKey]) {
        grouped[monthKey] = { month: format(entry.periodStart, 'MMM'), sortKey, building: 0, machinery: 0, vehicle: 0, total: 0 };
      }
      grouped[monthKey][entry.assetCategory] += Math.round(entry.amount);
      grouped[monthKey].total += Math.round(entry.amount);
    });
    return Object.values(grouped).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [entries]);

  const fuelTypeData = useMemo(() => {
    const grouped: Record<string, number> = {};
    entries.forEach(entry => {
      const fuelLabel = FUEL_TYPES.find(f => f.value === entry.fuelType)?.label || entry.fuelType;
      grouped[fuelLabel] = (grouped[fuelLabel] || 0) + Math.round(entry.amount);
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  const categoryTotals = useMemo(() => {
    return ASSET_CATEGORIES.map(cat => ({
      name: cat.label,
      value: Math.round(entries.filter(e => e.assetCategory === cat.value).reduce((sum, e) => sum + e.amount, 0)),
      category: cat.value,
    }));
  }, [entries]);

  const topAssets = useMemo(() => {
    const grouped: Record<string, { name: string; total: number; category: string; count: number }> = {};
    entries.forEach(entry => {
      if (!grouped[entry.assetName]) {
        grouped[entry.assetName] = { name: entry.assetName, total: 0, category: entry.assetCategory, count: 0 };
      }
      grouped[entry.assetName].total += entry.amount;
      grouped[entry.assetName].count += 1;
    });
    return Object.values(grouped)
      .map(a => ({ ...a, total: Math.round(a.total) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [entries]);

  // KPI calculations
  const totalUsage = Math.round(entries.reduce((s, e) => s + e.amount, 0));
  const uniqueAssets = new Set(entries.map(e => e.assetName)).size;
  const avgPerEntry = entries.length > 0 ? Math.round(totalUsage / entries.length) : 0;

  // Month-over-month trend
  const trend = useMemo(() => {
    if (monthlyData.length < 2) return { value: 0, direction: 'flat' as const };
    const last = monthlyData[monthlyData.length - 1].total;
    const prev = monthlyData[monthlyData.length - 2].total;
    if (prev === 0) return { value: 0, direction: 'flat' as const };
    const pct = Math.round(((last - prev) / prev) * 100);
    return { value: Math.abs(pct), direction: pct >= 0 ? 'up' as const : 'down' as const };
  }, [monthlyData]);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Usage</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{totalUsage.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3 text-destructive" />
              ) : (
                <TrendingDown className="h-3 w-3 text-primary" />
              )}
              <span className={`text-xs font-medium ${trend.direction === 'up' ? 'text-destructive' : 'text-primary'}`}>
                {trend.value}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Assets</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{uniqueAssets}</p>
            <p className="text-xs text-muted-foreground mt-1">across {ASSET_CATEGORIES.length} categories</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg per Entry</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{avgPerEntry.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">units per record</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Points</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{entries.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{monthlyData.length} months covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Usage Trend - Full width on left */}
        <Card className="lg:col-span-2 border border-border shadow-sm">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-foreground">Usage Trend</CardTitle>
            <CardDescription className="text-xs">Monthly consumption by asset category</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CATEGORY_COLORS.building} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={CATEGORY_COLORS.building} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="machineryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CATEGORY_COLORS.machinery} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={CATEGORY_COLORS.machinery} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="vehicleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CATEGORY_COLORS.vehicle} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={CATEGORY_COLORS.vehicle} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Area type="monotone" dataKey="building" name="Buildings" stroke={CATEGORY_COLORS.building} strokeWidth={2} fill="url(#buildingGrad)" />
                  <Area type="monotone" dataKey="machinery" name="Machinery" stroke={CATEGORY_COLORS.machinery} strokeWidth={2} fill="url(#machineryGrad)" />
                  <Area type="monotone" dataKey="vehicle" name="Vehicles" stroke={CATEGORY_COLORS.vehicle} strokeWidth={2} fill="url(#vehicleGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fuel Type Breakdown */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-foreground">Fuel Breakdown</CardTitle>
            <CardDescription className="text-xs">Distribution by fuel type</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fuelTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {fuelTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value.toLocaleString(), 'Usage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend below chart */}
            <div className="px-3 space-y-1.5">
              {fuelTypeData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Category Comparison */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-foreground">Category Comparison</CardTitle>
            <CardDescription className="text-xs">Total consumption by asset type</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryTotals} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={75} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value.toLocaleString(), 'Total']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                    {categoryTotals.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Assets Table */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-foreground">Top Assets</CardTitle>
            <CardDescription className="text-xs">Highest consuming assets by total usage</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-0">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 pb-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right w-16">Entries</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right w-20">Total</span>
              </div>
              {topAssets.map((asset, i) => {
                const maxTotal = topAssets[0]?.total || 1;
                const widthPct = (asset.total / maxTotal) * 100;
                return (
                  <div key={asset.name} className="grid grid-cols-[1fr_auto_auto] gap-4 py-2.5 border-b border-border/50 last:border-0 items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${widthPct}%`,
                            minWidth: 8,
                            backgroundColor: CATEGORY_COLORS[asset.category as keyof typeof CATEGORY_COLORS],
                          }}
                        />
                      </div>
                      <p className="text-sm font-medium text-foreground truncate mt-1">{asset.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{asset.category}</p>
                    </div>
                    <span className="text-sm text-muted-foreground text-right w-16">{asset.count}</span>
                    <span className="text-sm font-semibold text-foreground text-right w-20">{asset.total.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stacked Bar */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-2 px-5 pt-5">
          <CardTitle className="text-sm font-semibold text-foreground">Monthly Breakdown</CardTitle>
          <CardDescription className="text-xs">Stacked consumption per month</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="building" name="Buildings" stackId="a" fill={CATEGORY_COLORS.building} radius={[0, 0, 0, 0]} />
                <Bar dataKey="machinery" name="Machinery" stackId="a" fill={CATEGORY_COLORS.machinery} radius={[0, 0, 0, 0]} />
                <Bar dataKey="vehicle" name="Vehicles" stackId="a" fill={CATEGORY_COLORS.vehicle} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
