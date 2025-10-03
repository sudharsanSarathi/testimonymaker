import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/card';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const blogContent = {
    'whatsapp-testimonial-templates': {
      title: 'WhatsApp Testimonial Templates',
      content: `
        <h2>Professional WhatsApp Testimonial Templates</h2>
        <p>Creating authentic-looking WhatsApp testimonials is easier than ever with our free templates.</p>
        
        <h3>Key Features</h3>
        <ul>
          <li>Realistic WhatsApp interface design</li>
          <li>Customizable message content</li>
          <li>Multiple layout options</li>
          <li>High-quality export options</li>
        </ul>
        
        <h3>How to Use</h3>
        <p>Follow these simple steps to create your testimonial:</p>
        <ol>
          <li>Choose your preferred template</li>
          <li>Add your testimonial text</li>
          <li>Customize the appearance</li>
          <li>Download your finished testimonial</li>
        </ol>
      `
    },
    'free-whatsapp-testimonial-maker': {
      title: 'Free WhatsApp Testimonial Maker Guide',
      content: `
        <h2>Complete Guide to WhatsApp Testimonial Maker</h2>
        <p>Learn how to create professional testimonials that boost your credibility and conversions.</p>
        
        <h3>Why Use WhatsApp-Style Testimonials?</h3>
        <p>WhatsApp testimonials feel more authentic and personal than traditional reviews.</p>
        
        <h3>Best Practices</h3>
        <ul>
          <li>Keep messages concise and natural</li>
          <li>Use realistic timestamps</li>
          <li>Include customer names when possible</li>
          <li>Maintain consistent branding</li>
        </ul>
      `
    },
    'testimonial-templates-guide': {
      title: 'Testimonial Templates Guide',
      content: `
        <h2>Designing Effective Testimonial Templates</h2>
        <p>Master the art of creating compelling testimonial designs that convert.</p>
        
        <h3>Template Design Principles</h3>
        <ul>
          <li>Clear hierarchy and readability</li>
          <li>Consistent visual styling</li>
          <li>Mobile-friendly layouts</li>
          <li>Brand alignment</li>
        </ul>
        
        <h3>Common Mistakes to Avoid</h3>
        <p>Learn from these common pitfalls when creating testimonials.</p>
      `
    }
  };

  const post = slug ? blogContent[slug as keyof typeof blogContent] : null;

  if (!post) {
    return (
      <div className="min-h-screen py-16" style={{ backgroundColor: '#B2DCB1' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600">The blog post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16" style={{ backgroundColor: '#B2DCB1' }}>
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-8 bg-white/90 backdrop-blur-sm">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
          <div 
            className="blog-article prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Card>
      </div>
    </div>
  );
};