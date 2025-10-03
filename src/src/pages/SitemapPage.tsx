import React from 'react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';

export const SitemapPage: React.FC = () => {
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Create Testimonial', path: '/create-testimonial' },
    { name: 'Screenshot Highlighter', path: '/screenshot-highlighter' },
    { name: 'Blog', path: '/blog' },
    { name: 'WhatsApp Testimonials', path: '/whatsapp-testimonial-maker' }
  ];

  return (
    <div className="min-h-screen py-16" style={{ backgroundColor: '#B2DCB1' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sitemap
          </h1>
          <p className="text-xl text-gray-600">
            Navigate through all pages of our website
          </p>
        </div>

        <Card className="p-8 bg-white/90 backdrop-blur-sm">
          <div className="grid md:grid-cols-2 gap-6">
            {pages.map((page) => (
              <Link
                key={page.path}
                to={page.path}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{page.name}</h3>
                <p className="text-sm text-gray-600">{page.path}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};