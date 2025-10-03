import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen py-16" style={{ backgroundColor: '#B2DCB1' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free Testimonial Maker
          </h1>
          <p className="text-xl text-gray-600">
            Create professional testimonials in minutes
          </p>
        </div>

        <Card className="p-8 bg-white/90 backdrop-blur-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Start Creating Now
          </h2>
          <p className="text-gray-600 mb-8">
            Design beautiful testimonials with our easy-to-use tools.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link to="/create-testimonial">
              <Button className="bg-green-500 hover:bg-green-600">
                Create Testimonial
              </Button>
            </Link>
            <Link to="/screenshot-highlighter">
              <Button variant="outline">
                Screenshot Tool
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};