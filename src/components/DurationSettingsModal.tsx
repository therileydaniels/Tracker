import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Edit, Trash2 } from 'lucide-react';

interface DurationSettingsModalProps {
  customDurations: { label: string; value: string; days: number | null }[];
  onAddCustomDuration: (duration: { label: string; value: string; days: number | null }) => void;
  onRemoveCustomDuration: (index: number) => void;
}

export const DurationSettingsModal = React.memo(({ customDurations, onAddCustomDuration, onRemoveCustomDuration }: DurationSettingsModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCustomDuration, setNewCustomDuration] = useState({ label: '', value: '', days: 0 });
  const [durationError, setDurationError] = useState('');

  const addCustomDuration = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    const trimmedLabel = newCustomDuration.label.trim();
    const trimmedValue = newCustomDuration.value.trim();
    
    if (!trimmedLabel) {
      setDurationError('Duration label cannot be empty');
      return;
    }
    
    if (!trimmedValue) {
      setDurationError('Duration value cannot be empty');
      return;
    }
    
    if (customDurations.some(d => d.value === trimmedValue)) {
      setDurationError('This duration value already exists');
      return;
    }
    
    // Success - add the duration
    const newDuration = { 
      label: trimmedLabel, 
      value: trimmedValue, 
      days: newCustomDuration.days 
    };
    
    onAddCustomDuration(newDuration);
    setNewCustomDuration({ label: '', value: '', days: 0 });
    setDurationError('');
    setIsOpen(false); // Close modal on success
  };

  const handleClose = () => {
    setIsOpen(false);
    setDurationError('');
    setNewCustomDuration({ label: '', value: '', days: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2 rounded-lg border-border/50 hover:border-primary hover:bg-primary/5 transition-all duration-200" type="button">
          <Settings className="h-4 w-4 mr-1" />
          Manage Durations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Duration Options
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Add new duration */}
          <div className="space-y-2">
            <Input
              placeholder="Duration label (e.g., 2 Weeks)"
              value={newCustomDuration.label}
              onChange={(e) => {
                setNewCustomDuration(prev => ({ ...prev, label: e.target.value }));
                if (durationError) setDurationError(''); // Clear error when typing
              }}
            />
            <Input
              placeholder="Duration value (e.g., 2-weeks)"
              value={newCustomDuration.value}
              onChange={(e) => {
                setNewCustomDuration(prev => ({ ...prev, value: e.target.value }));
                if (durationError) setDurationError(''); // Clear error when typing
              }}
            />
            <Input
              type="number"
              placeholder="Days (leave blank for special durations)"
              value={newCustomDuration.days || ''}
              onChange={(e) => setNewCustomDuration(prev => ({ ...prev, days: parseInt(e.target.value) || null }))}
            />
            <Button 
              onClick={addCustomDuration} 
              size="sm" 
              className="w-full bg-gradient-button text-white border-0 rounded-lg hover:opacity-90 transition-all duration-200"
              type="button"
            >
              + Add Duration
            </Button>
            {durationError && (
              <p className="text-sm text-destructive">{durationError}</p>
            )}
          </div>
          
          {/* Existing durations */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {customDurations.map((duration, index) => (
              <div key={duration.value} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div>
                  <span className="font-medium">{duration.label}</span>
                  <span className="text-xs text-muted-foreground block">
                    {duration.days ? `${duration.days} days` : 'Special duration'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-primary" type="button">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => onRemoveCustomDuration(index)}
                    type="button"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline"
              onClick={handleClose}
              type="button"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

DurationSettingsModal.displayName = 'DurationSettingsModal';
