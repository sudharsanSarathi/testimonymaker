import React from 'react';

export const Autoscroll: React.FC = () => {
  return (
    <div className="w-full overflow-hidden">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Trusted by Creators Worldwide
        </h2>
        <p className="text-gray-600">
          Join thousands who've created stunning testimonials
        </p>
      </div>
      
      {/* Simplified testimonial preview */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              ✓
            </div>
            <div>
              <p className="font-semibold text-gray-900">Sarah Johnson</p>
              <p className="text-sm text-gray-500">Marketing Director</p>
            </div>
          </div>
          <p className="text-gray-700 italic">
            "This tool saved me hours of work. Created professional testimonials in minutes!"
          </p>
        </div>
      </div>
    </div>
  );
};