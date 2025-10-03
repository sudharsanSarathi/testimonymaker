import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Download,
  Upload,
  MessageCircle,
  Clock,
  Share2,
  Edit2,
  Trash2,
  X,
  Check,
  Highlighter,
  ChevronDown,
  Loader2,
  Palette,
} from "lucide-react";
import confetti from 'canvas-confetti';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Card } from "./components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./components/ui/dialog";
import { HighlightableTextarea, HighlightableTextareaRef } from "./components/HighlightableTextarea";
import { BubbleInput, BubbleInputRef } from "./components/BubbleInput";
import { ScreenshotHighlighter } from "./components/ScreenshotHighlighter";
import { TextExtractor } from "./components/TextExtractor";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { usePageTracking, trackEvent as gtaTrackEvent } from './components/usePageTracking';

import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { SitemapPage } from './pages/SitemapPage';
import { CreateTestimonialPage } from './pages/CreateTestimonialPage';
import { ScreenshotHighlighterPage } from './pages/ScreenshotHighlighterPage';
import WhatsappBackground from "./components/WhatsappBackground";
import { Autoscroll } from "./components/Autoscroll";
import { CanvasImageGenerator } from "./canvas-generator";

// Essential interfaces
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

// Analytics tracking - simplified for Netlify deployment
const trackEvent = (event: string, data: any = {}) => {
  setTimeout(() => {
    try {
      gtaTrackEvent(event, data);
    } catch (error) {
      console.debug('GA tracking failed:', error);
    }
  }, 0);
};

// Assets - using actual downloaded images from /public/assets/
const logoImage = '/assets/logo.png';
const imgWhatsApp = '/assets/whatsapp-logo.png';
const imgInstagram = '/assets/instagram-logo.png';
const imgLinkedin = '/assets/linkedin-logo.png';
const imgTelegram = '/assets/telegram-logo.png';
const rocketImage = '/assets/rocket.png';
const testimonialIcon = '/assets/testimonial-icon.png';
const createImageIcon = '/assets/create-image-icon.png';
const clientFormsIcon = '/assets/client-forms-icon.png';

// SEO and Document Title Component
function DocumentHead() {
  const location = useLocation();
  usePageTracking();
  
  useEffect(() => {
    document.title = "Free Testimonial Maker – Templates, Images & Client Reviews";
    
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
    
    updateOrCreateMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateOrCreateMeta('googlebot', 'index, follow');
    updateOrCreateMeta('bingbot', 'index, follow');
    
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
    
  }, [location]);

  return null;
}

// Main Testimonial Maker Component
function WhatsAppTestimonialMaker() {
  const getDefaultState = () => ({
    messages: [
      {
        id: "sample",
        text: "Your message will appear here",
        images: [],
        time: "17:07",
        type: "text" as const,
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
    selectedPlatform: "whatsapp" as Platform,
    selectedMessageType: "text" as "text" | "image" | "text-image",
    backgroundColor: "#abe8a1",
    showBackground: true,
  });

  const defaultState = getDefaultState();
  const [messages, setMessages] = useState<Message[]>(defaultState.messages);
  const [currentMessage, setCurrentMessage] = useState(defaultState.currentMessage);
  const [currentHighlights, setCurrentHighlights] = useState<HighlightRange[]>(defaultState.currentHighlights);
  const [currentTime, setCurrentTime] = useState(defaultState.currentTime);
  const [currentImages, setCurrentImages] = useState<any[]>(defaultState.currentImages);
  const [hasAddedFirstMessage, setHasAddedFirstMessage] = useState(defaultState.hasAddedFirstMessage);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(defaultState.selectedPlatform);
  const [selectedMessageType, setSelectedMessageType] = useState<"text" | "image" | "text-image">(defaultState.selectedMessageType);
  const [backgroundColor, setBackgroundColor] = useState(defaultState.backgroundColor);
  const [showBackground, setShowBackground] = useState(defaultState.showBackground);
  const [showBackgroundEditor, setShowBackgroundEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<"testimony-maker" | "screenshot-highlighter">("testimony-maker");
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Platform configurations
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

  // Handle URL parameters for tab selection
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'screenshot-highlighter') {
      setActiveTab('screenshot-highlighter');
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

  // Handle message changes
  const handleMessageChange = (text: string, highlights: HighlightRange[]) => {
    setCurrentMessage(text);
    setCurrentHighlights(highlights);
  };

  // Handle extracted text from OCR
  const handleExtractedText = useCallback((extractedText: string) => {
    setCurrentMessage(extractedText);
    setCurrentHighlights([]);
    
    setTimeout(() => {
      trackEvent('ocr_text_extracted', {
        text_length: extractedText.length,
        platform: selectedPlatform
      });
    }, 0);
    
    toast.success("Text extracted successfully!");
  }, [selectedPlatform]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target?.result as string
        };
        setCurrentImages([newImage]);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const removeImage = (imageId: string) => {
    setCurrentImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(event.target.value);
  };

  // Format time for display
  const formatTimeForDisplay = (time24: string) => {
    if (!time24) return "5:07 pm";
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'pm' : 'am';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatTimeForInput = (displayTime: string) => {
    if (!displayTime) return "17:07";
    if (displayTime.includes(':') && displayTime.length === 5) {
      return displayTime;
    }
    const [hours, minutes] = displayTime.split(':');
    const paddedHours = hours.padStart(2, '0');
    return `${paddedHours}:${minutes}`;
  };

  // Add message functionality
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
      setMessages([newMessage]);
      setHasAddedFirstMessage(true);
      
      setTimeout(() => {
        trackEvent('first_message_added', {
          message_type: selectedMessageType,
          platform: selectedPlatform,
          has_highlights: currentHighlights.length > 0,
          text_length: currentMessage.length
        });
      }, 0);
    } else {
      setMessages([...messages, newMessage]);
      
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

    // Clear current inputs
    setCurrentMessage("");
    setCurrentHighlights([]);
    setCurrentImages([]);
    
    toast.success("Message added successfully!");
  };

  // Canvas-based image generation
  const generateImageCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (messages.length === 0) {
      return null;
    }

    try {
      const desktopWidth = 480;
      const generator = new CanvasImageGenerator();

      const canvas = await generator.generateImage({
        messages,
        containerWidth: desktopWidth,
        backgroundColor,
        showBackground,
        whatsappBgPattern: '/assets/whatsapp-bg-pattern.png',
      });

      return canvas;
    } catch (error) {
      console.error('Error generating image:', error);
      
      if (error.message?.includes('No messages')) {
        toast.error('Please add at least one message first');
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

    setTimeout(() => {
      trackEvent('download_started', {
        message_count: messages.length,
        platform: selectedPlatform,
        has_background: showBackground
      });
    }, 0);

    setDownloadLoading(true);
    try {
      const canvas = await generateImageCanvas();
      if (!canvas) {
        toast.error('Failed to generate image. Please try again.');
        return;
      }

      const link = document.createElement('a');
      link.download = `whatsapp-testimonial-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      setTimeout(() => {
        trackEvent('download_completed', {
          message_count: messages.length,
          platform: selectedPlatform,
          has_background: showBackground
        });
      }, 0);

      toast.success('Chat bubbles downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
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

  const clearMessages = () => {
    setTimeout(() => {
      trackEvent('messages_cleared', {
        message_count: messages.length,
        platform: selectedPlatform
      });
    }, 0);
    
    const freshState = getDefaultState();
    setMessages(freshState.messages);
    setHasAddedFirstMessage(freshState.hasAddedFirstMessage);
    setCurrentMessage(freshState.currentMessage);
    setCurrentHighlights(freshState.currentHighlights);
    setCurrentImages(freshState.currentImages);
    
    toast.success("Reset to default sample!");
  };

  // Helper function to render text with highlights
  const renderTextWithHighlights = (text: string, highlights: HighlightRange[] = []) => {
    if (!text || highlights.length === 0) {
      return text;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    sortedHighlights.forEach((highlight, index) => {
      if (highlight.start > lastIndex) {
        elements.push(
          <span key={`text-before-${index}`}>
            {text.slice(lastIndex, highlight.start)}
          </span>
        );
      }

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

    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-end-${lastIndex}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <>{elements}</>;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DocumentHead />
      <div style={{ background: '#B2DCB1', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-[81px] max-[600px]:pt-[32px] pb-8">
          {/* Hero Section */}
          <div className="text-center mb-[42px] mt-[0px] mr-[0px] ml-[0px] opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
            <div className="block min-[600px]:hidden mb-5">
              <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200">
                <img src={logoImage} alt="Testimonial Maker" className="w-full h-full object-cover" />
              </div>
            </div>

            <p className="text-sm md:text-base text-[rgba(9,10,9,1)] mb-[-13px] italic font-light font-[Fira_Mono] text-[16px] mt-[0px] mr-[0px] ml-[0px]">
              Trusted by creators ❤️
            </p>
            
            <div className="mt-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-[Anton] text-center" style={{ lineHeight: '1.5' }}>
                <span className="min-[601px]:hidden">Create Testimonials Instantly – Templates, Images & WhatsApp Style</span>
                <span className="hidden min-[601px]:inline">Create Testimonials Instantly – Templates, <br />Images & WhatsApp Style</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Design professional client testimonial templates, generate testimonial images, and even create WhatsApp-style reviews in seconds – free and easy.
              </p>

              <div className="mb-8">
                <div
                  onClick={() => {
                    if (tabContentRef.current) {
                      const element = tabContentRef.current;
                      const elementRect = element.getBoundingClientRect();
                      const currentScrollY = window.pageYOffset;
                      const targetScrollY = currentScrollY + elementRect.top;
                      const viewportHeight = window.innerHeight;
                      const adjustedScrollY = targetScrollY - (viewportHeight * 0.2);
                      
                      window.scrollTo({ 
                        top: Math.max(0, adjustedScrollY),
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

          {/* Auto-scrolling Testimonial Gallery */}
          <div className="py-8 max-[600px]:py-2 mb-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
            <Autoscroll />
          </div>

          {/* Tab Container */}
          <div className="mb-12 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
            <div className="flex items-center justify-center mb-[30px] px-4">
              <div className="relative rounded-[10000px] p-[11px] w-full max-w-full min-[800px]:w-[600px] min-[800px]:max-w-[600px]" style={{ backgroundColor: '#EBF7EB' }}>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => {
                      setActiveTab("testimony-maker");
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
                      fontSize: window.innerWidth < 600 ? '14px' : '16px',
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

                  <button
                    onClick={() => {
                      setActiveTab("screenshot-highlighter");
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
                      fontSize: window.innerWidth < 600 ? '14px' : '16px',
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                          ✍️ Write your testimonial
                        </h2>

                        <div className="space-y-6">
                          {/* Platform Selection */}
                          <div>
                            <label className="block text-sm font-medium mb-3">
                              Choose Platform
                            </label>
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-[#D5E7D5] bg-white">
                              {platforms[selectedPlatform].logo && (
                                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                  <img 
                                    src={platforms[selectedPlatform].logo} 
                                    alt={platforms[selectedPlatform].name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <span className="text-gray-900 font-medium">
                                {platforms[selectedPlatform].name}
                              </span>
                            </div>
                          </div>

                          {/* Message Input */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-sm font-medium">
                                Type what your happy customer said...
                              </label>
                              <TextExtractor 
                                onExtractedText={handleExtractedText}
                                className="flex-shrink-0"
                                compact={true}
                              />
                            </div>

                            <HighlightableTextarea
                              value={currentMessage}
                              onChange={handleMessageChange}
                              highlights={currentHighlights}
                              placeholder="Enter your testimonial message..."
                              className="border-[#D5E7D5] focus:border-green-500 focus:ring-green-500 rounded-xl"
                            />
                          </div>

                          {/* Image Upload for non-text-only messages */}
                          {selectedMessageType !== "text" && (
                            <div>
                              <label className="block text-sm font-medium mb-3">
                                Upload image
                              </label>
                              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                                {currentImages.length === 0 ? (
                                  <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                    className="w-full"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Image
                                  </Button>
                                ) : (
                                  <div className="relative">
                                    <img
                                      src={currentImages[0].preview}
                                      alt="Preview"
                                      className="w-20 h-20 object-cover rounded-lg mx-auto"
                                    />
                                    <button
                                      onClick={() => removeImage(currentImages[0].id)}
                                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </div>
                          )}

                          {/* Time Input */}
                          <div onClick={() => timeInputRef.current?.click()} className="cursor-pointer">
                            <label className="block text-sm font-medium mb-2 cursor-pointer">
                              Pick a time
                            </label>
                            <div className="relative w-full">
                              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-10 pointer-events-none" />
                              <input
                                ref={timeInputRef}
                                type="time"
                                value={formatTimeForInput(currentTime)}
                                onChange={handleTimeChange}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D5E7D5] focus:border-green-500 focus:ring-green-500 focus:outline-none bg-white cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Add to Chat Button */}
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

                    {/* Preview Panel */}
                    <div className="lg:w-1/2">
                      <Card className="p-6 pt-10 pb-6 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        
                        {/* Background Container */}
                        {showBackground ? (
                          <div 
                            className="relative rounded-2xl overflow-hidden w-full mb-6 p-4 min-[601px]:p-10"
                            style={{ backgroundColor: backgroundColor }}
                          >
                            <button
                              onClick={() => setShowBackgroundEditor(!showBackgroundEditor)}
                              className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-20"
                              title="Edit background"
                            >
                              <Palette className="w-4 h-4 text-gray-700" />
                            </button>

                            <div 
                              ref={previewContainerRef}
                              className="shadow-xl relative"
                              style={{
                                backgroundColor: '#efeae2',
                                borderRadius: '12px',
                                overflow: 'hidden'
                              }}
                            >
                              <div className="absolute inset-0">
                                <WhatsappBackground />
                              </div>

                              <div 
                                className="relative z-10 px-3 pt-[35px] pb-[40px] overflow-x-auto"
                                style={{ minHeight: '120px' }}
                              >
                                <div className="space-y-2 w-full">
                                  {messages.map((message) => (
                                    <MessagePreview
                                      key={message.id}
                                      message={message}
                                      renderTextWithHighlights={renderTextWithHighlights}
                                      formatTimeForDisplay={formatTimeForDisplay}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full mb-6 relative">
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
                              <div className="absolute inset-0">
                                <WhatsappBackground />
                              </div>

                              <div 
                                className="relative z-10 px-3 pt-[35px] pb-[40px] overflow-x-auto"
                                style={{ minHeight: '120px' }}
                              >
                                <div className="space-y-2 w-full">
                                  {messages.map((message) => (
                                    <MessagePreview
                                      key={message.id}
                                      message={message}
                                      renderTextWithHighlights={renderTextWithHighlights}
                                      formatTimeForDisplay={formatTimeForDisplay}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Background Editor */}
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

                            <div className="space-y-3">
                              <label className="block text-sm font-medium text-gray-800">
                                Background Options
                              </label>
                              <div className="flex gap-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="background"
                                    checked={showBackground}
                                    onChange={() => setShowBackground(true)}
                                    className="text-green-600"
                                  />
                                  <span className="text-sm font-medium">Add background</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="background"
                                    checked={!showBackground}
                                    onChange={() => setShowBackground(false)}
                                    className="text-green-600"
                                  />
                                  <span className="text-sm font-medium">No background</span>
                                </label>
                              </div>
                            </div>

                            {showBackground && (
                              <div className="flex gap-2">
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

                                <div className="flex-shrink-0">
                                  <label className="block text-xs font-medium mb-1 text-gray-700 opacity-0">
                                    Action
                                  </label>
                                  <Button
                                    onClick={() => {
                                      const colors = [
                                        '#c8a6a6', '#c8b4a6', '#c8c1a6', '#c1c8a6', '#b4c8a6',
                                        '#a6c8a6', '#a6c8b4', '#a6c8c1', '#a6c1c8', '#a6b4c8',
                                        '#a6a6c8', '#b4a6c8', '#c1a6c8', '#c8a6c1', '#c8a6b4'
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

                        {/* Action Buttons */}
                        <div className="flex flex-col w-full" style={{ gap: '16px' }}>
                          <div className="flex gap-2 w-full">
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

                            <div
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

              {/* Tab 2: Screenshot Highlighter */}
              {activeTab === "screenshot-highlighter" && (
                <div className="space-y-8">
                  <div className="max-w-7xl mx-auto">
                    <ScreenshotHighlighter />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Why Choose Section */}
          <div className="py-16 mb-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.8s_forwards]">
            <div className="text-center max-w-4xl mx-auto px-4">
              <h2 className="text-[27px] md:text-[36px] font-bold text-gray-900 mb-8">
                Why Choose Our Testimonial Maker?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="backdrop-blur-sm p-6 rounded-2xl border border-gray-200 transition-all duration-300 hover:-translate-y-1" style={{ backgroundColor: '#E1EEE0' }}>
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

        <Toaster />
      </div>
    </DndProvider>
  );
}

// Message Preview Component
function MessagePreview({ message, renderTextWithHighlights, formatTimeForDisplay }: {
  message: Message;
  renderTextWithHighlights: (text: string, highlights?: HighlightRange[]) => React.ReactNode;
  formatTimeForDisplay: (time: string) => string;
}) {
  const maxBubbleWidth = 320;

  return (
    <div className="flex justify-start w-full">
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

        {/* Main bubble */}
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
          {message.type === "text" && (
            <div className="flex items-end gap-2 w-full">
              <div 
                className="text-[#111b21] text-[14.2px] leading-[19px] whitespace-normal break-words"
                style={{ 
                  fontFamily: 'Helvetica Neue, sans-serif',
                  maxWidth: `${maxBubbleWidth - 80}px`,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  padding: '4px 0',
                  margin: '0'
                }}
              >
                {renderTextWithHighlights(message.text, message.highlights)}
              </div>
              <div className="flex-shrink-0" style={{ alignSelf: 'flex-end' }}>
                <span 
                  className="text-[#667781] text-[11px] leading-[15px] whitespace-nowrap"
                  style={{ 
                    fontFamily: 'Helvetica Neue, sans-serif',
                    margin: '0',
                    padding: '0',
                    verticalAlign: 'bottom'
                  }}
                >
                  {formatTimeForDisplay(message.time)}
                </span>
              </div>
            </div>
          )}

          {message.type === "image" && message.images && message.images[0] && (
            <div className="relative">
              <img
                src={message.images[0]}
                alt="Message"
                className="w-full h-auto object-cover rounded-[6px] bg-gray-100"
                style={{ maxHeight: '400px', maxWidth: '280px' }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-black/50 to-transparent rounded-b-[6px]" />
              <div className="absolute bottom-[8px] right-[8px]">
                <span 
                  className="text-white/90 text-[10px] leading-[15px] whitespace-nowrap"
                  style={{ fontFamily: 'Helvetica Neue, sans-serif' }}
                >
                  {formatTimeForDisplay(message.time)}
                </span>
              </div>
            </div>
          )}

          {message.type === "text-image" && message.images && message.images[0] && (
            <div className="w-full">
              <img
                src={message.images[0]}
                alt="Message"
                className="w-full h-auto object-cover rounded-[6px] bg-gray-100 mb-2"
                style={{ maxHeight: '400px', maxWidth: '280px', display: 'block' }}
              />
              {message.text && (
                <div 
                  style={{ 
                    fontFamily: 'Helvetica Neue, sans-serif',
                    fontSize: '14.2px',
                    lineHeight: '19px',
                    color: '#111b21',
                    maxWidth: `${maxBubbleWidth - 32}px`,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    padding: '2px 0',
                    margin: '0'
                  }}
                >
                  {renderTextWithHighlights(message.text, message.highlights)}
                </div>
              )}
              <div className="text-right" style={{ marginTop: '12px' }}>
                <span 
                  className="text-[#667781] text-[11px] leading-[15px] whitespace-nowrap"
                  style={{ 
                    fontFamily: 'Helvetica Neue, sans-serif',
                    margin: '0',
                    padding: '0',
                    alignSelf: 'flex-end',
                    verticalAlign: 'bottom'
                  }}
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

// Root App Component with Routing
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <WhatsAppTestimonialMaker />
            </div>
            <div className="text-center py-8" style={{backgroundColor: "#B3DCB1"}}>
              <a href="https://www.producthunt.com/products/free-whatsapp-testimonial-maker" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1012821&theme=light" 
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
        
        <Route path="/blog" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <BlogPage />
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
            <Footer />
          </div>
        } />
        
        <Route path="/create-testimonial" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <CreateTestimonialPage />
            </div>
            <Footer />
          </div>
        } />
        
        <Route path="/screenshot-highlighter" element={
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1">
              <ScreenshotHighlighterPage />
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
            <Footer />
          </div>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}