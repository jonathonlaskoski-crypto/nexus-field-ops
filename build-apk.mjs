#!/usr/bin/env node
/**
 * Set up Capacitor and build APK
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

console.log('📱 Setting up Capacitor for APK build...\n');

// Step 1: Install Capacitor
console.log('1️⃣ Installing Capacitor...');
try {
  execSync('npm install @capacitor/core @capacitor/cli @capacitor/android --save', { stdio: 'inherit' });
} catch (e) {
  console.log('Capacitor install issue, continuing...');
}

// Step 2: Initialize Capacitor
console.log('\n2️⃣ Initializing Capacitor...');
const capacitorConfig = {
  appId: 'com.nexusops.fieldtech',
  appName: 'Nexus Field Ops',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};
writeFileSync('./capacitor.config.json', JSON.stringify(capacitorConfig, null, 2));
console.log('✅ capacitor.config.json created');

// Step 3: Build the web app
console.log('\n3️⃣ Building web app...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (e) {
  console.error('Build failed:', e.message);
  process.exit(1);
}

// Step 4: Add Android platform
console.log('\n4️⃣ Adding Android platform...');
try {
  execSync('npx cap add android', { stdio: 'inherit' });
} catch (e) {
  console.log('Android platform may already exist, syncing...');
}

// Step 5: Sync
console.log('\n5️⃣ Syncing with Capacitor...');
try {
  execSync('npx cap sync android', { stdio: 'inherit' });
} catch (e) {
  console.error('Sync issue:', e.message);
}

console.log('\n' + '='.repeat(50));
console.log('✅ CAPACITOR SETUP COMPLETE!\n');
console.log('Next steps to build APK:');
console.log('');
console.log('Option A - Android Studio (Full APK):');
console.log('  npx cap open android');
console.log('  Then Build > Build Bundle(s) / APK(s) > Build APK(s)');
console.log('');
console.log('Option B - Command line (requires Android SDK):');
console.log('  cd android && ./gradlew assembleDebug');
console.log('  APK will be in: android/app/build/outputs/apk/debug/');
console.log('');
console.log('Option C - PWABuilder (no SDK needed):');
console.log('  1. Deploy dist/ to Vercel/Netlify');
console.log('  2. Go to pwabuilder.com');
console.log('  3. Enter your URL, download APK');
