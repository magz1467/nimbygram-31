
import { useToast } from "@/hooks/use-toast";
import { AppError, ErrorType, createAppError, handleError, isNonCriticalError } from "@/utils/errors";
import { supabase } from "@/integrations/supabase/client";

/**
 * Log detailed search error information to Supabase for analysis
 */
async function logSearchErrorToSupabase(
  error: any, 
  searchParams: any, 
  userAgent: string,
  errorType: string
) {
  try {
    const { data, error: logError } = await supabase.from('SearchErrors').insert({
      error_message: error?.message || 'Unknown error',
      error_type: errorType,
      error_stack: error?.stack || '',
      search_parameters: searchParams,
      browser_info: userAgent,
      timestamp: new Date().toISOString()
    });
    
    if (logError) {
      console.error('Failed to log search error to database:', logError);
    } else {
      console.log('Search error logged to database successfully');
    }
  } catch (e) {
    console.error('Exception while logging search error:', e);
  }
}

/**
 * Handles search errors by determining error type and displaying appropriate messages
 * With enhanced error handling for better user experience and detailed logging
 * 
 * @param err The error object
 * @param toast Toast function for showing notifications
 * @param searchParams Search parameters for context
 * @returns Empty array for non-critical errors or throws the error
 */
export function handleSearchError(
  err: any, 
  toast: ReturnType<typeof useToast>["toast"],
  searchParams?: any
) {
  console.group('🚨 Search Error Handler - DETAILED DIAGNOSTICS');
  console.log('Original error:', err);
  console.log('Error type:', err?.constructor?.name);
  console.log('Error message:', err?.message);
  
  // Log stack trace for debugging
  if (err?.stack) {
    console.log('Error stack:', err.stack);
  }
  
  // Log browser and performance information
  const performanceInfo = {
    memory: typeof window.performance !== 'undefined' && 
            'memory' in window.performance ? 
            {
              jsHeapSizeLimit: (window.performance as any).memory?.jsHeapSizeLimit,
              totalJSHeapSize: (window.performance as any).memory?.totalJSHeapSize,
              usedJSHeapSize: (window.performance as any).memory?.usedJSHeapSize
            } : 'Not available',
    connection: typeof navigator !== 'undefined' && 
                'connection' in navigator ? 
                {
                  effectiveType: (navigator as any).connection?.effectiveType,
                  downlink: (navigator as any).connection?.downlink,
                  rtt: (navigator as any).connection?.rtt,
                  saveData: (navigator as any).connection?.saveData
                } : 'Not available',
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory || 'Not available',
    onLine: navigator.onLine
  };
  
  console.log('Browser performance context:', performanceInfo);
  console.log('Search parameters:', searchParams);
  
  // Don't treat missing support table or functions as real errors
  if (isNonCriticalError(err)) {
    console.log('Classified as non-critical infrastructure error');
    console.groupEnd();
    return [];
  }
  
  // Create a base error object
  const appError = createAppError(err, 'search');
  console.log('Created AppError:', appError);
  
  // Detect common error patterns
  let errorType = ErrorType.UNKNOWN;
  
  // Check for timeout errors (most common issue)
  const isTimeoutError = 
    (err.code === '57014') || 
    (err.message && (
      err.message.toLowerCase().includes('timeout') ||
      err.message.toLowerCase().includes('timed out') ||
      err.message.toLowerCase().includes('too long') ||
      err.message.toLowerCase().includes('canceling statement')
    ));
  
  // Check for network-related errors
  const isNetworkError =
    err.message && (
      err.message.toLowerCase().includes('network') ||
      err.message.toLowerCase().includes('fetch') ||
      err.message.toLowerCase().includes('connect')
    ) || !navigator.onLine;
  
  // Check for location-specific errors
  const isLocationError =
    err.message && (
      err.message.toLowerCase().includes('location') ||
      err.message.toLowerCase().includes('coordinates') ||
      err.message.toLowerCase().includes('geocod')
    );
    
  // Check for database-specific errors
  const isDatabaseError =
    err.code && (
      err.code.startsWith('22') || // Data exception
      err.code.startsWith('23') || // Integrity constraint violation
      err.code.startsWith('42') || // Syntax error or access rule violation
      err.code.startsWith('53') || // Insufficient resources
      err.code.startsWith('54')    // Program limit exceeded
    );
  
  console.log({
    isTimeoutError,
    isNetworkError,
    isLocationError,
    isDatabaseError
  });
  
  // Set appropriate error type and user-friendly message
  if (isTimeoutError) {
    console.log('Handling as timeout error');
    errorType = ErrorType.TIMEOUT;
    appError.message = "The search took too long to complete. Please try a more specific location or different filters.";
  } else if (isNetworkError) {
    console.log('Handling as network error');
    errorType = ErrorType.NETWORK;
    appError.message = "We're having trouble connecting to our servers. Please check your internet connection and try again.";
  } else if (isLocationError) {
    console.log('Handling as location error');
    errorType = ErrorType.NOT_FOUND;
    appError.message = "We couldn't find that location. Please try a different postcode or place name.";
  } else if (isDatabaseError) {
    console.log('Handling as database error');
    errorType = ErrorType.DATABASE;
    appError.message = "There was an issue with our database while processing your search. Please try again later.";
  }
  
  // Set the error type
  appError.type = errorType;
  
  // Log to Supabase for analysis
  const detailedSearchParams = {
    ...searchParams,
    browser: navigator.userAgent,
    timestamp: new Date().toISOString(),
    performance: performanceInfo
  };
  
  logSearchErrorToSupabase(err, detailedSearchParams, navigator.userAgent, errorType);
  
  // Use centralized error handler to show toast
  handleError(appError, toast, {
    context: 'search'
  });
  
  // Return empty array for common errors instead of throwing
  // This prevents unnecessary retries and improves user experience
  if (isTimeoutError || isNetworkError || isLocationError || isDatabaseError) {
    console.log('Returning empty array for handled error instead of throwing');
    console.groupEnd();
    return [];
  }
  
  console.log('Re-throwing error for regular error handling');
  console.groupEnd();
  throw appError; // Re-throw other errors to let the error handling in the component deal with it
}
