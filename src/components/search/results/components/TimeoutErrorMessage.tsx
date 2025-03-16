
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
  const isTimeoutError = error && 
    (error.message.includes('timeout') || 
     error.message.includes('57014') || 
     error.message.includes('canceling statement') ||
     error.message.includes('cancel') ||
     error.message.includes('Timeout'));

  const locationTerm = displayTerm || searchTerm || postcode || 'this location';
  
  // Detect if this is likely a city or large area search
  const isLikelyLargeArea = searchTerm && 
    !searchTerm.match(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i) && // Not a postcode
    searchTerm.length < 15 && // Short search terms are more likely to be city names
    !searchTerm.match(/\d{1,4}[\s,]+/); // Likely doesn't contain a street number
  
  // Check if it's likely a specific large city search
  const commonLargeCities = ['london', 'manchester', 'birmingham', 'glasgow', 'liverpool', 'leeds', 'bristol', 'edinburgh', 'sheffield', 'cardiff', 'belfast', 'cheltenham', 'gloucester'];
  const searchTermLower = searchTerm?.toLowerCase() || '';
  const containsLargeCity = commonLargeCities.some(city => searchTermLower.includes(city));
  
  const isKnownLargeCity = isLikelyLargeArea && containsLargeCity;
  
  return (
    <ErrorMessage 
      title={isTimeoutError ? "Search Timeout" : (error ? "Error loading results" : "No results found")}
      message={
        isTimeoutError ? 
          isKnownLargeCity ?
            `"${locationTerm}" is a large area with many planning applications. We suggest searching for a more specific location like a street name or postcode within ${locationTerm} for faster results.` :
            isLikelyLargeArea ?
              `The search for "${locationTerm}" is taking longer than expected because it covers a large area. Try searching for a more specific location like a street name or postcode within ${locationTerm}.` :
              `The search for "${locationTerm}" is taking longer than expected. We've loaded some results, but there may be more. You can try a more specific location or different filters.` :
          (error ? error.message : `We couldn't find any planning applications for ${locationTerm}. Please try another search.`)
      }
      onRetry={onRetry}
    />
  );
};
