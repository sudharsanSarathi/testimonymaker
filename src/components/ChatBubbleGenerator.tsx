import React, { useRef } from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import imgImage from "figma:asset/216772b72be47c45b2b975cc6d2ca591798cd09a.png";

interface HighlightRange {
  start: number;
  end: number;
  id: string;
}

interface Message {
  id: string;
  text: string;
  images: string[];
  time: string;
  type: 'text' | 'image' | 'text-image';
  highlights?: HighlightRange[];
}

interface ChatBubbleGeneratorProps {
  messages: Message[];
}

export function ChatBubbleGenerator({ messages }: ChatBubbleGeneratorProps) {
  const downloadAsImage = async () => {
    if (messages.length === 0) {
      toast.error('No messages to download');
      return;
    }

    try {
      // Create a temporary container that matches the preview exactly
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '400px';
      tempContainer.style.borderRadius = '16px';
      tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      tempContainer.style.overflow = 'hidden';

      // Create WhatsApp background with proper tiling (no stretching)
      const backgroundDiv = document.createElement('div');
      backgroundDiv.style.position = 'absolute';
      backgroundDiv.style.inset = '0';
      backgroundDiv.style.backgroundColor = '#efeae2';
      
      const backgroundOverlay = document.createElement('div');
      backgroundOverlay.style.position = 'absolute';
      backgroundOverlay.style.inset = '0';
      backgroundOverlay.style.backgroundImage = `url('${imgImage}')`;
      backgroundOverlay.style.backgroundRepeat = 'repeat';
      backgroundOverlay.style.backgroundSize = 'auto';
      backgroundOverlay.style.backgroundPosition = 'top left';
      backgroundOverlay.style.opacity = '0.4';
      
      backgroundDiv.appendChild(backgroundOverlay);
      tempContainer.appendChild(backgroundDiv);

      // Create content container with natural height wrapping
      const contentDiv = document.createElement('div');
      contentDiv.style.position = 'relative';
      contentDiv.style.zIndex = '10';
      contentDiv.style.paddingTop = '35px';
      contentDiv.style.paddingBottom = '8px';
      contentDiv.style.paddingLeft = '14px';
      contentDiv.style.paddingRight = '14px';
      contentDiv.style.minHeight = '120px';

      // Create messages container
      const messagesContainer = document.createElement('div');
      messagesContainer.style.display = 'flex';
      messagesContainer.style.flexDirection = 'column';
      messagesContainer.style.gap = '8px';
      messagesContainer.style.paddingBottom = '8px';

      // Generate each message
      for (const message of messages) {
        const messageWrapper = document.createElement('div');
        messageWrapper.style.display = 'flex';
        messageWrapper.style.justifyContent = 'flex-start';

        if (message.type === 'text') {
          messageWrapper.appendChild(createTextMessageElement(message));
        } else if (message.type === 'image') {
          messageWrapper.appendChild(await createImageMessageElement(message));
        } else if (message.type === 'text-image') {
          messageWrapper.appendChild(await createImageAndTextMessageElement(message));
        }

        messagesContainer.appendChild(messageWrapper);
      }

      contentDiv.appendChild(messagesContainer);
      tempContainer.appendChild(contentDiv);

      // Let the container wrap its content naturally
      document.body.appendChild(tempContainer);
      
      // Get the natural height after rendering
      const naturalHeight = tempContainer.offsetHeight;
      tempContainer.style.height = `${naturalHeight}px`;

      // Use html2canvas for high-quality rendering
      const html2canvas = await import('html2canvas');
      const canvas = await html2canvas.default(tempContainer, {
        backgroundColor: '#efeae2',
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: 400,
        height: naturalHeight,
        windowWidth: 400,
        windowHeight: naturalHeight,
        ignoreElements: (element) => {
          // Skip elements that might have problematic styles
          return false;
        }
      });

      // Clean up
      document.body.removeChild(tempContainer);

      // Download the image
      const link = document.createElement('a');
      link.download = `whatsapp-testimonial-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      toast.success('Chat bubbles downloaded successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to download image. Please try again.');
    }
  };

  // Helper function to render text with highlights in DOM elements
  const renderTextWithHighlightsInDOM = (text: string, highlights: HighlightRange[] = []) => {
    const container = document.createDocumentFragment();
    
    if (!text || highlights.length === 0) {
      container.appendChild(document.createTextNode(text || ''));
      return container;
    }

    let lastIndex = 0;
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    sortedHighlights.forEach((highlight) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        container.appendChild(document.createTextNode(text.slice(lastIndex, highlight.start)));
      }

      // Add highlighted text with new yellow color
      const highlightSpan = document.createElement('span');
      highlightSpan.style.backgroundColor = '#FFFF05';
      highlightSpan.style.color = '#000000';
      highlightSpan.style.padding = '0 2px';
      highlightSpan.style.borderRadius = '2px';
      highlightSpan.textContent = text.slice(highlight.start, highlight.end);
      container.appendChild(highlightSpan);

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      container.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    return container;
  };

  const createTextMessageElement = (message: Message) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '350px';
    wrapper.style.minHeight = '40px';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'flex-start';

    // Create SVG for the bubble tail
    const tailSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tailSvg.style.flexShrink = '0';
    tailSvg.style.width = '8px';
    tailSvg.style.height = '13px';
    tailSvg.style.marginTop = '0px';
    tailSvg.style.zIndex = '10';
    tailSvg.setAttribute('viewBox', '0 0 8 13');
    tailSvg.innerHTML = `
      <path d="M0.532642 3.56824L6.99964 12.1932V1.00024H1.81164C0.0416422 1.00024 -0.526358 2.15624 0.532642 3.56824Z" fill="black" opacity="0.13" />
      <path d="M7 0V11.1934L0.533202 2.56836C-0.525736 1.15644 0.0417622 0.000131488 1.81152 0H7Z" fill="white" />
    `;

    // Create main bubble container
    const bubbleContainer = document.createElement('div');
    bubbleContainer.style.flex = '1';
    bubbleContainer.style.position = 'relative';
    bubbleContainer.style.marginLeft = '-1px';

    // Create bubble background
    const bubbleBackground = document.createElement('div');
    bubbleBackground.style.position = 'absolute';
    bubbleBackground.style.inset = '0';
    bubbleBackground.style.backgroundColor = '#ffffff';
    bubbleBackground.style.borderRadius = '7.5px';
    bubbleBackground.style.borderTopLeftRadius = '0px';
    bubbleBackground.style.boxShadow = '0px 1px 0.5px 0px rgba(11,20,26,0.13)';

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.style.position = 'relative';
    contentContainer.style.zIndex = '10';
    contentContainer.style.padding = '8px 10px';
    contentContainer.style.display = 'flex';
    contentContainer.style.alignItems = 'flex-end';
    contentContainer.style.justifyContent = 'space-between';
    contentContainer.style.gap = '8px';
    contentContainer.style.minHeight = '40px';

    // Add text content with highlights
    const textDiv = document.createElement('div');
    textDiv.style.flex = '1';
    textDiv.style.fontFamily = 'Helvetica Neue, sans-serif';
    textDiv.style.fontSize = '14.2px';
    textDiv.style.color = '#111b21';
    textDiv.style.lineHeight = '19px';
    textDiv.style.margin = '0';
    textDiv.style.wordWrap = 'break-word';
    textDiv.style.overflowWrap = 'break-word';
    textDiv.style.whiteSpace = 'pre-wrap';
    
    // Append highlighted text
    textDiv.appendChild(renderTextWithHighlightsInDOM(message.text, message.highlights));

    // Add time
    const timeDiv = document.createElement('div');
    timeDiv.style.flexShrink = '0';
    timeDiv.style.alignSelf = 'flex-end';
    timeDiv.style.paddingBottom = '4px';
    timeDiv.style.fontFamily = 'Helvetica Neue, sans-serif';
    timeDiv.style.fontSize = '11px';
    timeDiv.style.color = '#667781';
    timeDiv.style.whiteSpace = 'nowrap';
    timeDiv.style.lineHeight = '15px';
    
    // Format time for display
    const formatTimeForDisplay = (time24) => {
      if (!time24) return "17:07";
      if (time24.includes(':') && time24.length === 5) {
        const [hours, minutes] = time24.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        return `${hour12}:${minutes}`;
      }
      return time24;
    };
    
    timeDiv.textContent = formatTimeForDisplay(message.time);

    contentContainer.appendChild(textDiv);
    contentContainer.appendChild(timeDiv);
    
    bubbleContainer.appendChild(bubbleBackground);
    bubbleContainer.appendChild(contentContainer);
    
    wrapper.appendChild(tailSvg);
    wrapper.appendChild(bubbleContainer);

    return wrapper;
  };

  const createImageMessageElement = async (message: Message): Promise<HTMLElement> => {
    // Calculate image dimensions
    const firstImage = message.images && message.images.length > 0 ? message.images[0] : null;
    const imageDimensions = await new Promise<{width: number, height: number}>((resolve) => {
      if (!firstImage) {
        resolve({ width: 328, height: 174 });
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        const maxWidth = 328;
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
        
        resolve({ width: Math.round(width), height: Math.round(height) });
      };
      img.src = firstImage;
    });

    const bubbleHeight = imageDimensions.height + 8;
    const containerHeight = bubbleHeight + 3;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '350px';
    wrapper.style.height = `${containerHeight}px`;
    wrapper.style.minHeight = '40px';

    // Create SVG for the bubble tail
    const tailSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tailSvg.style.position = 'absolute';
    tailSvg.style.left = '0px';
    tailSvg.style.top = '2px';
    tailSvg.style.width = '8px';
    tailSvg.style.height = '13px';
    tailSvg.setAttribute('viewBox', '0 0 8 13');
    tailSvg.innerHTML = `
      <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 0.474 2.156 1.533 3.568Z" fill="black" opacity="0.13" />
      <path d="M1.533 2.568L8 11.193V0H2.812C1.042 0 0.474 1.156 1.533 2.568Z" fill="white" />
    `;

    // Create main bubble
    const bubble = document.createElement('div');
    bubble.style.position = 'absolute';
    bubble.style.left = '8px';
    bubble.style.top = '2px';
    bubble.style.width = `${imageDimensions.width + 8}px`;
    bubble.style.height = `${bubbleHeight}px`;
    bubble.style.backgroundColor = '#ffffff';
    bubble.style.borderRadius = '7.5px';
    bubble.style.borderTopLeftRadius = '0px';
    bubble.style.boxShadow = '0px 1px 0.5px 0px rgba(11,20,26,0.13)';
    bubble.style.padding = '4px';
    bubble.style.overflow = 'hidden';

    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.style.position = 'relative';
    imageContainer.style.width = `${imageDimensions.width}px`;
    imageContainer.style.height = `${imageDimensions.height}px`;
    imageContainer.style.borderRadius = '6px';
    imageContainer.style.overflow = 'hidden';
    imageContainer.style.backgroundColor = '#f3f4f6';

    if (firstImage) {
      const img = document.createElement('img');
      img.src = firstImage;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.style.display = 'block';
      imageContainer.appendChild(img);
    }

    // Add gradient overlay for time
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.bottom = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.height = '28px';
    overlay.style.background = 'linear-gradient(to top, rgba(11,20,26,0.5), rgba(11,20,26,0))';

    // Add time
    const timeDiv = document.createElement('div');
    timeDiv.style.position = 'absolute';
    timeDiv.style.bottom = '5px';
    timeDiv.style.right = '8px';
    timeDiv.style.fontFamily = 'Helvetica Neue, sans-serif';
    timeDiv.style.fontSize = '10px';
    timeDiv.style.color = 'rgba(255,255,255,0.9)';
    timeDiv.style.whiteSpace = 'nowrap';
    
    // Format time for display
    const formatTimeForDisplay = (time24) => {
      if (!time24) return "17:07";
      if (time24.includes(':') && time24.length === 5) {
        const [hours, minutes] = time24.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        return `${hour12}:${minutes}`;
      }
      return time24;
    };
    
    timeDiv.textContent = formatTimeForDisplay(message.time);

    imageContainer.appendChild(overlay);
    imageContainer.appendChild(timeDiv);
    bubble.appendChild(imageContainer);
    wrapper.appendChild(tailSvg);
    wrapper.appendChild(bubble);

    return wrapper;
  };

  const createImageAndTextMessageElement = async (message: Message): Promise<HTMLElement> => {
    // Calculate image dimensions - allow natural width with constraints
    const firstImage = message.images && message.images.length > 0 ? message.images[0] : null;
    const imageDimensions = await new Promise<{width: number, height: number}>((resolve) => {
      if (!firstImage) {
        resolve({ width: 250, height: 174 });
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        const maxWidth = 320; // Maximum width constraint for the bubble
        const maxHeight = 400; // Maximum height constraint
        
        let { width, height } = img;
        
        // Scale down if image is larger than max width
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Scale down if height is still too large
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        resolve({ width: Math.round(width), height: Math.round(height) });
      };
      img.src = firstImage;
    });

    // Calculate actual text height
    const textHeight = await new Promise<number>((resolve) => {
      if (!message.text) {
        resolve(0);
        return;
      }
      
      const temp = document.createElement('div');
      temp.style.position = 'absolute';
      temp.style.visibility = 'hidden';
      temp.style.fontFamily = 'Helvetica Neue, sans-serif';
      temp.style.fontSize = '14.2px';
      temp.style.lineHeight = '19px';
      temp.style.width = `${imageDimensions.width}px`; // Match image width exactly
      temp.style.wordWrap = 'break-word';
      temp.style.overflowWrap = 'break-word';
      temp.style.whiteSpace = 'pre-wrap';
      temp.textContent = message.text;
      
      document.body.appendChild(temp);
      const height = temp.offsetHeight;
      document.body.removeChild(temp);
      
      resolve(height);
    });

    const imageContainerHeight = imageDimensions.height + 16; // 8px padding top + 8px padding bottom
    const totalBubbleHeight = imageContainerHeight + (message.text ? textHeight + 16 : 0) + 32; // Image + text + padding + time area
    const bubbleWidth = imageDimensions.width + 24; // Image width + container padding

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '350px';
    wrapper.style.height = `${totalBubbleHeight}px`;
    wrapper.style.minHeight = '40px';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'flex-start';

    // Create SVG for the bubble tail
    const tailSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tailSvg.style.flexShrink = '0';
    tailSvg.style.width = '8px';
    tailSvg.style.height = '13px';
    tailSvg.style.zIndex = '50';
    tailSvg.setAttribute('viewBox', '0 0 8 13');
    tailSvg.innerHTML = `
      <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 0.474 2.156 1.533 3.568Z" fill="black" opacity="0.13" />
      <path d="M1.533 2.568L8 11.193V0H2.812C1.042 0 0.474 1.156 1.533 2.568Z" fill="white" />
    `;

    // Create main bubble container - width wraps to image
    const bubbleContainer = document.createElement('div');
    bubbleContainer.style.position = 'relative';
    bubbleContainer.style.marginLeft = '-1px';
    bubbleContainer.style.width = `${bubbleWidth}px`;

    // Create bubble background
    const bubbleBackground = document.createElement('div');
    bubbleBackground.style.position = 'absolute';
    bubbleBackground.style.inset = '0';
    bubbleBackground.style.backgroundColor = '#ffffff';
    bubbleBackground.style.borderRadius = '7.5px';
    bubbleBackground.style.borderTopLeftRadius = '0px';
    bubbleBackground.style.boxShadow = '0px 1px 0.5px 0px rgba(11,20,26,0.13)';

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.style.position = 'relative';
    contentContainer.style.zIndex = '10';
    contentContainer.style.padding = '8px';

    // Image container with 8px padding
    if (firstImage) {
      const imageWrapper = document.createElement('div');
      imageWrapper.style.marginBottom = '4px';
      imageWrapper.style.padding = '8px';

      const img = document.createElement('img');
      img.src = firstImage;
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.maxWidth = `${imageDimensions.width}px`;
      img.style.maxHeight = `${imageDimensions.height}px`;
      img.style.objectFit = 'contain';
      img.style.borderRadius = '6px';
      img.style.backgroundColor = '#f3f4f6';
      img.style.display = 'block';

      imageWrapper.appendChild(img);
      contentContainer.appendChild(imageWrapper);
    }

    // Text content with highlights
    if (message.text) {
      const textDiv = document.createElement('div');
      textDiv.style.fontFamily = 'Helvetica Neue, sans-serif';
      textDiv.style.fontSize = '14.2px';
      textDiv.style.color = '#111b21';
      textDiv.style.lineHeight = '19px';
      textDiv.style.padding = '0 8px';
      textDiv.style.marginBottom = '4px';
      textDiv.style.wordWrap = 'break-word';
      textDiv.style.overflowWrap = 'break-word';
      textDiv.style.whiteSpace = 'pre-wrap';
      
      // Append highlighted text
      textDiv.appendChild(renderTextWithHighlightsInDOM(message.text, message.highlights));
      contentContainer.appendChild(textDiv);
    }

    // Add time - absolutely positioned at bottom right
    const timeDiv = document.createElement('div');
    timeDiv.style.position = 'absolute';
    timeDiv.style.bottom = '8px';
    timeDiv.style.right = '10px';
    timeDiv.style.fontFamily = 'Helvetica Neue, sans-serif';
    timeDiv.style.fontSize = '11px';
    timeDiv.style.color = '#667781';
    timeDiv.style.whiteSpace = 'nowrap';
    timeDiv.style.lineHeight = '15px';
    
    // Format time for display
    const formatTimeForDisplay = (time24) => {
      if (!time24) return "17:07";
      if (time24.includes(':') && time24.length === 5) {
        const [hours, minutes] = time24.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        return `${hour12}:${minutes}`;
      }
      return time24;
    };
    
    timeDiv.textContent = formatTimeForDisplay(message.time);

    contentContainer.appendChild(timeDiv);
    bubbleContainer.appendChild(bubbleBackground);
    bubbleContainer.appendChild(contentContainer);
    wrapper.appendChild(tailSvg);
    wrapper.appendChild(bubbleContainer);

    return wrapper;
  };

  return (
    <Button
      onClick={downloadAsImage}
      className="h-[48px] bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
      disabled={messages.length === 0}
    >
      <Download className="w-4 h-4 mr-2" />
      Download PNG
    </Button>
  );
}