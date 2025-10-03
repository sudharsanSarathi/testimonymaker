import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from './ui/button';
import { Highlighter, Check, Eraser } from 'lucide-react';

interface HighlightRange {
  start: number;
  end: number;
  id: string;
}

interface HighlightableTextareaProps {
  value: string;
  onChange: (value: string, highlights: HighlightRange[]) => void;
  placeholder?: string;
  className?: string;
  highlights?: HighlightRange[];
  onModeReset?: () => void;
}

export interface HighlightableTextareaRef {
  resetHighlightMode: () => void;
}

export const HighlightableTextarea = forwardRef<HighlightableTextareaRef, HighlightableTextareaProps>(({ 
  value, 
  onChange, 
  placeholder = "Enter your testimonial message...", 
  className = "",
  highlights = [],
  onModeReset
}, ref) => {
  const [currentHighlights, setCurrentHighlights] = useState<HighlightRange[]>(highlights);
  const [highlightMode, setHighlightMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  const [showMobileHighlightButton, setShowMobileHighlightButton] = useState(false);
  const [mobileSelectedText, setMobileSelectedText] = useState<{start: number, end: number, text: string} | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightOverlayRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update highlights when prop changes
  useEffect(() => {
    setCurrentHighlights(highlights);
  }, [highlights]);



  // Reset highlight mode when called from parent
  useEffect(() => {
    if (onModeReset) {
      setHighlightMode(false);
    }
  }, [onModeReset]);

  // Apply custom selection styles when in highlight mode
  useEffect(() => {
    if (highlightMode) {
      // Create or update the style element for highlight mode
      let styleElement = document.getElementById('highlight-mode-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'highlight-mode-styles';
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = `
        .highlight-mode-textarea::selection {
          background-color: transparent !important;
          color: inherit !important;
        }
        .highlight-mode-textarea::-moz-selection {
          background-color: transparent !important;
          color: inherit !important;
        }
      `;
    } else {
      // Remove the style element when not in highlight mode
      const styleElement = document.getElementById('highlight-mode-styles');
      if (styleElement) {
        styleElement.remove();
      }
    }

    // Cleanup function to remove styles when component unmounts
    return () => {
      if (!highlightMode) {
        const styleElement = document.getElementById('highlight-mode-styles');
        if (styleElement) {
          styleElement.remove();
        }
      }
    };
  }, [highlightMode]);

  // Get current selection range from textarea
  const getSelectionRange = useCallback(() => {
    if (!textareaRef.current) return null;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    return start !== end ? { start, end } : null;
  }, []);

  // Handle selection when in highlight mode
  const handleSelectionChange = useCallback(() => {
    if (!highlightMode) return;
    
    // Small delay to ensure selection is captured after mouse up
    setTimeout(() => {
      const range = getSelectionRange();
      
      if (range && range.start !== range.end) {
        const selectedText = value.slice(range.start, range.end);
        
        // Don't highlight empty or whitespace-only selections
        if (selectedText.trim().length === 0) return;
        
        // Check if this text is already highlighted
        const isAlreadyHighlighted = currentHighlights.some(
          h => h.start === range.start && h.end === range.end
        );
        
        if (!isAlreadyHighlighted) {
          const newHighlight: HighlightRange = {
            start: range.start,
            end: range.end,
            id: `highlight-${Date.now()}-${Math.random()}`
          };

          const updatedHighlights = [...currentHighlights, newHighlight]
            .sort((a, b) => a.start - b.start);

          setCurrentHighlights(updatedHighlights);
          onChange(value, updatedHighlights);
          
          // Auto-close highlight mode after adding a highlight
          autoCloseAfterHighlight();
        }

        // Clear selection after highlighting
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(range.end, range.end);
        }
      }
    }, 10);
  }, [highlightMode, currentHighlights, value, onChange, getSelectionRange]);

  // Handle text changes
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Update highlights when text changes to maintain position accuracy
    if (newValue.length < value.length) {
      // Text was deleted - need to adjust or remove highlights
      const adjustedHighlights = currentHighlights
        .map(highlight => {
          // If highlight is completely beyond the new text length, remove it
          if (highlight.start >= newValue.length) {
            return null;
          }
          // If highlight extends beyond new text length, truncate it
          if (highlight.end > newValue.length) {
            return {
              ...highlight,
              end: Math.min(highlight.end, newValue.length)
            };
          }
          return highlight;
        })
        .filter(Boolean) as HighlightRange[];
      
      setCurrentHighlights(adjustedHighlights);
      onChange(newValue, adjustedHighlights);
    } else {
      // Text was added - highlights should remain in their positions
      onChange(newValue, currentHighlights);
    }
  }, [value, currentHighlights, onChange]);

  // Toggle highlight mode
  const toggleHighlightMode = useCallback(() => {
    setHighlightMode(!highlightMode);
    setShowMobileHighlightButton(false);
    setMobileSelectedText(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [highlightMode]);

  // Clear all highlights
  const clearAllHighlights = useCallback(() => {
    setCurrentHighlights([]);
    onChange(value, []);
  }, [value, onChange]);

  // Close highlight mode
  const closeHighlightMode = useCallback(() => {
    setHighlightMode(false);
    setShowMobileHighlightButton(false);
    setMobileSelectedText(null);
  }, []);

  // Auto-close highlight mode after adding highlights
  const autoCloseAfterHighlight = useCallback(() => {
    // Add a small delay to allow the highlight to be processed
    setTimeout(() => {
      setHighlightMode(false);
      setShowMobileHighlightButton(false);
      setMobileSelectedText(null);
    }, 500);
  }, []);

  // Reset mode externally
  const resetMode = useCallback(() => {
    setHighlightMode(false);
    setShowMobileHighlightButton(false);
    setMobileSelectedText(null);
  }, []);

  // Mobile: Handle text selection changes
  const handleMobileSelectionChange = useCallback(() => {
    if (!isMobile || !highlightMode || !textareaRef.current) return;
    
    // Use a longer timeout to ensure selection is captured properly on mobile
    setTimeout(() => {
      if (!textareaRef.current) return;
      
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      
      if (start !== end) {
        const selectedText = value.slice(start, end);
        if (selectedText.trim().length > 0) {
          setMobileSelectedText({ start, end, text: selectedText });
          setShowMobileHighlightButton(true);
        }
      } else {
        setMobileSelectedText(null);
        setShowMobileHighlightButton(false);
      }
    }, 150); // Increased timeout for better mobile compatibility
  }, [isMobile, highlightMode, value]);

  // Mobile: Add selected text as highlight
  const handleAddMobileHighlight = useCallback(() => {
    if (!mobileSelectedText) return;
    
    const newHighlight: HighlightRange = {
      start: mobileSelectedText.start,
      end: mobileSelectedText.end,
      id: `highlight-${Date.now()}-${mobileSelectedText.start}`
    };
    
    const updatedHighlights = [...currentHighlights, newHighlight]
      .filter((highlight, index, array) => 
        array.findIndex(h => h.start === highlight.start && h.end === highlight.end) === index
      )
      .sort((a, b) => a.start - b.start);
    
    setCurrentHighlights(updatedHighlights);
    onChange(value, updatedHighlights);
    
    // Clear selection and hide button
    setMobileSelectedText(null);
    setShowMobileHighlightButton(false);
    
    // Auto-close highlight mode after adding a highlight
    autoCloseAfterHighlight();
    
    // Clear the selection in textarea
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(mobileSelectedText.end, mobileSelectedText.end);
    }
  }, [mobileSelectedText, currentHighlights, value, onChange]);

  // Mobile: Handle double-tap to enable selection
  const handleMobileDoubleTap = useCallback(() => {
    if (!isMobile || !highlightMode) return;
    
    // Enable text selection by triggering focus
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Small delay to ensure focus is set before showing instruction
      setTimeout(() => {
        setShowMobileHighlightButton(false); // Reset button state
      }, 100);
    }
  }, [isMobile, highlightMode]);

  // Handle scroll synchronization between textarea and highlight overlay
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    
    // Sync highlight overlay scroll
    if (highlightOverlayRef.current) {
      highlightOverlayRef.current.scrollTop = scrollTop;
    }
  }, []);

  // Expose reset function to parent using useImperativeHandle
  useImperativeHandle(ref, () => ({
    resetHighlightMode: resetMode
  }), [resetMode]);

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Highlight overlay that sits behind the textarea */}
        {currentHighlights.length > 0 && (
          <div
            ref={highlightOverlayRef}
            className="absolute inset-0 rounded-xl pointer-events-none whitespace-pre-wrap break-words overflow-hidden"
            style={{
              minHeight: '96px',
              maxHeight: '200px',
              overflowY: 'auto',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              fontFamily: 'inherit',
              letterSpacing: 'inherit',
              wordSpacing: 'inherit',
              zIndex: 1,
              scrollTop: scrollTop,
              padding: '8px' // Match textarea padding
            }}
          >
            {renderInlineHighlights(value, currentHighlights)}
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          onMouseUp={!isMobile ? handleSelectionChange : undefined}
          onKeyUp={!isMobile ? handleSelectionChange : undefined}
          onTouchEnd={isMobile ? handleMobileSelectionChange : undefined}
          onDoubleClick={isMobile ? handleMobileDoubleTap : undefined}
          onScroll={handleScroll}
          onFocus={isMobile && highlightMode ? () => {
            // Enable text selection on focus for mobile
            if (textareaRef.current) {
              textareaRef.current.style.webkitUserSelect = 'text';
              textareaRef.current.style.userSelect = 'text';
            }
          } : undefined}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-[#D5E7D5] resize-none overflow-auto whitespace-pre-wrap break-words text-gray-900 placeholder:text-gray-400 ${highlightMode && !isMobile ? 'highlight-mode-textarea' : ''} ${className}`}
          style={{ 
            minHeight: '96px',
            maxHeight: '200px',
            overflowY: 'auto',
            cursor: highlightMode && !isMobile ? 'crosshair' : 'text',
            WebkitUserSelect: 'text',
            userSelect: 'text',
            WebkitTouchCallout: highlightMode && isMobile ? 'default' : 'none',
            backgroundColor: currentHighlights.length > 0 ? 'transparent' : 'white',
            position: 'relative',
            zIndex: 2,
            padding: '8px' // Add 8px padding inside the textarea
          }}
        />
      </div>

      {/* Highlight Controls - show highlight management controls when user has text */}
      {value.trim().length > 0 && !highlightMode && (
        <div className="flex gap-2 flex-wrap p-[8px]">
          <Button
            type="button"
            onClick={toggleHighlightMode}
            size="sm"
            variant="outline"
            className="rounded-lg border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          >
            <Highlighter className="w-3 h-3 mr-1" />
            {currentHighlights.length > 0 ? (isMobile ? 'Add More Highlights' : 'Add More Highlights') : (isMobile ? 'Highlight Text' : 'Highlight Text')}
          </Button>
          {currentHighlights.length > 0 && (
            <Button
              type="button"
              onClick={clearAllHighlights}
              size="sm"
              variant="outline"
              className="rounded-lg border-red-500 text-red-600 hover:bg-red-50"
            >
              <Eraser className="w-3 h-3 mr-1" />
              Clear All Highlights
            </Button>
          )}
        </div>
      )}

      {/* Highlight Mode Controls */}
      {highlightMode && (
        <div className="flex gap-2 flex-wrap items-center p-[8px]">
          <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200">
            <Highlighter className="w-3 h-3" />
            <span>{isMobile ? 'Double tap on the words to highlight' : 'Select text to highlight it'}</span>
          </div>
          
          {/* Mobile Add Highlight Button - Show before Done button when text is selected */}
          {showMobileHighlightButton && mobileSelectedText && isMobile && (
            <Button
              type="button"
              onClick={handleAddMobileHighlight}
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 text-black border border-yellow-600 rounded-lg shadow-md"
            >
              <Highlighter className="w-3 h-3 mr-1" />
              Add Highlight
            </Button>
          )}
          
          <Button
            type="button"
            onClick={closeHighlightMode}
            size="sm"
            variant="outline"
            className="rounded-lg border-green-500 text-green-600 hover:bg-green-50"
          >
            <Check className="w-3 h-3 mr-1" />
            Done
          </Button>
        </div>
      )}






    </div>
  );
});

HighlightableTextarea.displayName = 'HighlightableTextarea';

// Helper function to render inline highlights that overlay the textarea
function renderInlineHighlights(text: string, highlights: HighlightRange[] = []) {
  if (!text || highlights.length === 0) {
    return null;
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Sort highlights by start position
  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

  sortedHighlights.forEach((highlight, index) => {
    // Add transparent text before highlight
    if (highlight.start > lastIndex) {
      elements.push(
        <span key={`text-before-${index}`} className="text-transparent">
          {text.slice(lastIndex, highlight.start)}
        </span>
      );
    }

    // Add highlighted text with background only (text transparent so textarea text shows through)
    elements.push(
      <span 
        key={highlight.id}
        className="text-transparent rounded-sm"
        style={{ backgroundColor: '#FFFF05' }}
      >
        {text.slice(highlight.start, highlight.end)}
      </span>
    );

    lastIndex = highlight.end;
  });

  // Add remaining transparent text
  if (lastIndex < text.length) {
    elements.push(
      <span key="text-end" className="text-transparent">
        {text.slice(lastIndex)}
      </span>
    );
  }

  return <>{elements}</>;
}

// Helper function to render text with highlights for preview
function renderHighlightPreview(text: string, highlights: HighlightRange[] = []) {
  if (!text || highlights.length === 0) {
    return <span className="text-gray-500">{text || 'No text entered'}</span>;
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Sort highlights by start position
  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

  sortedHighlights.forEach((highlight, index) => {
    // Add text before highlight
    if (highlight.start > lastIndex) {
      elements.push(
        <span key={`text-before-${index}`} className="text-gray-700">
          {text.slice(lastIndex, highlight.start)}
        </span>
      );
    }

    // Add highlighted text - no padding for overlay effect
    elements.push(
      <span 
        key={highlight.id}
        className="text-black rounded-sm"
        style={{ backgroundColor: '#FFFF05' }}
      >
        {text.slice(highlight.start, highlight.end)}
      </span>
    );

    lastIndex = highlight.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(
      <span key="text-end" className="text-gray-700">
        {text.slice(lastIndex)}
      </span>
    );
  }

  return <>{elements}</>;
}