
import { useToast } from "@/hooks/use-toast";

type Toast = ReturnType<typeof useToast>["toast"];

export const handleCoordinateError = (error: any, searchTerm: string, toast: Toast) => {
  console.error('Coordinate error:', error);
  console.error('Error details:', error);
  
  // Check hostname for API key debugging
  console.log('Current hostname when error occurred:', window.location.hostname);
  
  const errorMessage = error?.message || 'Unknown error';
  const errorType = (error as any)?.type || 'UNKNOWN';
  
  // Handle large area timeouts
  if (errorType === 'LARGE_AREA_TIMEOUT' || 
      (errorMessage.includes('timeout') && errorMessage.includes('large city'))) {
    console.log('Large area timeout error detected for:', searchTerm);
    toast({
      title: "Large Area Search",
      description: `"${searchTerm}" is a large city. For better results, try searching for a specific area within ${searchTerm} or using a postcode.`,
      variant: "default",
    });
    return;
  }
  
  // Handle other timeouts
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out') || 
      errorMessage.includes('TIMEOUT') || errorType === 'LOCATION_TIMEOUT') {
    console.log('Timeout error detected for area search:', searchTerm);
    toast({
      title: "Search Timeout",
      description: `The search for "${searchTerm}" took too long. Try using a more specific location or postcode for better results.`,
      variant: "default",
    });
    return;
  }
  
  // Handle API key issues
  if (errorType === 'API_KEY_ERROR' || 
      errorMessage.includes('API key') || 
      errorMessage.includes('denied') || 
      errorMessage.includes('not authorized')) {
    console.log('API key error detected on domain:', window.location.hostname);
    toast({
      title: "Location Search Issue",
      description: "We're having trouble searching by location name. Please try using a UK postcode instead.",
      variant: "destructive",
    });
    return;
  }
  
  if (errorMessage.includes('Invalid outcode')) {
    console.log('Outcode error detected, showing toast');
    toast({
      title: "Location format issue",
      description: `"${searchTerm}" appears to be a partial postcode. Please try using a full postcode or a specific location name.`,
      variant: "destructive",
    });
    return;
  }
  
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
      description: "An error occurred while searching. Please try again or use a UK postcode instead.",
      variant: "destructive",
    });
  }
};
