import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { LayoutDashboard, Plus, Calendar, Smartphone } from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import AddSubscriptionForm from '@/components/AddSubscriptionForm';
import { CalendarView } from '@/components/CalendarView';
import { EditSubscriptionForm } from '@/components/EditSubscriptionForm';
import { Subscription, SubscriptionFormData } from '@/types/subscription';

type FilterType = 'all' | 'active' | 'expiring-soon' | 'expired';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const {
    subscriptions,
    customTypes,
    customDurations,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    addCustomType,
    removeCustomType,
    addCustomDuration,
    updateCustomDuration,
    removeCustomDuration
  } = useSubscriptions();

  const handleAddSubscription = useCallback(async (formData: SubscriptionFormData) => {
    await addSubscription(formData);
    setActiveTab('dashboard');
  }, [addSubscription]);

  const handleEditSubscription = useCallback((subscription: Subscription) => {
    setEditingSubscription(subscription);
  }, []);

  const handleUpdateSubscription = useCallback(async (formData: SubscriptionFormData) => {
    if (editingSubscription) {
      await updateSubscription(editingSubscription.id, formData);
      setEditingSubscription(null);
    }
  }, [editingSubscription, updateSubscription]);

  const handleDeleteSubscription = useCallback(async (id: string, name: string) => {
    await deleteSubscription(id);
  }, [deleteSubscription]);

  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Filter subscriptions based on active filter and search query
  const getFilteredSubscriptions = () => {
    let filtered = subscriptions;
    
    // Apply card-based filter first
    if (activeFilter !== 'all') {
      const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
      const expiredSubscriptions = subscriptions.filter(sub => sub.status === 'expired');
      const expiringSoonSubscriptions = subscriptions.filter(sub => sub.status === 'expiring-soon');
      
      switch (activeFilter) {
        case 'active': filtered = activeSubscriptions; break;
        case 'expiring-soon': filtered = expiringSoonSubscriptions; break;
        case 'expired': filtered = expiredSubscriptions; break;
      }
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(sub => 
        sub.clientName.toLowerCase().includes(query) || 
        (sub.notes && sub.notes.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const filteredSubscriptions = getFilteredSubscriptions();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl p-4">
        {/* App Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">ST</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SubTrackr
            </h1>
          </div>
          <p className="text-muted-foreground">Track your recurring subscriptions</p>
        </div>

        {/* PWA Install Hint */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-primary text-white shadow-glow">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Install on Your Phone</h3>
              <p className="text-sm opacity-90">
                Add SubTrackr to your home screen for quick access
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard 
              subscriptions={subscriptions} 
              onEdit={handleEditSubscription}
              onDelete={handleDeleteSubscription}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              filteredSubscriptions={filteredSubscriptions}
            />
          </TabsContent>

          <TabsContent value="add">
            <AddSubscriptionForm 
              key="add-subscription-form"
              onSubmit={handleAddSubscription}
              customTypes={customTypes}
              onAddCustomType={addCustomType}
              onRemoveCustomType={removeCustomType}
              customDurations={customDurations}
              onAddCustomDuration={addCustomDuration}
              onUpdateCustomDuration={updateCustomDuration}
              onRemoveCustomDuration={removeCustomDuration}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView 
              subscriptions={filteredSubscriptions}
              onEdit={handleEditSubscription}
              onDelete={handleDeleteSubscription}
            />
          </TabsContent>
        </Tabs>

        <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {editingSubscription && (
              <EditSubscriptionForm
                subscription={editingSubscription}
                customTypes={customTypes}
                onSubmit={handleUpdateSubscription}
                onCancel={() => setEditingSubscription(null)}
                onAddCustomType={addCustomType}
                onRemoveCustomType={removeCustomType}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;