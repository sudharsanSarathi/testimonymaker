import React, { forwardRef, useImperativeHandle } from 'react';
import { Textarea } from './ui/textarea';

export interface HighlightableTextareaRef {
  resetHighlightMode: () => void;
}

interface HighlightableTextareaProps {
  value: string;
  onChange: (text: string, highlights: any[]) => void;
  highlights?: any[];
  placeholder?: string;
  className?: string;
}

export const HighlightableTextarea = forwardRef<HighlightableTextareaRef, HighlightableTextareaProps>(
  ({ value, onChange, highlights = [], placeholder, className }, ref) => {
    useImperativeHandle(ref, () => ({
      resetHighlightMode: () => {
        // Reset highlight mode
      }
    }));

    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value, highlights)}
        placeholder={placeholder}
        className={className}
      />
    );
  }
);

HighlightableTextarea.displayName = 'HighlightableTextarea';