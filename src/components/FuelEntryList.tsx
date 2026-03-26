import { format } from 'date-fns';
import { Trash2, Building2, Cog, Car, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FuelEntry,
  ASSET_CATEGORIES,
  FUEL_TYPES,
  WEATHER_CONDITIONS,
} from '@/types/fuelEntry';

interface FuelEntryListProps {
  entries: FuelEntry[];
  onDelete?: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'building': return <Building2 className="h-4 w-4" />;
    case 'machinery': return <Cog className="h-4 w-4" />;
    case 'vehicle': return <Car className="h-4 w-4" />;
    default: return null;
  }
};

export function FuelEntryList({ entries, onDelete }: FuelEntryListProps) {
  if (entries.length === 0) {
    return (
      <Card className="border border-border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileX className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1 text-sm">No entries yet</h3>
          <p className="text-xs text-muted-foreground max-w-[220px]">
            Use the form to record your first fuel or energy entry.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>Recent Entries</span>
          <Badge variant="secondary" className="font-normal text-xs">
            {entries.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <ScrollArea className="h-[460px]">
        <CardContent className="p-3 space-y-2">
          {entries.map((entry) => {
            const category = ASSET_CATEGORIES.find(c => c.value === entry.assetCategory);
            const fuelType = FUEL_TYPES.find(f => f.value === entry.fuelType);
            const weather = entry.weatherCondition
              ? WEATHER_CONDITIONS.find(w => w.value === entry.weatherCondition)
              : null;

            return (
              <div
                key={entry.id}
                className="group flex items-start gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/40 transition-colors"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-md bg-accent flex items-center justify-center text-accent-foreground">
                  {getCategoryIcon(entry.assetCategory)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {entry.assetName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {category?.label} · {fuelType?.label}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-foreground">
                        {Math.round(entry.amount).toLocaleString()} {entry.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(entry.periodStart, 'dd MMM')} – {format(entry.periodEnd, 'dd MMM yy')}
                      </p>
                    </div>
                  </div>

                  {(weather && weather.value !== 'normal' || entry.notes) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {weather && weather.value !== 'normal' && (
                        <Badge variant="outline" className="text-xs py-0 h-5">
                          {weather.label}
                        </Badge>
                      )}
                      {entry.notes && (
                        <span className="text-xs text-muted-foreground italic truncate max-w-[180px]">
                          {entry.notes}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(entry.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
