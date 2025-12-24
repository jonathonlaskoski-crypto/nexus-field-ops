// Custom hook for AI interactions

import { useState, useCallback, useEffect } from 'react';
import { Message, AITaskType } from '../types';
import { aiService } from '../services/ai.service';
import { offlineQueueService, QueuedRequest } from '../services/offlineQueue.service';
import { useDebouncedCallback } from './useDebounce';

export function useAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [queuedRequests, setQueuedRequests] = useState<QueuedRequest[]>([]);

  // Subscribe to offline queue changes
  useEffect(() => {
    const unsubscribe = offlineQueueService.subscribe((queue) => {
      setQueuedRequests(queue);
    });

    // Initial load
    setQueuedRequests(offlineQueueService.getQueue());

    return unsubscribe;
  }, []);

  // Process offline queue when coming back online
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Connection restored, processing offline queue...');
      await aiService.processOfflineQueue();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const executeTask = useCallback(
    async (prompt: string, type: AITaskType) => {
      setIsLoading(true);

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: prompt,
          type: 'text',
          timestamp: Date.now(),
        },
      ]);

      try {
        const response = await aiService.executeTask(prompt, type);

        // Add AI response
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: response.text,
            type: response.error === 'OFFLINE_QUEUED' ? 'system' : 'text',
            timestamp: Date.now(),
          },
        ]);

        // Track failures for escalation (but not offline queued requests)
        if (response.error && response.error !== 'OFFLINE_QUEUED') {
          setFailCount((prev) => prev + 1);
        } else if (
          response.text.toLowerCase().includes('unable') ||
          response.text.toLowerCase().includes('contact supervisor')
        ) {
          setFailCount((prev) => prev + 1);
        }
      } catch (error: any) {
        console.error('AI task error:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: `Error: ${error.message || 'Failed to process request'}`,
            type: 'system',
            timestamp: Date.now(),
          },
        ]);
        setFailCount((prev) => prev + 1);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced version for input fields (500ms delay)
  const debouncedExecuteTask = useDebouncedCallback(executeTask, 500);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const resetFailCount = useCallback(() => {
    setFailCount(0);
  }, []);

  const retryQueuedRequest = useCallback((requestId: string) => {
    offlineQueueService.retry(requestId);
  }, []);

  const clearQueue = useCallback(() => {
    offlineQueueService.clearAll();
  }, []);

  const getPendingQueueCount = useCallback(() => {
    return offlineQueueService.getPendingCount();
  }, []);

  return {
    messages,
    isLoading,
    failCount,
    queuedRequests,
    executeTask,
    debouncedExecuteTask,
    clearMessages,
    resetFailCount,
    retryQueuedRequest,
    clearQueue,
    getPendingQueueCount,
  };
}
