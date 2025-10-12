import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Download,
  Upload,
  MessageCircle,
  Image as ImageIcon,
  Clock,
  GripVertical,
  Share2,
  Shuffle,
  Edit2,
  Trash2,
  X,
  Check,
  Highlighter,
  ChevronDown,
  Plus,
  Loader2,
  Palette,
  Code,
  Copy,
} from "lucide-react";
import confetti from 'canvas-confetti';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Card } from "./components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { HighlightableTextarea, HighlightableTextareaRef } from "./components/HighlightableTextarea";
import { BubbleInput, BubbleInputRef } from "./components/BubbleInput";
import { ScreenshotHighlighter } from "./components/ScreenshotHighlighter";
import { TextExtractor } from "./components/TextExtractor";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { usePageTracking, trackEvent as gtaTrackEvent } from './components/usePageTracking';

import { HomePage } from './pages/HomePage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { SitemapPage } from './pages/SitemapPage';
import { CreateTestimonialPage } from './pages/CreateTestimonialPage';
import { ScreenshotHighlighterPage } from './pages/ScreenshotHighlighterPage';
import WhatsappBackground from "./imports/WhatsappBackground";
// Image removed as per user request
import Autoscroll from "./imports/Autoscroll-36-773";
import WebBg from "./imports/WebBg";
import whatsappLogo from 'figma:asset/07e1ff8af45218126f5b8203c195a2fe9ba7abe9.png';
import imgImage from "figma:asset/216772b72be47c45b2b975cc6d2ca591798cd09a.png";
import logoImage from 'figma:asset/b202f9db7574a7ce1d1f828a2bccf33e6d2398c1.png';
import rocketImage from 'figma:asset/f8ac43c4dd74475d21092f81bd71e07322a73f36.png';
import testimonialIcon from 'figma:asset/9be7411cac23a87aafc2dfde92ccef9cdc075a34.png';
import createImageIcon from 'figma:asset/e58bd8d900039bf329f0fd23c06495e7d61597fb.png';
import clientFormsIcon from 'figma:asset/68dddd0d74009188e78750f19b351516e71f6633.png';

import { CanvasImageGenerator } from "./canvas-generator";
import { projectId, publicAnonKey } from './utils/supabase/info';

// Analytics tracking utilities - OPTIMIZED for performance
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const sessionId = generateSessionId();

// Event queue for batching requests
let eventQueue: any[] = [];
let isProcessingQueue = false;
let queueTimer: NodeJS.Timeout | null = null;

// Debounce map for frequently triggered events
const eventDebounceMap = new Map();

// Enhanced tracking function that sends to both your backend and Google Analytics
const trackEvent = (event: string, data: any = {}) => {
  // Don't block UI - queue the event for your backend and return immediately
  queueEvent(event, data);
  
  // Also send to Google Analytics (non-blocking)
  setTimeout(() => {
    try {
      // Send to Google Analytics using the new tracking function
      gtaTrackEvent(event, data);
    } catch (error) {
      // Silently fail - don't block user experience
      console.debug('GA tracking failed:', error);
    }
  }, 0);
};

// Queue event for batched processing
const queueEvent = (event: string, data: any = {}) => {
  // Skip analytics if basic requirements aren't met
  if (!projectId || !publicAnonKey) {
    return;
  }

  const eventData = {
    event,
    data,
    sessionId,
    timestamp: new Date().toISOString()
  };

  // Add to queue with size limit to prevent memory issues
  if (eventQueue.length < 100) { // Limit queue size
    eventQueue.push(eventData);
  }

  // Debounce rapid-fire events (like typing, selections)
  const rapidEvents = ['platform_selected', 'message_type_selected', 'tab_switched'];
  if (rapidEvents.includes(event)) {
    const debounceKey = `${event}_${JSON.stringify(data)}`;
    if (eventDebounceMap.has(debounceKey)) {
      clearTimeout(eventDebounceMap.get(debounceKey));
    }
    
    eventDebounceMap.set(debounceKey, setTimeout(() => {
      eventDebounceMap.delete(debounceKey);
    }, 300));
    
    // Skip processing if we're debouncing this event
    return;
  }

  // Process queue with debounced batching
  if (queueTimer) {
    clearTimeout(queueTimer);
  }
  
  queueTimer = setTimeout(() => {
    processEventQueue();
  }, 100); // Batch events within 100ms
};

// Process queued events in batches
const processEventQueue = async () => {
  if (isProcessingQueue || eventQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  const eventsToProcess = [...eventQueue];
  eventQueue = [];

  try {
    // Validate required environment variables before attempting request
    if (!projectId || !publicAnonKey) {
      console.debug('Analytics disabled: Missing Supabase configuration');
      return;
    }

    // Send all events in a single batch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a2080617/track-events-batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: eventsToProcess }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Check if the response indicates the endpoint doesn't exist
    if (response.status === 404) {
      console.debug('Analytics endpoint not found - this is normal if backend is not deployed');
      return;
    }

    // Log other non-success responses for debugging without showing errors to user
    if (!response.ok) {
      console.debug(`Analytics request failed with status ${response.status}`);
    }

  } catch (error) {
    // Only log meaningful errors and avoid spamming console
    if (error.name === 'AbortError') {
      console.debug('Analytics request timed out (this is normal)');
    } else if (error.message?.includes('fetch')) {
      console.debug('Analytics service unavailable (this is normal)');
    } else {
      console.debug('Analytics error:', error.message);
    }
    
    // Don't re-queue events to avoid infinite retry loops
    // Analytics failures should never affect user experience
  } finally {
    isProcessingQueue = false;
    
    // Process any events that accumulated while we were processing (with delay to avoid aggressive retries)
    if (eventQueue.length > 0) {
      setTimeout(processEventQueue, 2000); // Increased delay to 2s to reduce retry frequency
    }
  }
};

// Import platform logos from respective components  
import imgInstagram from 'figma:asset/99501eb7512ed93c3f52ea28750a5bf15482fe48.png';
import imgLinkedin from "figma:asset/714f454dd81357b3380e5a8802a30600c95b5efe.png";
import imgTelegram from "figma:asset/246a70c155ba2500099383dafa16f07918df8665.png";
import imgWhatsApp from 'figma:asset/07e1ff8af45218126f5b8203c195a2fe9ba7abe9.png';

// ImageUploadArea Component with Drag and Drop
function ImageUploadArea({ currentImages, onImageUpload, onRemoveImage, fileInputRef, messageType }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth > 600);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (isDesktop) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!isDesktop) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      // Create a synthetic event object
      const syntheticEvent = {
        target: {
          files: [files[0]], // Only take the first file
          value: ''
        }
      };
      onImageUpload(syntheticEvent);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-3">
        {messageType === "image" ? "Upload the image" : "Insert image in message"}
      </label>
      
      {/* Large Drag and Drop Area for Desktop */}
      {isDesktop ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={currentImages.length === 0 ? () => fileInputRef.current?.click() : undefined}
          className={`relative border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200 mb-4 ${
            isDragOver
              ? 'border-green-500 bg-green-50 scale-105'
              : currentImages.length > 0
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
          }`}
          style={{ minHeight: '120px' }}
        >
          {currentImages.length === 0 ? (
            /* Empty State */
            <div className="p-8 flex flex-col items-center justify-center space-y-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDragOver ? 'bg-green-200' : 'bg-gray-100'
              }`}>
                <Upload className={`w-6 h-6 ${isDragOver ? 'text-green-600' : 'text-gray-500'}`} />
              </div>
              <div>
                <p className={`font-medium ${isDragOver ? 'text-green-700' : 'text-gray-700'}`}>
                  {isDragOver ? 'Drop your image here' : 'Drag & drop your image here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse files
                </p>
              </div>
            </div>
          ) : (
            /* Image Preview State - Inside Container */
            <div className="p-4 flex flex-col items-center justify-center">
              {/* Close Button - Top Right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(currentImages[0].id);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image Preview - Centered */}
              <div className="relative">
                <img
                  src={currentImages[0].preview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mobile Version */
        <div className="mb-4">
          {currentImages.length === 0 ? (
            /* Mobile Upload Button */
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full h-16 rounded-xl border-2 border-[#D5E7D5] hover:border-green-500 shadow-md hover:shadow-lg transition-all duration-200 bg-white text-gray-700 hover:bg-green-50 font-medium"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Image
            </Button>
          ) : (
            /* Mobile Image Preview Container */
            <div className="relative border-2 border-gray-300 bg-gray-50 rounded-xl p-4 text-center">
              {/* Close Button - Top Right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(currentImages[0].id);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image Preview - Centered */}
              <div className="flex flex-col items-center">
                <img
                  src={currentImages[0].preview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
      />
    </div>
  );
}

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

type Platform = "whatsapp" | "instagram" | "telegram" | "linkedin";

// SEO and Document Title Component for the main app
function DocumentHead() {
  const location = useLocation();
  
  // Use the new page tracking hook
  usePageTracking();
  
  useEffect(() => {
    // Update document title and meta tags for the main app
    document.title = "Free Testimonial Maker – Templates, Images & Client Reviews";
    
    // Explicitly ensure robots meta tag allows indexing
    const updateOrCreateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };
    
    // Force proper indexing directives - simplified to avoid conflicts
    updateOrCreateMeta('robots', 'index, follow');
    updateOrCreateMeta('googlebot', 'index, follow');
    updateOrCreateMeta('bingbot', 'index, follow');
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    const currentUrl = `${window.location.origin}${location.pathname}`;
    if (canonical) {
      canonical.setAttribute('href', currentUrl);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = currentUrl;
      document.head.appendChild(link);
    }
    
    // Structured data for main app
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Free Testimonial Maker",
      "description": "Create beautiful testimonial templates, generate testimonial images, and design WhatsApp-style reviews with our free online tool.",
      "url": currentUrl,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Ready-to-use testimonial templates",
        "Create testimonial images",
        "Client testimonial forms",
        "WhatsApp-style reviews",
        "Professional designs for social media",
        "No watermarks",
        "Free to use",
        "Instant download"
      ]
    };

    if (structuredDataScript) {
      structuredDataScript.textContent = JSON.stringify(structuredData);
    } else {
      structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      structuredDataScript.textContent = JSON.stringify(structuredData);
      document.head.appendChild(structuredDataScript);
    }
    
  }, [location]);

  return null;
}

// Main App Component
function WhatsAppTestimonialMaker() {
  // Always load default state (no persistence)
  const getDefaultState = () => {
    // Clear any existing localStorage on every load
    try {
      localStorage.removeItem('testimonial-maker-state');
      localStorage.removeItem('emailSubmitted');
      localStorage.removeItem('userEmail');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    return {
      messages: [
        {
          id: "sample",
          text: "Your message will appear here",
          images: [],
          time: "17:07",
          type: "text",
          highlights: [
            {
              start: 18,
              end: 29,
              id: "default-highlight-1"
            }
          ],
        },
      ],
      currentMessage: "",
      currentHighlights: [],
      currentTime: "17:07",
      currentImages: [],
      hasAddedFirstMessage: false,
      selectedPlatform: "whatsapp",
      selectedMessageType: "text",
      backgroundColor: "#abe8a1",
      showBackground: true,
    };
  };

  const defaultState = getDefaultState();

  const [messages, setMessages] = useState<Message[]>(defaultState.messages);
  const [currentMessage, setCurrentMessage] = useState(defaultState.currentMessage);
  const [currentHighlights, setCurrentHighlights] = useState<HighlightRange[]>(defaultState.currentHighlights);
  const [currentTime, setCurrentTime] = useState(defaultState.currentTime);
  const [currentImages, setCurrentImages] = useState(defaultState.currentImages);
  const [hasAddedFirstMessage, setHasAddedFirstMessage] = useState(defaultState.hasAddedFirstMessage);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(defaultState.selectedPlatform);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [selectedMessageType, setSelectedMessageType] = useState<"text" | "image" | "text-image">(defaultState.selectedMessageType);
  const [messageTypeDropdownOpen, setMessageTypeDropdownOpen] = useState(false);
  
  // Background controls
  const [backgroundColor, setBackgroundColor] = useState(defaultState.backgroundColor);
  const [showBackground, setShowBackground] = useState(defaultState.showBackground);
  const [showBackgroundEditor, setShowBackgroundEditor] = useState(false);
  
  // Iframe popup state
  const [iframeDialogOpen, setIframeDialogOpen] = useState(false);
  
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"testimony-maker" | "screenshot-highlighter">("testimony-maker");
  
  // Handle URL parameters for tab selection - OPTIMIZED
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'screenshot-highlighter') {
      setActiveTab('screenshot-highlighter');
      // Delay tracking to not block navigation
      setTimeout(() => {
        trackEvent('tab_switched', { tab: 'screenshot-highlighter', source: 'url_parameter' });
      }, 100);
    } else {
      setActiveTab('testimony-maker');
      setTimeout(() => {
        trackEvent('tab_switched', { tab: 'testimony-maker', source: 'url_parameter' });
      }, 100);
    }
  }, [location.search]);

  // No persistence - state is always reset on page refresh

  // Email submission status is always reset on page refresh

  // Analytics tracking for page visits and user engagement - OPTIMIZED
  useEffect(() => {
    // Track page load with delay to not block initial render
    setTimeout(() => {
      trackEvent('page_visit', {
        page: 'testimonial_maker',
        userAgent: navigator.userAgent.substring(0, 100), // Truncate for performance
        platform: selectedPlatform
      });
    }, 1000);

    // Track page unload/leave - simplified
    const handleBeforeUnload = () => {
      // Force process any remaining events immediately on page unload
      if (eventQueue.length > 0) {
        navigator.sendBeacon(`https://${projectId}.supabase.co/functions/v1/make-server-a2080617/track-events-batch`, 
          JSON.stringify({ events: eventQueue }));
      }
    };

    // Throttled visibility change tracking
    let visibilityTimer: NodeJS.Timeout | null = null;
    const handleVisibilityChange = () => {
      if (visibilityTimer) clearTimeout(visibilityTimer);
      visibilityTimer = setTimeout(() => {
        trackEvent(document.hidden ? 'page_hidden' : 'page_visible', {
          page: 'testimonial_maker'
        });
      }, 500); // Throttle to 500ms
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimer) clearTimeout(visibilityTimer);
    };
  }, []); // Remove selectedPlatform dependency to prevent re-tracking
  

  
  // Edit message state
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editHighlights, setEditHighlights] = useState<HighlightRange[]>([]);
  const [editTime, setEditTime] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [editMessageType, setEditMessageType] = useState<"text" | "image" | "text-image">("text");

  // Email collection state
  const [downloadCount, setDownloadCount] = useState(0);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  
  // Loading states
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const timeInputRef = useRef(null);
  const editTimeInputRef = useRef(null);
  const highlightTextareaRef = useRef<HighlightableTextareaRef>(null);
  const bubbleInputRef = useRef<BubbleInputRef>(null);
  const editHighlightTextareaRef = useRef<HighlightableTextareaRef>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const platformDropdownRef = useRef<HTMLDivElement>(null);
  const messageTypeDropdownRef = useRef<HTMLDivElement>(null);
  const previewSectionRef = useRef<HTMLDivElement>(null);
  const testimonyTextareaRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);


  // Platform configurations with actual logos
  const platforms = {
    whatsapp: {
      name: "WhatsApp",
      logo: imgWhatsApp,
      color: "#25D366",
      available: true
    },
    instagram: {
      name: "Instagram",
      logo: imgInstagram,
      color: "#E4405F",
      available: false
    },
    telegram: {
      name: "Telegram",
      logo: imgTelegram,
      color: "#0088CC",
      available: false
    },
    linkedin: {
      name: "LinkedIn",
      logo: imgLinkedin,
      color: "#0077B5",
      available: false
    }
  };

  // Message type configurations
  const messageTypes = {
    text: {
      name: "Text only",
      icon: "💬",
      description: "Text message only"
    },
    image: {
      name: "Image only", 
      icon: "🖼️",
      description: "Image message only"
    },
    "text-image": {
      name: "Text + Image",
      icon: "📝",
      description: "Text message with image"
    }
  };

  // Handle extracted text from OCR
  const handleExtractedText = useCallback((extractedText: string) => {
    setCurrentMessage(extractedText);
    setCurrentHighlights([]);
    
    // Non-blocking OCR tracking
    setTimeout(() => {
      trackEvent('ocr_text_extracted', {
        text_length: extractedText.length,
        platform: selectedPlatform
      });
    }, 0);
    
    // Scroll to the text field
    setTimeout(() => {
      if (testimonyTextareaRef.current) {
        testimonyTextareaRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      
      // Focus on the textarea via the BubbleInput ref
      if (bubbleInputRef.current) {
        bubbleInputRef.current.focus();
      }
    }, 1000);
    
    toast.success("Text extracted successfully!");
  }, [selectedPlatform]); // Add selectedPlatform to dependencies since we use it



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (platformDropdownRef.current && !platformDropdownRef.current.contains(event.target as Node)) {
        setPlatformDropdownOpen(false);
      }
      if (messageTypeDropdownRef.current && !messageTypeDropdownRef.current.contains(event.target as Node)) {
        setMessageTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Customizable website background - solid bright yellow #FBDB49
  const websiteBackgroundStyle: React.CSSProperties = {
    // Primary gradient colors - all set to #FBDB49 for solid yellow background
    '--bg-gradient-from': '#B2DCB1',
    '--bg-gradient-via': '#B2DCB1',  
    '--bg-gradient-to': '#B2DCB1',
    
    // Overlay gradient colors - semi-transparent versions of #FBDB49
    '--bg-overlay-from': 'rgba(251, 219, 73, 0.8)',
    '--bg-overlay-via': 'rgba(251, 219, 73, 0.8)',
    '--bg-overlay-to': 'rgba(251, 219, 73, 0.8)',
    
    // Background - now a solid color since all gradient stops are the same
    background: '#B2DCB1',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden'
  } as React.CSSProperties;

  const overlayBackgroundStyle: React.CSSProperties = {
    position: 'absolute',
    inset: '0',
    background: '#B2DCB1',
    zIndex: 1
    
  };

  // Edit message functionality
  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setEditText(message.text);
    setEditHighlights(message.highlights || []);
    setEditTime(message.time);
    setEditImages(message.images.map((img, index) => ({ 
      id: Date.now() + index, 
      preview: img 
    })));
    setEditMessageType(message.type);
    setEditDialogOpen(true);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => {
      const filtered = prev.filter(msg => msg.id !== messageId);
      // If we deleted all messages, reset hasAddedFirstMessage and clear current inputs
      if (filtered.length === 0) {
        setHasAddedFirstMessage(false);
        setCurrentMessage("");
        setCurrentHighlights([]);
        setCurrentImages([]);
      }
      return filtered;
    });
    toast.success("Message deleted!");
  };

  const handleApplyEdit = () => {
    if (!editingMessage) return;

    // Validation based on selected edit message type
    if (editMessageType === "text" && !editText.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (editMessageType === "image" && editImages.length === 0) {
      toast.error("Please select an image");
      return;
    }
    if (editMessageType === "text-image" && (!editText.trim() || editImages.length === 0)) {
      toast.error("Please enter a message and select an image");
      return;
    }

    const updatedMessage: Message = {
      ...editingMessage,
      text: editMessageType === "image" ? "" : editText.trim(),
      images: editMessageType === "text" ? [] : editImages.map(img => img.preview),
      time: editTime,
      type: editMessageType,
      highlights: editMessageType === "image" ? [] : editHighlights,
    };

    setMessages(prev => 
      prev.map(msg => msg.id === editingMessage.id ? updatedMessage : msg)
    );

    // Close dialog and reset edit state
    setEditDialogOpen(false);
    setEditingMessage(null);
    setEditText("");
    setEditHighlights([]);
    setEditTime("");
    setEditImages([]);
    setEditMessageType("text");

    // Reset highlight mode in edit textarea
    if (editHighlightTextareaRef.current) {
      editHighlightTextareaRef.current.resetHighlightMode();
    }

    toast.success("Message updated successfully!");
  };

  const handleEditImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      // Only take the first file to prevent multiple images
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result
        };
        // Replace any existing images with the new one
        setEditImages([newImage]);
      };
      reader.readAsDataURL(file);
    }
    // Reset the input to allow selecting the same file again
    event.target.value = '';
  };

  const removeEditImage = (imageId) => {
    setEditImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleEditMessageChange = (text: string, highlights: HighlightRange[]) => {
    setEditText(text);
    setEditHighlights(highlights);
  };

  // Handle download after email submission
  const handleDownloadAfterEmail = async () => {
    try {
      const canvas = await generateImageCanvas();
      if (!canvas) {
        toast.error('Failed to generate image. Please try again.');
        return;
      }

      // Download with maximum quality
      const link = document.createElement('a');
      link.download = `whatsapp-testimonial-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      toast.success('Chat bubbles downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image. Please try again.');
    }
  };

  // Confetti animation function
  const triggerConfetti = () => {
    // Create multiple confetti bursts for celebration
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti(Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio)
      }));
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  // Handle email submission
  const handleEmailSubmit = async () => {
    if (!userEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setEmailSubmitting(true);
    console.log('Submitting email:', userEmail.trim());
    console.log('Project ID:', projectId);
    console.log('Public Anon Key:', publicAnonKey ? 'Present' : 'Missing');

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a2080617/save-email`;
      console.log('Sending request to:', url);
      
      // Send email to server
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: userEmail.trim(),
          timestamp: new Date().toISOString()
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response content-type:', response.headers.get('content-type'));

      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        
        // Trigger confetti celebration
        triggerConfetti();
        
        // Non-blocking email submission tracking
        setTimeout(() => {
          trackEvent('email_submitted', {
            email_length: userEmail.trim().length,
            trigger_context: downloadCount >= 2 ? 'download_popup' : 'manual_signup'
          });
        }, 0);
        
        // Don't save to localStorage since we're not persisting state
        setEmailSubmitted(true);
        setUserEmail("");
        
        toast.success("Thanks for your interest! You'll be the first to know about new features.");

        // Close dialog after a short delay to let user see the confetti
        setTimeout(() => {
          setEmailDialogOpen(false);
        }, 2000);

        // DON'T continue with download after email submission as per user request
        // setTimeout(() => {
        //   handleDownloadAfterEmail();
        // }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error response:', errorData);
        throw new Error(`Server error: ${errorData.error || 'Failed to save email'}`);
      }
    } catch (error) {
      console.error('Error saving email:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Unable to connect to server. Please check your internet connection and try again.");
      } else {
        toast.error(`Something went wrong: ${error.message}`);
      }
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      // Only take the first file to prevent multiple images
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result
        };
        // Replace any existing images with the new one
        setCurrentImages([newImage]);
      };
      reader.readAsDataURL(file);
    }
    // Reset the input to allow selecting the same file again
    event.target.value = '';
  };

  const handleMessageChange = (text: string, highlights: HighlightRange[]) => {
    setCurrentMessage(text);
    setCurrentHighlights(highlights);
  };

  const addMessage = () => {
    // Validation based on selected message type
    if (selectedMessageType === "text" && !currentMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (selectedMessageType === "image" && currentImages.length === 0) {
      toast.error("Please select an image");
      return;
    }
    if (selectedMessageType === "text-image" && (!currentMessage.trim() || currentImages.length === 0)) {
      toast.error("Please enter a message and select an image");
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: selectedMessageType === "image" ? "" : currentMessage.trim(),
      images: selectedMessageType === "text" ? [] : currentImages.map(img => img.preview),
      time: currentTime,
      type: selectedMessageType,
      highlights: selectedMessageType === "image" ? [] : currentHighlights,
    };

    if (!hasAddedFirstMessage) {
      // Replace the sample message with the first user message
      setMessages([newMessage]);
      setHasAddedFirstMessage(true);
      
      // Non-blocking first message tracking
      setTimeout(() => {
        trackEvent('first_message_added', {
          message_type: selectedMessageType,
          platform: selectedPlatform,
          has_highlights: currentHighlights.length > 0,
          text_length: currentMessage.length
        });
      }, 0);
    } else {
      // Add to existing messages
      setMessages([...messages, newMessage]);
      
      // Non-blocking additional message tracking
      setTimeout(() => {
        trackEvent('message_added', {
          message_type: selectedMessageType,
          platform: selectedPlatform,
          message_count: messages.length + 1,
          has_highlights: currentHighlights.length > 0,
          text_length: currentMessage.length
        });
      }, 0);
    }

    // Clear current inputs for the next message and reset highlight mode
    setCurrentMessage("");
    setCurrentHighlights([]);
    setCurrentImages([]);
    
    // Reset highlight mode in the bubble input component
    if (bubbleInputRef.current) {
      bubbleInputRef.current.resetHighlightMode();
    }
    
    // Auto-scroll to preview section on mobile devices
    if (window.innerWidth < 600 && previewSectionRef.current) {
      setTimeout(() => {
        previewSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
    
    toast.success("Message added successfully!");
  };

  const removeImage = (imageId) => {
    setCurrentImages(prev => prev.filter(img => img.id !== imageId));
  };

  const clearMessages = () => {
    // Non-blocking tracking
    setTimeout(() => {
      trackEvent('messages_cleared', {
        message_count: messages.length,
        platform: selectedPlatform
      });
    }, 0);
    
    // Reset to default state
    const freshState = getDefaultState();
    setMessages(freshState.messages);
    setHasAddedFirstMessage(freshState.hasAddedFirstMessage);
    setCurrentMessage(freshState.currentMessage);
    setCurrentHighlights(freshState.currentHighlights);
    setCurrentImages(freshState.currentImages);
    
    toast.success("Reset to default sample!");
  };

  const handleTimeChange = (event) => {
    const timeValue = event.target.value;
    setCurrentTime(timeValue);
  };

  const handleEditTimeChange = (event) => {
    const timeValue = event.target.value;
    setEditTime(timeValue);
  };

  // UPDATED: Format time for display with am/pm (convert from HH:MM to H:MM am/pm format)
  const formatTimeForDisplay = (time24) => {
    if (!time24) return "5:07 pm";
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'pm' : 'am';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Convert display time back to 24-hour format for input
  const formatTimeForInput = (displayTime) => {
    if (!displayTime) return "17:07";
    if (displayTime.includes(':') && displayTime.length === 5) {
      return displayTime; // Already in HH:MM format
    }
    // If it's in H:MM format, convert to HH:MM
    const [hours, minutes] = displayTime.split(':');
    const paddedHours = hours.padStart(2, '0');
    return `${paddedHours}:${minutes}`;
  };

  // Handle reordering messages via drag and drop
  const moveMessage = useCallback((dragIndex, hoverIndex) => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      const dragMessage = newMessages[dragIndex];
      newMessages.splice(dragIndex, 1);
      newMessages.splice(hoverIndex, 0, dragMessage);
      return newMessages;
    });
  }, []);



  // Helper function to render text with highlights for React components
  const renderTextWithHighlights = (text: string, highlights: HighlightRange[] = []) => {
    if (!text || highlights.length === 0) {
      return <span>{text}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    sortedHighlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        elements.push(
          <span key={`text-before-${index}`}>
            {text.slice(lastIndex, highlight.start)}
          </span>
        );
      }

      // Add highlighted text with yellow color - with 4px right and bottom padding
      elements.push(
        <span 
          key={highlight.id}
          style={{ 
            backgroundColor: '#FFFF05',
            color: '#000000',
            borderRadius: '2px',
            paddingRight: '4px',
            paddingBottom: '4px'
          }}
        >
          {text.slice(highlight.start, highlight.end)}
        </span>
      );

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-end-${lastIndex}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <>{elements}</>;
  };

  // Canvas-based image generation - always uses desktop resolution for consistent export
  const generateImageCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (messages.length === 0) {
      return null;
    }

    try {
      // Use fixed desktop resolution width instead of current container width
      // This ensures consistent high-quality exports regardless of device size
      const desktopWidth = 480; // Fixed desktop resolution width for consistent exports

      // Create canvas generator
      const generator = new CanvasImageGenerator();

      // Generate the image using canvas with fixed desktop dimensions
      const canvas = await generator.generateImage({
        messages,
        containerWidth: desktopWidth,
        backgroundColor,
        showBackground,
        whatsappBgPattern: imgImage, // Use the WhatsApp background pattern
      });

      // Return the canvas directly (already properly rounded)
      return canvas;
    } catch (error) {
      console.error('Error generating image:', error);
      
      // Show specific error messages
      if (error.message?.includes('No messages')) {
        toast.error('Please add at least one message first');
      } else if (error.message?.includes('container')) {
        toast.error('Image generation failed due to sizing issues. Try adjusting your background settings.');
      } else {
        toast.error('Failed to generate image. Please try again.');
      }
      
      return null;
    }
  };

  // Download functionality
  const handleDownload = async () => {
    if (!hasAddedFirstMessage) {
      toast.error('Please add at least one message first');
      return;
    }

    // Check if this is the second download and email hasn't been submitted
    const newDownloadCount = downloadCount + 1;
    setDownloadCount(newDownloadCount);

    // Non-blocking download tracking
    setTimeout(() => {
      trackEvent('download_started', {
        message_count: messages.length,
        platform: selectedPlatform,
        download_count: newDownloadCount,
        has_background: showBackground
      });
    }, 0);

    // Show email popup on second download if user hasn't submitted email yet
    if (newDownloadCount === 2 && !emailSubmitted) {
      setEmailDialogOpen(true);
      setTimeout(() => {
        trackEvent('email_popup_shown', { trigger: 'second_download' });
      }, 0);
      return; // Don't proceed with download, show popup first
    }

    setDownloadLoading(true);
    try {
      const canvas = await generateImageCanvas();
      if (!canvas) {
        toast.error('Failed to generate image. Please try again.');
        trackEvent('download_failed', { reason: 'canvas_generation_failed' });
        return;
      }

      // Download with maximum quality
      const link = document.createElement('a');
      link.download = `whatsapp-testimonial-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      // Non-blocking success tracking
      setTimeout(() => {
        trackEvent('download_completed', {
          message_count: messages.length,
          platform: selectedPlatform,
          download_count: newDownloadCount,
          has_background: showBackground
        });
      }, 0);

      toast.success('Chat bubbles downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      // Non-blocking error tracking
      setTimeout(() => {
        trackEvent('download_failed', { 
          reason: 'generation_error',
          error: error.message 
        });
      }, 0);
      toast.error('Failed to download image. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };



  // Generate iframe HTML content that exactly matches the preview
  const generateIframeHTML = () => {
    // FIXED: Create a more accurate WhatsApp background pattern that matches the actual design
    const whatsappBackgroundSVG = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="whatsapp-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <!-- Base background -->
          <rect width="120" height="120" fill="#E5DDD5"/>
          <!-- Dot pattern that matches WhatsApp's actual background -->
          <circle cx="30" cy="30" r="1" fill="white" opacity="0.4"/>
          <circle cx="90" cy="90" r="1" fill="white" opacity="0.4"/>
          <circle cx="30" cy="90" r="0.8" fill="white" opacity="0.3"/>
          <circle cx="90" cy="30" r="0.8" fill="white" opacity="0.3"/>
          <circle cx="60" cy="15" r="0.6" fill="white" opacity="0.25"/>
          <circle cx="15" cy="60" r="0.6" fill="white" opacity="0.25"/>
          <circle cx="105" cy="60" r="0.6" fill="white" opacity="0.25"/>
          <circle cx="60" cy="105" r="0.6" fill="white" opacity="0.25"/>
          <!-- Additional texture dots -->
          <circle cx="45" cy="45" r="0.5" fill="white" opacity="0.2"/>
          <circle cx="75" cy="75" r="0.5" fill="white" opacity="0.2"/>
          <circle cx="15" cy="15" r="0.4" fill="white" opacity="0.15"/>
          <circle cx="105" cy="105" r="0.4" fill="white" opacity="0.15"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#whatsapp-pattern)"/>
    </svg>`;

    // Convert messages to HTML that exactly matches the React preview
    const messagesHTML = messages.map(message => {
      if (message.type === "text") {
        const textWithHighlights = renderTextWithHighlightsHTML(message.text, message.highlights || []);
        return `
          <div style="display: flex; justify-content: flex-start; width: 100%; margin-bottom: 8px;">
            <div style="position: relative; max-width: 320px;">
              <div style="position: absolute; left: 0; top: 0; width: 8px; height: 13px; z-index: 50;">
                <svg style="display: block; width: 100%; height: 100%;" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
                  <path d="M1.533 2.568L8 11.193V0H2.812C1.042 0 0.474 1.156 1.533 2.568Z" fill="white"/>
                </svg>
              </div>
              <div class="message-bubble" style="background-color: white; border-radius: 7.5px; border-top-left-radius: 0px; margin-left: 8px; position: relative; display: flex; align-items: flex-start; padding: 8px;">
                <div style="display: flex; align-items: flex-end; gap: 8px; width: 100%;">
                  <div style="color: #111b21; font-size: 14.2px; line-height: 19px; white-space: normal; word-break: break-word; font-family: 'Helvetica Neue', sans-serif; max-width: 240px; word-wrap: break-word; overflow-wrap: break-word; padding: 4px 0; margin: 0;">
                    ${textWithHighlights}
                  </div>
                  <div style="flex-shrink: 0; align-self: flex-end;">
                    <span style="color: #667781; font-size: 11px; line-height: 15px; white-space: nowrap; font-family: 'Helvetica Neue', sans-serif; margin: 0; padding: 0; vertical-align: bottom;">
                      ${formatTimeForDisplay(message.time)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      } else if (message.type === "image" && message.images && message.images[0]) {
        return `
          <div style="display: flex; justify-content: flex-start; width: 100%; margin-bottom: 8px;">
            <div style="position: relative; max-width: 320px;">
              <div style="position: absolute; left: 0; top: 0; width: 8px; height: 13px; z-index: 50;">
                <svg style="display: block; width: 100%; height: 100%;" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
                  <path d="M1.533 2.568L8 11.193V0H2.812C1.042 0 0.474 1.156 1.533 2.568Z" fill="white"/>
                </svg>
              </div>
              <div class="message-bubble" style="background-color: white; border-radius: 7.5px; border-top-left-radius: 0px; margin-left: 8px; display: flex; align-items: flex-start; padding: 8px;">
                <div style="position: relative;">
                  <img src="${message.images[0]}" alt="Message" style="width: 100%; height: auto; object-fit: cover; border-radius: 6px; background-color: #f3f4f6; max-height: 400px; max-width: 280px;"/>
                  <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 28px; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent); border-radius: 0 0 6px 6px;"></div>
                  <div style="position: absolute; bottom: 8px; right: 8px;">
                    <span style="color: rgba(255,255,255,0.9); font-size: 10px; line-height: 15px; white-space: nowrap; font-family: 'Helvetica Neue', sans-serif;">
                      ${formatTimeForDisplay(message.time)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      } else if (message.type === "text-image" && message.images && message.images[0]) {
        const textWithHighlights = message.text ? renderTextWithHighlightsHTML(message.text, message.highlights || []) : '';
        return `
          <div style="display: flex; justify-content: flex-start; width: 100%; margin-bottom: 8px;">
            <div style="position: relative; max-width: 320px;">
              <div style="position: absolute; left: 0; top: 0; width: 8px; height: 13px; z-index: 50;">
                <svg style="display: block; width: 100%; height: 100%;" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
                  <path d="M1.533 2.568L8 11.193V0H2.812C1.042 0 0.474 1.156 1.533 2.568Z" fill="white"/>
                </svg>
              </div>
              <div class="message-bubble" style="background-color: white; border-radius: 7.5px; border-top-left-radius: 0px; margin-left: 8px; display: flex; align-items: flex-start; padding: 8px;">
                <div style="width: 100%;">
                  <img src="${message.images[0]}" alt="Message" style="width: 100%; height: auto; object-fit: cover; border-radius: 6px; background-color: #f3f4f6; margin-bottom: 8px; max-height: 400px; max-width: 280px; display: block;"/>
                  ${message.text ? `
                    <div style="font-family: 'Helvetica Neue', sans-serif; font-size: 14.2px; line-height: 19px; color: #111b21; max-width: 288px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; padding: 2px 0; margin: 0;">
                      ${textWithHighlights}
                    </div>
                  ` : ''}
                  <div style="text-align: right; margin-top: 12px;">
                    <span style="color: #667781; font-size: 11px; line-height: 15px; white-space: nowrap; font-family: 'Helvetica Neue', sans-serif; margin: 0; padding: 0; align-self: flex-end; vertical-align: bottom;">
                      ${formatTimeForDisplay(message.time)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      return '';
    }).join('');

    // Generate complete HTML document - FIXED: Proper height wrapping and background embedding
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhatsApp Testimonial</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: transparent;
      padding: 16px;
      /* FIXED: Remove min-height and centering to allow natural height wrapping */
      width: 100%;
    }
    .testimonial-container {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      /* FIXED: Only apply background styles when showBackground is true */
      ${showBackground ? `
        background-color: ${backgroundColor};
        padding: 16px;
        border-radius: 16px;
      ` : ''}
    }
    .chat-container {
      background-color: #efeae2;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      padding: 35px 12px 40px 12px;
      /* FIXED: Remove min-height to allow natural content wrapping */
      width: 100%;
      /* FIXED: Always include container shadow to match preview exactly */
      ${showBackground ? '' : 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);'}
    }
    .chat-background {
      position: absolute;
      inset: 0;
      /* FIXED: Use the enhanced WhatsApp pattern with proper encoding */
      background-image: url('data:image/svg+xml;charset=utf8,${encodeURIComponent(whatsappBackgroundSVG)}');
      background-size: 120px 120px;
      background-repeat: repeat;
      opacity: 0.4;
      z-index: 1;
    }
    .messages {
      position: relative;
      z-index: 10;
      width: 100%;
    }
    /* FIXED: Ensure individual message bubbles have proper shadows */
    .message-bubble {
      box-shadow: 0px 1px 0.5px 0px rgba(11,20,26,0.13);
    }
    .highlight {
      background-color: #FFFF05;
      color: #000000;
      border-radius: 2px;
      padding-right: 4px;
      padding-bottom: 4px;
    }
  </style>
  <script>
    // Auto-resize iframe height to match content
    window.addEventListener('load', function() {
      const height = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      
      // Send height to parent iframe
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'iframe-height',
          height: height
        }, '*');
      }
    });
    
    // Also send resize messages when content changes
    const resizeObserver = new ResizeObserver(() => {
      const height = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'iframe-height',
          height: height
        }, '*');
      }
    });
    
    resizeObserver.observe(document.body);
  </script>
</head>
<body>
  <div class="testimonial-container">
    <div class="chat-container">
      <div class="chat-background"></div>
      <div class="messages">
        ${messagesHTML}
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  // Helper function to render text with highlights for HTML
  const renderTextWithHighlightsHTML = (text: string, highlights: HighlightRange[] = []) => {
    if (!text || highlights.length === 0) {
      return text;
    }

    let result = '';
    let lastIndex = 0;

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    sortedHighlights.forEach((highlight) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        result += text.slice(lastIndex, highlight.start);
      }

      // Add highlighted text
      result += `<span class="highlight">${text.slice(highlight.start, highlight.end)}</span>`;
      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result += text.slice(lastIndex);
    }

    return result;
  };

  // Generate iframe embed code - FIXED: Remove fixed height to allow content wrapping
  const generateIframeEmbedCode = () => {
    const html = generateIframeHTML();
    const encodedHtml = encodeURIComponent(html);
    const dataUri = `data:text/html;charset=utf-8,${encodedHtml}`;
    
    // FIXED: Generate iframe with simplified auto-resize functionality
    const iframeId = `testimonial-iframe-${Date.now()}`;
    return `<iframe 
      id="${iframeId}" 
      src="${dataUri}" 
      width="100%" 
      style="border-radius: 12px; max-width: 520px; border: none; min-height: 200px; overflow: hidden;" 
      scrolling="no"
      onload="try { this.style.height = (this.contentWindow.document.body.scrollHeight + 16) + 'px'; } catch(e) { console.log('Height auto-resize blocked by browser security'); }"
    ></iframe>`;
  };

  // Copy iframe code with improved fallback system
  const copyIframeCode = async () => {
    const iframeCode = generateIframeEmbedCode();
    
    // Non-blocking iframe tracking
    setTimeout(() => {
      trackEvent('iframe_copy_started', {
        message_count: messages.length,
        platform: selectedPlatform
      });
    }, 0);
    
    // Skip Clipboard API entirely due to permission policy issues
    // Go straight to more reliable methods
    
    // Method 1: Enhanced execCommand approach
    const tryExecCommand = () => {
      try {
        // Create a more visible textarea for better compatibility
        const textArea = document.createElement('textarea');
        textArea.value = iframeCode;
        
        // Position the textarea in a way that works across all browsers
        textArea.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          width: 300px;
          height: 100px;
          margin-left: -150px;
          margin-top: -50px;
          border: 1px solid #ccc;
          background: white;
          z-index: 10000;
          font-size: 12px;
          padding: 8px;
        `;
        
        document.body.appendChild(textArea);
        
        // Focus, select and copy
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, iframeCode.length);
        
        // Execute copy command
        const successful = document.execCommand('copy');
        
        // Clean up immediately
        document.body.removeChild(textArea);
        
        return successful;
      } catch (error) {
        console.warn('execCommand method failed:', error);
        return false;
      }
    };

    // Try execCommand first
    if (tryExecCommand()) {
      trackEvent('iframe_copy_completed', { method: 'exec_command' });
      toast.success('Iframe code copied to clipboard!');
      return;
    }

    // Method 2: Show manual copy modal (always works)
    try {
      // Remove any existing modals first
      const existingModals = document.querySelectorAll('.iframe-copy-modal');
      existingModals.forEach(modal => modal.remove());
      
      // Create backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'iframe-copy-modal';
      backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
        animation: fadeIn 0.2s ease-out;
      `;
      
      // Create modal content
      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        padding: 28px;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        max-width: 650px;
        width: 100%;
        max-height: 90vh;
        overflow: auto;
        position: relative;
        animation: fadeIn 0.3s ease-out;
      `;
      
      modal.innerHTML = `
        <div style="margin-bottom: 20px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
          <h3 style="margin: 0 0 12px 0; font-weight: bold; color: #111; font-size: 24px;">Copy Your Iframe Code</h3>
          <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
            Your embed code is ready! Click "Select All" then copy with <strong>Ctrl+C</strong> (or <strong>⌘+C</strong> on Mac)
          </p>
        </div>
        <div style="position: relative; margin-bottom: 24px;">
          <textarea id="iframe-code-textarea" readonly style="
            width: 100%;
            height: 160px;
            padding: 16px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-family: 'Monaco', 'Menlo', 'SF Mono', 'Consolas', monospace;
            font-size: 12px;
            line-height: 1.5;
            resize: none;
            background: #f8fafc;
            color: #374151;
            box-sizing: border-box;
            word-wrap: break-word;
          ">${iframeCode}</textarea>
          <button id="select-all-btn" style="
            position: absolute;
            top: 12px;
            right: 12px;
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">Select All</button>
        </div>
        <div style="display: flex; gap: 12px; justify-content: space-between;">
          <button id="copy-done-btn" style="
            background: #059669;
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 10px;
            font-size: 16px;
            cursor: pointer;
            font-weight: 600;
            flex: 1;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">✅ I've Copied It!</button>
          <button id="close-modal-btn" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 10px;
            font-size: 16px;
            cursor: pointer;
            font-weight: 600;
            min-width: 100px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">Close</button>
        </div>
      `;
      
      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);
      
      // Get elements
      const textarea = modal.querySelector('#iframe-code-textarea');
      const selectAllBtn = modal.querySelector('#select-all-btn');
      const copyDoneBtn = modal.querySelector('#copy-done-btn');
      const closeBtn = modal.querySelector('#close-modal-btn');
      
      // Auto-select text on modal open with delay for better compatibility
      setTimeout(() => {
        try {
          textarea.focus();
          textarea.select();
          if (textarea.setSelectionRange) {
            textarea.setSelectionRange(0, textarea.value.length);
          }
        } catch (error) {
          console.log('Auto-select failed, user will need to manually select');
        }
      }, 200);
      
      // Select all button functionality - more aggressive selection
      selectAllBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          textarea.focus();
          textarea.select();
          if (textarea.setSelectionRange) {
            textarea.setSelectionRange(0, textarea.value.length);
          }
          // Change button text to indicate selection
          selectAllBtn.textContent = 'Selected! Copy Now';
          selectAllBtn.style.background = '#059669';
          setTimeout(() => {
            selectAllBtn.textContent = 'Select All';
            selectAllBtn.style.background = '#8b5cf6';
          }, 2000);
        } catch (error) {
          console.log('Manual select failed');
        }
      };
      
      // Copy done button - show success and close
      copyDoneBtn.onclick = () => {
        backdrop.remove();
        trackEvent('iframe_copy_completed', { method: 'manual_copy_modal' });
        toast.success('🎉 Perfect! Your iframe code is ready to paste on your website!');
      };
      
      // Close button
      closeBtn.onclick = () => {
        backdrop.remove();
      };
      
      // Close on backdrop click
      backdrop.onclick = (e) => {
        if (e.target === backdrop) {
          backdrop.remove();
        }
      };
      
      // Close on Escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          backdrop.remove();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      // Show instruction message
      toast.success('📋 Copy modal opened! Select the code and copy it.', {
        duration: 3000
      });
      
    } catch (error) {
      console.error('Manual selection modal failed:', error);
      // Ultimate fallback - browser prompt
      try {
        const result = prompt('Copy this iframe code (select all and copy):', iframeCode);
        if (result !== null) {
          toast.success('Code displayed! Copy it from the prompt.');
        }
      } catch (promptError) {
        console.error('Even prompt failed:', promptError);
        toast.error('Unable to copy. Please try refreshing the page.');
      }
    }
  };

  // Enhanced Web Share API Level 2 with clipboard integration
  const handleShare = async () => {
    if (!hasAddedFirstMessage) {
      toast.error('Please add at least one message first');
      return;
    }

    // Non-blocking share tracking
    setTimeout(() => {
      trackEvent('share_started', {
        message_count: messages.length,
        platform: selectedPlatform,
        has_background: showBackground
      });
    }, 0);

    try {
      const canvas = await generateImageCanvas();
      if (!canvas) {
        toast.error('Failed to generate image for sharing.');
        trackEvent('share_failed', { reason: 'canvas_generation_failed' });
        return;
      }

      // Convert canvas to blob with maximum quality
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png', 1.0);
      });

      // Create file from blob
      const file = new File([blob], `whatsapp-testimonial-${Date.now()}.png`, {
        type: 'image/png',
      });

      // Enhanced Web Share API Level 2 implementation
      if (navigator.share && navigator.canShare) {
        try {
          // First try sharing with files (Level 2)
          const shareData = {
            title: 'WhatsApp Testimonial',
            text: 'Check out this awesome testimonial I created with WhatsApp Testimonial Maker!',
            files: [file],
          };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            trackEvent('share_completed', { method: 'native_share_with_files' });
            toast.success('Image shared successfully!');
            return;
          }
        } catch (shareError) {
          // If file sharing fails, try without files
          console.log('File sharing not supported, trying without files');
        }

        // Fallback to text-only sharing
        try {
          const textShareData = {
            title: 'WhatsApp Testimonial',
            text: 'Check out this awesome testimonial I created with WhatsApp Testimonial Maker!',
            url: window.location.href,
          };

          await navigator.share(textShareData);
          
          // Also copy image to clipboard if possible
          if (navigator.clipboard && navigator.clipboard.write) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  'image/png': blob
                })
              ]);
              trackEvent('share_completed', { method: 'native_share_with_clipboard' });
              toast.success('Link shared and image copied to clipboard!');
            } catch (clipboardError) {
              trackEvent('share_completed', { method: 'native_share_text_only' });
              toast.success('Link shared successfully!');
            }
          } else {
            trackEvent('share_completed', { method: 'native_share_text_only' });
            toast.success('Link shared successfully!');
          }
          return;
        } catch (textShareError) {
          console.log('Text sharing also failed, falling back to clipboard');
        }
      }

      // Fallback: Clipboard API Level 2 implementation
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          // Try to write both image and text to clipboard
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
              'text/plain': new Blob(['Check out this awesome testimonial I created with WhatsApp Testimonial Maker!'], { type: 'text/plain' })
            })
          ]);
          toast.success('Image and text copied to clipboard! You can now paste it anywhere.');
          return;
        } catch (clipboardError) {
          // If writing both fails, try image only
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            toast.success('Image copied to clipboard! You can now paste it anywhere.');
            return;
          } catch (imageClipboardError) {
            console.log('Clipboard image write failed, trying text fallback');
          }
        }
      }

      // Final fallback: Download + text clipboard
      const link = document.createElement('a');
      link.download = `whatsapp-testimonial-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      // Try to copy share text to clipboard
      const shareText = 'Check out this awesome testimonial I created with WhatsApp Testimonial Maker!';
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Image downloaded and share text copied to clipboard!');
      } catch {
        toast.success('Image downloaded! Share it on your social media platforms.');
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share image. Please try again.');
      }
    }
  };



  return (
    <DndProvider backend={HTML5Backend}>
      <DocumentHead />
      {/* Bright Yellow Website Background */}
      <div style={websiteBackgroundStyle}>
        {/* WebBg - Positioned behind header content but visible - FIXED z-index */}
        <div className="fixed top-0 left-0 w-full h-auto pointer-events-none z-[8]">
          <div className="w-full h-auto flex justify-center">
            <div className="relative w-full max-w-none" style={{ 
              aspectRatio: '1186/223',
              backgroundImage: 'url(figma:asset/a38136d428a1d44a8425fb3dc00d2c4bf83b16da.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center top',
              minHeight: '200px',
              height: 'auto'
            }}>
            </div>
          </div>
        </div>

        {/* Background Image Overlay removed as per user request */}

        {/* Semi-transparent yellow overlay */}
        <div style={overlayBackgroundStyle}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-[81px] max-[600px]:pt-[32px] pb-8">
          {/* Hero Section */}
          <div className="text-center mb-[42px] mt-[0px] mr-[0px] ml-[0px] opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
            {/* Mobile logo - shows above tagline on screens < 600px */}
            <div className="block min-[600px]:hidden mb-5">
              <div 
                className="w-16 h-16 mx-auto rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setEmailDialogOpen(true)}
                title="Get updates on new features"
              >
                <img src={logoImage} alt="Testimonial Maker" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Tagline above main title */}
            <p className="text-sm md:text-base text-[rgba(9,10,9,1)] mb-[-13px] italic font-light font-[Fira_Mono] text-[16px] mt-[0px] mr-[0px] ml-[0px]">
              Trusted by creators ❤️
            </p>
            
            {/* Grouped heading content with 24px additional spacing */}
            <div className="mt-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-[Anton] text-center" style={{ lineHeight: '1.5' }}>
                <span className="min-[601px]:hidden">Create Testimonials Instantly – Templates, Images & WhatsApp Style</span>
                <span className="hidden min-[601px]:inline">Create Testimonials Instantly – Templates, <br />Images & WhatsApp Style</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Design professional client testimonial templates, generate testimonial images, and even create WhatsApp-style reviews in seconds – free and easy.
              </p>

              {/* Start Creating Now Button */}
              <div className="mb-8">
                <div
                  onClick={() => {
                    // Scroll to the tab section with 20% offset above current position
                    if (tabContentRef.current) {
                      const element = tabContentRef.current;
                      const elementRect = element.getBoundingClientRect();
                      const currentScrollY = window.pageYOffset;
                      
                      // Calculate where the element would be positioned at the top of viewport
                      const targetScrollY = currentScrollY + elementRect.top;
                      
                      // Adjust 20% higher (reduce scroll distance by 20% of viewport height)
                      const viewportHeight = window.innerHeight;
                      const adjustedScrollY = targetScrollY - (viewportHeight * 0.2);
                      
                      window.scrollTo({ 
                        top: Math.max(0, adjustedScrollY), // Ensure we don't scroll negative
                        behavior: 'smooth' 
                      });
                    }
                  }}
                  className="inline-block bg-[#04a444] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[56px] cursor-pointer transition-all duration-200 hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px] px-8"
                >
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="box-border content-stretch flex gap-2.5 items-center justify-center px-4 py-3 relative size-full">
                      <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[18px] text-nowrap">
                        <p className="leading-[normal] whitespace-pre">Start Creating Now</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-scrolling Testimonial Gallery with responsive padding */}
          <div className="py-8 max-[600px]:py-2 mb-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
            <Autoscroll />
          </div>



          {/* Custom Tab Container - Removed Drop Shadow & Responsive Font Size */}
          <div className="mb-12 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
            {/* Tabs - Removed shadow-lg & Added Responsive Font Size */}
            <div className="flex items-center justify-center mb-[30px] px-4">
              <div 
                className="relative rounded-[10000px] p-[11px] w-full max-w-full min-[800px]:w-[600px] min-[800px]:max-w-[600px]"
                style={{ backgroundColor: '#EBF7EB' }}
              >
                <div className="flex gap-2 w-full">
                  {/* Tab Button 1 - Create a new testimonial - Responsive Font Size */}
                  <button
                    onClick={() => {
                      setActiveTab("testimony-maker");
                      // Non-blocking tracking
                      setTimeout(() => {
                        trackEvent('tab_switched', { tab: 'testimony-maker', source: 'user_click' });
                      }, 0);
                    }}
                    className={`relative rounded-[30px] transition-all duration-300 leading-[1.3] flex-1 ${
                      activeTab === "testimony-maker" 
                        ? "bg-[#fbdb49] text-black border border-black shadow-[0px_4px_0px_0px_#000000]" 
                        : "bg-transparent text-black hover:bg-gray-50"
                    }`}
                    style={{ 
                      fontFamily: 'Inter', 
                      fontWeight: 600,
                      fontSize: window.innerWidth < 600 ? '14px' : '16px', // 14px for mobile (<600px), 16px for larger screens
                      height: '58px',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      paddingTop: '5px',
                      paddingBottom: '5px',
                      textAlign: 'center',
                      whiteSpace: 'normal',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '0',
                      wordWrap: 'break-word',
                      hyphens: 'auto'
                    }}
                  >
                    <span className="block max-w-full leading-[1.3]">
                      Create a new testimonial
                    </span>
                  </button>

                  {/* Tab Button 2 - Highlight words in screenshot - Responsive Font Size */}
                  <button
                    onClick={() => {
                      setActiveTab("screenshot-highlighter");
                      // Non-blocking tracking
                      setTimeout(() => {
                        trackEvent('tab_switched', { tab: 'screenshot-highlighter', source: 'user_click' });
                      }, 0);
                    }}
                    className={`relative rounded-[30px] transition-all duration-300 leading-[1.3] flex-1 ${
                      activeTab === "screenshot-highlighter" 
                        ? "bg-[#fbdb49] text-black border border-black shadow-[0px_4px_0px_0px_#000000]" 
                        : "bg-transparent text-black hover:bg-gray-50"
                    }`}
                    style={{ 
                      fontFamily: 'Inter', 
                      fontWeight: 600,
                      fontSize: window.innerWidth < 600 ? '14px' : '16px', // 14px for mobile (<600px), 16px for larger screens
                      height: '58px',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      paddingTop: '5px',
                      paddingBottom: '5px',
                      textAlign: 'center',
                      whiteSpace: 'normal',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '0',
                      wordWrap: 'break-word',
                      hyphens: 'auto'
                    }}
                  >
                    <span className="block max-w-full leading-[1.3]">
                      Highlight words in screenshot
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div ref={tabContentRef}>
            {activeTab === "testimony-maker" && (
              <div className="space-y-8">
                <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
                  {/* Input Panel */}
                  <div className="lg:w-1/2">
                    <Card className="p-6 pt-10 pb-10 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      {/* H2 with explicit Tailwind classes for full customization */}
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        ✍️ Write your testimonial
                      </h2>

                      <div className="space-y-6">
                        {/* Platform Selection - Full Width */}
                        <div>
                          <label className="block text-sm font-medium mb-3">
                            Choose Platform
                          </label>
                          <div className="relative" ref={platformDropdownRef}>
                            <button
                              onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                              className="w-full p-3 rounded-xl border border-[#D5E7D5] focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none bg-white text-left flex items-center justify-between transition-all duration-200 hover:border-gray-300"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {platforms[selectedPlatform].logo && (
                                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                    <img 
                                      src={platforms[selectedPlatform].logo} 
                                      alt={platforms[selectedPlatform].name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <span className="text-gray-900 font-medium truncate">
                                  {platforms[selectedPlatform].name}
                                </span>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${platformDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {platformDropdownOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5E7D5] rounded-xl shadow-lg z-50 overflow-hidden">
                                {Object.entries(platforms).map(([key, platform]) => (
                                  <button
                                    key={key}
                                    onClick={() => {
                                      if (platform.available) {
                                        setSelectedPlatform(key as Platform);
                                        setPlatformDropdownOpen(false);
                                        // Non-blocking tracking with debouncing handled in trackEvent
                                        trackEvent('platform_selected', { 
                                          platform: key,
                                          previous_platform: selectedPlatform 
                                        });
                                      } else {
                                        trackEvent('platform_unavailable_clicked', { platform: key });
                                        toast.info(`${platform.name} is coming soon! 🚀`);
                                      }
                                    }}
                                    className={`relative w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 ${
                                      !platform.available ? 'opacity-75 cursor-default' : 'cursor-pointer'
                                    } ${selectedPlatform === key ? 'bg-green-50' : ''}`}
                                  >
                                    {/* Coming Soon Tag - Positioned over the right side */}
                                    {!platform.available && (
                                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10 shadow-lg">
                                        Coming Soon
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center gap-3">
                                      {platform.logo && (
                                        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                          <img 
                                            src={platform.logo} 
                                            alt={platform.name}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      )}
                                      <div className="flex flex-col">
                                        <span className={`font-medium ${
                                          selectedPlatform === key && platform.available ? 'text-green-700' : 'text-gray-700'
                                        }`}>
                                          {platform.name}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {selectedPlatform === key && platform.available && (
                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                          <Check className="w-2.5 h-2.5 text-white" />
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Text Input Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium">
                              Type what your happy customer said...
                            </label>
                            {(selectedMessageType === "text" || selectedMessageType === "text-image") && (
                              <TextExtractor 
                                onExtractedText={handleExtractedText}
                                className="flex-shrink-0"
                                compact={true}
                              />
                            )}
                          </div>

                          {/* Text Input Container with Integrated Message Type Dropdown */}
                          <div className="relative border border-[#D5E7D5] rounded-xl bg-white overflow-hidden">
                            {/* Message Type Selection - Top Section */}
                            <div className="border-b border-gray-100">
                              <div className="relative" ref={messageTypeDropdownRef}>
                                <button
                                  onClick={() => setMessageTypeDropdownOpen(!messageTypeDropdownOpen)}
                                  className="w-full p-3 bg-gray-50 text-left flex items-center justify-between transition-all duration-200 hover:bg-gray-100"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-lg flex-shrink-0">{messageTypes[selectedMessageType].icon}</span>
                                    <span className="text-gray-900 font-medium truncate">
                                      {messageTypes[selectedMessageType].name}
                                    </span>
                                  </div>
                                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${messageTypeDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu - Fixed Position Overlay to Prevent Clipping */}
                                {messageTypeDropdownOpen && (
                                  <>
                                    {/* Backdrop */}
                                    <div 
                                      className="fixed inset-0 bg-black/20 z-[60] rounded-[24px]"
                                      onClick={() => setMessageTypeDropdownOpen(false)}
                                    />
                                    
                                    {/* Dropdown Options - Fixed Position to Avoid Clipping */}
                                    <div className="fixed z-[70] bg-white border border-[#D5E7D5] rounded-[24px] shadow-2xl overflow-hidden max-w-sm w-[90vw] opacity-0 animate-[fadeIn_0.15s_ease-out_forwards]"
                                         style={{
                                           top: '50%',
                                           left: '50%',
                                           transform: 'translate(-50%, -50%)'
                                         }}>
                                      <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                          <span className="text-xl">💬</span>
                                          Choose Message Type
                                        </h3>
                                        
                                        <div className="space-y-2">
                                          {Object.entries(messageTypes).map(([key, messageType]) => (
                                            <button
                                              key={key}
                                              onClick={() => {
                                                const previousType = selectedMessageType;
                                                setSelectedMessageType(key as "text" | "image" | "text-image");
                                                setMessageTypeDropdownOpen(false);
                                                
                                                // Non-blocking tracking with debouncing handled in trackEvent
                                                trackEvent('message_type_selected', {
                                                  message_type: key,
                                                  previous_type: previousType
                                                });
                                                
                                                // Clear current inputs when switching types
                                                if (key === "image") {
                                                  setCurrentMessage("");
                                                  setCurrentHighlights([]);
                                                } else if (key === "text") {
                                                  setCurrentImages([]);
                                                }
                                              }}
                                              className={`w-full p-4 text-left flex items-center justify-between rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                                                selectedMessageType === key 
                                                  ? 'border-green-500 bg-green-50 shadow-md' 
                                                  : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                              }`}
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                  <span className="text-xl">{messageType.icon}</span>
                                                </div>
                                                <div>
                                                  <span className={`font-semibold block ${
                                                    selectedMessageType === key ? 'text-green-700' : 'text-gray-900'
                                                  }`}>
                                                    {messageType.name}
                                                  </span>
                                                  <span className="text-sm text-gray-500">
                                                    {messageType.description}
                                                  </span>
                                                </div>
                                              </div>
                                              {selectedMessageType === key && (
                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                  <Check className="w-4 h-4 text-white" />
                                                </div>
                                              )}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Text Input - Only show for text and text-image types */}
                            {(selectedMessageType === "text" || selectedMessageType === "text-image") && (
                              <div ref={testimonyTextareaRef} className="p-0">
                                <HighlightableTextarea
                                  ref={highlightTextareaRef}
                                  value={currentMessage}
                                  onChange={handleMessageChange}
                                  highlights={currentHighlights}
                                  placeholder="Enter your testimonial message..."
                                  className="border-0 rounded-none rounded-b-xl focus:border-0 focus:ring-0 resize-none"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Image Upload - Only show for image and text-image types */}
                        {(selectedMessageType === "image" || selectedMessageType === "text-image") && (
                          <ImageUploadArea 
                            currentImages={currentImages}
                            onImageUpload={handleImageUpload}
                            onRemoveImage={removeImage}
                            fileInputRef={fileInputRef}
                            messageType={selectedMessageType}
                          />
                        )}

                        <div 
                          onClick={() => timeInputRef.current?.click()}
                          className="cursor-pointer"
                        >
                          <label 
                            className="block text-sm font-medium mb-2 cursor-pointer"
                            onClick={() => timeInputRef.current?.click()}
                          >
                            Pick a time
                          </label>
                          <div 
                            className="relative w-full"
                            onClick={() => timeInputRef.current?.click()}
                          >
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-10 pointer-events-none" />
                            <input
                              ref={timeInputRef}
                              type="time"
                              value={formatTimeForInput(currentTime)}
                              onChange={handleTimeChange}
                              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D5E7D5] focus:border-green-500 focus:ring-green-500 focus:outline-none bg-white cursor-pointer"
                              style={{ colorScheme: 'light' }}
                            />
                          </div>
                        </div>

                        {/* Add to Chat Button - Figma Style */}
                        <div
                          onClick={addMessage}
                          className="w-full bg-[#04a444] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[49px] cursor-pointer transition-all duration-200 hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px]"
                        >
                          <div className="flex flex-row items-center justify-center relative size-full">
                            <div className="box-border content-stretch flex gap-2.5 items-center justify-center px-4 py-3 relative size-full">
                              <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-nowrap">
                                <p className="leading-[normal] whitespace-pre"> + Add to Chat</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Preview Panel - Simplified Structure */}
                  <div ref={previewSectionRef} className="lg:w-1/2">
                    <Card className="p-6 pt-10 pb-6 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">


                      {/* Subtitle with instructions - only show when user has added messages */}
                      {hasAddedFirstMessage && (
                        <div className="flex justify-center mb-4">
                          <div className="bg-orange-100 border border-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                            💡 Tap a bubble to edit, delete, or move it.
                          </div>
                        </div>
                      )}

                      {/* Conditional Background Container */}
                      {showBackground ? (
                        // Background Container - Outer container with user's selected background color
                        <div 
                          className="relative rounded-2xl overflow-hidden w-full mb-6 p-4 min-[601px]:p-10"
                          style={{ 
                            backgroundColor: backgroundColor
                          }}
                        >
                          {/* Palette Icon - Top Right Corner, Floating */}
                          <button
                            onClick={() => setShowBackgroundEditor(!showBackgroundEditor)}
                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-20"
                            title="Edit background"
                          >
                            <Palette className="w-4 h-4 text-gray-700" />
                          </button>

                          {/* Message Container - Inner WhatsApp container */}
                          <div 
                            ref={previewContainerRef}
                            className="shadow-xl relative"
                            style={{
                              backgroundColor: '#efeae2',
                              borderRadius: '12px',
                              overflow: 'hidden'
                            }}
                          >
                            {/* WhatsApp Background Pattern */}
                            <div className="absolute inset-0">
                              <WhatsappBackground />
                            </div>

                            {/* Content layer with message padding */}
                            <div 
                              className="relative z-10 px-3 pt-[35px] pb-[40px] overflow-x-auto"
                              style={{
                                minHeight: '120px'
                              }}
                            >
                              <div className="space-y-2 w-full">
                                {messages.map((message, index) => (
                                  <DraggableMessage
                                    key={message.id}
                                    message={message}
                                    index={index}
                                    moveMessage={moveMessage}
                                    onEdit={() => handleEditMessage(message)}
                                    onDelete={() => handleDeleteMessage(message.id)}
                                    containerRef={previewContainerRef}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // No Background - Direct message container
                        <div className="w-full mb-6 relative">
                          {/* Palette Icon - Top Right Corner, Floating */}
                          <button
                            onClick={() => setShowBackgroundEditor(!showBackgroundEditor)}
                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-20"
                            title="Edit background"
                          >
                            <Palette className="w-4 h-4 text-gray-700" />
                          </button>

                          <div 
                            ref={previewContainerRef}
                            className="shadow-xl relative rounded-2xl overflow-hidden"
                            style={{
                              backgroundColor: '#efeae2',
                              borderRadius: '12px'
                            }}
                          >
                            {/* WhatsApp Background Pattern */}
                            <div className="absolute inset-0">
                              <WhatsappBackground />
                            </div>

                            {/* Content layer with message padding */}
                            <div 
                              className="relative z-10 px-3 pt-[35px] pb-[40px] overflow-x-auto"
                              style={{
                                minHeight: '120px'
                              }}
                            >
                              <div className="space-y-2 w-full">
                                {messages.map((message, index) => (
                                  <DraggableMessage
                                    key={message.id}
                                    message={message}
                                    index={index}
                                    moveMessage={moveMessage}
                                    onEdit={() => handleEditMessage(message)}
                                    onDelete={() => handleDeleteMessage(message.id)}
                                    containerRef={previewContainerRef}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Background Editor - Collapsible Section Below Preview */}
                      {showBackgroundEditor && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Background Settings</h3>
                            <button
                              onClick={() => setShowBackgroundEditor(false)}
                              className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Material Design Radio Buttons */}
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-800">
                              Background Options
                            </label>
                            <div className="flex gap-6">
                              {/* Add Background Option */}
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative radio-focus-ring material-ripple">
                                  <input
                                    type="radio"
                                    name="background"
                                    checked={showBackground}
                                    onChange={() => setShowBackground(true)}
                                    className="sr-only"
                                  />
                                  {/* Custom Radio Button */}
                                  <div 
                                    className={`
                                      w-5 h-5 rounded-full border-2 transition-all duration-250 ease-in-out
                                      flex items-center justify-center relative overflow-hidden
                                      ${showBackground 
                                        ? 'border-[#01A444] bg-white' 
                                        : 'border-gray-400 bg-white group-hover:border-[#01A444]'
                                      }
                                    `}
                                  >
                                    {/* Inner dot with enhanced animation */}
                                    <div 
                                      className={`
                                        w-2.5 h-2.5 rounded-full transition-all duration-250 ease-out
                                        ${showBackground 
                                          ? 'bg-[#01A444] scale-100 opacity-100' 
                                          : 'bg-[#01A444] scale-0 opacity-0'
                                        }
                                      `}
                                      style={{
                                        transformOrigin: 'center',
                                      }}
                                    />
                                  </div>
                                </div>
                                <span 
                                  className={`
                                    text-sm font-medium transition-all duration-200 ease-in-out
                                    select-none
                                    ${showBackground 
                                      ? 'text-[#01A444] font-semibold' 
                                      : 'text-gray-700 group-hover:text-[#01A444]'
                                    }
                                  `}
                                >
                                  Add background
                                </span>
                              </label>

                              {/* No Background Option */}
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative radio-focus-ring material-ripple">
                                  <input
                                    type="radio"
                                    name="background"
                                    checked={!showBackground}
                                    onChange={() => setShowBackground(false)}
                                    className="sr-only"
                                  />
                                  {/* Custom Radio Button */}
                                  <div 
                                    className={`
                                      w-5 h-5 rounded-full border-2 transition-all duration-250 ease-in-out
                                      flex items-center justify-center relative overflow-hidden
                                      ${!showBackground 
                                        ? 'border-[#01A444] bg-white' 
                                        : 'border-gray-400 bg-white group-hover:border-[#01A444]'
                                      }
                                    `}
                                  >
                                    {/* Inner dot with enhanced animation */}
                                    <div 
                                      className={`
                                        w-2.5 h-2.5 rounded-full transition-all duration-250 ease-out
                                        ${!showBackground 
                                          ? 'bg-[#01A444] scale-100 opacity-100' 
                                          : 'bg-[#01A444] scale-0 opacity-0'
                                        }
                                      `}
                                      style={{
                                        transformOrigin: 'center',
                                      }}
                                    />
                                  </div>
                                </div>
                                <span 
                                  className={`
                                    text-sm font-medium transition-all duration-200 ease-in-out
                                    select-none
                                    ${!showBackground 
                                      ? 'text-[#01A444] font-semibold' 
                                      : 'text-gray-700 group-hover:text-[#01A444]'
                                    }
                                  `}
                                >
                                  No background
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Background Color Controls - Only show when background is enabled */}
                          {showBackground && (
                            <div className="flex gap-2">
                              {/* Background Color Picker */}
                              <div className="flex-1">
                                <label className="block text-xs font-medium mb-1 text-gray-700">
                                  Background Color
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-green-500"
                                    placeholder="#efeae2"
                                  />
                                </div>
                              </div>

                              {/* Surprise Me Button */}
                              <div className="flex-shrink-0">
                                <label className="block text-xs font-medium mb-1 text-gray-700 opacity-0">
                                  Action
                                </label>
                                <Button
                                  onClick={() => {
                                    const colors = [
                                      '#c8a6a6',
                                      '#c8b4a6',
                                      '#c8c1a6',
                                      '#c1c8a6',
                                      '#b4c8a6',
                                      '#a6c8a6',
                                      '#a6c8b4',
                                      '#a6c8c1',
                                      '#a6c1c8',
                                      '#a6b4c8',
                                      '#a6a6c8',
                                      '#b4a6c8',
                                      '#c1a6c8',
                                      '#c8a6c1',
                                      '#c8a6b4'
                                    ];
                                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                                    setBackgroundColor(randomColor);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 rounded border-purple-500 text-purple-600 hover:bg-purple-50"
                                >
                                  <Shuffle className="w-3 h-3 mr-1" />
                                  Surprise Me
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons - Responsive Layout */}
                      <div className="flex flex-col w-full" style={{ gap: '16px' }}>
                        {/* Primary Action Buttons Row */}
                        <div className="flex gap-2 w-full">
                          {/* Download Button - Dynamic width based on clear button presence */}
                          <div
                            onClick={downloadLoading ? undefined : handleDownload}
                            className={`bg-[#3b82f6] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[48px] transition-all duration-200 ${
                              hasAddedFirstMessage && !downloadLoading
                                ? 'cursor-pointer hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px]' 
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                            style={{ width: hasAddedFirstMessage ? '50%' : '66.67%' }}
                          >
                            <div className="flex flex-row items-center justify-center relative size-full">
                              <div className="box-border content-stretch flex gap-1 items-center justify-center px-2 py-3 relative size-full">
                                {downloadLoading ? (
                                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4 text-white" />
                                )}
                                <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-nowrap">
                                  <p className="leading-[normal] whitespace-pre">
                                    {downloadLoading ? "Generating..." : "Download"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Share Button - Dynamic width based on clear button presence */}
                          <div
                            onClick={handleShare}
                            className={`bg-[#eab308] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[48px] transition-all duration-200 ${
                              hasAddedFirstMessage 
                                ? 'cursor-pointer hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px]' 
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                            style={{ width: hasAddedFirstMessage ? '25%' : '33.33%' }}
                          >
                            <div className="flex flex-row items-center justify-center relative size-full">
                              <div className="box-border content-stretch flex gap-1 items-center justify-center px-2 py-3 relative size-full">
                                <Share2 className="w-4 h-4 text-gray-900" />
                                <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#000000] text-[12px] text-nowrap">
                                  <p className="leading-[normal] whitespace-pre">Share</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Clear All Button - 25% width - Only show when user has added messages */}
                          {hasAddedFirstMessage && (
                            <div
                              onClick={clearMessages}
                              className="bg-[#dc2626] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[48px] cursor-pointer transition-all duration-200 hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px]"
                              style={{ width: '25%' }}
                            >
                              <div className="flex flex-row items-center justify-center relative size-full">
                                <div className="box-border content-stretch flex gap-1 items-center justify-center px-2 py-3 relative size-full">
                                  <Trash2 className="w-4 h-4 text-white" />
                                  <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-nowrap">
                                    <p className="leading-[normal] whitespace-pre">Clear</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>




                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Screenshot Highlighter - Changed from max-w-4xl to max-w-7xl */}
            {activeTab === "screenshot-highlighter" && (
              <div className="space-y-8">
                <div className="max-w-7xl mx-auto">
                  <ScreenshotHighlighter />
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Why Choose Section - Reverted section background, applied background to grid container */}
          <div className="py-16 mb-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.8s_forwards]">
            <div className="text-center max-w-4xl mx-auto px-4">
              <h2 className="text-[27px] md:text-[36px] font-bold text-gray-900 mb-8">
                Why Choose Our Testimonial Maker?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="backdrop-blur-sm p-6 rounded-2xl border border-gray-200 transition-all duration-300 hover:-translate-y-1" style={{ backgroundColor: '#E1EEE0' }}>
                  {/* Mobile layout - icon on left (width <=600px) */}
                  <div className="flex items-start gap-4 min-[601px]:hidden">
                    <div className="flex-shrink-0">
                      <img src={testimonialIcon} alt="Testimonial templates icon" style={{ width: '58px', height: '58px' }} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Ready-to-use testimonial templates
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Save time with designs crafted for websites, social media, and presentations.
                      </p>
                    </div>
                  </div>
                  
                  {/* Desktop layout - icon above, content centered (width >600px) */}
                  <div className="hidden min-[601px]:block text-center">
                    <div className="mx-auto mb-4">
                      <img src={testimonialIcon} alt="Testimonial templates icon" style={{ width: '58px', height: '58px' }} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Ready-to-use testimonial templates
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Save time with designs crafted for websites, social media, and presentations.
                    </p>
                  </div>
                </div>

                <div className="backdrop-blur-sm p-6 rounded-2xl border border-gray-200 transition-all duration-300 hover:-translate-y-1" style={{ backgroundColor: '#E1EEE0' }}>
                  {/* Mobile layout - icon on left (width <=600px) */}
                  <div className="flex items-start gap-4 min-[601px]:hidden">
                    <div className="flex-shrink-0">
                      <img src={createImageIcon} alt="Create testimonial images icon" style={{ width: '58px', height: '58px' }} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Create testimonial images
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Turn feedback into eye-catching visuals perfect for LinkedIn, Instagram, or WhatsApp.
                      </p>
                    </div>
                  </div>
                  
                  {/* Desktop layout - icon above, content centered (width >600px) */}
                  <div className="hidden min-[601px]:block text-center">
                    <div className="mx-auto mb-4">
                      <img src={createImageIcon} alt="Create testimonial images icon" style={{ width: '58px', height: '58px' }} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Create testimonial images
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Turn feedback into eye-catching visuals perfect for LinkedIn, Instagram, or WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="backdrop-blur-sm p-6 rounded-2xl border border-gray-200 transition-all duration-300 hover:-translate-y-1" style={{ backgroundColor: '#E1EEE0' }}>
                  {/* Mobile layout - icon on left (width <=600px) */}
                  <div className="flex items-start gap-4 min-[601px]:hidden">
                    <div className="flex-shrink-0">
                      <img src={clientFormsIcon} alt="Client testimonial forms icon" style={{ width: '58px', height: '58px' }} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Client testimonial forms
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Collect feedback easily and format it beautifully.
                      </p>
                    </div>
                  </div>
                  
                  {/* Desktop layout - icon above, content centered (width >600px) */}
                  <div className="hidden min-[601px]:block text-center">
                    <div className="mx-auto mb-4">
                      <img src={clientFormsIcon} alt="Client testimonial forms icon" style={{ width: '58px', height: '58px' }} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Client testimonial forms
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Collect feedback easily and format it beautifully.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 mb-2 opacity-0 animate-[fadeInUp_0.8s_ease-out_1s_forwards]">
            <p className="text-sm text-gray-600">
              Crafted with ❤️ for creators, by a creator 
            </p>
          </div>
        </div>

        {/* Edit Message Dialog - Figma Style Buttons */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Message
              </DialogTitle>
              <DialogDescription>
                Make changes to your message content, time, and images. Click "Apply Changes" when you're done.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Message Type Selection in Edit Dialog */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type of Message
                </label>
                <div className="flex gap-2">
                  {Object.entries(messageTypes).map(([key, messageType]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setEditMessageType(key as "text" | "image" | "text-image");
                        // Clear fields when switching types
                        if (key === "image") {
                          setEditText("");
                          setEditHighlights([]);
                        } else if (key === "text") {
                          setEditImages([]);
                        }
                      }}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                        editMessageType === key
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300 text-gray-700'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{messageType.icon}</div>
                        <div className="text-xs font-medium">{messageType.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input - Only show for text and text-image types */}
              {(editMessageType === "text" || editMessageType === "text-image") && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message Text
                  </label>
                  <HighlightableTextarea
                    ref={editHighlightTextareaRef}
                    value={editText}
                    onChange={handleEditMessageChange}
                    highlights={editHighlights}
                    placeholder="Enter your testimonial message..."
                    className="border-[#D5E7D5] focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              )}

              <div 
                onClick={() => editTimeInputRef.current?.click()}
                className="cursor-pointer"
              >
                <label 
                  className="block text-sm font-medium mb-2 cursor-pointer"
                  onClick={() => editTimeInputRef.current?.click()}
                >
                  Time
                </label>
                <div 
                  className="relative w-full"
                  onClick={() => editTimeInputRef.current?.click()}
                >
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-10 pointer-events-none" />
                  <input
                    ref={editTimeInputRef}
                    type="time"
                    value={formatTimeForInput(editTime)}
                    onChange={handleEditTimeChange}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D5E7D5] focus:border-green-500 focus:ring-green-500 focus:outline-none bg-white cursor-pointer"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>

              {/* Images - Only show for image and text-image types */}
              {(editMessageType === "image" || editMessageType === "text-image") && (
                <ImageUploadArea 
                  currentImages={editImages}
                  onImageUpload={handleEditImageUpload}
                  onRemoveImage={removeEditImage}
                  fileInputRef={editFileInputRef}
                  messageType={editMessageType}
                />
              )}
            </div>

            <DialogFooter className="flex gap-3">
              {/* Cancel Button - Figma Style */}
              <div
                onClick={() => setEditDialogOpen(false)}
                className="bg-[#6b7280] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[44px] cursor-pointer transition-all duration-200 hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px] flex-1"
              >
                <div className="flex flex-row items-center justify-center relative size-full">
                  <div className="box-border content-stretch flex gap-2 items-center justify-center px-4 py-3 relative size-full">
                    <X className="w-4 h-4 text-white" />
                    <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-nowrap">
                      <p className="leading-[normal] whitespace-pre">Cancel</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply Changes Button - Figma Style */}
              <div
                onClick={handleApplyEdit}
                className="bg-[#04a444] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[44px] cursor-pointer transition-all duration-200 hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px] flex-1"
              >
                <div className="flex flex-row items-center justify-center relative size-full">
                  <div className="box-border content-stretch flex gap-2 items-center justify-center px-4 py-3 relative size-full">
                    <Check className="w-4 h-4 text-white" />
                    <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-nowrap">
                      <p className="leading-[normal] whitespace-pre">Apply Changes</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Iframe Code Dialog */}
        <Dialog open={iframeDialogOpen} onOpenChange={setIframeDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Embed Code for Your Website
              </DialogTitle>
              <DialogDescription>
                Copy and paste this iframe code into your website to embed your testimonial.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Iframe Code Display */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span>📄 Iframe Code:</span>
                  <span className="text-gray-500">(Ready to paste on your website)</span>
                </div>
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                    <span className="text-xs font-medium text-gray-600">HTML</span>
                  </div>
                  <pre className="p-3 text-xs text-gray-800 font-mono leading-relaxed overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
                    <code>{generateIframeEmbedCode()}</code>
                  </pre>
                </div>
              </div>
              
              {/* Usage Instructions */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-1">How to use:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Copy the code above</li>
                  <li>• Paste it into your website's HTML where you want the testimonial to appear</li>
                  <li>• The testimonial will automatically adjust to fit your page</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              {/* Close Button */}
              <div
                onClick={() => setIframeDialogOpen(false)}
                className="bg-[#6b7280] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[44px] cursor-pointer transition-all duration-200 hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px] flex-1"
              >
                <div className="flex flex-row items-center justify-center relative size-full">
                  <div className="box-border content-stretch flex gap-2 items-center justify-center px-4 py-3 relative size-full">
                    <X className="w-4 h-4 text-white" />
                    <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-nowrap">
                      <p className="leading-[normal] whitespace-pre">Close</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy Code Button */}
              <div
                onClick={() => {
                  // Skip modern Clipboard API since it's blocked by permissions policy
                  // Go straight to comprehensive fallback system
                  copyIframeCode();
                }}
                className="bg-[#8b5cf6] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[44px] cursor-pointer transition-all duration-200 hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px] flex-1"
              >
                <div className="flex flex-row items-center justify-center relative size-full">
                  <div className="box-border content-stretch flex gap-2 items-center justify-center px-4 py-3 relative size-full">
                    <Copy className="w-4 h-4 text-white" />
                    <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-nowrap">
                      <p className="leading-[normal] whitespace-pre">Copy Code</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />

      {/* Email Collection Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-3xl border-0 shadow-2xl">
          <DialogHeader className="relative">
            <VisuallyHidden>
              <DialogTitle>Email Subscription</DialogTitle>
            </VisuallyHidden>
            <VisuallyHidden>
              <DialogDescription>
                Subscribe to get early access to new features and products at early bird prices.
              </DialogDescription>
            </VisuallyHidden>
            {/* Close Button */}
            <button
              onClick={() => setEmailDialogOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </DialogHeader>

          <div className="px-12 py-8 text-center">
            {/* New Image - Scaled 1.5x with natural rectangular dimensions */}
            <div className="mb-4 flex justify-center">
              <img 
                src={rocketImage} 
                alt="Promotional illustration" 
                className="object-contain"
                style={{ 
                  maxWidth: '249px', // 1.5x of 166px (original size scaled by 0.5x more)
                  maxHeight: 'auto', // Let it scale naturally to maintain rectangular aspect ratio
                  width: 'auto',
                  height: 'auto'
                }}
              />
            </div>

            {/* Conditional Content Based on Email Submission Status */}
            {!emailSubmitted ? (
              <>
                {/* Heading for New Users */}
                <h2 className="text-3xl font-black text-black mb-6 tracking-tight">
                 Enjoying this?
                </h2>

                {/* Subtitle for New Users */}
                <p className="text-lg text-gray-800 mb-8 leading-relaxed max-w-sm mx-auto">
                  Be the first to get our coolest updates. Drop your email below 👇
                </p>

                {/* Email Input - Only for New Users */}
                <div className="mb-6">
                  <label htmlFor="email-input" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    placeholder="Enter your email address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-6 py-4 text-lg bg-gray-100 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder:text-gray-500 text-center"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEmailSubmit();
                      }
                    }}
                    aria-describedby="email-description"
                  />
                  <div id="email-description" className="sr-only">
                    Enter your email to subscribe to early access notifications
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Heading for Returning Users */}
                <h2 className="text-3xl font-black text-black mb-6 tracking-tight">
                  Welcome back! 👋
                </h2>

                {/* Subtitle for Returning Users */}
                <p className="text-lg text-gray-800 mb-8 leading-relaxed max-w-sm mx-auto">
                  Thanks for subscribing! You're all set to receive our latest updates and features.
                </p>
              </>
            )}

            {/* Action button - Different behavior for new vs returning users */}
            {!emailSubmitted ? (
              /* Keep me updated button for new users - Figma Style */
              <div
                onClick={emailSubmitting ? undefined : handleEmailSubmit}
                className={`w-full bg-[#04a444] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[56px] transition-all duration-200 ${
                  emailSubmitting 
                    ? 'opacity-75 cursor-not-allowed' 
                    : 'cursor-pointer hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px]'
                }`}
                aria-describedby="subscribe-description"
              >
                <div className="flex flex-row items-center justify-center relative size-full">
                  <div className="box-border content-stretch flex gap-2.5 items-center justify-center px-4 py-3 relative size-full">
                    {emailSubmitting && (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    )}
                    <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-nowrap">
                      <p className="leading-[normal] whitespace-pre">{emailSubmitting ? "Submitting..." : "Keep me updated"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Close button for returning users - Figma Style */
              <div
                onClick={() => setEmailDialogOpen(false)}
                className="w-full bg-[#04a444] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[56px] cursor-pointer transition-all duration-200 hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px]"
                aria-describedby="close-description"
              >
                <div className="flex flex-row items-center justify-center relative size-full">
                  <div className="box-border content-stretch flex gap-2.5 items-center justify-center px-4 py-3 relative size-full">
                    <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-nowrap">
                      <p className="leading-[normal] whitespace-pre">Got it! ✨</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div id="subscribe-description" className="sr-only">
              Subscribe to receive early access to new features
            </div>
            <div id="close-description" className="sr-only">
              Close the dialog - you're already subscribed
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </DndProvider>
  );
}



// Root App Component with Routing and Layout
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main application route - now the homepage */}
        <Route path="/" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <WhatsAppTestimonialMaker />
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } className="bg-[rgba(179,220,177,1)] bg-[rgba(179,220,177,0)]" />
        
        {/* WhatsApp route - same as main app */}
        <Route path="/whatsapp" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <WhatsAppTestimonialMaker />
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        {/* Create Testimonial Route - Testimony Maker Tab */}
        <Route path="/create-testimonial" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <CreateTestimonialPage />
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        {/* Screenshot Highlighter Route */}
        <Route path="/screenshot-highlighter" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <ScreenshotHighlighterPage />
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        {/* Alternative route for the main application */}
        <Route path="/whatsapp-testimonial-maker" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <WhatsAppTestimonialMaker />
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        {/* Blog routes */}
        <Route path="/blog" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <BlogPage />
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        <Route path="/blog/:slug" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <BlogPostPage />
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        {/* SEO Landing Pages */}
        <Route path="/features" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Features Page Coming Soon</h1>
                <p className="text-gray-600 mb-8">Discover all the powerful features of our testimonial maker.</p>
                <Link to="/whatsapp-testimonial-maker">
                  <Button>Try the Tool Now</Button>
                </Link>
              </div>
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        <Route path="/how-it-works" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">How It Works - Coming Soon</h1>
                <p className="text-gray-600 mb-8">Learn how to create amazing testimonials step by step.</p>
                <Link to="/whatsapp-testimonial-maker">
                  <Button>Start Creating</Button>
                </Link>
              </div>
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        <Route path="/examples" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Examples Gallery - Coming Soon</h1>
                <p className="text-gray-600 mb-8">Browse our collection of testimonial examples.</p>
                <Link to="/whatsapp-testimonial-maker">
                  <Button>Create Your Own</Button>
                </Link>
              </div>
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        <Route path="/faq" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">FAQ - Coming Soon</h1>
                <p className="text-gray-600 mb-8">Find answers to frequently asked questions.</p>
                <Link to="/whatsapp-testimonial-maker">
                  <Button>Try the Tool</Button>
                </Link>
              </div>
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        <Route path="/about" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">About Us - Coming Soon</h1>
                <p className="text-gray-600 mb-8">Learn more about our mission and team.</p>
                <Link to="/whatsapp-testimonial-maker">
                  <Button>Start Creating</Button>
                </Link>
              </div>
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        <Route path="/sitemap" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <SitemapPage />
            </div>
            {/* Product Hunt Widget */}
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-free&#0045;whatsapp&#0045;testimonial&#0045;maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light&t=1757070105833" 
                  alt="Free WhatsApp Testimonial Maker - Create stunning testimonials easily | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                  className="mx-auto"
                />
              </a>
            </div>
            <Footer />
          </div>
        } />
        
        {/* Platform-specific pages for SEO */}
        <Route path="/instagram-testimonials" element={<Navigate to="/whatsapp-testimonial-maker" replace />} />
        <Route path="/telegram-testimonials" element={<Navigate to="/whatsapp-testimonial-maker" replace />} />
        <Route path="/linkedin-testimonials" element={<Navigate to="/whatsapp-testimonial-maker" replace />} />
        
        {/* Catch all route - redirect to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// CRITICAL: DraggableMessage component that uses consistent width constraints
function DraggableMessage({ message, index, moveMessage, onEdit, onDelete, containerRef }) {
  const [showActions, setShowActions] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(320);
  const ref = useRef(null);

  // Calculate available width from container (same as DOM generation)
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.round(rect.width);
      setAvailableWidth(width - 24); // Subtract 12px padding on each side (24px total) since containerRef now points to message container
    }
  }, [containerRef]);

  const [, drop] = useDrop({
    accept: 'message',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveMessage(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'message',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  // Connect drag and drop to the element
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      className={`relative transition-all duration-200 w-full ${
        isDragging ? 'scale-105 shadow-lg' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => setShowActions(!showActions)}
    >
      {/* Main container with consistent width constraints */}
      <div className="flex justify-start group relative pr-16 w-full">
        {/* Drag Handle - Hidden on small screens */}
        <div className="absolute left-[-24px] top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing z-20 hidden sm:block">
          <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </div>

        {/* Message container with EXACT width matching DOM generation */}
        <div className="w-full min-w-0 flex">
          <div className="w-full max-w-full">
            {message.type === "text" && (
              <PreviewTextMessage
                message={message}
                availableWidth={availableWidth}
                onTimeClick={() => onEdit()}
              />
            )}
            {message.type === "image" && (
              <div className="relative w-full min-h-[40px]">
                <PreviewImageMessage
                  message={message}
                  availableWidth={availableWidth}
                  onTimeClick={() => onEdit()}
                />
              </div>
            )}
            {message.type === "text-image" && (
              <div className="relative w-full min-h-[40px]">
                <PreviewImageAndTextMessage
                  message={message}
                  availableWidth={availableWidth}
                  onTimeClick={() => onEdit()}
                />
              </div>
            )}
          </div>
        </div>

        {/* Edit/Delete Actions - Fixed positioning within container */}
        {showActions && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                setShowActions(false);
              }}
              className="w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
              title="Edit message"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowActions(false);
              }}
              className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
              title="Delete message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// CRITICAL: Custom preview message components that match DOM generation EXACTLY
function PreviewTextMessage({ message, availableWidth, onTimeClick }: { message: Message; availableWidth: number; onTimeClick?: () => void }) {
  const maxBubbleWidth = Math.min(availableWidth * 0.8, 320);

  return (
    <div className="flex justify-start w-full">
      {/* Message container with EXACT structure as DOM */}
      <div className="relative" style={{ maxWidth: `${maxBubbleWidth}px` }}>
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

        {/* Main bubble with EXACT structure as DOM */}
        <div 
          className="bg-white rounded-lg rounded-tl-none ml-2 relative flex items-start"
          style={{
            boxShadow: '0px 1px 0.5px 0px rgba(11,20,26,0.13)',
            borderTopLeftRadius: '0px',
            borderTopRightRadius: '7.5px',
            borderBottomLeftRadius: '7.5px',
            borderBottomRightRadius: '7.5px',
            padding: '8px'
          }}
        >
          {/* Content container matching DOM exactly */}
          <div className="flex items-end gap-2 w-full">
            {/* Text content with EXACT width constraint matching DOM */}
            <div 
              className="text-[#111b21] text-[14.2px] leading-[19px] whitespace-normal break-words"
              style={{ 
                fontFamily: 'Helvetica Neue, sans-serif',
                maxWidth: `${maxBubbleWidth - 80}px`, // Account for consistent padding and time space
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                padding: '4px 0', // FIXED: Added missing 4px top and bottom padding to match DOM exactly
                margin: '0' // Remove any default margins
              }}
            >
              {renderTextWithHighlights(message.text, message.highlights)}
            </div>

            {/* Time - BOTTOM ALIGNED - Clickable */}
            <div className="flex-shrink-0" style={{ alignSelf: 'flex-end' }}>
              <span 
                className="text-[#667781] text-[11px] leading-[15px] whitespace-nowrap cursor-pointer hover:text-[#4a5568] transition-colors"
                style={{ 
                  fontFamily: 'Helvetica Neue, sans-serif',
                  margin: '0', // Remove any default margins
                  padding: '0', // Remove any default padding
                  verticalAlign: 'bottom' // Additional bottom alignment
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTimeClick?.();
                }}
                title="Click to change time"
              >
                {formatTimeForDisplay(message.time)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewImageMessage({ message, availableWidth, onTimeClick }: { message: Message; availableWidth: number; onTimeClick?: () => void }) {
  const [imageDimensions, setImageDimensions] = useState({ width: 280, height: 140 });
  const firstImage = message.images && message.images.length > 0 ? message.images[0] : null;
  const maxBubbleWidth = Math.min(availableWidth * 0.8, 320);

  useEffect(() => {
    if (firstImage) {
      const img = new Image();
      img.onload = () => {
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
        
        setImageDimensions({ width: Math.round(width), height: Math.round(height) });
      };
      img.onerror = () => {
        setImageDimensions({ width: 280, height: 140 });
      };
      img.src = firstImage;
    }
  }, [firstImage]);

  return (
    <div className="flex justify-start w-full">
      {/* Message container with EXACT structure as DOM */}
      <div className="relative" style={{ maxWidth: `${maxBubbleWidth}px` }}>
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

        {/* Main bubble with EXACT structure as DOM */}
        <div 
          className="bg-white rounded-lg rounded-tl-none ml-2 flex items-start"
          style={{
            boxShadow: '0px 1px 0.5px 0px rgba(11,20,26,0.13)',
            borderTopLeftRadius: '0px',
            padding: '8px'
          }}
        >
          {firstImage && (
            <div className="relative">
              <img
                src={firstImage}
                alt="Message"
                className="w-full h-auto object-cover rounded-[6px] bg-gray-100"
                style={{ 
                  maxHeight: `${imageDimensions.height}px`,
                  maxWidth: `${imageDimensions.width}px`
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-black/50 to-transparent rounded-b-[6px]" />
              <div className="absolute bottom-[8px] right-[8px]">
                <span 
                  className="text-white/90 text-[10px] leading-[15px] whitespace-nowrap cursor-pointer hover:text-white transition-colors"
                  style={{ fontFamily: 'Helvetica Neue, sans-serif' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTimeClick?.();
                  }}
                  title="Click to change time"
                >
                  {formatTimeForDisplay(message.time)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewImageAndTextMessage({ message, availableWidth, onTimeClick }: { message: Message; availableWidth: number; onTimeClick?: () => void }) {
  const [imageDimensions, setImageDimensions] = useState({ width: 280, height: 140 });
  const firstImage = message.images && message.images.length > 0 ? message.images[0] : null;
  const maxBubbleWidth = Math.min(availableWidth * 0.8, 320);

  useEffect(() => {
    if (firstImage) {
      const img = new Image();
      img.onload = () => {
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
        
        setImageDimensions({ width: Math.round(width), height: Math.round(height) });
      };
      img.onerror = () => {
        setImageDimensions({ width: 280, height: 140 });
      };
      img.src = firstImage;
    }
  }, [firstImage]);

  return (
    <div className="flex justify-start w-full">
      {/* Message container with EXACT structure as DOM */}
      <div className="relative" style={{ maxWidth: `${maxBubbleWidth}px` }}>
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

        {/* Main bubble with EXACT structure as DOM */}
        <div 
          className="bg-white rounded-lg rounded-tl-none ml-2 flex items-start"
          style={{
            boxShadow: '0px 1px 0.5px 0px rgba(11,20,26,0.13)',
            borderTopLeftRadius: '0px',
            padding: '8px'
          }}
        >
          <div className="w-full">
            {/* Image */}
            {firstImage && (
              <img
                src={firstImage}
                alt="Message"
                className="w-full h-auto object-cover rounded-[6px] bg-gray-100 mb-2"
                style={{ 
                  maxHeight: `${imageDimensions.height}px`,
                  maxWidth: `${imageDimensions.width}px`,
                  display: 'block'
                }}
              />
            )}

            {/* Text content with EXACT width constraint */}
            {message.text && (
              <div 
                style={{ 
                  fontFamily: 'Helvetica Neue, sans-serif',
                  fontSize: '14.2px',
                  lineHeight: '19px',
                  color: '#111b21',
                  maxWidth: `${maxBubbleWidth - 32}px`, // Account for consistent 8px padding on both sides
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  padding: '2px 0', // FIXED: Reduced padding for tighter content wrapping
                  margin: '0' // FIXED: Removed all margins for tighter content wrapping
                }}
              >
                {renderTextWithHighlights(message.text, message.highlights)}
              </div>
            )}

            {/* Time - right aligned with increased spacing to match export - Clickable */}
            <div className="text-right" style={{ marginTop: '12px' }}> {/* FIXED: Increased to 12px to match canvas export spacing */}
              <span 
                className="text-[#667781] text-[11px] leading-[15px] whitespace-nowrap cursor-pointer hover:text-[#4a5568] transition-colors"
                style={{ 
                  fontFamily: 'Helvetica Neue, sans-serif',
                  margin: '0', // Remove default margins
                  padding: '0', // Remove default padding
                  alignSelf: 'flex-end', // BOTTOM ALIGNED
                  verticalAlign: 'bottom' // Additional bottom alignment
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTimeClick?.();
                }}
                title="Click to change time"
              >
                {formatTimeForDisplay(message.time)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to render text with highlights
function renderTextWithHighlights(text: string, highlights: HighlightRange[] = []) {
  if (!text || highlights.length === 0) {
    return text;
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Sort highlights by start position
  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

  sortedHighlights.forEach((highlight, index) => {
    // Add text before highlight
    if (highlight.start > lastIndex) {
      elements.push(
        <span key={`text-before-${index}`}>
          {text.slice(lastIndex, highlight.start)}
        </span>
      );
    }

    // Add highlighted text with new yellow color - with 4px right and bottom padding
    elements.push(
      <span 
        key={highlight.id}
        style={{ 
          backgroundColor: '#FFFF05',
          color: '#000000',
          borderRadius: '2px',
          paddingRight: '4px',
          paddingBottom: '4px'
        }}
      >
        {text.slice(highlight.start, highlight.end)}
      </span>
    );

    lastIndex = highlight.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(
      <span key={`text-end-${lastIndex}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return <>{elements}</>;
}

// UPDATED: Helper function to format time for display with am/pm
function formatTimeForDisplay(time24) {
  if (!time24) return "5:07 pm";
  if (time24.includes(':') && time24.length === 5) {
    // Convert from 24-hour to 12-hour format with am/pm
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'pm' : 'am';
    return `${hour12}:${minutes} ${ampm}`;
  }
  return time24;
}