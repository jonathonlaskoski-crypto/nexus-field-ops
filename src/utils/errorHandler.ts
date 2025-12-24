/**
 * Centralized Error Handling Utility
 * Provides consistent error handling, logging, and user-friendly messages
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  STORAGE = 'STORAGE',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  timestamp: number;
  context?: Record<string, any>;
}

class ErrorHandler {
  private errorLog: AppError[] = [];
  private maxLogSize = 50;

  /**
   * Handle and categorize errors
   */
  handle(error: unknown, context?: Record<string, any>): AppError {
    const appError = this.categorizeError(error, context);
    this.logError(appError);
    return appError;
  }

  /**
   * Categorize error by type
   */
  private categorizeError(error: unknown, context?: Record<string, any>): AppError {
    const timestamp = Date.now();

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Network connection failed. Please check your internet connection.',
        originalError: error as Error,
        timestamp,
        context,
      };
    }

    // API errors
    if (error instanceof Error && error.message.includes('API')) {
      return {
        type: ErrorType.API,
        message: 'AI service is temporarily unavailable. Please try again.',
        originalError: error,
        timestamp,
        context,
      };
    }

    // Storage errors
    if (error instanceof Error && error.message.includes('storage')) {
      return {
        type: ErrorType.STORAGE,
        message: 'Unable to save data. Please check your browser settings.',
        originalError: error,
        timestamp,
        context,
      };
    }

    // Generic error
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        message: error.message || 'An unexpected error occurred.',
        originalError: error,
        timestamp,
        context,
      };
    }

    // Unknown error type
    return {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred.',
      timestamp,
      context,
    };
  }

  /**
   * Log error to internal log
   */
  private logError(error: AppError): void {
    this.errorLog.push(error);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console log in development
    console.error('[ErrorHandler]', {
      type: error.type,
      message: error.message,
      context: error.context,
      originalError: error.originalError,
    });
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return '🔌 Connection lost. Check your internet and try again.';
      case ErrorType.API:
        return '🤖 AI service unavailable. Retrying automatically...';
      case ErrorType.STORAGE:
        return '💾 Unable to save data. Check browser storage settings.';
      case ErrorType.VALIDATION:
        return '⚠️ Invalid input. Please check your data.';
      default:
        return '❌ Something went wrong. Please try again.';
    }
  }

  /**
   * Check if error is recoverable
   */
  isRecoverable(error: AppError): boolean {
    return error.type === ErrorType.NETWORK || error.type === ErrorType.API;
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(-count);
  }

  /**
   * Clear error log
   */
  clearLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  getStats(): Record<ErrorType, number> {
    const stats: Record<ErrorType, number> = {
      [ErrorType.NETWORK]: 0,
      [ErrorType.API]: 0,
      [ErrorType.STORAGE]: 0,
      [ErrorType.VALIDATION]: 0,
      [ErrorType.UNKNOWN]: 0,
    };

    this.errorLog.forEach(error => {
      stats[error.type]++;
    });

    return stats;
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export helper functions
export const handleError = (error: unknown, context?: Record<string, any>) => 
  errorHandler.handle(error, context);

export const getUserErrorMessage = (error: AppError) => 
  errorHandler.getUserMessage(error);

export const isRecoverableError = (error: AppError) => 
  errorHandler.isRecoverable(error);
