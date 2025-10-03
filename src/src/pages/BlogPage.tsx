import React from 'react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';

export const BlogPage: React.FC = () => {
  const blogPosts = [
    {
      slug: 'whatsapp-testimonial-templates',
      title: 'WhatsApp Testimonial Templates',
      excerpt: 'Free templates for creating professional WhatsApp-style testimonials',
      date: '2024-01-15'
    },
    {
      slug: 'free-whatsapp-testimonial-maker',
      title: 'Free WhatsApp Testimonial Maker Guide',
      excerpt: 'Complete guide to creating testimonials with our free tool',
      date: '2024-01-10'
    },
    {
      slug: 'testimonial-templates-guide',
      title: 'Testimonial Templates Guide',
      excerpt: 'Best practices for designing effective testimonial templates',
      date: '2024-01-05'
    }
  ];

  return (
    <div className="min-h-screen py-16" style={{ backgroundColor: '#B2DCB1' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Testimonial Maker Blog
          </h1>
          <p className="text-xl text-gray-600">
            Tips, templates, and guides for creating amazing testimonials
          </p>
        </div>

        <div className="grid gap-8">
          {blogPosts.map((post) => (
            <Card key={post.slug} className="p-6 bg-white/90 backdrop-blur-sm">
              <Link to={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-green-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <p className="text-sm text-gray-500">{post.date}</p>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};