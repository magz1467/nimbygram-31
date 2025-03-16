
import { useToast } from "@/hooks/use-toast";

// Define the Toast type to match what's expected
type Toast = ReturnType<typeof useToast>["toast"];

export const handleCoordinateError = (error: any, searchTerm: string, toast: Toast) => {
  console.error('Coordinate error:', error);
  
  // Determine more specific error type
  const errorMessage = error?.message || 'Unknown error';
  
  if (errorMessage.includes('Invalid postcode') && !errorMessage.includes('Invalid outcode')) {
    console.log('Invalid postcode error detected, showing toast');
    toast({
      title: "Location not found",
      description: `We couldn't find "${searchTerm}". Please try a different location or postcode.`,
      variant: "destructive",
    });
  } else if (errorMessage.includes('No valid coordinates')) {
    console.log('No coordinates error detected, showing toast');
    toast({
      title: "Location not found",
      description: `We couldn't find coordinates for "${searchTerm}". Please try a different search term.`,
      variant: "destructive",
    });
  } else if (errorMessage.includes('ZERO_RESULTS')) {
    console.log('Zero results error detected, showing toast');
    toast({
      title: "No results found",
      description: `We couldn't find "${searchTerm}". Please try a different location name.`,
      variant: "destructive",
    });
  } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
    console.log('Timeout error detected, showing toast');
    
    // Check if this might be a large city/area search
    const isLikelyCity = !searchTerm.match(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i) && // Not a postcode
                        searchTerm.length < 30 && // Not a super long address
                        !searchTerm.match(/\d{1,4}[\s,]+/); // Likely doesn't contain a street number
    
    if (isLikelyCity) {
      toast({
        title: "Search taking longer than expected",
        description: `We're having trouble searching for "${searchTerm}". Try using a more specific location or postcode for faster results.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Connection error",
        description: "The request timed out. Please try again or use a more specific search term.",
        variant: "destructive",
      });
    }
  } else if (errorMessage.includes('network')) {
    console.log('Network error detected, showing toast');
    toast({
      title: "Connection error",
      description: "Please check your internet connection and try again.",
      variant: "destructive",
    });
  } else {
    console.log('General error detected, showing toast');
    toast({
      title: "Search error",
      description: "An error occurred while searching. Please try again.",
      variant: "destructive",
    });
  }
};
