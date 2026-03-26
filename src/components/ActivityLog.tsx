import { format, formatDistanceToNow } from 'date-fns';
import { User, Clock, Building2, Cog, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FuelEntry, FUEL_TYPES } from '@/types/fuelEntry';

interface ActivityLogProps {
  entries: FuelEntry[];
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'building':
      return <Building2 className="h-3 w-3" />;
    case 'machinery':
      return <Cog className="h-3 w-3" />;
    case 'vehicle':
      return <Car className="h-3 w-3" />;
    default:
      return null;
  }
};

// Simulated users for demo
const DEMO_USERS = ['John D.', 'Sarah M.', 'Mike T.', 'Emma R.', 'Alex K.'];

const getRandomUser = (id: string) => {
  const index = parseInt(id) % DEMO_USERS.length;
  return DEMO_USERS[index];
};

const getUserInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('');
};

const USER_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
];

export function ActivityLog({ entries }: ActivityLogProps) {
  // Group entries by date
  const groupedByDate = entries.reduce((acc, entry) => {
    const dateKey = format(entry.createdAt, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, FuelEntry[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  // Summary stats
  const uniqueUsers = [...new Set(entries.map(e => getRandomUser(e.id)))];
  const thisWeekEntries = entries.filter(e => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return e.createdAt >= weekAgo;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Activity Log</h2>
        <span className="text-sm text-muted-foreground">
          Who entered what and when
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{uniqueUsers.length}</p>
                <p className="text-xs text-muted-foreground">Contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-blue-500/10 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{thisWeekEntries.length}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-amber-500/10 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{sortedDates.length}</p>
                <p className="text-xs text-muted-foreground">Entry Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-purple-500/10 text-purple-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(entries.length / uniqueUsers.length)}
                </p>
                <p className="text-xs text-muted-foreground">Avg per User</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Entry Timeline</CardTitle>
          <CardDescription>All entries grouped by date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedDates.map((dateKey) => {
              const dayEntries = groupedByDate[dateKey];
              const displayDate = format(new Date(dateKey), 'EEEE, MMMM d, yyyy');
              const relativeDate = formatDistanceToNow(new Date(dateKey), { addSuffix: true });

              return (
                <div key={dateKey} className="relative">
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{displayDate}</p>
                      <p className="text-xs text-muted-foreground">{relativeDate}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
                    </Badge>
                  </div>

                  {/* Entries for this date */}
                  <div className="ml-4 pl-7 border-l-2 border-muted space-y-3">
                    {dayEntries.map((entry) => {
                      const user = getRandomUser(entry.id);
                      const userIndex = DEMO_USERS.indexOf(user);
                      const fuelType = FUEL_TYPES.find(f => f.value === entry.fuelType);

                      return (
                        <div
                          key={entry.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`${USER_COLORS[userIndex]} text-white text-xs`}>
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm text-foreground">{user}</span>
                              <span className="text-muted-foreground text-sm">added</span>
                              <Badge variant="outline" className="text-xs gap-1">
                                {getCategoryIcon(entry.assetCategory)}
                                {entry.assetName}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {Math.round(entry.amount).toLocaleString()} {entry.unit} of {fuelType?.label}
                              <span className="mx-1">•</span>
                              {format(entry.periodStart, 'MMM d')} - {format(entry.periodEnd, 'MMM d')}
                            </p>
                            {entry.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                "{entry.notes}"
                              </p>
                            )}
                          </div>

                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(entry.createdAt, 'h:mm a')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contributors Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Contributors Overview</CardTitle>
          <CardDescription>Entries by team member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uniqueUsers.map((user) => {
              const userEntries = entries.filter(e => getRandomUser(e.id) === user);
              const userIndex = DEMO_USERS.indexOf(user);
              const lastEntry = userEntries[0];

              return (
                <div
                  key={user}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`${USER_COLORS[userIndex]} text-white`}>
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-medium text-foreground">{user}</p>
                    <p className="text-sm text-muted-foreground">
                      Last entry: {formatDistanceToNow(lastEntry.createdAt, { addSuffix: true })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-foreground">{userEntries.length}</p>
                    <p className="text-xs text-muted-foreground">entries</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
