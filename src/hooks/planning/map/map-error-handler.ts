
import { useToast } from "@/hooks/use-toast";

/**
 * Handles map-related errors with appropriate user feedback
 * @param err The error object
 * @param toast Toast function for showing notifications
 */
export function handleMapError(err: any, toast: ReturnType<typeof useToast>["toast"]) {
  console.error('Error loading map applications:', err);
  
  // Determine what kind of error message to show
  const errorMessage = err.message || String(err);
  const isNetworkError = errorMessage.includes('network') || 
                        errorMessage.includes('fetch') || 
                        errorMessage.includes('connection');
  
  const userMessage = isNetworkError 
    ? "Unable to connect to the server. Please check your internet connection."
    : "There was a problem loading applications on the map. Please try again.";
  
  toast({
    title: "Map Error",
    description: userMessage,
    variant: "destructive"
  });
}
