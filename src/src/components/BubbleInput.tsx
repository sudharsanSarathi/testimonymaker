import React, { forwardRef, useImperativeHandle } from 'react';
import { Textarea } from './ui/textarea';

export interface BubbleInputRef {
  resetHighlightMode: () => void;
  focus: () => void;
}

interface BubbleInputProps {
  value: string;
  onChange: (text: string, highlights: any[]) => void;
  highlights?: any[];
  time: string;
  onTimeChange: (time: string) => void;
  placeholder?: string;
  className?: string;
  onModeReset?: () => void;
}

export const BubbleInput = forwardRef<BubbleInputRef, BubbleInputProps>(
  ({ value, onChange, highlights = [], time, onTimeChange, placeholder, className }, ref) => {
    useImperativeHandle(ref, () => ({
      resetHighlightMode: () => {
        // Reset highlight mode
      },
      focus: () => {
        // Focus input
      }
    }));

    return (
      <div className="space-y-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value, highlights)}
          placeholder={placeholder}
          className={className}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    );
  }
);

BubbleInput.displayName = 'BubbleInput';