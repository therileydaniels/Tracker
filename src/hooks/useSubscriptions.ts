import { useState, useEffect } from 'react';
import { Subscription, SubscriptionFormData } from '@/types/subscription';
import { calculateExpirationDate, getSubscriptionStatus } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from './useLocalStorage';
import { subscriptionTypes, durationOptions, sampleSubscriptions } from '@/data/sampleData';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('subtrackr-subscriptions', sampleSubscriptions);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [customTypes, setCustomTypes] = useLocalStorage<string[]>('subtrackr-custom-types', subscriptionTypes);
  const [customDurations, setCustomDurations] = useLocalStorage<typeof durationOptions>('subtrackr-custom-durations', durationOptions);

  // Generate a simple ID for new subscriptions
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addSubscription = async (formData: SubscriptionFormData) => {
    try {
      const expirationDate = calculateExpirationDate(
        formData.startDate,
        formData.duration,
        formData.customDuration,
        formData.customDate
      );

      const newSubscription: Subscription = {
        id: generateId(),
        clientName: formData.clientName,
        planType: formData.planType,
        cost: formData.cost,
        notes: formData.notes || '',
        duration: formData.duration,
        customDuration: formData.customDuration,
        customDate: formData.customDate,
        startDate: formData.startDate,
        expirationDate,
        status: getSubscriptionStatus(expirationDate)
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
    try {
      const expirationDate = calculateExpirationDate(
        formData.startDate,
        formData.duration,
        formData.customDuration,
        formData.customDate
      );

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
    try {
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
    // For local storage, no need to refetch
    setLoading(false);
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