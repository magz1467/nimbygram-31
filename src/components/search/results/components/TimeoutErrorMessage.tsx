
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
     error.message.includes('cancel'));

  const locationTerm = displayTerm || searchTerm || postcode || 'this location';
  
  // Detect if this is likely a city or large area search
  const isLikelyLargeArea = searchTerm && 
    !searchTerm.match(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i) && // Not a postcode
    searchTerm.length < 15; // Short search terms are more likely to be city names
  
  return (
    <ErrorMessage 
      title={isTimeoutError ? "Search Timeout" : (error ? "Error loading results" : "No results found")}
      message={
        isTimeoutError ? 
          isLikelyLargeArea ?
            `The search for "${locationTerm}" is taking longer than expected because it covers a large area. Try searching for a more specific location like a street name or postcode within ${locationTerm}.` :
            `The search for "${locationTerm}" is taking longer than expected. We've loaded some results, but there may be more. You can try a more specific location or different filters.` :
          (error ? error.message : `We couldn't find any planning applications for ${locationTerm}. Please try another search.`)
      }
      onRetry={onRetry}
    />
  );
};
