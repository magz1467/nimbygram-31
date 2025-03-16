
import { Toast } from "@/hooks/use-toast";

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
  } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
    console.log('Network/timeout error detected, showing toast');
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
