import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics tracking
export const trackEvent = (eventName: string, parameters: any = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-WZMCE90WPK', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}