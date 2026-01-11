/**
 * Retry Utility with Exponential Backoff
 * Implements retry logic with configurable exponential backoff for network requests
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryable?: (error: Error) => boolean;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'retryable'>> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, 'retryable'>>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  return Math.min(delay, options.maxDelay);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: Error, retryable?: (error: Error) => boolean): boolean {
  if (retryable) {
    return retryable(error);
  }

  const message = error.message.toLowerCase();
  
  // Network errors are retryable
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return true;
  }

  // 5xx server errors are retryable
  if ('status' in error && typeof (error as any).status === 'number') {
    const status = (error as any).status;
    if (status >= 500 && status < 600) {
      return true;
    }
  }

  // Rate limiting (429) is retryable
  if ('status' in error && (error as any).status === 429) {
    return true;
  }

  // Connection errors are retryable
  if (message.includes('connection') || message.includes('econnreset')) {
    return true;
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const mergedOptions: Required<Omit<RetryOptions, 'retryable'>> & { retryable?: (error: Error) => boolean } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  let lastError: Error;

  for (let attempt = 1; attempt <= mergedOptions.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if error is not retryable
      if (!isRetryableError(lastError, mergedOptions.retryable)) {
        throw lastError;
      }

      // Don't delay after last attempt
      if (attempt < mergedOptions.maxAttempts) {
        const delay = calculateDelay(attempt, mergedOptions);
        console.log(`Retry attempt ${attempt}/${mergedOptions.maxAttempts} after ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  throw lastError!;
}

/**
 * Retry with immediate first attempt (no delay)
 */
export async function retryImmediate<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const firstError = error instanceof Error ? error : new Error(String(error));
    
    // Only retry if error is retryable
    if (!isRetryableError(firstError, options.retryable)) {
      throw firstError;
    }

    // Continue with normal retry (skip first attempt since we already tried)
    const retryOptions = {
      ...options,
      maxAttempts: (options.maxAttempts || DEFAULT_OPTIONS.maxAttempts) - 1,
    };

    return retry(fn, retryOptions);
  }
}
