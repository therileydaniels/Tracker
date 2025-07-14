import { useState, useEffect } from 'react';
import { Subscription, SubscriptionFormData } from '@/types/subscription';
import { calculateExpirationDate, getSubscriptionStatus } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionTypes, durationOptions } from '@/data/sampleData';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [customTypes, setCustomTypes] = useState<string[]>(subscriptionTypes);
  const [customDurations, setCustomDurations] = useState<typeof durationOptions>(durationOptions);

  // Fetch subscriptions from Supabase
  const fetchSubscriptions = async () => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSubscriptions: Subscription[] = (data || []).map(sub => ({
        id: sub.id,
        clientName: sub.client_name,
        planType: sub.plan_type,
        cost: sub.cost,
        notes: sub.notes || '',
        duration: sub.duration,
        customDuration: sub.custom_duration || undefined,
        customDate: sub.custom_date ? new Date(sub.custom_date) : undefined,
        startDate: new Date(sub.start_date),
        expirationDate: sub.expiration_date ? new Date(sub.expiration_date) : new Date(),
        status: sub.status as 'active' | 'expired' | 'expiring-soon'
      }));

      setSubscriptions(formattedSubscriptions);
    } catch (error: any) {
      toast({
        title: "Error fetching subscriptions",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load subscriptions when user changes
  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  const addSubscription = async (formData: SubscriptionFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add subscriptions.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const expirationDate = calculateExpirationDate(
        formData.startDate,
        formData.duration,
        formData.customDuration,
        formData.customDate
      );

      const subscriptionData = {
        user_id: user.id,
        client_name: formData.clientName,
        plan_type: formData.planType,
        cost: formData.cost || 0,
        notes: formData.notes || '',
        duration: formData.duration,
        custom_duration: formData.customDuration || null,
        custom_date: formData.customDate ? formData.customDate.toISOString().split('T')[0] : null,
        start_date: formData.startDate.toISOString().split('T')[0],
        expiration_date: expirationDate.toISOString().split('T')[0],
        status: getSubscriptionStatus(expirationDate)
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (error) throw error;

      const newSubscription: Subscription = {
        id: data.id,
        clientName: data.client_name,
        planType: data.plan_type,
        cost: data.cost,
        notes: data.notes || '',
        duration: data.duration,
        customDuration: data.custom_duration || undefined,
        customDate: data.custom_date ? new Date(data.custom_date) : undefined,
        startDate: new Date(data.start_date),
        expirationDate: new Date(data.expiration_date),
        status: data.status as 'active' | 'expired' | 'expiring-soon'
      };

      setSubscriptions(prev => [newSubscription, ...prev]);
      toast({
        title: "Subscription added",
        description: `${formData.clientName} subscription has been added successfully.`
      });

      return newSubscription;
    } catch (error: any) {
      toast({
        title: "Error adding subscription",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const updateSubscription = async (id: string, formData: SubscriptionFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update subscriptions.",
        variant: "destructive"
      });
      return;
    }

    try {
      const expirationDate = calculateExpirationDate(
        formData.startDate,
        formData.duration,
        formData.customDuration,
        formData.customDate
      );

      const updateData = {
        client_name: formData.clientName,
        plan_type: formData.planType,
        cost: formData.cost || 0,
        notes: formData.notes || '',
        duration: formData.duration,
        custom_duration: formData.customDuration || null,
        custom_date: formData.customDate ? formData.customDate.toISOString().split('T')[0] : null,
        start_date: formData.startDate.toISOString().split('T')[0],
        expiration_date: expirationDate.toISOString().split('T')[0],
        status: getSubscriptionStatus(expirationDate)
      };

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id 
            ? { 
                ...sub, 
                ...formData, 
                expirationDate, 
                status: getSubscriptionStatus(expirationDate) 
              }
            : sub
        )
      );

      toast({
        title: "Subscription updated",
        description: `${formData.clientName} subscription has been updated successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Error updating subscription",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteSubscription = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete subscriptions.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast({
        title: "Subscription deleted",
        description: "Subscription has been deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting subscription",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addCustomType = (type: string) => {
    setCustomTypes(prev => [...prev, type]);
  };

  const removeCustomType = (type: string) => {
    setCustomTypes(prev => prev.filter(t => t !== type));
  };

  const addCustomDuration = (duration: { label: string; value: string; days: number | null }) => {
    setCustomDurations(prev => [...prev, duration]);
  };

  const updateCustomDuration = (index: number, duration: { label: string; value: string; days: number | null }) => {
    setCustomDurations(prev => prev.map((d, i) => i === index ? duration : d));
  };

  const removeCustomDuration = (index: number) => {
    setCustomDurations(prev => prev.filter((_, i) => i !== index));
  };

  const refetch = async () => {
    await fetchSubscriptions();
  };

  return {
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
    removeCustomDuration,
    refetch
  };
}