import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

export function SitemapPage() {
  const sitemapStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WhatsApp Testimonial Maker",
    "url": "https://testimonialmaker.in",
    "description": "Create authentic WhatsApp, Telegram, Instagram & LinkedIn testimonials instantly. Free online tool with no watermarks.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://testimonialmaker.in/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const pages = [
    {
      category: "Main Pages",
      links: [
        { name: "Home", url: "/", description: "WhatsApp Testimonial Maker homepage" },
        { name: "WhatsApp Testimonial Maker", url: "/whatsapp-testimonial-maker", description: "Create WhatsApp testimonials online" },
        { name: "WhatsApp", url: "/whatsapp", description: "WhatsApp testimonial creator" },
        { name: "Create Testimonial", url: "/create-testimonial", description: "Create testimonials directly" },
        { name: "Features", url: "/features", description: "All features of our testimonial maker" },
        { name: "How It Works", url: "/how-it-works", description: "Step-by-step guide to creating testimonials" },
        { name: "Examples", url: "/examples", description: "Gallery of testimonial examples" },
        { name: "FAQ", url: "/faq", description: "Frequently asked questions" },
        { name: "About", url: "/about", description: "About WhatsApp Testimonial Maker" },
        { name: "Sitemap", url: "/sitemap", description: "Website sitemap" }
      ]
    },
    {
      category: "Tools & Features",
      links: [
        { name: "Screenshot Highlighter", url: "/screenshot-highlighter", description: "Highlight text in screenshots" }
      ]
    },
    {
      category: "Platform Pages",
      links: [
        { name: "Instagram Testimonials", url: "/instagram-testimonials", description: "Create Instagram testimonials (redirects to main app)" },
        { name: "Telegram Testimonials", url: "/telegram-testimonials", description: "Create Telegram testimonials (redirects to main app)" },
        { name: "LinkedIn Testimonials", url: "/linkedin-testimonials", description: "Create LinkedIn testimonials (redirects to main app)" }
      ]
    },
    {
      category: "Blog & Articles",
      links: [
        { name: "Blog", url: "/blog", description: "Testimonial marketing tips and guides" },
        { name: "WhatsApp Testimonial Templates", url: "/blog/whatsapp-testimonial-templates", description: "Ready-to-use WhatsApp testimonial examples" },
        { name: "WhatsApp vs Traditional Reviews", url: "/blog/whatsapp-vs-traditional-reviews", description: "Why chat testimonials win every time" },
        { name: "Free WhatsApp Testimonial Maker", url: "/blog/free-whatsapp-testimonial-maker", description: "Create professional screenshots in minutes" },
        { name: "WhatsApp Testimonial Marketing", url: "/blog/whatsapp-testimonial-marketing", description: "Turn customer messages into sales magnets" },
        { name: "Testimonial Templates Guide", url: "/blog/testimonial-templates-guide", description: "Ultimate guide to winning more clients" },
        { name: "Testimonial Images Guide", url: "/blog/testimonial-images-visual-feedback", description: "Why visual feedback works better than words alone" },
        { name: "Client Testimonial Templates", url: "/blog/client-testimonial-templates-trust", description: "Win trust before you even talk" },
        { name: "Testimonial Forms Guide", url: "/blog/testimonial-forms-collecting-feedback", description: "Collecting feedback made easy" }
      ]
    }
  ];

  return (
    <>
      <SEOHead
        title="Sitemap - WhatsApp Testimonial Maker | All Pages"
        description="Complete sitemap of WhatsApp Testimonial Maker. Find all pages, tools, blog posts, and resources for creating authentic testimonials."
        keywords={[
          "sitemap",
          "whatsapp testimonial maker pages",
          "testimonial maker tools",
          "blog posts",
          "website navigation"
        ]}
        structuredData={sitemapStructuredData}
      />

      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Website Sitemap
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete navigation of all pages, tools, and resources on WhatsApp Testimonial Maker.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pages.map((section) => (
              <div key={section.category} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  {section.category}
                </h2>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.url}>
                      <Link
                        to={link.url}
                        className="block text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {link.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Sitemap URLs Section */}
          <div className="mt-16 bg-green-50 rounded-lg border-2 border-green-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🗂️ Official Sitemap URLs
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-2">Main Sitemap (Submit this to Google)</h3>
                <code className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded border">
                  https://testimonialmaker.in/sitemap.xml
                </code>
                <p className="text-sm text-gray-600 mt-2">Contains all 22 pages including blog posts</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Individual Sitemaps</h3>
                  <div className="space-y-2">
                    <div>
                      <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        https://testimonialmaker.in/sitemap-pages.xml
                      </code>
                    </div>
                    <div>
                      <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        https://testimonialmaker.in/sitemap-blog.xml
                      </code>
                    </div>
                    <div>
                      <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        https://testimonialmaker.in/sitemap-platforms.xml
                      </code>
                    </div>
                    <div>
                      <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        https://testimonialmaker.in/sitemap-tools.xml
                      </code>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Google Search Console</h3>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Submit main sitemap.xml to Google</li>
                    <li>2. Check for crawl errors</li>
                    <li>3. Request indexing for important pages</li>
                    <li>4. Monitor coverage reports</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Keywords Section */}
          <div className="mt-16 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Popular Keywords & Topics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Testimonial Creation</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>WhatsApp testimonial maker</li>
                  <li>Testimonial generator</li>
                  <li>Chat testimonial creator</li>
                  <li>Social proof generator</li>
                  <li>Fake WhatsApp generator</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Platform Specific</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>Instagram testimonial maker</li>
                  <li>Telegram testimonial generator</li>
                  <li>LinkedIn testimonial creator</li>
                  <li>WhatsApp screenshot editor</li>
                  <li>Chat bubble creator</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Marketing & Design</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>Testimonial design tool</li>
                  <li>Social media testimonials</li>
                  <li>Customer testimonial graphics</li>
                  <li>Review screenshot creator</li>
                  <li>Testimonial marketing tool</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Sitemap last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
      </main>
    </>
  );
}