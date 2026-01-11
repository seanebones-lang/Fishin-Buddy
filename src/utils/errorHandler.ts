/**
 * Centralized Error Handling Utility
 * Provides consistent error handling across the application
 */

export enum ErrorCategory {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  API = 'API',
  DATABASE = 'DATABASE',
  ML = 'ML',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  message: string;
  category: ErrorCategory;
  originalError?: Error;
  code?: string;
  userMessage: string; // User-friendly message
  recoverable: boolean; // Can the user recover from this?
  retryable: boolean; // Should we retry this automatically?
}

/**
 * Convert an error to a user-friendly AppError
 */
export function normalizeError(error: unknown, category: ErrorCategory = ErrorCategory.UNKNOWN): AppError {
  // Already normalized
  if (error && typeof error === 'object' && 'category' in error) {
    return error as AppError;
  }

  // Error instance
  if (error instanceof Error) {
    return {
      message: error.message,
      category: determineCategory(error, category),
      originalError: error,
      code: 'code' in error ? String(error.code) : undefined,
      userMessage: getUserFriendlyMessage(error, category),
      recoverable: isRecoverable(error, category),
      retryable: isRetryable(error, category),
    };
  }

  // String error
  if (typeof error === 'string') {
    return {
      message: error,
      category,
      userMessage: error,
      recoverable: true,
      retryable: false,
    };
  }

  // Unknown error
  return {
    message: 'An unknown error occurred',
    category: ErrorCategory.UNKNOWN,
    userMessage: 'Something went wrong. Please try again.',
    recoverable: true,
    retryable: false,
  };
}

/**
 * Determine error category from error message or type
 */
function determineCategory(error: Error, defaultCategory: ErrorCategory): ErrorCategory {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return ErrorCategory.NETWORK;
  }
  
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
    return ErrorCategory.AUTH;
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorCategory.VALIDATION;
  }
  
  if (message.includes('database') || message.includes('sql')) {
    return ErrorCategory.DATABASE;
  }
  
  if (message.includes('api') || message.includes('server error')) {
    return ErrorCategory.API;
  }
  
  if (message.includes('model') || message.includes('prediction') || message.includes('ml')) {
    return ErrorCategory.ML;
  }
  
  return defaultCategory;
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(error: Error, category: ErrorCategory): string {
  const message = error.message.toLowerCase();

  switch (category) {
    case ErrorCategory.NETWORK:
      if (message.includes('timeout')) {
        return 'The request took too long. Please check your connection and try again.';
      }
      if (message.includes('offline') || message.includes('network')) {
        return 'No internet connection. Please check your network settings.';
      }
      return 'Network error. Please try again.';

    case ErrorCategory.AUTH:
      if (message.includes('invalid') || message.includes('wrong')) {
        return 'Invalid email or password. Please try again.';
      }
      if (message.includes('expired')) {
        return 'Your session has expired. Please sign in again.';
      }
      return 'Authentication error. Please sign in again.';

    case ErrorCategory.VALIDATION:
      return 'Please check your input and try again.';

    case ErrorCategory.DATABASE:
      return 'Database error. Our team has been notified.';

    case ErrorCategory.API:
      return 'Service temporarily unavailable. Please try again later.';

    case ErrorCategory.ML:
      return 'Prediction error. Please try refreshing.';

    default:
      return 'Something went wrong. Please try again.';
  }
}

/**
 * Determine if error is recoverable
 */
function isRecoverable(error: Error, category: ErrorCategory): boolean {
  switch (category) {
    case ErrorCategory.NETWORK:
    case ErrorCategory.AUTH:
    case ErrorCategory.VALIDATION:
      return true;
    case ErrorCategory.DATABASE:
    case ErrorCategory.API:
    case ErrorCategory.ML:
      return false;
    default:
      return true;
  }
}

/**
 * Determine if error should be retried
 */
function isRetryable(error: Error, category: ErrorCategory): boolean {
  switch (category) {
    case ErrorCategory.NETWORK:
    case ErrorCategory.API:
      return true;
    case ErrorCategory.AUTH:
    case ErrorCategory.VALIDATION:
    case ErrorCategory.DATABASE:
    case ErrorCategory.ML:
      return false;
    default:
      return false;
  }
}

/**
 * Log error to error tracking service
 */
export async function logError(error: AppError, context?: Record<string, unknown>): Promise<void> {
  // TODO: Integrate with Sentry or other error tracking service
  console.error('Error logged:', {
    message: error.message,
    category: error.category,
    code: error.code,
    context,
    stack: error.originalError?.stack,
  });

  // In production, send to error tracking service
  if (process.env.EXPO_PUBLIC_ENV === 'production') {
    // await Sentry.captureException(error.originalError || new Error(error.message), {
    //   tags: { category: error.category },
    //   extra: context,
    // });
  }
}
