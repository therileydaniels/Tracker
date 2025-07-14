import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Edit, Trash2 } from 'lucide-react';

interface TypeSettingsModalProps {
  customTypes: string[];
  onAddCustomType: (type: string) => void;
  onRemoveCustomType: (type: string) => void;
}

export const TypeSettingsModal = React.memo(({ customTypes, onAddCustomType, onRemoveCustomType }: TypeSettingsModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCustomType, setNewCustomType] = useState('');
  const [typeError, setTypeError] = useState('');

  const addCustomType = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    const trimmedType = newCustomType.trim();
    
    if (!trimmedType) {
      setTypeError('Plan type cannot be empty');
      return;
    }
    
    if (customTypes.includes(trimmedType)) {
      setTypeError('This plan type already exists');
      return;
    }
    
    // Success - add the type
    onAddCustomType(trimmedType);
    setNewCustomType('');
    setTypeError('');
    setIsOpen(false); // Close modal on success
  };

  const handleClose = () => {
    setIsOpen(false);
    setTypeError('');
    setNewCustomType('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2 rounded-lg border-border/50 hover:border-primary hover:bg-primary/5 transition-all duration-200" type="button">
          <Settings className="h-4 w-4 mr-1" />
          Manage Types
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Plan Types
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Add new type */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Enter new plan type"
                value={newCustomType}
                onChange={(e) => {
                  setNewCustomType(e.target.value);
                  if (typeError) setTypeError(''); // Clear error when typing
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomType();
                  }
                }}
              />
              <Button 
                onClick={addCustomType} 
                size="sm" 
                className="bg-gradient-button text-white border-0 rounded-lg hover:opacity-90 transition-all duration-200"
                type="button"
              >
                + Add
              </Button>
            </div>
            {typeError && (
              <p className="text-sm text-destructive">{typeError}</p>
            )}
          </div>
          
          {/* Existing types */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {customTypes.map((type) => (
              <div key={type} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <span className="font-medium">{type}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-primary" type="button">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => onRemoveCustomType(type)}
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

TypeSettingsModal.displayName = 'TypeSettingsModal';
