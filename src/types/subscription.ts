export interface Subscription {
  id: string;
  clientName: string;
  planType: string;
  duration: string;
  customDuration?: number;
  customDate?: Date;
  startDate: Date;
  expirationDate: Date;
  notes?: string;
  cost?: number;
  status: 'active' | 'expired' | 'expiring-soon';
}

export interface SubscriptionFormData {
  clientName: string;
  planType: string;
  duration: string;
  startDate: Date;
  customDuration?: number;
  customDate?: Date;
  notes?: string;
  cost?: number;
}