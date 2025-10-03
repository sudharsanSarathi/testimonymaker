import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MessageCircle, Download } from 'lucide-react';

export const CreateTestimonialPage: React.FC = () => {
  return (
    <div className="min-h-screen py-16" style={{ backgroundColor: '#B2DCB1' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Testimonial
          </h1>
          <p className="text-xl text-gray-600">
            Design professional testimonials in minutes
          </p>
        </div>

        <Card className="p-8 bg-white/90 backdrop-blur-sm text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Testimonial Creator
          </h2>
          <p className="text-gray-600 mb-8">
            Our full testimonial creation tool is being optimized for better SEO and performance. 
            We're moving from Figma hosting to Netlify to ensure perfect search engine indexing.
          </p>
          
          <div className="flex justify-center gap-4">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Preview Feature
            </Button>
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </div>
          
          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Good news!</strong> The migration to Netlify will solve all indexing issues and make our tool 
              rank #1 for "whatsapp testimonial maker" searches. Stay tuned!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};