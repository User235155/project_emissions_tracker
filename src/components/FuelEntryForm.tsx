import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AssetCategory,
  FuelType,
  WeatherCondition,
  ASSET_CATEGORIES,
  FUEL_TYPES,
  WEATHER_CONDITIONS,
  FuelEntry,
} from '@/types/fuelEntry';

interface FuelEntryFormProps {
  onSubmit: (entry: Omit<FuelEntry, 'id' | 'createdAt'>) => void;
  isLoading?: boolean;
}

const STEPS = [
  { id: 1, title: 'Asset', description: 'What are you recording for?' },
  { id: 2, title: 'Usage', description: 'Fuel type and amount' },
  { id: 3, title: 'Period', description: 'When did this occur?' },
  { id: 4, title: 'Details', description: 'Optional context' },
];

export function FuelEntryForm({ onSubmit, isLoading }: FuelEntryFormProps) {
  const [step, setStep] = useState(1);
  const [assetCategory, setAssetCategory] = useState<AssetCategory | ''>('');
  const [assetName, setAssetName] = useState('');
  const [fuelType, setFuelType] = useState<FuelType | ''>('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [periodStart, setPeriodStart] = useState<Date>();
  const [periodEnd, setPeriodEnd] = useState<Date>();
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition | ''>('');
  const [notes, setNotes] = useState('');

  const selectedFuelType = FUEL_TYPES.find(f => f.value === fuelType);

  const handleFuelTypeChange = (value: FuelType) => {
    setFuelType(value);
    const fuel = FUEL_TYPES.find(f => f.value === value);
    if (fuel) setUnit(fuel.defaultUnit);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return assetCategory && assetName;
      case 2: return fuelType && amount;
      case 3: return periodStart && periodEnd;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = () => {
    if (!assetCategory || !assetName || !fuelType || !amount || !periodStart || !periodEnd) return;

    onSubmit({
      assetCategory,
      assetName,
      fuelType,
      amount: parseFloat(amount),
      unit: unit || selectedFuelType?.defaultUnit || 'units',
      periodStart,
      periodEnd,
      weatherCondition: weatherCondition || undefined,
      notes: notes || undefined,
    });

    setStep(1);
    setAssetCategory('');
    setAssetName('');
    setFuelType('');
    setAmount('');
    setUnit('');
    setPeriodStart(undefined);
    setPeriodEnd(undefined);
    setWeatherCondition('');
    setNotes('');
  };

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-4 border-b border-border bg-muted/30">
        <CardTitle className="text-lg font-semibold text-foreground">
          New Entry
        </CardTitle>
        <CardDescription>
          Step {step} of {STEPS.length} — {STEPS[step - 1].description}
        </CardDescription>
        {/* Progress bar */}
        <div className="flex gap-1.5 pt-2">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                s.id <= step ? 'bg-primary' : 'bg-border'
              )}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Step 1: Asset */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">What type of asset?</Label>
              <div className="grid grid-cols-3 gap-3">
                {ASSET_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setAssetCategory(cat.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center',
                      assetCategory === cat.value
                        ? 'border-primary bg-accent text-foreground shadow-sm'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/50'
                    )}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetName" className="text-sm font-medium text-foreground">
                Asset name
              </Label>
              <Input
                id="assetName"
                placeholder="e.g. Main Office, Van #3, Generator A"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="h-11 bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Use the same name each time for consistent tracking
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Usage */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Fuel or energy type</Label>
              <div className="grid grid-cols-2 gap-2">
                {FUEL_TYPES.map((fuel) => (
                  <button
                    key={fuel.value}
                    type="button"
                    onClick={() => handleFuelTypeChange(fuel.value)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                      fuelType === fuel.value
                        ? 'border-primary bg-accent text-foreground shadow-sm'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/50'
                    )}
                  >
                    <span className="text-sm font-medium">{fuel.label}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{fuel.defaultUnit}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11 bg-background text-lg font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm font-medium text-foreground">
                  Unit
                </Label>
                <Input
                  id="unit"
                  placeholder={selectedFuelType?.defaultUnit || 'units'}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="h-11 bg-background"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Approximate / rounded figures are fine — we're tracking trends, not auditing.
            </p>
          </div>
        )}

        {/* Step 3: Period */}
        {step === 3 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Select the time period this usage covers. Monthly is ideal, but any consistent period works.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'h-11 w-full justify-start text-left font-normal bg-background',
                        !periodStart && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {periodStart ? format(periodStart, 'dd MMM yyyy') : 'Start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover" align="start">
                    <Calendar
                      mode="single"
                      selected={periodStart}
                      onSelect={setPeriodStart}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'h-11 w-full justify-start text-left font-normal bg-background',
                        !periodEnd && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {periodEnd ? format(periodEnd, 'dd MMM yyyy') : 'End date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover" align="start">
                    <Calendar
                      mode="single"
                      selected={periodEnd}
                      onSelect={setPeriodEnd}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Optional details */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Operating conditions
              </Label>
              <Select value={weatherCondition} onValueChange={(v) => setWeatherCondition(v as WeatherCondition)}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="Normal (default)" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {WEATHER_CONDITIONS.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      <span className="flex items-center gap-2">
                        <span>{condition.label}</span>
                        <span className="text-xs text-muted-foreground">— {condition.description}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="e.g. Power outage on 5th, generator ran extra hours"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] bg-background resize-none"
              />
            </div>

            {/* Summary preview */}
            <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary</p>
              <p className="text-sm text-foreground">
                <span className="font-medium">{assetName}</span>
                {' '}({ASSET_CATEGORIES.find(c => c.value === assetCategory)?.label})
              </p>
              <p className="text-sm text-foreground">
                {amount ? Math.round(parseFloat(amount)).toLocaleString() : '—'} {unit || selectedFuelType?.defaultUnit || ''} of {selectedFuelType?.label || '—'}
              </p>
              <p className="text-sm text-muted-foreground">
                {periodStart && periodEnd
                  ? `${format(periodStart, 'dd MMM')} – ${format(periodEnd, 'dd MMM yyyy')}`
                  : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="text-muted-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Entry
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
