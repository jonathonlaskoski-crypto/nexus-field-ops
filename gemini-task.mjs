#!/usr/bin/env node
/**
 * Gemini Task Runner - Let Gemini debug and fix the app
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, writeFileSync } from 'fs';

const API_KEY = 'AIzaSyCTXsEbMvstWwc_hr6QoP4jPDWSa3I6jis';

async function main() {
  console.log('🚀 Calling Gemini 2.0 Flash to debug nexus-field-ops...\n');

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Read current code
  const indexCode = readFileSync('./index.tsx', 'utf-8');
  const packageJson = readFileSync('./package.json', 'utf-8');
  const viteConfig = readFileSync('./vite.config.ts', 'utf-8');

  const prompt = `You are debugging a React app that won't display in the browser.

## Current Files:

### index.tsx (main app):
\`\`\`tsx
${indexCode.slice(0, 15000)}
\`\`\`

### package.json:
\`\`\`json
${packageJson}
\`\`\`

### vite.config.ts:
\`\`\`typescript
${viteConfig}
\`\`\`

## Problem:
The app starts (vite says ready on port 3000) but nothing displays in the browser.

## Your Task:
1. Identify why the app might not be rendering
2. Check for common issues: missing root element, import errors, CSS issues
3. Provide the EXACT fix needed
4. If you need to see more of the code, say what you need

Be specific. What's wrong and how to fix it?`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log('=== GEMINI RESPONSE ===\n');
    console.log(response);
    console.log('\n=== END GEMINI RESPONSE ===');

    // Save response
    writeFileSync('./gemini-debug-output.md', response);
    console.log('\n✅ Response saved to gemini-debug-output.md');

  } catch (error) {
    console.error('Error calling Gemini:', error.message);
  }
}

main();
