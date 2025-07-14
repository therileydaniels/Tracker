import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Subscription, SubscriptionFormData } from '@/types/subscription';
import { calculateExpirationDate } from '@/utils/dateUtils';

interface EditSubscriptionFormProps {
  subscription: Subscription;
  customTypes: string[];
  onSubmit: (data: SubscriptionFormData) => void;
  onCancel: () => void;
  onAddCustomType: (type: string) => void;
  onRemoveCustomType: (type: string) => void;
}

const defaultTypes = ['Streaming', 'Software', 'Gaming', 'News', 'Music', 'Cloud Storage', 'VPN', 'Other'];

export function EditSubscriptionForm({ 
  subscription, 
  customTypes, 
  onSubmit, 
  onCancel, 
  onAddCustomType, 
  onRemoveCustomType 
}: EditSubscriptionFormProps) {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    clientName: subscription.clientName,
    planType: subscription.planType,
    duration: subscription.duration,
    customDuration: subscription.customDuration,
    startDate: subscription.startDate,
    notes: subscription.notes || ''
  });
  const [newCustomType, setNewCustomType] = useState('');
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addCustomType = () => {
    if (newCustomType.trim() && !allTypes.includes(newCustomType.trim())) {
      onAddCustomType(newCustomType.trim());
      setFormData(prev => ({ ...prev, type: newCustomType.trim() }));
      setNewCustomType('');
      setShowCustomTypeInput(false);
    }
  };

  const removeCustomType = (type: string) => {
    onRemoveCustomType(type);
    if (formData.planType === type) {
      setFormData(prev => ({ ...prev, planType: '' }));
    }
  };

  const allTypes = [...defaultTypes, ...customTypes];
  const expirationDate = calculateExpirationDate(formData.startDate, formData.duration, formData.customDuration);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Subscription Name</Label>
            <Input
              id="name"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Netflix, Spotify, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={formData.planType} onValueChange={(value) => setFormData(prev => ({ ...prev, planType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {allTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center justify-between w-full">
                      <span>{type}</span>
                      {customTypes.includes(type) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomType(type);
                          }}
                          className="h-4 w-4 p-0 ml-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {customTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {customTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCustomType(type)}
                      className="h-3 w-3 p-0 ml-1"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {showCustomTypeInput ? (
              <div className="flex gap-2">
                <Input
                  value={newCustomType}
                  onChange={(e) => setNewCustomType(e.target.value)}
                  placeholder="Enter custom type"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomType())}
                />
                <Button type="button" onClick={addCustomType} size="sm">
                  Add
                </Button>
                <Button type="button" onClick={() => setShowCustomTypeInput(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button type="button" onClick={() => setShowCustomTypeInput(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Type
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select 
              value={formData.duration} 
              onValueChange={(value: 'monthly' | 'yearly' | 'custom') => 
                setFormData(prev => ({ ...prev, duration: value, customDuration: value === 'custom' ? 30 : undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {formData.duration === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="customDuration">Custom Duration (days)</Label>
                <Input
                  id="customDuration"
                  type="number"
                  min="1"
                  value={formData.customDuration || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    customDuration: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="30"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes..."
              className="min-h-[80px]"
            />
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium mb-2">Preview</h3>
            <p className="text-sm text-muted-foreground">
              This subscription will expire on: <strong>{format(expirationDate, 'PPP')}</strong>
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Update Subscription
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}