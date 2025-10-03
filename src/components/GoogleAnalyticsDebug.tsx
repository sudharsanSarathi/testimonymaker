import { useEffect, useState } from 'react';

// Debug component to check Google Analytics status
export function GoogleAnalyticsDebug() {
  const [gaStatus, setGaStatus] = useState<string>('Checking...');
  const [dataLayerCount, setDataLayerCount] = useState<number>(0);
  const [scriptsInDOM, setScriptsInDOM] = useState<boolean>(false);

  useEffect(() => {
    const checkGA = () => {
      if (typeof window === 'undefined') {
        setGaStatus('❌ Window undefined');
        return;
      }

      const hasDataLayer = !!(window as any).dataLayer;
      const hasGtag = !!(window as any).gtag;
      
      // Use precise selectors that match exactly what we inject
      const GA_MEASUREMENT_ID = 'G-WZMCE90WPK';
      const gtagScriptExists = !!document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`);
      const configScriptExists = !!document.querySelector(`script[data-ga-config="${GA_MEASUREMENT_ID}"]`);
      const scriptsPresent = gtagScriptExists && configScriptExists;
      
      setScriptsInDOM(scriptsPresent);
      
      if (hasDataLayer) {
        setDataLayerCount((window as any).dataLayer.length);
      }

      // Enhanced status checking - focus on DOM script presence
      if (scriptsPresent && hasDataLayer && hasGtag) {
        setGaStatus('✅ Fully loaded & detectable');
      } else if (scriptsPresent) {
        setGaStatus('🟡 Scripts in DOM, initializing...');
      } else if (hasDataLayer && hasGtag) {
        setGaStatus('🟡 JS ready, DOM scripts missing');
      } else if (hasDataLayer) {
        setGaStatus('🟡 DataLayer only...');
      } else {
        setGaStatus('❌ Not initialized');
      }
    };

    // Check immediately
    checkGA();

    // Check every 2 seconds for the first 30 seconds
    const interval = setInterval(checkGA, 2000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Always show during development, or show if there are issues
  const shouldShow = true; // Always show for now to help debug

  if (!shouldShow) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#1f2937',
      color: '#f9fafb',
      padding: '12px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '280px',
      border: '2px solid #374151'
    }}>
      <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>
        🎯 GA Status Monitor
      </div>
      <div>Status: {gaStatus}</div>
      <div>DataLayer: {dataLayerCount} events</div>
      <div>Scripts in DOM: {scriptsInDOM ? '✅ Yes' : '❌ No'}</div>
      <div>ID: G-WZMCE90WPK</div>
      
      {gaStatus.includes('✅') && (
        <div style={{ marginTop: '8px', color: '#10b981', fontSize: '11px' }}>
          🎉 Ready! Google tools should detect it.
        </div>
      )}
      
      {scriptsInDOM && (
        <div style={{ marginTop: '6px', color: '#3b82f6', fontSize: '10px' }}>
          ℹ️ Script tags are in DOM head
        </div>
      )}
      
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#9ca3af' }}>
        Test with Google Tag Assistant
      </div>
    </div>
  );
}