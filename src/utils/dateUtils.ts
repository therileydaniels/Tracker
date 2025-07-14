import { addDays, addMonths, addYears, format, isBefore, differenceInDays } from 'date-fns';
import { Subscription } from '@/types/subscription';

export function calculateExpirationDate(
  startDate: Date,
  duration: string,
  customDuration?: number,
  customDate?: Date
): Date {
  // Handle lifetime subscriptions
  if (duration === 'lifetime') {
    return new Date('2099-12-31'); // Far future date to represent "never expires"
  }
  
  // Handle custom date
  if (duration === 'custom' && customDate) {
    return customDate;
  }
  
  // Handle predefined durations
  const durationMap: { [key: string]: number } = {
    '1-day': 1,
    '1-week': 7,
    '1-month': 30,
    '3-months': 90,
    '6-months': 180,
    '1-year': 365
  };
  
  const days = durationMap[duration] || customDuration || 30;
  return addDays(startDate, days);
}

export function getSubscriptionStatus(expirationDate: Date): 'active' | 'expired' | 'expiring-soon' {
  const now = new Date();
  const daysUntilExpiry = differenceInDays(expirationDate, now);
  
  // Check for lifetime subscriptions (far future date)
  if (expirationDate.getFullYear() >= 2099) {
    return 'active';
  }
  
  if (isBefore(expirationDate, now)) {
    return 'expired';
  } else if (daysUntilExpiry <= 14) {
    return 'expiring-soon';
  } else {
    return 'active';
  }
}

export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

export function getDaysUntilExpiry(expirationDate: Date): number {
  return differenceInDays(expirationDate, new Date());
}