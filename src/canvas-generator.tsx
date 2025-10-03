// Canvas-based image generation - direct rendering without DOM manipulation

export interface HighlightRange {
  start: number;
  end: number;
  id: string;
}

export interface Message {
  id: string;
  text: string;
  images: string[];
  time: string;
  type: "text" | "image" | "text-image";
  highlights?: HighlightRange[];
}

interface CanvasGeneratorOptions {
  messages: Message[];
  containerWidth: number;
  backgroundColor: string;
  showBackground: boolean;
  whatsappBgPattern: string; // Base64 or URL of the WhatsApp background pattern
}

export class CanvasImageGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scale: number = 4; // High DPI scaling for quality
  
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    
    // Enhanced canvas text rendering settings to match browser quality
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.textBaseline = 'alphabetic'; // Match browser default
    this.ctx.textAlign = 'left'; // Match browser default
    
    // Enhanced text rendering properties
    (this.ctx as any).textRenderingOptimization = 'optimizeQuality';
    (this.ctx as any).textRendering = 'optimizeLegibility';
    (this.ctx as any).fontKerning = 'normal';
    (this.ctx as any).fontVariantCaps = 'normal';
  }

  async generateImage(options: CanvasGeneratorOptions): Promise<HTMLCanvasElement> {
    const { messages, containerWidth, backgroundColor, showBackground, whatsappBgPattern } = options;
    
    if (messages.length === 0) {
      throw new Error('No messages to generate');
    }

    // Calculate dimensions
    const messageContainerWidth = containerWidth;
    const availableWidth = messageContainerWidth - 24; // Account for padding
    
    // Calculate height needed for all messages
    const messageHeight = await this.calculateMessagesHeight(messages, availableWidth);
    const contentPadding = { top: 35, bottom: 40, left: 12, right: 12 };
    const messageContainerHeight = messageHeight + contentPadding.top + contentPadding.bottom;
    
    // Set canvas dimensions
    const finalWidth = showBackground ? messageContainerWidth + 80 : messageContainerWidth;
    const finalHeight = showBackground ? messageContainerHeight + 80 : messageContainerHeight;
    
    this.canvas.width = finalWidth * this.scale;
    this.canvas.height = finalHeight * this.scale;
    this.canvas.style.width = `${finalWidth}px`;
    this.canvas.style.height = `${finalHeight}px`;
    
    // Scale context for high DPI
    this.ctx.scale(this.scale, this.scale);
    
    // Clear canvas
    this.ctx.clearRect(0, 0, finalWidth, finalHeight);
    
    // Draw background if enabled
    if (showBackground) {
      // Draw outer background container
      this.drawRoundedRect(0, 0, finalWidth, finalHeight, 16, backgroundColor);
      
      // Draw inner WhatsApp container
      const innerX = 40;
      const innerY = 40;
      await this.drawWhatsAppContainer(
        innerX, 
        innerY, 
        messageContainerWidth, 
        messageContainerHeight, 
        whatsappBgPattern
      );
      
      // Draw messages inside the inner container
      await this.drawMessages(
        messages, 
        innerX + contentPadding.left, 
        innerY + contentPadding.top, 
        availableWidth
      );
    } else {
      // Draw WhatsApp container directly
      await this.drawWhatsAppContainer(0, 0, finalWidth, finalHeight, whatsappBgPattern);
      
      // Draw messages
      await this.drawMessages(
        messages, 
        contentPadding.left, 
        contentPadding.top, 
        availableWidth
      );
    }
    
    return this.canvas;
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number, fillColor: string) {
    this.ctx.fillStyle = fillColor;
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private async drawWhatsAppContainer(x: number, y: number, width: number, height: number, bgPattern: string) {
    // Save context for shadow
    this.ctx.save();
    
    // Apply drop shadow matching Tailwind's shadow-xl class
    // shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    this.ctx.shadowBlur = 25;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 20;
    
    // Draw WhatsApp background color with shadow
    this.drawRoundedRect(x, y, width, height, 12, '#efeae2');
    
    // Reset shadow for subsequent drawing
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.ctx.restore();
    
    // Draw WhatsApp pattern if available
    if (bgPattern) {
      try {
        const patternImg = await this.loadImage(bgPattern);
        
        // Save context state
        this.ctx.save();
        
        // Create clipping path for rounded container
        this.ctx.beginPath();
        this.ctx.moveTo(x + 12, y);
        this.ctx.lineTo(x + width - 12, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + 12);
        this.ctx.lineTo(x + width, y + height - 12);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - 12, y + height);
        this.ctx.lineTo(x + 12, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - 12);
        this.ctx.lineTo(x, y + 12);
        this.ctx.quadraticCurveTo(x, y, x + 12, y);
        this.ctx.closePath();
        this.ctx.clip();
        
        // Draw tiled pattern with opacity
        this.ctx.globalAlpha = 0.4;
        const pattern = this.ctx.createPattern(patternImg, 'repeat');
        if (pattern) {
          this.ctx.fillStyle = pattern;
          this.ctx.fillRect(x, y, width, height);
        }
        
        // Restore context state
        this.ctx.restore();
      } catch (error) {
        console.warn('Could not load WhatsApp background pattern:', error);
      }
    }
  }

  private async calculateMessagesHeight(messages: Message[], availableWidth: number): Promise<number> {
    let totalHeight = 0;
    const messageSpacing = 8;
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const messageHeight = await this.calculateMessageHeight(message, availableWidth);
      totalHeight += messageHeight;
      
      // Add spacing between messages (not after the last one)
      if (i < messages.length - 1) {
        totalHeight += messageSpacing;
      }
    }
    
    return totalHeight;
  }

  private async calculateMessageHeight(message: Message, availableWidth: number): Promise<number> {
    const maxBubbleWidth = Math.min(availableWidth * 0.8, 320);
    const bubblePadding = 8;
    
    let contentHeight = 0;
    let finalBubbleWidth = 0;
    
    // FIXED: Calculate bubble width based on content priority - images determine width for text+image messages
    // Calculate image dimensions first if present
    if (message.images && message.images.length > 0) {
      const imageDimensions = await this.calculateImageDimensions(message.images[0]);
      // For image messages, bubble width is determined by image width + padding
      finalBubbleWidth = imageDimensions.width + bubblePadding * 2;
      contentHeight += imageDimensions.height;
      
      // Add spacing between image and text if both exist
      if (message.text && message.type === 'text-image') {
        contentHeight += 8; // spacing between image and text
      }
    }
    
    // Calculate text height if present
    if (message.text) {
      let textWidth;
      
      if (message.type === 'text') {
        // For text-only messages, reserve space for inline time
        textWidth = maxBubbleWidth - 80; // 80px for padding + time space
      } else if (message.type === 'text-image') {
        // CRITICAL FIX: For text+image messages, use image-determined bubble width
        if (finalBubbleWidth > 0) {
          // Use image-determined bubble width, text must fit within this constraint
          textWidth = finalBubbleWidth - 32; // Only account for padding (16px each side)
        } else {
          // Fallback if no image dimensions available
          textWidth = maxBubbleWidth - 32;
        }
      } else {
        textWidth = maxBubbleWidth - 80; // fallback
      }
      
      const textHeight = this.calculateTextHeight(message.text, textWidth, '14.2px Helvetica Neue, sans-serif');
      contentHeight += textHeight + 8; // 4px padding top/bottom
      
      // For text+image messages, add proper space for time below text (increased spacing)
      if (message.type === 'text-image') {
        contentHeight += 12; // Space for time below text (increased to 12px for better readability)
      }
    }
    
    // Add bubble padding and minimum height
    const bubbleHeight = Math.max(contentHeight + bubblePadding * 2, 40);
    
    return bubbleHeight;
  }

  private calculateTextHeight(text: string, maxWidth: number, font: string): number {
    // Create temporary canvas for text measurement with high DPI scaling match
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    // Apply same scaling and settings as main canvas
    tempCtx.scale(this.scale, this.scale);
    tempCtx.font = font;
    tempCtx.textBaseline = 'alphabetic';
    tempCtx.textAlign = 'left';
    
    // CRITICAL: Enhanced text wrapping algorithm with strict width enforcement to match drawMessageText
    const words = text.split(' ');
    const lineHeight = 19; // 19px line height as per design
    let lines = 1;
    let currentLineWidth = 0;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const spaceWidth = i === words.length - 1 ? 0 : tempCtx.measureText(' ').width; // No space after last word
      let wordWidth = tempCtx.measureText(word).width;
      
      // Handle words that are too wide (same logic as drawMessageText)
      if (wordWidth > maxWidth) {
        let truncatedWord = word;
        while (wordWidth > maxWidth && truncatedWord.length > 0) {
          truncatedWord = truncatedWord.slice(0, -1);
          wordWidth = tempCtx.measureText(truncatedWord).width;
        }
      }
      
      // Check if adding this word would exceed the line width (same logic as drawMessageText)
      if (currentLineWidth + wordWidth > maxWidth && currentLineWidth > 0) {
        // Start new line
        lines++;
        currentLineWidth = wordWidth;
        if (i < words.length - 1 && currentLineWidth + spaceWidth <= maxWidth) {
          currentLineWidth += spaceWidth;
        }
      } else {
        // Add word to current line
        currentLineWidth += wordWidth;
        if (i < words.length - 1 && currentLineWidth + spaceWidth <= maxWidth) {
          currentLineWidth += spaceWidth;
        }
      }
    }
    
    return lines * lineHeight;
  }

  private async calculateImageDimensions(imageUrl: string): Promise<{width: number, height: number}> {
    try {
      const img = await this.loadImage(imageUrl);
      const maxWidth = 280;
      const maxHeight = 400;
      
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      return { width: Math.round(width), height: Math.round(height) };
    } catch (error) {
      return { width: 280, height: 140 }; // fallback dimensions
    }
  }

  private async drawMessages(messages: Message[], startX: number, startY: number, availableWidth: number) {
    let currentY = startY;
    const messageSpacing = 8;
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const messageHeight = await this.drawMessage(message, startX, currentY, availableWidth);
      currentY += messageHeight;
      
      // Add spacing between messages
      if (i < messages.length - 1) {
        currentY += messageSpacing;
      }
    }
  }

  private async drawMessage(message: Message, x: number, y: number, availableWidth: number): Promise<number> {
    const maxBubbleWidth = Math.min(availableWidth * 0.8, 320);
    
    // Draw chat bubble tail
    this.drawChatBubbleTail(x, y);
    
    // Calculate bubble dimensions
    const bubbleX = x + 8; // 8px offset for tail
    const bubblePadding = 8;
    
    let contentHeight = 0;
    let bubbleWidth = 0;
    
    // FIXED: Calculate bubble width based on content priority - images determine width for text+image messages
    let finalBubbleWidth = 0;
    
    // Calculate image dimensions first if present
    if (message.images && message.images.length > 0) {
      const imageDimensions = await this.calculateImageDimensions(message.images[0]);
      // For image messages, bubble width is determined by image width + padding
      finalBubbleWidth = imageDimensions.width + bubblePadding * 2;
      contentHeight += imageDimensions.height;
      
      if (message.text && message.type === 'text-image') {
        contentHeight += 8; // spacing between image and text
      }
    }
    
    if (message.text) {
      let textWidth, paddingForBubbleWidth;
      
      if (message.type === 'text') {
        // For text-only messages, use standard width calculations
        textWidth = maxBubbleWidth - 80; // 80px for padding + time space
        paddingForBubbleWidth = 80; // Account for padding + time space
        
        // For text-only, text determines bubble width
        const actualTextWidth = this.measureTextWidth(message.text, textWidth, '14.2px Helvetica Neue, sans-serif');
        finalBubbleWidth = Math.max(finalBubbleWidth, actualTextWidth + paddingForBubbleWidth);
        
      } else if (message.type === 'text-image') {
        // CRITICAL FIX: For text+image messages, image width determines bubble width, text must wrap within it
        if (finalBubbleWidth > 0) {
          // Use image-determined bubble width, text must fit within this constraint
          textWidth = finalBubbleWidth - 32; // Only account for padding (16px each side)
          paddingForBubbleWidth = 32; // Only account for padding
          
          // IMPORTANT: Store the image-constrained text width for use in drawing
          // This ensures the text width is properly constrained by the image width
        } else {
          // Fallback if no image dimensions available
          textWidth = maxBubbleWidth - 32;
          paddingForBubbleWidth = 32;
          const actualTextWidth = this.measureTextWidth(message.text, textWidth, '14.2px Helvetica Neue, sans-serif');
          finalBubbleWidth = actualTextWidth + paddingForBubbleWidth;
        }
      } else {
        textWidth = maxBubbleWidth - 80; // fallback
        paddingForBubbleWidth = 80;
        const actualTextWidth = this.measureTextWidth(message.text, textWidth, '14.2px Helvetica Neue, sans-serif');
        finalBubbleWidth = Math.max(finalBubbleWidth, actualTextWidth + paddingForBubbleWidth);
      }
      
      const textHeight = this.calculateTextHeight(message.text, textWidth, '14.2px Helvetica Neue, sans-serif');
      contentHeight += textHeight + 4; // 2px padding top/bottom for tighter wrapping
      
      // For text+image messages, add proper space for time below text (increased spacing)
      if (message.type === 'text-image') {
        contentHeight += 12; // Space for time below text (increased to 12px for better readability)
      }
    }
    
    // Set final bubble width - CRITICAL FIX: For text+image messages, don't constrain by maxBubbleWidth if image determines width
    if (message.type === 'text-image' && message.images && message.images.length > 0) {
      // For text+image messages, image width takes priority - don't constrain by maxBubbleWidth
      bubbleWidth = finalBubbleWidth;
    } else {
      // For other message types, apply normal width constraints
      bubbleWidth = Math.min(finalBubbleWidth, maxBubbleWidth);
    }
    
    const bubbleHeight = contentHeight + bubblePadding * 2;
    
    // Draw bubble background with shadow
    this.drawMessageBubble(bubbleX, y, bubbleWidth, bubbleHeight);
    
    // Draw content
    let contentY = y + bubblePadding + 2; // 2px top padding for text (tighter wrapping)
    
    // Draw image if present
    if (message.images && message.images.length > 0) {
      const isImageOnlyMessage = message.type === 'image';
      const imageHeight = await this.drawMessageImage(
        message.images[0], 
        bubbleX + bubblePadding, 
        contentY, 
        bubbleWidth - bubblePadding * 2,
        isImageOnlyMessage // Pass flag to add gradient overlay for image-only messages
      );
      
      if (message.type === 'image') {
        // For image-only messages, draw time overlay on image - positioned at bottom right with proper margin
        this.drawTimeOverlay(message.time, bubbleX + bubbleWidth - bubblePadding - 8, contentY + imageHeight - 8);
      } else if (message.type === 'text-image') {
        contentY += imageHeight + 8; // spacing between image and text
      }
    }
    
    // Draw text if present - CRITICAL FIX: Ensure text wrapping matches preview exactly
    if (message.text && (message.type === 'text' || message.type === 'text-image')) {
      if (message.type === 'text') {
        // For text-only messages, EXACTLY match PreviewTextMessage component
        const textWidth = bubbleWidth - 80; // Use actual bubble width minus space for padding + time (CRITICAL: Use bubbleWidth, not maxBubbleWidth)
        const textHeight = this.drawMessageText(
          message.text, 
          message.highlights || [], 
          bubbleX + bubblePadding, 
          contentY, 
          textWidth
        );
        
        // Draw time for text-only messages (inline with text)
        this.drawMessageTime(
          message.time, 
          bubbleX + bubbleWidth - bubblePadding - 8, 
          contentY + textHeight - 4
        );
      } else if (message.type === 'text-image') {
        // CRITICAL FIX: For text+image messages, text must be constrained by image width
        // Calculate text width based on the actual bubble width determined by the image
        const constrainedTextWidth = bubbleWidth - 32; // Use actual bubble width minus padding only (16px each side)
        
        const textHeight = this.drawMessageText(
          message.text, 
          message.highlights || [], 
          bubbleX + bubblePadding, 
          contentY, 
          constrainedTextWidth // Use the constrained width - this ensures text wraps within image-determined bubble width
        );
        
        // Draw time BELOW the text, right-aligned (increased spacing for better readability)
        this.drawMessageTime(
          message.time, 
          bubbleX + bubbleWidth - bubblePadding - 8, 
          contentY + textHeight + 12 // Increased to 12px below text for better spacing
        );
      }
    }
    
    return bubbleHeight;
  }

  private drawChatBubbleTail(x: number, y: number) {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    
    // Draw the tail path matching the SVG
    const tailPath = new Path2D('M1.533 2.568L8 11.193V0H2.812C1.042 0 0.474 1.156 1.533 2.568Z');
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.scale(8/8, 13/13); // Scale to match 8x13 viewBox
    this.ctx.fill(tailPath);
    this.ctx.restore();
  }

  private drawMessageBubble(x: number, y: number, width: number, height: number) {
    // Draw shadow first
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(11,20,26,0.13)';
    this.ctx.shadowBlur = 0.5;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 1;
    
    // Draw bubble with rounded corners (except top-left which should be perfectly straight)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    // Start at top-left corner with NO radius - perfectly straight
    this.ctx.moveTo(x, y);
    // Top edge to top-right corner
    this.ctx.lineTo(x + width - 7.5, y);
    // Top-right rounded corner
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + 7.5);
    // Right edge
    this.ctx.lineTo(x + width, y + height - 7.5);
    // Bottom-right rounded corner
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - 7.5, y + height);
    // Bottom edge
    this.ctx.lineTo(x + 7.5, y + height);
    // Bottom-left rounded corner
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - 7.5);
    // Left edge back to top-left corner (straight, no curve)
    this.ctx.lineTo(x, y);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }

  private measureTextWidth(text: string, maxWidth: number, font: string): number {
    this.ctx.font = font;
    const words = text.split(' ');
    let maxLineWidth = 0;
    let currentLineWidth = 0;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const spaceWidth = i === words.length - 1 ? 0 : this.ctx.measureText(' ').width; // No space after last word
      let wordWidth = this.ctx.measureText(word).width;
      
      // CRITICAL: Handle words that are too wide (same logic as drawMessageText and calculateTextHeight)
      if (wordWidth > maxWidth) {
        let truncatedWord = word;
        while (wordWidth > maxWidth && truncatedWord.length > 0) {
          truncatedWord = truncatedWord.slice(0, -1);
          wordWidth = this.ctx.measureText(truncatedWord).width;
        }
      }
      
      // Check if adding this word would exceed the line width (same logic as other functions)
      if (currentLineWidth + wordWidth > maxWidth && currentLineWidth > 0) {
        // Record current line width and start new line
        maxLineWidth = Math.max(maxLineWidth, currentLineWidth);
        currentLineWidth = wordWidth;
        if (i < words.length - 1 && currentLineWidth + spaceWidth <= maxWidth) {
          currentLineWidth += spaceWidth;
        }
      } else {
        // Add word to current line
        currentLineWidth += wordWidth;
        if (i < words.length - 1 && currentLineWidth + spaceWidth <= maxWidth) {
          currentLineWidth += spaceWidth;
        }
      }
    }
    
    // Don't forget the last line
    maxLineWidth = Math.max(maxLineWidth, currentLineWidth);
    return maxLineWidth;
  }

  private drawMessageText(text: string, highlights: HighlightRange[], x: number, y: number, maxWidth: number): number {
    // Ensure consistent font rendering settings
    this.ctx.font = '14.2px Helvetica Neue, sans-serif';
    this.ctx.fillStyle = '#111b21';
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.textAlign = 'left';
    
    const lineHeight = 19;
    const words = text.split(' ');
    let currentY = y + 15; // Baseline offset
    let currentX = x;
    let charIndex = 0;
    
    // CRITICAL FIX: Enhanced text rendering with strict width enforcement
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const spaceWidth = i === words.length - 1 ? 0 : this.ctx.measureText(' ').width; // No space after last word
      const wordWidth = this.ctx.measureText(word).width;
      const totalWordWidth = wordWidth + spaceWidth;
      
      // CRITICAL: Strict width constraint - check if word would exceed maxWidth boundary
      if (currentX + wordWidth > x + maxWidth && currentX > x) {
        // Start new line - ensure we don't exceed width even for single words
        currentY += lineHeight;
        currentX = x;
      }
      
      // Additional safety check: if even a single word is too wide, truncate it
      let displayWord = word;
      let displayWordWidth = wordWidth;
      if (wordWidth > maxWidth) {
        // Truncate word if it's too wide to fit
        while (displayWordWidth > maxWidth && displayWord.length > 0) {
          displayWord = displayWord.slice(0, -1);
          displayWordWidth = this.ctx.measureText(displayWord).width;
        }
      }
      
      // Check if this word should be highlighted
      const wordStart = charIndex;
      const wordEnd = charIndex + word.length;
      let isHighlighted = false;
      
      for (const highlight of highlights) {
        if (highlight.start <= wordStart && highlight.end >= wordEnd) {
          isHighlighted = true;
          break;
        }
      }
      
      if (isHighlighted) {
        // Draw highlight background - ensure it doesn't exceed width
        const highlightWidth = Math.min(displayWordWidth, x + maxWidth - currentX);
        this.ctx.fillStyle = '#FFFF05';
        this.ctx.fillRect(currentX, currentY - 12, highlightWidth, 16);
        this.ctx.fillStyle = '#000000';
        this.ctx.fillText(displayWord, currentX, currentY);
        this.ctx.fillStyle = '#111b21';
      } else {
        this.ctx.fillText(displayWord, currentX, currentY);
      }
      
      // Move cursor for next word - use display word width to prevent overflow
      currentX += displayWordWidth;
      
      // Add space if not the last word and there's room
      if (i < words.length - 1) {
        if (currentX + spaceWidth <= x + maxWidth) {
          currentX += spaceWidth;
        }
        charIndex += word.length + 1; // +1 for space
      } else {
        charIndex += word.length;
      }
    }
    
    return currentY - y + 5; // Return total height used
  }

  private drawMessageTime(time: string, x: number, y: number) {
    // Ensure consistent font rendering settings for time
    this.ctx.font = '11px Helvetica Neue, sans-serif';
    this.ctx.fillStyle = '#667781';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'alphabetic';
    
    const displayTime = this.formatTimeForDisplay(time);
    this.ctx.fillText(displayTime, x, y);
    
    // Reset alignment
    this.ctx.textAlign = 'left';
  }

  private drawTimeOverlay(time: string, x: number, y: number) {
    const displayTime = this.formatTimeForDisplay(time);
    
    // Ensure consistent font rendering settings for overlay time
    this.ctx.font = '10px Helvetica Neue, sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'alphabetic';
    
    // Draw text without any background (clean like in preview)
    this.ctx.fillText(displayTime, x, y);
    
    // Reset alignment
    this.ctx.textAlign = 'left';
  }

  private async drawMessageImage(imageUrl: string, x: number, y: number, maxWidth: number, isImageOnlyMessage: boolean = false): Promise<number> {
    try {
      const img = await this.loadImage(imageUrl);
      const dimensions = await this.calculateImageDimensions(imageUrl);
      
      // Ensure image respects the bubble's maxWidth constraint
      const imageWidth = Math.min(dimensions.width, maxWidth);
      const imageHeight = (dimensions.height * imageWidth) / dimensions.width;
      
      // Draw image with rounded corners constrained to bubble interior
      this.ctx.save();
      
      // Create clipping path for rounded image
      this.ctx.beginPath();
      this.ctx.moveTo(x + 6, y);
      this.ctx.lineTo(x + imageWidth - 6, y);
      this.ctx.quadraticCurveTo(x + imageWidth, y, x + imageWidth, y + 6);
      this.ctx.lineTo(x + imageWidth, y + imageHeight - 6);
      this.ctx.quadraticCurveTo(x + imageWidth, y + imageHeight, x + imageWidth - 6, y + imageHeight);
      this.ctx.lineTo(x + 6, y + imageHeight);
      this.ctx.quadraticCurveTo(x, y + imageHeight, x, y + imageHeight - 6);
      this.ctx.lineTo(x, y + 6);
      this.ctx.quadraticCurveTo(x, y, x + 6, y);
      this.ctx.closePath();
      this.ctx.clip();
      
      // Draw image with constrained dimensions
      this.ctx.drawImage(img, x, y, imageWidth, imageHeight);
      
      this.ctx.restore();
      
      // Add gradient overlay for image-only messages (matching preview: bg-gradient-to-t from-black/50 to-transparent)
      if (isImageOnlyMessage) {
        this.ctx.save();
        
        // Create clipping path for rounded bottom corners using constrained dimensions
        this.ctx.beginPath();
        this.ctx.moveTo(x + 6, y);
        this.ctx.lineTo(x + imageWidth - 6, y);
        this.ctx.quadraticCurveTo(x + imageWidth, y, x + imageWidth, y + 6);
        this.ctx.lineTo(x + imageWidth, y + imageHeight - 6);
        this.ctx.quadraticCurveTo(x + imageWidth, y + imageHeight, x + imageWidth - 6, y + imageHeight);
        this.ctx.lineTo(x + 6, y + imageHeight);
        this.ctx.quadraticCurveTo(x, y + imageHeight, x, y + imageHeight - 6);
        this.ctx.lineTo(x, y + 6);
        this.ctx.quadraticCurveTo(x, y, x + 6, y);
        this.ctx.closePath();
        this.ctx.clip();
        
        // Create gradient from transparent at top to black/50 at bottom (height: 28px = 7 * 4)
        const gradientHeight = 28; // 7 * scale factor
        const gradient = this.ctx.createLinearGradient(
          x, 
          y + imageHeight - gradientHeight, 
          x, 
          y + imageHeight
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // transparent at top
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)'); // black/50 at bottom
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y + imageHeight - gradientHeight, imageWidth, gradientHeight);
        
        this.ctx.restore();
      }
      
      return imageHeight;
    } catch (error) {
      console.warn('Could not load message image:', error);
      return 140; // fallback height
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private formatTimeForDisplay(time24: string): string {
    if (!time24) return "5:07 pm";
    if (time24.includes(':') && time24.length === 5) {
      const [hours, minutes] = time24.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'pm' : 'am';
      return `${hour12}:${minutes} ${ampm}`;
    }
    return time24;
  }

  // Apply border radius to final canvas
  createRoundedCanvas(sourceCanvas: HTMLCanvasElement, radius: number = 16): HTMLCanvasElement {
    const roundedCanvas = document.createElement('canvas');
    const ctx = roundedCanvas.getContext('2d')!;
    
    roundedCanvas.width = sourceCanvas.width;
    roundedCanvas.height = sourceCanvas.height;
    
    const radiusScaled = radius * this.scale;
    
    // Create clipping path
    ctx.beginPath();
    ctx.moveTo(radiusScaled, 0);
    ctx.lineTo(sourceCanvas.width - radiusScaled, 0);
    ctx.quadraticCurveTo(sourceCanvas.width, 0, sourceCanvas.width, radiusScaled);
    ctx.lineTo(sourceCanvas.width, sourceCanvas.height - radiusScaled);
    ctx.quadraticCurveTo(sourceCanvas.width, sourceCanvas.height, sourceCanvas.width - radiusScaled, sourceCanvas.height);
    ctx.lineTo(radiusScaled, sourceCanvas.height);
    ctx.quadraticCurveTo(0, sourceCanvas.height, 0, sourceCanvas.height - radiusScaled);
    ctx.lineTo(0, radiusScaled);
    ctx.quadraticCurveTo(0, 0, radiusScaled, 0);
    ctx.closePath();
    ctx.clip();
    
    // Draw the source canvas
    ctx.drawImage(sourceCanvas, 0, 0);
    
    return roundedCanvas;
  }
}