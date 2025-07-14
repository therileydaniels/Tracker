import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Subscription, SubscriptionFormData } from '@/types/subscription';
import { calculateExpirationDate, getSubscriptionStatus } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from './useLocalStorage';
import { subscriptionTypes, durationOptions } from '@/data/sampleData';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [customTypes, setCustomTypes] = useLocalStorage<string[]>('subtrackr-custom-types', subscriptionTypes);
  const [customDurations, setCustomDurations] = useLocalStorage<typeof durationOptions>('subtrackr-custom-durations', durationOptions);

  // Fetch subscriptions from Supabase
  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('expiration_date', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const formattedData: Subscription[] = data.map(sub => ({
        id: sub.id,
        clientName: sub.client_name,
        planType: sub.plan_type,
        cost: parseFloat(sub.cost.toString()),
        notes: sub.notes || '',
        duration: sub.duration,
        customDuration: sub.custom_duration ? parseFloat(sub.custom_duration.toString()) : undefined,
        customDate: sub.custom_date ? new Date(sub.custom_date) : undefined,
        startDate: new Date(sub.start_date),
        expirationDate: new Date(sub.expiration_date),
        status: sub.status as 'active' | 'expired' | 'expiring-soon'
      }));

      setSubscriptions(formattedData);
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

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  const addSubscription = async (formData: SubscriptionFormData) => {
    if (!user) return null;

    try {
      const expirationDate = calculateExpirationDate(
        formData.startDate,
        formData.duration,
        formData.customDuration,
        formData.customDate
      );

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          client_name: formData.clientName,
          plan_type: formData.planType,
          cost: formData.cost,
          notes: formData.notes,
          duration: formData.duration,
          custom_duration: formData.customDuration,
          custom_date: formData.customDate?.toISOString().split('T')[0],
          start_date: formData.startDate.toISOString().split('T')[0],
          expiration_date: expirationDate?.toISOString().split('T')[0],
          status: getSubscriptionStatus(expirationDate)
        })
        .select()
        .single();

      if (error) throw error;

      const newSubscription: Subscription = {
        id: data.id,
        clientName: data.client_name,
        planType: data.plan_type,
        cost: parseFloat(data.cost.toString()),
        notes: data.notes || '',
        duration: data.duration,
        customDuration: data.custom_duration ? parseFloat(data.custom_duration.toString()) : undefined,
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
    if (!user) return;

    try {
      const expirationDate = calculateExpirationDate(
        formData.startDate,
        formData.duration,
        formData.customDuration,
        formData.customDate
      );

      const { error } = await supabase
        .from('subscriptions')
        .update({
          client_name: formData.clientName,
          plan_type: formData.planType,
          cost: formData.cost,
          notes: formData.notes,
          duration: formData.duration,
          custom_duration: formData.customDuration,
          custom_date: formData.customDate?.toISOString().split('T')[0],
          start_date: formData.startDate.toISOString().split('T')[0],
          expiration_date: expirationDate?.toISOString().split('T')[0],
          status: getSubscriptionStatus(expirationDate)
        })
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
    if (!user) return;

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
    refetch: fetchSubscriptions
  };
}