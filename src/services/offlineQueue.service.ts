/**
 * Offline Queue Service
 * Queues failed requests when offline and retries when connection is restored
 */

import { storageService } from '../utils/storage';

export interface QueuedRequest {
  id: string;
  type: 'ai_task';
  payload: {
    prompt: string;
    taskType: string;
    context?: any;
  };
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

class OfflineQueueService {
  private queue: QueuedRequest[] = [];
  private readonly STORAGE_KEY = 'offline_queue';
  private readonly MAX_QUEUE_SIZE = 50;
  private readonly MAX_RETRIES = 3;
  private isProcessing = false;
  private listeners: Set<(queue: QueuedRequest[]) => void> = new Set();

  constructor() {
    this.loadQueue();
  }

  /**
   * Add a request to the queue
   */
  enqueue(
    type: QueuedRequest['type'],
    payload: QueuedRequest['payload'],
    maxRetries: number = this.MAX_RETRIES
  ): string {
    const id = this.generateId();
    
    const request: QueuedRequest = {
      id,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
      status: 'pending',
    };

    this.queue.push(request);

    // Limit queue size
    if (this.queue.length > this.MAX_QUEUE_SIZE) {
      this.queue.shift();
    }

    this.saveQueue();
    this.notifyListeners();

    return id;
  }

  /**
   * Process the queue
   */
  async processQueue(
    processor: (request: QueuedRequest) => Promise<any>
  ): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const pendingRequests = this.queue.filter(
        req => req.status === 'pending' && req.retryCount < req.maxRetries
      );

      for (const request of pendingRequests) {
        try {
          request.status = 'processing';
          this.notifyListeners();

          await processor(request);

          request.status = 'completed';
          this.notifyListeners();
        } catch (error) {
          request.retryCount++;
          request.error = error instanceof Error ? error.message : 'Unknown error';

          if (request.retryCount >= request.maxRetries) {
            request.status = 'failed';
          } else {
            request.status = 'pending';
          }

          this.notifyListeners();
        }
      }

      // Remove completed requests
      this.queue = this.queue.filter(req => req.status !== 'completed');
      this.saveQueue();
      this.notifyListeners();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get all queued requests
   */
  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Get pending requests count
   */
  getPendingCount(): number {
    return this.queue.filter(req => req.status === 'pending').length;
  }

  /**
   * Get failed requests count
   */
  getFailedCount(): number {
    return this.queue.filter(req => req.status === 'failed').length;
  }

  /**
   * Get a specific request by ID
   */
  getRequest(id: string): QueuedRequest | undefined {
    return this.queue.find(req => req.id === id);
  }

  /**
   * Remove a request from the queue
   */
  remove(id: string): void {
    this.queue = this.queue.filter(req => req.id !== id);
    this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Clear all completed requests
   */
  clearCompleted(): void {
    this.queue = this.queue.filter(req => req.status !== 'completed');
    this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Clear all failed requests
   */
  clearFailed(): void {
    this.queue = this.queue.filter(req => req.status !== 'failed');
    this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Clear entire queue
   */
  clearAll(): void {
    this.queue = [];
    this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Retry a failed request
   */
  retry(id: string): void {
    const request = this.queue.find(req => req.id === id);
    if (request && request.status === 'failed') {
      request.status = 'pending';
      request.retryCount = 0;
      request.error = undefined;
      this.saveQueue();
      this.notifyListeners();
    }
  }

  /**
   * Retry all failed requests
   */
  retryAll(): void {
    this.queue.forEach(request => {
      if (request.status === 'failed') {
        request.status = 'pending';
        request.retryCount = 0;
        request.error = undefined;
      }
    });
    this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: (queue: QueuedRequest[]) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Check if queue is processing
   */
  isQueueProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number;
    pending: number;
    processing: number;
    failed: number;
    completed: number;
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter(req => req.status === 'pending').length,
      processing: this.queue.filter(req => req.status === 'processing').length,
      failed: this.queue.filter(req => req.status === 'failed').length,
      completed: this.queue.filter(req => req.status === 'completed').length,
    };
  }

  /**
   * Load queue from storage
   */
  private loadQueue(): void {
    const stored = storageService.get<QueuedRequest[]>(this.STORAGE_KEY);
    if (stored && Array.isArray(stored)) {
      // Reset processing status on load
      this.queue = stored.map(req => ({
        ...req,
        status: req.status === 'processing' ? 'pending' : req.status,
      }));
    }
  }

  /**
   * Save queue to storage
   */
  private saveQueue(): void {
    storageService.set(this.STORAGE_KEY, this.queue);
  }

  /**
   * Notify all listeners of queue changes
   */
  private notifyListeners(): void {
    const queueCopy = [...this.queue];
    this.listeners.forEach(listener => {
      try {
        listener(queueCopy);
      } catch (error) {
        console.error('Error in queue listener:', error);
      }
    });
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const offlineQueueService = new OfflineQueueService();
