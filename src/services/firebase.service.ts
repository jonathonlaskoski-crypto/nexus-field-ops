// Firebase Service - Handles all Firebase interactions
// Created by NVIDIA AI Squad (Mistral Large 3 + Qwen 2.5 Coder)

import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent as firebaseLogEvent, Analytics } from 'firebase/analytics';
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore';
import { getPerformance, FirebasePerformance } from 'firebase/performance';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

let analytics: Analytics | null = null;
let db: Firestore | null = null;
let perf: FirebasePerformance | null = null;
let app: any = null;

// Only initialize Firebase if config is provided
const isConfigured = Object.values(firebaseConfig).some(val => val !== '');

if (isConfigured) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    perf = getPerformance(app);

    // Enable offline persistence for Firestore
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore: Multiple tabs open, persistence enabled in one tab only');
        } else if (err.code === 'unimplemented') {
          console.warn('Firestore: Browser does not support persistence');
        }
      });

    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

// Safe log event wrapper
export const logEvent = (eventName: string, params?: Record<string, any>) => {
  if (analytics) {
    try {
      firebaseLogEvent(analytics, eventName, params);
    } catch (error) {
      console.warn('Analytics event failed:', eventName, error);
    }
  }
};

export { analytics, db, perf };
export default app;
export const isFirebaseConfigured = isConfigured;
