# Netlify Configuration Files - Manual Setup Required

Since Figma's system automatically converts files to React components, you need to create these files manually in your deployment environment.

## File 1: _headers (no extension)

Create a file named `_headers` (no extension) in your `/public/` folder with this exact content:

```
# Headers for all pages to ensure proper search engine indexing
/*
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

# Specific headers for main application routes
/
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1

/whatsapp-testimonial-maker
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1

/blog/*
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1

/create-testimonial
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1

/screenshot-highlighter
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1
```

## File 2: _redirects (no extension)

Create a file named `_redirects` (no extension) in your `/public/` folder with this exact content:

```
# Force robots.txt to be served as text/plain
/robots.txt   /robots.txt   200!  Content-Type: text/plain

# Ensure sitemaps are served correctly
/sitemap.xml   /sitemap.xml   200!  Content-Type: application/xml
/sitemap-*.xml   /sitemap-*.xml   200!  Content-Type: application/xml

# Handle SPA routing - this should be last
/*    /index.html   200
```

## Manual Creation Steps:

### Option A: Using VS Code or Text Editor
1. Open your project in VS Code (or any text editor)
2. Navigate to the `/public/` folder
3. Right-click → New File
4. Name it exactly `_headers` (no extension)
5. Paste the content from above
6. Repeat for `_redirects`

### Option B: Using Terminal/Command Line
```bash
# Navigate to your project's public folder
cd your-project/public/

# Create _headers file
cat > _headers << 'EOF'
# Headers for all pages to ensure proper search engine indexing
/*
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

# Specific headers for main application routes
/
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1

/whatsapp-testimonial-maker
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1

/blog/*
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1

/create-testimonial
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1

/screenshot-highlighter
  X-Robots-Tag: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1
EOF

# Create _redirects file
cat > _redirects << 'EOF'
# Force robots.txt to be served as text/plain
/robots.txt   /robots.txt   200!  Content-Type: text/plain

# Ensure sitemaps are served correctly
/sitemap.xml   /sitemap.xml   200!  Content-Type: application/xml
/sitemap-*.xml   /sitemap-*.xml   200!  Content-Type: application/xml

# Handle SPA routing - this should be last
/*    /index.html   200
EOF
```

### Option C: Direct in Netlify Dashboard
1. Go to your Netlify site dashboard
2. Site settings → Build & deploy → Build settings
3. Add these as environment variables or post-processing rules

## Files to Delete (Clean Up)
After creating the proper files, delete these incorrect ones:
- `/public/_headers.tsx`
- `/public/headers_txt.tsx` 
- `/public/redirects.txt`
- `/public/netlify_headers_config/` (entire directory)
- `/public/netlify_redirects_config/` (entire directory)

## Expected Result
Your `/public/` folder should have:
- `_headers` (plain text, no extension)
- `_redirects` (plain text, no extension)  
- `robots.txt` (already correct)

This will fix your PageSpeed Insights robots.txt errors by forcing the correct Content-Type headers.