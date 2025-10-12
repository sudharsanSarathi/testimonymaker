import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
}

export function SEOHead({
  title = "WhatsApp Testimonial Maker - Create Stunning Chat Testimonials in Seconds",
  description = "Create authentic WhatsApp, Telegram, Instagram & LinkedIn testimonials instantly. Free online tool with no watermarks. Upload screenshots, highlight text, and generate professional testimonials for social proof.",
  keywords = [
    "whatsapp testimonial maker",
    "testimonial generator",
    "whatsapp screenshot editor",
    "social proof generator",
    "chat testimonial creator",
    "instagram testimonial maker",
    "telegram testimonial generator",
    "linkedin testimonial creator",
    "testimonial design tool"
  ],
  canonicalUrl,
  ogImage = "/og-image.png",
  structuredData
}: SEOHeadProps) {
  const location = useLocation();
  
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Update or create meta tags
    const updateOrCreateMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    // Basic meta tags
    updateOrCreateMeta('description', description);
    updateOrCreateMeta('keywords', keywords.join(', '));
    updateOrCreateMeta('author', 'WhatsApp Testimonial Maker');
    
    // Explicitly set robots meta tags for indexing - simplified to avoid conflicts
    updateOrCreateMeta('robots', 'index, follow');
    updateOrCreateMeta('googlebot', 'index, follow');
    updateOrCreateMeta('bingbot', 'index, follow');
    
    // Viewport and other essential meta tags
    updateOrCreateMeta('viewport', 'width=device-width, initial-scale=1.0');
    updateOrCreateMeta('theme-color', '#25D366');
    updateOrCreateMeta('format-detection', 'telephone=no');

    // Open Graph tags
    updateOrCreateMeta('og:title', title, true);
    updateOrCreateMeta('og:description', description, true);
    updateOrCreateMeta('og:type', 'website', true);
    updateOrCreateMeta('og:url', canonicalUrl || `${window.location.origin}${location.pathname}`, true);
    updateOrCreateMeta('og:image', `${window.location.origin}${ogImage}`, true);
    updateOrCreateMeta('og:image:width', '1200', true);
    updateOrCreateMeta('og:image:height', '630', true);
    updateOrCreateMeta('og:site_name', 'WhatsApp Testimonial Maker', true);
    updateOrCreateMeta('og:locale', 'en_US', true);

    // Twitter Card tags
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    updateOrCreateMeta('twitter:title', title);
    updateOrCreateMeta('twitter:description', description);
    updateOrCreateMeta('twitter:image', `${window.location.origin}${ogImage}`);
    updateOrCreateMeta('twitter:site', '@testimonialmaker');
    updateOrCreateMeta('twitter:creator', '@testimonialmaker');

    // Additional SEO meta tags
    updateOrCreateMeta('application-name', 'WhatsApp Testimonial Maker');
    updateOrCreateMeta('apple-mobile-web-app-title', 'Testimonial Maker');
    updateOrCreateMeta('apple-mobile-web-app-capable', 'yes');
    updateOrCreateMeta('apple-mobile-web-app-status-bar-style', 'default');
    updateOrCreateMeta('mobile-web-app-capable', 'yes');

    // Canonical URL
    const currentCanonical = canonicalUrl || `${window.location.origin}${location.pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', currentCanonical);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', currentCanonical);
      document.head.appendChild(canonical);
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (script) {
        script.textContent = JSON.stringify(structuredData);
      } else {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
      }
    }

    // Preconnect to external domains for performance
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com'
    ];

    preconnectDomains.forEach(domain => {
      if (!document.querySelector(`link[href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        document.head.appendChild(link);
      }
    });

  }, [title, description, keywords, canonicalUrl, ogImage, structuredData, location.pathname]);

  return null;
}

// Default structured data for the main application
export const defaultStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "WhatsApp Testimonial Maker",
  "description": "Create authentic WhatsApp, Telegram, Instagram & LinkedIn testimonials instantly. Free online tool with no watermarks.",
  "url": "https://testimonialmaker.in",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "provider": {
    "@type": "Organization",
    "name": "WhatsApp Testimonial Maker",
    "url": "https://testimonialmaker.in"
  },
  "featureList": [
    "Create WhatsApp testimonials",
    "Generate Instagram testimonials", 
    "Make Telegram testimonials",
    "Create LinkedIn testimonials",
    "Highlight text in screenshots",
    "No watermarks",
    "Free to use",
    "Instant download"
  ],
  "screenshot": "https://testimonialmaker.in/app-screenshot.png"
};

// Breadcrumb structured data helper  
export const createBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((item, index) => ({
    "@type": "ListItem", 
    "position": index + 1,
    "name": item.name,
    "item": item.url.replace('whatsapptestimonialmaker.com', 'testimonialmaker.in')
  }))
});

// FAQ structured data helper
export const createFAQStructuredData = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// How-to structured data helper
export const createHowToStructuredData = (title: string, steps: Array<{name: string, text: string}>) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": title,
  "step": steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text
  }))
});