import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { formatDate, getDaysUntilExpiry } from '@/utils/dateUtils';
import { Calendar, AlertCircle, CheckCircle, Clock, Users, X, Search } from 'lucide-react';

type FilterType = 'all' | 'active' | 'expiring-soon' | 'expired';

interface DashboardProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string, name: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  filteredSubscriptions: Subscription[];
}

export function Dashboard({ 
  subscriptions, 
  onEdit, 
  onDelete, 
  activeFilter, 
  onFilterChange, 
  searchQuery, 
  onSearchChange, 
  onClearSearch, 
  filteredSubscriptions 
}: DashboardProps) {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const expiredSubscriptions = subscriptions.filter(sub => sub.status === 'expired');
  const expiringSoonSubscriptions = subscriptions.filter(sub => sub.status === 'expiring-soon');
  const totalSubscriptions = subscriptions.length;

  const handleCardClick = (filterType: FilterType) => {
    // Toggle behavior: if clicking the same filter, turn it off
    if (activeFilter === filterType) {
      onFilterChange('all');
    } else {
      onFilterChange(filterType);
    }
  };

  const StatusCard = ({ 
    title, 
    count, 
    subscriptions: cardSubscriptions, 
    icon: Icon, 
    variant,
    description,
    filterType,
    isActive
  }: {
    title: string;
    count: number;
    subscriptions: Subscription[];
    icon: any;
    variant: 'success' | 'warning' | 'destructive' | 'default';
    description: string;
    filterType: FilterType;
    isActive: boolean;
  }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 rounded-xl ${
        isActive 
          ? 'bg-gradient-primary text-white shadow-glow border-2 border-primary/20 scale-105 transform' 
          : 'bg-white border border-border/50 shadow-card hover:shadow-hover hover:scale-105 hover:border-primary/20'
      }`}
      onClick={() => handleCardClick(filterType)}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl transition-all duration-200 ${
            isActive ? 'bg-white/20 backdrop-blur-sm' :
            variant === 'success' ? 'bg-gradient-icon-success' : 
            variant === 'warning' ? 'bg-gradient-icon-warning' : 
            variant === 'destructive' ? 'bg-gradient-icon-danger' :
            'bg-gradient-icon-primary'
          }`}>
            <Icon className={`h-6 w-6 ${
              isActive ? 'text-white' : 'text-white'
            }`} />
          </div>
          {isActive && (
            <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm animate-scale-in">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        <div className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
          isActive ? 'text-white' : 'text-foreground'
        }`}>
          {count}
        </div>
        <div className={`text-sm font-semibold mb-2 transition-colors duration-200 ${
          isActive ? 'text-white/90' : 'text-foreground'
        }`}>
          {title}
        </div>
        <p className={`text-xs mb-3 transition-colors duration-200 ${
          isActive ? 'text-white/70' : 'text-muted-foreground'
        }`}>
          {description}
        </p>
        <div className={`text-xs font-medium transition-colors duration-200 ${
          isActive ? 'text-white/80' : 'text-muted-foreground hover:text-primary'
        }`}>
          Click to {isActive ? 'clear' : 'filter'}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          SubTrackr
        </h1>
        <p className="text-muted-foreground">Track your recurring subscriptions</p>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Total Subscriptions"
          count={totalSubscriptions}
          subscriptions={subscriptions}
          icon={Users}
          variant="default"
          description="All tracked subscriptions"
          filterType="all"
          isActive={activeFilter === 'all'}
        />
        
        <StatusCard
          title="Active"
          count={activeSubscriptions.length}
          subscriptions={activeSubscriptions}
          icon={CheckCircle}
          variant="success"
          description="Currently active services"
          filterType="active"
          isActive={activeFilter === 'active'}
        />
        
        <StatusCard
          title="Expiring Soon"
          count={expiringSoonSubscriptions.length}
          subscriptions={expiringSoonSubscriptions}
          icon={Clock}
          variant="warning"
          description="Expires within 14 days"
          filterType="expiring-soon"
          isActive={activeFilter === 'expiring-soon'}
        />
        
        <StatusCard
          title="Expired"
          count={expiredSubscriptions.length}
          subscriptions={expiredSubscriptions}
          icon={AlertCircle}
          variant="destructive"
          description="Need attention"
          filterType="expired"
          isActive={activeFilter === 'expired'}
        />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions by name or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 rounded-xl border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Clear Filters Button */}
        {(activeFilter !== 'all' || searchQuery) && (
          <Button 
            variant="outline" 
            onClick={() => {
              onFilterChange('all');
              onClearSearch();
            }}
            className="flex items-center gap-2 animate-fade-in whitespace-nowrap rounded-xl border-border/50 hover:border-primary hover:bg-primary/5 transition-all duration-200"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search Results Summary */}
      {(activeFilter !== 'all' || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Showing {filteredSubscriptions.length} subscription{filteredSubscriptions.length !== 1 ? 's' : ''}</span>
          {activeFilter !== 'all' && (
            <Badge variant="secondary" className="capitalize">
              {activeFilter === 'expiring-soon' ? 'Expiring Soon' : activeFilter}
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="outline">
              Contains "{searchQuery}"
            </Badge>
          )}
        </div>
      )}

      {/* Recent Activity / Filtered Results */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {(activeFilter !== 'all' || searchQuery) ? 'Filtered Results' : 'Recent Activity'}
            <Badge variant="secondary" className="ml-2">
              {filteredSubscriptions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-sm">
                {searchQuery 
                  ? `No subscriptions match "${searchQuery}"` 
                  : `No ${activeFilter} subscriptions found`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubscriptions
                .sort((a, b) => b.expirationDate.getTime() - a.expirationDate.getTime())
                .slice(0, 10)
                .map(sub => (
                   <div 
                     key={sub.id} 
                     className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all duration-200 group"
                   >
                     <div className="flex-1">
                       <div className="flex items-center gap-3 mb-2">
                         <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                            {sub.clientName}
                         </span>
                         <Badge 
                           variant="outline" 
                           className="text-xs font-medium bg-white border-border/50 text-muted-foreground px-2 py-1 rounded-lg"
                         >
                           {sub.planType}
                         </Badge>
                       </div>
                       <p className="text-sm text-muted-foreground">
                         Expires: {formatDate(sub.expirationDate)}
                         {sub.cost && <span className="ml-3">• ${sub.cost.toFixed(2)}</span>}
                       </p>
                       {sub.notes && (
                         <p className="text-xs text-muted-foreground/80 mt-1 truncate">
                           {sub.notes}
                         </p>
                       )}
                     </div>
                     <div className="flex items-center gap-3">
                       <Badge 
                         className={`font-medium px-3 py-1 rounded-lg transition-all duration-200 ${
                           sub.status === 'active' ? 'bg-gradient-icon-success text-white border-0' : 
                           sub.status === 'expiring-soon' ? 'bg-gradient-icon-warning text-white border-0' : 
                           'bg-gradient-icon-danger text-white border-0'
                         }`}
                       >
                         {sub.status === 'expired' ? 'Expired' : 
                          sub.status === 'expiring-soon' ? `${getDaysUntilExpiry(sub.expirationDate)}d` : 
                          'Active'}
                       </Badge>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => onEdit(sub)}
                           className="h-8 w-8 p-0 rounded-lg border-border/50 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                         >
                           <Edit className="h-3 w-3" />
                         </Button>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button
                               size="sm"
                               variant="outline"
                               className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:border-destructive hover:bg-destructive/5 rounded-lg transition-all duration-200"
                             >
                               <Trash2 className="h-3 w-3" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent className="rounded-xl border-border/50">
                             <AlertDialogHeader>
                               <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Are you sure you want to delete "{sub.clientName}"? This action cannot be undone.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                               <AlertDialogAction 
                                 onClick={() => onDelete(sub.id, sub.clientName)}
                                 className="bg-gradient-icon-danger hover:opacity-90 text-white rounded-lg border-0 transition-all duration-200"
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}