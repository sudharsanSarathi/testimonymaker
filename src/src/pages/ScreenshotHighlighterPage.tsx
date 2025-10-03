import React from 'react';
import { Card } from '../components/ui/card';
import { ScreenshotHighlighter } from '../components/ScreenshotHighlighter';

export const ScreenshotHighlighterPage: React.FC = () => {
  return (
    <div className="min-h-screen py-16" style={{ backgroundColor: '#B2DCB1' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Screenshot Highlighter
          </h1>
          <p className="text-xl text-gray-600">
            Upload and highlight important parts of your screenshots
          </p>
        </div>

        <ScreenshotHighlighter />
      </div>
    </div>
  );
};