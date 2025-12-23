#!/usr/bin/env node
/**
 * Gemini with grounding/search to diagnose and find workarounds
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFileSync } from 'fs';

const API_KEY = 'AIzaSyCTXsEbMvstWwc_hr6QoP4jPDWSa3I6jis';

async function main() {
  console.log('🔍 Gemini diagnosing localhost issue + APK options...\n');

  const genAI = new GoogleGenerativeAI(API_KEY);

  // Use gemini-2.0-flash with Google Search grounding
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    tools: [{ googleSearch: {} }]
  });

  const prompt = `I have a Vite React app that says "can't reach this page" on localhost:3000 in Windows browser.

The Vite server starts fine and says it's ready. But browser can't load it.

Use web search to find:
1. Common causes of "can't reach localhost" on Windows with Vite
2. Quick fixes (firewall, hosts file, binding issues)
3. Alternative: How to use PWABuilder or Capacitor to convert this PWA to an APK for Android instead of dealing with localhost issues

Give me:
- Top 3 quick fixes to try
- Step-by-step to build an APK from a Vite PWA using the easiest method (PWABuilder preferred)

Be specific and actionable.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log('=== GEMINI DIAGNOSIS ===\n');
    console.log(response);
    console.log('\n=== END ===');

    writeFileSync('./DIAGNOSIS_AND_APK.md', response);
    console.log('\n✅ Saved to DIAGNOSIS_AND_APK.md');

  } catch (error) {
    console.error('Error:', error.message);

    // Fallback without search
    console.log('\nTrying without search tool...');
    const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const fallbackResult = await fallbackModel.generateContent(prompt);
    console.log(fallbackResult.response.text());
  }
}

main().catch(console.error);
