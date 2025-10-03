import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics configuration - Your actual measurement ID
const GA_MEASUREMENT_ID = 'G-WZMCE90WPK';

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics exactly as Google provides
export const initGA = () => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;
  
  try {
    // Skip if already initialized
    if (window.gtag && window.dataLayer) {
      console.log('Google Analytics already initialized');
      return;
    }

    // Initialize dataLayer exactly as Google specifies
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function exactly as Google specifies
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    
    // Add current timestamp as Google specifies
    gtag('js', new Date());
    
    // Configure GA with your measurement ID
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true
    });
    
    // Load the Google Analytics script if not already present
    if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
      
      console.log('Google Analytics script loaded for:', GA_MEASUREMENT_ID);
    }
    
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
};

// Track page view
export const trackPageView = (path: string, title?: string) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title || document.title,
      });
      console.log('📊 Page view tracked:', path);
    }
  } catch (error) {
    console.warn('Failed to track page view:', error);
  }
};

// Track custom events
export const trackGAEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        // Default parameters
        event_category: 'engagement',
        event_label: parameters.label || '',
        value: parameters.value || 0,
        // Custom parameters
        ...parameters,
      });
      console.log('📊 Event tracked:', eventName, parameters);
    }
  } catch (error) {
    console.warn('Failed to track event:', error);
  }
};

// Track specific events for your testimonial maker
export const trackTestimonialEvent = (action: string, details: Record<string, any> = {}) => {
  trackGAEvent('testimonial_action', {
    event_category: 'testimonial_maker',
    action,
    ...details,
  });
};

// Track user engagement
export const trackUserEngagement = (engagement_time_msec: number) => {
  trackGAEvent('user_engagement', {
    engagement_time_msec,
  });
};

// Track file downloads
export const trackDownload = (file_name: string, file_type: string = 'image') => {
  trackGAEvent('file_download', {
    event_category: 'downloads',
    file_name,
    file_type,
  });
};

// Track social sharing
export const trackShare = (method: string, content_type: string = 'testimonial') => {
  trackGAEvent('share', {
    event_category: 'social',
    method,
    content_type,
  });
};

// Main Google Analytics component
export function GoogleAnalytics() {
  const location = useLocation();

  // Initialize GA on component mount
  useEffect(() => {
    initGA();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const path = location.pathname + location.search;
    trackPageView(path);
  }, [location]);

  // Track user engagement time
  useEffect(() => {
    let startTime = Date.now();
    let engaged = true;

    const trackEngagement = () => {
      if (engaged) {
        const engagementTime = Date.now() - startTime;
        if (engagementTime > 10000) { // Only track if user was engaged for more than 10 seconds
          trackUserEngagement(engagementTime);
        }
      }
    };

    // Track engagement on page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackEngagement();
        engaged = false;
      } else {
        startTime = Date.now();
        engaged = true;
      }
    };

    // Track engagement on page unload
    const handleBeforeUnload = () => {
      trackEngagement();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      trackEngagement();
    };
  }, [location]);

  return null; // This component doesn't render anything
}

// Hook for easy GA tracking in components
// Component to inject Google Analytics - IMMEDIATE EXECUTION
export function GoogleAnalyticsHead() {
  // Execute immediately when component mounts (no useEffect delay)
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // Check if we've already initialized
    if (!window.dataLayer) {
      try {
        // Initialize dataLayer immediately
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        
        // Call gtag with current time
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID);
        
        // Load the script if not present
        if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
          document.head.appendChild(script);
        }
        
        console.log('🎯 Google Analytics initialized immediately:', GA_MEASUREMENT_ID);
      } catch (error) {
        console.error('❌ Failed to initialize Google Analytics:', error);
      }
    }
  }

  // Also run in useEffect as backup
  useEffect(() => {
    if (typeof window !== 'undefined' && GA_MEASUREMENT_ID && !window.gtag) {
      // Backup initialization
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID);
      
      console.log('🔄 Google Analytics backup initialization');
    }
  }, []);

  return null;
}

export const useGoogleAnalytics = () => {
  return {
    trackEvent: trackGAEvent,
    trackTestimonial: trackTestimonialEvent,
    trackDownload,
    trackShare,
    trackPageView,
  };
};