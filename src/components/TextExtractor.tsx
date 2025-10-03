import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FileText, Loader2, X, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextExtractorProps {
  onExtractedText: (text: string) => void;
  className?: string;
  compact?: boolean;
}

export function TextExtractor({ onExtractedText, className = '', compact = false }: TextExtractorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<Rectangle | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCardRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Clean text function to remove unnecessary special characters, standalone "V", and timestamps
  const cleanExtractedText = (text: string): string => {
    return text
      // Remove extra whitespace and normalize line breaks
      .replace(/\s+/g, ' ')
      .replace(/[\r\n]+/g, ' ')
      // Remove timestamps in format "hh:mm pm/am" or "h:mm pm/am"
      .replace(/\b\d{1,2}:\d{2}\s?(am|pm|AM|PM)\b/g, '')
      // Remove standalone "V" characters (common OCR artifact for checkmarks)
      .replace(/\bV\b/g, '')
      // Remove common OCR artifacts
      .replace(/[^\w\s.,!?;:'"()-]/g, '')
      // Remove multiple consecutive punctuation
      .replace(/[.,!?;:]{2,}/g, (match) => match[0])
      // Clean up multiple spaces created by removals
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim();
  };

  // Handle image upload from file input
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
    // Reset input
    event.target.value = '';
  }, []);

  // Process image file (shared between file input and drag & drop)
  const processImageFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setRectangles([]);
      setCurrentRect(null);
      setExtractedText('');
      setOverlayOpen(true); // Open overlay when image is processed
    };
    reader.readAsDataURL(file);
  }, []);



  // Get position relative to image (supports both mouse and touch)
  const getRelativePosition = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || !imageRef.current) {
      console.warn('Container or image ref not available');
      return { x: 0, y: 0 };
    }
    
    const imageRect = imageRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    // Handle both mouse and touch events
    if ('touches' in event && event.touches.length > 0) {
      // Touch event
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      console.warn('Invalid event type for position calculation');
      return { x: 0, y: 0 };
    }
    
    const x = clientX - imageRect.left;
    const y = clientY - imageRect.top;
    
    // Validate coordinates are numbers
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      console.warn('Invalid coordinates calculated:', { x, y });
      return { x: 0, y: 0 };
    }
    
    return { x, y };
  }, []);

  // Start drawing rectangle (works for both mouse and touch)
  const handleStart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!uploadedImage) return;
    
    // Prevent default touch behavior to avoid scrolling
    if ('touches' in event) {
      event.preventDefault();
    }
    
    const position = getRelativePosition(event);
    
    // Validate position coordinates
    if (typeof position.x !== 'number' || typeof position.y !== 'number' || 
        isNaN(position.x) || isNaN(position.y)) {
      console.warn('Invalid position for rectangle start:', position);
      return;
    }
    
    setIsDrawing(true);
    setStartPoint(position);
    
    const newRect: Rectangle = {
      id: `rect-${Date.now()}`,
      x: position.x,
      y: position.y,
      width: 0,
      height: 0
    };
    
    setCurrentRect(newRect);
  }, [uploadedImage, getRelativePosition]);

  // Update rectangle while drawing (works for both mouse and touch)
  const handleMove = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint || !currentRect) return;
    
    // Prevent default touch behavior
    if ('touches' in event) {
      event.preventDefault();
    }
    
    const position = getRelativePosition(event);
    
    // Validate position and startPoint coordinates
    if (typeof position.x !== 'number' || typeof position.y !== 'number' || 
        isNaN(position.x) || isNaN(position.y) ||
        typeof startPoint.x !== 'number' || typeof startPoint.y !== 'number' ||
        isNaN(startPoint.x) || isNaN(startPoint.y)) {
      console.warn('Invalid coordinates during move:', { position, startPoint });
      return;
    }
    
    const updatedRect: Rectangle = {
      ...currentRect,
      width: position.x - startPoint.x,
      height: position.y - startPoint.y
    };
    
    setCurrentRect(updatedRect);
  }, [isDrawing, startPoint, currentRect, getRelativePosition]);

  // Finish drawing rectangle (works for both mouse and touch)
  const handleEnd = useCallback(() => {
    if (!isDrawing || !currentRect) return;
    
    // Validate currentRect has valid numeric values
    if (typeof currentRect.x !== 'number' || typeof currentRect.y !== 'number' ||
        typeof currentRect.width !== 'number' || typeof currentRect.height !== 'number' ||
        isNaN(currentRect.x) || isNaN(currentRect.y) || 
        isNaN(currentRect.width) || isNaN(currentRect.height)) {
      console.warn('Invalid rectangle coordinates at end:', currentRect);
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentRect(null);
      return;
    }
    
    // Only add rectangle if it has meaningful size
    if (Math.abs(currentRect.width) > 10 && Math.abs(currentRect.height) > 10) {
      // Normalize rectangle to handle negative dimensions
      const normalizedRect: Rectangle = {
        ...currentRect,
        x: currentRect.width < 0 ? currentRect.x + currentRect.width : currentRect.x,
        y: currentRect.height < 0 ? currentRect.y + currentRect.height : currentRect.y,
        width: Math.abs(currentRect.width),
        height: Math.abs(currentRect.height)
      };
      
      // Final validation before adding to state
      if (typeof normalizedRect.x === 'number' && typeof normalizedRect.y === 'number' &&
          typeof normalizedRect.width === 'number' && typeof normalizedRect.height === 'number' &&
          !isNaN(normalizedRect.x) && !isNaN(normalizedRect.y) && 
          !isNaN(normalizedRect.width) && !isNaN(normalizedRect.height) &&
          normalizedRect.width > 0 && normalizedRect.height > 0) {
        setRectangles(prev => [...prev, normalizedRect]);
      } else {
        console.warn('Normalized rectangle failed validation:', normalizedRect);
      }
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  }, [isDrawing, currentRect]);

  // Extract text from selected areas using OCR
  const extractTextFromAreas = useCallback(async () => {
    if (!uploadedImage || !imageRef.current || rectangles.length === 0) {
      toast.error('Please select text areas first');
      return;
    }

    setIsProcessing(true);
    
    // Capture image and rectangle data for processing (but keep UI visible during extraction)
    const currentImageElement = imageRef.current;
    // Filter out any invalid rectangles before processing
    const currentRectangles = rectangles.filter(rect => 
      rect && 
      typeof rect.x === 'number' && typeof rect.y === 'number' &&
      typeof rect.width === 'number' && typeof rect.height === 'number' &&
      !isNaN(rect.x) && !isNaN(rect.y) && 
      !isNaN(rect.width) && !isNaN(rect.height) &&
      rect.width > 0 && rect.height > 0
    );
    const currentImageSrc = uploadedImage;

    // Check if we have valid rectangles to process
    if (currentRectangles.length === 0) {
      toast.error('No valid text areas found. Please select text areas first.');
      setIsProcessing(false);
      return;
    }
    
    try {
      // Validate the image element
      if (!currentImageElement || !currentImageElement.complete || currentImageElement.naturalWidth === 0) {
        throw new Error('Image not properly loaded');
      }

      // Dynamically import Tesseract.js
      const Tesseract = await import('tesseract.js');
      
      // Create a new image element to ensure we have a clean reference
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS if needed
      
      // Wait for image to load completely
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Additional validation after load
          if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            reject(new Error('Invalid image dimensions'));
            return;
          }
          resolve(null);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = currentImageSrc;
      });

      // Calculate scale factors using the original image element for display dimensions
      const scaleX = img.naturalWidth / currentImageElement.clientWidth;
      const scaleY = img.naturalHeight / currentImageElement.clientHeight;

      // Validate scale factors
      if (typeof scaleX !== 'number' || typeof scaleY !== 'number' || 
          isNaN(scaleX) || isNaN(scaleY) || scaleX <= 0 || scaleY <= 0) {
        console.error('Invalid scale factors calculated:', { 
          scaleX, 
          scaleY, 
          naturalWidth: img.naturalWidth, 
          naturalHeight: img.naturalHeight,
          clientWidth: currentImageElement.clientWidth,
          clientHeight: currentImageElement.clientHeight
        });
        throw new Error('Invalid scale factors calculated');
      }

      let allExtractedText = '';

      // Process each rectangle
      for (const rect of currentRectangles) {
        try {
          // Validate rectangle has all required numeric properties
          if (!rect || typeof rect.x !== 'number' || typeof rect.y !== 'number' ||
              typeof rect.width !== 'number' || typeof rect.height !== 'number' ||
              isNaN(rect.x) || isNaN(rect.y) || isNaN(rect.width) || isNaN(rect.height)) {
            console.warn('Invalid rectangle data:', rect);
            continue;
          }

          // Create a canvas for this specific area
          const rectCanvas = document.createElement('canvas');
          const rectCtx = rectCanvas.getContext('2d');
          if (!rectCtx) {
            console.warn('Could not get canvas context for rectangle', rect.id);
            continue;
          }

          // Validate scale factors
          if (typeof scaleX !== 'number' || typeof scaleY !== 'number' || 
              isNaN(scaleX) || isNaN(scaleY) || scaleX <= 0 || scaleY <= 0) {
            console.warn('Invalid scale factors:', { scaleX, scaleY });
            continue;
          }

          // Scale rectangle coordinates to match natural image size
          const scaledRect = {
            x: Math.max(0, rect.x * scaleX),
            y: Math.max(0, rect.y * scaleY),
            width: Math.min(rect.width * scaleX, img.naturalWidth - (rect.x * scaleX)),
            height: Math.min(rect.height * scaleY, img.naturalHeight - (rect.y * scaleY))
          };

          // Validate scaled rectangle dimensions
          if (scaledRect.width <= 0 || scaledRect.height <= 0 ||
              typeof scaledRect.x !== 'number' || typeof scaledRect.y !== 'number' ||
              typeof scaledRect.width !== 'number' || typeof scaledRect.height !== 'number' ||
              isNaN(scaledRect.x) || isNaN(scaledRect.y) || 
              isNaN(scaledRect.width) || isNaN(scaledRect.height)) {
            console.warn('Invalid rectangle dimensions after scaling', scaledRect);
            continue;
          }

          rectCanvas.width = Math.round(scaledRect.width);
          rectCanvas.height = Math.round(scaledRect.height);

          // Validate canvas dimensions
          if (rectCanvas.width <= 0 || rectCanvas.height <= 0) {
            console.warn('Invalid canvas dimensions', rectCanvas.width, rectCanvas.height);
            continue;
          }

          // Draw the specific area to the canvas with error handling
          try {
            rectCtx.drawImage(
              img, 
              Math.round(scaledRect.x), 
              Math.round(scaledRect.y), 
              Math.round(scaledRect.width), 
              Math.round(scaledRect.height),
              0, 
              0, 
              Math.round(scaledRect.width), 
              Math.round(scaledRect.height)
            );
          } catch (drawError) {
            console.warn('Failed to draw image to canvas:', drawError);
            continue;
          }

          // Convert to data URL for Tesseract with validation
          let imageData;
          try {
            imageData = rectCanvas.toDataURL('image/png');
            if (!imageData || imageData === 'data:,') {
              console.warn('Invalid image data generated for rectangle', rect.id);
              continue;
            }
          } catch (dataError) {
            console.warn('Failed to convert canvas to data URL:', dataError);
            continue;
          }

          // Extract text using Tesseract.js with additional error handling
          try {
            const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
              logger: m => console.log('Tesseract:', m) // Optional: log progress
            });

            if (text && text.trim()) {
              allExtractedText += text.trim() + ' ';
            }
          } catch (ocrError) {
            console.warn('OCR failed for rectangle', rect.id, ':', ocrError);
            // Continue with other rectangles instead of failing completely
          }
          
        } catch (rectError) {
          console.warn('Failed to process rectangle', rect.id, ':', rectError);
          continue;
        }
      }

      // Clean the extracted text
      const cleanedText = cleanExtractedText(allExtractedText);
      
      if (cleanedText) {
        // Send cleaned text to parent component
        onExtractedText(cleanedText);
        
        // Clear the image and rectangles only AFTER successful text extraction
        setUploadedImage(null);
        setRectangles([]);
        setCurrentRect(null);
        setExtractedText('');
        setOverlayOpen(false); // Close overlay after successful extraction
        
        toast.success('Text extracted successfully!');
      } else {
        toast.error('No text could be extracted from the selected areas');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      if (error.message.includes('Image not properly loaded')) {
        toast.error('Image not fully loaded. Please try again.');
      } else if (error.message.includes('Invalid image dimensions')) {
        toast.error('Invalid image. Please upload a different image.');
      } else if (error.message.includes('Failed to load image')) {
        toast.error('Failed to load image. Please try uploading again.');
      } else {
        toast.error('Failed to extract text. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage, rectangles, onExtractedText]);

  // Handle overlay close
  const handleOverlayClose = useCallback(() => {
    setOverlayOpen(false);
    setUploadedImage(null);
    setRectangles([]);
    setCurrentRect(null);
    setExtractedText('');
  }, []);

  return (
    <>
      {/* Always show the button */}
      <div className={compact ? "" : "text-center"}>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className={compact 
            ? "rounded-lg border border-gray-300 hover:border-green-500 shadow-sm hover:shadow-md transition-all duration-200 bg-white text-gray-600 hover:bg-green-50 text-xs px-3 py-2"
            : "w-full rounded-xl border-2 border-[#D5E7D5] hover:border-green-500 shadow-md hover:shadow-lg transition-all duration-200 bg-white text-gray-700 hover:bg-green-50 font-medium py-3"
          }
          size={compact ? "sm" : "default"}
        >
          <Camera className={compact ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"} />
          {compact ? "Extract from screenshot" : "Extract text from screenshot"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Overlay Dialog for text extraction */}
      <Dialog open={overlayOpen} onOpenChange={handleOverlayClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Extract Text from Screenshot
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {uploadedImage && (
              <>
                {/* Light blue note chip with mobile-friendly instructions */}
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 border border-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                    💡 {isMobile ? 'Tap and drag to select text areas' : 'Click and drag to select text areas'}, then click extract
                  </div>
                </div>

                {/* Image container with mobile touch support */}
                <div className="flex justify-center">
                  <div
                    ref={containerRef}
                    className={`relative inline-block border-2 border-gray-200 rounded-lg overflow-hidden ${
                      isMobile ? 'touch-none' : 'cursor-crosshair'
                    }`}
                    // Mouse events
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    // Touch events for mobile
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                    onTouchCancel={handleEnd}
                  >
                    <img
                      ref={imageRef}
                      src={uploadedImage}
                      alt="Screenshot for text extraction"
                      className="max-w-full h-auto"
                      style={{ maxHeight: '600px', maxWidth: '100%' }}
                      draggable={false}
                    />

                    {/* Render existing rectangles */}
                    {rectangles.map((rect) => (
                      <div
                        key={rect.id}
                        className="absolute group"
                        style={{
                          left: `${rect.x}px`,
                          top: `${rect.y}px`,
                          width: `${rect.width}px`,
                          height: `${rect.height}px`,
                          backgroundColor: 'rgba(59, 130, 246, 0.3)',
                          border: '2px solid #3b82f6'
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRectangles(prev => prev.filter(r => r.id !== rect.id));
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Render current drawing rectangle */}
                    {currentRect && isDrawing && (
                      <div
                        className="absolute"
                        style={{
                          left: `${currentRect.width < 0 ? currentRect.x + currentRect.width : currentRect.x}px`,
                          top: `${currentRect.height < 0 ? currentRect.y + currentRect.height : currentRect.y}px`,
                          width: `${Math.abs(currentRect.width)}px`,
                          height: `${Math.abs(currentRect.height)}px`,
                          backgroundColor: 'rgba(59, 130, 246, 0.3)',
                          border: '2px solid #3b82f6'
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button
                    onClick={handleOverlayClose}
                    variant="outline"
                    className="px-6"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={extractTextFromAreas}
                    disabled={rectangles.length === 0 || isProcessing}
                    className="px-6 bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4 mr-2" />
                    )}
                    {isProcessing ? 'Extracting...' : 'Extract Text'}
                  </Button>
                </div>

                {/* Selection Counter */}
                <div className="text-center text-sm text-gray-600">
                  {rectangles.length === 0 ? (
                    "Select text areas by clicking and dragging"
                  ) : (
                    `${rectangles.length} text area${rectangles.length > 1 ? 's' : ''} selected`
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}