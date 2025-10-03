// Canvas Image Generator for Netlify deployment
export class CanvasImageGenerator {
  async generateImage(options: {
    messages: any[];
    containerWidth: number;
    backgroundColor: string;
    showBackground: boolean;
    whatsappBgPattern?: string;
  }): Promise<HTMLCanvasElement> {
    const { messages, containerWidth, backgroundColor, showBackground } = options;
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages to generate');
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Unable to create canvas context');
    }

    // Set canvas dimensions
    const width = containerWidth || 480;
    const height = 400; // Base height, will adjust based on content
    
    canvas.width = width;
    canvas.height = height;

    // Background
    if (showBackground) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    // WhatsApp chat background
    ctx.fillStyle = '#efeae2';
    const chatX = showBackground ? 40 : 0;
    const chatY = showBackground ? 40 : 0;
    const chatWidth = showBackground ? width - 80 : width;
    const chatHeight = showBackground ? height - 80 : height;
    
    ctx.fillRect(chatX, chatY, chatWidth, chatHeight);

    // Add WhatsApp pattern (simplified)
    this.drawWhatsAppPattern(ctx, chatX, chatY, chatWidth, chatHeight);

    // Draw messages (simplified)
    let yPos = chatY + 40;
    messages.forEach((message, index) => {
      yPos = this.drawMessage(ctx, message, chatX + 20, yPos, chatWidth - 40);
      yPos += 20; // Gap between messages
    });

    return canvas;
  }

  private drawWhatsAppPattern(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    // Simplified WhatsApp pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < width; i += 40) {
      for (let j = 0; j < height; j += 40) {
        ctx.beginPath();
        ctx.arc(x + i + 20, y + j + 20, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawMessage(ctx: CanvasRenderingContext2D, message: any, x: number, y: number, maxWidth: number): number {
    // Draw message bubble
    const bubbleWidth = Math.min(maxWidth * 0.8, 320);
    const bubbleHeight = 60; // Simplified fixed height
    
    // Bubble background
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, bubbleWidth, bubbleHeight);
    
    // Bubble border/shadow (simplified)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.strokeRect(x, y, bubbleWidth, bubbleHeight);
    
    // Message text
    ctx.fillStyle = '#111b21';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText(message.text || 'Message', x + 10, y + 25);
    
    // Time
    ctx.fillStyle = '#667781';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText(message.time || '12:00 pm', x + bubbleWidth - 60, y + bubbleHeight - 10);
    
    return y + bubbleHeight;
  }
}