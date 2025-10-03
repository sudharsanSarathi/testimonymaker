// Lightweight prerender script for search engines
// This helps search engines understand the site structure without interfering with React

(function() {
  // Only run for search engine crawlers or when React isn't loaded yet
  if (typeof window !== 'undefined') {
    // Force robots meta tag for SEO
    const robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
      document.head.appendChild(meta);
    }
    
    // Add structured data for search engines
    if (!document.querySelector('script[type="application/ld+json"]')) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Free WhatsApp Testimonial Maker",
        "description": "Create authentic WhatsApp, Instagram, Telegram & LinkedIn testimonials instantly. Free online tool with no watermarks.",
        "url": window.location.href,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser"
      };
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
    
    // Remove any existing prerender content when React loads to avoid conflicts
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        const root = document.getElementById('root');
        if (root && root.querySelector('[data-prerender]')) {
          root.innerHTML = '';
        }
      }, 100);
    });
  }
})();