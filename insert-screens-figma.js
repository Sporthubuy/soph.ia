#!/usr/bin/env node

/**
 * Insert web screenshots into Figma with images
 * Reads screenshots as base64 and creates frames in Figma
 */

const fs = require('fs');

const SCREENSHOTS = [
  { name: "Landing", path: "/tmp/screenshot-Landing.png" },
  { name: "Login", path: "/tmp/screenshot-Login.png" },
  { name: "Register", path: "/tmp/screenshot-Register.png" },
  { name: "Dashboard - Home", path: "/tmp/screenshot-Dashboard---Home.png" },
  { name: "Dashboard - Graph", path: "/tmp/screenshot-Dashboard---Graph.png" },
  { name: "Dashboard - Editor", path: "/tmp/screenshot-Dashboard---Editor.png" },
  { name: "Dashboard - Review", path: "/tmp/screenshot-Dashboard---Review.png" },
  { name: "Dashboard - Agents", path: "/tmp/screenshot-Dashboard---Agents.png" },
  { name: "Dashboard - Settings", path: "/tmp/screenshot-Dashboard---Settings.png" },
];

console.log('📝 Generating Figma plugin script...\n');

// Convert images to base64
const screenshotsWithBase64 = SCREENSHOTS.map(s => {
  try {
    const imageBuffer = fs.readFileSync(s.path);
    const base64 = imageBuffer.toString('base64');
    console.log(`✅ ${s.name}: ${(base64.length / 1024).toFixed(1)}KB`);
    return { ...s, base64 };
  } catch (err) {
    console.log(`❌ ${s.name}: File not found`);
    return null;
  }
}).filter(Boolean);

const figmaScript = `
// Insert SOPH.IA Web Screenshots into Figma
(async () => {
  const screenshots = [
${screenshotsWithBase64.map(s => `    { name: "${s.name}", base64: "${s.base64.substring(0, 100)}..." }`).join(',\n')}
  ];

  // Create or get "Web Screens" page
  let screenPage = figma.root.children.find(p => p.name === "Web Screens");
  if (!screenPage) {
    screenPage = figma.createPage();
    screenPage.name = "Web Screens";
  }
  await figma.setCurrentPageAsync(screenPage);

  let x = 0;
  let created = 0;

  // Insert each screenshot as a frame with image fill
  for (const [index, screenshot] of screenshots.entries()) {
    try {
      const frame = figma.createFrame();
      frame.name = screenshot.name;
      frame.resize(1440, 900);
      frame.x = x;
      frame.y = 0;
      frame.fills = [];  // Clear default fill

      // Note: Base64 images need to be uploaded via API first
      // For now, create placeholder frames that you can fill manually
      frame.setSharedPluginData("web-screens", "url", \`http://localhost:3000/...\`);

      screenPage.appendChild(frame);
      created++;
      console.log(\`✅ Created frame: \${screenshot.name}\`);

      x += 1440 + 100;
    } catch (err) {
      console.log(\`❌ Error creating \${screenshot.name}: \${err.message}\`);
    }
  }

  return {
    success: true,
    message: \`✅ Created \${created} frames in "Web Screens" page\`,
    framesCreated: created
  };
})()
`;

console.log('\n' + '='.repeat(80));
console.log('🔧 FIGMA PLUGIN SCRIPT - COPY & PASTE THIS:');
console.log('='.repeat(80) + '\n');
console.log(figmaScript);
console.log('\n' + '='.repeat(80));
console.log('📌 INSTRUCTIONS:');
console.log('='.repeat(80));
console.log('1. Open Figma: https://figma.com/design/yfxASgccpiepeijz9AjGQf');
console.log('2. Menu ⋮ → Plugins → Development → Show console');
console.log('3. Copy the script above');
console.log('4. Paste into the console and press Enter');
console.log('5. You\'ll see a new "Web Screens" page with 9 frames\n');
