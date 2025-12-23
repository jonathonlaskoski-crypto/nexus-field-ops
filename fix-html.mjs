#!/usr/bin/env node
/**
 * Gemini fixes the index.html for Vite
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, writeFileSync } from 'fs';

const API_KEY = 'AIzaSyCTXsEbMvstWwc_hr6QoP4jPDWSa3I6jis';

async function main() {
  console.log('🔧 Gemini fixing index.html for Vite...\n');

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const currentHtml = readFileSync('./index.html', 'utf-8');

  const prompt = `Fix this index.html for a Vite React app.

Current broken index.html:
\`\`\`html
${currentHtml}
\`\`\`

Problems:
1. Uses esm.sh import maps (not needed with Vite - Vite handles imports)
2. Duplicate script tags
3. Duplicate CSS links

Fix it for Vite:
- Remove the importmap (Vite bundles modules)
- Single script tag: <script type="module" src="/index.tsx"></script>
- Single CSS link
- Keep the Tailwind CDN and fonts

Return ONLY the fixed HTML, no explanation. Just the code.`;

  try {
    const result = await model.generateContent(prompt);
    let fixedHtml = result.response.text();

    // Clean up markdown code blocks if present
    fixedHtml = fixedHtml.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Fixed HTML:\n');
    console.log(fixedHtml);

    // Backup and write
    writeFileSync('./index.html.backup', currentHtml);
    writeFileSync('./index.html', fixedHtml);
    console.log('\n✅ index.html fixed! (backup saved as index.html.backup)');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
