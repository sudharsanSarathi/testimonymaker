# Google Analytics Setup Guide

## Quick Setup Instructions

### 1. Get Your Google Analytics Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new account or use an existing one
3. Create a new property for your website `testimonialmaker.in`
4. Choose "Web" as the platform
5. Add your website URL: `https://testimonialmaker.in`
6. Copy your **Measurement ID** (it looks like `G-XXXXXXXXXX`)

### 2. Update Your Code

1. Open `/components/GoogleAnalytics.tsx`
2. Find this line:
   ```typescript
   const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 Measurement ID
   ```
3. Replace `G-XXXXXXXXXX` with your actual Measurement ID from step 1

### 3. What's Being Tracked

Your Google Analytics will automatically track:

#### **Page Views**
- Every page visit across your site
- Time spent on each page
- User navigation patterns

#### **User Engagement**
- Time spent on site
- Page visibility changes
- User interaction depth

#### **Testimonial Maker Events**
- Message creation (text, image, text+image)
- Platform selection (WhatsApp, Instagram, etc.)
- Downloads and shares
- Tab switching between tools

#### **Lead Generation**
- Email signups
- User engagement with popup

#### **Custom Events**
- OCR text extraction usage
- Background customization
- Message editing and deletion

### 4. Privacy & GDPR Compliance

The implementation includes privacy-friendly settings:
- IP anonymization enabled
- No Google Signals
- Enhanced measurement for better insights
- Non-blocking analytics (won't slow down your site)

### 5. Viewing Your Data

1. Go to Google Analytics dashboard
2. Check **Reports > Realtime** to see live visitors
3. Use **Reports > Engagement > Events** to see custom events
4. Check **Reports > Acquisition** to see traffic sources

### 6. Custom Events You Can Track

The system includes these custom tracking functions:

```typescript
// Track testimonial-specific actions
trackTestimonialEvent('custom_action', { 
  platform: 'whatsapp',
  feature: 'background_color' 
});

// Track downloads
trackDownload('testimonial.png', 'image');

// Track social sharing
trackShare('native_share', 'testimonial');

// Track general events
trackGAEvent('button_click', {
  button_name: 'create_testimonial',
  location: 'homepage'
});
```

### 7. Testing Your Setup

1. Visit your website
2. Navigate between pages
3. Create a testimonial
4. Check Google Analytics Realtime reports
5. You should see your activity appearing live

## Troubleshooting

- **No data showing?** Check your Measurement ID is correct
- **Events not tracked?** Open browser console and look for any JavaScript errors
- **Page views missing?** Ensure your domain is correctly configured in GA

## Benefits of This Setup

✅ **Dual Analytics**: Data goes to both your Supabase backend AND Google Analytics  
✅ **Non-blocking**: Won't slow down your website  
✅ **Privacy-friendly**: GDPR compliant settings  
✅ **Comprehensive**: Tracks both standard and custom events  
✅ **Easy to extend**: Add new tracking with simple function calls  

---

**Need help?** The analytics are designed to work seamlessly with your existing system without any conflicts.