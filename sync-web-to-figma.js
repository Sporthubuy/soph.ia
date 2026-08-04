#!/usr/bin/env node

/**
 * Sync Web Pages to Figma Design System
 * Captures all pages from localhost and creates frames in Figma
 * Usage: FIGMA_TOKEN=your_token node sync-web-to-figma.js
 */

const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = 'yfxASgccpiepeijz9AjGQf';
const WEB_URL = 'http://localhost:3000';

if (!FIGMA_TOKEN) {
  console.error('❌ ERROR: FIGMA_TOKEN environment variable not set');
  process.exit(1);
}

// Pages to capture
const PAGES = [
  { name: 'Landing', url: '/', width: 1440, height: 900 },
  { name: 'Login', url: '/login', width: 1440, height: 900 },
  { name: 'Register', url: '/register', width: 1440, height: 900 },
  { name: 'Dashboard - Home', url: '/en/dashboard', width: 1440, height: 900 },
  { name: 'Dashboard - Graph', url: '/en/dashboard/graph', width: 1440, height: 900 },
  { name: 'Dashboard - Editor', url: '/en/dashboard/editor', width: 1440, height: 900 },
  { name: 'Dashboard - Review', url: '/en/dashboard/review', width: 1440, height: 900 },
  { name: 'Dashboard - Agents', url: '/en/dashboard/agents', width: 1440, height: 900 },
  { name: 'Dashboard - Settings', url: '/en/dashboard/settings', width: 1440, height: 900 },
];

function uploadToFigma(imagePath, fileName) {
  return new Promise((resolve, reject) => {
    const imageData = fs.readFileSync(imagePath);

    const options = {
      hostname: 'api.figma.com',
      port: 443,
      path: `/v1/files/${FILE_KEY}/images`,
      method: 'POST',
      headers: {
        'X-Figma-Token': FIGMA_TOKEN,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`Upload failed: ${data}`));
        } else {
          resolve(JSON.parse(data));
        }
      });
    });

    req.on('error', reject);

    // Send image as multipart (Note: Figma API requires special handling)
    // For now, we'll use a simpler approach via plugin
    reject(new Error('Direct image upload requires Figma plugin. Use console approach instead.'));
  });
}

async function capturePages() {
  console.log('🚀 Starting web-to-Figma sync...\n');

  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const screenshots = [];

    for (const page of PAGES) {
      try {
        console.log(`📸 Capturing: ${page.name}`);
        const browserPage = await browser.newPage();
        await browserPage.setViewport({ width: page.width, height: page.height });

        const fullUrl = WEB_URL + page.url;
        await browserPage.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 10000 });

        const screenshotPath = `/tmp/screenshot-${page.name.replace(/ /g, '-')}.png`;
        await browserPage.screenshot({ path: screenshotPath, fullPage: false });

        screenshots.push({
          name: page.name,
          url: fullUrl,
          path: screenshotPath,
          width: page.width,
          height: page.height,
        });

        await browserPage.close();
        console.log(`  ✅ Saved to ${screenshotPath}`);
      } catch (err) {
        console.log(`  ⚠️  Skipped (${err.message})`);
      }
    }

    console.log(`\n✅ Captured ${screenshots.length} pages\n`);
    console.log('📋 Screenshots created:');
    screenshots.forEach(s => console.log(`   • ${s.name}: ${s.path}`));

    return screenshots;
  } finally {
    if (browser) await browser.close();
  }
}

async function main() {
  try {
    // Step 1: Capture web pages
    const screenshots = await capturePages();

    // Step 2: Create Figma script to insert images
    console.log('\n💡 Next: Insert images into Figma via plugin console\n');

    const screenshotJson = JSON.stringify(screenshots, null, 2);
    console.log('📄 Screenshots data:');
    console.log(screenshotJson);

    console.log('\n\n🔧 TO INSERT IN FIGMA:');
    console.log('1. Open Figma: ' + `https://figma.com/design/${FILE_KEY}`);
    console.log('2. Menu ⋮ → Plugins → Development → Show console');
    console.log('3. Paste the script below and run it:\n');

    const figmaScript = `
// Insert web screenshots into Figma
const FILE_KEY = '${FILE_KEY}';
const screenshots = ${screenshotJson};

(async () => {
  let screenPage = figma.root.children.find(p => p.name === "Web Screens");
  if (!screenPage) {
    screenPage = figma.createPage();
    screenPage.name = "Web Screens";
  }
  await figma.setCurrentPageAsync(screenPage);

  let x = 0;
  for (const screenshot of screenshots) {
    const frame = figma.createFrame();
    frame.name = screenshot.name;
    frame.resize(screenshot.width, screenshot.height);
    frame.x = x;
    frame.y = 0;
    screenPage.appendChild(frame);

    console.log(\`✅ Created frame: \${screenshot.name}\`);
    x += screenshot.width + 100;
  }

  return { success: true, framesCreated: screenshots.length };
})()
`;

    console.log(figmaScript);
    console.log('\n\n✅ Ready! Copy the script above and paste it in Figma console.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
