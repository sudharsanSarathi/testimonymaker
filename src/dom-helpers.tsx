// Helper functions for DOM message element creation

import imgImage from "figma:asset/216772b72be47c45b2b975cc6d2ca591798cd09a.png";

interface Message {
  id: string;
  text: string;
  images: string[];
  time: string;
  type: "text" | "image" | "text-image";
  highlights?: HighlightRange[];
}

interface HighlightRange {
  start: number;
  end: number;
  id: string;
}

// Helper function to render text with highlights for DOM elements
const renderTextWithHighlightsInDOM = (text: string, highlights: HighlightRange[] = []): HTMLElement => {
  const container = document.createElement('span');
  
  if (!text || highlights.length === 0) {
    container.textContent = text;
    return container;
  }

  let lastIndex = 0;
  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

  sortedHighlights.forEach((highlight) => {
    // Add text before highlight
    if (highlight.start > lastIndex) {
      const textNode = document.createTextNode(text.slice(lastIndex, highlight.start));
      container.appendChild(textNode);
    }

    // Add highlighted text
    const highlightedSpan = document.createElement('span');
    highlightedSpan.style.backgroundColor = '#FFFF05';
    highlightedSpan.style.color = '#000000';
    highlightedSpan.style.borderRadius = '2px';
    highlightedSpan.textContent = text.slice(highlight.start, highlight.end);
    container.appendChild(highlightedSpan);

    lastIndex = highlight.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    const textNode = document.createTextNode(text.slice(lastIndex));
    container.appendChild(textNode);
  }

  return container;
};

// Format time for display with am/pm (convert from HH:MM to H:MM am/pm format)
const formatTimeForDisplay = (time24: string): string => {
  if (!time24) return "5:07 pm";
  const [hours, minutes] = time24.split(':');
  const hour24 = parseInt(hours);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'pm' : 'am';
  return `${hour12}:${minutes} ${ampm}`;
};

export const createTextMessageElement = (message: Message, availableWidth: number): HTMLElement => {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'flex-start';
  wrapper.style.marginBottom = '0'; // Spacing handled by parent container gap
  wrapper.style.width = '100%';

  // CRITICAL: Use same max-width constraint as preview (80% of available width or 320px max)
  const maxBubbleWidth = Math.min(availableWidth * 0.8, 320);

  const messageContainer = document.createElement('div');
  messageContainer.style.position = 'relative';
  messageContainer.style.maxWidth = `${maxBubbleWidth}px`;

  // Add tail
  const tail = document.createElement('div');
  tail.style.position = 'absolute';
  tail.style.left = '0px';
  tail.style.top = '0px';
  tail.style.width = '8px';
  tail.style.height = '13px';
  tail.style.zIndex = '50';
  tail.innerHTML = `<svg viewBox="0 0 8 13" style="width: 8px; height: 13px;">
    <path d="M1.533 2.568L8 11.193V0H2.812C1.042 0 0.474 1.156 1.533 2.568Z" fill="white" />
  </svg>`;

  // Create bubble with proper padding that doesn't push text down
  const bubble = document.createElement('div');
  bubble.style.backgroundColor = '#ffffff';
  bubble.style.borderRadius = '7.5px';
  bubble.style.borderTopLeftRadius = '0px';
  bubble.style.boxShadow = '0px 1px 0.5px 0px rgba(11,20,26,0.13)';
  bubble.style.position = 'relative';
  bubble.style.marginLeft = '8px';
  bubble.style.display = 'flex';
  bubble.style.alignItems = 'flex-start'; // Start alignment to avoid pushing text down
  bubble.style.padding = '8px'; // Consistent padding on all sides

  // Content container - simplified to avoid double flex containers
  const contentDiv = document.createElement('div');
  contentDiv.style.display = 'flex';
  contentDiv.style.alignItems = 'flex-end';
  contentDiv.style.gap = '8px';
  contentDiv.style.width = '100%';
  contentDiv.style.minHeight = '0'; // Remove minimum height constraints

  // Text content with EXACT width constraint matching preview - 4px top and bottom padding
  const textDiv = document.createElement('div');
  textDiv.style.fontFamily = 'Helvetica Neue, sans-serif';
  textDiv.style.fontSize = '14.2px';
  textDiv.style.color = '#111b21';
  textDiv.style.lineHeight = '19px';
  textDiv.style.wordWrap = 'break-word';
  textDiv.style.overflowWrap = 'break-word';
  textDiv.style.whiteSpace = 'normal'; // FIXED: Changed from 'pre-wrap' to 'normal' to prevent unwanted line breaks
  textDiv.style.margin = '0'; // Remove any default margins
  textDiv.style.padding = '4px 0'; // FIXED: 4px top and bottom padding to match preview exactly
  // CRITICAL: Apply same width constraint that will be used in preview
  textDiv.style.maxWidth = `${maxBubbleWidth - 80}px`; // Account for consistent padding and time space
  textDiv.appendChild(renderTextWithHighlightsInDOM(message.text, message.highlights));

  // Time - BOTTOM ALIGNED
  const timeDiv = document.createElement('div');
  timeDiv.style.fontSize = '11px';
  timeDiv.style.color = '#667781';
  timeDiv.style.whiteSpace = 'nowrap';
  timeDiv.style.flexShrink = '0';
  timeDiv.style.alignSelf = 'flex-end'; // BOTTOM ALIGNED
  timeDiv.style.margin = '0'; // Remove any default margins
  timeDiv.style.padding = '0'; // Remove any default padding
  timeDiv.style.verticalAlign = 'bottom'; // Additional bottom alignment
  timeDiv.textContent = formatTimeForDisplay(message.time);

  contentDiv.appendChild(textDiv);
  contentDiv.appendChild(timeDiv);
  bubble.appendChild(contentDiv);
  messageContainer.appendChild(tail);
  messageContainer.appendChild(bubble);
  wrapper.appendChild(messageContainer);

  return wrapper;
};

export const createImageMessageElement = async (message: Message, availableWidth: number): Promise<HTMLElement> => {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'flex-start';
  wrapper.style.marginBottom = '0'; // Spacing handled by parent container gap
  wrapper.style.width = '100%';

  const maxBubbleWidth = Math.min(availableWidth * 0.8, 320);
  
  const messageContainer = document.createElement('div');
  messageContainer.style.position = 'relative';
  messageContainer.style.maxWidth = `${maxBubbleWidth}px`;

  // Add tail
  const tail = document.createElement('div');
  tail.style.position = 'absolute';
  tail.style.left = '0px';
  tail.style.top = '0px';
  tail.style.width = '8px';
  tail.style.height = '13px';
  tail.style.zIndex = '50';
  tail.innerHTML = `<svg viewBox="0 0 8 13" style="width: 8px; height: 13px;">
    <path d="M1.533 2.568L8 11.193V0H2.812C1.042 0 0.474 1.156 1.533 2.568Z" fill="white" />
  </svg>`;

  // Create bubble
  const bubble = document.createElement('div');
  bubble.style.backgroundColor = '#ffffff';
  bubble.style.borderRadius = '7.5px';
  bubble.style.borderTopLeftRadius = '0px';
  bubble.style.padding = '8px';
  bubble.style.boxShadow = '0px 1px 0.5px 0px rgba(11,20,26,0.13)';
  bubble.style.position = 'relative';
  bubble.style.marginLeft = '8px';

  // Add image with overlay and time
  if (message.images.length > 0) {
    const imageContainer = document.createElement('div');
    imageContainer.style.position = 'relative';
    
    const img = document.createElement('img');
    img.src = message.images[0];
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.maxWidth = '280px';
    img.style.borderRadius = '6px';
    img.style.backgroundColor = '#f3f4f6';
    img.style.objectFit = 'cover';
    
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.bottom = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.height = '28px';
    overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)';
    overlay.style.borderBottomLeftRadius = '6px';
    overlay.style.borderBottomRightRadius = '6px';
    
    const timeDiv = document.createElement('div');
    timeDiv.style.position = 'absolute';
    timeDiv.style.bottom = '5px';
    timeDiv.style.right = '8px';
    timeDiv.style.fontSize = '10px';
    timeDiv.style.color = 'rgba(255,255,255,0.9)';
    timeDiv.style.whiteSpace = 'nowrap';
    timeDiv.style.fontFamily = 'Helvetica Neue, sans-serif';
    timeDiv.textContent = formatTimeForDisplay(message.time);
    
    imageContainer.appendChild(img);
    imageContainer.appendChild(overlay);
    imageContainer.appendChild(timeDiv);
    bubble.appendChild(imageContainer);
  }

  messageContainer.appendChild(tail);
  messageContainer.appendChild(bubble);
  wrapper.appendChild(messageContainer);

  return wrapper;
};

export const createImageAndTextMessageElement = async (message: Message, availableWidth: number): Promise<HTMLElement> => {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'flex-start';
  wrapper.style.marginBottom = '0'; // Spacing handled by parent container gap
  wrapper.style.width = '100%';

  const maxBubbleWidth = Math.min(availableWidth * 0.8, 320);

  const messageContainer = document.createElement('div');
  messageContainer.style.position = 'relative';
  messageContainer.style.maxWidth = `${maxBubbleWidth}px`;

  // Add tail
  const tail = document.createElement('div');
  tail.style.position = 'absolute';
  tail.style.left = '0px';
  tail.style.top = '0px';
  tail.style.width = '8px';
  tail.style.height = '13px';
  tail.style.zIndex = '50';
  tail.innerHTML = `<svg viewBox="0 0 8 13" style="width: 8px; height: 13px;">
    <path d="M1.533 2.568L8 11.193V0H2.812C1.042 0 0.474 1.156 1.533 2.568Z" fill="white" />
  </svg>`;

  // Create bubble with proper content alignment
  const bubble = document.createElement('div');
  bubble.style.backgroundColor = '#ffffff';
  bubble.style.borderRadius = '7.5px';
  bubble.style.borderTopLeftRadius = '0px';
  bubble.style.padding = '8px'; // Consistent padding on all sides
  bubble.style.boxShadow = '0px 1px 0.5px 0px rgba(11,20,26,0.13)';
  bubble.style.position = 'relative';
  bubble.style.marginLeft = '8px';

  // Add image
  if (message.images.length > 0) {
    const img = document.createElement('img');
    img.src = message.images[0];
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.maxWidth = '280px';
    img.style.borderRadius = '6px';
    img.style.backgroundColor = '#f3f4f6';
    img.style.objectFit = 'cover';
    img.style.marginBottom = '6px'; // Reduced margin
    img.style.display = 'block';
    bubble.appendChild(img);
  }

  // Add text content - 4px top and bottom padding
  if (message.text) {
    const textDiv = document.createElement('div');
    textDiv.style.fontFamily = 'Helvetica Neue, sans-serif';
    textDiv.style.fontSize = '14.2px';
    textDiv.style.color = '#111b21';
    textDiv.style.lineHeight = '19px';
    textDiv.style.wordWrap = 'break-word';
    textDiv.style.overflowWrap = 'break-word';
    textDiv.style.whiteSpace = 'normal'; // FIXED: Changed from 'pre-wrap' to 'normal' to prevent unwanted line breaks  
    textDiv.style.maxWidth = `${maxBubbleWidth - 32}px`; // Account for consistent 8px padding on both sides
    textDiv.style.marginBottom = '2px'; // Small margin for spacing
    textDiv.style.margin = '0 0 2px 0'; // Remove any default margins, keep small bottom margin
    textDiv.style.padding = '4px 0'; // FIXED: 4px top and bottom padding to match preview exactly
    textDiv.appendChild(renderTextWithHighlightsInDOM(message.text, message.highlights));
    bubble.appendChild(textDiv);
  }

  // Add time - BOTTOM ALIGNED naturally without extra margins
  const timeDiv = document.createElement('div');
  timeDiv.style.fontSize = '11px';
  timeDiv.style.color = '#667781';
  timeDiv.style.textAlign = 'right';
  timeDiv.style.fontFamily = 'Helvetica Neue, sans-serif';
  timeDiv.style.margin = '0'; // Remove default margins
  timeDiv.style.padding = '0'; // Remove default padding
  timeDiv.style.alignSelf = 'flex-end'; // BOTTOM ALIGNED
  timeDiv.style.verticalAlign = 'bottom'; // Additional bottom alignment
  timeDiv.textContent = formatTimeForDisplay(message.time);
  bubble.appendChild(timeDiv);

  messageContainer.appendChild(tail);
  messageContainer.appendChild(bubble);
  wrapper.appendChild(messageContainer);

  return wrapper;
};