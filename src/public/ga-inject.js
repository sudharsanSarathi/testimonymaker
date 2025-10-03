// Google Analytics injection script - runs immediately when loaded
// This ensures GA code is present in the DOM for Google's testing tools to detect

(function() {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  const GA_MEASUREMENT_ID = 'G-WZMCE90WPK';
  
  // Check if already loaded
  if (window.dataLayer || document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
    console.log('🎯 Google Analytics already present');
    return;
  }
  
  console.log('🚀 Injecting Google Analytics...');
  
  try {
    // Method 1: Create the exact script elements Google provides
    const head = document.head || document.getElementsByTagName('head')[0];
    
    // Add the gtag script exactly as Google specifies
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    
    // Add the config script exactly as Google specifies  
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}');
    `;
    
    // Insert into head immediately
    head.appendChild(gtagScript);
    head.appendChild(configScript);
    
    // Also initialize on window object immediately
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    
    // Send initial config
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
    
    console.log('✅ Google Analytics injected successfully');
    console.log('📊 Measurement ID:', GA_MEASUREMENT_ID);
    
    // Verify after a short delay
    setTimeout(function() {
      const hasGtag = !!document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
      const hasConfig = !!document.querySelector('script[type="text/javascript"]');
      const hasDataLayer = window.dataLayer && window.dataLayer.length > 0;
      
      console.log('🔍 Verification:');
      console.log('  - gtag script in DOM:', hasGtag);
      console.log('  - config script in DOM:', hasConfig);
      console.log('  - dataLayer active:', hasDataLayer);
      console.log('  - window.gtag available:', !!window.gtag);
      
      if (hasGtag && hasConfig && hasDataLayer) {
        console.log('🎉 Google Analytics fully operational!');
      } else {
        console.warn('⚠️ Google Analytics may not be fully loaded');
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Failed to inject Google Analytics:', error);
  }
})();