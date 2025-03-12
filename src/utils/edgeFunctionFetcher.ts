
import { supabase } from "@/integrations/supabase/client";
import { createAppError } from "./errors/types";
import { ErrorType } from "./errors";
import { handleError } from "./errors/centralized-handler";

/**
 * Generic function to invoke Edge Functions with error handling and timeouts
 */
export async function invokeFunctionWithTimeout<T = any>(
  functionName: string,
  payload?: any,
  options: {
    timeout?: number;
    retry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    silentError?: boolean;
  } = {}
): Promise<T> {
  const {
    timeout = 30000,
    retry = false,
    maxRetries = 2,
    retryDelay = 1000,
    silentError = false,
  } = options;

  // Create an AbortController for timeout management
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let retries = 0;
  
  try {
    // Basic validation
    if (!functionName) {
      throw createAppError('Function name is required', { type: ErrorType.VALIDATION });
    }

    async function attemptFetch(): Promise<T> {
      try {
        console.log(`Invoking edge function: ${functionName}`, { payload });
        
        // This line is fixed: we removed the signal property which doesn't exist in FunctionInvokeOptions
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: payload,
        });

        if (error) {
          console.error(`Edge function error (${functionName}):`, error);
          
          if (retry && retries < maxRetries) {
            retries++;
            console.log(`Retrying (${retries}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return attemptFetch();
          }
          
          throw createAppError(
            error.message || `Failed to execute ${functionName}`,
            { type: ErrorType.SERVER, cause: error }
          );
        }

        return data as T;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw createAppError(
            `Function ${functionName} timed out after ${timeout}ms`,
            { type: ErrorType.TIMEOUT }
          );
        }
        
        if (retry && retries < maxRetries && error.type !== ErrorType.VALIDATION) {
          retries++;
          console.log(`Retrying (${retries}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attemptFetch();
        }
        
        throw error;
      }
    }

    const result = await attemptFetch();
    return result;
  } catch (error) {
    handleError(error, { 
      context: `edgeFunction:${functionName}`,
      silent: silentError
    });
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Function to fetch data from a Supabase Edge Function
 */
export async function fetchFromEdgeFunction<T = any>(
  functionName: string,
  payload?: any,
  options?: {
    timeout?: number;
    retry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    silentError?: boolean;
  }
): Promise<T> {
  return invokeFunctionWithTimeout<T>(functionName, payload, options);
}
