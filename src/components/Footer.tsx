import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from 'figma:asset/b202f9db7574a7ce1d1f828a2bccf33e6d2398c1.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'WhatsApp Testimonials', href: '/whatsapp-testimonial-maker' },
      { name: 'Instagram Testimonials', href: '/instagram-testimonials' },
      { name: 'Telegram Testimonials', href: '/telegram-testimonials' },
      { name: 'LinkedIn Testimonials', href: '/linkedin-testimonials' }
    ],
    resources: [
      { name: 'Blog', href: '/blog' }
    ],
    tools: [
      { name: 'Screenshot Highlighter', href: '/whatsapp-testimonial-maker?tab=screenshot-highlighter' },
      { name: 'Text Extractor', href: '/whatsapp-testimonial-maker?tab=testimony-maker' },
      { name: 'Social Proof Generator', href: '/' },
      { name: 'Chat Bubble Creator', href: '/' }
    ]
  };

  return (
    <footer className="text-gray-800" role="contentinfo" style={{ backgroundColor: '#E4FAE3' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src={logoImage} alt="Testimonial Maker Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold">Testimonial Maker</span>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Create authentic testimonials from WhatsApp, Instagram, Telegram, and LinkedIn chats in seconds. 
              Trusted by 1000+ creators worldwide.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:sudharsan.sarathi@gmail.com?subject=Contact Us - Testimonial Maker&body=Hi Sudharsan,%0D%0A%0D%0AI would like to get in touch regarding the Testimonial Maker tool.%0D%0A%0D%0ABest regards"
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm flex items-center gap-2"
                  onClick={(e) => {
                    // Track email click for analytics
                    setTimeout(() => {
                      console.log('Contact email clicked');
                    }, 0);
                  }}
                >
                  <span>📧</span>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Tools Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Tools
            </h3>
            <ul className="space-y-3">
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-600">
          <div className="flex justify-center items-center">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>© {currentYear} WhatsApp Testimonial Maker. Made with ❤️ for creators worldwide.</span>
            </div>
          </div>
          
          {/* SEO Rich Keywords Footer */}
          <div className="mt-8 pt-6 border-t border-gray-600 text-xs text-gray-500">
            <p className="leading-relaxed">
              <strong>Keywords:</strong> whatsapp testimonial maker, testimonial generator, whatsapp screenshot editor, 
              social proof generator, chat testimonial creator, instagram testimonial maker, telegram testimonial generator, 
              linkedin testimonial creator, testimonial design tool, whatsapp chat creator, 
              social media testimonial maker, customer testimonial generator, review screenshot creator, 
              whatsapp bubble generator, testimonial design software, chat bubble creator, social proof tool, 
              testimonial graphics maker, whatsapp mockup generator
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}