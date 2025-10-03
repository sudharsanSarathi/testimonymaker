import { useEffect } from 'react';

// Direct HTML script injection component that creates actual <script> tags in <head>
export function GoogleAnalyticsScript() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const GA_MEASUREMENT_ID = 'G-WZMCE90WPK';
    
    // Check if Google Analytics is already loaded using precise selector
    if (document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
      console.log('🎯 Google Analytics already loaded');
      return;
    }

    try {
      // Method 1: Create the exact script tags that Google provides
      // This is what Google Analytics setup instructions tell you to add
      
      // 1. Add the external gtag script - EXACTLY as Google provides
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      gtagScript.setAttribute('data-ga-gtag', GA_MEASUREMENT_ID);
      
      // 2. Add the configuration script - EXACTLY as Google provides  
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.setAttribute('data-ga-config', GA_MEASUREMENT_ID);
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}');
      `;
      
      // 3. Insert both scripts into document head - in the correct order
      document.head.appendChild(gtagScript);
      document.head.appendChild(configScript);
      
      // 4. Also ensure window objects are available immediately
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) { 
        window.dataLayer.push(arguments); 
      }
      (window as any).gtag = gtag;
      
      // 5. Initialize immediately
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID);
      
      console.log('✅ Google Analytics scripts added to document head');
      console.log('📊 GA Measurement ID:', GA_MEASUREMENT_ID);
      
      // Verify the scripts were added with precise selectors
      setTimeout(() => {
        const gtagExists = document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`);
        const configExists = document.querySelector(`script[data-ga-config="${GA_MEASUREMENT_ID}"]`);
        console.log('🔍 Verification - gtag script in DOM:', !!gtagExists);
        console.log('🔍 Verification - config script in DOM:', !!configExists);
        console.log('🔍 Verification - window.gtag available:', !!(window as any).gtag);
        console.log('🔍 Verification - dataLayer length:', window.dataLayer?.length || 0);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Failed to inject Google Analytics:', error);
    }
  }, []);

  return null;
}

// Alternative method: Direct HTML string injection
export function GoogleAnalyticsDirect() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const GA_MEASUREMENT_ID = 'G-WZMCE90WPK';
    
    // Check if already injected
    if (document.querySelector('[data-ga-injected="true"]')) {
      console.log('🎯 Direct GA injection already done');
      return;
    }
    
    try {
      // Create a marker element
      const marker = document.createElement('meta');
      marker.setAttribute('data-ga-injected', 'true');
      document.head.appendChild(marker);
      
      // Inject the EXACT HTML that Google provides with identifying attributes
      const gaHTML = `
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}" data-ga-gtag="${GA_MEASUREMENT_ID}"></script>
        <script data-ga-config="${GA_MEASUREMENT_ID}">
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        </script>
      `;
      
      // Insert directly into head
      document.head.insertAdjacentHTML('beforeend', gaHTML);
      
      console.log('✅ Google Analytics HTML injected directly');
      
    } catch (error) {
      console.error('❌ Direct GA injection failed:', error);
    }
  }, []);

  return null;
}

// Immediate execution version - runs as soon as component mounts
export function GoogleAnalyticsImmediate() {
  // Execute immediately when component is created (not in useEffect)
  if (typeof window !== 'undefined') {
    const GA_MEASUREMENT_ID = 'G-WZMCE90WPK';
    
    // Only run if not already done
    if (!window.dataLayer && !document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
      
      // Initialize dataLayer immediately
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) { 
        window.dataLayer.push(arguments); 
      }
      (window as any).gtag = gtag;
      
      // Add gtag call immediately
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID);
      
      // Create and append script tags immediately with identifying attributes
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      gtagScript.setAttribute('data-ga-gtag', GA_MEASUREMENT_ID);
      gtagScript.onload = () => console.log('🚀 GA script loaded successfully');
      
      const configScript = document.createElement('script');
      configScript.setAttribute('data-ga-config', GA_MEASUREMENT_ID);
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}');
      `;
      
      // Add to head immediately
      if (document.head) {
        document.head.appendChild(gtagScript);
        document.head.appendChild(configScript);
        console.log('⚡ Google Analytics initialized immediately');
      }
    }
  }

  return null;
}