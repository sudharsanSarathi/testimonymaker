import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, Share2, Trash2, X, Crop } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropSelection {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ScreenshotHighlighterProps {
  className?: string;
}

export function ScreenshotHighlighter({ className = '' }: ScreenshotHighlighterProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<Rectangle | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Crop functionality
  const [cropMode, setCropMode] = useState(false);
  const [cropSelection, setCropSelection] = useState<CropSelection | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStartPoint, setCropStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentCrop, setCurrentCrop] = useState<CropSelection | null>(null);
  
  const [isMobile, setIsMobile] = useState(false);
  const [imageWidth, setImageWidth] = useState(580);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [, forceUpdate] = useState({});
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCardRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const croppedImageRef = useRef<HTMLImageElement>(null);

  // Detect mobile device and set image width
  useEffect(() => {
    const checkMobileAndSetWidth = () => {
      const isMobileDevice = window.innerWidth < 600;
      setIsMobile(isMobileDevice);
      setImageWidth(isMobileDevice ? 360 : 580);
      // Force re-render of overlays when window resizes
      forceUpdate({});
    };
    
    checkMobileAndSetWidth();
    window.addEventListener('resize', checkMobileAndSetWidth);
    return () => window.removeEventListener('resize', checkMobileAndSetWidth);
  }, []);

  // Force overlay position recalculation when rectangles change
  useEffect(() => {
    forceUpdate({});
  }, [rectangles, currentRect, cropSelection, currentCrop, uploadedImage, croppedImage]);

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
      setCropMode(false);
      setCropSelection(null);
      setCroppedImage(null);
      setCurrentCrop(null);
      
      // Auto-scroll to keep the entire image in viewport
      setTimeout(() => {
        if (imageCardRef.current) {
          imageCardRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    };
    reader.readAsDataURL(file);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      processImageFile(imageFiles[0]); // Process the first image file
      toast.success('Image uploaded successfully!');
    } else if (files.length > 0) {
      toast.error('Please drop an image file');
    }
  }, [processImageFile]);

  // Calculate image offset within container for accurate overlay positioning
  const getImageOffset = useCallback(() => {
    const workingImageRef = croppedImage ? croppedImageRef : imageRef;
    if (!containerRef.current || !workingImageRef.current) {
      return { offsetX: 0, offsetY: 0 };
    }
    
    const imageRect = workingImageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    return {
      offsetX: imageRect.left - containerRect.left,
      offsetY: imageRect.top - containerRect.top
    };
  }, [croppedImage]);

  // Get mouse/touch position relative to image with precise coordinate calculation
  const getRelativePosition = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const workingImageRef = croppedImage ? croppedImageRef : imageRef;
    if (!containerRef.current || !workingImageRef.current) return { x: 0, y: 0 };
    
    const imageRect = workingImageRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('changedTouches' in event && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }
    
    // Calculate position relative to the image element itself
    const x = clientX - imageRect.left;
    const y = clientY - imageRect.top;
    
    // Ensure coordinates are within image bounds for better accuracy
    const clampedX = Math.max(0, Math.min(x, imageRect.width));
    const clampedY = Math.max(0, Math.min(y, imageRect.height));
    
    return { x: clampedX, y: clampedY };
  }, [croppedImage]);

  // Start drawing rectangle or crop
  const handleMouseDown = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!uploadedImage) return;
    
    const position = getRelativePosition(event);
    
    if (cropMode) {
      setIsCropping(true);
      setCropStartPoint(position);
      
      const newCrop: CropSelection = {
        x: position.x,
        y: position.y,
        width: 0,
        height: 0
      };
      
      setCurrentCrop(newCrop);
    } else {
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
    }
  }, [uploadedImage, cropMode, getRelativePosition]);

  // Update rectangle/crop while drawing
  const handleMouseMove = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const position = getRelativePosition(event);
    
    if (cropMode && isCropping && cropStartPoint && currentCrop) {
      const updatedCrop: CropSelection = {
        ...currentCrop,
        width: position.x - cropStartPoint.x,
        height: position.y - cropStartPoint.y
      };
      
      setCurrentCrop(updatedCrop);
    } else if (isDrawing && startPoint && currentRect) {
      const updatedRect: Rectangle = {
        ...currentRect,
        width: position.x - startPoint.x,
        height: position.y - startPoint.y
      };
      
      setCurrentRect(updatedRect);
    }
  }, [cropMode, isCropping, cropStartPoint, currentCrop, isDrawing, startPoint, currentRect, getRelativePosition]);

  // Finish drawing rectangle or crop
  const handleMouseUp = useCallback(() => {
    if (cropMode && isCropping && currentCrop) {
      // Only set crop if it has meaningful size
      if (Math.abs(currentCrop.width) > 10 && Math.abs(currentCrop.height) > 10) {
        // Normalize crop to handle negative dimensions
        const normalizedCrop: CropSelection = {
          x: currentCrop.width < 0 ? currentCrop.x + currentCrop.width : currentCrop.x,
          y: currentCrop.height < 0 ? currentCrop.y + currentCrop.height : currentCrop.y,
          width: Math.abs(currentCrop.width),
          height: Math.abs(currentCrop.height)
        };
        
        setCropSelection(normalizedCrop);
      }
      
      setIsCropping(false);
      setCropStartPoint(null);
      setCurrentCrop(null);
    } else if (isDrawing && currentRect) {
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
        
        setRectangles(prev => [...prev, normalizedRect]);
      }
      
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentRect(null);
    }
  }, [cropMode, isCropping, currentCrop, isDrawing, currentRect]);

  // Delete a rectangle
  const deleteRectangle = useCallback((id: string) => {
    setRectangles(prev => prev.filter(rect => rect.id !== id));
    toast.success('Highlight removed');
  }, []);

  // Clear all rectangles
  const clearAllRectangles = useCallback(() => {
    setRectangles([]);
    setCurrentRect(null);
    toast.success('All highlights cleared');
  }, []);

  // Toggle crop mode
  const toggleCropMode = useCallback(() => {
    setCropMode(!cropMode);
    setCropSelection(null);
    setCurrentCrop(null);
    setRectangles([]);
    setCurrentRect(null);
  }, [cropMode]);

  // Apply crop
  const applyCrop = useCallback(async () => {
    if (!cropSelection || !uploadedImage || !imageRef.current) {
      toast.error('Please select an area to crop');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const img = imageRef.current;
      
      // Calculate scale factors
      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;

      // Scale crop selection to original image dimensions
      const scaledCrop = {
        x: cropSelection.x * scaleX,
        y: cropSelection.y * scaleY,
        width: cropSelection.width * scaleX,
        height: cropSelection.height * scaleY
      };

      canvas.width = scaledCrop.width;
      canvas.height = scaledCrop.height;

      // Create image object to draw from
      const sourceImg = new Image();
      sourceImg.onload = () => {
        // Draw cropped portion
        ctx.drawImage(
          sourceImg,
          scaledCrop.x,
          scaledCrop.y,
          scaledCrop.width,
          scaledCrop.height,
          0,
          0,
          scaledCrop.width,
          scaledCrop.height
        );

        const croppedDataUrl = canvas.toDataURL('image/png', 1.0);
        setCroppedImage(croppedDataUrl);
        setCropMode(false);
        setCropSelection(null);
        setRectangles([]);
        toast.success('Image cropped successfully!');
      };
      sourceImg.src = uploadedImage;
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image. Please try again.');
    }
  }, [cropSelection, uploadedImage]);

  // Reset to original image
  const resetToOriginal = useCallback(() => {
    setCroppedImage(null);
    setCropSelection(null);
    setRectangles([]);
    setCurrentRect(null);
    setCropMode(false);
    toast.success('Reset to original image');
  }, []);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return rectangles.length > 0 || cropSelection !== null || croppedImage !== null || currentRect !== null || currentCrop !== null;
  }, [rectangles, cropSelection, croppedImage, currentRect, currentCrop]);

  // Handle close with confirmation
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges()) {
      setShowCloseConfirmation(true);
    } else {
      handleConfirmClose();
    }
  }, [hasUnsavedChanges]);

  // Confirm close and clear everything
  const handleConfirmClose = useCallback(() => {
    setUploadedImage(null);
    setRectangles([]);
    setCurrentRect(null);
    setCropMode(false);
    setCropSelection(null);
    setCroppedImage(null);
    setCurrentCrop(null);
    setShowCloseConfirmation(false);
    toast.success('Image cleared');
  }, []);

  // Cancel close confirmation
  const handleCancelClose = useCallback(() => {
    setShowCloseConfirmation(false);
  }, []);

  // Generate and download image with highlights only (no background)
  const handleDownload = useCallback(async () => {
    const workingImage = croppedImage || uploadedImage;
    const workingImageRef = croppedImage ? croppedImageRef : imageRef;
    
    if (!workingImage || !workingImageRef.current) {
      toast.error('Please upload an image first');
      return;
    }

    try {
      const img = workingImageRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set canvas size to match image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Draw image without background
      ctx.drawImage(img, 0, 0);

      // Calculate scale factors based on displayed vs natural dimensions
      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;

      // Set blend mode and draw rectangles
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#FFFF55';

      rectangles.forEach(rect => {
        ctx.fillRect(
          rect.x * scaleX,
          rect.y * scaleY,
          rect.width * scaleX,
          rect.height * scaleY
        );
      });

      // Download the image
      const link = document.createElement('a');
      link.download = `highlighted-screenshot-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      toast.success('Highlighted screenshot downloaded!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image. Please try again.');
    }
  }, [croppedImage, uploadedImage, rectangles]);

  // Share functionality
  const handleShare = useCallback(async () => {
    const workingImage = croppedImage || uploadedImage;
    const workingImageRef = croppedImage ? croppedImageRef : imageRef;
    
    if (!workingImage || !workingImageRef.current) {
      toast.error('Please upload an image first');
      return;
    }

    try {
      const img = workingImageRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set canvas size to match image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Draw image without background
      ctx.drawImage(img, 0, 0);

      // Calculate scale factors
      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;

      // Set blend mode and draw rectangles
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#FFFF55';

      rectangles.forEach(rect => {
        ctx.fillRect(
          rect.x * scaleX,
          rect.y * scaleY,
          rect.width * scaleX,
          rect.height * scaleY
        );
      });

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
      });

      // Create file
      const file = new File([blob], `highlighted-screenshot-${Date.now()}.png`, {
        type: 'image/png',
      });

      // Try Web Share API
      if (navigator.share && navigator.canShare) {
        try {
          const shareData = {
            title: 'Highlighted Screenshot',
            text: 'Check out this highlighted screenshot!',
            files: [file],
          };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            toast.success('Screenshot shared successfully!');
            return;
          }
        } catch (shareError) {
          console.log('File sharing not supported, trying clipboard');
        }
      }

      // Fallback to clipboard
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast.success('Screenshot copied to clipboard!');
          return;
        } catch (clipboardError) {
          console.log('Clipboard write failed, falling back to download');
        }
      }

      // Final fallback: download
      const link = document.createElement('a');
      link.download = `highlighted-screenshot-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('Screenshot downloaded!');

    } catch (error) {
      console.error('Error sharing image:', error);
      toast.error('Failed to share image. Please try again.');
    }
  }, [croppedImage, uploadedImage, rectangles]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      {!uploadedImage ? (
        <Card className="p-8 border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors">
          <div
            ref={dropZoneRef}
            className={`text-center transition-all duration-200 ${
              isDragOver ? 'bg-green-50 border-green-400 scale-105' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
              isDragOver ? 'text-green-500' : 'text-gray-400'
            }`} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload WhatsApp Screenshot
            </h3>
            <p className="text-gray-600 mb-4">
              {isDragOver 
                ? 'Drop your image here!' 
                : 'Drag & drop an image here or click to browse'
              }
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={isDragOver}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </Card>
      ) : (
        <>
          {/* Main Image Card */}
          <Card ref={imageCardRef} className="p-4 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {cropMode ? '✂️ Select area to crop' : (croppedImage ? '🎨 Draw highlights on cropped image' : '🎨 Draw highlights on your screenshot')}
              </h3>
            </div>

            {/* Instructions */}
            <div className="flex justify-center mb-3">
              <div className="bg-orange-100 border border-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                💡 {cropMode ? (isMobile ? 'Touch and drag to select crop area' : 'Click and drag to select crop area') : (isMobile ? 'Touch and drag to draw highlight rectangles' : 'Click and drag to draw highlight rectangles')}
              </div>
            </div>

            {/* Image Container with Fixed Layout Structure */}
            <div className="relative w-full mb-6">
              {/* Close Button Overlay - Positioned over the image */}
              {uploadedImage && (
                <button
                  onClick={handleClose}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-50"
                  title="Close image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              <div 
                ref={containerRef}
                className={`relative bg-gray-100 rounded-lg overflow-hidden w-full ${
                  isMobile ? 'max-h-[70vh] overflow-y-scroll screenshot-highlighter-scroll' : ''
                }`}
                style={{ 
                  minHeight: '200px'
                }}
              >
                {/* Display the working image (cropped or original) */}
                {croppedImage ? (
                  <img
                    ref={croppedImageRef}
                    src={croppedImage}
                    alt="Cropped screenshot"
                    className="h-auto object-contain block mx-auto"
                    draggable={false}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseEnter={() => setIsHoveringImage(true)}
                    onMouseLeave={() => setIsHoveringImage(false)}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    style={{ 
                      touchAction: 'none', 
                      userSelect: 'none',
                      width: `${imageWidth}px`,
                      height: 'auto',
                      cursor: 'crosshair'
                    }}
                  />
                ) : (
                  <img
                    ref={imageRef}
                    src={uploadedImage}
                    alt="Uploaded screenshot"
                    className="h-auto object-contain block mx-auto"
                    draggable={false}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseEnter={() => setIsHoveringImage(true)}
                    onMouseLeave={() => setIsHoveringImage(false)}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    style={{ 
                      touchAction: 'none', 
                      userSelect: 'none',
                      width: `${imageWidth}px`,
                      height: 'auto',
                      cursor: 'crosshair'
                    }}
                  />
                )}

                {/* Rectangle overlays for highlights - Positioned relative to image */}
                {!cropMode && rectangles.map(rect => {
                  const { offsetX, offsetY } = getImageOffset();
                  
                  return (
                    <div
                      key={rect.id}
                      className="absolute bg-yellow-300 opacity-50 border border-yellow-500 cursor-pointer group"
                      style={{
                        left: `${offsetX + rect.x}px`,
                        top: `${offsetY + rect.y}px`,
                        width: `${rect.width}px`,
                        height: `${rect.height}px`,
                        pointerEvents: 'auto'
                      }}
                      onClick={() => deleteRectangle(rect.id)}
                    >
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </div>
                    </div>
                  );
                })}

                {/* Current drawing rectangle - Positioned relative to image */}
                {!cropMode && currentRect && (() => {
                  const { offsetX, offsetY } = getImageOffset();
                  
                  return (
                    <div
                      className="absolute bg-yellow-300 opacity-50 border border-yellow-500 pointer-events-none"
                      style={{
                        left: `${offsetX + Math.min(currentRect.x, currentRect.x + currentRect.width)}px`,
                        top: `${offsetY + Math.min(currentRect.y, currentRect.y + currentRect.height)}px`,
                        width: `${Math.abs(currentRect.width)}px`,
                        height: `${Math.abs(currentRect.height)}px`,
                      }}
                    />
                  );
                })()}

                {/* Crop selection overlay - Positioned relative to image */}
                {cropMode && cropSelection && (() => {
                  const { offsetX, offsetY } = getImageOffset();
                  
                  return (
                    <div
                      className="absolute border-2 border-green-500 bg-green-200 opacity-30"
                      style={{
                        left: `${offsetX + cropSelection.x}px`,
                        top: `${offsetY + cropSelection.y}px`,
                        width: `${cropSelection.width}px`,
                        height: `${cropSelection.height}px`,
                      }}
                    />
                  );
                })()}

                {/* Current crop selection - Positioned relative to image */}
                {cropMode && currentCrop && (() => {
                  const { offsetX, offsetY } = getImageOffset();
                  
                  return (
                    <div
                      className="absolute border-2 border-green-500 bg-green-200 opacity-30 pointer-events-none"
                      style={{
                        left: `${offsetX + Math.min(currentCrop.x, currentCrop.x + currentCrop.width)}px`,
                        top: `${offsetY + Math.min(currentCrop.y, currentCrop.y + currentCrop.height)}px`,
                        width: `${Math.abs(currentCrop.width)}px`,
                        height: `${Math.abs(currentCrop.height)}px`,
                      }}
                    />
                  );
                })()}

                {/* Apply Crop Button Overlay - Positioned below crop selection */}
                {cropMode && cropSelection && (() => {
                  const { offsetX, offsetY } = getImageOffset();
                  
                  return (
                    <div
                      className="absolute z-40"
                      style={{
                        left: `${offsetX + cropSelection.x}px`,
                        top: `${offsetY + cropSelection.y + cropSelection.height + 8}px`,
                      }}
                    >
                      <button
                        onClick={applyCrop}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 font-medium text-sm flex items-center gap-2"
                      >
                        <Crop className="w-4 h-4" />
                        Apply Crop
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-4">
              {/* Top Row - Mode and Actions */}
              <div className="flex flex-wrap gap-2">
                {/* Crop Mode Toggle */}
                <Button
                  onClick={toggleCropMode}
                  variant={cropMode ? "default" : "outline"}
                  className={`${cropMode ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-green-500 text-green-600 hover:bg-green-50'}`}
                >
                  <Crop className="w-4 h-4 mr-2" />
                  {cropMode ? 'Exit Crop Mode' : 'Crop Mode'}
                </Button>

                {/* Apply Crop Button - Only show in crop mode with selection */}
                {cropMode && cropSelection && (
                  <Button
                    onClick={applyCrop}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    ✂️ Apply Crop
                  </Button>
                )}

                {/* Reset to Original - Only show if image is cropped */}
                {croppedImage && (
                  <Button
                    onClick={resetToOriginal}
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    ↺ Reset to Original
                  </Button>
                )}

                {/* Clear Highlights - Only show if there are rectangles */}
                {!cropMode && rectangles.length > 0 && (
                  <Button
                    onClick={clearAllRectangles}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All ({rectangles.length})
                  </Button>
                )}
              </div>

              {/* Bottom Row - Download and Share */}
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
                <Button
                  onClick={handleShare}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Close Confirmation Dialog */}
      <Dialog open={showCloseConfirmation} onOpenChange={setShowCloseConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="text-left">
              Are you sure you want to delete?
            </DialogTitle>
            <DialogDescription className="text-left">
              All the changes made will be deleted and cannot be recovered. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex gap-3">
            {/* Cancel Button - Using existing style */}
            <Button
              onClick={handleCancelClose}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>

            {/* Delete Button - Using existing style */}
            <Button
              onClick={handleConfirmClose}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}