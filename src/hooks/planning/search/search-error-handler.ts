
import { handleSearchError } from './error-handler';
import { useToast } from "@/hooks/use-toast";

/**
 * Processes search errors and provides recovery options
 */
export function processSearchError(
  error: any, 
  toast: ReturnType<typeof useToast>["toast"],
  retryCallback: () => void
) {
  console.error('Search error occurred:', error);
  
  try {
    return handleSearchError(error, toast, retryCallback);
  } catch (handlingError) {
    console.error('Error while handling search error:', handlingError);
    throw error; // Re-throw the original error if we can't handle it
  }
}
