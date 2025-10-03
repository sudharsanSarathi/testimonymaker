import React from 'react';
import { Button } from './ui/button';
import { FileText } from 'lucide-react';

interface TextExtractorProps {
  onExtractedText: (text: string) => void;
  className?: string;
  compact?: boolean;
}

export const TextExtractor: React.FC<TextExtractorProps> = ({ 
  onExtractedText, 
  className = "", 
  compact = false 
}) => {
  const handleExtract = () => {
    // Placeholder for OCR functionality
    const sampleText = "This is extracted text from an image.";
    onExtractedText(sampleText);
  };

  return (
    <Button
      onClick={handleExtract}
      variant="outline"
      size={compact ? "sm" : "default"}
      className={className}
    >
      <FileText className="w-4 h-4 mr-2" />
      Extract Text
    </Button>
  );
};