import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';

interface CalendarViewProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string, name: string) => void;
}

export function CalendarView({ subscriptions, onEdit, onDelete }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Generate empty cells for the start of the month
  const startDayOfWeek = getDay(monthStart);
  const emptyCells = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getSubscriptionsForDay = (date: Date) => {
    return subscriptions.filter(sub => isSameDay(sub.expirationDate, date));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-icon-success text-white border-0 shadow-sm';
      case 'expiring-soon':
        return 'bg-gradient-icon-warning text-white border-0 shadow-sm';
      case 'expired':
        return 'bg-gradient-icon-danger text-white border-0 shadow-sm';
      default:
        return 'bg-muted text-muted-foreground border border-border/50';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Calendar View</h2>
        <p className="text-muted-foreground">View all subscription expiration dates</p>
      </div>

      <Card className="bg-white border border-border/50 shadow-hover rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-primary text-white p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateMonth('prev')} 
                className="text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateMonth('next')} 
                className="text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Empty cells for month start */}
            {emptyCells.map(index => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            
            {/* Calendar days */}
            {days.map(day => {
              const daySubscriptions = getSubscriptionsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    aspect-square border rounded-xl p-2 text-sm relative transition-all duration-200 cursor-pointer group
                    ${isToday ? 'bg-primary/10 border-primary shadow-glow' : 'border-border/30 hover:bg-primary/5 hover:border-primary/30'}
                    ${daySubscriptions.length > 0 ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-primary/40' : ''}
                  `}
                  title={daySubscriptions.length > 0 ? `${daySubscriptions.length} subscription(s) expiring` : ''}
                >
                  <div className={`font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Red dot indicator for subscriptions */}
                  {daySubscriptions.length > 0 && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  )}
                  
                  {/* Subscription indicators */}
                  <div className="absolute inset-x-1 bottom-1 space-y-1">
                    {daySubscriptions.slice(0, 2).map(sub => (
                      <div
                        key={sub.id}
                        className="w-full text-xs px-1 py-0.5 rounded text-center truncate bg-red-100 text-red-800 border border-red-200"
                        title={`${sub.clientName} expires`}
                      >
                        {sub.clientName}
                      </div>
                    ))}
                    {daySubscriptions.length > 2 && (
                      <div className="text-xs text-center text-red-600 font-medium">
                        +{daySubscriptions.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success/20 border border-success/40"></div>
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-warning/20 border border-warning/40"></div>
              <span className="text-sm text-muted-foreground">Expiring Soon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive/40"></div>
              <span className="text-sm text-muted-foreground">Expired</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Expirations */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Upcoming Expirations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscriptions
              .filter(sub => {
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                return sub.expirationDate >= monthStart && sub.expirationDate <= monthEnd;
              })
              .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())
              .map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{sub.clientName}</span>
                      <Badge variant="outline" className="text-xs">
                        {sub.planType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(sub.expirationDate, 'EEEE, MMMM do')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        sub.status === 'active' ? 'default' : 
                        sub.status === 'expiring-soon' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {sub.status === 'expired' ? 'Expired' : 
                       sub.status === 'expiring-soon' ? 'Soon' : 
                       'Active'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(sub)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{sub.clientName}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete(sub.id, sub.clientName)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            {subscriptions.filter(sub => {
              const monthStart = startOfMonth(currentMonth);
              const monthEnd = endOfMonth(currentMonth);
              return sub.expirationDate >= monthStart && sub.expirationDate <= monthEnd;
            }).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No subscriptions expiring this month
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}