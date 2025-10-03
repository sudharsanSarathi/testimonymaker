// FIXED iframe generation - Complete solution for both issues

// This shows what needs to be fixed:
// 1. Background image pattern needs to be improved
// 2. Message bubble shadows need to be added in CSS
// 3. HTML structure needs the class="message-bubble" for shadows
// 4. Height needs to wrap properly without fixed constraints

// New WhatsApp background pattern
const whatsappBackgroundSVG = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="whatsapp-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
      <rect width="120" height="120" fill="#E5DDD5"/>
      <circle cx="30" cy="30" r="1" fill="white" opacity="0.4"/>
      <circle cx="90" cy="90" r="1" fill="white" opacity="0.4"/>
      <circle cx="30" cy="90" r="0.8" fill="white" opacity="0.3"/>
      <circle cx="90" cy="30" r="0.8" fill="white" opacity="0.3"/>
      <circle cx="60" cy="15" r="0.6" fill="white" opacity="0.25"/>
      <circle cx="15" cy="60" r="0.6" fill="white" opacity="0.25"/>
      <circle cx="105" cy="60" r="0.6" fill="white" opacity="0.25"/>
      <circle cx="60" cy="105" r="0.6" fill="white" opacity="0.25"/>
      <circle cx="45" cy="45" r="0.5" fill="white" opacity="0.2"/>
      <circle cx="75" cy="75" r="0.5" fill="white" opacity="0.2"/>
      <circle cx="15" cy="15" r="0.4" fill="white" opacity="0.15"/>
      <circle cx="105" cy="105" r="0.4" fill="white" opacity="0.15"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#whatsapp-pattern)"/>
</svg>`;

// Fixed CSS with proper shadows
const css = `
  .chat-container {
    background-color: #efeae2;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    padding: 35px 12px 40px 12px;
    width: 100%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  .chat-background {
    position: absolute;
    inset: 0;
    background-image: url('data:image/svg+xml;charset=utf8,${encodeURIComponent(whatsappBackgroundSVG)}');
    background-size: 120px 120px;
    background-repeat: repeat;
    opacity: 0.4;
    z-index: 1;
  }
  .message-bubble {
    box-shadow: 0px 1px 0.5px 0px rgba(11,20,26,0.13);
  }
`;

// Fixed message HTML with proper classes
const messageHTML = `
  <div class="message-bubble" style="background-color: white; border-radius: 7.5px; border-top-left-radius: 0px; margin-left: 8px; position: relative; display: flex; align-items: flex-start; padding: 8px;">
    <!-- content -->
  </div>
`;

// Fixed iframe with proper height handling
const iframeCode = `<iframe 
  src="${dataUri}" 
  width="100%" 
  style="border-radius: 12px; max-width: 520px; border: none; min-height: 200px; overflow: hidden;" 
  scrolling="no"
  onload="this.style.height = (this.contentWindow.document.body.scrollHeight + 16) + 'px';"
></iframe>`;