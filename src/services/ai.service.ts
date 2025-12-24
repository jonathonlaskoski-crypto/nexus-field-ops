// AI Service - Handles all Gemini API interactions

import { GoogleGenAI } from '@google/genai';
import { AITaskType, AIResponse, GeolocationCoords } from '../types';
import { cacheService } from './cache.service';
import { offlineQueueService } from './offlineQueue.service';
import { handleError, isRecoverableError } from '../utils/errorHandler';

class AIService {
  private client: GoogleGenAI | null = null;
  private apiKey: string;
  private requestTimeout = 30000; // 30 seconds
  private rateLimitDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;

  constructor() {
    // Get API key from environment or use empty string
    this.apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  private async getGeolocation(): Promise<GeolocationCoords | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          resolve(null);
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  }

  /**
   * Execute AI task with caching, error handling, and offline queue support
   */
  async executeTask(
    prompt: string,
    type: AITaskType,
    retries: number = 3,
    useCache: boolean = true
  ): Promise<AIResponse> {
    // Check if API is configured
    if (!this.client) {
      const error = handleError(new Error('AI service unavailable. Please check your API key configuration.'));
      return {
        text: error.message,
        error: 'NO_API_KEY',
      };
    }

    // Check cache first
    if (useCache) {
      const cacheKey = cacheService.generateKey('ai_response', prompt, type);
      const cached = cacheService.get<AIResponse>(cacheKey);
      if (cached) {
        console.log('Returning cached AI response');
        return {
          ...cached,
          metadata: {
            ...cached.metadata,
            cached: true,
          },
        };
      }
    }

    // Rate limiting
    await this.enforceRateLimit();

    let lastError: any = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.makeRequest(prompt, type, attempt);
        
        // Cache successful response
        if (useCache && !response.error) {
          const cacheKey = cacheService.generateKey('ai_response', prompt, type);
          cacheService.set(cacheKey, response, 10 * 60 * 1000); // Cache for 10 minutes
        }

        return response;
      } catch (error: any) {
        lastError = error;
        const appError = handleError(error, { prompt, type, attempt });
        
        console.error(`AI request failed (attempt ${attempt + 1}/${retries + 1}):`, appError);
        
        // If it's a network error and we're offline, queue the request
        if (isRecoverableError(appError) && !navigator.onLine) {
          const queueId = offlineQueueService.enqueue('ai_task', {
            prompt,
            taskType: type,
          });
          
          return {
            text: '🔌 You are offline. This request has been queued and will be processed when connection is restored.',
            error: 'OFFLINE_QUEUED',
            metadata: {
              queueId,
              queued: true,
            },
          };
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.min(Math.pow(2, attempt) * 1000, 10000); // Max 10 seconds
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    const appError = handleError(lastError, { prompt, type });
    return {
      text: `AI request failed after ${retries + 1} attempts. ${appError.message}`,
      error: lastError?.message || 'UNKNOWN_ERROR',
    };
  }

  /**
   * Make the actual API request with timeout
   */
  private async makeRequest(
    prompt: string,
    type: AITaskType,
    attempt: number
  ): Promise<AIResponse> {
    const config: any = { temperature: 0.1 };

    // Configure based on task type
    if (type === 'map') {
      config.tools = [{ googleMaps: {} }];
      const coords = await this.getGeolocation();
      if (coords) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
          },
        };
      }
    } else if (type === 'diagnostic') {
      config.thinkingConfig = { thinkingBudget: 8000 };
    }

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), this.requestTimeout);
    });

    // Race between API call and timeout
    const response = await Promise.race([
      this.client!.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: config,
      }),
      timeoutPromise,
    ]);

    const text = response.text || 'No response generated.';
    
    return {
      text,
      metadata: {
        model: 'gemini-2.0-flash-exp',
        type,
        attempt: attempt + 1,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Enforce rate limiting between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Process queued requests when back online
   */
  async processOfflineQueue(): Promise<void> {
    if (!navigator.onLine || !this.client) {
      return;
    }

    await offlineQueueService.processQueue(async (request) => {
      const { prompt, taskType } = request.payload;
      const response = await this.executeTask(prompt, taskType as AITaskType, 1, false);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response;
    });
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.client;
  }
}

export const aiService = new AIService();
