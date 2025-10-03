import React from 'react';

const WhatsappBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 opacity-40 z-0">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="whatsapp-pattern"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* Base background */}
            <rect width="120" height="120" fill="#E5DDD5" />
            {/* Dot pattern that matches WhatsApp's actual background */}
            <circle cx="30" cy="30" r="1" fill="white" opacity="0.4" />
            <circle cx="90" cy="90" r="1" fill="white" opacity="0.4" />
            <circle cx="30" cy="90" r="0.8" fill="white" opacity="0.3" />
            <circle cx="90" cy="30" r="0.8" fill="white" opacity="0.3" />
            <circle cx="60" cy="15" r="0.6" fill="white" opacity="0.25" />
            <circle cx="15" cy="60" r="0.6" fill="white" opacity="0.25" />
            <circle cx="105" cy="60" r="0.6" fill="white" opacity="0.25" />
            <circle cx="60" cy="105" r="0.6" fill="white" opacity="0.25" />
            {/* Additional texture dots */}
            <circle cx="45" cy="45" r="0.5" fill="white" opacity="0.2" />
            <circle cx="75" cy="75" r="0.5" fill="white" opacity="0.2" />
            <circle cx="15" cy="15" r="0.4" fill="white" opacity="0.15" />
            <circle cx="105" cy="105" r="0.4" fill="white" opacity="0.15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#whatsapp-pattern)" />
      </svg>
    </div>
  );
};

export default WhatsappBackground;