import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from './ui/button';
import { Highlighter, Check, Eraser, Clock } from 'lucide-react';
import WhatsappBackground from "../imports/WhatsappBackground";

interface HighlightRange {
  start: number;
  end: number;
  id: string;
}

interface BubbleInputProps {
  value: string;
  onChange: (value: string, highlights: HighlightRange[]) => void;
  placeholder?: string;
  className?: string;
  highlights?: HighlightRange[];
  time: string;
  onTimeChange: (time: string) => void;
  onModeReset?: () => void;
}

export interface BubbleInputRef {
  resetHighlightMode: () => void;
  focus: () => void;
}

export const BubbleInput = forwardRef<BubbleInputRef, BubbleInputProps>(({ 
  value, 
  onChange, 
  placeholder = "Type your testimonial message here...", 
  className = "",
  highlights = [],
  time,
  onTimeChange,
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
  const timeInputRef = useRef<HTMLInputElement>(null);

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
      let styleElement = document.getElementById('bubble-highlight-mode-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'bubble-highlight-mode-styles';
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = `
        .bubble-highlight-mode-textarea::selection {
          background-color: #FFFF05 !important;
          color: #000000 !important;
        }
        .bubble-highlight-mode-textarea::-moz-selection {
          background-color: #FFFF05 !important;
          color: #000000 !important;
        }
      `;
    } else {
      const styleElement = document.getElementById('bubble-highlight-mode-styles');
      if (styleElement) {
        styleElement.remove();
      }
    }

    return () => {
      if (!highlightMode) {
        const styleElement = document.getElementById('bubble-highlight-mode-styles');
        if (styleElement) {
          styleElement.remove();
        }
      }
    };
  }, [highlightMode]);

  // Auto-close highlight mode after adding highlights
  const autoCloseAfterHighlight = useCallback(() => {
    setTimeout(() => {
      setHighlightMode(false);
      setShowMobileHighlightButton(false);
      setMobileSelectedText(null);
    }, 500);
  }, []);

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
    
    setTimeout(() => {
      const range = getSelectionRange();
      
      if (range && range.start !== range.end) {
        const selectedText = value.slice(range.start, range.end);
        
        if (selectedText.trim().length === 0) return;
        
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

        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(range.end, range.end);
        }
      }
    }, 10);
  }, [highlightMode, currentHighlights, value, onChange, getSelectionRange, autoCloseAfterHighlight]);

  // Handle text changes
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    if (newValue.length < value.length) {
      const adjustedHighlights = currentHighlights
        .map(highlight => {
          if (highlight.start >= newValue.length) {
            return null;
          }
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

  // Reset mode externally
  const resetMode = useCallback(() => {
    setHighlightMode(false);
    setShowMobileHighlightButton(false);
    setMobileSelectedText(null);
  }, []);

  // Mobile: Handle text selection changes
  const handleMobileSelectionChange = useCallback(() => {
    if (!isMobile || !highlightMode || !textareaRef.current) return;
    
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
    }, 150);
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
    
    setMobileSelectedText(null);
    setShowMobileHighlightButton(false);
    
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(mobileSelectedText.end, mobileSelectedText.end);
    }
    
    // Auto-close highlight mode after adding a highlight
    autoCloseAfterHighlight();
  }, [mobileSelectedText, currentHighlights, value, onChange, autoCloseAfterHighlight]);

  // Handle scroll synchronization between textarea and highlight overlay
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    
    if (highlightOverlayRef.current) {
      highlightOverlayRef.current.scrollTop = scrollTop;
    }
  }, []);

  // Handle time change
  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onTimeChange(e.target.value);
  }, [onTimeChange]);

  // Focus function for external access
  const focusTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Expose methods to parent using useImperativeHandle
  useImperativeHandle(ref, () => ({
    resetHighlightMode: resetMode,
    focus: focusTextarea
  }), [resetMode, focusTextarea]);

  // Format time for display
  const formatTimeForDisplay = (time24: string) => {
    if (!time24) return "5:07 pm";
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'pm' : 'am';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Format time for input
  const formatTimeForInput = (displayTime: string) => {
    if (!displayTime) return "17:07";
    if (displayTime.includes(':') && displayTime.length === 5) {
      return displayTime;
    }
    const [hours, minutes] = displayTime.split(':');
    const paddedHours = hours.padStart(2, '0');
    return `${paddedHours}:${minutes}`;
  };

  // Helper function to render inline highlights
  const renderInlineHighlights = (text: string, highlights: HighlightRange[] = []) => {
    if (!text || highlights.length === 0) {
      return null;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    sortedHighlights.forEach((highlight, index) => {
      if (highlight.start > lastIndex) {
        elements.push(
          <span key={`text-before-${index}`} className="text-transparent">
            {text.slice(lastIndex, highlight.start)}
          </span>
        );
      }

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

    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end" className="text-transparent">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <>{elements}</>;
  };

  return (
    <div className="space-y-4">
      {/* WhatsApp-style Bubble Container */}
      <div 
        className="relative rounded-2xl overflow-hidden p-6"
        style={{ backgroundColor: '#efeae2' }}
      >
        {/* WhatsApp Background Pattern */}
        <div className="absolute inset-0">
          <WhatsappBackground />
        </div>

        {/* Bubble Input */}
        <div className="relative z-10 flex justify-start">
          <div className="relative max-w-[80%]">
            {/* Chat bubble tail */}
            <div className="absolute left-0 top-0 w-2 h-[13px] z-50">
              <svg
                className="block w-full h-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 8 13"
              >
                <path
                  d="M1.533 2.568L8 11.193V0H2.812C1.042 0 0.474 1.156 1.533 2.568Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* Main bubble container */}
            <div 
              className="bg-white rounded-lg rounded-tl-none ml-2 relative"
              style={{
                boxShadow: '0px 1px 0.5px 0px rgba(11,20,26,0.13)',
                borderTopLeftRadius: '0px',
                borderTopRightRadius: '7.5px',
                borderBottomLeftRadius: '7.5px',
                borderBottomRightRadius: '7.5px',
                padding: '8px'
              }}
            >
              {/* Content container */}
              <div className="relative">
                {/* Highlight overlay */}
                {currentHighlights.length > 0 && (
                  <div
                    ref={highlightOverlayRef}
                    className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words overflow-hidden"
                    style={{
                      fontSize: '14.2px',
                      lineHeight: '19px',
                      fontFamily: 'Helvetica Neue, sans-serif',
                      padding: '4px 0',
                      zIndex: 1,
                      scrollTop: scrollTop
                    }}
                  >
                    {renderInlineHighlights(value, currentHighlights)}
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={handleTextChange}
                  onMouseUp={!isMobile ? handleSelectionChange : undefined}
                  onKeyUp={!isMobile ? handleSelectionChange : undefined}
                  onTouchEnd={isMobile ? handleMobileSelectionChange : undefined}
                  onScroll={handleScroll}
                  placeholder={placeholder}
                  className={`w-full resize-none overflow-hidden whitespace-pre-wrap break-words border-none outline-none ${highlightMode && !isMobile ? 'bubble-highlight-mode-textarea' : ''} ${className}`}
                  style={{ 
                    fontSize: '14.2px',
                    lineHeight: '19px',
                    fontFamily: 'Helvetica Neue, sans-serif',
                    color: '#111b21',
                    backgroundColor: currentHighlights.length > 0 ? 'transparent' : 'white',
                    minHeight: '19px',
                    maxHeight: '200px',
                    cursor: highlightMode && !isMobile ? 'crosshair' : 'text',
                    WebkitUserSelect: highlightMode ? 'text' : 'auto',
                    userSelect: highlightMode ? 'text' : 'auto',
                    WebkitTouchCallout: highlightMode && isMobile ? 'default' : 'none',
                    padding: '4px 0',
                    position: 'relative',
                    zIndex: 2
                  }}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                  }}
                />

                {/* Time display */}
                <div className="flex justify-end mt-2">
                  <div className="relative">
                    <input
                      ref={timeInputRef}
                      type="time"
                      value={formatTimeForInput(time)}
                      onChange={handleTimeChange}
                      className="absolute opacity-0 pointer-events-none"
                    />
                    <span 
                      className="text-[#667781] text-[11px] leading-[15px] cursor-pointer hover:text-[#4a5568] transition-colors"
                      style={{ fontFamily: 'Helvetica Neue, sans-serif' }}
                      onClick={() => timeInputRef.current?.showPicker()}
                      title="Click to change time"
                    >
                      {formatTimeForDisplay(time)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight Controls */}
      {value.trim().length > 0 && !highlightMode && (
        <div className="flex gap-2 flex-wrap">
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
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200">
            <Highlighter className="w-3 h-3" />
            <span>{isMobile ? 'Select text in the bubble above, then tap "Add Highlight"' : 'Select text in the bubble to highlight it'}</span>
          </div>
          
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

BubbleInput.displayName = 'BubbleInput';