
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useSearchErrorHandler = () => {
  const { toast } = useToast();
  
  const handleSearchError = useCallback((err: any, hasPartialResults: boolean) => {
    console.error('Search error:', err);
    
    // Don't show errors for missing function
    if (err?.message?.includes('get_nearby_applications') || 
        err?.message?.includes('Could not find the function')) {
      console.log('Not showing error for missing RPC function');
      return;
    }
    
    // Don't show toast for timeouts if we have partial results
    if (hasPartialResults) {
      console.log('Not showing error toast because we have partial results');
      return;
    }
    
    // Don't show timeout errors as toast messages unless we have no results
    if (err?.message?.includes('timeout') || 
        err?.message?.includes('canceling statement') ||
        err?.message?.includes('57014')) {
      console.log('Not showing toast for timeout error');
      return;
    }
    
    // Show a toast notification for the error
    toast({
      title: "Search in Progress",
      description: "Your search is taking longer than expected. We'll show results as they become available.",
      variant: "default",
    });
  }, [toast]);

  return { handleSearchError };
};
