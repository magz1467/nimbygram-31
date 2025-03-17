
import { ErrorMessage } from "./ErrorMessage";

interface TimeoutErrorMessageProps {
  error: Error | null;
  searchTerm?: string;
  displayTerm?: string;
  postcode?: string;
  onRetry?: () => void;
}

export const TimeoutErrorMessage = ({
  error,
  searchTerm,
  displayTerm,
  postcode,
  onRetry
}: TimeoutErrorMessageProps) => {
  // Enhanced error type detection
  const errorType = (error as any)?.type || '';
  const errorMessage = error?.message || '';
  
  const isTimeoutError = errorType === 'LOCATION_TIMEOUT' || 
                        errorType === 'LARGE_AREA_TIMEOUT' ||
                        errorMessage.includes('timeout') || 
                        errorMessage.includes('57014') || 
                        errorMessage.includes('canceling statement') ||
                        errorMessage.includes('cancel');
                       
  const isLargeAreaError = errorType === 'LARGE_AREA_TIMEOUT' || 
                          (errorMessage.includes('large') && 
                           errorMessage.includes('city'));
                          
  const isApiKeyError = errorType === 'API_KEY_ERROR' ||
                       errorMessage.includes('API key') ||
                       errorMessage.includes('denied') ||
                       errorMessage.includes('not authorized');
                       
  const isOutcodeError = errorMessage.includes('Invalid outcode');

  const locationTerm = displayTerm || searchTerm || postcode || 'this location';
  
  // Check if this is Liverpool specifically to give tailored suggestions
  const isLiverpool = /\bliverpool\b/i.test(locationTerm);

  let title = "Error loading results";
  let message = error ? errorMessage : `We couldn't find any planning applications for ${locationTerm}. Please try another search.`;
  
  // Customize message based on error type
  if (isLargeAreaError) {
    title = "Large Area Search";
    
    if (isLiverpool) {
      message = `For better results when searching Liverpool, try:
      • Using a specific postcode in Liverpool (e.g., "L1 9BG" for city center)
      • Searching for specific areas like "Liverpool City Centre" or "Liverpool Docks"
      • Try searching for a specific street name in Liverpool`;
    } else {
      message = `"${locationTerm}" is a large city with many planning applications. For better results, try:
      • Searching for a specific area within ${locationTerm} (e.g., "${locationTerm} city center")
      • Using a specific postcode
      • Searching for a specific street name`;
    }
  } else if (isTimeoutError) {
    title = "Search Timeout";
    message = `The search for "${locationTerm}" took too long. For better results, try:
    • Using a more specific location
    • Searching with a UK postcode
    • Trying again during off-peak hours`;
  } else if (isApiKeyError) {
    title = "Location Search Unavailable";
    message = `We're having trouble searching by location name. Please try using a UK postcode instead.`;
  } else if (isOutcodeError) {
    title = "Partial Postcode";
    message = `"${locationTerm}" appears to be a partial postcode. Please try using a full postcode (e.g., SW1A 1AA) or a more specific location name.`;
  }

  return (
    <ErrorMessage 
      title={title}
      message={message}
      onRetry={onRetry}
    />
  );
};
