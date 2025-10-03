import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { ScreenshotHighlighter } from '../components/ScreenshotHighlighter';
import { Button } from '../components/ui/button';
import logoImage from 'figma:asset/b202f9db7574a7ce1d1f828a2bccf33e6d2398c1.png';

// SEO and Document Title Component for the screenshot highlighter page
function DocumentHead() {
  const location = useLocation();
  
  useEffect(() => {
    // Update document title and meta tags for the screenshot highlighter page
    document.title = "Screenshot Highlighter - Highlight Text in Screenshots";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Highlight important text in screenshots with our free online tool. Perfect for testimonials, social media posts, and content creation. No downloads required.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Highlight important text in screenshots with our free online tool. Perfect for testimonials, social media posts, and content creation. No downloads required.';
      document.head.appendChild(meta);
    }

    // Additional SEO meta tags
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

    // Keywords and additional meta tags
    updateOrCreateMeta('keywords', 'screenshot highlighter, highlight text in image, screenshot editor, text highlighter tool, image text highlighter, screenshot markup');
    updateOrCreateMeta('author', 'WhatsApp Testimonial Maker');
    updateOrCreateMeta('robots', 'index, follow');

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

    // Open Graph tags
    updateOrCreateMeta('og:title', 'Screenshot Highlighter - Highlight Text in Screenshots', true);
    updateOrCreateMeta('og:description', 'Highlight important text in screenshots with our free online tool. Perfect for testimonials, social media posts, and content creation.', true);
    updateOrCreateMeta('og:url', currentUrl, true);
    updateOrCreateMeta('og:type', 'website', true);
    updateOrCreateMeta('og:site_name', 'WhatsApp Testimonial Maker', true);
    
    // Twitter Card tags
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    updateOrCreateMeta('twitter:title', 'Screenshot Highlighter - Highlight Text in Screenshots');
    updateOrCreateMeta('twitter:description', 'Highlight important text in screenshots with our free online tool. Perfect for testimonials, social media posts, and content creation.');
    
  }, [location]);

  return null;
}

export function ScreenshotHighlighterPage() {
  // Customizable website background
  const websiteBackgroundStyle: React.CSSProperties = {
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

  return (
    <>
      <DocumentHead />
      <div style={websiteBackgroundStyle}>
        {/* WebBg */}
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

        <div style={overlayBackgroundStyle}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-[81px] max-[600px]:pt-[32px] pb-8">
          {/* Hero Section */}
          <div className="text-center mb-[42px] mt-[0px] mr-[0px] ml-[0px] opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
            <div className="block min-[600px]:hidden mb-5">
              <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden">
                <img src={logoImage} alt="Testimonial Maker" className="w-full h-full object-cover" />
              </div>
            </div>

            <p className="text-sm md:text-base text-[rgba(9,10,9,1)] mb-[-13px] italic font-light font-[Fira_Mono] text-[16px] mt-[0px] mr-[0px] ml-[0px]">
              Trusted by 100+ creators ❤️.
            </p>
            
            <div className="mt-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 font-[Anton] flex items-center justify-center gap-4" style={{ lineHeight: '1.5' }}>
                Screenshot Highlighter
                <div className="w-12 h-12 md:w-16 md:h-16 hidden min-[600px]:block rounded-lg overflow-hidden">
                  <img src={logoImage} alt="Testimonial Maker" className="w-full h-full object-cover" />
                </div>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Highlight important text in screenshots with our free online tool. Perfect for testimonials and content creation.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/">
                  <Button 
                    variant="outline" 
                    className="bg-white/90 backdrop-blur-sm hover:bg-white border-gray-300 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </Button>
                </Link>
                
                <Link to="/">
                  <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Create New WhatsApp Message
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
            <div className="max-w-7xl mx-auto">
              <ScreenshotHighlighter />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 mb-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_1s_forwards]">
            <p className="text-sm text-gray-600">
              Crafted with ❤️ for creators, by a creator 
            </p>
          </div>
        </div>
      </div>
    </>
  );
}