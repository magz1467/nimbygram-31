
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errors/centralized-handler';
import { ErrorType, createAppError } from './errors/types';

interface FunctionCallOptions {
  functionName: string;
  payload?: any;
  headers?: Record<string, string>;
  options?: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  };
}

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 30000;

/**
 * Calls a Supabase Edge Function with timeout and retry support
 */
export async function callEdgeFunction<T = any>({
  functionName,
  payload = {},
  headers = {},
  options = {}
}: FunctionCallOptions): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = 0,
    retryDelay = 1000
  } = options;

  // Create an AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Attempt to call the function
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle errors
    if (error) {
      throw createAppError(`Edge function error (${functionName}): ${error.message}`, {
        type: ErrorType.SERVER,
        details: JSON.stringify(error),
        code: error.code || 'EDGE_FUNCTION_ERROR'
      });
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle aborted requests (timeout)
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      throw createAppError(`Function call timed out (${functionName})`, {
        type: ErrorType.TIMEOUT,
        details: `The function call exceeded the ${timeout}ms timeout limit.`,
        code: 'EDGE_FUNCTION_TIMEOUT'
      });
    }

    // Check if we should retry
    if (retries > 0) {
      console.warn(`Retrying edge function '${functionName}', ${retries} attempts left`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Retry with one less retry attempt
      return callEdgeFunction({
        functionName,
        payload,
        headers,
        options: {
          timeout,
          retries: retries - 1,
          retryDelay: retryDelay * 1.5 // Exponential backoff
        }
      });
    }

    // Log and rethrow the error if we're out of retries
    handleError(error, {
      context: { 
        functionName, 
        payload 
      }
    });
    
    throw error;
  }
}
