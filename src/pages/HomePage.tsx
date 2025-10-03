import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Zap, Shield, Download, Share2 } from 'lucide-react';
import { SEOHead, defaultStructuredData } from '../components/SEOHead';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function HomePage() {
  const testimonials = [
    {
      text: "This tool saved me hours of design work. I can create professional testimonials in seconds!",
      author: "Sarah Chen",
      role: "Marketing Manager",
      rating: 5
    },
    {
      text: "Perfect for social proof. My conversion rates increased by 40% after using these testimonials.",
      author: "Mike Rodriguez", 
      role: "E-commerce Owner",
      rating: 5
    },
    {
      text: "So easy to use! I love how authentic the WhatsApp testimonials look.",
      author: "Emily Johnson",
      role: "Content Creator",
      rating: 5
    }
  ];

  const homeStructuredData = {
    ...defaultStructuredData,
    "@type": ["WebApplication", "SoftwareApplication"],
    "headline": "WhatsApp Testimonial Maker - Create Stunning Chat Testimonials in Seconds",
    "url": "https://testimonialmaker.in",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1247",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": testimonials.map(testimonial => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": testimonial.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": testimonial.rating,
        "bestRating": "5"
      },
      "reviewBody": testimonial.text
    }))
  };

  return (
    <>
      <SEOHead
        title="WhatsApp Testimonial Maker - Create Stunning Chat Testimonials in Seconds"
        description="Create authentic WhatsApp, Telegram, Instagram & LinkedIn testimonials instantly. Free online tool with no watermarks. Upload screenshots, highlight text, and generate professional testimonials for social proof."
        keywords={[
          "whatsapp testimonial maker",
          "testimonial generator",
          "whatsapp screenshot editor", 
          "social proof generator",
          "chat testimonial creator",
          "instagram testimonial maker",
          "telegram testimonial generator",
          "linkedin testimonial creator",
          "free testimonial maker",
          "testimonial design tool"
        ]}
        structuredData={homeStructuredData}
      />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-gray-200">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ creators</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Create <span className="text-green-600">WhatsApp Testimonials</span><br />
                in Seconds
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Generate authentic testimonials from WhatsApp, Instagram, Telegram & LinkedIn chats. 
                Perfect for social proof, marketing, and building trust with your audience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link to="/whatsapp-testimonial-maker">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                    Start Creating Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                
                <Link to="/blog">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-medium rounded-xl border-2 hover:bg-gray-50 transition-all duration-200">
                    Read Blog
                  </Button>
                </Link>
              </div>

              {/* Key Features */}
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>100% Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>No Watermarks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>No Sign-up Required</span>
                </div>
              </div>
            </div>
          </div>
        </section>





        {/* Social Proof Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Loved by Creators Worldwide
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of marketers, creators, and business owners who trust our tool.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-4 italic">
                    "{testimonial.text}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Create Your First Testimonial?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of creators who use our tool to build social proof and increase conversions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/whatsapp-testimonial-maker">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                  Start Creating Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              
              <Link to="/blog">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200">
                  Read Blog
                </Button>
              </Link>
            </div>

            <p className="text-sm mt-4 opacity-75">
              No sign-up required • 100% free • No watermarks
            </p>
          </div>
        </section>
      </main>
    </>
  );
}