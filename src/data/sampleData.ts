import { Subscription } from '@/types/subscription';
import { calculateExpirationDate, getSubscriptionStatus } from '@/utils/dateUtils';
import { subDays, addDays, subMonths, addMonths } from 'date-fns';

function createSubscription(
  id: string,
  clientName: string,
  planType: string,
  duration: string,
  startDate: Date,
  customDuration?: number,
  notes?: string
): Subscription {
  const expirationDate = calculateExpirationDate(startDate, duration, customDuration);
  const status = getSubscriptionStatus(expirationDate);
  
  return {
    id,
    clientName,
    planType,
    duration,
    customDuration,
    startDate,
    expirationDate,
    notes,
    status
  };
}

export const sampleSubscriptions: Subscription[] = [
  // Active subscriptions
  createSubscription(
    '1',
    'Netflix',
    'Basic',
    '1-month',
    subDays(new Date(), 10),
    undefined,
    'Family plan with 4K streaming'
  ),
  createSubscription(
    '2',
    'Spotify Premium',
    'Premium',
    '1-month',
    subDays(new Date(), 5),
    undefined,
    'Individual plan'
  ),
  createSubscription(
    '3',
    'Adobe Creative Cloud',
    'Platinum',
    '1-year',
    subMonths(new Date(), 2),
    undefined,
    'Full suite for design work'
  ),
  
  // Expiring soon
  createSubscription(
    '4',
    'GitHub Pro',
    'Premium',
    '1-month',
    subDays(new Date(), 20),
    undefined,
    'Private repositories and advanced features'
  ),
  createSubscription(
    '5',
    'Gym Membership',
    'Basic',
    'custom',
    subDays(new Date(), 75),
    90,
    'Annual membership with personal trainer sessions'
  ),
  
  // Expired
  createSubscription(
    '6',
    'New York Times',
    'Premium',
    '1-month',
    subDays(new Date(), 35),
    undefined,
    'Digital subscription'
  ),
  createSubscription(
    '7',
    'VPN Service',
    'Platinum',
    '1-year',
    subDays(new Date(), 370),
    undefined,
    'NordVPN premium plan'
  ),
  
  // More active subscriptions
  createSubscription(
    '8',
    'Microsoft 365',
    'Basic',
    '1-month',
    addDays(new Date(), -8),
    undefined,
    'Office suite and cloud storage'
  )
];

export const subscriptionTypes = [
  'Basic',
  'Premium', 
  'Platinum'
];

export const durationOptions = [
  { label: '1 Day', value: '1-day', days: 1 },
  { label: '1 Week', value: '1-week', days: 7 },
  { label: '1 Month', value: '1-month', days: 30 },
  { label: '3 Months', value: '3-months', days: 90 },
  { label: '6 Months', value: '6-months', days: 180 },
  { label: '1 Year', value: '1-year', days: 365 },
  { label: 'Lifetime', value: 'lifetime', days: null },
  { label: 'Custom Date', value: 'custom', days: null }
];