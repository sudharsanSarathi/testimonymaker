import React from 'react';
import { Card } from './ui/card';

export const ScreenshotHighlighter: React.FC = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Screenshot Highlighter</h2>
      <p className="text-gray-600 mb-4">
        Upload a screenshot and highlight important text for social media posts.
      </p>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">Coming soon - Upload screenshot functionality</p>
      </div>
    </Card>
  );
};