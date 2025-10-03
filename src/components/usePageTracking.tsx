import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Wait for gtag to be available
    if (typeof window !== 'undefined' && window.gtag) {
      // Send pageview with current pathname and document title
      window.gtag('config', 'G-WZMCE90WPK', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname
      });
      
      // Also send as a separate pageview event
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname
      });
    }
  }, [location.pathname]);
}

// Utility function to send custom events
export function trackEvent(eventName: string, parameters: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}