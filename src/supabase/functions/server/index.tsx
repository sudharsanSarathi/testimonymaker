import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors({
  origin: '*', // Allow all origins for now
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Enable logging
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Health check route
app.get('/make-server-a2080617/', (c) => {
  return c.json({ message: 'WhatsApp Testimonial Maker server is running!' });
});

// Handle preflight OPTIONS requests
app.options('*', (c) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// Save email route for early access subscribers
app.post('/make-server-a2080617/save-email', async (c) => {
  console.log('Save email endpoint called');
  
  try {
    // Log request details for debugging
    console.log('Request method:', c.req.method);
    console.log('Request URL:', c.req.url);
    console.log('Content-Type:', c.req.header('content-type'));
    console.log('Authorization header present:', c.req.header('authorization') ? 'Yes' : 'No');
    
    const body = await c.req.json();
    console.log('Request body:', body);
    
    const { email, timestamp } = body;

    if (!email || !email.trim()) {
      console.log('Missing email in request');
      return c.json({ error: 'Email is required' }, 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return c.json({ error: 'Invalid email format' }, 400);
    }

    const emailData = {
      email: email.trim().toLowerCase(),
      timestamp: timestamp || new Date().toISOString(),
      source: 'early_access_popup',
      userAgent: c.req.header('user-agent') || 'unknown',
      ip: c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown'
    };

    console.log('Processing email data:', emailData);

    try {
      // Check if email already exists
      console.log('Checking if email exists...');
      const existingEmail = await kv.get(`email:${emailData.email}`);
      if (existingEmail) {
        console.log(`Email already exists: ${emailData.email}`);
        return c.json({ message: 'Email already registered', exists: true });
      }

      // Save email to KV store
      console.log('Saving email to KV store...');
      await kv.set(`email:${emailData.email}`, emailData);
      
      // Also save to a list for easy retrieval
      console.log('Fetching current email list...');
      let emailList;
      try {
        emailList = await kv.get('email_list');
        if (!Array.isArray(emailList)) {
          console.log('Email list not found or invalid, creating new one');
          emailList = [];
        }
      } catch (listError) {
        console.log('Error fetching email list, creating new one:', listError.message);
        emailList = [];
      }
      
      console.log(`Current email list length: ${emailList.length}`);
      emailList.push(emailData);
      
      console.log('Saving updated email list...');
      await kv.set('email_list', emailList);

      console.log(`Email saved successfully: ${emailData.email}`);
      console.log(`Total emails now: ${emailList.length}`);
      
      return c.json({ 
        message: 'Email saved successfully',
        email: emailData.email,
        totalEmails: emailList.length
      });

    } catch (kvError) {
      console.error('KV store error:', kvError);
      console.error('KV error stack:', kvError.stack);
      return c.json({ 
        error: 'Database error while saving email',
        details: kvError.message,
        type: kvError.constructor.name
      }, 500);
    }

  } catch (error) {
    console.error('Error saving email (general):', error);
    console.error('Error stack:', error.stack);
    
    return c.json({ 
      error: 'Failed to save email',
      details: error.message,
      type: error.constructor.name
    }, 500);
  }
});

// Get all emails route (for admin purposes)
app.get('/make-server-a2080617/emails', async (c) => {
  try {
    const emailList = await kv.get('email_list') || [];
    return c.json({ 
      emails: emailList,
      count: emailList.length 
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return c.json({ 
      error: 'Failed to fetch emails',
      details: error.message 
    }, 500);
  }
});

// Start the server
// User Analytics Tracking - Single Event (Legacy)
app.post('/make-server-a2080617/track-event', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Analytics tracking request:', body);
    
    const { event, data, sessionId, timestamp } = body;

    if (!event) {
      return c.json({ error: 'Event name is required' }, 400);
    }

    // Store analytics data in KV store
    const analyticsKey = `analytics_${event}_${Date.now()}_${Math.random()}`;
    const analyticsData = {
      event,
      data: data || {},
      sessionId: sessionId || 'anonymous',
      timestamp: timestamp || new Date().toISOString(),
      userAgent: c.req.header('user-agent') || 'unknown',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    };

    await kv.set(analyticsKey, analyticsData);

    return c.json({ 
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking analytics:', error);
    return c.json({ 
      error: 'Failed to track event',
      details: error.message 
    }, 500);
  }
});

// User Analytics Tracking - Batch Events (Optimized)
app.post('/make-server-a2080617/track-events-batch', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Analytics batch tracking request:', { count: body.events?.length || 0 });
    
    const { events } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return c.json({ error: 'Events array is required' }, 400);
    }

    // Limit batch size for performance
    const limitedEvents = events.slice(0, 50);
    
    // Process all events in parallel for better performance
    const promises = limitedEvents.map(async (eventData) => {
      const { event, data, sessionId, timestamp } = eventData;
      
      if (!event) return null; // Skip invalid events
      
      const analyticsKey = `analytics_${event}_${Date.now()}_${Math.random()}`;
      const analyticsRecord = {
        event,
        data: data || {},
        sessionId: sessionId || 'anonymous',
        timestamp: timestamp || new Date().toISOString(),
        userAgent: c.req.header('user-agent') || 'unknown',
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
      };

      return kv.set(analyticsKey, analyticsRecord);
    });

    // Wait for all events to be stored
    await Promise.allSettled(promises);

    return c.json({ 
      success: true,
      message: `Batch of ${limitedEvents.length} events tracked successfully`
    });

  } catch (error) {
    console.error('Error tracking analytics batch:', error);
    return c.json({ 
      error: 'Failed to track events batch',
      details: error.message 
    }, 500);
  }
});

// Get Analytics Data (for admin/debugging purposes)
app.get('/make-server-a2080617/analytics/:event', async (c) => {
  try {
    const event = c.req.param('event');
    console.log('Fetching analytics for event:', event);

    // Get all analytics data for this event type
    const analyticsData = await kv.getByPrefix(`analytics_${event}_`);
    
    // Sort by timestamp (newest first)
    const sortedData = analyticsData.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return c.json({ 
      event,
      count: sortedData.length,
      data: sortedData.slice(0, 100) // Return latest 100 events
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    }, 500);
  }
});

// Get overall analytics summary
app.get('/make-server-a2080617/analytics-summary', async (c) => {
  try {
    console.log('Fetching analytics summary');

    // Get all analytics data
    const allAnalytics = await kv.getByPrefix('analytics_');
    
    // Group by event type
    const summary = {};
    allAnalytics.forEach(item => {
      const event = item.event;
      if (!summary[event]) {
        summary[event] = {
          count: 0,
          latest: null,
          earliest: null
        };
      }
      summary[event].count++;
      
      const timestamp = new Date(item.timestamp);
      if (!summary[event].latest || timestamp > new Date(summary[event].latest)) {
        summary[event].latest = item.timestamp;
      }
      if (!summary[event].earliest || timestamp < new Date(summary[event].earliest)) {
        summary[event].earliest = item.timestamp;
      }
    });

    return c.json({ 
      total_events: allAnalytics.length,
      summary
    });

  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return c.json({ 
      error: 'Failed to fetch analytics summary',
      details: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);