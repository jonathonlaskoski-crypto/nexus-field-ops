#!/usr/bin/env node
/**
 * Gemini polishes the app for production PWA rollout
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const API_KEY = 'AIzaSyCTXsEbMvstWwc_hr6QoP4jPDWSa3I6jis';

async function main() {
  console.log('✨ Gemini polishing nexus-field-ops for PWA rollout...\n');

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const indexHtml = readFileSync('./index.html', 'utf-8');
  const indexTsx = readFileSync('./index.tsx', 'utf-8');
  const packageJson = readFileSync('./package.json', 'utf-8');

  // Task 1: Create PWA manifest
  console.log('📱 Task 1: Creating PWA manifest...');

  const manifestPrompt = `Create a manifest.json for a PWA called "Nexus Field Ops" - a field service management app for technicians.

Requirements:
- Name: Nexus Field Ops
- Short name: NexusOps
- Theme color: #f59e0b (amber)
- Background: #0a0a0f (dark)
- Display: standalone
- Start URL: /
- Icons: placeholder paths for 192x192 and 512x512
- Categories: business, productivity

Return ONLY valid JSON, no explanation.`;

  const manifestResult = await model.generateContent(manifestPrompt);
  let manifest = manifestResult.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  writeFileSync('./manifest.json', manifest);
  console.log('✅ manifest.json created\n');

  // Task 2: Create service worker
  console.log('⚙️ Task 2: Creating service worker...');

  const swPrompt = `Create a basic service worker (sw.js) for a field service PWA that:
1. Caches the app shell on install
2. Uses cache-first strategy for static assets
3. Network-first for API calls
4. Handles offline gracefully
5. Cache name: 'nexus-ops-v1'

Return ONLY the JavaScript code, no explanation.`;

  const swResult = await model.generateContent(swPrompt);
  let sw = swResult.response.text().replace(/```javascript\n?/g, '').replace(/```js\n?/g, '').replace(/```\n?/g, '').trim();
  writeFileSync('./public/sw.js', sw);
  console.log('✅ sw.js created\n');

  // Task 3: Update index.html for PWA
  console.log('📄 Task 3: Updating index.html for PWA...');

  const htmlPrompt = `Update this index.html to be PWA-ready:

${indexHtml}

Add:
1. Link to manifest.json
2. Apple touch icon meta tags
3. Theme color meta tag (#f59e0b)
4. Service worker registration script (inline, at end of body)
5. iOS status bar style meta tags
6. Description meta tag for "Field service management for technicians"

Return ONLY the complete HTML, no explanation.`;

  const htmlResult = await model.generateContent(htmlPrompt);
  let newHtml = htmlResult.response.text().replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
  writeFileSync('./index.html', newHtml);
  console.log('✅ index.html updated for PWA\n');

  // Task 4: Polish improvements for index.tsx
  console.log('🎨 Task 4: Getting UI polish recommendations...');

  const polishPrompt = `Review this React field service app and suggest 5 quick polish improvements for production readiness.

Current code summary:
- Tech view: Job cards, step-by-step walkthrough, camera capture, AI routing
- Manager view: Dashboard with stats, job cards with progress
- Uses Tailwind, lucide-react icons
- Dark theme with amber accents

Focus on:
1. Loading states
2. Error boundaries
3. Empty states
4. Accessibility (a11y)
5. Mobile UX touches

Give specific, actionable suggestions with code snippets where helpful. Keep it brief.`;

  const polishResult = await model.generateContent(polishPrompt);
  const polishSuggestions = polishResult.response.text();
  writeFileSync('./POLISH_SUGGESTIONS.md', polishSuggestions);
  console.log('✅ POLISH_SUGGESTIONS.md created\n');

  // Task 5: Create deployment readme
  console.log('🚀 Task 5: Creating deployment guide...');

  const deployPrompt = `Create a brief DEPLOY.md for deploying this Vite React PWA to:
1. Vercel (recommended - one click)
2. Netlify
3. Firebase Hosting

Include:
- Build command: npm run build
- Output dir: dist
- Environment variable: VITE_GEMINI_API_KEY
- Any gotchas for PWA deployment

Keep it concise and actionable.`;

  const deployResult = await model.generateContent(deployPrompt);
  const deployGuide = deployResult.response.text();
  writeFileSync('./DEPLOY.md', deployGuide);
  console.log('✅ DEPLOY.md created\n');

  console.log('='.repeat(50));
  console.log('🎉 POLISH COMPLETE!\n');
  console.log('Files created/updated:');
  console.log('  - manifest.json (PWA manifest)');
  console.log('  - public/sw.js (Service worker)');
  console.log('  - index.html (PWA-ready)');
  console.log('  - POLISH_SUGGESTIONS.md (UI improvements)');
  console.log('  - DEPLOY.md (Deployment guide)');
  console.log('\nNext steps:');
  console.log('  1. Review POLISH_SUGGESTIONS.md');
  console.log('  2. npm run build');
  console.log('  3. Deploy per DEPLOY.md');
}

main().catch(console.error);
