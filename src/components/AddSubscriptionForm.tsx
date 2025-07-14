import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, X, User, Tag, DollarSign, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SubscriptionFormData } from '@/types/subscription';
import { subscriptionTypes } from '@/data/sampleData';
import { calculateExpirationDate, formatDate } from '@/utils/dateUtils';
import { TypeSettingsModal } from './TypeSettingsModal';
import { DurationSettingsModal } from './DurationSettingsModal';

interface AddSubscriptionFormProps {
  onSubmit: (data: SubscriptionFormData) => void;
  customTypes: string[];
  onAddCustomType: (type: string) => void;
  onRemoveCustomType: (type: string) => void;
  customDurations: { label: string; value: string; days: number | null }[];
  onAddCustomDuration: (duration: { label: string; value: string; days: number | null }) => void;
  onUpdateCustomDuration: (index: number, duration: { label: string; value: string; days: number | null }) => void;
  onRemoveCustomDuration: (index: number) => void;
}

const AddSubscriptionForm = React.memo(({ onSubmit, customTypes, onAddCustomType, onRemoveCustomType, customDurations, onAddCustomDuration, onUpdateCustomDuration, onRemoveCustomDuration }: AddSubscriptionFormProps) => {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    clientName: '',
    planType: 'Basic',
    duration: '1-month',
    startDate: new Date(),
    notes: '',
    cost: undefined
  });

  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientName && formData.planType && formData.startDate) {
      onSubmit(formData);
      // Reset form
      setFormData({
        clientName: '',
        planType: 'Basic',
        duration: '1-month',
        startDate: new Date(),
        notes: '',
        cost: undefined
      });
    }
  };

  const handleCustomTypeAdded = (type: string) => {
    setFormData(prev => ({ ...prev, planType: type }));
  };

  const handleCustomDurationAdded = (duration: { label: string; value: string; days: number | null }) => {
    setFormData(prev => ({ ...prev, duration: duration.value }));
  };

  const handleRemoveCustomType = (type: string) => {
    onRemoveCustomType(type);
    if (formData.planType === type) {
      setFormData(prev => ({ ...prev, planType: '' }));
    }
  };

  const expirationDate = calculateExpirationDate(
    formData.startDate,
    formData.duration,
    formData.customDuration,
    formData.customDate
  );


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Add New Subscription</h2>
        <p className="text-muted-foreground">Track a new recurring subscription</p>
      </div>

      <Card className="bg-white border border-border/50 shadow-card hover:shadow-hover transition-all duration-200 rounded-xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Client Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter client name"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
                className="rounded-lg"
              />
            </div>

            {/* Plan Type */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="type" className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  Plan Type *
                </Label>
                <TypeSettingsModal 
                  customTypes={customTypes}
                  onAddCustomType={(type) => {
                    onAddCustomType(type);
                    handleCustomTypeAdded(type);
                  }}
                  onRemoveCustomType={handleRemoveCustomType}
                />
              </div>
                <Select
                  value={formData.planType}
                  onValueChange={(value) => setFormData({ ...formData, planType: value })}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select plan type" />
                </SelectTrigger>
                <SelectContent>
                  {customTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subscription Cost */}
            <div className="space-y-2">
              <Label htmlFor="cost" className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                Subscription Cost
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cost || ''}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || undefined })}
                  className="pl-10 rounded-lg"
                />
              </div>
              <p className="text-xs text-muted-foreground">Enter the subscription cost (e.g., 19.99)</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter description or notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="rounded-lg"
              />
            </div>

            {/* Expiration Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Expiration Duration *
                </Label>
                <DurationSettingsModal 
                  customDurations={customDurations}
                  onAddCustomDuration={(duration) => {
                    onAddCustomDuration(duration);
                    handleCustomDurationAdded(duration);
                  }}
                  onRemoveCustomDuration={onRemoveCustomDuration}
                />
              </div>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  duration: value,
                  customDate: value === 'custom' ? formData.customDate : undefined
                })}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customDurations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Expiration Date (shown only if "custom" is selected) */}
            {formData.duration === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="customDate" className="flex items-center gap-2 text-sm font-medium">
                  <CalendarIcon className="h-4 w-4" />
                  Custom Expiration Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-lg",
                        !formData.customDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.customDate ? format(formData.customDate, "MM/dd/yyyy") : "Select expiration date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.customDate}
                      onSelect={(date) => date && setFormData({ ...formData, customDate: date })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-button text-white border-0 rounded-xl py-6 text-lg font-semibold hover:opacity-90 transition-all duration-200 shadow-glow"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Subscription
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

AddSubscriptionForm.displayName = 'AddSubscriptionForm';

export default AddSubscriptionForm;