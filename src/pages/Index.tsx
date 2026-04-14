import { BarChart3, PenLine, Users, Activity, FlameKindling } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FuelEntryForm } from '@/components/FuelEntryForm';
import { FuelEntryList } from '@/components/FuelEntryList';
import { SummaryCards } from '@/components/SummaryCards';
import { DataCharts } from '@/components/DataCharts';
import { ActivityLog } from '@/components/ActivityLog';
import { EmissionsManager } from '@/components/EmissionsManager';
import { useFuelEntries } from '@/hooks/useFuelEntries';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const Index = () => {
  const { entries, isLoading, addEntry, deleteEntry } = useFuelEntries();

  const handleAddEntry = (entry: Parameters<typeof addEntry>[0]) => {
    addEntry(entry);
    toast.success('Entry recorded', {
      description: `${entry.assetName} — ${Math.round(entry.amount)} ${entry.unit}`,
    });
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    toast.success('Entry removed');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-white leading-tight tracking-tight">
                  Energy & Fuel Tracker
                </h1>
                <p className="text-xs text-slate-400">Usage monitoring dashboard</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {entries.length} entries
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <SummaryCards entries={entries} />

        <Tabs defaultValue="data" className="w-full">
          <TabsList className="w-full max-w-2xl grid grid-cols-4 mb-6 bg-card border border-border shadow-sm p-1 h-11 rounded-xl">
            <TabsTrigger value="data" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:shadow-sm">
              <PenLine className="h-3.5 w-3.5" />
              <span>Data Entry</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:shadow-sm">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:shadow-sm">
              <Users className="h-3.5 w-3.5" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="emissions" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:shadow-sm">
              <FlameKindling className="h-3.5 w-3.5" />
              <span>Emissions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <FuelEntryForm onSubmit={handleAddEntry} isLoading={isLoading} />
              <FuelEntryList entries={entries} onDelete={handleDelete} />
            </div>
          </TabsContent>

          <TabsContent value="charts">
            <DataCharts entries={entries} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLog entries={entries} />
          </TabsContent>

          <TabsContent value="emissions">
            <EmissionsManager />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
};

export default Index;
