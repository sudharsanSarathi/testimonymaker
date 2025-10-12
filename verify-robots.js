#!/usr/bin/env node

/**
 * Verification script to check for conflicting robots directives
 * This script helps identify potential noindex issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for robots/noindex conflicts...\n');

// Check all HTML files
function checkHTMLFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      checkHTMLFiles(fullPath);
    } else if (file.name.endsWith('.html')) {
      console.log(`📄 Checking: ${fullPath}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for noindex
      if (content.includes('noindex')) {
        console.log(`❌ FOUND NOINDEX in ${fullPath}`);
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('noindex')) {
            console.log(`   Line ${index + 1}: ${line.trim()}`);
          }
        });
      } else {
        console.log(`✅ No noindex found in ${fullPath}`);
      }
      
      // Check for robots meta tag
      const robotsMatch = content.match(/<meta[^>]*name=["']robots["'][^>]*>/gi);
      if (robotsMatch) {
        robotsMatch.forEach(meta => {
          console.log(`🤖 Robots meta: ${meta.trim()}`);
        });
      }
    }
  }
}

// Check source files for robots-related code
function checkSourceFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      checkSourceFiles(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts') || file.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('robots') || content.includes('noindex')) {
        console.log(`📄 Source file: ${fullPath}`);
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('robots') || line.includes('noindex')) {
            console.log(`   Line ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

console.log('=== HTML Files Check ===');
checkHTMLFiles('./build');
checkHTMLFiles('./public');

console.log('\n=== Source Files Check ===');
checkSourceFiles('./src');

console.log('\n=== Configuration Files Check ===');

// Check robots.txt
if (fs.existsSync('./public/robots.txt')) {
  console.log('📄 robots.txt:');
  const robotsContent = fs.readFileSync('./public/robots.txt', 'utf8');
  console.log(robotsContent);
}

// Check netlify.toml
if (fs.existsSync('./src/netlify.toml')) {
  console.log('\n📄 netlify.toml:');
  const netlifyContent = fs.readFileSync('./src/netlify.toml', 'utf8');
  if (netlifyContent.includes('X-Robots-Tag')) {
    console.log('⚠️  Found X-Robots-Tag headers in netlify.toml');
    const lines = netlifyContent.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('X-Robots-Tag')) {
        console.log(`   Line ${index + 1}: ${line.trim()}`);
      }
    });
  } else {
    console.log('✅ No X-Robots-Tag headers found');
  }
}

console.log('\n✅ Robots verification complete!');
console.log('\n📋 Summary:');
console.log('1. Ensure no "noindex" directives exist');
console.log('2. Check that robots meta tags say "index, follow"');
console.log('3. Verify robots.txt allows crawling');
console.log('4. Remove conflicting X-Robots-Tag headers');
console.log('\n🚀 After fixing, request re-indexing in Google Search Console');
