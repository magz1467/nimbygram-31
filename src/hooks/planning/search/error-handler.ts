
import { useToast } from "@/hooks/use-toast";

/**
 * Simple error handler for search errors
 */
export function handleSearchError(err: any, toast: ReturnType<typeof useToast>["toast"]) {
  console.error('Search error:', err);
  
  // Show error toast
  toast({
    title: "Search Error",
    description: "There was a problem with your search. Please try again.",
    variant: "destructive",
  });
  
  // Return empty array to avoid breaking the UI
  return [];
}
